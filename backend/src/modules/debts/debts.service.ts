import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

interface DebtRow {
  id: string;
  user_id: string;
  person_name: string;
  direction: "owed_to_me" | "i_owe";
  amount: string;
  due_date: string | null;
  status: "open" | "closed";
}

function toPublic(row: DebtRow) {
  return {
    id: row.id,
    personName: row.person_name,
    direction: row.direction,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
  };
}

export async function list(userId: string) {
  const result = await pool.query<DebtRow>(
    `SELECT * FROM debts WHERE user_id = $1 ORDER BY status ASC, due_date ASC NULLS LAST, created_at DESC`,
    [userId]
  );
  return result.rows.map(toPublic);
}

export interface CreateInput {
  personName: string;
  direction: "owed_to_me" | "i_owe";
  amount: number;
  dueDate?: string;
}

export async function create(userId: string, input: CreateInput) {
  const result = await pool.query<DebtRow>(
    `INSERT INTO debts (user_id, person_name, direction, amount, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, input.personName, input.direction, input.amount, input.dueDate ?? null]
  );
  return toPublic(result.rows[0]);
}

export interface UpdateInput {
  personName?: string;
  direction?: "owed_to_me" | "i_owe";
  amount?: number;
  dueDate?: string;
}

export async function update(userId: string, id: string, input: UpdateInput) {
  const result = await pool.query<DebtRow>(
    `UPDATE debts
     SET person_name = COALESCE($3, person_name),
         direction = COALESCE($4, direction),
         amount = COALESCE($5, amount),
         due_date = COALESCE($6, due_date)
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, input.personName ?? null, input.direction ?? null, input.amount ?? null, input.dueDate ?? null]
  );
  if (!result.rows[0]) throw new NotFoundError("Qarz topilmadi");
  return toPublic(result.rows[0]);
}

export async function close(userId: string, id: string) {
  const result = await pool.query<DebtRow>(
    `UPDATE debts SET status = 'closed' WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  if (!result.rows[0]) throw new NotFoundError("Qarz topilmadi");
  return toPublic(result.rows[0]);
}

export async function remove(userId: string, id: string) {
  const result = await pool.query(`DELETE FROM debts WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Qarz topilmadi");
}
