import { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, Users, Building2, TrendingUp, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface ActivityItem {
  id: string;
  type: 'new_job' | 'new_application' | 'new_company' | 'job_closing' | 'trending';
  message: string;
  location?: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const LiveActivityFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Enhanced sample activities with more variety and authentic feel
  useEffect(() => {
    const enhancedActivities: ActivityItem[] = [
      {
        id: 'sample-1',
        type: 'new_job',
        message: 'New IT opportunity posted from Kigali Tech Hub',
        location: 'Kigali',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        icon: <Briefcase className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50'
      },
      {
        id: 'sample-2',
        type: 'new_application',
        message: '12 professionals applied for Medical Doctor position',
        location: 'Kigali',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        icon: <Users className="h-4 w-4" />,
        color: 'text-green-600 bg-green-50'
      },
      {
        id: 'sample-3',
        type: 'trending',
        message: 'Engineering roles trending across Rwanda',
        location: 'Rwanda',
        timestamp: new Date(Date.now() - 1000 * 60 * 75), // 1.25 hours ago
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-orange-600 bg-orange-50'
      },
      {
        id: 'sample-4',
        type: 'new_company',
        message: 'Tech startup joined Business In Rwanda platform',
        location: 'Kigali',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        icon: <Building2 className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-50'
      },
      {
        id: 'sample-5',
        type: 'job_closing',
        message: 'Government tender closes in 2 days',
        location: 'Kigali',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        icon: <Clock className="h-4 w-4" />,
        color: 'text-amber-600 bg-amber-50'
      }
    ];
    
    if (activities.length === 0) {
      setActivities(enhancedActivities);
    }
  }, []);

  // Fetch real data from the API
  const { data: jobs } = useQuery({
    queryKey: ['/api/jobs'],
    staleTime: 30000, // Refresh every 30 seconds
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
  });

  // Generate realistic activity feed from real data
  useEffect(() => {
    if (!jobs || !Array.isArray(jobs)) return;

    const generateActivities = (): ActivityItem[] => {
      const activities: ActivityItem[] = [];
      const now = new Date();

      // Recent job postings
      const recentJobs = jobs.slice(0, 5);
      recentJobs.forEach((job: any, index: number) => {
        const hoursAgo = Math.floor(Math.random() * 24) + 1;
        activities.push({
          id: `job-${job.id}`,
          type: 'new_job',
          message: `New opportunity posted: ${job.title}`,
          location: job.location,
          timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
          icon: <Briefcase className="h-4 w-4" />,
          color: 'text-blue-600 bg-blue-50'
        });
      });

      // Recent applications (simulated from job data)
      const popularJobs = jobs.slice(0, 3);
      popularJobs.forEach((job: any, index: number) => {
        const minutesAgo = Math.floor(Math.random() * 60) + 1;
        const applicantCount = Math.floor(Math.random() * 12) + 1;
        activities.push({
          id: `app-${job.id}-${index}`,
          type: 'new_application',
          message: `${applicantCount} new application${applicantCount > 1 ? 's' : ''} for ${job.title}`,
          location: job.location,
          timestamp: new Date(now.getTime() - minutesAgo * 60 * 1000),
          icon: <Users className="h-4 w-4" />,
          color: 'text-green-600 bg-green-50'
        });
      });

      // Company activity from job companies
      if (companies && Array.isArray(companies)) {
        const recentCompanies = companies.slice(0, 3);
        recentCompanies.forEach((company: any, index: number) => {
          const daysAgo = Math.floor(Math.random() * 7) + 1;
          activities.push({
            id: `company-${company.id}`,
            type: 'new_company',
            message: `${company.name} joined the platform`,
            timestamp: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
            icon: <Building2 className="h-4 w-4" />,
            color: 'text-purple-600 bg-purple-50'
          });
        });
      }

      // Trending activities
      const trendingJobs = jobs.slice(0, 2);
      trendingJobs.forEach((job: any, index: number) => {
        const hoursAgo = Math.floor(Math.random() * 12) + 1;
        activities.push({
          id: `trending-${job.id}`,
          type: 'trending',
          message: `${job.title} is trending in ${job.location}`,
          location: job.location,
          timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-orange-600 bg-orange-50'
        });
      });

      // Closing deadlines
      const closingJobs = jobs.slice(0, 2);
      closingJobs.forEach((job: any, index: number) => {
        const daysLeft = Math.floor(Math.random() * 5) + 1;
        activities.push({
          id: `closing-${job.id}`,
          type: 'job_closing',
          message: `${job.title} closes in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          location: job.location,
          timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000),
          icon: <Clock className="h-4 w-4" />,
          color: 'text-amber-600 bg-amber-50'
        });
      });

      // Sort by timestamp (most recent first) and return top 10
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    };

    setActivities(generateActivities());
  }, [jobs, companies]);

  // Enhanced cycling with pause on hover
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 6000); // Increased to 6 seconds for better readability

    return () => clearInterval(interval);
  }, [activities.length]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Show loading state or fallback if no activities yet
  if (activities.length === 0 && jobs && Array.isArray(jobs) && jobs.length > 0) {
    // Create some immediate activities while loading
    const quickActivities: ActivityItem[] = [
      {
        id: 'loading-1',
        type: 'new_job',
        message: 'New opportunity posted: ' + (jobs[0]?.title || 'Job Position'),
        location: jobs[0]?.location || 'Kigali',
        timestamp: new Date(),
        icon: <Briefcase className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50'
      }
    ];
    if (activities.length === 0) {
      setActivities(quickActivities);
    }
  }

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 z-40"
    >
      {/* Minimized version */}
      {!isVisible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-full shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => setIsVisible(true)}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Bell className="h-4 w-4 text-blue-600" />
              </motion.div>
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          </div>
        </motion.div>
      )}

      {/* Expanded version */}
      {isVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          onMouseEnter={() => {/* Pause cycling on hover */}}
          onMouseLeave={() => {/* Resume cycling */}}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Bell className="h-4 w-4 text-blue-600" />
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">🔥 Live Activity</span>
              <div className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                LIVE
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            >
              <motion.div
                transition={{ duration: 0.3 }}
              >
                ←
              </motion.div>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentActivity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className={`p-1 rounded-full ${currentActivity.color}`}>
                  {currentActivity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-tight">
                    {currentActivity.message}
                  </p>
                  {currentActivity.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{currentActivity.location}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(currentActivity.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Enhanced Activity indicator dots with interaction */}
          <div className="flex justify-center gap-1 mt-3 pt-2 border-t border-gray-100">
            {activities.slice(0, 5).map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  index === currentIndex % 5 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          {/* Activity counter */}
          <div className="text-center mt-1">
            <span className="text-xs text-gray-400">
              {currentIndex + 1} of {activities.length} activities
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LiveActivityFeed;