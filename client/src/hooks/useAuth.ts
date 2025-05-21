import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiRequestLegacy } from "@/lib/queryClient";

export function useAuth() {
  const { toast } = useToast();

  // Fetch current user
  const { 
    data: user, 
    isLoading,
    error 
  } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      fullName: string;
      role: string;
      phone?: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const login = (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const register = (userData: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
  }) => {
    return registerMutation.mutateAsync(userData);
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isEmployer: () => user?.role === "employer",
    isJobSeeker: () => user?.role === "job_seeker",
    isAdmin: () => user?.role === "admin",
    login,
    logout,
    register,
    loginMutation,
    registerMutation,
  };
}