export type SensorReading = {
  timestamp: string;
  batteryLevel: number;
  alignment: number;
  temperature: number;
  forceSensors: Array<{
    sensorID: number;
    relativeForce: number;
  }>;
};

