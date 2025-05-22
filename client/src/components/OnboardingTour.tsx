import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Business In Rwanda! 🎉',
    description: 'Let\'s take a quick tour to help you discover opportunities and navigate the platform like a pro.',
    target: 'body',
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Smart Search System',
    description: 'Use our powerful search to find jobs, tenders, auctions, and announcements. Switch between categories using the tabs.',
    target: '[data-tour="search-section"]',
    position: 'bottom'
  },
  {
    id: 'categories',
    title: 'Browse by Category',
    description: 'Quick access to different opportunity types. Each category shows the current number of active listings.',
    target: '[data-tour="categories-section"]',
    position: 'top'
  },
  {
    id: 'featured',
    title: 'Featured Opportunities',
    description: 'Don\'t miss these hand-picked opportunities from top organizations across Rwanda.',
    target: '[data-tour="featured-section"]',
    position: 'top'
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    description: 'Access your dashboard, post opportunities, and manage your profile from the header menu.',
    target: '[data-tour="navigation"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! ✨',
    description: 'You\'re ready to explore Rwanda\'s opportunities! Remember, you can access this tour anytime from your profile menu.',
    target: 'body',
    position: 'bottom'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingTour = ({ isOpen, onClose }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { currentUser } = useFirebaseAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
      // Add overlay to body
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark tour as completed for user
    localStorage.setItem(`tour_completed_${currentUser?.id}`, 'true');
    onClose();
  };

  const skipTour = () => {
    localStorage.setItem(`tour_completed_${currentUser?.id}`, 'true');
    onClose();
  };

  const getStepPosition = () => {
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (!targetElement || step.target === 'body') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    switch (step.position) {
      case 'top':
        top = rect.top + scrollTop - 20;
        left = rect.left + scrollLeft + rect.width / 2;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -100%)' };
      case 'bottom':
        top = rect.bottom + scrollTop + 20;
        left = rect.left + scrollLeft + rect.width / 2;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, 0)' };
      case 'left':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.left + scrollLeft - 20;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(-100%, -50%)' };
      case 'right':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.right + scrollLeft + 20;
        return { top: `${top}px`, left: `${left}px`, transform: 'translate(0, -50%)' };
      default:
        return { top: `${top}px`, left: `${left}px` };
    }
  };

  const highlightTarget = () => {
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (targetElement && step.target !== 'body') {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      return {
        position: 'absolute' as const,
        top: rect.top + scrollTop - 4,
        left: rect.left + scrollLeft - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        border: '2px solid #3B82F6',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none' as const,
        zIndex: 9999
      };
    }
    return null;
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const stepPosition = getStepPosition();
  const highlightStyle = highlightTarget();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />
      
      {/* Highlight */}
      {highlightStyle && (
        <div style={highlightStyle} />
      )}

      {/* Tour Card */}
      <div
        className="fixed z-[10000] w-80 sm:w-96"
        style={stepPosition}
      >
        <Card className="shadow-2xl border-2 border-blue-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="h-4 w-4 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipTour}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0A3D62] mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div>
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="text-gray-500"
                >
                  Skip Tour
                </Button>
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;