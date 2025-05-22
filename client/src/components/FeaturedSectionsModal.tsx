import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info, X, Plus } from "lucide-react";

interface FeaturedSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  jobs: any[];
  companies: any[];
}

const FeaturedSectionsModal = ({ 
  isOpen, 
  onClose, 
  initialData,
  jobs,
  companies
}: FeaturedSectionsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Hero section state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroEnabled, setHeroEnabled] = useState(true);
  
  // Featured Jobs state
  const [featuredJobs, setFeaturedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  
  // Featured Companies state
  const [featuredCompanies, setFeaturedCompanies] = useState<number[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      // Set hero data
      if (initialData.homepageHero) {
        setHeroTitle(initialData.homepageHero.title || "");
        setHeroSubtitle(initialData.homepageHero.subtitle || "");
        setHeroEnabled(initialData.homepageHero.enabled !== false);
      }
      
      // Set featured jobs
      if (initialData.featuredJobs && Array.isArray(initialData.featuredJobs)) {
        setFeaturedJobs(initialData.featuredJobs);
      }
      
      // Set featured companies
      if (initialData.featuredCompanies && Array.isArray(initialData.featuredCompanies)) {
        setFeaturedCompanies(initialData.featuredCompanies);
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const updatedData = {
      homepageHero: {
        title: heroTitle,
        subtitle: heroSubtitle,
        enabled: heroEnabled
      },
      featuredJobs,
      featuredCompanies
    };
    
    try {
      await apiRequest('/api/admin/featured-sections', "PATCH", 
        JSON.stringify(updatedData)
      );
      
      toast({
        title: "Success",
        description: "Featured sections updated successfully",
      });
      
      // Refresh featured sections data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/featured-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/featured'] });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Error updating featured sections:", error);
      toast({
        title: "Error",
        description: "Failed to update featured sections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addJobToFeatured = () => {
    if (!selectedJob) return;
    
    const jobId = parseInt(selectedJob);
    if (!featuredJobs.includes(jobId)) {
      setFeaturedJobs([...featuredJobs, jobId]);
    }
    
    setSelectedJob("");
  };
  
  const removeJobFromFeatured = (jobId: number) => {
    setFeaturedJobs(featuredJobs.filter(id => id !== jobId));
  };
  
  const addCompanyToFeatured = () => {
    if (!selectedCompany) return;
    
    const companyId = parseInt(selectedCompany);
    if (!featuredCompanies.includes(companyId)) {
      setFeaturedCompanies([...featuredCompanies, companyId]);
    }
    
    setSelectedCompany("");
  };
  
  const removeCompanyFromFeatured = (companyId: number) => {
    setFeaturedCompanies(featuredCompanies.filter(id => id !== companyId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Featured Sections Configuration</DialogTitle>
          <DialogDescription>
            Configure the featured content that appears on the homepage
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="hero" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="hero">Homepage Hero</TabsTrigger>
              <TabsTrigger value="jobs">Featured Jobs</TabsTrigger>
              <TabsTrigger value="companies">Featured Companies</TabsTrigger>
            </TabsList>
            
            {/* Homepage Hero Tab */}
            <TabsContent value="hero" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Find Your Dream Job in Rwanda"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Browse thousands of job opportunities across Rwanda"
                  disabled={isLoading}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="heroEnabled"
                  checked={heroEnabled}
                  onCheckedChange={setHeroEnabled}
                  disabled={isLoading}
                />
                <Label htmlFor="heroEnabled">Enable Hero Section</Label>
              </div>
            </TabsContent>
            
            {/* Featured Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="jobSelect">Select Job to Feature</Label>
                  <Select
                    value={selectedJob}
                    onValueChange={setSelectedJob}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs
                        .filter(job => !featuredJobs.includes(job.id))
                        .map(job => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title} - {job.companyName || 'Unknown Company'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  onClick={addJobToFeatured}
                  disabled={!selectedJob || isLoading}
                  className="bg-[#0A3D62] hover:bg-[#082C46]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div>
                <Label>Featured Jobs</Label>
                <div className="border rounded-md min-h-[100px] mt-2 p-4">
                  {featuredJobs.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-neutral-500">
                      <Info className="h-4 w-4 mr-2" />
                      No jobs featured. Add jobs from the selection above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {featuredJobs.map(jobId => {
                        const job = jobs.find(j => j.id === jobId);
                        return (
                          <div 
                            key={jobId}
                            className="flex justify-between items-center border rounded p-2"
                          >
                            <div>
                              {job ? (
                                <>
                                  <p className="font-medium">{job.title}</p>
                                  <p className="text-sm text-neutral-500">
                                    {job.companyName || 'Unknown Company'}
                                  </p>
                                </>
                              ) : (
                                <p>Job #{jobId} (Not Found)</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeJobFromFeatured(jobId)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Featured Companies Tab */}
            <TabsContent value="companies" className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="companySelect">Select Company to Feature</Label>
                  <Select
                    value={selectedCompany}
                    onValueChange={setSelectedCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies
                        .filter(company => !featuredCompanies.includes(company.id))
                        .map(company => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  onClick={addCompanyToFeatured}
                  disabled={!selectedCompany || isLoading}
                  className="bg-[#0A3D62] hover:bg-[#082C46]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div>
                <Label>Featured Companies</Label>
                <div className="border rounded-md min-h-[100px] mt-2 p-4">
                  {featuredCompanies.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-neutral-500">
                      <Info className="h-4 w-4 mr-2" />
                      No companies featured. Add companies from the selection above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {featuredCompanies.map(companyId => {
                        const company = companies.find(c => c.id === companyId);
                        return (
                          <div 
                            key={companyId}
                            className="flex justify-between items-center border rounded p-2"
                          >
                            <div>
                              {company ? (
                                <>
                                  <p className="font-medium">{company.name}</p>
                                  <p className="text-sm text-neutral-500">
                                    {company.industry}
                                  </p>
                                </>
                              ) : (
                                <p>Company #{companyId} (Not Found)</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCompanyFromFeatured(companyId)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-[#0A3D62] hover:bg-[#082C46]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedSectionsModal;