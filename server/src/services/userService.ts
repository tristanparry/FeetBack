import bcrypt from 'bcrypt';
import pool from '../db/pool.ts';
import { generateAccessToken, generateRefreshToken } from './authService.ts';

const SALT_ROUNDS = 12;

export const userRegistration = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO "User" (email, password, name) VALUES ($1, $2, $3) RETURNING user_id, email, registered_at, profile_pic_uri, name, language, temp_unit;`,
    [email, hashedPassword, email.split('@')[0]],
  );
  const user = result.rows[0];
  const accessToken = generateAccessToken(user.user_id, user.email);
  const refreshToken = await generateRefreshToken(user.user_id, user.email);
  return { user, accessToken, refreshToken };
};

export const userLogin = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM "User" WHERE email = $1;`, [
    email,
  ]);
  const user = result.rows[0];
  if (!user) return null;
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return null;
  const accessToken = generateAccessToken(user.user_id, user.email);
  const refreshToken = await generateRefreshToken(user.user_id, user.email);
  return { user, accessToken, refreshToken };
};

export const getUserById = async (user_id: number) => {
  const result = await pool.query(
    `SELECT user_id, email, registered_at, profile_pic_uri, name, language, temp_unit FROM "User" WHERE user_id = $1;`,
    [user_id],
  );
  return result.rows[0] ?? null;
};

export const userUpdate = async (
  user_id: number,
  email?: string,
  password?: string,
  profile_pic_uri?: string,
  name?: string,
  language?: string,
  temp_unit?: string,
) => {
  const updates: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (email) {
    updates.push(`email = $${idx++}`);
    values.push(email);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    updates.push(`password = $${idx++}`);
    values.push(hashedPassword);
  }
  if (profile_pic_uri !== undefined) {
    updates.push(`"profile_pic_uri" = $${idx++}`);
    values.push(profile_pic_uri);
  }
  if (name !== undefined) {
    updates.push(`name = $${idx++}`);
    values.push(name);
  }
  if (language !== undefined) {
    updates.push(`language = $${idx++}`);
    values.push(language);
  }
  if (temp_unit !== undefined) {
    updates.push(`"temp_unit" = $${idx++}`);
    values.push(temp_unit);
  }
  if (updates.length === 0) return null;
  values.push(user_id);
  await pool.query(
    `UPDATE "User" SET ${updates.join(', ')} WHERE user_id = $${idx};`,
    values,
  );
  return getUserById(user_id);
};

export const userDeletion = async (user_id: number) => {
  const result = await pool.query(
    `DELETE FROM "User" WHERE user_id = $1 RETURNING user_id, email;`,
    [user_id],
  );
  return result.rows[0] ?? null;
};
