import { Router } from "express";
import passport from "passport";
import { getUserSessions } from "../controllers/sessionController.ts";

const router = Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getUserSessions
);

export default router;
