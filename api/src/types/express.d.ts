import { JwtPayload } from '../middleware/authMiddleware.ts';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
