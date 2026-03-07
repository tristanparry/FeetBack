import { Router } from 'express';
import {
  getInsole,
  getUserInsoles,
  pairInsole,
  unpairInsole,
} from '../controllers/insoleController.ts';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const insoleRouter = Router();

insoleRouter.use(authenticateToken);

insoleRouter.get('/', getUserInsoles);
insoleRouter.route('/:id').post(pairInsole).get(getInsole).delete(unpairInsole);

export default insoleRouter;
