import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth } from "../../common/auth-middleware";
import { ValidationError } from "../../common/errors";
import * as authService from "./auth.service";

export const authRouter = Router();

const registerSchema = z
  .object({
    fullName: z.string().min(2).max(150),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(6).max(100),
    referralCode: z.string().min(4).max(12).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email yoki telefon raqamidan kamida bittasi kerak",
  });

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    }
    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  })
);

const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    }
    const result = await authService.login(parsed.data);
    res.json(result);
  })
);

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("refreshToken kerak");
    }
    const userId = authService.refreshAccessToken(parsed.data.refreshToken);
    const user = await authService.getUserById(userId);
    if (!user) throw new ValidationError("Foydalanuvchi topilmadi");
    res.json({ userId, plan: user.plan });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.auth!.userId);
    res.json(user);
  })
);

const updateMeSchema = z.object({
  fullName: z.string().min(2).max(150),
});

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    const user = await authService.updateProfile(req.auth!.userId, parsed.data.fullName);
    res.json(user);
  })
);

const forgotPasswordSchema = z.object({ email: z.string().email() });

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("To'g'ri email kiriting");
    await authService.requestPasswordReset(parsed.data.email);
    // Email topilmasa ham har doim bir xil javob — kim ro'yxatdan o'tganini bilib olishning oldini olish uchun
    res.json({ ok: true });
  })
);

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6).max(100),
});

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Noto'g'ri ma'lumot");
    await authService.resetPassword(parsed.data.email, parsed.data.code, parsed.data.newPassword);
    res.json({ ok: true });
  })
);
