import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as transactionsService from "./transactions.service";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

const listQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

transactionsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError("Noto'g'ri filtr parametrlari");
    const result = await transactionsService.listTransactions(req.auth!.userId, parsed.data);
    res.json(result);
  })
);

const summaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month format: YYYY-MM"),
});

transactionsRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const parsed = summaryQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError("month=YYYY-MM formatida bo'lishi kerak");
    const result = await transactionsService.getSummary(req.auth!.userId, parsed.data.month);
    res.json(result);
  })
);

const notFutureDate = (val: string) => val <= new Date().toISOString().slice(0, 10);

const createSchema = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  note: z.string().max(500).optional(),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "occurredOn format: YYYY-MM-DD")
    .refine(notFutureDate, "Kelajakdagi sana kiritib bo'lmaydi"),
});

transactionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    const transaction = await transactionsService.createTransaction(req.auth!.userId, parsed.data);
    res.status(201).json(transaction);
  })
);

transactionsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const transaction = await transactionsService.getTransaction(req.auth!.userId, req.params.id as string);
    res.json(transaction);
  })
);

const updateSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  note: z.string().max(500).optional(),
  occurredOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(notFutureDate, "Kelajakdagi sana kiritib bo'lmaydi")
    .optional(),
});

transactionsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    const transaction = await transactionsService.updateTransaction(req.auth!.userId, req.params.id as string, parsed.data);
    res.json(transaction);
  })
);

transactionsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await transactionsService.deleteTransaction(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
