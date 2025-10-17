/* eslint-disable @typescript-eslint/no-explicit-any */
import bcryptjs from 'bcryptjs';
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { AuthProvider, Role } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import { envVars } from './env';

// local strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email: string, password: string, done: (error: any, user?: false | Express.User | undefined, options?: IVerifyOptions) => void) => {
  try {
    const isUserExist = await User.findOne({ email }).select('+password');

    if (!isUserExist) {
      return done(null, false, { message: "No User Found." });
    }

    const isGoogleAuthenticated = isUserExist.auths?.some((providerObject) => providerObject.provider === AuthProvider.GOOGLE);

    if (isGoogleAuthenticated && !isUserExist.password) {
      return done(null, false, { message: "You are already authenticated through google. If you want to login with credentials, then first login with google and set a password with your gmail and then login with email and password." });
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);

    if (!isPasswordMatched) {
      return done(null, false, { message: "Incorrect Password." })
    }

    return done(null, isUserExist);

  } catch (error) {
    console.log("Local Passport Login:", error);
    return done(error);
  }
}));

// google strategy
passport.use(new GoogleStrategy({
  clientID: envVars.GOOGLE_CLIENT_ID,
  clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  callbackURL: envVars.GOOGLE_CALLBACK_URL
},
  async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
      const email = profile.emails?.[0].value;

      if (!email) {
        return done(null, false, { message: "No Email Found." })
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          email,
          name: profile.displayName,
          profilePhoto: profile.photos?.[0].value,
          isVerified: profile.emails?.[0].verified,
          role: Role.USER,
          auths: [{ provider: AuthProvider.GOOGLE, providerId: profile.id }],
        })
      }

      return done(null, user);

    } catch (error: any) {
      console.log("Google Strategy Error:", error);
      return done(error);
    }
  }
));

// serialize user session
passport.serializeUser((user: Express.User | any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
})

// deserialize user session
passport.deserializeUser(async (id: any, done: (err: any, user?: Express.User | false | null) => void) => {
  try {
    const user = await User.findById(id);

    done(null, user);

  } catch (error) {
    console.log(error);
    done(error);
  }
})