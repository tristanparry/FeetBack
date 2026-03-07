import { lowerCase } from 'lodash-es';
import i18n from '../../i18n/index.ts';
import { LanguageCode } from '../../i18n/types.ts';
import { FOOT_KEYS, LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from './insoleUtils.ts';
import { normalizeForceSensors } from './sensorReadingUtils.ts';
import { getTemp, TempUnit } from './temperature.ts';

const MIN_TREND_DAYS = 3;
const RECENT_DAYS_TO_VALIDATE = 2;
const ARCH_SENSOR_INDICES = [2, 4, 5];
const HEEL_SENSOR_INDICES = [6, 7, 10];
const TOE_SENSOR_INDICES = [0, 1, 3];
const BALL_OF_FOOT_INDICES = [8, 9];
const LOW_ARCH_PRESSURE_THRESHOLD = 0.7;
const HIGH_ARCH_PRESSURE_THRESHOLD = 0.3;
const LOW_TEMP_THRESHOLD = 15;
const HIGH_TEMP_THRESHOLD = 25;
const ALIGNMENT_DIFFERENCE_THRESHOLD = 20;
const OVERALL_HIGH_PRESSURE_THRESHOLD = 0.65;
const OVERALL_LOW_PRESSURE_THRESHOLD = 0.25;
const HEEL_PRESSURE_THRESHOLD = 0.75;
const TOE_PRESSURE_THRESHOLD = 0.7;
const BALL_PRESSURE_THRESHOLD = 0.75;
const TEMP_ASYMMETRY_THRESHOLD = 5;
const WEIGHT_DISTRIBUTION_THRESHOLD = 0.2;

export enum SeverityLevel {
  Severe = 'severe',
  Mild = 'mild',
  Neutral = 'neutral',
}

export const SEVERITY_ORDER = {
  [SeverityLevel.Severe]: 0,
  [SeverityLevel.Mild]: 1,
  [SeverityLevel.Neutral]: 2,
} as const;

export type HealthInsight = {
  name: string;
  description: string;
  severity: SeverityLevel;
};

export type DailySensorReading = {
  date: string;
  avg_temperature: number | null;
  avg_alignment: number | null;
  temperature_series: number[];
  alignment_series: number[];
  force_sensors: number[] | Record<string, number>;
};

export type InsoleReadings = {
  insole_id: string;
  foot: (typeof FOOT_KEYS)[number];
  readings: DailySensorReading[];
};

const getSensorRegionPressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
  sensorIndices: number[],
): number | null => {
  const sensors = normalizeForceSensors(forceSensors);
  if (sensors.length === 0) return null;
  const values = sensorIndices
    .map((idx) => sensors[idx])
    .filter((val) => val !== undefined && val !== null && !isNaN(val));
  if (values.length === 0) return null;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const getArchPressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
): number | null => getSensorRegionPressure(forceSensors, ARCH_SENSOR_INDICES);

const getHeelPressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
): number | null => getSensorRegionPressure(forceSensors, HEEL_SENSOR_INDICES);

const getToePressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
): number | null => getSensorRegionPressure(forceSensors, TOE_SENSOR_INDICES);

const getBallOfFootPressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
): number | null => getSensorRegionPressure(forceSensors, BALL_OF_FOOT_INDICES);

const getOverallPressure = (
  forceSensors: number[] | Record<string, number> | null | undefined,
): number | null => {
  const sensors = normalizeForceSensors(forceSensors);
  if (sensors.length === 0) return null;
  const validValues = sensors.filter(
    (val) => val !== undefined && val !== null && !isNaN(val),
  );
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
};

