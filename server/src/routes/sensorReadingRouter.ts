import { Router } from 'express';
import {
  addSensorReadings,
  getDailySummary,
  getMonthSummary,
  getWeekSummary,
} from '../controllers/sensorReadingController.ts';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const sensorReadingRouter = Router();

sensorReadingRouter.use(authenticateToken);

sensorReadingRouter.post('/', addSensorReadings);
sensorReadingRouter.get('/day/:date', getDailySummary);
sensorReadingRouter.get('/week/:date', getWeekSummary);
sensorReadingRouter.get('/month/:year/:month', getMonthSummary);

export default sensorReadingRouter;
