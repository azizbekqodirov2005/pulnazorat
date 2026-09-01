import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

interface RecurringRow {
  id: string;
  user_id: string;
  title: string;
  amount: string;
  due_day: number;
  reminder_days_before: number;
  is_active: boolean;
}

function toPublic(row: RecurringRow) {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    dueDay: row.due_day,
    reminderDaysBefore: row.reminder_days_before,
    isActive: row.is_active,
  };
}

export async function list(userId: string) {
  const result = await pool.query<RecurringRow>(
    `SELECT * FROM recurring_payments WHERE user_id = $1 ORDER BY due_day ASC`,
    [userId]
  );
  return result.rows.map(toPublic);
}

export interface CreateInput {
  title: string;
  amount: number;
  dueDay: number;
  reminderDaysBefore?: number;
}

export async function create(userId: string, input: CreateInput) {
  const result = await pool.query<RecurringRow>(
    `INSERT INTO recurring_payments (user_id, title, amount, due_day, reminder_days_before)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, input.title, input.amount, input.dueDay, input.reminderDaysBefore ?? 1]
  );
  return toPublic(result.rows[0]);
}

export interface UpdateInput {
  title?: string;
  amount?: number;
  dueDay?: number;
  reminderDaysBefore?: number;
  isActive?: boolean;
}

export async function update(userId: string, id: string, input: UpdateInput) {
  const result = await pool.query<RecurringRow>(
    `UPDATE recurring_payments
     SET title = COALESCE($3, title),
         amount = COALESCE($4, amount),
         due_day = COALESCE($5, due_day),
         reminder_days_before = COALESCE($6, reminder_days_before),
         is_active = COALESCE($7, is_active)
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [
      id,
      userId,
      input.title ?? null,
      input.amount ?? null,
      input.dueDay ?? null,
      input.reminderDaysBefore ?? null,
      input.isActive ?? null,
    ]
  );
  if (!result.rows[0]) throw new NotFoundError("Takrorlanuvchi to'lov topilmadi");
  return toPublic(result.rows[0]);
}

export async function remove(userId: string, id: string) {
  const result = await pool.query(`DELETE FROM recurring_payments WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Takrorlanuvchi to'lov topilmadi");
}
