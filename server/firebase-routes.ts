import { Express, Request, Response } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { storage } from "./storage";

// Initialize Firebase Admin
let firebaseAdminInitialized = false;

const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) return;
  
  try {
    // Replace newlines in private key (Replit environment variables don't preserve newlines)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    initializeApp({
      credential: cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    
    firebaseAdminInitialized = true;
    console.log("Firebase Admin SDK initialized successfully");
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
      const { idToken, email, displayName, photoURL } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "Missing ID token" });
      }
      
      // Verify the ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;
      
      // Check if user exists in our database
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // If user doesn't exist but we have their email from Firebase, check if 
        // they exist by email (for migration from old auth system)
        if (email) {
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
              email: email || decodedToken.email || "",
              fullName: displayName || email?.split("@")[0] || "User",
              role: "job_seeker", // Default role for new users
              profilePicture: photoURL || undefined,
              // Firebase handles authentication, so no password needed
              password: null
            });
          }
        } else {
          // Create new user without email (shouldn't normally happen)
          user = await storage.createUser({
            firebaseUid,
            email: decodedToken.email || "",
            fullName: displayName || "User",
            role: "job_seeker",
            profilePicture: photoURL || undefined,
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
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Firebase middleware for protected routes
  app.use("/api/protected/*", async (req: Request, res: Response, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await getAuth().verifyIdToken(idToken);
      
      // Get user from our database
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Firebase auth verification error:", error);
      res.status(401).json({ message: "Invalid authentication token" });
    }
  });
}