import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import OnboardingTour from "@/components/OnboardingTour";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  FileText, 
  Bell, 
  Search, 
  Award, 
  BookOpen, 
  ChevronRight, 
  Clock,
  MapPin,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Settings,
  BarChart
} from "lucide-react";
import { ApplicationStatus } from "@/lib/types";
import { Application, Job } from "@shared/schema";
import { format, addDays } from "date-fns";
import AccountSettings from "@/components/AccountSettings";

// Extended types for applications with job details
type ApplicationWithJob = Application & {
  job: Job;
};

const JobSeekerDashboard = () => {
  const { currentUser } = useFirebaseAuth();
  const { isTourOpen, closeTour, startTour } = useOnboardingTour();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [applicationFilter, setApplicationFilter] = useState<string>('all');

  // Redirect if not authenticated - check before any hooks
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch job seeker profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/jobseeker/profile'],
    enabled: !!currentUser, // Only run query if user is logged in
  });

  // Fetch applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/jobseeker/applications'],
    enabled: !!currentUser, // Only run query if user is logged in
  });
  
  // Fetch recommended jobs
  const { data: recommendedJobs = [], isLoading: isLoadingRecommendedJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobseeker/recommended-jobs'],
    enabled: !!currentUser, // Only run query if user is logged in
  });
  
  // If not authenticated, show a loading state instead of redirecting directly
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Checking authentication...</h2>
          <p className="text-neutral-600">You'll be redirected to login if not authenticated.</p>
        </div>
      </div>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    // Fields to check for completion
    const fields = [
      !!profile.title,
      !!profile.skills && profile.skills.length > 0,
      !!profile.experience,
      !!profile.education,
      !!profile.resumeUrl
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletionPercentage = calculateProfileCompletion();
  
  // Get recent applications
  const recentApplications = applications.slice(0, 3);
  
  // Filter applications based on selected filter
  const filteredApplications = applications.filter(app => 
    applicationFilter === 'all' || app.status === applicationFilter
  );
  
  // Count applications by status
  const applicationStatusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format application status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\w\S*/g, txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return "bg-blue-100 text-blue-800";
      case 'interview_scheduled':
        return "bg-purple-100 text-purple-800";
      case 'reviewed':
        return "bg-yellow-100 text-yellow-800";
      case 'hired':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status)}>
        {formatStatus(status)}
      </Badge>
    );
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Business In Rwanda</title>
        <meta name="description" content="Manage your job applications and profile on Business In Rwanda" />
        <meta property="og:title" content="Dashboard - Business In Rwanda" />
        <meta property="og:description" content="Manage your job applications and profile on Business In Rwanda" />
      </Helmet>
      
      <div className="bg-neutral-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-12 md:col-span-3 space-y-6">
              
              {/* Profile Card */}
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-24 h-24 relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={currentUser.profilePicture} alt={currentUser.fullName} />
                      <AvatarFallback className="text-lg">
                        {currentUser.fullName ? getInitials(currentUser.fullName) : 'JS'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-lg">{currentUser.fullName}</CardTitle>
                  <CardDescription>
                    {profile?.title || "Job Seeker"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Profile Completion</p>
                      <div className="space-y-2">
                        <Progress value={profileCompletionPercentage} className="h-2" />
                        <p className="text-xs text-right">{profileCompletionPercentage}% Complete</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("applications")}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        Applications
                        <Badge variant="secondary" className="ml-auto">
                          {applications.length}
                        </Badge>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate("/find-jobs")}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Find Jobs
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start opacity-50"
                        disabled
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications 
                        <Badge variant="secondary" className="ml-auto">
                          0
                        </Badge>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start opacity-50"
                        disabled
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Skills Assessment
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start opacity-50"
                        disabled
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-100 p-3 rounded-lg">
                      <p className="text-sm text-neutral-500">Total</p>
                      <p className="text-2xl font-semibold">{applications.length}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Interviews</p>
                      <p className="text-2xl font-semibold">{applicationStatusCounts['interview_scheduled'] || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600">In Review</p>
                      <p className="text-2xl font-semibold">{applicationStatusCounts['reviewed'] || 0}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Applied</p>
                      <p className="text-2xl font-semibold">{applicationStatusCounts['applied'] || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="col-span-12 md:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="overview" className="flex items-center gap-1">
                    <BarChart className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Applications</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span>Account</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dashboard Overview</CardTitle>
                      <CardDescription>
                        Welcome back, {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'there'}! Here's an overview of your job search.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Profile Completion */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Complete Your Profile</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <p className="text-sm">Profile Completion</p>
                                  <p className="text-sm font-medium">{profileCompletionPercentage}%</p>
                                </div>
                                <Progress value={profileCompletionPercentage} className="h-2" />
                              </div>
                              
                              {profileCompletionPercentage < 100 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <p className="text-sm text-amber-800">
                                    Complete your profile to attract more job opportunities and increase your chances of getting hired.
                                  </p>
                                </div>
                              )}
                              
                              <Button 
                                onClick={() => setActiveTab("profile")}
                                className="w-full"
                                variant={profileCompletionPercentage < 100 ? "default" : "outline"}
                              >
                                {profileCompletionPercentage < 100 ? "Complete Your Profile" : "View Your Profile"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Application Status */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Application Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-neutral-100 p-3 rounded-lg">
                                  <p className="text-sm text-neutral-500">Total Applications</p>
                                  <p className="text-2xl font-semibold">{applications.length}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <p className="text-sm text-green-600">Interview Invites</p>
                                  <p className="text-2xl font-semibold">{applicationStatusCounts['interview_scheduled'] || 0}</p>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => setActiveTab("applications")}
                                className="w-full"
                                variant="outline"
                              >
                                View All Applications
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Recent Applications */}
                      {recentApplications.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Recent Applications</h3>
                          <div className="space-y-3">
                            {recentApplications.map((application) => (
                              <Card key={application.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                      <Avatar className="h-10 w-10 mt-1">
                                        <AvatarFallback>
                                          {application && application.job && application.job.companyName ? application.job.companyName.charAt(0) : 'C'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{application && application.job ? application.job.title : 'Job Title'}</p>
                                        <p className="text-sm text-neutral-500">{application && application.job && application.job.companyName ? application.job.companyName : 'Company'}</p>
                                        <div className="flex items-center text-sm text-neutral-500 mt-1 space-x-2">
                                          <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {application && application.job ? application.job.location : 'Location'}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Applied {application && application.appliedAt ? format(new Date(application.appliedAt), 'MMM d, yyyy') : 'Recently'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      {application && application.status ? getStatusBadge(application.status) : getStatusBadge('applied')}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          {applications.length > 3 && (
                            <div className="mt-3 text-center">
                              <Button 
                                onClick={() => setActiveTab("applications")}
                                variant="link"
                              >
                                View All Applications
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Job Recommendations */}
                      {recommendedJobs.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Recommended for You</h3>
                          <div className="space-y-3">
                            {recommendedJobs.slice(0, 3).map((job) => (
                              <Card key={job.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                      <Avatar className="h-10 w-10 mt-1">
                                        <AvatarFallback>
                                          {job.companyName ? job.companyName.charAt(0) : 'C'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{job.title}</p>
                                        <p className="text-sm text-neutral-500">{job.companyName || 'Company'}</p>
                                        <div className="flex items-center text-sm text-neutral-500 mt-1 space-x-2">
                                          <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {job && job.location ? job.location : 'Location'}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center">
                                            <Building className="h-3 w-3 mr-1" />
                                            {job && job.type ? job.type : 'Job Type'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={job && job.id ? `/jobs/${job.id}` : '/jobs'}>
                                        View
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="mt-3 text-center">
                            <Button 
                              onClick={() => navigate("/find-jobs")}
                              variant="link"
                            >
                              Find More Jobs
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Applications</CardTitle>
                      <CardDescription>
                        Track and manage all your job applications in one place.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applications.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                            <Briefcase className="h-6 w-6 text-neutral-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No Applications Yet</h3>
                          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                            You haven't applied to any jobs yet. Start exploring opportunities and submit your first application.
                          </p>
                          <Button onClick={() => navigate("/find-jobs")}>
                            Find Jobs to Apply
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Application Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                            <Card className="bg-neutral-50">
                              <CardContent className="p-3">
                                <p className="text-sm text-neutral-500">Total</p>
                                <p className="text-2xl font-semibold">{applications.length}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-blue-50">
                              <CardContent className="p-3">
                                <p className="text-sm text-blue-600">Applied</p>
                                <p className="text-2xl font-semibold">{applicationStatusCounts['applied'] || 0}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-yellow-50">
                              <CardContent className="p-3">
                                <p className="text-sm text-yellow-600">Reviewed</p>
                                <p className="text-2xl font-semibold">{applicationStatusCounts['reviewed'] || 0}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-purple-50">
                              <CardContent className="p-3">
                                <p className="text-sm text-purple-600">Interviews</p>
                                <p className="text-2xl font-semibold">{applicationStatusCounts['interview_scheduled'] || 0}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-green-50">
                              <CardContent className="p-3">
                                <p className="text-sm text-green-600">Offers</p>
                                <p className="text-2xl font-semibold">{applicationStatusCounts['hired'] || 0}</p>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {/* Filter Controls */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            <Button 
                              variant={applicationFilter === 'all' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setApplicationFilter('all')}
                            >
                              All Applications
                            </Button>
                            <Button 
                              variant={applicationFilter === 'interview_scheduled' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setApplicationFilter('interview_scheduled')}
                              className={applicationStatusCounts['interview_scheduled'] ? '' : 'opacity-50'}
                              disabled={!applicationStatusCounts['interview_scheduled']}
                            >
                              Interviews
                              {applicationStatusCounts['interview_scheduled'] ? 
                                <Badge variant="secondary" className="ml-2">{applicationStatusCounts['interview_scheduled']}</Badge> : null}
                            </Button>
                            <Button 
                              variant={applicationFilter === 'hired' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setApplicationFilter('hired')}
                              className={applicationStatusCounts['hired'] ? '' : 'opacity-50'}
                              disabled={!applicationStatusCounts['hired']}
                            >
                              Offers
                              {applicationStatusCounts['hired'] ? 
                                <Badge variant="secondary" className="ml-2">{applicationStatusCounts['hired']}</Badge> : null}
                            </Button>
                            <Button 
                              variant={applicationFilter === 'rejected' ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setApplicationFilter('rejected')}
                              className={applicationStatusCounts['rejected'] ? '' : 'opacity-50'}
                              disabled={!applicationStatusCounts['rejected']}
                            >
                              Rejected
                              {applicationStatusCounts['rejected'] ? 
                                <Badge variant="secondary" className="ml-2">{applicationStatusCounts['rejected']}</Badge> : null}
                            </Button>
                          </div>

                          {/* Applications List */}
                          <div className="space-y-4">
                            {filteredApplications.map((application) => (
                              <Card key={application.id} className={application.status === 'interview_scheduled' ? 'border-2 border-purple-200' : ''}>
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start space-x-4">
                                      <Avatar className="h-12 w-12 mt-1">
                                        <AvatarFallback>
                                          {application && application.job && application.job.companyName ? application.job.companyName.charAt(0) : 'C'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{application && application.job ? application.job.title : 'Job Title'}</p>
                                        <p className="text-sm text-neutral-500">{application && application.job && application.job.companyName ? application.job.companyName : 'Company'}</p>
                                        <div className="flex flex-wrap items-center text-sm text-neutral-500 mt-1 gap-x-2 gap-y-1">
                                          <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {application && application.job ? application.job.location : 'Location'}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center">
                                            <Building className="h-3 w-3 mr-1" />
                                            {application && application.job && application.job.type ? application.job.type.replace('_', ' ') : 'Job Type'}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Applied {application && application.appliedAt ? format(new Date(application.appliedAt), 'MMM d, yyyy') : 'Recently'}
                                          </span>
                                        </div>
                                        
                                        {/* Interview Info - Shown only if interview is scheduled */}
                                        {application && application.status === 'interview_scheduled' && (
                                          <div className="mt-2 bg-purple-50 p-2 rounded-md">
                                            <p className="text-sm font-medium text-purple-800 flex items-center">
                                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                              Interview Scheduled
                                            </p>
                                            <p className="text-sm text-purple-700 mt-1">
                                              {/* This would come from the database in a real app */}
                                              {format(addDays(new Date(), Math.floor(Math.random() * 7) + 1), 'EEEE, MMM d, yyyy')} at {format(new Date().setHours(10 + Math.floor(Math.random() * 7), 0), 'h:mm a')}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                Add to Calendar
                                              </Button>
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                Reschedule
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Feedback - Shown for reviewed or rejected applications */}
                                        {(application.status === 'reviewed' || application.status === 'rejected') && (
                                          <div className={`mt-2 ${application.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'} p-2 rounded-md`}>
                                            <p className={`text-sm font-medium ${application.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'} flex items-center`}>
                                              {application.status === 'rejected' ? 
                                                <XCircle className="h-3.5 w-3.5 mr-1.5" /> :
                                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                              }
                                              {application.status === 'rejected' ? 'Feedback from Employer' : 'Application Reviewed'}
                                            </p>
                                            <p className={`text-sm ${application.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'} mt-1`}>
                                              {application.status === 'rejected' ? 
                                                "Thank you for your interest. We've decided to move forward with other candidates at this time." :
                                                "Your application is being considered. We'll be in touch soon about next steps."
                                              }
                                            </p>
                                          </div>
                                        )}
                                        
                                        {/* Offer - Shown for hired status */}
                                        {application.status === 'hired' && (
                                          <div className="mt-2 bg-green-50 p-2 rounded-md">
                                            <p className="text-sm font-medium text-green-800 flex items-center">
                                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                              Offer Received
                                            </p>
                                            <p className="text-sm text-green-700 mt-1">
                                              Congratulations! You've received a job offer.
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                View Offer Details
                                              </Button>
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                Accept Offer
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-3 self-end md:self-auto">
                                      {application && application.status ? getStatusBadge(application.status) : getStatusBadge('applied')}
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                          <Link href={application && application.job && application.job.id ? `/jobs/${application.job.id}` : '/jobs'}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Job
                                          </Link>
                                        </Button>
                                        {application && application.resumeUrl && (
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                              <Download className="h-4 w-4 mr-1" />
                                              Resume
                                            </a>
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Status Timeline */}
                                  <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <p className="text-sm font-medium">Application Status</p>
                                      <p className="text-xs text-neutral-500">Last updated: {format(new Date(application.updatedAt), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="flex items-center flex-1">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="h-1 flex-1 bg-neutral-200 relative">
                                          <div className={`h-1 absolute left-0 top-0 ${application.status !== 'applied' ? 'bg-green-500 w-full' : 'w-0'}`} />
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${application.status === 'applied' ? 'bg-neutral-100' : 'bg-green-100'}`}>
                                          {application.status === 'applied' ? (
                                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                          ) : (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          )}
                                        </div>
                                        <div className="h-1 flex-1 bg-neutral-200 relative">
                                          <div className={`h-1 absolute left-0 top-0 ${['reviewed', 'interview_scheduled', 'hired'].includes(application.status) ? 'bg-green-500 w-full' : 'w-0'}`} />
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center flex-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${application.status === 'reviewed' ? 'bg-yellow-100' : application.status === 'applied' ? 'bg-neutral-100' : 'bg-green-100'}`}>
                                          {application.status === 'reviewed' ? (
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                          ) : ['interview_scheduled', 'hired'].includes(application.status) ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                          )}
                                        </div>
                                        <div className="h-1 flex-1 bg-neutral-200 relative">
                                          <div className={`h-1 absolute left-0 top-0 ${['interview_scheduled', 'hired'].includes(application.status) ? 'bg-green-500 w-full' : 'w-0'}`} />
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${application.status === 'interview_scheduled' ? 'bg-purple-100' : application.status === 'hired' ? 'bg-green-100' : 'bg-neutral-100'}`}>
                                          {application.status === 'interview_scheduled' ? (
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                          ) : application.status === 'hired' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <div className="w-2 h-2 rounded-full bg-neutral-400" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex text-xs justify-between mt-1">
                                      <span>Applied</span>
                                      <span>Reviewed</span>
                                      <span>Interview</span>
                                      <span>Hired</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Profile</CardTitle>
                      <CardDescription>
                        Manage your personal information and resume to showcase to employers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                          <Card>
                            <CardContent className="p-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                  <label className="text-sm text-neutral-500">Full Name</label>
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src={currentUser.profilePicture} alt={currentUser.fullName} />
                                      <AvatarFallback>
                                        {currentUser.fullName ? getInitials(currentUser.fullName) : 'JS'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{currentUser.fullName}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="text-sm text-neutral-500">Email Address</label>
                                  <p className="font-medium">{currentUser.email}</p>
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="text-sm text-neutral-500">Phone Number</label>
                                  <p className="font-medium">{currentUser.phone || "-"}</p>
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="text-sm text-neutral-500">Location</label>
                                  <p className="font-medium">{currentUser.location || "-"}</p>
                                </div>
                              </div>
                              
                              <div className="mt-6 text-right">
                                <Button variant="outline" size="sm">
                                  Edit Personal Information
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Professional Information */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Professional Information</h3>
                          <Card>
                            <CardContent className="p-6">
                              <div className="space-y-6">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Professional Title</label>
                                    <Badge variant={!!profile?.title ? "success" : "outline"}>
                                      {!!profile?.title ? "Completed" : "Missing"}
                                    </Badge>
                                  </div>
                                  <p>{profile?.title || "-"}</p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Skills</label>
                                    <Badge variant={!!profile?.skills && profile.skills.length > 0 ? "success" : "outline"}>
                                      {!!profile?.skills && profile.skills.length > 0 ? "Completed" : "Missing"}
                                    </Badge>
                                  </div>
                                  {profile?.skills && profile.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary">{skill}</Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <p>-</p>
                                  )}
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Experience</label>
                                    <Badge variant={!!profile?.experience ? "success" : "outline"}>
                                      {!!profile?.experience ? "Completed" : "Missing"}
                                    </Badge>
                                  </div>
                                  <p className="whitespace-pre-line">{profile?.experience || "-"}</p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Education</label>
                                    <Badge variant={!!profile?.education ? "success" : "outline"}>
                                      {!!profile?.education ? "Completed" : "Missing"}
                                    </Badge>
                                  </div>
                                  <p className="whitespace-pre-line">{profile?.education || "-"}</p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium">Resume</label>
                                    <Badge variant={!!profile?.resumeUrl ? "success" : "outline"}>
                                      {!!profile?.resumeUrl ? "Uploaded" : "Missing"}
                                    </Badge>
                                  </div>
                                  {profile?.resumeUrl ? (
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 mr-2 text-neutral-500" />
                                      <span className="text-sm">resume.pdf</span>
                                      <Button variant="ghost" size="sm" className="ml-2">
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  ) : (
                                    <p>No resume uploaded</p>
                                  )}
                                </div>
                                
                                <div className="mt-6 text-right">
                                  <Button variant="outline" size="sm">
                                    Edit Professional Information
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Cover Letter Template */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Cover Letter Template</h3>
                          <Card>
                            <CardContent className="p-6">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-medium">Default Cover Letter</label>
                                  <Badge variant={!!profile?.coverLetterUrl ? "success" : "outline"}>
                                    {!!profile?.coverLetterUrl ? "Uploaded" : "Missing"}
                                  </Badge>
                                </div>
                                
                                {profile?.coverLetterUrl ? (
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-neutral-500" />
                                    <span className="text-sm">cover-letter.pdf</span>
                                    <Button variant="ghost" size="sm" className="ml-2">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                                    <p className="text-sm text-neutral-600 mb-4">
                                      Upload a default cover letter template that you can customize for each job application. A good cover letter helps you stand out from other candidates.
                                    </p>
                                    <Button size="sm">
                                      Upload Cover Letter
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t pt-6">
                      <div />
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Account Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <AccountSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobSeekerDashboard;