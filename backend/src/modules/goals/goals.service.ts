import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null;
  status: "active" | "achieved" | "cancelled";
}

function toPublic(row: GoalRow) {
  return {
    id: row.id,
    title: row.title,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline,
    status: row.status,
  };
}

export async function list(userId: string) {
  const result = await pool.query<GoalRow>(
    `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map(toPublic);
}

export interface CreateInput {
  title: string;
  targetAmount: number;
  deadline?: string;
}

export async function create(userId: string, input: CreateInput) {
  const result = await pool.query<GoalRow>(
    `INSERT INTO goals (user_id, title, target_amount, deadline)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, input.title, input.targetAmount, input.deadline ?? null]
  );
  return toPublic(result.rows[0]);
}

export async function remove(userId: string, id: string) {
  const result = await pool.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Maqsad topilmadi");
}

export async function contribute(userId: string, id: string, amount: number) {
  const result = await pool.query<GoalRow>(
    `UPDATE goals
     SET current_amount = current_amount + $3,
         status = CASE WHEN current_amount + $3 >= target_amount THEN 'achieved' ELSE status END
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, amount]
  );
  if (!result.rows[0]) throw new NotFoundError("Maqsad topilmadi");
  return toPublic(result.rows[0]);
}
