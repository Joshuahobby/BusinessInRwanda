import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Gavel, 
  FileText, 
  Megaphone, 
  Upload, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface OpportunityClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Job | null;
}

type ClaimType = "application" | "bid" | "proposal" | "interest";

const OpportunityClaimModal = ({ isOpen, onClose, opportunity }: OpportunityClaimModalProps) => {
  const { currentUser, isAuthenticated } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Form states for different claim types
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [currency, setCurrency] = useState("RWF");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [message, setMessage] = useState("");
  const [contactPreference, setContactPreference] = useState("email");
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [documentsUrl, setDocumentsUrl] = useState("");

  if (!opportunity) return null;

  const getClaimType = (): ClaimType => {
    switch (opportunity.postType) {
      case "auction": return "bid";
      case "tender": return "proposal";
      case "announcement": return "interest";
      default: return "application";
    }
  };

  const getClaimConfig = () => {
    const claimType = getClaimType();
    
    const configs = {
      application: {
        icon: <Briefcase className="w-6 h-6" />,
        title: "Apply for Job",
        description: "Submit your application for this position",
        actionText: "Submit Application",
        color: "bg-blue-50 border-blue-200 text-blue-800"
      },
      bid: {
        icon: <Gavel className="w-6 h-6" />,
        title: "Place Your Bid",
        description: "Submit your competitive bid for this auction",
        actionText: "Place Bid",
        color: "bg-purple-50 border-purple-200 text-purple-800"
      },
      proposal: {
        icon: <FileText className="w-6 h-6" />,
        title: "Submit Proposal",
        description: "Present your proposal for this tender opportunity",
        actionText: "Submit Proposal",
        color: "bg-indigo-50 border-indigo-200 text-indigo-800"
      },
      interest: {
        icon: <Megaphone className="w-6 h-6" />,
        title: "Register Interest",
        description: "Stay informed about this announcement",
        actionText: "Register Interest",
        color: "bg-amber-50 border-amber-200 text-amber-800"
      }
    };

    return configs[claimType];
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const claimType = getClaimType();

    try {
      let endpoint = "";
      let payload = {};

      switch (claimType) {
        case "application":
          endpoint = `/api/jobs/${opportunity.id}/apply`;
          payload = {
            coverLetter,
            documentsUrl
          };
          break;
          
        case "bid":
          if (!bidAmount || parseFloat(bidAmount) <= 0) {
            toast({
              title: "Invalid Bid",
              description: "Please enter a valid bid amount",
              variant: "destructive"
            });
            return;
          }
          endpoint = `/api/jobs/${opportunity.id}/bid`;
          payload = {
            bidAmount: parseFloat(bidAmount),
            currency,
            message,
            documentsUrl
          };
          break;
          
        case "proposal":
          if (!proposalTitle.trim() || !proposalDescription.trim()) {
            toast({
              title: "Incomplete Proposal",
              description: "Please provide both title and description",
              variant: "destructive"
            });
            return;
          }
          endpoint = `/api/jobs/${opportunity.id}/proposal`;
          payload = {
            proposalTitle,
            proposalDescription,
            proposedAmount: proposedAmount ? parseFloat(proposedAmount) : null,
            currency,
            documentsUrl,
            coverLetter
          };
          break;
          
        case "interest":
          endpoint = `/api/jobs/${opportunity.id}/interest`;
          payload = {
            message,
            contactPreference,
            notifyUpdates
          };
          break;
      }

      await apiRequest(endpoint, "POST", payload);
      
      const config = getClaimConfig();
      toast({
        title: "Success!",
        description: `Your ${claimType} has been submitted successfully.`
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobseeker/applications'] });
      
      onClose();
      resetForm();
      
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCoverLetter("");
    setBidAmount("");
    setCurrency("RWF");
    setProposalTitle("");
    setProposalDescription("");
    setProposedAmount("");
    setMessage("");
    setContactPreference("email");
    setNotifyUpdates(true);
    setDocumentsUrl("");
    setActiveTab("details");
  };

  const config = getClaimConfig();
  const claimType = getClaimType();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-xl">{config.title}</DialogTitle>
              <DialogDescription className="text-base">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Opportunity Details</TabsTrigger>
            <TabsTrigger value="submit">Submit {claimType.charAt(0).toUpperCase() + claimType.slice(1)}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {opportunity.title}
                  <Badge variant="secondary">{opportunity.postType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neutral-600">{opportunity.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {opportunity.location && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Location:</span>
                      <span>{opportunity.location}</span>
                    </div>
                  )}
                  
                  {opportunity.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">Deadline:</span>
                      <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {opportunity.salaryMin && opportunity.salaryMax && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Range:</span>
                      <span>
                        {opportunity.salaryMin.toLocaleString()} - {opportunity.salaryMax.toLocaleString()} {opportunity.currency}
                      </span>
                    </div>
                  )}
                </div>

                {opportunity.requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-sm text-neutral-600">{opportunity.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="submit" className="space-y-4">
            {claimType === "application" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're the perfect fit for this role..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="documents">Resume/Documents URL (optional)</Label>
                  <Input
                    id="documents"
                    value={documentsUrl}
                    onChange={(e) => setDocumentsUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/your-resume"
                    className="mt-1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Link to your resume, portfolio, or other relevant documents
                  </p>
                </div>
              </div>
            )}

            {claimType === "bid" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bid-amount">Bid Amount *</Label>
                    <Input
                      id="bid-amount"
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your bid"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWF">RWF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bid-message">Additional Message (optional)</Label>
                  <Textarea
                    id="bid-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any additional information about your bid..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bid-docs">Supporting Documents (optional)</Label>
                  <Input
                    id="bid-docs"
                    value={documentsUrl}
                    onChange={(e) => setDocumentsUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/your-documents"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {claimType === "proposal" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proposal-title">Proposal Title *</Label>
                  <Input
                    id="proposal-title"
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    placeholder="Enter a compelling title for your proposal"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="proposal-description">Proposal Description *</Label>
                  <Textarea
                    id="proposal-description"
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    placeholder="Describe your proposal, approach, timeline, and deliverables..."
                    rows={6}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proposed-amount">Proposed Amount (optional)</Label>
                    <Input
                      id="proposed-amount"
                      type="number"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      placeholder="Your proposed budget"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="proposal-currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="proposal-currency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWF">RWF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="proposal-cover">Cover Letter</Label>
                  <Textarea
                    id="proposal-cover"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself and your qualifications..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="proposal-docs">Supporting Documents</Label>
                  <Input
                    id="proposal-docs"
                    value={documentsUrl}
                    onChange={(e) => setDocumentsUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/your-portfolio"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {claimType === "interest" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="interest-message">Message (optional)</Label>
                  <Textarea
                    id="interest-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Let them know why you're interested..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-preference">Preferred Contact Method</Label>
                  <Select value={contactPreference} onValueChange={setContactPreference}>
                    <SelectTrigger id="contact-preference" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-updates"
                    checked={notifyUpdates}
                    onCheckedChange={setNotifyUpdates}
                  />
                  <Label htmlFor="notify-updates" className="text-sm">
                    Notify me about updates to this announcement
                  </Label>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || activeTab !== "submit"}
            className="bg-[#0A3D62] hover:bg-[#082C46]"
          >
            {isSubmitting ? "Submitting..." : config.actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityClaimModal;