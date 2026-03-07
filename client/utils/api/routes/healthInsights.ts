import api from '@/utils/api';

export const HEALTH_INSIGHTS_ENDPOINT = '/healthInsights';

export const getHealthInsights = async () =>
  await api.get(`${HEALTH_INSIGHTS_ENDPOINT}`);
