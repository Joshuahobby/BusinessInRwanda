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
      const { idToken, email, displayName, photoURL, firebaseUid, role } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Missing required user data" });
      }
      
      console.log("Received Firebase sync request for:", email, "with UID:", firebaseUid);
      
      // Since we're skipping Firebase Admin verification, we'll just use the email and UID
      // In a production app, we would verify the token with Firebase Admin
      
      // First check if user exists in our database by Firebase UID
      let user = null;
      if (firebaseUid) {
        user = await storage.getUserByFirebaseUid(firebaseUid);
        if (user) {
          console.log("Found user by Firebase UID:", user.email);
        }
      }
      
      // If not found by Firebase UID, try email
      if (!user) {
        user = await storage.getUserByEmail(email);
        if (user) {
          console.log("Found user by email:", user.email);
        }
      }
      
      if (!user) {
        // Create new user if they don't exist
        try {
          // Use the role from registration or default to job_seeker for new users
          const userRole = role || "job_seeker";
          
          user = await storage.createUser({
            email,
            fullName: displayName || email?.split("@")[0] || "User",
            role: userRole,
            profilePicture: photoURL || null,
            // Firebase handles authentication, so no password needed
            password: null,
            firebaseUid, // Use the actual Firebase UID from the request
            bio: null,
            location: null,
            phone: null
          });
          console.log("Created new user for Firebase auth:", email, "with ID:", user.id, "with role:", userRole);
        } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({ message: "Error creating user account" });
        }
      } else {
        // Update existing user with Firebase UID and/or role if needed
        if (firebaseUid || role) {
          try {
            // Build update object with all potential updates
            const updateData: any = {};
            
            // Add firebaseUid if it's missing or different
            if (firebaseUid && (!user.firebaseUid || user.firebaseUid !== firebaseUid)) {
              updateData.firebaseUid = firebaseUid;
            }
            
            // Update role if provided and different from current role
            // But never change admin role to anything else
            if (role && user.role !== role && user.role !== "admin") {
              updateData.role = role;
            }
            
            // Only update profile info if it's actually different to avoid unnecessary updates
            if (photoURL && photoURL !== user.profilePicture) {
              updateData.profilePicture = photoURL;
            }
            if (displayName && displayName !== user.fullName) {
              updateData.fullName = displayName;
            }
            
            // Only update if we have changes to make
            if (Object.keys(updateData).length > 0) {
              user = await storage.updateUser(user.id, updateData);
              console.log("Updated user information:", email, "with ID:", user.id, 
                "Updates:", Object.keys(updateData).join(", "));
            }
          } catch (error) {
            console.error("Error updating user:", error);
          }
        }
        console.log("User already exists in database:", email, "with ID:", user.id, "with role:", user.role);
      }
      
      // Log the user in (establish session)
      // Make sure we have a valid user object before login
      if (!user || !user.id) {
        console.error("Invalid user object:", user);
        return res.status(500).json({ message: "Invalid user data" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Firebase login error:", err);
          return res.status(500).json({ message: "Error logging in" });
        }
        
        // Omit sensitive data from response
        const userResponse = {...user};
        if (userResponse.password) {
          userResponse.password = null;
        }
        
        console.log("User logged in successfully:", userResponse.email);
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