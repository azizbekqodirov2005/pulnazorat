import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth, requirePro } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as budgetsService from "./budgets.service";

export const budgetsRouter = Router();
budgetsRouter.use(requireAuth, requirePro);

budgetsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const period = typeof req.query.month === "string" ? req.query.month : undefined;
    const budgets = await budgetsService.listBudgets(req.auth!.userId, period);
    res.json(budgets);
  })
);

const createSchema = z.object({
  categoryId: z.string().uuid(),
  limitAmount: z.number().positive(),
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/, "periodMonth format: YYYY-MM"),
});

budgetsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    const budget = await budgetsService.createBudget(req.auth!.userId, parsed.data);
    res.status(201).json(budget);
  })
);

const updateSchema = z.object({ limitAmount: z.number().positive() });

budgetsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("Noto'g'ri ma'lumot");
    const budget = await budgetsService.updateBudget(req.auth!.userId, req.params.id as string, parsed.data.limitAmount);
    res.json(budget);
  })
);

budgetsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await budgetsService.deleteBudget(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
