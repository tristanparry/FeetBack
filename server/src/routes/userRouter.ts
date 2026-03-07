import { Router } from 'express';
import {
  deleteUser,
  getUser,
  loginUser,
  logoutUser,
  putUser,
  refreshToken,
  registerUser,
} from '../controllers/userController.ts';
import { authenticateToken } from '../middleware/authMiddleware.ts';

const userRouter = Router();

userRouter.post('/', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh', refreshToken);
userRouter.post('/logout', logoutUser);

userRouter.use(authenticateToken);

userRouter.route('/me').get(getUser).put(putUser).delete(deleteUser);

export default userRouter;
