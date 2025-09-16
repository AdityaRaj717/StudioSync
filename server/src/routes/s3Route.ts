import { Router } from "express";
import passport from "passport";
import { getPresignedUrl } from "../controllers/s3Controller.ts";

const router = Router();

router.post(
  "/presigned-url",
  passport.authenticate("jwt", { session: false }),
  getPresignedUrl
);

export default router;
