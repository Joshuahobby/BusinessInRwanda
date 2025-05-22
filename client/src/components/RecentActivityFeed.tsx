import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Activity, FileText, Briefcase, Gavel, Megaphone, ArrowRight } from "lucide-react";
import { Job } from "@shared/schema";

const RecentActivityFeed = () => {
  // Get recent jobs
  const { data: recentJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Sort jobs by creation date
  const sortedJobs = [...recentJobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8); // Show only most recent 8 activities

  // Get icon based on post type
  const getActivityIcon = (postType: string) => {
    switch (postType) {
      case "auction":
        return <Gavel className="w-5 h-5 text-purple-600" />;
      case "tender":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-amber-600" />;
      default:
        return <Briefcase className="w-5 h-5 text-green-600" />;
    }
  };

  // Get text description based on post type
  const getActivityText = (job: Job) => {
    const companyName = job.companyName || "Individual employer";
    
    switch (job.postType) {
      case "auction":
        return `New auction posted: ${job.title}`;
      case "tender":
        return `New tender opportunity from ${companyName}`;
      case "announcement":
        return `New announcement: ${job.title}`;
      default:
        return `New job opening at ${companyName}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-4 h-[400px] animate-pulse">
        <div className="h-6 bg-neutral-100 rounded-md w-1/3 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-100"></div>
            <div className="flex-1">
              <div className="h-4 bg-neutral-100 rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-neutral-100 rounded-md w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedJobs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-[#0A3D62]" />
          Recent Activity
        </h3>
        <Link href="/find-jobs?sort=newest" className="text-[#0A3D62] hover:text-[#082C46] text-sm font-medium flex items-center">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-5">
        {sortedJobs.map((job) => (
          <div key={job.id} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mt-1">
              {getActivityIcon(job.postType || "job")}
            </div>
            <div className="flex-1">
              <Link href={`/${job.postType || 'job'}/${job.id}`} className="text-neutral-800 hover:text-[#0A3D62] font-medium line-clamp-1">
                {getActivityText(job)}
              </Link>
              <p className="text-xs text-neutral-500">
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;