import pool from '../db/pool.ts';
import { getDaysInRange } from '../utils/dates.ts';
import {
  AggregationState,
  SensorReading,
  calculateAverage,
  initializeAggregationState,
  processReading,
} from '../utils/sensorReadingUtils.ts';

const saveAggregationState = async (
  client: any,
  user_id: number,
  insole_id: string,
  day: string,
  state: AggregationState,
  isUpdate: boolean,
): Promise<void> => {
  const params = [
    user_id,
    insole_id,
    day,
    calculateAverage(state.tempSeries, state.tempCounts),
    calculateAverage(state.alignSeries, state.alignCounts),
    JSON.stringify(state.tempSeries),
    JSON.stringify(state.tempCounts),
    JSON.stringify(state.alignSeries),
    JSON.stringify(state.alignCounts),
    JSON.stringify(state.forceSensors),
    state.forceSensorsCount,
  ];
  if (isUpdate) {
    await client.query(
      `UPDATE "SensorReading"
       SET avg_temperature = $4,
           avg_alignment = $5,
           temperature_series = $6,
           temperature_counts = $7,
           alignment_series = $8,
           alignment_counts = $9,
           force_sensors = $10,
           force_sensors_count = $11
       WHERE user_id = $1 AND insole_id = $2 AND date = $3`,
      params,
    );
  } else {
    await client.query(
      `INSERT INTO "SensorReading"
       (user_id, insole_id, date, avg_temperature, avg_alignment,
        temperature_series, temperature_counts, alignment_series, alignment_counts,
        force_sensors, force_sensors_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      params,
    );
  }
};

export const insertReadingsAndAggregate = async (
  user_id: number,
  insole_id: string,
  readings: SensorReading[],
) => {
  const client = await pool.connect();
  try {
    const readingsByDay: Record<string, SensorReading[]> = {};
    for (const r of readings) {
      const day = new Date(r.timestamp).toISOString().slice(0, 10);
      if (!readingsByDay[day]) readingsByDay[day] = [];
      readingsByDay[day].push(r);
    }
    await client.query('BEGIN');
    for (const [day, dayReadings] of Object.entries(readingsByDay)) {
      const selectRes = await client.query(
        `SELECT avg_temperature, avg_alignment,
                temperature_series, temperature_counts,
                alignment_series, alignment_counts,
                force_sensors, force_sensors_count
         FROM "SensorReading"
         WHERE user_id = $1 AND insole_id = $2 AND date = $3
         FOR UPDATE`,
        [user_id, insole_id, day],
      );

      const existingRow = selectRes.rows[0];
      const state = initializeAggregationState(existingRow);
      dayReadings.forEach((reading) => processReading(reading, state));
      await saveAggregationState(
        client,
        user_id,
        insole_id,
        day,
        state,
        !!existingRow,
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const fetchDailySummary = async (
  user_id: number,
  insole_id: string,
  day: string,
) => {
  const result = await pool.query(
    `SELECT date, avg_temperature, avg_alignment, temperature_series, alignment_series, force_sensors
     FROM "SensorReading"
     WHERE user_id = $1 AND insole_id = $2 AND date = $3`,
    [user_id, insole_id, day],
  );
  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    date: r.date,
    avg_temperature: r.avg_temperature ?? null,
    avg_alignment: r.avg_alignment ?? null,
    temperature_series: r.temperature_series ?? [],
    alignment_series: r.alignment_series ?? [],
    force_sensors: r.force_sensors ?? {},
  };
};

export const fetchRangeSummaries = async (
  user_id: number,
  insole_id: string,
  start: string,
  end: string,
) => {
  const result = await pool.query(
    `SELECT date, avg_temperature, avg_alignment, temperature_series, alignment_series, force_sensors
     FROM "SensorReading"
     WHERE user_id = $1 AND insole_id = $2
       AND date >= $3::date AND date <= $4::date
     ORDER BY date ASC
     LIMIT $5`,
    [user_id, insole_id, start, end, getDaysInRange(start, end)],
  );
  return result.rows.map((r) => ({
    date: r.date,
    avg_temperature: r.avg_temperature ?? null,
    avg_alignment: r.avg_alignment ?? null,
    temperature_series: r.temperature_series ?? [],
    alignment_series: r.alignment_series ?? [],
    force_sensors: r.force_sensors ?? {},
  }));
};
