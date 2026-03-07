import { DeviceInfo } from '@/types/ble';
import { SensorReading } from '@/types/sensors';

type BenchmarkKey = string;

const ENABLE_SENSOR_BENCHMARK_LOGS = false;

const createKey = (
  deviceSerial: DeviceInfo['serial'],
  timestamp: string,
): BenchmarkKey => `${deviceSerial}|${timestamp}`;

class SensorBenchmarks {
  private startTime: number | null = null;
  private lastReadingTime: number | null = null;
  private totalReadings = 0;
  private storageAttempts = 0;
  private storageSuccesses = 0;
  private receiptTimes: Map<BenchmarkKey, number> = new Map();

  markReceived(device: DeviceInfo, reading: SensorReading, receivedAt: number) {
    if (!ENABLE_SENSOR_BENCHMARK_LOGS) return;
    if (!device.serial || !reading.timestamp) return;
    const key = createKey(device.serial, reading.timestamp);
    this.receiptTimes.set(key, receivedAt);
  }

  recordStorageResult(batchSize: number, succeeded: boolean) {
    if (!ENABLE_SENSOR_BENCHMARK_LOGS) return;
    if (batchSize <= 0) return;
    this.storageAttempts += batchSize;
    if (succeeded) {
      this.storageSuccesses += batchSize;
    }
  }

  recordReading(device: DeviceInfo, reading: SensorReading) {
    if (!ENABLE_SENSOR_BENCHMARK_LOGS) return;

    const now = Date.now();
    if (this.startTime == null) {
      this.startTime = now;
    }

    const key = device.serial
      ? createKey(device.serial, reading.timestamp)
      : null;
    const receivedAt =
      key != null && this.receiptTimes.has(key)
        ? this.receiptTimes.get(key)!
        : now;
    if (key != null) {
      this.receiptTimes.delete(key);
    }

    const elapsedSeconds = (now - this.startTime) / 1000;
    const deltaFromPreviousMs =
      this.lastReadingTime != null ? now - this.lastReadingTime : 0;
    const uiLatencyMs = now - receivedAt;

    this.lastReadingTime = now;
    this.totalReadings += 1;

    const avgRate =
      elapsedSeconds > 0
        ? this.totalReadings / elapsedSeconds
        : this.totalReadings;

    const storageSuccessRate =
      this.storageAttempts > 0
        ? (this.storageSuccesses / this.storageAttempts) * 100
        : 0;

    const headerLines = [
      '================ SENSOR READING =================',
      `Device: ${device.serial ?? 'unknown'} (${device.foot ?? 'unknown foot'})`,
      `Sensor timestamp: ${reading.timestamp}`,
      `Battery level: ${reading.batteryLevel}`,
      `Alignment: ${reading.alignment}`,
      `Temperature: ${reading.temperature}`,
      `Force sensors: ${reading.forceSensors
        .map((fs) => `${fs.sensorID}:${fs.relativeForce.toFixed(2)}`)
        .join(', ')}`,
    ];

    const metricsLines = [
      '---------------- RUNNING METRICS ----------------',
      `Elapsed time since first reading: ${elapsedSeconds.toFixed(1)} s`,
      `Total readings received: ${this.totalReadings}`,
      `Average transmission rate: ${Math.round(avgRate)} readings/s`,
      `Storage success rate: ${storageSuccessRate.toFixed(
        2,
      )}% (${this.storageSuccesses}/${this.storageAttempts})`,
      `Delta from previous reading: ${deltaFromPreviousMs} ms`,
      `UI latency (data receipt to UI handler): ${uiLatencyMs} ms`,
      '=================================================',
    ];

    console.log([...headerLines, ...metricsLines].join('\n'));
  }
}

export const sensorBenchmarks = new SensorBenchmarks();
