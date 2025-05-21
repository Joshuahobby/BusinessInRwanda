import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import * as crypto from "crypto";
import { storage } from "./storage";
import { userRoleEnum } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";

// Configure session storage with PostgreSQL
export function getSessionConfig() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return {
    secret: process.env.SESSION_SECRET || "rwanda-jobs-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  };
}

/**
 * Common function to handle social login
 * Creates or updates a user based on profile data
 */
async function handleSocialLogin(
  profile: any, 
  done: (error: any, user?: any, info?: any) => void
) {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(null, false, { message: "Email not available from the provider" });
    }

    // Check if user exists by email
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || '';
      const lastName = profile.name?.familyName || 
                      (profile.displayName?.split(' ').length > 1 
                        ? profile.displayName?.split(' ').slice(1).join(' ') 
                        : '');
      
      user = await storage.createUser({
        email,
        password: crypto.randomBytes(32).toString('hex'), // Generate random password for social accounts
        fullName: `${firstName} ${lastName}`.trim(),
        role: userRoleEnum.enumValues[0], // Default to job_seeker
        profilePicture: profile.photos?.[0]?.value || null,
      });
    } else {
      // Optionally update profile picture if empty
      if (!user.profilePicture && profile.photos?.[0]?.value) {
        // Code to update user profile picture would go here
        // In a real app, you might want to update the profile picture
      }
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    return done(error);
  }
}

export function setupSocialAuth(app: Express) {
  // Configure Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ['profile', 'email']
    }, (accessToken, refreshToken, profile, done) => {
      handleSocialLogin(profile, done);
    }));
  }

  // Configure LinkedIn Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "/api/auth/linkedin/callback",
      scope: ['r_emailaddress', 'r_liteprofile']
    }, (accessToken, refreshToken, profile, done) => {
      handleSocialLogin(profile, done);
    }));
  }

  // Add Google authentication routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ['profile', 'email'] })
  );

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home or to a specific page
      // We can add custom redirect logic here based on user type
      res.redirect('/');
    }
  );

  // Add LinkedIn authentication routes
  app.get("/api/auth/linkedin", 
    passport.authenticate("linkedin")
  );

  app.get("/api/auth/linkedin/callback", 
    passport.authenticate("linkedin", { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect home or to a specific page
      // We can add custom redirect logic here based on user type
      res.redirect('/');
    }
  );
}