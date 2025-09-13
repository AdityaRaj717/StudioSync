import { Strategy as LocalStrategy } from "passport-local";
import User from "../../model/User.ts";

export default function (passport: any) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });

          if (!user) {
            return done(null, false, { message: `Email ${email} not found.` });
          }
          if (!user.password) {
            return done(null, false, { message: "Login with Google instead." });
          }

          const isMatch = await user.comparePassword(password);

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect." });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
