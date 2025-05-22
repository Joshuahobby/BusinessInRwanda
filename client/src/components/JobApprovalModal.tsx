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
import { CheckCircle, XCircle, Star, Calendar, MapPin, Building, Tag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface JobApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

const JobApprovalModal = ({ isOpen, onClose, job }: JobApprovalModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!job) {
    return null;
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      if (!job || !job.id) {
        throw new Error("Job information is missing");
      }
      
      await fetch(`/api/admin/jobs/${job.id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "approved",
          adminNotes
        }),
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      
      toast({
        title: "Job Approved",
        description: "The job listing has been approved and is now live on the platform.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error approving job:", error);
      toast({
        title: "Action failed",
        description: "Failed to approve the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection in the admin notes field.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (!job || !job.id) {
        throw new Error("Job information is missing");
      }
      
      await fetch(`/api/admin/jobs/${job.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "rejected",
          adminNotes
        }),
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      
      toast({
        title: "Job Rejected",
        description: "The job listing has been rejected and feedback sent to the employer.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast({
        title: "Action failed",
        description: "Failed to reject the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeature = async () => {
    setIsProcessing(true);
    try {
      await fetch(`/api/admin/jobs/${job.id}/feature`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          isFeatured: !job.isFeatured
        }),
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      
      toast({
        title: job.isFeatured ? "Job Unfeatured" : "Job Featured",
        description: job.isFeatured 
          ? "The job listing has been removed from featured listings."
          : "The job listing has been featured and will be highlighted on the platform.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error featuring job:", error);
      toast({
        title: "Action failed",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Job Listing Review</DialogTitle>
          <DialogDescription>
            Review and manage this job listing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-sm text-neutral-500">{job.companyName || "Company name unavailable"}</p>
            </div>
            <div className="flex gap-2">
              {job.status && (
                <Badge 
                  variant={
                    job.status === 'approved' ? 'success' :
                    job.status === 'pending' ? 'outline' :
                    job.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }
                  className="capitalize"
                >
                  {job.status}
                </Badge>
              )}
              {job.isFeatured && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                  Featured
                </Badge>
              )}
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
              <span>{job.type.replace('_', ' ')}</span>
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

          <div className="space-y-2">
            <h4 className="font-medium">Admin Notes</h4>
            <Textarea
              placeholder="Enter any notes about this job listing (required for rejection)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleFeature}
              disabled={isProcessing}
              className={job.isFeatured ? "border-amber-500 text-amber-600" : ""}
            >
              <Star className="h-4 w-4 mr-1" />
              {job.isFeatured ? "Unfeature" : "Feature"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              size="sm"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobApprovalModal;