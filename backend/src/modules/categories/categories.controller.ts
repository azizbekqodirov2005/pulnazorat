import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as categoriesService from "./categories.service";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await categoriesService.listCategories(req.auth!.userId);
    res.json(categories);
  })
);

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["income", "expense"]),
  icon: z.string().max(50).optional(),
});

categoriesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    const category = await categoriesService.createCategory(req.auth!.userId, parsed.data);
    res.status(201).json(category);
  })
);

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional(),
});

categoriesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("Noto'g'ri ma'lumot");
    const category = await categoriesService.updateCategory(req.auth!.userId, req.params.id as string, parsed.data);
    res.json(category);
  })
);

categoriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await categoriesService.deleteCategory(req.auth!.userId, req.params.id as string);
    res.status(204).send();
  })
);
