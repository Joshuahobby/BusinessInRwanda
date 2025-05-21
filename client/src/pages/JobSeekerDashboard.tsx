import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
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
  Download
} from "lucide-react";
import { ApplicationStatus } from "@/lib/types";
import { Application, Job } from "@shared/schema";
import { format } from "date-fns";

// Extended types with additional details
type ApplicationWithJob = Application & {
  job: Job & {
    company: {
      id: number;
      name: string;
      logo?: string;
    }
  }
};

const JobSeekerDashboard = () => {
  const { currentUser } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch job seeker profile - always define hooks before early returns
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/jobseeker/profile'],
    enabled: !!currentUser, // Only run query if user is logged in
  });

  // Fetch applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/jobseeker/applications'],
    enabled: !!currentUser, // Only run query if user is logged in
  });
  
  // Redirect if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // Fetch recommended jobs
  const { data: recommendedJobs = [], isLoading: isLoadingRecommendedJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobseeker/recommended-jobs'],
  });

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

  const profileCompletion = calculateProfileCompletion();

  // Count applications by status
  const applicationCounts = {
    total: applications.length,
    applied: applications.filter(app => app.status === 'applied').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    interview: applications.filter(app => app.status === 'interview_scheduled').length,
    hired: applications.filter(app => app.status === 'hired').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  // Get status badge styling
  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'interview_scheduled':
        return 'outline';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Business In Rwanda</title>
        <meta name="description" content="View your job applications, profile, and recommended jobs on your personal dashboard." />
      </Helmet>

      <div className="bg-neutral-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profilePicture} alt={user.fullName} />
                      <AvatarFallback className="bg-[#0A3D62] text-white">
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.fullName}</CardTitle>
                      <CardDescription>{profile?.title || "Job Seeker"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {profileCompletion < 80 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                      <p className="text-amber-800 font-medium mb-2">Complete your profile</p>
                      <p className="text-amber-700 mb-2">
                        A complete profile increases your chances of getting hired.
                      </p>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-amber-800">Profile completion</span>
                        <span className="text-amber-800 font-medium">{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2 bg-amber-200" />
                    </div>
                  )}

                  <nav className="space-y-1">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("overview")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Overview
                    </Button>
                    <Button
                      variant={activeTab === "applications" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("applications")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Applications
                    </Button>
                    <Button
                      variant={activeTab === "profile" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                    <Button
                      variant={activeTab === "recommendations" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("recommendations")}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Recommended Jobs
                    </Button>
                    <Button
                      variant={activeTab === "alerts" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("alerts")}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Job Alerts
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Dashboard</CardTitle>
                      <CardDescription>
                        Welcome back, {user.fullName.split(' ')[0]}! Here's an overview of your job search.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Total Applications</p>
                                <h3 className="text-2xl font-bold">{applicationCounts.total}</h3>
                              </div>
                              <div className="bg-blue-100 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-[#0A3D62]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Interviews</p>
                                <h3 className="text-2xl font-bold">{applicationCounts.interview}</h3>
                              </div>
                              <div className="bg-green-100 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-[#00A86B]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Matches</p>
                                <h3 className="text-2xl font-bold">{recommendedJobs.length}</h3>
                              </div>
                              <div className="bg-red-100 p-2 rounded-full">
                                <Award className="h-5 w-5 text-[#BD2031]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-6">
                        {/* Recent Applications */}
                        <Card>
                          <CardHeader className="py-4">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base font-medium">Recent Applications</CardTitle>
                              <Button variant="ghost" size="sm" className="text-sm" onClick={() => setActiveTab("applications")}>
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isLoadingApplications ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                  <div key={i} className="h-16 animate-pulse bg-neutral-100 rounded-md"></div>
                                ))}
                              </div>
                            ) : applications.length > 0 ? (
                              <div className="space-y-4">
                                {applications.slice(0, 3).map((application) => (
                                  <div key={application.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center">
                                        {application.job.company.logo ? (
                                          <img
                                            src={application.job.company.logo}
                                            alt={application.job.company.name}
                                            className="h-8 w-8 object-contain"
                                          />
                                        ) : (
                                          <Building className="h-6 w-6 text-neutral-400" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{application.job.title}</p>
                                        <p className="text-xs text-neutral-500">{application.job.company.name}</p>
                                      </div>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(application.status)}>
                                      {application.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-neutral-500">
                                <FileText className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                                <p>No applications yet</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Recommended Jobs */}
                        <Card>
                          <CardHeader className="py-4">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base font-medium">Recommended Jobs</CardTitle>
                              <Button variant="ghost" size="sm" className="text-sm" onClick={() => setActiveTab("recommendations")}>
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isLoadingRecommendedJobs ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                  <div key={i} className="h-16 animate-pulse bg-neutral-100 rounded-md"></div>
                                ))}
                              </div>
                            ) : recommendedJobs.length > 0 ? (
                              <div className="space-y-4">
                                {recommendedJobs.slice(0, 3).map((job) => (
                                  <Link href={`/job/${job.id}`} key={job.id}>
                                    <div className="p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                                      <div className="flex justify-between mb-2">
                                        <h4 className="font-medium">{job.title}</h4>
                                        <Badge variant="outline" className="ml-2">
                                          {job.type.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center text-sm text-neutral-500 space-x-3">
                                        <span className="flex items-center">
                                          <Building className="h-3 w-3 mr-1" />
                                          Company Name {/* Would come from relation */}
                                        </span>
                                        <span className="flex items-center">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {job.location}
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-neutral-500">
                                <Award className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                                <p>Complete your profile to get job recommendations</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Profile Completion */}
                        <Card>
                          <CardHeader className="py-4">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base font-medium">Profile Completion</CardTitle>
                              <Button variant="ghost" size="sm" className="text-sm" onClick={() => setActiveTab("profile")}>
                                Update Profile <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-2 flex justify-between items-center">
                              <div className="text-sm">
                                <span className="font-medium">{profileCompletion}%</span> complete
                              </div>
                              <div className="text-xs text-neutral-500">
                                {5 - Math.ceil(profileCompletion / 20)} items left
                              </div>
                            </div>
                            <Progress value={profileCompletion} className="h-2" />
                            
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center">
                                {profile?.title ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-neutral-300 mr-2" />
                                )}
                                <span className={`text-sm ${!profile?.title ? 'text-neutral-500' : ''}`}>
                                  Add professional title
                                </span>
                              </div>
                              <div className="flex items-center">
                                {profile?.skills && profile.skills.length > 0 ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-neutral-300 mr-2" />
                                )}
                                <span className={`text-sm ${!(profile?.skills && profile.skills.length > 0) ? 'text-neutral-500' : ''}`}>
                                  Add skills
                                </span>
                              </div>
                              <div className="flex items-center">
                                {profile?.experience ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-neutral-300 mr-2" />
                                )}
                                <span className={`text-sm ${!profile?.experience ? 'text-neutral-500' : ''}`}>
                                  Add work experience
                                </span>
                              </div>
                              <div className="flex items-center">
                                {profile?.education ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-neutral-300 mr-2" />
                                )}
                                <span className={`text-sm ${!profile?.education ? 'text-neutral-500' : ''}`}>
                                  Add education
                                </span>
                              </div>
                              <div className="flex items-center">
                                {profile?.resumeUrl ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-neutral-300 mr-2" />
                                )}
                                <span className={`text-sm ${!profile?.resumeUrl ? 'text-neutral-500' : ''}`}>
                                  Upload resume
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">My Applications</CardTitle>
                      <CardDescription>
                        Track and manage your job applications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="all">
                        <TabsList className="mb-4">
                          <TabsTrigger value="all">All ({applicationCounts.total})</TabsTrigger>
                          <TabsTrigger value="applied">Applied ({applicationCounts.applied})</TabsTrigger>
                          <TabsTrigger value="reviewed">Reviewed ({applicationCounts.reviewed})</TabsTrigger>
                          <TabsTrigger value="interview">Interview ({applicationCounts.interview})</TabsTrigger>
                          <TabsTrigger value="hired">Hired ({applicationCounts.hired})</TabsTrigger>
                          <TabsTrigger value="rejected">Rejected ({applicationCounts.rejected})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                          {isLoadingApplications ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((_, i) => (
                                <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded-md"></div>
                              ))}
                            </div>
                          ) : applications.length > 0 ? (
                            <div className="space-y-4">
                              {applications.map((application) => (
                                <Card key={application.id}>
                                  <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                      <div className="sm:w-1/4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center">
                                            {application.job.company.logo ? (
                                              <img
                                                src={application.job.company.logo}
                                                alt={application.job.company.name}
                                                className="h-8 w-8 object-contain"
                                              />
                                            ) : (
                                              <Building className="h-6 w-6 text-neutral-400" />
                                            )}
                                          </div>
                                          <div>
                                            <h3 className="font-medium">{application.job.company.name}</h3>
                                          </div>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(application.status)}>
                                          {application.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <div className="sm:w-3/4">
                                        <div className="mb-3">
                                          <h4 className="font-medium">{application.job.title}</h4>
                                          <div className="flex flex-wrap gap-x-4 text-sm text-neutral-500 mt-1">
                                            <span className="flex items-center">
                                              <MapPin className="h-3 w-3 mr-1" />
                                              {application.job.location}
                                            </span>
                                            <span className="flex items-center">
                                              <Briefcase className="h-3 w-3 mr-1" />
                                              {application.job.type.replace('_', ' ')}
                                            </span>
                                            <span className="flex items-center">
                                              <Calendar className="h-3 w-3 mr-1" />
                                              Applied on {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                          <Link href={`/job/${application.jobId}`}>
                                            <Button variant="outline" size="sm">
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Job
                                            </Button>
                                          </Link>
                                          {application.resumeUrl && (
                                            <Button variant="outline" size="sm">
                                              <Download className="h-4 w-4 mr-2" />
                                              Download Resume
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <FileText className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                              <p className="text-neutral-500 mb-6">
                                Start applying for jobs to build your career in Rwanda
                              </p>
                              <Link href="/find-jobs">
                                <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                                  <Search className="h-4 w-4 mr-2" />
                                  Find Jobs
                                </Button>
                              </Link>
                            </div>
                          )}
                        </TabsContent>

                        {/* Additional tab content for filtered views would go here */}
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">My Profile</CardTitle>
                      <CardDescription>
                        Manage your professional profile and resume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingProfile ? (
                        <div className="space-y-4">
                          <div className="h-32 animate-pulse bg-neutral-100 rounded-md"></div>
                          <div className="h-64 animate-pulse bg-neutral-100 rounded-md"></div>
                        </div>
                      ) : profile ? (
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Personal Information</h3>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="md:w-1/4">
                                <Avatar className="h-24 w-24">
                                  <AvatarImage src={user.profilePicture} alt={user.fullName} />
                                  <AvatarFallback className="bg-[#0A3D62] text-white text-xl">
                                    {user.fullName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="md:w-3/4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-neutral-500">Full Name</p>
                                    <p className="font-medium">{user.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Phone</p>
                                    <p className="font-medium">{user.phone || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Location</p>
                                    <p className="font-medium">{user.location || "-"}</p>
                                  </div>
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-neutral-500">Professional Title</p>
                                    <p className="font-medium">{profile.title || "-"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Skills */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Skills</h3>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                            {profile.skills && profile.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-neutral-500">No skills added yet</p>
                            )}
                          </div>

                          <Separator />

                          {/* Work Experience */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Work Experience</h3>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                            {profile.experience ? (
                              <div className="prose max-w-none text-neutral-700">
                                <div dangerouslySetInnerHTML={{ __html: profile.experience }} />
                              </div>
                            ) : (
                              <p className="text-neutral-500">No work experience added yet</p>
                            )}
                          </div>

                          <Separator />

                          {/* Education */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Education</h3>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                            {profile.education ? (
                              <div className="prose max-w-none text-neutral-700">
                                <div dangerouslySetInnerHTML={{ __html: profile.education }} />
                              </div>
                            ) : (
                              <p className="text-neutral-500">No education history added yet</p>
                            )}
                          </div>

                          <Separator />

                          {/* Resume */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">Resume</h3>
                              <Button variant="outline" size="sm">
                                Upload
                              </Button>
                            </div>
                            {profile.resumeUrl ? (
                              <div className="flex items-center justify-between border border-neutral-200 rounded-md p-3">
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 text-[#0A3D62] mr-2" />
                                  <span className="font-medium">My Resume</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center">
                                <FileText className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                                <p className="text-neutral-700 font-medium mb-1">No resume uploaded</p>
                                <p className="text-neutral-500 text-sm mb-4">
                                  Upload your resume to easily apply for jobs
                                </p>
                                <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                                  Upload Resume
                                </Button>
                              </div>
                            )}
                          </div>

                          {profile.coverLetterUrl && (
                            <>
                              <Separator />
                              {/* Cover Letter */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-medium">Cover Letter</h3>
                                  <Button variant="outline" size="sm">
                                    Upload
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between border border-neutral-200 rounded-md p-3">
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-[#0A3D62] mr-2" />
                                    <span className="font-medium">My Cover Letter</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <User className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                          <h3 className="text-lg font-medium mb-2">Complete your profile</h3>
                          <p className="text-neutral-500 mb-6">
                            Create a professional profile to showcase your skills and experience
                          </p>
                          <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                            Create Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Recommended Jobs Tab */}
                <TabsContent value="recommendations">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Recommended Jobs</CardTitle>
                      <CardDescription>
                        Jobs matched to your skills and experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRecommendedJobs ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded-md"></div>
                          ))}
                        </div>
                      ) : recommendedJobs.length > 0 ? (
                        <div className="space-y-4">
                          {recommendedJobs.map((job) => (
                            <Card key={job.id}>
                              <CardContent className="p-4 sm:p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="font-medium text-lg">{job.title}</h3>
                                    <p className="text-sm text-neutral-500">Company Name</p> {/* Would come from relation */}
                                  </div>
                                  <Badge variant="outline">
                                    {job.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500 mb-4">
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Briefcase className="h-4 w-4 mr-1" />
                                    {job.experienceLevel.replace('_', ' ')}
                                  </span>
                                  {job.salary && (
                                    <span className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                        <path d="M12 18V6" />
                                      </svg>
                                      {job.salary}
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                                  {job.description}
                                </p>

                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-neutral-500">
                                    Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                  </span>
                                  <Link href={`/job/${job.id}`}>
                                    <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                                      View Job
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Award className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                          <h3 className="text-lg font-medium mb-2">No recommended jobs yet</h3>
                          <p className="text-neutral-500 mb-6">
                            Complete your profile with skills and experience to get personalized job recommendations
                          </p>
                          <Button 
                            className="bg-[#0A3D62] hover:bg-[#082C46]"
                            onClick={() => setActiveTab("profile")}
                          >
                            Update Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Job Alerts Tab */}
                <TabsContent value="alerts">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Job Alerts</CardTitle>
                      <CardDescription>
                        Get notified about new jobs matching your preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                        <h3 className="text-lg font-medium mb-2">No job alerts yet</h3>
                        <p className="text-neutral-500 mb-6">
                          Create job alerts to get notified when new jobs matching your criteria are posted
                        </p>
                        <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                          Create Job Alert
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
