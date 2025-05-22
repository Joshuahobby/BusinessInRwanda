import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { CalendarClock, ArrowRight } from "lucide-react";
import { Job } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface JobWithDeadline extends Job {
  deadline?: string;
}

const DeadlineHighlights = () => {
  // Get all jobs and filter those with deadlines
  const { data: allJobs = [], isLoading } = useQuery<JobWithDeadline[]>({
    queryKey: ['/api/jobs'],
  });

  // Filter and sort jobs by deadline (for tenders) or auction date (for auctions)
  const jobsWithDeadlines = allJobs
    .filter(job => {
      // Include jobs with auction dates
      if (job.postType === "auction" && job.auctionDate) return true;
      
      // Include tenders with deadlines
      if (job.postType === "tender" && job.tenderDeadline) return true;
      
      // Include jobs with application deadlines
      if (job.postType === "job" && job.applicationDeadline) return true;
      
      // Handle jobs with deadlines in additionalData
      if (job.additionalData && typeof job.additionalData === 'object') {
        const data = job.additionalData as Record<string, any>;
        return data.deadline || data.tenderDeadline || data.auctionDate;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Get deadline dates for comparison
      const getDeadline = (job: JobWithDeadline) => {
        if (job.postType === "auction" && job.auctionDate) return new Date(job.auctionDate);
        if (job.postType === "tender" && job.tenderDeadline) return new Date(job.tenderDeadline);
        if (job.postType === "job" && job.applicationDeadline) return new Date(job.applicationDeadline);
        
        if (job.additionalData && typeof job.additionalData === 'object') {
          const data = job.additionalData as Record<string, any>;
          const deadlineStr = data.deadline || data.tenderDeadline || data.auctionDate;
          if (deadlineStr) return new Date(deadlineStr);
        }
        
        return new Date(); // Fallback to current date
      };
      
      return getDeadline(a).getTime() - getDeadline(b).getTime();
    })
    .slice(0, 5); // Take only the 5 closest deadlines

  // Function to format deadline display
  const getDeadlineInfo = (job: JobWithDeadline) => {
    let deadlineDate: Date | null = null;
    let deadlineLabel = "";
    
    if (job.postType === "auction" && job.auctionDate) {
      deadlineDate = new Date(job.auctionDate);
      deadlineLabel = "Auction Date";
    } else if (job.postType === "tender" && job.tenderDeadline) {
      deadlineDate = new Date(job.tenderDeadline);
      deadlineLabel = "Submission Deadline";
    } else if (job.postType === "job" && job.applicationDeadline) {
      deadlineDate = new Date(job.applicationDeadline);
      deadlineLabel = "Application Deadline";
    } else if (job.additionalData && typeof job.additionalData === 'object') {
      const data = job.additionalData as Record<string, any>;
      const deadlineStr = data.deadline || data.tenderDeadline || data.auctionDate;
      if (deadlineStr) {
        deadlineDate = new Date(deadlineStr);
        deadlineLabel = job.postType === "auction" ? "Auction Date" : 
                        job.postType === "tender" ? "Submission Deadline" : 
                        "Application Deadline";
      }
    }
    
    if (!deadlineDate) return { label: "Deadline", formattedDate: "Unknown" };
    
    return {
      label: deadlineLabel,
      formattedDate: formatDistanceToNow(deadlineDate, { addSuffix: true })
    };
  };
  
  // Get badge color based on post type
  const getBadgeColor = (postType: string) => {
    switch (postType) {
      case "auction": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "tender": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "announcement": return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default: return "bg-green-100 text-green-800 hover:bg-green-200"; // job
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading">Closing Soon</h2>
            <p className="text-neutral-600 mt-1">Don't miss these opportunities with approaching deadlines</p>
          </div>
          <Link href="/opportunities?sort=deadline" className="text-[#0A3D62] hover:text-[#082C46] font-medium flex items-center">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : jobsWithDeadlines.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {jobsWithDeadlines.map((job) => {
              const deadlineInfo = getDeadlineInfo(job);
              const badgeColor = getBadgeColor(job.postType || "job");
              const isUrgent = deadlineInfo.formattedDate.includes("day") && 
                               !deadlineInfo.formattedDate.includes("month") && 
                               !deadlineInfo.formattedDate.includes("year");
              
              return (
                <Card key={job.id} className="transition-all duration-300 hover:shadow-md border border-neutral-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg text-neutral-800">{job.title}</h3>
                        <p className="text-sm text-neutral-600">{job.companyName || "Individual Employer"}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={badgeColor}>
                          {job.postType === "auction" ? "Auction" : 
                           job.postType === "tender" ? "Tender" : 
                           job.postType === "announcement" ? "Announcement" : "Job"}
                        </Badge>
                        {isUrgent && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm">
                        <CalendarClock className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="text-neutral-700 font-medium">
                          {deadlineInfo.label}: 
                          <span className={`ml-1 ${isUrgent ? 'text-red-600 font-semibold' : 'text-neutral-600'}`}>
                            {deadlineInfo.formattedDate}
                          </span>
                        </span>
                      </div>
                      
                      <Link 
                        href={`/${job.postType || 'job'}/${job.id}`} 
                        className="text-[#0A3D62] hover:text-[#082C46] font-medium text-sm flex items-center"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <CalendarClock className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
            <p className="text-neutral-600">No upcoming deadlines available at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DeadlineHighlights;