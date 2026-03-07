import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import { FootReading } from '@/types/metrics';

export type ApiSensorReadingData = {
  date: string;
  avg_temperature: number | null;
  avg_alignment: number | null;
  temperature_series?: number[];
  alignment_series?: number[];
  force_sensors: number[];
};

export type HourlyDataPoint = {
  hour: number;
  value: number | null;
};

export type DailyDataPoint = {
  timestamp: string;
  value: number | null;
};

export type HistoryDataArray = HourlyDataPoint[] | DailyDataPoint[];

export type HistoryDataPoint = {
  timestamp: string;
  pressure?: FootReading;
  temperature?: HistoryDataArray;
  alignment?: HistoryDataArray;
};

type RawDataPerFoot = {
  [LEFT_FOOT_KEY]?: {
    temperature?: number[];
    alignment?: number[];
    avgTemperature?: number | null;
    avgAlignment?: number | null;
  };
  [RIGHT_FOOT_KEY]?: {
    temperature?: number[];
    alignment?: number[];
    avgTemperature?: number | null;
    avgAlignment?: number | null;
  };
};

export type RawDataMap = Map<
  string,
  RawDataPerFoot & { pressure?: FootReading }
>;
