import { Router } from "express";
import { asyncHandler } from "../../common/error-handler";
import { requireAuth } from "../../common/auth-middleware";
import * as referralsService from "./referrals.service";

export const referralsRouter = Router();

referralsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = await referralsService.getReferralStatus(req.auth!.userId);
    res.json(status);
  })
);
