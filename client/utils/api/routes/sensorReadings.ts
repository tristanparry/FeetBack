import { DeviceInfo } from '@/types/ble';
import api from '@/utils/api';

export const SENSOR_READING_ENDPOINT = '/sensorReadings';

export const addSensorReadings = async (
  insoleID: DeviceInfo['serial'],
  readings: any[],
) =>
  await api.post(`${SENSOR_READING_ENDPOINT}?insole_id=${insoleID}`, {
    readings,
  });

export const getDailySummary = async (
  insoleID: DeviceInfo['serial'],
  date: string,
) =>
  await api.get(`${SENSOR_READING_ENDPOINT}/day/${date}?insole_id=${insoleID}`);

export const getWeekSummary = async (
  insoleID: DeviceInfo['serial'],
  date: string,
) =>
  await api.get(
    `${SENSOR_READING_ENDPOINT}/week/${date}?insole_id=${insoleID}`,
  );

export const getMonthSummary = async (
  insoleID: DeviceInfo['serial'],
  year: number,
  month: number,
) =>
  await api.get(
    `${SENSOR_READING_ENDPOINT}/month/${year}/${month}?insole_id=${insoleID}`,
  );
