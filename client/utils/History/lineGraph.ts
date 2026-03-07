import {
  DailyDataPoint,
  HistoryDataArray,
  HourlyDataPoint,
} from '@/types/history';
import { HOURS_PER_DAY } from '@/constants/dates';
import { normalizeDate } from '@/utils/UI/dates';

export const flattenDailyDataPoints = (
  data: HistoryDataArray[] | null | undefined,
): DailyDataPoint[] => {
  const allDailyPoints: DailyDataPoint[] = [];
  if (data && Array.isArray(data)) {
    data.forEach((dayDataArray) => {
      if (Array.isArray(dayDataArray)) {
        dayDataArray.forEach((point) => {
          if (point && 'timestamp' in point) {
            allDailyPoints.push(point as DailyDataPoint);
          }
        });
      }
    });
  }
  return allDailyPoints;
};

export const createDailyDataMap = (
  points: DailyDataPoint[],
): Map<string, number | null | undefined> => {
  const dataMap = new Map<string, number | null | undefined>();
  points.forEach((point) => {
    if (point && point.timestamp) {
      const normalizedTimestamp = normalizeDate(point.timestamp);
      dataMap.set(normalizedTimestamp, point.value);
    }
  });
  return dataMap;
};

export const createHourlyDataMap = (
  points: HourlyDataPoint[] | undefined,
): Map<number, number | null | undefined> => {
  const dataMap = new Map<number, number | null | undefined>();
  points?.forEach((point) => {
    if (point.hour >= 0 && point.hour < HOURS_PER_DAY) {
      dataMap.set(point.hour, point.value);
    }
  });
  return dataMap;
};
