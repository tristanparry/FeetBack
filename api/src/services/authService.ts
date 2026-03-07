import jwt from 'jsonwebtoken';
import pool from '../db/pool.ts';

export const generateAccessToken = (user_id: number, email: string) => {
  return jwt.sign({ user_id, email }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: `${Number(process.env.JWT_ACCESS_EXPIRY)}m`,
  });
};

export const generateRefreshToken = async (user_id: number, email: string) => {
  const token = jwt.sign(
    { user_id, email },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: `${Number(process.env.JWT_REFRESH_EXPIRY)}d`,
    },
  );
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + Number(process.env.JWT_REFRESH_EXPIRY),
  );
  await pool.query(
    'INSERT INTO "RefreshToken" (user_id, token, expires_at) VALUES ($1, $2, $3);',
    [user_id, token, expiresAt],
  );
  return token;
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as {
      user_id: number;
      email: string;
    };
    const result = await pool.query(
      'SELECT * FROM "RefreshToken" WHERE token = $1 AND user_id = $2;',
      [token, decoded.user_id],
    );
    if (result.rows.length === 0) {
      throw new Error('Refresh token not found or revoked');
    }
    return decoded;
  } catch (err) {
    throw new Error('Invalid/expired refresh token');
  }
};

export const revokeRefreshToken = async (token: string) => {
  await pool.query('DELETE FROM "RefreshToken" WHERE token = $1;', [token]);
};
