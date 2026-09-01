import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.controller";
import { categoriesRouter } from "./modules/categories/categories.controller";
import { transactionsRouter } from "./modules/transactions/transactions.controller";
import { budgetsRouter } from "./modules/budgets/budgets.controller";
import { recurringPaymentsRouter } from "./modules/recurring-payments/recurring-payments.controller";
import { goalsRouter } from "./modules/goals/goals.controller";
import { debtsRouter } from "./modules/debts/debts.controller";
import { referralsRouter } from "./modules/referrals/referrals.controller";
import { adminRouter } from "./modules/admin/admin.controller";
import { errorHandler, notFoundHandler } from "./common/error-handler";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/categories", categoriesRouter);
  app.use("/api/v1/transactions", transactionsRouter);
  app.use("/api/v1/budgets", budgetsRouter);
  app.use("/api/v1/recurring-payments", recurringPaymentsRouter);
  app.use("/api/v1/goals", goalsRouter);
  app.use("/api/v1/debts", debtsRouter);
  app.use("/api/v1/referrals", referralsRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
