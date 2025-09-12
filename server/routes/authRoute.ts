import { Router } from "express";
import passport from "passport";
import {
  getUser,
  googleCallback,
  signupUser,
  loginUser,
} from "../controllers/authController.ts";

const router = Router();

router.post("/signup", signupUser);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  loginUser
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

router.get("/user", passport.authenticate("jwt", { session: false }), getUser);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax" });
  res.status(200).json({ message: "logged out successfully" });
});

export default router;
