import { pool } from "../../config/db";
import { NotFoundError } from "../../common/errors";

export interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  proViaReferral: number;
  proViaAdminGrant: number;
  totalReferredSignups: number;
  totalTransactions: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

export async function getStats(): Promise<AdminStats> {
  const [users, txCount] = await Promise.all([
    pool.query<{
      total: string;
      free: string;
      pro: string;
      pro_via_referral: string;
      pro_via_admin_grant: string;
      referred: string;
      last_7d: string;
      last_30d: string;
    }>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE plan = 'free')::int AS free,
         COUNT(*) FILTER (WHERE plan = 'pro')::int AS pro,
         COUNT(*) FILTER (WHERE plan = 'pro' AND pro_unlocked_via = 'referral')::int AS pro_via_referral,
         COUNT(*) FILTER (WHERE plan = 'pro' AND pro_unlocked_via = 'admin_grant')::int AS pro_via_admin_grant,
         COUNT(*) FILTER (WHERE referred_by IS NOT NULL)::int AS referred,
         COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last_7d,
         COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS last_30d
       FROM users`
    ),
    pool.query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM transactions`),
  ]);

  const row = users.rows[0];
  return {
    totalUsers: Number(row.total),
    freeUsers: Number(row.free),
    proUsers: Number(row.pro),
    proViaReferral: Number(row.pro_via_referral),
    proViaAdminGrant: Number(row.pro_via_admin_grant),
    totalReferredSignups: Number(row.referred),
    totalTransactions: Number(txCount.rows[0].count),
    newUsersLast7Days: Number(row.last_7d),
    newUsersLast30Days: Number(row.last_30d),
  };
}

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  plan: "free" | "pro";
  proUnlockedVia: string | null;
  role: "user" | "admin";
  referralCode: string;
  referredCount: number;
  createdAt: string;
}

export async function listUsers(params: { search?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const search = params.search?.trim();
  const values: unknown[] = [];
  let whereClause = "";
  if (search) {
    values.push(`%${search}%`);
    whereClause = `WHERE u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.phone ILIKE $${values.length}`;
  }

  values.push(pageSize, offset);
  const listResult = await pool.query<{
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    plan: "free" | "pro";
    pro_unlocked_via: string | null;
    role: "user" | "admin";
    referral_code: string;
    referred_count: string;
    created_at: string;
  }>(
    `SELECT u.id, u.full_name, u.email, u.phone, u.plan, u.pro_unlocked_via, u.role, u.referral_code, u.created_at,
            (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.id)::int AS referred_count
     FROM users u
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  const countValues = search ? [`%${search}%`] : [];
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM users u ${whereClause}`,
    countValues
  );

  const items: AdminUserRow[] = listResult.rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    plan: r.plan,
    proUnlockedVia: r.pro_unlocked_via,
    role: r.role,
    referralCode: r.referral_code,
    referredCount: Number(r.referred_count),
    createdAt: r.created_at,
  }));

  return { items, total: Number(countResult.rows[0].count), page, pageSize };
}

export async function grantPro(userId: string) {
  const result = await pool.query(
    `UPDATE users SET plan = 'pro', pro_unlocked_via = 'admin_grant', updated_at = now()
     WHERE id = $1 RETURNING id`,
    [userId]
  );
  if (result.rowCount === 0) throw new NotFoundError("Foydalanuvchi topilmadi");
}

export async function revokePro(userId: string) {
  const result = await pool.query(
    `UPDATE users SET plan = 'free', pro_unlocked_via = NULL, updated_at = now()
     WHERE id = $1 RETURNING id`,
    [userId]
  );
  if (result.rowCount === 0) throw new NotFoundError("Foydalanuvchi topilmadi");
}