const validateTrend = <T>(
  allData: T[],
  getValue: (item: T) => number | null,
  checkCondition: (value: number) => boolean,
  minDays: number = MIN_TREND_DAYS,
  recentDays: number = RECENT_DAYS_TO_VALIDATE,
): boolean => {
  if (allData.length < minDays) return false;
  const historicalData = allData.slice(0, -recentDays);
  const historicalValues = historicalData
    .map(getValue)
    .filter((v): v is number => v !== null && v !== undefined);
  if (historicalValues.length < minDays) return false;
  const trendCount = historicalValues.filter(checkCondition).length;
  const trendRatio = trendCount / historicalValues.length;
  if (trendRatio < 0.6) return false; // At least 60% of historical data must show trend
  const recentData = allData.slice(-recentDays);
  const recentValues = recentData
    .map(getValue)
    .filter((v): v is number => v !== null && v !== undefined);
  if (recentValues.length === 0) return false;
  const recentTrendCount = recentValues.filter(checkCondition).length;
  return recentTrendCount >= Math.ceil(recentValues.length * 0.5); // At least 50% of recent data
};

const analyzeTemperatureInsights = (
  readings: DailySensorReading[],
  foot: (typeof FOOT_KEYS)[number],
  language: LanguageCode,
  tempUnit: TempUnit,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (readings.length < MIN_TREND_DAYS) return insights;
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const t = i18n.getFixedT(language);
  const footName = t(`common.foot.${foot}`);
  const tempSymbol = t(`common.temperature.${tempUnit}.symbol`);
  const hasLowTempTrend = validateTrend(
    sortedReadings,
    (r) => r.avg_temperature,
    (temp) => temp !== null && temp < LOW_TEMP_THRESHOLD,
  );
  if (hasLowTempTrend) {
    const avgTemp =
      sortedReadings
        .map((r) => r.avg_temperature)
        .filter(
          (t): t is number =>
            t !== null && t !== undefined && t < LOW_TEMP_THRESHOLD,
        )
        .reduce((sum, t) => sum + t, 0) / sortedReadings.length;
    const convertedTemp = Math.round(getTemp(avgTemp, tempUnit));
    insights.push({
      name: t('healthInsights.lowTemperature.name', { foot: footName }),
      description: t('healthInsights.lowTemperature.description', {
        foot: lowerCase(footName),
        temp: convertedTemp,
        tempSymbol,
      }),
      severity: SeverityLevel.Mild,
    });
  }
  const hasHighTempTrend = validateTrend(
    sortedReadings,
    (r) => r.avg_temperature,
    (temp) => temp !== null && temp > HIGH_TEMP_THRESHOLD,
  );
  if (hasHighTempTrend) {
    const avgTemp =
      sortedReadings
        .map((r) => r.avg_temperature)
        .filter(
          (t): t is number =>
            t !== null && t !== undefined && t > HIGH_TEMP_THRESHOLD,
        )
        .reduce((sum, t) => sum + t, 0) / sortedReadings.length;
    const convertedTemp = Math.round(getTemp(avgTemp, tempUnit));
    insights.push({
      name: t('healthInsights.highTemperature.name', { foot: footName }),
      description: t('healthInsights.highTemperature.description', {
        foot: lowerCase(footName),
        temp: convertedTemp,
        tempSymbol,
      }),
      severity: SeverityLevel.Mild,
    });
  }
  return insights;
};

