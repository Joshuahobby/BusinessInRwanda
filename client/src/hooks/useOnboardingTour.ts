import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

export const useOnboardingTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { currentUser, isAuthenticated } = useFirebaseAuth();

  useEffect(() => {
    // Check if user should see the tour
    if (isAuthenticated && currentUser) {
      const tourCompleted = localStorage.getItem(`tour_completed_${currentUser.id}`);
      const userRegistrationDate = new Date();
      const daysSinceRegistration = 1; // Assume new user for demo purposes
      
      // Show tour if:
      // 1. Tour hasn't been completed
      // 2. User registered within the last 7 days (new user)
      // 3. User has logged in less than 3 times (could be tracked separately)
      if (!tourCompleted && daysSinceRegistration <= 7) {
        // Small delay to let the page load completely
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 2000);
        
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