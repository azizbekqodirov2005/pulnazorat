import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

export interface CategoryRow {
  id: string;
  user_id: string | null;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  is_system: boolean;
}

function toPublic(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    isSystem: row.is_system,
  };
}

export async function listCategories(userId: string) {
  const result = await pool.query<CategoryRow>(
    `SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL ORDER BY is_system DESC, name ASC`,
    [userId]
  );
  return result.rows.map(toPublic);
}

export async function createCategory(userId: string, input: { name: string; type: "income" | "expense"; icon?: string }) {
  const result = await pool.query<CategoryRow>(
    `INSERT INTO categories (user_id, name, type, icon, is_system)
     VALUES ($1, $2, $3, $4, false)
     RETURNING *`,
    [userId, input.name, input.type, input.icon ?? null]
  );
  return toPublic(result.rows[0]);
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: { name?: string; icon?: string }
) {
  const result = await pool.query<CategoryRow>(
    `UPDATE categories SET name = COALESCE($3, name), icon = COALESCE($4, icon)
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [categoryId, userId, input.name ?? null, input.icon ?? null]
  );
  if (!result.rows[0]) throw new NotFoundError("Kategoriya topilmadi yoki sizga tegishli emas");
  return toPublic(result.rows[0]);
}

export async function deleteCategory(userId: string, categoryId: string) {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2 AND is_system = false`,
    [categoryId, userId]
  );
  if (result.rowCount === 0) {
    throw new NotFoundError("Kategoriya topilmadi, sizga tegishli emas yoki tizim kategoriyasi");
  }
}
