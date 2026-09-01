import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth, requirePro } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as service from "./goals.service";

export const goalsRouter = Router();
goalsRouter.use(requireAuth, requirePro);

goalsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await service.list(req.auth!.userId));
  })
);

const createSchema = z.object({
  title: z.string().min(1).max(150),
  targetAmount: z.number().positive(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

goalsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    res.status(201).json(await service.create(req.auth!.userId, parsed.data));
  })
);

const contributeSchema = z.object({ amount: z.number().positive() });

goalsRouter.patch(
  "/:id/contribute",
  asyncHandler(async (req, res) => {
    const parsed = contributeSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("Noto'g'ri summa");
    res.json(await service.contribute(req.auth!.userId, req.params.id as string, parsed.data.amount));
  })
);

goalsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.remove(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
