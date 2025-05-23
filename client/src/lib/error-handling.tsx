import React, { Component, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Show user-friendly error toast
    toast({
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try refreshing the page.",
      variant: "destructive"
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// API error handling utilities
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
  success: boolean;
}

export class ApiErrorHandler {
  static handleError(error: any): string {
    // Handle network errors
    if (!error.response) {
      return 'Network error. Please check your connection and try again.';
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes
    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to access this resource.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return data?.message || 'This resource already exists.';
      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          return data.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
        }
        return data?.message || 'Validation failed.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.message || 'An unexpected error occurred.';
    }
  }

  static showErrorToast(error: any) {
    const message = this.handleError(error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }

  static showSuccessToast(message: string) {
    toast({
      title: "Success",
      description: message,
      variant: "default"
    });
  }
}

// Form error handling utilities
export const handleFormErrors = (error: any, setError: (field: string, error: { message: string }) => void) => {
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: { field: string; message: string }) => {
      setError(err.field, { message: err.message });
    });
  } else {
    ApiErrorHandler.showErrorToast(error);
  }
};

// Async operation wrapper with error handling
export const withErrorHandling = async <T,>(
  operation: () => Promise<T>,
  {
    showSuccessToast = false,
    successMessage = 'Operation completed successfully',
    showErrorToast = true,
    onError,
    onSuccess
  }: {
    showSuccessToast?: boolean;
    successMessage?: string;
    showErrorToast?: boolean;
    onError?: (error: any) => void;
    onSuccess?: (result: T) => void;
  } = {}
): Promise<T | null> => {
  try {
    const result = await operation();
    
    if (showSuccessToast) {
      ApiErrorHandler.showSuccessToast(successMessage);
    }
    
    onSuccess?.(result);
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    
    if (showErrorToast) {
      ApiErrorHandler.showErrorToast(error);
    }
    
    onError?.(error);
    return null;
  }
};

// React Query error handling
export const queryErrorHandler = (error: any) => {
  console.error('Query error:', error);
  
  // Don't show toast for 401 errors as they're handled by auth redirects
  if (error.response?.status !== 401) {
    ApiErrorHandler.showErrorToast(error);
  }
};

// Mutation error handling
export const mutationErrorHandler = (error: any) => {
  console.error('Mutation error:', error);
  ApiErrorHandler.showErrorToast(error);
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): string | undefined => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return undefined;
};

export const validateDate = (date: string): string | undefined => {
  if (!date) return undefined;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  
  return undefined;
};

export const validateUrl = (url: string): string | undefined => {
  if (!url) return undefined;
  
  try {
    new URL(url);
    return undefined;
  } catch {
    return 'Please enter a valid URL';
  }
};