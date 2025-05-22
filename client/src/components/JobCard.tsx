import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { 
  MapPin, Briefcase, DollarSign, ArrowRight, 
  Calendar, FileText, Megaphone, Gavel
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobCardProps {
  id: number;
  title: string;
  companyName: string;
  companyLogo: string;
  location: string;
  jobType: string;
  salary?: string;
  currency?: string;
  description: string;
  postedAt: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  isRemote?: boolean;
  postType?: string;
  isAuction?: boolean;
  isTender?: boolean; 
  isAnnouncement?: boolean;
  className?: string;
}

const JobCard = ({
  id,
  title,
  companyName,
  companyLogo,
  location,
  jobType,
  salary,
  currency,
  description,
  postedAt,
  isNew,
  isFeatured,
  isRemote,
  postType = "job",
  isAuction,
  isTender,
  isAnnouncement,
  className
}: JobCardProps) => {
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <img className="w-10 h-10 rounded" src={companyLogo} alt={`${companyName} Logo`} />
            <div className="ml-3">
              <h3 className="font-medium text-lg text-neutral-800">{title}</h3>
              <p className="text-sm text-neutral-600">{companyName}</p>
            </div>
          </div>
          {badgeText && (
            <Badge className={postTypeData.color}>
              {badgeText}
            </Badge>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
          
          {/* Show different details based on post type */}
          {postType === "job" && (
            <>
              <div className="flex items-center text-sm text-neutral-500 mb-1">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{jobType}</span>
              </div>
              {salary && (
                <div className="flex items-center text-sm text-neutral-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{salary}</span>
                </div>
              )}
            </>
          )}
          
          {postType === "auction" && (
            <>
              <div className="flex items-center text-sm text-neutral-500 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Auction Date: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-500 mb-1">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Starting Price: {currency || 'RWF'} {salary || 'Contact for details'}</span>
              </div>
            </>
          )}
          
          {postType === "tender" && (
            <>
              <div className="flex items-center text-sm text-neutral-500 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Deadline: {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-500 mb-1">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Budget: {currency || 'RWF'} {salary || 'Contact for details'}</span>
              </div>
            </>
          )}
          
          {postType === "announcement" && (
            <div className="flex items-center text-sm text-neutral-500 mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Published on: {new Date(postedAt).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            {postTypeData.icon}
            <span>{postTypeData.label}</span>
          </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {trimmedDescription}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            {postType === "auction" && "Auction date: "}
            {postType === "tender" && "Deadline: "}
            {postType === "announcement" && "Published: "}
            {(postType === "job" || postType === "all") && "Posted: "}
            {formatDistanceToNow(postedAt, { addSuffix: true })}
          </span>
          <Link 
            href={`/${postType}/${id}`} 
            className="inline-flex items-center text-[#0A3D62] hover:text-[#082C46] font-medium text-sm group-hover:underline"
          >
            {postTypeData.actionText}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
