import { Router } from 'express';
import { getHealthInsights } from '../controllers/healthInsightController.ts';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const healthInsightRouter = Router();

healthInsightRouter.use(authenticateToken);

healthInsightRouter.get('/', getHealthInsights);

export default healthInsightRouter;