const analyzeAlignmentInsights = (
  leftReadings: DailySensorReading[],
  rightReadings: DailySensorReading[],
  language: LanguageCode,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (
    leftReadings.length < MIN_TREND_DAYS ||
    rightReadings.length < MIN_TREND_DAYS
  ) {
    return insights;
  }
  const leftMap = new Map(leftReadings.map((r) => [r.date, r]));
  const rightMap = new Map(rightReadings.map((r) => [r.date, r]));
  const commonDates = Array.from(leftMap.keys()).filter((date) =>
    rightMap.has(date),
  );
  if (commonDates.length < MIN_TREND_DAYS) return insights;
  const sortedDates = commonDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const differences = sortedDates
    .map((date) => {
      const left = leftMap.get(date);
      const right = rightMap.get(date);
      if (
        left?.avg_alignment !== null &&
        left?.avg_alignment !== undefined &&
        right?.avg_alignment !== null &&
        right?.avg_alignment !== undefined
      ) {
        return Math.abs(left.avg_alignment - right.avg_alignment);
      }
      return null;
    })
    .filter((d): d is number => d !== null);
  if (differences.length < MIN_TREND_DAYS) return insights;
  const hasSignificantDifference = validateTrend(
    differences.map((diff, idx) => ({
      date: sortedDates[idx],
      diff,
    })),
    (item) => item.diff,
    (diff) => diff > ALIGNMENT_DIFFERENCE_THRESHOLD,
  );
  if (hasSignificantDifference) {
    const avgDifference =
      differences.reduce((sum, d) => sum + d, 0) / differences.length;
    const t = i18n.getFixedT(language);
    insights.push({
      name: t('healthInsights.wideFootAngle.name'),
      description: t('healthInsights.wideFootAngle.description', {
        avgDifference: Math.round(avgDifference),
      }),
      severity: SeverityLevel.Neutral,
    });
  }
  return insights;
};

const analyzeArchInsights = (
  readings: DailySensorReading[],
  foot: (typeof FOOT_KEYS)[number],
  language: LanguageCode,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (readings.length < MIN_TREND_DAYS) return insights;
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const t = i18n.getFixedT(language);
  const footName = t(`common.foot.${foot}`);
  const hasHighArchTrend = validateTrend(
    sortedReadings,
    (r) => getArchPressure(r.force_sensors),
    (pressure) => pressure !== null && pressure < HIGH_ARCH_PRESSURE_THRESHOLD,
  );
  if (hasHighArchTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getArchPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p < HIGH_ARCH_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.highArches.name', { foot: footName }),
      description: t('healthInsights.highArches.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Mild,
    });
  }
  const hasLowArchTrend = validateTrend(
    sortedReadings,
    (r) => getArchPressure(r.force_sensors),
    (pressure) => pressure !== null && pressure > LOW_ARCH_PRESSURE_THRESHOLD,
  );
  if (hasLowArchTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getArchPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p > LOW_ARCH_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.lowArches.name', { foot: footName }),
      description: t('healthInsights.lowArches.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Mild,
    });
  }
  return insights;
};

const analyzeOverallPressureInsights = (
  readings: DailySensorReading[],
  foot: (typeof FOOT_KEYS)[number],
  language: LanguageCode,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (readings.length < MIN_TREND_DAYS) return insights;
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const t = i18n.getFixedT(language);
  const footName = t(`common.foot.${foot}`);
  const hasHighPressureTrend = validateTrend(
    sortedReadings,
    (r) => getOverallPressure(r.force_sensors),
    (pressure) =>
      pressure !== null && pressure > OVERALL_HIGH_PRESSURE_THRESHOLD,
  );
  if (hasHighPressureTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getOverallPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null &&
            p !== undefined &&
            p > OVERALL_HIGH_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.highOverallPressure.name', { foot: footName }),
      description: t('healthInsights.highOverallPressure.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Severe,
    });
  }
  const hasLowPressureTrend = validateTrend(
    sortedReadings,
    (r) => getOverallPressure(r.force_sensors),
    (pressure) =>
      pressure !== null && pressure < OVERALL_LOW_PRESSURE_THRESHOLD,
  );
  if (hasLowPressureTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getOverallPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p < OVERALL_LOW_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.lowOverallPressure.name', { foot: footName }),
      description: t('healthInsights.lowOverallPressure.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Neutral,
    });
  }
  return insights;
};

