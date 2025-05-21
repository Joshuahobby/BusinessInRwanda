import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmployer: () => user?.role === 'employer',
    isJobSeeker: () => user?.role === 'job_seeker',
    isAdmin: () => user?.role === 'admin',
  };
}