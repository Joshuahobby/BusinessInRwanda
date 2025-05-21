import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type UserResponse = User & {
  role: 'job_seeker' | 'employer' | 'admin';
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<UserResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isEmployer: () => user?.role === 'employer',
    isJobSeeker: () => user?.role === 'job_seeker',
    isAdmin: () => user?.role === 'admin',
    logout: () => logoutMutation.mutate(),
  };
}