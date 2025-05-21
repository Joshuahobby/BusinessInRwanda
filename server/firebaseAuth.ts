import { Request, Response, NextFunction } from "express";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { storage } from "./storage";

// Initialize Firebase Admin SDK
const serviceAccountConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let firebaseAdminInitialized = false;

export const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) return;
  
  try {
    initializeApp({
      credential: cert(serviceAccountConfig as ServiceAccount),
    });
    firebaseAdminInitialized = true;
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string) => {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    throw new Error("Invalid or expired authentication token");
  }
};

// Synchronize Firebase user with our database
export const syncFirebaseUser = async (
  firebaseUid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null,
  role: string = "job_seeker" // Default role
) => {
  try {
    // Check if user exists in our database
    let user = await storage.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      // Create new user if not exists
      user = await storage.createUser({
        firebaseUid,
        email: email || "",
        fullName: displayName || email?.split("@")[0] || "User",
        role: role as any,
        profilePicture: photoURL || undefined,
        password: "", // Not needed with Firebase auth
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error syncing Firebase user with database:", error);
    throw error;
  }
};

// Middleware to verify Firebase authentication
export const requireFirebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization token" });
    }
    
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyFirebaseToken(idToken);
    
    // Get user from our database
    const user = await storage.getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      return res.status(401).json({ message: "User not found in system" });
    }
    
    // Attach user to request for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};