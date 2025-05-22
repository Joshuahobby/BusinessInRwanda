import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash,
  Star,
  StarOff,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  ShoppingBag,
  FileText,
  Megaphone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobManagementTableProps {
  jobs: Job[];
  isLoading: boolean;
  onViewJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onApproveJob: (job: Job) => void;
  onRejectJob: (job: Job) => void;
  onFeatureJob: (job: Job, featured: boolean) => void;
  onDeleteJob: (job: Job) => void;
}

const JobManagementTable = ({
  jobs,
  isLoading,
  onViewJob,
  onEditJob,
  onApproveJob,
  onRejectJob,
  onFeatureJob,
  onDeleteJob
}: JobManagementTableProps) => {
  const { toast } = useToast();
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const handleFeatureToggle = async (job: Job, featured: boolean) => {
    try {
      setActionInProgress(job.id);
      await onFeatureJob(job, featured);
      
      toast({
        title: featured ? "Job Featured" : "Job Unfeatured",
        description: featured
          ? "The job has been featured and will be highlighted on the platform."
          : "The job has been removed from featured listings.",
      });
    } catch (error) {
      console.error("Error featuring job:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem updating the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApprove = async (job: Job) => {
    try {
      setActionInProgress(job.id);
      await onApproveJob(job);
      
      toast({
        title: "Job Approved",
        description: "The job has been approved and is now visible to job seekers.",
      });
    } catch (error) {
      console.error("Error approving job:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem approving the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (job: Job) => {
    try {
      setActionInProgress(job.id);
      await onRejectJob(job);
      
      toast({
        title: "Job Rejected",
        description: "The job has been rejected and will not be shown to job seekers.",
      });
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem rejecting the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setActionInProgress(job.id);
      await onDeleteJob(job);
      
      toast({
        title: "Job Deleted",
        description: "The job has been permanently deleted from the platform.",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem deleting the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper function to get post type badge
  const getPostTypeBadge = (job: Job) => {
    const postType = job.postType || 'job';
    
    switch(postType) {
      case 'auction':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-600">
            <ShoppingBag className="h-3 w-3 mr-1" />
            Auction
          </Badge>
        );
      case 'tender':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <FileText className="h-3 w-3 mr-1" />
            Tender
          </Badge>
        );
      case 'announcement':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <Megaphone className="h-3 w-3 mr-1" />
            Announcement
          </Badge>
        );
      case 'job':
      default:
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <Briefcase className="h-3 w-3 mr-1" />
            Job
          </Badge>
        );
    }
  };

  // Helper function to get job status badge
  const getStatusBadge = (job: Job) => {
    const status = job.status || 'pending';
    
    switch(status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>
          {isLoading ? 'Loading jobs...' : `Total of ${jobs.length} jobs`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading state - show skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell colSpan={6}>
                  <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                </TableCell>
              </TableRow>
            ))
          ) : jobs.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            // Jobs list
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {job.isFeatured && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Star className="h-4 w-4 text-amber-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Featured job</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <span>{job.title}</span>
                  </div>
                </TableCell>
                <TableCell>{job.companyName || "Unknown"}</TableCell>
                <TableCell>{job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  {getStatusBadge(job)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onViewJob(job)}
                      disabled={actionInProgress === job.id}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionInProgress === job.id}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Manage Job</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEditJob(job)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        
                        {job.status !== 'approved' && (
                          <DropdownMenuItem 
                            onClick={() => handleApprove(job)}
                            className="text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Job
                          </DropdownMenuItem>
                        )}
                        
                        {job.status !== 'rejected' && (
                          <DropdownMenuItem 
                            onClick={() => handleReject(job)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Job
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {job.isFeatured ? (
                          <DropdownMenuItem onClick={() => handleFeatureToggle(job, false)}>
                            <StarOff className="h-4 w-4 mr-2" />
                            Remove Featured
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleFeatureToggle(job, true)}>
                            <Star className="h-4 w-4 mr-2 text-amber-500" />
                            Feature Job
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(job)}
                      disabled={actionInProgress === job.id}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobManagementTable;