import { pool } from "../../config/db";
import { ConflictError, NotFoundError } from "../../common/errors";

interface BudgetRow {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: string;
  period_month: string | Date;
}

function firstOfMonth(period: string): string {
  // period: "YYYY-MM" -> "YYYY-MM-01"
  return `${period}-01`;
}

async function withSpent(userId: string, row: BudgetRow) {
  const spentResult = await pool.query<{ spent: string }>(
    `SELECT COALESCE(SUM(amount), 0) as spent
     FROM transactions
     WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
       AND to_char(occurred_on, 'YYYY-MM') = to_char($3::date, 'YYYY-MM')`,
    [userId, row.category_id, row.period_month]
  );
  const periodMonth =
    row.period_month instanceof Date
      ? `${row.period_month.getUTCFullYear()}-${String(row.period_month.getUTCMonth() + 1).padStart(2, "0")}`
      : String(row.period_month).slice(0, 7);

  return {
    id: row.id,
    categoryId: row.category_id,
    limitAmount: Number(row.limit_amount),
    periodMonth,
    spent: Number(spentResult.rows[0].spent),
  };
}

export async function listBudgets(userId: string, periodMonth?: string) {
  const values: unknown[] = [userId];
  let where = "user_id = $1";
  if (periodMonth) {
    values.push(firstOfMonth(periodMonth));
    where += ` AND to_char(period_month, 'YYYY-MM') = to_char($2::date, 'YYYY-MM')`;
  }
  const result = await pool.query<BudgetRow>(
    `SELECT * FROM budgets WHERE ${where} ORDER BY period_month DESC`,
    values
  );
  return Promise.all(result.rows.map((row) => withSpent(userId, row)));
}

export interface CreateBudgetInput {
  categoryId: string;
  limitAmount: number;
  periodMonth: string; // YYYY-MM
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  try {
    const result = await pool.query<BudgetRow>(
      `INSERT INTO budgets (user_id, category_id, limit_amount, period_month)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, input.categoryId, input.limitAmount, firstOfMonth(input.periodMonth)]
    );
    return withSpent(userId, result.rows[0]);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
      throw new ConflictError("Bu kategoriya uchun shu oyda byudjet allaqachon mavjud");
    }
    throw err;
  }
}

export async function updateBudget(userId: string, id: string, limitAmount: number) {
  const result = await pool.query<BudgetRow>(
    `UPDATE budgets SET limit_amount = $3 WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, limitAmount]
  );
  if (!result.rows[0]) throw new NotFoundError("Byudjet topilmadi");
  return withSpent(userId, result.rows[0]);
}

export async function deleteBudget(userId: string, id: string) {
  const result = await pool.query(`DELETE FROM budgets WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Byudjet topilmadi");
}
