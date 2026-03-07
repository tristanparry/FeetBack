import { DEFAULT_LANGUAGE, LanguageCode } from '../../i18n/types.ts';
import {
  collectAllHealthInsights,
  DailySensorReading,
  HealthInsight,
} from '../utils/healthInsightUtils.ts';
import {
  FOOT_KEYS,
  LEFT_FOOT_KEY,
  RIGHT_FOOT_KEY,
} from '../utils/insoleUtils.ts';
import { DEFAULT_TEMP_UNIT, TempUnit } from '../utils/temperature.ts';
import { getInsolesByUser } from './insoleService.ts';
import { fetchRangeSummaries } from './sensorReadingService.ts';
import { getUserById } from './userService.ts';

export const generateHealthInsights = async (
  user_id: number,
): Promise<HealthInsight[] | null> => {
  try {
    const user = await getUserById(user_id);
    if (!user) {
      return null;
    }
    const language = (user.language as LanguageCode) || DEFAULT_LANGUAGE;
    const tempUnit = (user.temp_unit as TempUnit) || DEFAULT_TEMP_UNIT;
    const insoles = await getInsolesByUser(user_id);
    if (!insoles || insoles.length === 0) {
      return null;
    }
    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 30);
    const startDateStr = startDate.toISOString().slice(0, 10);
    const endDateStr = endDate.toISOString().slice(0, 10);
    const insoleReadingsMap = new Map<
      string,
      { foot: (typeof FOOT_KEYS)[number]; readings: DailySensorReading[] }
    >();
    for (const insole of insoles) {
      const readings = await fetchRangeSummaries(
        user_id,
        insole.insole_id,
        startDateStr,
        endDateStr,
      );
      const normalizedReadings: DailySensorReading[] = readings.map((r) => {
        let forceSensors = r.force_sensors;
        if (
          !forceSensors ||
          (typeof forceSensors === 'object' &&
            !Array.isArray(forceSensors) &&
            Object.keys(forceSensors).length === 0)
        ) {
          forceSensors = [];
        }
        return {
          date: r.date,
          avg_temperature: r.avg_temperature,
          avg_alignment: r.avg_alignment,
          temperature_series: Array.isArray(r.temperature_series)
            ? r.temperature_series
            : [],
          alignment_series: Array.isArray(r.alignment_series)
            ? r.alignment_series
            : [],
          force_sensors: forceSensors,
        };
      });
      insoleReadingsMap.set(insole.insole_id, {
        foot: insole.foot as (typeof FOOT_KEYS)[number],
        readings: normalizedReadings,
      });
    }
    const leftInsole = Array.from(insoleReadingsMap.values()).find(
      (ir) => ir.foot === LEFT_FOOT_KEY,
    );
    const rightInsole = Array.from(insoleReadingsMap.values()).find(
      (ir) => ir.foot === RIGHT_FOOT_KEY,
    );
    return collectAllHealthInsights(
      leftInsole?.readings ?? [],
      rightInsole?.readings ?? [],
      language,
      tempUnit,
    );
  } catch (error) {
    console.error('Error generating health insights:', error);
    throw error;
  }
};
