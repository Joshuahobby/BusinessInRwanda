import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRole } from "@/lib/types";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithLinkedIn: () => void;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
  isAdmin: () => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current user session
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 300000, // 5 minutes
    refetchInterval: 600000, // 10 minutes,
    retry: false,
    // Handle 401 unauthorized by returning null instead of throwing
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      
      return await res.json();
    }
  });

  const isAuthenticated = !!user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      await apiRequest('POST', '/api/auth/login', data);
      return refetch();
    },
    onSuccess: () => {
      toast({ 
        title: "Login successful", 
        description: "Welcome back to Business In Rwanda" 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await apiRequest('POST', '/api/auth/register', data);
      if (data.role === 'employer') {
        return; // Don't auto-login employers as they need to complete company profile
      }
      // Auto-login job seekers
      return loginMutation.mutateAsync({ email: data.email, password: data.password });
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: "Registration successful", 
        description: variables.role === 'employer' 
          ? "Please login to complete your company profile" 
          : "Welcome to Business In Rwanda"
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
      queryClient.clear();
    },
    onSuccess: () => {
      toast({ 
        title: "Logged out successfully"
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Logout failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const isEmployer = () => user?.role === 'employer';
  const isJobSeeker = () => user?.role === 'job_seeker';
  const isAdmin = () => user?.role === 'admin';

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Ensure user is always of type User | null to match the context type
  const safeUser: User | null = user || null;

  // Social login helpers
  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const loginWithLinkedIn = () => {
    window.location.href = "/api/auth/linkedin";
  };

  return (
    <AuthContext.Provider
      value={{
        user: safeUser,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithLinkedIn,
        isEmployer,
        isJobSeeker,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
