import {
  getDailySummary,
  getWeekSummary,
  getMonthSummary,
} from '@/utils/api/routes/sensorReadings';
import {
  getLocalDateAsUTC,
  normalizeDate,
  getWeekDatesAsStrings,
  getMonthDatesAsStrings,
} from '@/utils/UI/dates';
import { Metric } from '@/types/metrics';
import { FootReading, PairedDeviceSerials } from '@/types/metrics';
import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import { DeviceInfo } from '@/types/ble';
import { ALIGNMENT_ERROR, LOW_BATTERY_LEVEL } from '@/constants/sensors';
import { SensorReading } from '@/types/sensors';
import {
  ApiSensorReadingData,
  RawDataMap,
  HistoryDataPoint,
  HourlyDataPoint,
  HistoryDataArray,
} from '@/types/history';
import { HOURS_PER_DAY } from '@/constants/dates';
import { getTemp } from '@/utils/UI/temperature';
import { TempUnit } from '@/types/temperature';
import { DEFAULT_TEMP_UNIT } from '@/constants/temperature';
import { TimeRange } from '@/types/dates';

export const sanitizeValue = (
  metricType: Metric,
  raw: number | null | undefined,
): number | null => {
  if (raw == null) return null;
  if (!Number.isFinite(raw)) return null;
  switch (metricType) {
    case Metric.Alignment:
      return raw >= -180 && raw <= 180 ? raw : null;
    case Metric.Temperature:
      return raw >= -100 && raw <= 300 ? raw : null;
    default:
      return raw;
  }
};

const normalizeToArray = (data: any): ApiSensorReadingData[] | null => {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  return [data];
};

const fetchInsoleDataDaily = async (
  pairedDeviceSerials: PairedDeviceSerials,
  date: string,
  apiCall: (insoleID: DeviceInfo['serial'], date: string) => any,
): Promise<{
  [LEFT_FOOT_KEY]: ApiSensorReadingData[] | null;
  [RIGHT_FOOT_KEY]: ApiSensorReadingData[] | null;
}> => {
  const [leftData, rightData] = await Promise.all([
    pairedDeviceSerials.leftSerial
      ? apiCall(pairedDeviceSerials.leftSerial, date).catch(() => ({
          data: null,
        }))
      : Promise.resolve({ data: null }),
    pairedDeviceSerials.rightSerial
      ? apiCall(pairedDeviceSerials.rightSerial, date).catch(() => ({
          data: null,
        }))
      : Promise.resolve({ data: null }),
  ]);

  return {
    [LEFT_FOOT_KEY]: normalizeToArray(leftData?.data),
    [RIGHT_FOOT_KEY]: normalizeToArray(rightData?.data),
  };
};

const fetchInsoleDataMonthly = async (
  pairedDeviceSerials: PairedDeviceSerials,
  year: number,
  month: number,
  apiCall: (insoleID: DeviceInfo['serial'], year: number, month: number) => any,
): Promise<{
  [LEFT_FOOT_KEY]: ApiSensorReadingData[] | null;
  [RIGHT_FOOT_KEY]: ApiSensorReadingData[] | null;
}> => {
  const [leftData, rightData] = await Promise.all([
    pairedDeviceSerials.leftSerial
      ? apiCall(pairedDeviceSerials.leftSerial, year, month).catch(() => ({
          data: null,
        }))
      : Promise.resolve({ data: null }),
    pairedDeviceSerials.rightSerial
      ? apiCall(pairedDeviceSerials.rightSerial, year, month).catch(() => ({
          data: null,
        }))
      : Promise.resolve({ data: null }),
  ]);

  return {
    [LEFT_FOOT_KEY]: leftData?.data ?? null,
    [RIGHT_FOOT_KEY]: rightData?.data ?? null,
  };
};

const convertForceSensorsToSensorReading = (
  relativeForces: Array<SensorReading['forceSensors'][0]['relativeForce']>,
  timestamp: SensorReading['timestamp'],
): SensorReading => ({
  timestamp,
  batteryLevel: LOW_BATTERY_LEVEL,
  alignment: ALIGNMENT_ERROR,
  temperature: 0,
  forceSensors: relativeForces.map((relativeForce, i) => ({
    sensorID: i + 1,
    relativeForce,
  })),
});

