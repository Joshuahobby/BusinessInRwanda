import { useState } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface FirebaseLoginProps {
  onLoginSuccess: () => void;
  onClose: () => void;
}

const FirebaseLogin = ({ onLoginSuccess, onClose }: FirebaseLoginProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [isLoading, setIsLoading] = useState(false);

  // Login with email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      
      // Get current user's ID token
      const idToken = await auth.currentUser?.getIdToken();
      
      // Send token to backend for session creation
      const response = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          email: auth.currentUser?.email,
          displayName: auth.currentUser?.displayName,
          photoURL: auth.currentUser?.photoURL
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to Business In Rwanda"
      });
      
      onLoginSuccess();
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "Login failed. Please check your credentials.";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later.";
      } else if (error.message) {
        message = error.message;
      }
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register with email/password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Send data to backend for user creation
      const response = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          email,
          displayName: fullName,
          photoURL: null,
          role
        }),
      });
      
      if (!response.ok) {
        // Delete the Firebase user if backend registration fails
        await userCredential.user.delete();
        throw new Error("Failed to register with server");
      }
      
      toast({
        title: "Registration successful",
        description: role === "employer" 
          ? "Welcome! Please complete your company profile."
          : "Welcome to Business In Rwanda"
      });
      
      onLoginSuccess();
      onClose();
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Registration failed.";
      
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use. Please log in instead.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.message) {
        message = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send token to backend for session creation
      const response = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }
      
      toast({
        title: "Google login successful",
        description: "Welcome to Business In Rwanda"
      });
      
      onLoginSuccess();
      onClose();
    } catch (error: any) {
      console.error("Google login error:", error);
      
      let message = "Google login failed.";
      if (error.message) {
        message = error.message;
      }
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // LinkedIn login (still use server endpoint for this)
  const handleLinkedInLogin = () => {
    window.location.href = "/api/auth/linkedin";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        {/* Login Tab */}
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 my-2">Or continue with</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                className="flex-1 bg-[#0077B5] hover:bg-[#005e8b]"
                disabled={isLoading}
                onClick={handleLinkedInLogin}
              >
                <FaLinkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Register Tab */}
        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="job-seeker"
                    name="role"
                    value="job_seeker"
                    checked={role === "job_seeker"}
                    onChange={() => setRole("job_seeker")}
                    className="mr-2"
                  />
                  <Label htmlFor="job-seeker">Job Seeker</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="employer"
                    name="role"
                    value="employer"
                    checked={role === "employer"}
                    onChange={() => setRole("employer")}
                    className="mr-2"
                  />
                  <Label htmlFor="employer">Employer</Label>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 my-2">Or register with</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                className="flex-1 bg-[#0077B5] hover:bg-[#005e8b]"
                disabled={isLoading}
                onClick={handleLinkedInLogin}
              >
                <FaLinkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseLogin;