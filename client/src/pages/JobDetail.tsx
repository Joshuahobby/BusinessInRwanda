import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Job } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, Briefcase, DollarSign, Building, Share2, BookmarkPlus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobDetail = () => {
  // Use the useRoute hook from wouter to get route parameters for various post types
  const [matchesJob, jobParams] = useRoute<{ id: string }>('/job/:id');
  const [matchesTender, tenderParams] = useRoute<{ id: string }>('/tender/:id');
  const [matchesAuction, auctionParams] = useRoute<{ id: string }>('/auction/:id');
  const [matchesAnnouncement, announcementParams] = useRoute<{ id: string }>('/announcement/:id');
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isJobSeeker } = useFirebaseAuth();
  
  // Determine which route matched and set corresponding post type
  const postType = matchesJob ? 'job' : 
                  matchesTender ? 'tender' : 
                  matchesAuction ? 'auction' :
                  matchesAnnouncement ? 'announcement' : null;
                  
  // Extract post ID from appropriate params
  const postId = jobParams?.id || tenderParams?.id || auctionParams?.id || announcementParams?.id || null;
  
  // Extract job ID from params, if available
  const jobId = postId ? parseInt(postId) : null;

  // Fetch job details
  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId
  });

  // Application mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/jobs/${jobId}/apply`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Application submitted',
        description: 'Your application has been successfully submitted.',
      });
      
      // Invalidate job applications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Application failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in or register to apply for this job.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!isJobSeeker()) {
      toast({
        title: 'Not allowed',
        description: 'Only job seekers can apply for jobs.',
        variant: 'destructive',
      });
      return;
    }

    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-[600px] bg-white animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading this job. Please try again later or check if the job exists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${job.title} ${
          postType === 'job' ? 'Job' :
          postType === 'tender' ? 'Tender' :
          postType === 'auction' ? 'Auction' :
          postType === 'announcement' ? 'Announcement' : ''
        } - Business In Rwanda`}</title>
        <meta name="description" content={`${
          postType === 'job' ? `Apply for ${job.title} position` :
          postType === 'tender' ? `Submit proposal for ${job.title} tender` :
          postType === 'auction' ? `Place bid on ${job.title} auction` :
          postType === 'announcement' ? `View details of ${job.title} announcement` :
          `View ${job.title}`
        }. ${job.description.substring(0, 150)}...`} />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded bg-neutral-100 flex items-center justify-center">
                      <Building className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-heading">{job.title}</CardTitle>
                      <CardDescription className="text-base">Company Name</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap md:flex-nowrap">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      aria-label="Save job"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      aria-label="Share job"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="bg-[#0A3D62] hover:bg-[#082C46] ml-auto md:ml-2 w-full md:w-auto"
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? 'Submitting...' : 
                        postType === 'job' ? 'Apply Now' :
                        postType === 'tender' ? 'Submit Proposal' :
                        postType === 'auction' ? 'Place Bid' :
                        postType === 'announcement' ? 'Download Details' :
                        'Apply Now'
                      }
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-neutral-500" />
                    <div>
                      <div className="text-sm text-neutral-500">Location</div>
                      <div className="font-medium">{job.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-neutral-500" />
                    <div>
                      <div className="text-sm text-neutral-500">Job Type</div>
                      <div className="font-medium capitalize">{job.type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-neutral-500" />
                    <div>
                      <div className="text-sm text-neutral-500">Salary</div>
                      <div className="font-medium">{job.salary || 'Competitive'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-neutral-500" />
                    <div>
                      <div className="text-sm text-neutral-500">Posted</div>
                      <div className="font-medium">{formatDistanceToNow(job.createdAt, { addSuffix: true })}</div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="description">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="company">About Company</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="pt-4">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium mb-2">Job Description</h3>
                      <p className="mb-4">{job.description}</p>
                      
                      {job.responsibilities && (
                        <>
                          <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
                          <p className="mb-4">{job.responsibilities}</p>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="requirements" className="pt-4">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium mb-2">Requirements</h3>
                      <p className="mb-4">{job.requirements}</p>
                      
                      <h3 className="text-lg font-medium mb-2">Experience Level</h3>
                      <p className="mb-4 capitalize">{job.experienceLevel.replace('_', ' ')}</p>
                      
                      {job.deadline && (
                        <>
                          <h3 className="text-lg font-medium mb-2">Application Deadline</h3>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-neutral-500" />
                            <p>{new Date(job.deadline).toLocaleDateString()}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="company" className="pt-4">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium mb-2">About Company Name</h3>
                      <p className="mb-4">
                        Company information would be displayed here, including description, industry, and other relevant details.
                      </p>
                      
                      <Button variant="link" className="p-0 text-[#0A3D62]">
                        Visit Company Profile
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-6">
                <div className="text-sm text-neutral-500 mb-4 sm:mb-0">
                  Job ID: {job.id}
                </div>
                <Button 
                  className="bg-[#0A3D62] hover:bg-[#082C46] w-full sm:w-auto"
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? 'Submitting...' : 
                    postType === 'job' ? 'Apply Now' :
                    postType === 'tender' ? 'Submit Proposal' :
                    postType === 'auction' ? 'Place Bid' :
                    postType === 'announcement' ? 'Download Details' :
                    'Apply Now'
                  }
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-4">Similar Jobs</h2>
              <div className="text-center py-4 text-neutral-500">
                Similar jobs will be displayed here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetail;
