import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth, requirePro } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as service from "./debts.service";

export const debtsRouter = Router();
debtsRouter.use(requireAuth, requirePro);

debtsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await service.list(req.auth!.userId));
  })
);

const createSchema = z.object({
  personName: z.string().min(1).max(150),
  direction: z.enum(["owed_to_me", "i_owe"]),
  amount: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

debtsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    res.status(201).json(await service.create(req.auth!.userId, parsed.data));
  })
);

debtsRouter.patch(
  "/:id/close",
  asyncHandler(async (req, res) => {
    res.json(await service.close(req.auth!.userId, req.params.id as string));
  })
);

debtsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await service.remove(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
