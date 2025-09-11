import { Router } from "express";
import passport from "passport";
import authController from "../controllers/authController.ts";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate(
    "google",
    { session: false },
    authController.googleCallback
  )
);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }, authController.getUser)
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax" });
  res.status(200).json({ message: "logged out successfully" });
});

export default router;
