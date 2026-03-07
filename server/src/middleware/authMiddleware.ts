import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  user_id: number;
  email: string;
}

export const authenticateToken = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer token
  if (!token) {
    console.info(
      `Auth rejected: missing token for ${req.method} ${req.originalUrl}`,
    );
    return res.status(401).json({ error: 'Missing JWT token.' });
  }
  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        console.info(
          `Auth rejected: expired token for ${req.method} ${req.originalUrl}`,
        );
        return res.status(401).json({ error: 'JWT token expired.' });
      } else {
        console.info(
          `Auth rejected: invalid token for ${req.method} ${req.originalUrl}`,
        );
        return res.status(403).json({ error: 'Invalid JWT token.' });
      }
    }
    req.user = decoded as JwtPayload;
    next();
  });
};
