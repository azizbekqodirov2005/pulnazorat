import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth, requirePro } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as service from "./recurring-payments.service";

export const recurringPaymentsRouter = Router();
recurringPaymentsRouter.use(requireAuth, requirePro);

recurringPaymentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await service.list(req.auth!.userId));
  })
);

const createSchema = z.object({
  title: z.string().min(1).max(150),
  amount: z.number().positive(),
  dueDay: z.number().int().min(1).max(31),
  reminderDaysBefore: z.number().int().min(0).max(30).optional(),
});

recurringPaymentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    res.status(201).json(await service.create(req.auth!.userId, parsed.data));
  })
);

const updateSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  amount: z.number().positive().optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  reminderDaysBefore: z.number().int().min(0).max(30).optional(),
  isActive: z.boolean().optional(),
});

recurringPaymentsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("Noto'g'ri ma'lumot");
    res.json(await service.update(req.auth!.userId, req.params.id as string, parsed.data));
  })
);

recurringPaymentsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.remove(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