const analyzeGaitPatternInsights = (
  readings: DailySensorReading[],
  foot: (typeof FOOT_KEYS)[number],
  language: LanguageCode,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (readings.length < MIN_TREND_DAYS) return insights;
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const t = i18n.getFixedT(language);
  const footName = t(`common.foot.${foot}`);
  const hasHeelHeavyTrend = validateTrend(
    sortedReadings,
    (r) => getHeelPressure(r.force_sensors),
    (pressure) => pressure !== null && pressure > HEEL_PRESSURE_THRESHOLD,
  );
  if (hasHeelHeavyTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getHeelPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p > HEEL_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.heelHeavyGait.name', { foot: footName }),
      description: t('healthInsights.heelHeavyGait.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Neutral,
    });
  }
  const hasToeHeavyTrend = validateTrend(
    sortedReadings,
    (r) => getToePressure(r.force_sensors),
    (pressure) => pressure !== null && pressure > TOE_PRESSURE_THRESHOLD,
  );
  if (hasToeHeavyTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getToePressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p > TOE_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.toeHeavyGait.name', { foot: footName }),
      description: t('healthInsights.toeHeavyGait.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Severe,
    });
  }
  const hasBallPressureTrend = validateTrend(
    sortedReadings,
    (r) => getBallOfFootPressure(r.force_sensors),
    (pressure) => pressure !== null && pressure > BALL_PRESSURE_THRESHOLD,
  );
  if (hasBallPressureTrend) {
    const avgPressure =
      sortedReadings
        .map((r) => getBallOfFootPressure(r.force_sensors))
        .filter(
          (p): p is number =>
            p !== null && p !== undefined && p > BALL_PRESSURE_THRESHOLD,
        )
        .reduce((sum, p) => sum + p, 0) / sortedReadings.length;
    const pressurePercent = Math.round(avgPressure * 100);
    insights.push({
      name: t('healthInsights.highBallPressure.name', { foot: footName }),
      description: t('healthInsights.highBallPressure.description', {
        foot: lowerCase(footName),
        pressure: pressurePercent,
      }),
      severity: SeverityLevel.Mild,
    });
  }
  return insights;
};

const analyzeTemperatureAsymmetryInsights = (
  leftReadings: DailySensorReading[],
  rightReadings: DailySensorReading[],
  language: LanguageCode,
  tempUnit: TempUnit,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (
    leftReadings.length < MIN_TREND_DAYS ||
    rightReadings.length < MIN_TREND_DAYS
  ) {
    return insights;
  }
  const leftMap = new Map(leftReadings.map((r) => [r.date, r]));
  const rightMap = new Map(rightReadings.map((r) => [r.date, r]));
  const commonDates = Array.from(leftMap.keys()).filter((date) =>
    rightMap.has(date),
  );
  if (commonDates.length < MIN_TREND_DAYS) return insights;
  const sortedDates = commonDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const tempDifferences = sortedDates
    .map((date) => {
      const left = leftMap.get(date);
      const right = rightMap.get(date);
      if (
        left?.avg_temperature !== null &&
        left?.avg_temperature !== undefined &&
        right?.avg_temperature !== null &&
        right?.avg_temperature !== undefined
      ) {
        return Math.abs(left.avg_temperature - right.avg_temperature);
      }
      return null;
    })
    .filter((d): d is number => d !== null);
  if (tempDifferences.length < MIN_TREND_DAYS) return insights;
  const hasSignificantAsymmetry = validateTrend(
    tempDifferences.map((diff, idx) => ({
      date: sortedDates[idx],
      diff,
    })),
    (item) => item.diff,
    (diff) => diff > TEMP_ASYMMETRY_THRESHOLD,
  );
  if (hasSignificantAsymmetry) {
    const avgDifference =
      tempDifferences.reduce((sum, d) => sum + d, 0) / tempDifferences.length;
    const t = i18n.getFixedT(language);
    insights.push({
      name: t('healthInsights.temperatureAsymmetry.name'),
      description: t('healthInsights.temperatureAsymmetry.description', {
        avgDifference: Math.round(getTemp(avgDifference, tempUnit)),
        tempSymbol: t(`common.temperature.${tempUnit}.symbol`),
      }),
      severity: SeverityLevel.Mild,
    });
  }
  return insights;
};

