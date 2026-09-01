import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

export interface TransactionRow {
  id: string;
  user_id: string;
  category_id: string;
  type: "income" | "expense";
  amount: string;
  note: string | null;
  occurred_on: string;
  created_at: string;
}

function toPublic(row: TransactionRow) {
  return {
    id: row.id,
    categoryId: row.category_id,
    type: row.type,
    amount: Number(row.amount),
    note: row.note,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
  };
}

export interface ListFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  type?: "income" | "expense";
  page: number;
  pageSize: number;
}

export async function listTransactions(userId: string, filters: ListFilters) {
  const conditions: string[] = ["user_id = $1"];
  const values: unknown[] = [userId];

  if (filters.from) {
    values.push(filters.from);
    conditions.push(`occurred_on >= $${values.length}`);
  }
  if (filters.to) {
    values.push(filters.to);
    conditions.push(`occurred_on <= $${values.length}`);
  }
  if (filters.categoryId) {
    values.push(filters.categoryId);
    conditions.push(`category_id = $${values.length}`);
  }
  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");
  const offset = (filters.page - 1) * filters.pageSize;

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM transactions WHERE ${whereClause}`,
    values
  );

  values.push(filters.pageSize, offset);
  const listResult = await pool.query<TransactionRow>(
    `SELECT * FROM transactions WHERE ${whereClause}
     ORDER BY occurred_on DESC, created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    items: listResult.rows.map(toPublic),
    total: Number(countResult.rows[0].count),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export interface CreateInput {
  categoryId: string;
  type: "income" | "expense";
  amount: number;
  note?: string;
  occurredOn: string;
}

export async function createTransaction(userId: string, input: CreateInput) {
  const result = await pool.query<TransactionRow>(
    `INSERT INTO transactions (user_id, category_id, type, amount, note, occurred_on)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, input.categoryId, input.type, input.amount, input.note ?? null, input.occurredOn]
  );
  return toPublic(result.rows[0]);
}

export async function getTransaction(userId: string, id: string) {
  const result = await pool.query<TransactionRow>(
    `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!result.rows[0]) throw new NotFoundError("Tranzaksiya topilmadi");
  return toPublic(result.rows[0]);
}

export interface UpdateInput {
  categoryId?: string;
  amount?: number;
  note?: string;
  occurredOn?: string;
}

export async function updateTransaction(userId: string, id: string, input: UpdateInput) {
  const result = await pool.query<TransactionRow>(
    `UPDATE transactions
     SET category_id = COALESCE($3, category_id),
         amount = COALESCE($4, amount),
         note = COALESCE($5, note),
         occurred_on = COALESCE($6, occurred_on),
         updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, input.categoryId ?? null, input.amount ?? null, input.note ?? null, input.occurredOn ?? null]
  );
  if (!result.rows[0]) throw new NotFoundError("Tranzaksiya topilmadi");
  return toPublic(result.rows[0]);
}

export async function deleteTransaction(userId: string, id: string) {
  const result = await pool.query(`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, [id, userId]);
  if (result.rowCount === 0) throw new NotFoundError("Tranzaksiya topilmadi");
}

export async function getSummary(userId: string, month: string) {
  // month format: YYYY-MM
  const totalsResult = await pool.query<{ type: "income" | "expense"; total: string }>(
    `SELECT type, COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE user_id = $1 AND to_char(occurred_on, 'YYYY-MM') = $2
     GROUP BY type`,
    [userId, month]
  );

  const byCategoryResult = await pool.query<{ category_id: string; name: string; total: string }>(
    `SELECT t.category_id, c.name, COALESCE(SUM(t.amount), 0) as total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.user_id = $1 AND t.type = 'expense' AND to_char(t.occurred_on, 'YYYY-MM') = $2
     GROUP BY t.category_id, c.name
     ORDER BY total DESC`,
    [userId, month]
  );

  const income = Number(totalsResult.rows.find((r) => r.type === "income")?.total ?? 0);
  const expense = Number(totalsResult.rows.find((r) => r.type === "expense")?.total ?? 0);

  return {
    month,
    income,
    expense,
    balance: income - expense,
    byCategory: byCategoryResult.rows.map((r) => ({
      categoryId: r.category_id,
      name: r.name,
      total: Number(r.total),
    })),
  };
}
