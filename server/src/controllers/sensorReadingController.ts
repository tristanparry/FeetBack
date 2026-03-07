import { Request, Response } from 'express';
import {
  fetchDailySummary,
  fetchRangeSummaries,
  insertReadingsAndAggregate,
} from '../services/sensorReadingService.ts';
import { getStartEndOfMonth, getStartEndOfWeek } from '../utils/dates.ts';

export const addSensorReadings = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const insole_id = req.query?.insole_id as string;
    const { readings } = req.body;
    if (
      !user_id ||
      !insole_id ||
      !Array.isArray(readings) ||
      readings.length === 0
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    await insertReadingsAndAggregate(user_id, insole_id, readings);
    console.info(
      `Sensor readings ingested: user_id=${user_id}, insole_id=${insole_id}, count=${readings.length}`,
    );
    res.status(201).json({ message: 'Sensor reading saved.' });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getDailySummary = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const insole_id = req.query?.insole_id as string;
    const date = req.params?.date as string;
    if (!user_id || !insole_id || !date) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const row = await fetchDailySummary(user_id, insole_id, date);
    if (!row) return res.status(404).json({ error: 'No data.' });
    res.json(row);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const getWeekSummary = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const insole_id = req.query?.insole_id as string;
    const date = req.params?.date as string;
    if (!user_id || !insole_id || !date) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const { start, end } = getStartEndOfWeek(date);
    const rows = await fetchRangeSummaries(user_id, insole_id, start, end);
    return res.json(rows);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Server error.' });
  }
};

export const getMonthSummary = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const insole_id = req.query?.insole_id as string;
    const { year, month } = req.params ?? {};
    if (!user_id || !insole_id || !year || !month) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const { start, end } = getStartEndOfMonth(Number(year), Number(month));
    const rows = await fetchRangeSummaries(user_id, insole_id, start, end);
    return res.json(rows);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Server error.' });
  }
};
