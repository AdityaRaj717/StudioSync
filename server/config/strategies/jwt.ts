import User from "../../model/User.ts";
import { Strategy as JwtStrategy } from "passport-jwt";

const cookieExtractor = (req: Request) => req.cookies?.token;

export default function jwtAuth(passport) {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET as string,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.sub);
          if (user) done(null, user);
          else done(null, false);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}
