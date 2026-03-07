const HOURS_PER_DAY = 24;
const NUM_FORCE_SENSORS = 11;
const ALIGNMENT_ERROR = 65535;

export type AggregationState = {
  tempSeries: number[];
  tempCounts: number[];
  alignSeries: number[];
  alignCounts: number[];
  forceSensors: number[];
  forceSensorsCount: number;
};

export type SensorReading = {
  timestamp: string;
  temperature?: number;
  alignment?: number;
  forceSensors?: Array<{
    sensorID: number;
    relativeForce: number;
  }>;
};

export const initZeroesArray = (length: number): number[] =>
  Array(length).fill(0);

export const normalizeForceSensors = (forceSensors: any): number[] => {
  if (!forceSensors || !Array.isArray(forceSensors)) {
    return initZeroesArray(NUM_FORCE_SENSORS);
  }
  return forceSensors
    .slice(0, NUM_FORCE_SENSORS)
    .concat(
      Array(Math.max(0, NUM_FORCE_SENSORS - forceSensors.length)).fill(0),
    );
};

export const initializeAggregationState = (row?: any): AggregationState => {
  if (!row) {
    return {
      tempSeries: initZeroesArray(HOURS_PER_DAY),
      tempCounts: initZeroesArray(HOURS_PER_DAY),
      alignSeries: initZeroesArray(HOURS_PER_DAY),
      alignCounts: initZeroesArray(HOURS_PER_DAY),
      forceSensors: initZeroesArray(NUM_FORCE_SENSORS),
      forceSensorsCount: 0,
    };
  }
  return {
    tempSeries: row.temperature_series ?? initZeroesArray(HOURS_PER_DAY),
    tempCounts: row.temperature_counts ?? initZeroesArray(HOURS_PER_DAY),
    alignSeries: row.alignment_series ?? initZeroesArray(HOURS_PER_DAY),
    alignCounts: row.alignment_counts ?? initZeroesArray(HOURS_PER_DAY),
    forceSensors: normalizeForceSensors(row.force_sensors),
    forceSensorsCount: Number(row.force_sensors_count ?? 0),
  };
};

export const processReading = (
  reading: SensorReading,
  state: AggregationState,
): void => {
  const dateObj = new Date(reading.timestamp);
  const hour = dateObj.getUTCHours();
  if (typeof reading.temperature === 'number') {
    state.tempSeries[hour] =
      (state.tempSeries[hour] * state.tempCounts[hour] + reading.temperature) /
      (state.tempCounts[hour] + 1);
    state.tempCounts[hour] += 1;
  }
  if (typeof reading.alignment === 'number' && reading.alignment !== ALIGNMENT_ERROR) {
    state.alignSeries[hour] =
      (state.alignSeries[hour] * state.alignCounts[hour] + reading.alignment) /
      (state.alignCounts[hour] + 1);
    state.alignCounts[hour] += 1;
  }
  if (Array.isArray(reading.forceSensors) && reading.forceSensors.length > 0) {
    for (const fs of reading.forceSensors) {
      const sensor_id = fs.sensorID;
      if (sensor_id < 1 || sensor_id > NUM_FORCE_SENSORS) continue;
      const idx = sensor_id - 1;
      state.forceSensors[idx] =
        state.forceSensorsCount === 0
          ? fs.relativeForce
          : (state.forceSensors[idx] * state.forceSensorsCount +
              fs.relativeForce) /
            (state.forceSensorsCount + 1);
    }
    state.forceSensorsCount++;
  }
};

export const calculateAverage = (
  series: number[],
  counts: number[],
): number | null => {
  const sum = series.reduce((acc, val, i) => acc + val * counts[i], 0);
  const totalCount = counts.reduce((acc, val) => acc + val, 0);
  return totalCount > 0 ? Math.round(sum / totalCount) : null;
};
