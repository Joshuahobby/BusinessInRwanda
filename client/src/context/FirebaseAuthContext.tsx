import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  createAccount, 
  logOut, 
  onAuthChange,
  FirebaseUser 
} from "@/lib/firebase-auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();

// Firebase User data structure in our database
interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: 'job_seeker' | 'employer' | 'admin';
  profilePicture?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string, role: 'job_seeker' | 'employer') => Promise<void>;
  loginWithGoogle: (role?: 'job_seeker' | 'employer') => Promise<void>;
  logout: () => Promise<void>;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
  isAdmin: () => boolean;
}

const FirebaseAuthContext = createContext<AuthContextType | null>(null);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider = ({ children }: FirebaseAuthProviderProps) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation(); // React Router navigation

  // Sync user data with our backend when Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Get user's ID token
          const idToken = await firebaseUser.getIdToken();
          
          console.log("Firebase auth change detected, syncing user:", 
            firebaseUser.email, 
            "UID:", firebaseUser.uid
          );
          
          // Send the token to our backend to create/verify user and get the user data
          const response = await fetch("/api/auth/firebase-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Important for session cookies
            body: JSON.stringify({
              idToken,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
              photoURL: firebaseUser.photoURL,
              firebaseUid: firebaseUser.uid,
              // Don't set a default role as it might override existing role
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend sync failed:", response.status, errorData);
            throw new Error(`Failed to sync user data with backend: ${response.status}`);
          }

          const userData = await response.json();
          console.log("User data synced successfully:", userData.email);
          setCurrentUser(userData);
          
          // Check if we're on the login page or home page and redirect to appropriate dashboard
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath === '/login' || currentPath === '/';
          
          // Only redirect if we're on login/home and not already on a dashboard
          if (isLoginPage) {
            // Use React Router's navigation instead of window.location to prevent refresh loops
            if (userData.role === 'job_seeker') {
              // Using setTimeout to ensure this doesn't happen during render
              setTimeout(() => setLocation('/jobseeker/dashboard'), 100);
            } else if (userData.role === 'employer') {
              setTimeout(() => setLocation('/employer/dashboard'), 100);
            } else if (userData.role === 'admin') {
              setTimeout(() => setLocation('/admin/dashboard'), 100);
            }
          }
        } catch (error) {
          console.error("Error syncing with backend:", error);
          // Don't show toast for every sync error to avoid spamming the user
          // Only show it if we've been logged in for a while
          if (currentUser) {
            toast({
              title: "Authentication error",
              description: "Failed to sync your account. Please try again later.",
              variant: "destructive",
            });
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAuthError = (error: any) => {
    let message = "Authentication failed. Please try again.";
    
    // Firebase error codes
    if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered. Please login instead.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address.";
    } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Invalid email or password.";
    } else if (error.message) {
      message = error.message;
    }
    
    toast({
      title: "Authentication failed",
      description: message,
      variant: "destructive",
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      
      // Redirection will happen automatically in the useEffect when currentUser is set
      toast({
        title: "Login successful",
        description: "Welcome back to Business In Rwanda",
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'job_seeker' | 'employer'
  ) => {
    try {
      setIsLoading(true);
      // Create Firebase account
      const firebaseUser = await createAccount(email, password);
      
      // Send additional user data to our backend
      const response = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken: await firebaseUser.getIdToken(),
          firebaseUid: firebaseUser.uid,
          email,
          displayName: fullName,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register user on the backend");
      }

      toast({
        title: "Registration successful",
        description: role === 'employer' 
          ? "Please complete your company profile" 
          : "Welcome to Business In Rwanda",
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role?: 'job_seeker' | 'employer') => {
    try {
      setIsLoading(true);
      
      // Get the Firebase user through Google sign-in
      const user = await signInWithGoogle();
      
      if (user) {
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        console.log("Firebase auth change detected, syncing user:", user.email, "UID:", user.uid);
        
        // Make API call to sync the user with our database, including the role
        const response = await fetch('/api/auth/firebase-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            firebaseUid: user.uid,
            // Use the provided role or default to job_seeker 
            role: role || 'job_seeker'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to sync user data with server');
        }
        
        // Get the user data from our database
        const userData = await response.json();
        
        // Update the current user
        setCurrentUser({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          profilePicture: userData.profilePicture,
        });
        
        console.log("User data synced successfully:", userData.email);
      }
      
      toast({
        title: "Login successful",
        description: "Welcome to Business In Rwanda",
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logOut();
      
      // Clear user data first
      setCurrentUser(null);
      
      // Show success message
      toast({
        title: "Logged out successfully",
      });
      
      // Redirect to home page using React Router
      setTimeout(() => setLocation('/'), 100);
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEmployer = () => currentUser?.role === 'employer';
  const isJobSeeker = () => currentUser?.role === 'job_seeker';
  const isAdmin = () => currentUser?.role === 'admin';

  return (
    <FirebaseAuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        isEmployer,
        isJobSeeker,
        isAdmin,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};