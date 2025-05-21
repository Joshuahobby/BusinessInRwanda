import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import * as crypto from "crypto";
import { storage } from "./storage";
import { userRoleEnum } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, Request } from "express";

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
      const firstName = profile.name?.givenName || 
                        profile.displayName?.split(' ')[0] || 
                        email.split('@')[0];
      
      const lastName = profile.name?.familyName || 
                      (profile.displayName?.split(' ').length > 1 
                        ? profile.displayName?.split(' ').slice(1).join(' ') 
                        : '');
      
      // Generate a secure random password for social login users
      const randomPassword = crypto.randomBytes(32).toString('hex');
      
      user = await storage.createUser({
        email,
        password: crypto
          .createHash("sha256")
          .update(randomPassword)
          .digest("hex"),
        fullName: `${firstName} ${lastName}`.trim(),
        role: userRoleEnum.enumValues[0], // Default to job_seeker
        profilePicture: profile.photos?.[0]?.value || null,
      });
      
      console.log(`Created new user from social login: ${email}`);
    } else {
      // Optionally update profile picture if empty
      if (!user.profilePicture && profile.photos?.[0]?.value) {
        // Future enhancement: update user profile picture
        console.log(`User ${email} logged in via social authentication`);
      }
    }

    // Remove password from user object before returning
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);
  } catch (error) {
    console.error('Social login error:', error);
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
      scope: ['profile', 'email'],
      proxy: true
    }, (accessToken, refreshToken, profile, done) => {
      console.log('Google profile received:', profile.id);
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

  // Set up user serialization/deserialization for sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Add Google authentication routes with full URL for callback
  app.get("/api/auth/google", (req, res, next) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const callbackURL = `${protocol}://${host}/api/auth/google/callback`;
    
    // Log for debugging
    console.log(`Google auth request with callback URL: ${callbackURL}`);
    
    passport.authenticate("google", {
      scope: ['profile', 'email'],
      callbackURL: callbackURL
    })(req, res, next);
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const callbackURL = `${protocol}://${host}/api/auth/google/callback`;
    
    // Log callback receipt for debugging
    console.log(`Google auth callback received at ${callbackURL}`);
    
    passport.authenticate("google", {
      failureRedirect: '/login?error=google-auth-failed',
      callbackURL: callbackURL
    }, (err, user) => {
      if (err) {
        console.error('Auth error:', err);
        return res.redirect('/login?error=auth-error');
      }
      if (!user) {
        return res.redirect('/login?error=no-user');
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect('/login?error=login-error');
        }
        return res.redirect('/');
      });
    })(req, res, next);
  });

  // Add LinkedIn authentication routes with full URL for callback
  app.get("/api/auth/linkedin", (req, res, next) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const callbackURL = `${protocol}://${host}/api/auth/linkedin/callback`;
    
    // Log for debugging
    console.log(`LinkedIn auth request with callback URL: ${callbackURL}`);
    
    passport.authenticate("linkedin", {
      callbackURL: callbackURL
    })(req, res, next);
  });

  app.get("/api/auth/linkedin/callback", (req, res, next) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;
    const callbackURL = `${protocol}://${host}/api/auth/linkedin/callback`;
    
    // Log callback receipt for debugging
    console.log(`LinkedIn auth callback received at ${callbackURL}`);
    
    passport.authenticate("linkedin", {
      failureRedirect: '/login?error=linkedin-auth-failed',
      callbackURL: callbackURL
    }, (err, user) => {
      if (err) {
        console.error('LinkedIn auth error:', err);
        return res.redirect('/login?error=auth-error');
      }
      if (!user) {
        return res.redirect('/login?error=no-user');
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('LinkedIn login error:', loginErr);
          return res.redirect('/login?error=login-error');
        }
        return res.redirect('/');
      });
    })(req, res, next);
  });

  // Add logout route
  app.get("/api/auth/logout", (req: Request, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      res.redirect("/");
    });
  });

  // Get current user route
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
  });
}