import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { 
  MapPin, Briefcase, DollarSign, ArrowRight, 
  Calendar, FileText, Megaphone, Gavel
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface JobCardProps {
  id?: number;
  title?: string;
  companyName?: string | null;
  companyLogo?: string;
  location?: string;
  jobType?: string;
  type?: string; 
  salary?: string | null;
  currency?: string;
  description?: string;
  postedAt?: Date;
  createdAt?: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  isRemote?: boolean;
  postType?: string;
  isAuction?: boolean;
  isTender?: boolean; 
  isAnnouncement?: boolean;
  className?: string;
  job?: any; // For compatibility with existing code
}

const JobCard = (props: JobCardProps) => {
  // If job is passed as a single object, extract properties
  const job = props.job || props;
  
  const {
    id,
    title,
    companyName,
    companyLogo,
    location,
    jobType,
    type, // Support both jobType and type
    salary,
    currency,
    description,
    postedAt,
    createdAt, // Support both postedAt and createdAt
    isNew,
    isFeatured,
    isRemote,
    postType = "job",
    isAuction,
    isTender,
    isAnnouncement,
    className
  } = job;
  // Get post type specific colors and labels
  const getPostTypeData = () => {
    switch(postType) {
      case "auction":
        return {
          color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
          label: "Auction",
          icon: <Gavel className="h-4 w-4 mr-1" />,
          actionText: "View Auction Details"
        };
      case "tender":
        return {
          color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
          label: "Tender",
          icon: <FileText className="h-4 w-4 mr-1" />,
          actionText: "View Tender Details"
        };
      case "announcement":
        return {
          color: "bg-amber-100 text-amber-800 hover:bg-amber-200",
          label: "Announcement",
          icon: <Megaphone className="h-4 w-4 mr-1" />,
          actionText: "Read Full Announcement"
        };
      default:
        return {
          color: "bg-green-100 text-green-800 hover:bg-green-200",
          label: "Job",
          icon: <Briefcase className="h-4 w-4 mr-1" />,
          actionText: "Apply Now"
        };
    }
  };

  const postTypeData = getPostTypeData();

  // Create badge text and style based on post status
  let badgeText = isNew ? "New" : isFeatured ? "Featured" : isRemote ? "Remote" : null;

  // Add postType specific badge if no other badge is showing
  if (!badgeText && postType !== "job") {
    badgeText = postTypeData.label;
  }
  
  // Make sure the card only displays essential information on the list page
  const trimmedDescription = description && description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description || "";

  return (
    <Card className={cn("job-card transition-all duration-300 group hover:-translate-y-1 hover:shadow-md border border-neutral-200", className)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg text-neutral-800">{title}</h3>
            <p className="text-sm text-neutral-600">{companyName}</p>
          </div>
          {badgeText && (
            <Badge className={postTypeData.color}>
              {badgeText}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {location && (
            <div className="flex items-center text-sm text-neutral-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location}</span>
            </div>
          )}
          
          {/* Show job type for jobs */}
          {postType === "job" && (jobType || type) && (
            <div className="flex items-center text-sm text-neutral-500">
              <Briefcase className="h-4 w-4 mr-1" />
              <span>{jobType || type}</span>
            </div>
          )}
          
          {/* Show salary if available */}
          {salary && (
            <div className="flex items-center text-sm text-neutral-500">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{salary} {currency}</span>
            </div>
          )}
          
          {/* Display post type */}
          <div className="flex items-center text-sm text-neutral-500">
            {postTypeData.icon}
            <span>{postTypeData.label}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">
            {postedAt instanceof Date && !isNaN(postedAt.getTime()) 
              ? formatDistanceToNow(postedAt, { addSuffix: true })
              : createdAt instanceof Date && !isNaN(createdAt.getTime())
                ? formatDistanceToNow(createdAt, { addSuffix: true })
                : 'Recently'}
          </span>
          <Link 
            href={`/${postType}/${id}`} 
            className="inline-flex items-center text-[#0A3D62] hover:text-[#082C46] font-medium text-sm group-hover:underline"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
