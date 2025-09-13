import passport from "passport";

import setupGoogle from "./strategies/google-login.ts";
import setupJWT from "./strategies/jwt.ts";
import setupLocal from "./strategies/local-strategy.ts";

setupGoogle(passport);
setupJWT(passport);
setupLocal(passport);
