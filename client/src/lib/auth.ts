import { User } from "@shared/schema";

// Local storage key for auth data
const AUTH_STORAGE_KEY = 'business_rwanda_auth';

// Interface for credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'job_seeker' | 'employer';
}

// Helper functions for auth
export const storeAuthData = (user: User) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredAuthData = (): User | null => {
  const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedData) return null;
  try {
    return JSON.parse(storedData) as User;
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// API methods
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const user = await response.json();
  storeAuthData(user);
  return user;
};

export const register = async (data: RegisterData): Promise<User> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const user = await response.json();
  return user;
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearAuthData();
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (response.status === 401) {
      clearAuthData();
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    
    const user = await response.json();
    if (user) {
      storeAuthData(user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return getStoredAuthData(); // Fallback to stored data if network fails
  }
};