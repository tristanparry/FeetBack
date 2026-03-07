import mitt from 'mitt';
import { DeviceInfo } from '@/types/ble';
import { SensorReading } from '@/types/sensors';
import { SENSOR_READING_EVENT, DEVICE_DISCONNECT_EVENT } from '@/constants/sensors';

const emitter = mitt<{
  sensorReading: { device: DeviceInfo; reading: SensorReading };
  deviceDisconnect: { device: DeviceInfo };
}>();

export const SensorReadingEmitter = {
  emitReading: (device: DeviceInfo, reading: SensorReading) =>
    emitter.emit(SENSOR_READING_EVENT, { device, reading }),
  onReading: (
    callback: (payload: { device: DeviceInfo; reading: SensorReading }) => void,
  ) => emitter.on(SENSOR_READING_EVENT, callback),
  removeReadingListener: (
    callback: (payload: { device: DeviceInfo; reading: SensorReading }) => void,
  ) => emitter.off(SENSOR_READING_EVENT, callback),
  emitDisconnect: (device: DeviceInfo) =>
    emitter.emit(DEVICE_DISCONNECT_EVENT, { device }),
  onDisconnect: (callback: (payload: { device: DeviceInfo }) => void) =>
    emitter.on(DEVICE_DISCONNECT_EVENT, callback),
  removeDisconnectListener: (
    callback: (payload: { device: DeviceInfo }) => void,
  ) => emitter.off(DEVICE_DISCONNECT_EVENT, callback),
};
