import pool from '../db/pool.ts';

export const addInsole = async (
  user_id: number,
  insole_id: string,
  foot: string,
) => {
  const result = await pool.query(
    `INSERT INTO "Insole" (user_id, insole_id, foot)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [user_id, insole_id, foot],
  );
  return result.rows[0];
};

export const getInsoleById = async (user_id: number, insole_id: string) => {
  const result = await pool.query(
    `SELECT * FROM "Insole" WHERE user_id = $1 AND insole_id = $2;`,
    [user_id, insole_id],
  );
  const insole = result.rows[0] ?? null;
  if (insole && insole.user_id && insole.user_id !== user_id) {
    return null;
  }
  return insole;
};

export const getInsolesByUser = async (user_id: number) => {
  const result = await pool.query(
    `SELECT * FROM "Insole" WHERE user_id = $1;`,
    [user_id],
  );
  return result.rows;
};

export const removeInsole = async (user_id: number, insole_id: string) => {
  const result = await pool.query(
    `DELETE FROM "Insole" WHERE user_id = $1 AND insole_id = $2 RETURNING insole_id;`,
    [user_id, insole_id],
  );
  return result.rowCount > 0;
};
