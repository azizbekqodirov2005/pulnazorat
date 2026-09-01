import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth, requireAdmin } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as adminService from "./admin.service";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await adminService.getStats();
    res.json(stats);
  })
);

const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError("Noto'g'ri so'rov parametrlari");
    }
    const result = await adminService.listUsers(parsed.data);
    res.json(result);
  })
);

adminRouter.post(
  "/users/:id/grant-pro",
  asyncHandler(async (req, res) => {
    await adminService.grantPro(req.params.id as string);
    res.status(204).send();
  })
);

adminRouter.post(
  "/users/:id/revoke-pro",
  asyncHandler(async (req, res) => {
    await adminService.revokePro(req.params.id as string);
    res.status(204).send();
  })
);
