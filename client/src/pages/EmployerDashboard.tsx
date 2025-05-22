import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart, 
  Users, 
  Briefcase, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  Building,
  PieChart,
  Calendar,
  Search,
  Download,
  MoreHorizontal,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  Inbox,
  Mail,
  CheckCircle2,
  ThumbsUp,
  Settings
} from "lucide-react";
import AccountSettings from "@/components/AccountSettings";
import { Job, Application } from "@shared/schema";
import { format } from "date-fns";

// Custom type for applications with job and applicant details
type ApplicationWithDetails = Application & {
  job: Job;
  applicant: {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
};

const EmployerDashboard = () => {
  const { currentUser } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState<number | "all">("all");
  const { toast } = useToast();

  // Fetch employer's posted jobs
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/employer/jobs'],
    enabled: !!currentUser, // Only run query if user is logged in
  });

  // Fetch applications for employer's jobs
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithDetails[]>({
    queryKey: ['/api/employer/applications'],
    enabled: !!currentUser, // Only run query if user is logged in
  });

  // Fetch company profile data
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['/api/employer/company'],
    enabled: !!currentUser, // Only run query if user is logged in
  });
  
  // Redirect if not authenticated or not an employer (using useEffect to avoid hooks errors)
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== 'employer') {
      navigate("/");
    }
  }, [currentUser, navigate]);
  
  // If not authenticated, show a loading state
  if (!currentUser || currentUser.role !== 'employer') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Checking authentication...</h2>
          <p className="text-neutral-600">You'll be redirected if you're not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  // Get counts for dashboard stats
  const activeJobsCount = jobs.filter(job => job.isActive).length;
  const totalApplicationsCount = applications.length;
  const newApplicationsCount = applications.filter(app => app.status === 'applied').length;
  const interviewsCount = applications.filter(app => app.status === 'interview_scheduled').length;

  // Determine if company profile is complete
  const isCompanyProfileComplete = !!company;

  return (
    <>
      <Helmet>
        <title>Employer Dashboard - Business In Rwanda</title>
        <meta name="description" content="Manage your job postings, view applicants, and track your hiring process." />
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
                      <AvatarImage src={currentUser.profilePicture || ''} alt={currentUser.fullName || ''} />
                      <AvatarFallback className="bg-[#0A3D62] text-white">
                        {currentUser.fullName ? currentUser.fullName.split(' ').map((n: string) => n[0]).join('') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{currentUser.fullName || 'User'}</CardTitle>
                      <CardDescription>{currentUser.email || ''}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!isCompanyProfileComplete && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                      <p className="text-amber-800 font-medium mb-2">Complete your company profile</p>
                      <p className="text-amber-700 mb-2">
                        Improve your visibility to job seekers by adding your company details.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-800"
                        onClick={() => navigate("/company/create")}
                      >
                        Complete Profile
                      </Button>
                    </div>
                  )}

                  <nav className="space-y-2">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "overview" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      <BarChart className="h-4 w-4 mr-2" />
                      <span>Overview</span>
                      {activeTab === "overview" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "jobs" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "jobs" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("jobs")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>Manage Jobs</span>
                      {activeTab === "jobs" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "applications" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "applications" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("applications")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Applications</span>
                      {activeTab === "applications" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "company" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "company" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("company")}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      <span>Company Profile</span>
                      {activeTab === "company" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "settings" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Account Settings</span>
                      {activeTab === "settings" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
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
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl font-heading">Dashboard Overview</CardTitle>
                          <CardDescription>
                            Your hiring activity and statistics at a glance
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select className="border rounded-md px-3 py-1 text-sm bg-white">
                            <option value="7">Last 7 days</option>
                            <option value="30" selected>Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="all">All time</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Active Jobs</p>
                                <h3 className="text-2xl font-bold">{activeJobsCount}</h3>
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                  <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                                  <span>Active listings</span>
                                </p>
                              </div>
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Briefcase className="h-5 w-5 text-[#0A3D62]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Total Applications</p>
                                <h3 className="text-2xl font-bold">{totalApplicationsCount}</h3>
                                <p className="text-xs text-blue-600 mt-1 flex items-center">
                                  <span className="inline-block h-2 w-2 bg-blue-500 rounded-full mr-1"></span>
                                  <span>{totalApplicationsCount > 0 ? '+12% from last month' : 'No change'}</span>
                                </p>
                              </div>
                              <div className="bg-green-100 p-2 rounded-full">
                                <Users className="h-5 w-5 text-[#00A86B]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">New Applications</p>
                                <h3 className="text-2xl font-bold">{newApplicationsCount}</h3>
                                <p className="text-xs text-amber-600 mt-1 flex items-center">
                                  <span className="inline-block h-2 w-2 bg-amber-500 rounded-full mr-1"></span>
                                  <span>Needs review</span>
                                </p>
                              </div>
                              <div className="bg-red-100 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-[#BD2031]" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-neutral-500">Scheduled Interviews</p>
                                <h3 className="text-2xl font-bold">{interviewsCount}</h3>
                                <p className="text-xs text-purple-600 mt-1 flex items-center">
                                  <span className="inline-block h-2 w-2 bg-purple-500 rounded-full mr-1"></span>
                                  <span>This week</span>
                                </p>
                              </div>
                              <div className="bg-purple-100 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                              <span>Recent Applications</span>
                              <Button variant="link" size="sm" className="text-xs p-0" onClick={() => setActiveTab("applications")}>
                                View All
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isLoadingApplications ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                  <div key={i} className="h-12 animate-pulse bg-neutral-100 rounded-md"></div>
                                ))}
                              </div>
                            ) : applications.length > 0 ? (
                              <div className="space-y-4">
                                {applications.slice(0, 5).map((application) => (
                                  <div key={application.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={application.applicant.profilePicture} alt={application.applicant.fullName} />
                                        <AvatarFallback className="bg-neutral-200 text-neutral-700 text-xs">
                                          {application.applicant.fullName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{application.applicant.fullName}</p>
                                        <p className="text-xs text-neutral-500">{application.job.title}</p>
                                      </div>
                                    </div>
                                    <Badge variant={
                                      application.status === 'applied' ? 'default' : 
                                      application.status === 'reviewed' ? 'secondary' : 
                                      application.status === 'interview_scheduled' ? 'outline' : 
                                      application.status === 'hired' ? 'outline' : 'destructive'
                                    }>
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

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                              <span>Recruitment Pipeline</span>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  <PieChart className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {/* Applicant Pipeline Visualization */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-full h-5 bg-neutral-100 rounded-full overflow-hidden flex">
                                  <div 
                                    className="bg-blue-500 h-full"
                                    style={{ width: `${(applications.filter(a => a.status === 'applied').length / Math.max(applications.length, 1)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="bg-purple-500 h-full"
                                    style={{ width: `${(applications.filter(a => a.status === 'reviewed').length / Math.max(applications.length, 1)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="bg-amber-500 h-full"
                                    style={{ width: `${(applications.filter(a => a.status === 'interview_scheduled').length / Math.max(applications.length, 1)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="bg-green-500 h-full"
                                    style={{ width: `${(applications.filter(a => a.status === 'hired').length / Math.max(applications.length, 1)) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="bg-red-500 h-full"
                                    style={{ width: `${(applications.filter(a => a.status === 'rejected').length / Math.max(applications.length, 1)) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                <div>
                                  <div className="flex items-center mb-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                    <span className="font-medium">Applied</span>
                                  </div>
                                  <p className="ml-3">{applications.filter(a => a.status === 'applied').length}</p>
                                </div>
                                <div>
                                  <div className="flex items-center mb-1">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                                    <span className="font-medium">Reviewed</span>
                                  </div>
                                  <p className="ml-3">{applications.filter(a => a.status === 'reviewed').length}</p>
                                </div>
                                <div>
                                  <div className="flex items-center mb-1">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                                    <span className="font-medium">Interview</span>
                                  </div>
                                  <p className="ml-3">{applications.filter(a => a.status === 'interview_scheduled').length}</p>
                                </div>
                                <div>
                                  <div className="flex items-center mb-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    <span className="font-medium">Hired</span>
                                  </div>
                                  <p className="ml-3">{applications.filter(a => a.status === 'hired').length}</p>
                                </div>
                                <div>
                                  <div className="flex items-center mb-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    <span className="font-medium">Rejected</span>
                                  </div>
                                  <p className="ml-3">{applications.filter(a => a.status === 'rejected').length}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-xl font-heading">Manage Jobs</CardTitle>
                        <CardDescription>
                          View, edit, and manage your job listings
                        </CardDescription>
                      </div>
                      <Button onClick={() => navigate("/post-job")} className="bg-[#0A3D62] hover:bg-[#082C46]">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Post New Job
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingJobs ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded-md"></div>
                          ))}
                        </div>
                      ) : jobs.length > 0 ? (
                        <div className="space-y-4">
                          {jobs.map((job) => (
                            <Card key={job.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-[3fr_1fr] gap-4">
                                  <div>
                                    <div className="flex items-center mb-3">
                                      <Badge variant={job.isActive ? "outline" : "secondary"} className={job.isActive ? "bg-green-50 text-green-700 border-green-200" : ""}>
                                        {job.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                      <span className="mx-2 text-neutral-300">•</span>
                                      <span className="text-sm text-neutral-500">
                                        Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                      </span>
                                      {job.location && (
                                        <>
                                          <span className="mx-2 text-neutral-300">•</span>
                                          <span className="text-sm text-neutral-500">
                                            {job.location}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <h3 className="font-medium text-lg mb-1">{job.title}</h3>
                                    <p className="text-sm line-clamp-2 text-neutral-600 mb-3">
                                      {job.description.substring(0, 150)}...
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {job.type && (
                                        <Badge variant="secondary" className="bg-blue-50 border-blue-100 text-blue-700">
                                          {job.type.replace('_', ' ')}
                                        </Badge>
                                      )}
                                      {job.experienceLevel && (
                                        <Badge variant="secondary" className="bg-purple-50 border-purple-100 text-purple-700">
                                          {job.experienceLevel} level
                                        </Badge>
                                      )}
                                      {job.salary && (
                                        <Badge variant="secondary" className="bg-green-50 border-green-100 text-green-700">
                                          {job.salary}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex sm:flex-col gap-3 sm:items-end justify-start sm:justify-between">
                                    <div className="text-sm">
                                      <div className="font-medium mb-1">Applications</div>
                                      <div className="text-2xl font-bold">
                                        {applications.filter(a => a.jobId === job.id).length}
                                      </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <Button variant="outline" size="sm" asChild>
                                        <Link href={`/jobs/${job.id}`}>
                                          <Eye className="h-3.5 w-3.5 mr-1" />
                                          View
                                        </Link>
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                        Edit
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="h-10 w-10 mx-auto mb-3 text-neutral-300" />
                          <h3 className="font-medium mb-1">No jobs posted yet</h3>
                          <p className="text-sm text-neutral-500 mb-4">
                            Create your first job posting to start receiving applications
                          </p>
                          <Button onClick={() => navigate("/post-job")} className="bg-[#0A3D62] hover:bg-[#082C46]">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Post a Job
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Applications</CardTitle>
                      <CardDescription>
                        Manage candidates and track application progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:w-1/3">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            placeholder="Search candidates..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={jobFilter === "all" ? "all" : jobFilter.toString()}
                            onValueChange={(value) => setJobFilter(value === "all" ? "all" : Number(value))}
                          >
                            <SelectTrigger className="w-full md:w-auto">
                              <SelectValue placeholder="Select Job" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Jobs</SelectItem>
                              {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Tabs defaultValue="all">
                        <TabsList className="mb-6">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="applied">New</TabsTrigger>
                          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                          <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
                          <TabsTrigger value="hired">Hired</TabsTrigger>
                          <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                              {applications
                                .filter(app => 
                                  (jobFilter === 'all' || app.jobId === jobFilter) &&
                                  (searchQuery === '' || 
                                   app.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                )
                                .map((application) => (
                                <Card key={application.id}>
                                  <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                      <div className="sm:w-1/4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <Avatar>
                                            <AvatarImage 
                                              src={application.applicant.profilePicture} 
                                              alt={application.applicant.fullName}
                                            />
                                            <AvatarFallback className="bg-neutral-200 text-neutral-700">
                                              {application.applicant.fullName.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="font-medium">{application.applicant.fullName}</h3>
                                            <p className="text-sm text-neutral-500">{application.applicant.email}</p>
                                          </div>
                                        </div>
                                        <div className="flex mb-2">
                                          <Select 
                                            defaultValue={application.status}
                                            onValueChange={(value) => {
                                              toast({
                                                title: "Status Updated",
                                                description: `${application.applicant.fullName}'s application status updated to ${value.replace('_', ' ')}`,
                                              });
                                            }}
                                          >
                                            <SelectTrigger 
                                              className={`text-xs h-8 py-1 px-2 w-40 ${
                                                application.status === 'applied' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                                                application.status === 'reviewed' ? 'bg-purple-50 border-purple-200 text-purple-700' : 
                                                application.status === 'interview_scheduled' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                                                application.status === 'hired' ? 'bg-green-50 border-green-200 text-green-700' : 
                                                'bg-red-50 border-red-200 text-red-700'
                                              }`}
                                            >
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="applied">Applied</SelectItem>
                                              <SelectItem value="reviewed">Reviewed</SelectItem>
                                              <SelectItem value="interview_scheduled">Interview</SelectItem>
                                              <SelectItem value="hired">Hired</SelectItem>
                                              <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="sm:w-3/4">
                                        <div className="mb-3">
                                          <h4 className="font-medium">{application.job.title}</h4>
                                          <p className="text-sm text-neutral-500">
                                            Applied {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          <Button size="sm" variant="secondary">
                                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                                            View Application
                                          </Button>
                                          <Button size="sm" variant="outline">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            Schedule Interview
                                          </Button>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button size="sm" variant="outline">
                                                <MoreHorizontal className="h-3.5 w-3.5 mr-1.5" />
                                                More Actions
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem>
                                                <Mail className="h-4 w-4 mr-2" />
                                                <span>Email Candidate</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                <span>Download Resume</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                <span>Reject</span>
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-neutral-500">
                              <FileText className="h-10 w-10 mx-auto mb-4 text-neutral-300" />
                              <p>No applications received yet</p>
                              <p className="text-sm text-neutral-400">Applications to your job listings will appear here</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        {/* Other status filter tabs would follow the same pattern */}
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and role preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccountSettings />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Company Profile Tab */}
                <TabsContent value="company">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-xl font-heading">Company Profile</CardTitle>
                        <CardDescription>
                          Manage your company information and details
                        </CardDescription>
                      </div>
                      {company && (
                        <Button variant="outline" className="space-x-1">
                          <Edit className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isLoadingCompany ? (
                        <div className="space-y-4">
                          <div className="h-24 animate-pulse bg-neutral-100 rounded-md"></div>
                          <div className="h-48 animate-pulse bg-neutral-100 rounded-md"></div>
                        </div>
                      ) : company ? (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-1/4">
                              <div className="aspect-square w-full max-w-[150px] bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                                {company.logo ? (
                                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Building className="h-12 w-12 text-neutral-300" />
                                )}
                              </div>
                            </div>
                            <div className="sm:w-3/4 space-y-4">
                              <div>
                                <h2 className="text-2xl font-bold">{company.name}</h2>
                                {company.industry && (
                                  <p className="text-neutral-600">{company.industry}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-neutral-500">Location</p>
                                  <p>{company.location || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-neutral-500">Website</p>
                                  {company.website ? (
                                    <a 
                                      href={company.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:underline"
                                    >
                                      {company.website.replace(/(^\w+:|^)\/\//, '')}
                                    </a>
                                  ) : (
                                    <p>Not specified</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-neutral-500">Company Size</p>
                                  <p>{company.employeeCount ? 
                                    `${company.employeeCount} employees` : 
                                    'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-neutral-500">Founded</p>
                                  <p>{company.founded || 'Not specified'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">About</h3>
                            <p className="text-neutral-700">
                              {company.description || 'No company description provided.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Building className="h-10 w-10 mx-auto mb-3 text-neutral-300" />
                          <h3 className="font-medium mb-1">No company profile yet</h3>
                          <p className="text-sm text-neutral-500 mb-4">
                            Create your company profile to showcase your brand to job seekers
                          </p>
                          <Button onClick={() => navigate("/company/create")} className="bg-[#0A3D62] hover:bg-[#082C46]">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Create Profile
                          </Button>
                        </div>
                      )}
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

export default EmployerDashboard;