import passport from "passport";

import setupGoogle from "./strategies/google-login.ts";
import setupJWT from "./strategies/jwt.ts";

setupGoogle(passport);
setupJWT(passport);
