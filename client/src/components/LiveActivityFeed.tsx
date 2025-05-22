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
    if (!jobs || !companies || !Array.isArray(jobs) || !Array.isArray(companies)) return;

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
          message: `New ${job.postType} posted: ${job.title}`,
          location: job.location,
          timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
          icon: <Briefcase className="h-4 w-4" />,
          color: 'text-blue-600 bg-blue-50'
        });
      });

      // Recent applications (simulated from job data)
      const popularJobs = (jobs as any[]).slice(0, 3);
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

      // Company registrations
      const recentCompanies = (companies as any[]).slice(0, 3);
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

      // Trending activities
      const trendingJobs = (jobs as any[]).slice(0, 2);
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
      const closingJobs = (jobs as any[]).slice(0, 2);
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

  // Cycle through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000); // Change every 4 seconds

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

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -100 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-4 left-4 z-40"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs cursor-pointer hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-4 w-4 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs font-medium text-gray-700">Live Activity</span>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <motion.div
              animate={{ rotate: isVisible ? 0 : 180 }}
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

        {/* Activity indicator dots */}
        <div className="flex justify-center gap-1 mt-2">
          {activities.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex % 5 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LiveActivityFeed;