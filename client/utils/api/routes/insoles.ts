import api from '@/utils/api';
import { FOOT_KEYS } from '@/constants/ble';

export const INSOLE_ENDPOINT = '/insoles';

export const getUserInsoles = async () => await api.get(`${INSOLE_ENDPOINT}`);

export const pairInsole = async (
  id: string,
  body: { foot: (typeof FOOT_KEYS)[number] },
) => await api.post(`${INSOLE_ENDPOINT}/${id}`, body);

export const getInsoleByID = async (id: string) =>
  await api.get(`${INSOLE_ENDPOINT}/${id}`);

export const unpairInsole = async (id: string) =>
  await api.delete(`${INSOLE_ENDPOINT}/${id}`);
