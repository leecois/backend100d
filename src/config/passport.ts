import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { MemberModel } from "../db/members";
import { authentication, random } from "../helpers";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        let member = await MemberModel.findOne({ googleId: profile.id });
        if (!member) {
          const salt = random();
          const sessionToken = authentication(salt, profile.id); // Generate session token

          member = await MemberModel.create({
            googleId: profile.id,
            membername: profile.displayName,
            email: profile.emails[0].value,
            isAdmin: false, // default to false or handle based on your logic
            authentication: {
              salt: salt,
              sessionToken: sessionToken,
            },
          });
        } else {
          const salt = random();
          if (member.authentication) {
            member.authentication.sessionToken = authentication(
              salt,
              member._id.toString()
            );
            await member.save();
          }
        }

        // Set the session token as a cookie in the response
        done(null, member);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((member: any, done: any) => {
  done(null, member.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const member = await MemberModel.findById(id);
    done(null, member);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
