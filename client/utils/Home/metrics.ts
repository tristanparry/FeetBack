import i18n from '@/i18n/index';
import { ALIGNMENT_ERROR } from '@/constants/sensors';
import {
  BLE_DEVICE_NAMES,
  LEFT_FOOT_KEY,
  RIGHT_FOOT_KEY,
} from '@/constants/ble';
import { DeviceInfo } from '@/types/ble';
import { type FootReading, Metric } from '@/types/metrics';
import {
  TEMP_UNIT_SYMBOLS,
  DEFAULT_TEMP_UNIT,
  TEMP_UNIT_NAMES,
} from '@/constants/temperature';
import { TempUnit } from '@/types/temperature';
import { getTemp } from '@/utils/UI/temperature';

export const NO_METRIC_DATA = '-';

const LOWER_PRESSURE = 30;
const UPPER_PRESSURE = 70;

const LOWER_ALIGNMENT = 0;
const UPPER_ALIGNMENT = 20;

const LOWER_TEMP = 15;
const UPPER_TEMP = 25;

export const MetricData = {
  [Metric.Pressure]: {
    label: 'home.metrics.pressure.name',
    description: (): string =>
      i18n.t('home.metrics.pressure.description', {
        lowerPressure: LOWER_PRESSURE,
        upperPressure: UPPER_PRESSURE,
      }),
    iconName: 'speedometer-outline',
    computationMethod: (devices: DeviceInfo[], reading: FootReading) =>
      calculatePressureMetric(devices, reading),
  },
  [Metric.Alignment]: {
    label: 'home.metrics.alignment.name',
    description: (): string =>
      i18n.t('home.metrics.alignment.description', {
        lowerAlignment: LOWER_ALIGNMENT,
        upperAlignment: UPPER_ALIGNMENT,
      }),
    iconName: 'swap-horizontal-outline',
    computationMethod: (devices: DeviceInfo[], reading: FootReading) =>
      calculateAlignmentMetric(devices, reading),
  },
  [Metric.Temperature]: {
    label: 'home.metrics.temperature.name',
    description: (unit?: TempUnit): string =>
      i18n.t('home.metrics.temperature.description', {
        temperatureTypeName: i18n.t(TEMP_UNIT_NAMES[unit ?? DEFAULT_TEMP_UNIT]),
        temperatureTypeSymbol: i18n.t(
          TEMP_UNIT_SYMBOLS[unit ?? DEFAULT_TEMP_UNIT],
        ),
        lowerTemp: getTemp(LOWER_TEMP, unit),
        upperTemp: getTemp(UPPER_TEMP, unit),
      }),
    iconName: 'thermometer-outline',
    computationMethod: (
      devices: DeviceInfo[],
      reading: FootReading,
      unit?: TempUnit,
    ) => calculateTemperatureMetric(devices, reading, unit),
  },
};

const calculatePressureMetric = (
  devices: DeviceInfo[],
  reading: FootReading,
): string => {
  const allForceSensors = [
    ...(reading[LEFT_FOOT_KEY]?.forceSensors ?? []),
    ...(reading[RIGHT_FOOT_KEY]?.forceSensors ?? []),
  ];
  const forceSensors =
    devices.length === 1
      ? [
          ...(reading[LEFT_FOOT_KEY]?.forceSensors ?? []),
          ...(reading[RIGHT_FOOT_KEY]?.forceSensors ?? []),
        ]
      : allForceSensors;
  return `${
    devices.length > 0
      ? `${(
          forceSensors.reduce((avg, val, _, { length }) => {
            return avg + val.relativeForce / length;
          }, 0) * 100
        ).toFixed(1)}%`
      : NO_METRIC_DATA
  }`;
};

const calculateAlignmentMetric = (
  devices: DeviceInfo[],
  reading: FootReading,
): string => {
  const alignmentIssue =
    devices.length !== BLE_DEVICE_NAMES.length ||
    reading[LEFT_FOOT_KEY]?.alignment === ALIGNMENT_ERROR ||
    reading[RIGHT_FOOT_KEY]?.alignment === ALIGNMENT_ERROR;
  if (alignmentIssue) return NO_METRIC_DATA;
  let rawAlignmentDifference =
    (reading[RIGHT_FOOT_KEY]?.alignment ?? 0) -
    (reading[LEFT_FOOT_KEY]?.alignment ?? 0);
  if (rawAlignmentDifference > 180) {
    rawAlignmentDifference -= 360;
  } else if (rawAlignmentDifference < -180) {
    rawAlignmentDifference += 360;
  }
  const alignmentDiff = Math.round(rawAlignmentDifference * 10) / 10;
  return `${alignmentDiff}\u00B0`;
};

const calculateTemperatureMetric = (
  devices: DeviceInfo[],
  reading: FootReading,
  unit: TempUnit = DEFAULT_TEMP_UNIT,
): string => {
  const avgTemperature =
    devices.length === 1
      ? (reading[LEFT_FOOT_KEY]?.temperature ??
        reading[RIGHT_FOOT_KEY]?.temperature ??
        0)
      : Math.round(
          (((reading[LEFT_FOOT_KEY]?.temperature ?? 0) +
            (reading[RIGHT_FOOT_KEY]?.temperature ?? 0)) /
            2.0) *
            10,
        ) / 10;
  return `${
    devices.length > 0
      ? `${getTemp(avgTemperature, unit)}${i18n.t(TEMP_UNIT_SYMBOLS[unit])}`
      : NO_METRIC_DATA
  }`;
};
