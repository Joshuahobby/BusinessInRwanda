import { Express, Request, Response } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { storage } from "./storage";

// Initialize Firebase Admin
let firebaseAdminInitialized = false;

const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) return;
  
  try {
    // For now we'll skip the Firebase Admin SDK initialization 
    // and rely on session-based authentication with our database
    console.log("Using session-based authentication instead of Firebase Admin");
    firebaseAdminInitialized = true;
    
    // When you get a proper private key, uncomment this code:
    /*
    // Replace newlines in private key (Replit environment variables don't preserve newlines)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    initializeApp({
      credential: cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    */
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
};

export function setupFirebaseRoutes(app: Express) {
  // Initialize Firebase Admin when setting up routes
  initializeFirebaseAdmin();
  
  // Firebase Authentication endpoint (for authentication with frontend)
  app.post("/api/auth/firebase-sync", async (req: Request, res: Response) => {
    try {
      const { email, displayName, photoURL, firebaseUid, role = "job_seeker" } = req.body;
      
      if (!email || !firebaseUid) {
        return res.status(400).json({ message: "Missing required user data" });
      }
      
      // Check if user exists in our database
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // If user doesn't exist but we have their email from Firebase, check if 
        // they exist by email (for migration from old auth system)
        const existingUserByEmail = await storage.getUserByEmail(email);
          
        if (existingUserByEmail) {
          // Update existing user with Firebase UID
          user = await storage.updateUser(existingUserByEmail.id, {
            ...existingUserByEmail,
            firebaseUid
          });
        } else {
          // Create new user
          user = await storage.createUser({
            firebaseUid,
            email,
            fullName: displayName || email?.split("@")[0] || "User",
            role,
            profilePicture: photoURL || undefined,
            // Firebase handles authentication, so no password needed
            password: null
          });
        }
      }
      
      // Log the user in (establish session)
      req.login(user, (err) => {
        if (err) {
          console.error("Firebase login error:", err);
          return res.status(500).json({ message: "Error logging in" });
        }
        
        // Omit password from response
        const userResponse = {...user};
        delete userResponse.password;
        
        return res.status(200).json(userResponse);
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Simplified middleware for protected routes - using session instead of token verification
  app.use("/api/protected/*", (req: Request, res: Response, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  });
}