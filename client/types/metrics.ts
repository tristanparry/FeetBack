import { LEFT_FOOT_KEY, RIGHT_FOOT_KEY } from '@/constants/ble';
import { SensorReading } from '@/types/sensors';
import { DeviceInfo } from '@/types/ble';

export enum Metric {
  Pressure = 'pressure',
  Alignment = 'alignment',
  Temperature = 'temperature',
}

export type FootReading = {
  [LEFT_FOOT_KEY]?: SensorReading;
  [RIGHT_FOOT_KEY]?: SensorReading;
};

export type PairedDeviceSerials = {
  leftSerial: DeviceInfo['serial'];
  rightSerial: DeviceInfo['serial'];
};
