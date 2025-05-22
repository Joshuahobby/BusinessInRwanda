import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck, MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";
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
  currency = "RWF",
  description,
  postedAt,
  isNew,
  isFeatured,
  isRemote,
  className
}: JobCardProps) => {
  // Create badge text and style based on job status
  let badgeText = isNew ? "New" : isFeatured ? "Featured" : isRemote ? "Remote" : null;
  let badgeVariant = isNew ? "secondary" : isFeatured ? "secondary" : isRemote ? "secondary" : "default";

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
            <Badge variant={badgeVariant as "default" | "secondary" | "outline" | "destructive"} className="bg-[#00A86B]/10 text-[#008F5B] hover:bg-[#00A86B]/20">
              {badgeText}
            </Badge>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{jobType}</span>
          </div>
          {salary && (
            <div className="flex items-center text-sm text-neutral-500">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{salary} {currency}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            Posted {formatDistanceToNow(postedAt, { addSuffix: true })}
          </span>
          <Link href={`/job/${id}`} className="inline-flex items-center text-[#0A3D62] hover:text-[#082C46] font-medium text-sm group-hover:underline">
            Apply Now
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
