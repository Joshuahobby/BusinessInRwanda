import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Building, Tag, Star, StarOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const JobDetailsModal = ({ isOpen, onClose, job }: JobDetailsModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isFeaturing, setIsFeaturing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!job) {
    return null;
  }

  const handleActivateToggle = async (active: boolean) => {
    setIsActivating(true);
    try {
      await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          isActive: active
        }),
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      
      toast({
        title: active ? "Job Activated" : "Job Deactivated",
        description: active 
          ? "The job listing is now visible to job seekers." 
          : "The job listing has been deactivated and is hidden from job seekers.",
      });
    } catch (error) {
      console.error("Error toggling job active state:", error);
      toast({
        title: "Action failed",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleFeatureToggle = async () => {
    // Since we don't have isFeatured in the database schema yet, 
    // this is just a simulated UI interaction for now
    setIsFeaturing(true);
    
    try {
      // Show a success toast to demonstrate the UI functionality
      toast({
        title: "Feature Updated",
        description: "This functionality will be fully implemented once the database schema is updated.",
      });
      
      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was a problem updating the job feature status.",
        variant: "destructive",
      });
    } finally {
      setIsFeaturing(false);
    }
  };

  // Helper function to format job types
  const formatJobType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
          <DialogDescription>
            View and manage job listing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-sm text-neutral-500">
                Company ID: {job.companyId}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={job.isActive ? "default" : "outline"}
                className={job.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="h-4 w-4" />
              <span>Posted: {job.createdAt ? format(new Date(job.createdAt), 'MMMM d, yyyy') : 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Building className="h-4 w-4" />
              <span>{formatJobType(job.type)}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Tag className="h-4 w-4" />
              <span>{job.category}</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="font-medium">Job Description</h4>
            <div className="p-3 bg-neutral-50 rounded-md max-h-[200px] overflow-y-auto text-sm">
              {job.description}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Requirements</h4>
            <div className="p-3 bg-neutral-50 rounded-md max-h-[150px] overflow-y-auto text-sm">
              {job.requirements || "No specific requirements listed."}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="active-status" className="text-base">Active Status</Label>
                <span className="text-sm text-neutral-500">
                  {job.isActive 
                    ? "Job is visible to applicants" 
                    : "Job is hidden from applicants"}
                </span>
              </div>
              <Switch
                id="active-status"
                checked={job.isActive}
                onCheckedChange={handleActivateToggle}
                disabled={isActivating}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="featured-status" className="text-base">Featured Status</Label>
                <span className="text-sm text-neutral-500">
                  Featured jobs appear at the top of job listings
                </span>
              </div>
              <Switch
                id="featured-status"
                onCheckedChange={handleFeatureToggle}
                disabled={isFeaturing}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;