const calculateAlignmentValue = (
  pairedDeviceSerials: PairedDeviceSerials,
  leftAlignment: number | null,
  rightAlignment: number | null,
): number | null => {
  const alignmentIssue =
    !pairedDeviceSerials.leftSerial ||
    !pairedDeviceSerials.rightSerial ||
    leftAlignment === ALIGNMENT_ERROR ||
    rightAlignment === ALIGNMENT_ERROR ||
    leftAlignment === null ||
    rightAlignment === null;
  if (alignmentIssue) {
    return null;
  }
  let rawAlignmentDifference = (leftAlignment ?? 0) - (rightAlignment ?? 0);
  if (rawAlignmentDifference > 180) {
    rawAlignmentDifference -= 360;
  } else if (rawAlignmentDifference < -180) {
    rawAlignmentDifference += 360;
  }
  return Math.round(rawAlignmentDifference * 10) / 10;
};

const calculateTemperatureValue = (
  pairedDeviceSerials: PairedDeviceSerials,
  leftTemperature: number | null,
  rightTemperature: number | null,
  unit: TempUnit = DEFAULT_TEMP_UNIT,
): number | null => {
  if (!pairedDeviceSerials.leftSerial || !pairedDeviceSerials.rightSerial)
    return null;
  let avgTemperature: number | null = null;
  if (leftTemperature !== null && rightTemperature !== null) {
    avgTemperature =
      Math.round(((leftTemperature + rightTemperature) / 2.0) * 10) / 10;
  } else {
    avgTemperature = leftTemperature ?? rightTemperature ?? null;
  }
  return avgTemperature ? getTemp(avgTemperature, unit) : null;
};

const collectData = (
  data: ApiSensorReadingData[] | null | undefined,
  side: typeof LEFT_FOOT_KEY | typeof RIGHT_FOOT_KEY,
  timeRange: TimeRange,
  rawDataMap: RawDataMap,
) => {
  if (!data?.length) return;
  data.forEach((entry) => {
    const normalizedDate = normalizeDate(entry.date);
    if (!rawDataMap.has(normalizedDate)) {
      rawDataMap.set(normalizedDate, {});
    }
    const item = rawDataMap.get(normalizedDate)!;
    item.pressure ??= {};
    item.pressure[side] = convertForceSensorsToSensorReading(
      entry.force_sensors,
      entry.date,
    );
    item[side] ??= {};
    if (timeRange === TimeRange.Day) {
      if (entry.temperature_series)
        item[side]!.temperature = entry.temperature_series;
      if (entry.alignment_series)
        item[side]!.alignment = entry.alignment_series;
    } else {
      if (entry.avg_temperature != null)
        item[side]!.avgTemperature = entry.avg_temperature;
      if (entry.avg_alignment != null)
        item[side]!.avgAlignment = entry.avg_alignment;
    }
  });
};

const createHourlyDataPoint = (
  targetDate: string,
  rawDataMap: RawDataMap,
  pairedDeviceSerials: PairedDeviceSerials,
  tempUnit: TempUnit,
): HistoryDataPoint => {
  const item = rawDataMap.get(targetDate);
  const leftFoot = item?.[LEFT_FOOT_KEY];
  const rightFoot = item?.[RIGHT_FOOT_KEY];
  const temperatureData: HourlyDataPoint[] = Array.from(
    { length: HOURS_PER_DAY },
    (_, hour) => ({
      hour,
      value: calculateTemperatureValue(
        pairedDeviceSerials,
        leftFoot?.temperature?.[hour] ?? null,
        rightFoot?.temperature?.[hour] ?? null,
        tempUnit,
      ),
    }),
  );
  const alignmentData: HourlyDataPoint[] = Array.from(
    { length: HOURS_PER_DAY },
    (_, hour) => ({
      hour,
      value: calculateAlignmentValue(
        pairedDeviceSerials,
        leftFoot?.alignment?.[hour] ?? null,
        rightFoot?.alignment?.[hour] ?? null,
      ),
    }),
  );
  return {
    timestamp: targetDate,
    pressure: item?.pressure ?? {},
    temperature: temperatureData,
    alignment: alignmentData,
  };
};

const createDailyDataPoint = (
  dateStr: string,
  rawDataMap: RawDataMap,
  pairedDeviceSerials: PairedDeviceSerials,
  tempUnit: TempUnit,
): HistoryDataPoint => {
  const item = rawDataMap.get(dateStr);
  const leftFoot = item?.[LEFT_FOOT_KEY];
  const rightFoot = item?.[RIGHT_FOOT_KEY];
  return {
    timestamp: dateStr,
    pressure: item?.pressure ?? {},
    temperature: [
      {
        timestamp: dateStr,
        value: calculateTemperatureValue(
          pairedDeviceSerials,
          leftFoot?.avgTemperature ?? null,
          rightFoot?.avgTemperature ?? null,
          tempUnit,
        ),
      },
    ],
    alignment: [
      {
        timestamp: dateStr,
        value: calculateAlignmentValue(
          pairedDeviceSerials,
          leftFoot?.avgAlignment ?? null,
          rightFoot?.avgAlignment ?? null,
        ),
      },
    ],
  };
};

export const hasValidGraphData = (data: HistoryDataArray[]): boolean => {
  if (!data || !Array.isArray(data) || data.length === 0) return false;
  return data.some((d) =>
    d.some((point) => point.value !== null && point.value !== undefined),
  );
};

export const hasValidPressureData = (data: FootReading[]): boolean => {
  if (!data || !Array.isArray(data) || data.length === 0) return false;
  return data.some(
    (reading) =>
      reading[LEFT_FOOT_KEY]?.forceSensors?.some(
        (fs) => fs.relativeForce > 0,
      ) ||
      reading[RIGHT_FOOT_KEY]?.forceSensors?.some((fs) => fs.relativeForce > 0),
  );
};

const shapeHistoryData = (
  left: ApiSensorReadingData[] | null,
  right: ApiSensorReadingData[] | null,
  timeRange: TimeRange,
  pairedDeviceSerials: PairedDeviceSerials,
  date: string,
  year: number,
  month: number,
  tempUnit: TempUnit,
): HistoryDataPoint[] => {
  const rawDataMap: RawDataMap = new Map();
  collectData(left, LEFT_FOOT_KEY, timeRange, rawDataMap);
  collectData(right, RIGHT_FOOT_KEY, timeRange, rawDataMap);
  let dates: string[];
  let createPoint: (dateStr: string) => HistoryDataPoint;
  if (timeRange === TimeRange.Day) {
    const apiDates = Array.from(rawDataMap.keys());
    dates = [apiDates.length > 0 ? apiDates[0] : date];
    createPoint = (targetDate) =>
      createHourlyDataPoint(
        targetDate,
        rawDataMap,
        pairedDeviceSerials,
        tempUnit,
      );
  } else {
    dates =
      timeRange === TimeRange.Week
        ? getWeekDatesAsStrings(date)
        : getMonthDatesAsStrings(year, month);
    createPoint = (dateStr) =>
      createDailyDataPoint(dateStr, rawDataMap, pairedDeviceSerials, tempUnit);
  }
  return dates
    .map(createPoint)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export const fetchHistoryData = async (
  pairedDeviceSerials: PairedDeviceSerials,
  range: TimeRange,
  date: string,
  year: number,
  month: number,
  tempUnit: TempUnit,
): Promise<HistoryDataPoint[]> => {
  let data;
  switch (range) {
    case TimeRange.Day:
      data = await fetchInsoleDataDaily(
        pairedDeviceSerials,
        getLocalDateAsUTC(date),
        getDailySummary,
      );
      break;
    case TimeRange.Week:
      data = await fetchInsoleDataDaily(
        pairedDeviceSerials,
        getLocalDateAsUTC(date),
        getWeekSummary,
      );
      break;
    case TimeRange.Month:
      data = await fetchInsoleDataMonthly(
        pairedDeviceSerials,
        year,
        month,
        getMonthSummary,
      );
      break;
    default:
      return [];
  }
  return shapeHistoryData(
    data[LEFT_FOOT_KEY],
    data[RIGHT_FOOT_KEY],
    range,
    pairedDeviceSerials,
    date,
    year,
    month,
    tempUnit,
  );
};

export const extractMetricSeries = (
  data: HistoryDataPoint[],
  metric: Metric,
): FootReading[] | HistoryDataArray[] => {
  switch (metric) {
    case Metric.Pressure:
      return data.map((d) => d.pressure ?? {});
    case Metric.Temperature:
      return data.map((d) => d.temperature ?? []);
    case Metric.Alignment:
      return data.map((d) => d.alignment ?? []);
    default:
      return [];
  }
};
