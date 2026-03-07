import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Alert, AppState } from 'react-native';
import { DeviceInfo } from '@/types/ble';
import {
  ADC_SCALE,
  FORCE_VAL_SIZE,
  NUM_FORCE_SENSORS,
  BATTERY_LEVEL_SIZE,
  POS_VAL_SIZE,
  SENSOR_READING_SIZE,
  START_FLAG,
  TEMP_VAL_SIZE,
  TIMESTAMP_SIZE,
  SENSOR_BATCH_SIZE,
  LOW_BATTERY_LEVEL,
} from '@/constants/sensors';
import { SensorReading } from '@/types/sensors';
import SensorReadingSchema from '@/utils/Sensors/SensorReadingSchema.json';
import { SensorReadingEmitter } from '@/utils/Sensors/SensorReadingEmitter';
import { addSensorReadings } from '@/utils/api/routes/sensorReadings';
import i18n from '@/i18n';
import { LEFT_FOOT_KEY } from '@/constants/ble';
import { sensorBenchmarks } from '@/utils/Sensors/Benchmarks';

let sensorReadingsBatch: Array<Omit<SensorReading, 'batteryLevel'>> = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

const ajv = new Ajv();
addFormats(ajv);
const validate = ajv.compile(SensorReadingSchema);

const deviceAnchors: Map<
  DeviceInfo['serial'],
  { phoneTime: number; teensyTime: number }
> = new Map();

export const resetAnchors = (deviceSerial?: DeviceInfo['serial']) => {
  if (deviceSerial) {
    deviceAnchors.delete(deviceSerial);
  } else {
    deviceAnchors.clear();
  }
};

export const flushReadingsBatch = async (insoleId: DeviceInfo['serial']) => {
  if (sensorReadingsBatch.length === 0) return;
  const batchToSend = [...sensorReadingsBatch];
  sensorReadingsBatch = [];
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }
  try {
    await addSensorReadings(insoleId, batchToSend);
    sensorBenchmarks.recordStorageResult(batchToSend.length, true);
  } catch (err) {
    sensorBenchmarks.recordStorageResult(batchToSend.length, false);
    console.error('Failed to send sensor readings batch', err);
  }
};

export const extractBufferedData = (
  buffer: Buffer,
  device: DeviceInfo,
): Buffer<ArrayBuffer> => {
  while (buffer.length >= SENSOR_READING_SIZE) {
    const startIndex = buffer.indexOf(START_FLAG.charCodeAt(0));

    if (startIndex === -1) {
      return Buffer.alloc(0);
    }
    if (startIndex > 0) {
      buffer = buffer.slice(startIndex);
    }
    if (buffer.length < SENSOR_READING_SIZE) {
      return buffer as Buffer<ArrayBuffer>;
    }

    const reading = buffer.slice(0, SENSOR_READING_SIZE);
    buffer = buffer.slice(SENSOR_READING_SIZE);

    try {
      validateSensorReading(reading, device);
    } catch (e) {
      buffer = buffer.slice(1);
      continue;
    }
  }

  return buffer as Buffer<ArrayBuffer>;
};

const validateSensorReading = (reading: Buffer, device: DeviceInfo) => {
  if (!device.serial) return;
  const parsed = parseSensorReading(reading, device.serial);
  if (!validate(parsed)) return;
  if (parsed.batteryLevel === LOW_BATTERY_LEVEL) {
    Alert.alert(
      i18n.t('notification.title'),
      i18n.t('notification.message', {
        insoleName:
          device.foot === LEFT_FOOT_KEY
            ? i18n.t('common.leftInsole')
            : i18n.t('common.rightInsole'),
      }),
    );
  }
  if (
    AppState.currentState === 'active' &&
    isSensorReadingCurrent(parsed.timestamp)
  ) {
    const receivedAt = Date.now();
    sensorBenchmarks.markReceived(device, parsed, receivedAt);
    SensorReadingEmitter.emitReading(device, parsed);
  }

  sensorReadingsBatch.push({
    timestamp: parsed.timestamp,
    temperature: parsed.temperature,
    alignment: parsed.alignment,
    forceSensors: parsed.forceSensors,
  });

  if (sensorReadingsBatch.length >= SENSOR_BATCH_SIZE) {
    flushReadingsBatch(device.serial);
  } else if (!batchTimeout) {
    batchTimeout = setTimeout(
      () => flushReadingsBatch(device.serial).catch(console.error),
      1000,
    );
  }
};

const parseSensorReading = (
  reading: Buffer,
  deviceSerial: DeviceInfo['serial'],
): SensorReading => {
  let i = 1;

  const batteryLevel: SensorReading['batteryLevel'] = reading.readUInt16LE(i);
  i += BATTERY_LEVEL_SIZE;

  const alignment: SensorReading['alignment'] = reading.readUInt16LE(i);
  i += POS_VAL_SIZE;

  const temperature: SensorReading['temperature'] = reading.readInt8(i);
  i += TEMP_VAL_SIZE;

  const forceSensors: SensorReading['forceSensors'] = [];
  for (let j = 0; j < NUM_FORCE_SENSORS; j++) {
    forceSensors.push({
      sensorID: j + 1,
      relativeForce:
        Math.round((reading.readUInt16LE(i) / ADC_SCALE) * 100) / 100,
    });
    i += FORCE_VAL_SIZE;
  }

  const timestamp: SensorReading['timestamp'] = getSensorReadingRealTime(
    reading.readUint32LE(i),
    deviceSerial,
  ).toISOString();
  i += TIMESTAMP_SIZE;

  return {
    timestamp,
    batteryLevel,
    alignment,
    temperature,
    forceSensors,
  };
};

const getSensorReadingRealTime = (
  currentTimestamp: number,
  deviceSerial: DeviceInfo['serial'],
): Date => {
  const now = Date.now();
  const anchor = deviceAnchors.get(deviceSerial);

  if (!anchor) {
    deviceAnchors.set(deviceSerial, {
      phoneTime: now,
      teensyTime: currentTimestamp,
    });
    return new Date(now);
  }
  return new Date(
    anchor.phoneTime +
      ((currentTimestamp - anchor.teensyTime + 0x100_000_000) % 0x100_000_000),
  );
};

const isSensorReadingCurrent = (
  timestamp: SensorReading['timestamp'],
): boolean => Math.abs(Date.now() - new Date(timestamp).getTime()) <= 1000;
