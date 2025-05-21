import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { 
  login as loginApi, 
  register as registerApi, 
  logout as logoutApi, 
  getCurrentUser,
  LoginCredentials,
  RegisterData
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider = ({ children }: AuthProviderProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const loggedInUser = await loginApi(credentials);
      setUser(loggedInUser);
      toast({
        title: "Login successful",
        description: "Welcome back to Business In Rwanda"
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      await registerApi(data);
      toast({
        title: "Registration successful",
        description: data.role === 'employer'
          ? "Please login to complete your company profile"
          : "Welcome to Business In Rwanda"
      });
      // Auto-login for job seekers
      if (data.role === 'job_seeker') {
        await login({ email: data.email, password: data.password });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutApi();
      setUser(null);
      toast({
        title: "Logged out successfully"
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isEmployer = () => user?.role === 'employer';
  const isJobSeeker = () => user?.role === 'job_seeker';
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isEmployer,
        isJobSeeker
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
};