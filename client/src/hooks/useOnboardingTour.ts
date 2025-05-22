import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

export const useOnboardingTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { currentUser, isAuthenticated } = useFirebaseAuth();

  useEffect(() => {
    // Check if user should see the tour
    if (isAuthenticated && currentUser) {
      const tourCompleted = localStorage.getItem(`tour_completed_${currentUser.id}`);
      
      // Show tour if user hasn't completed it yet
      if (!tourCompleted) {
        // Small delay to let the page load completely
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, currentUser]);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const resetTour = () => {
    if (currentUser) {
      localStorage.removeItem(`tour_completed_${currentUser.id}`);
      setIsTourOpen(true);
    }
  };

  const isTourCompleted = () => {
    if (!currentUser) return false;
    return !!localStorage.getItem(`tour_completed_${currentUser.id}`);
  };

  return {
    isTourOpen,
    startTour,
    closeTour,
    resetTour,
    isTourCompleted
  };
};