const analyzeWeightDistributionInsights = (
  leftReadings: DailySensorReading[],
  rightReadings: DailySensorReading[],
  language: LanguageCode,
): HealthInsight[] => {
  const insights: HealthInsight[] = [];
  if (
    leftReadings.length < MIN_TREND_DAYS ||
    rightReadings.length < MIN_TREND_DAYS
  ) {
    return insights;
  }
  const leftMap = new Map(leftReadings.map((r) => [r.date, r]));
  const rightMap = new Map(rightReadings.map((r) => [r.date, r]));
  const commonDates = Array.from(leftMap.keys()).filter((date) =>
    rightMap.has(date),
  );
  if (commonDates.length < MIN_TREND_DAYS) return insights;
  const sortedDates = commonDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const distributions = sortedDates
    .map((date) => {
      const left = leftMap.get(date);
      const right = rightMap.get(date);
      const leftPressure = getOverallPressure(left?.force_sensors);
      const rightPressure = getOverallPressure(right?.force_sensors);
      if (leftPressure !== null && rightPressure !== null) {
        const total = leftPressure + rightPressure;
        if (total > 0) {
          return Math.abs(leftPressure - rightPressure) / total;
        }
      }
      return null;
    })
    .filter((d): d is number => d !== null);
  if (distributions.length < MIN_TREND_DAYS) return insights;
  const hasImbalance = validateTrend(
    distributions.map((dist, idx) => ({
      date: sortedDates[idx],
      dist,
    })),
    (item) => item.dist,
    (dist) => dist > WEIGHT_DISTRIBUTION_THRESHOLD,
  );
  if (hasImbalance) {
    const avgImbalance =
      distributions.reduce((sum, d) => sum + d, 0) / distributions.length;
    const percentage = (avgImbalance * 100).toFixed(0);
    const t = i18n.getFixedT(language);
    insights.push({
      name: t('healthInsights.weightDistributionImbalance.name'),
      description: t('healthInsights.weightDistributionImbalance.description', {
        percentage,
      }),
      severity: SeverityLevel.Severe,
    });
  }
  return insights;
};

const sortHealthInsights = (insights: HealthInsight[]): HealthInsight[] =>
  insights.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

export const collectAllHealthInsights = (
  leftReadings: DailySensorReading[],
  rightReadings: DailySensorReading[],
  language: LanguageCode,
  tempUnit: TempUnit,
): HealthInsight[] =>
  sortHealthInsights([
    ...analyzeTemperatureInsights(
      leftReadings ?? [],
      LEFT_FOOT_KEY,
      language,
      tempUnit,
    ),
    ...analyzeTemperatureInsights(
      rightReadings ?? [],
      RIGHT_FOOT_KEY,
      language,
      tempUnit,
    ),
    ...analyzeAlignmentInsights(
      leftReadings ?? [],
      rightReadings ?? [],
      language,
    ),
    ...analyzeArchInsights(leftReadings ?? [], LEFT_FOOT_KEY, language),
    ...analyzeArchInsights(rightReadings ?? [], RIGHT_FOOT_KEY, language),
    ...analyzeOverallPressureInsights(
      leftReadings ?? [],
      LEFT_FOOT_KEY,
      language,
    ),
    ...analyzeOverallPressureInsights(
      rightReadings ?? [],
      RIGHT_FOOT_KEY,
      language,
    ),
    ...analyzeGaitPatternInsights(leftReadings ?? [], LEFT_FOOT_KEY, language),
    ...analyzeGaitPatternInsights(
      rightReadings ?? [],
      RIGHT_FOOT_KEY,
      language,
    ),
    ...analyzeTemperatureAsymmetryInsights(
      leftReadings ?? [],
      rightReadings ?? [],
      language,
      tempUnit,
    ),
    ...analyzeWeightDistributionInsights(
      leftReadings ?? [],
      rightReadings ?? [],
      language,
    ),
  ]);
