import User from "../../model/User.ts";
import { Strategy as googleStrategy } from "passport-google-oauth20";

export default function googleAuth(passport) {
  console.log(process.env.GOOGLE_CLIENT_ID);
  console.log(process.env.GOOGLE_CLIENT_SECRET);
  console.log(process.env.PORT);
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await User.findOneAndUpdate(
            {
              googleId: profile?.id,
            },
            {
              name: profile.displayName,
              email: profile.emails[0].value,
              picture: profile.photos[0].value,
            },
            {
              upsert: true,
              new: true,
            }
          );
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}
