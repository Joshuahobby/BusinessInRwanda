import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { 
  User, User as UserModel, 
  Job as JobModel, 
  Company as CompanyModel, 
  Application as ApplicationModel 
} from "@shared/schema";
import UserEditModal from "@/components/UserEditModal";
import JobManagementTable from "@/components/JobManagementTable";
import JobApprovalModal from "@/components/JobApprovalModal";
import JobDetailsModal from "@/components/JobDetailsModal";
import CreatePostModal from "@/components/CreatePostModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  BarChart, 
  Users, 
  Briefcase, 
  FileText, 
  Settings,
  Building,
  Eye,
  Edit,
  Trash,
  Search,
  PlusCircle,
  AlertTriangle,
  UserIcon,
  BarChart4,
  LineChart,
  PieChart,
  Zap,
  Shield,
  Database
} from "lucide-react";
import { format } from "date-fns";
import AccountSettings from "@/components/AccountSettings";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  const { currentUser, logout } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobModel | null>(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (currentUser.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      
      if (currentUser.role === "job_seeker") {
        navigate("/jobseeker/dashboard");
      } else if (currentUser.role === "employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate, toast]);

  // Define the stats type
  interface AdminStatistics {
    totalUsers: number;
    totalJobs: number;
    totalCompanies: number;
    totalApplications: number;
    usersByRole: { role: string; count: number }[];
    recentJobs: JobModel[];
    recentApplications: ApplicationModel[];
  }

  // Fetch platform statistics
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery<AdminStatistics>({
    queryKey: ["/api/admin/statistics"],
    enabled: currentUser?.role === "admin",
  });

  // Fetch users
  const { 
    data: users = [] as UserModel[], 
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery<UserModel[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.role === "admin" && activeTab === "users",
  });

  // Fetch jobs
  const { 
    data: jobs = [] as JobModel[], 
    isLoading: isLoadingJobs,
    error: jobsError
  } = useQuery<JobModel[]>({
    queryKey: ["/api/admin/jobs"],
    enabled: currentUser?.role === "admin" && activeTab === "jobs",
  });

  // Fetch companies
  const { 
    data: companies = [] as CompanyModel[], 
    isLoading: isLoadingCompanies,
    error: companiesError
  } = useQuery<CompanyModel[]>({
    queryKey: ["/api/admin/companies"],
    enabled: currentUser?.role === "admin" && activeTab === "companies",
  });

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Filter jobs based on search query and status filter
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = jobStatusFilter === "all" || 
      (jobStatusFilter === "active" && job.isActive) ||
      (jobStatusFilter === "inactive" && !job.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    return (
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Business In Rwanda</title>
        <meta name="description" content="Admin dashboard for managing the Business In Rwanda platform" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Manage users, jobs, and platform settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                View Site
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-12 md:col-span-3">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentUser.profilePicture || ""} alt={currentUser.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentUser.fullName?.charAt(0).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{currentUser.fullName}</CardTitle>
                      <CardDescription>{currentUser.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                      variant={activeTab === "users" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "users" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("users")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span>Users</span>
                      {activeTab === "users" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "jobs" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "jobs" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("jobs")}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>Jobs</span>
                      {activeTab === "jobs" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "companies" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "companies" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("companies")}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      <span>Companies</span>
                      {activeTab === "companies" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "categories" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "categories" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("categories")}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      <span>Categories</span>
                      {activeTab === "categories" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className={`w-full justify-start transition-all ${activeTab === "settings" ? "font-medium bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                      {activeTab === "settings" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </Button>
                  </nav>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingStats ? (
                    <div className="space-y-3">
                      <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded"></div>
                      <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded"></div>
                      <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded"></div>
                    </div>
                  ) : statsError ? (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Failed to load statistics
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Total Users</span>
                        <span className="font-medium">{stats?.totalUsers || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Active Jobs</span>
                        <span className="font-medium">{stats?.totalJobs || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Companies</span>
                        <span className="font-medium">{stats?.totalCompanies || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Applications</span>
                        <span className="font-medium">{stats?.totalApplications || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="col-span-12 md:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Overview</CardTitle>
                      <CardDescription>
                        Key metrics and platform performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingStats ? (
                        <div className="space-y-4">
                          <div className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          </div>
                        </div>
                      ) : statsError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load platform statistics. Please try again later.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-blue-50 border-blue-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-blue-700">Total Users</p>
                                    <h3 className="text-2xl font-bold text-blue-900">{stats?.totalUsers || 0}</h3>
                                  </div>
                                  <Users className="h-10 w-10 text-blue-400" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-green-50 border-green-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-green-700">Active Jobs</p>
                                    <h3 className="text-2xl font-bold text-green-900">{stats?.totalJobs || 0}</h3>
                                  </div>
                                  <Briefcase className="h-10 w-10 text-green-400" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-purple-50 border-purple-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-purple-700">Companies</p>
                                    <h3 className="text-2xl font-bold text-purple-900">{stats?.totalCompanies || 0}</h3>
                                  </div>
                                  <Building className="h-10 w-10 text-purple-400" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-amber-50 border-amber-100">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-amber-700">Applications</p>
                                    <h3 className="text-2xl font-bold text-amber-900">{stats?.totalApplications || 0}</h3>
                                  </div>
                                  <FileText className="h-10 w-10 text-amber-400" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">User Distribution</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="h-64 flex items-center justify-center">
                                  <PieChart className="h-40 w-40 text-neutral-300" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                  {(stats?.usersByRole || []).map((item) => (
                                    <div key={item.role} className="text-center">
                                      <div className={`h-3 rounded-full mb-1 mx-auto w-4/5 ${
                                        item.role === 'job_seeker' ? 'bg-blue-400' :
                                        item.role === 'employer' ? 'bg-green-400' : 'bg-purple-400'
                                      }`}></div>
                                      <p className="text-xs text-neutral-500 capitalize">{item.role.replace('_', ' ')}</p>
                                      <p className="font-medium">{item.count}</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Recent Jobs</h4>
                                    <div className="space-y-2">
                                      {(stats?.recentJobs || []).length > 0 ? (
                                        (stats.recentJobs || []).map((job: any) => (
                                          <div key={job.id} className="flex items-center justify-between py-1">
                                            <div className="flex items-center">
                                              <Briefcase className="h-4 w-4 mr-2 text-neutral-400" />
                                              <span className="text-sm truncate max-w-[200px]">{job.title}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {format(new Date(job.createdAt), 'MMM d')}
                                            </Badge>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-neutral-500">No recent jobs</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Recent Applications</h4>
                                    <div className="space-y-2">
                                      {(stats?.recentApplications || []).length > 0 ? (
                                        (stats.recentApplications || []).map((app: any) => (
                                          <div key={app.id} className="flex items-center justify-between py-1">
                                            <div className="flex items-center">
                                              <FileText className="h-4 w-4 mr-2 text-neutral-400" />
                                              <span className="text-sm truncate max-w-[200px]">{app.job?.title || 'Unknown Job'}</span>
                                            </div>
                                            <Badge 
                                              className={`text-xs ${app.status === 'hired' ? 'bg-green-100 text-green-800' : ''}`}
                                              variant={app.status === 'applied' ? 'default' : 'outline'}
                                            >
                                              {app.status.replace('_', ' ')}
                                            </Badge>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-neutral-500">No recent applications</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>User Management</CardTitle>
                          <CardDescription>
                            Manage all users on the platform
                          </CardDescription>
                        </div>
                        <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Add User
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:w-2/3">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            placeholder="Search users by name or email..." 
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/3">
                          <Select
                            value={userRoleFilter}
                            onValueChange={setUserRoleFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              <SelectItem value="job_seeker">Job Seekers</SelectItem>
                              <SelectItem value="employer">Employers</SelectItem>
                              <SelectItem value="admin">Administrators</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {isLoadingUsers ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          ))}
                        </div>
                      ) : usersError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load users. Please try again later.
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.length > 0 ? (
                                filteredUsers.map((user: any) => (
                                  <TableRow key={user.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={user.profilePicture || ""} alt={user.fullName} />
                                          <AvatarFallback className="text-xs">
                                            {user.fullName?.charAt(0).toUpperCase() || "U"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{user.fullName}</div>
                                          <div className="text-xs text-neutral-500">{user.email}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant={
                                          user.role === 'admin' ? 'destructive' : 
                                          user.role === 'employer' ? 'default' : 'outline'
                                        }
                                        className="capitalize"
                                      >
                                        {user.role.replace('_', ' ')}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => {
                                            setEditingUser(user);
                                            setIsEditModalOpen(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-6 text-neutral-500">
                                    {searchQuery || userRoleFilter !== 'all' ? (
                                      <>No users match your search criteria</>
                                    ) : (
                                      <>No users found</>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Job Listings</CardTitle>
                          <CardDescription>
                            Manage all job listings on the platform
                          </CardDescription>
                        </div>
                        <Button 
                          className="bg-[#0A3D62] hover:bg-[#082C46]"
                          onClick={() => setIsCreatePostModalOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Create New Post
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:w-2/3">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            placeholder="Search jobs by title or description..." 
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="w-full md:w-1/3">
                          <Select
                            value={jobStatusFilter}
                            onValueChange={setJobStatusFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Jobs</SelectItem>
                              <SelectItem value="active">Active Jobs</SelectItem>
                              <SelectItem value="inactive">Inactive Jobs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {isLoadingJobs ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                          <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                          <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                          <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                        </div>
                      ) : jobsError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load jobs. Please try again later.
                        </div>
                      ) : (
                        <JobManagementTable 
                          jobs={filteredJobs}
                          isLoading={isLoadingJobs}
                          onViewJob={(job) => {
                            setSelectedJob(job);
                            setIsJobDetailsModalOpen(true);
                          }}
                          onEditJob={(job) => {
                            // Future implementation for job editing
                            toast({
                              title: "Coming Soon",
                              description: "Job editing functionality will be available soon.",
                            });
                          }}
                          onApproveJob={async (job) => {
                            try {
                              await fetch(`/api/admin/jobs/${job.id}`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ 
                                  status: 'approved'
                                }),
                              });
                              
                              // Invalidate queries to refresh data
                              queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
                              
                              return Promise.resolve();
                            } catch (error) {
                              console.error("Error approving job:", error);
                              return Promise.reject(error);
                            }
                          }}
                          onRejectJob={async (job) => {
                            try {
                              await fetch(`/api/admin/jobs/${job.id}`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ 
                                  status: 'rejected'
                                }),
                              });
                              
                              // Invalidate queries to refresh data
                              queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
                              
                              return Promise.resolve();
                            } catch (error) {
                              console.error("Error rejecting job:", error);
                              return Promise.reject(error);
                            }
                          }}
                          onFeatureJob={async (job, featured) => {
                            try {
                              await fetch(`/api/admin/jobs/${job.id}`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ 
                                  featured: featured
                                }),
                              });
                              
                              // Invalidate queries to refresh data
                              queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
                              
                              return Promise.resolve();
                            } catch (error) {
                              console.error("Error featuring job:", error);
                              return Promise.reject(error);
                            }
                          }}
                          onDeleteJob={async (job) => {
                            try {
                              await fetch(`/api/admin/jobs/${job.id}`, {
                                method: "DELETE",
                              });
                              
                              // Invalidate and refetch jobs
                              queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
                              
                              return Promise.resolve();
                            } catch (error) {
                              console.error("Error deleting job:", error);
                              return Promise.reject(error);
                            }
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Companies Tab */}
                <TabsContent value="companies" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Company Management</CardTitle>
                          <CardDescription>
                            Manage all companies on the platform
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-full mb-6">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                        <Input 
                          placeholder="Search companies by name, industry or location..." 
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {isLoadingCompanies ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          ))}
                        </div>
                      ) : companiesError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load companies. Please try again later.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company: any) => (
                              <Card key={company.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                      {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Building className="h-8 w-8 text-neutral-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <div>
                                          <h3 className="font-medium text-lg">{company.name}</h3>
                                          <p className="text-sm text-neutral-500">
                                            {company.industry} • {company.location}
                                          </p>
                                          {company.website && (
                                            <a 
                                              href={company.website} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                            >
                                              {company.website.replace(/(^\w+:|^)\/\//, '')}
                                            </a>
                                          )}
                                        </div>
                                        <div className="flex gap-1">
                                          <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                                          <Briefcase className="h-3.5 w-3.5" />
                                          <span>{company.jobCount || 0} jobs</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                                          <Users className="h-3.5 w-3.5" />
                                          <span>{company.employeeCount || 'Unknown'} employees</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                                          <FileText className="h-3.5 w-3.5" />
                                          <span>{company.applicationCount || 0} applications</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-12 text-neutral-500">
                              {searchQuery ? (
                                <>No companies match your search criteria</>
                              ) : (
                                <>No companies found</>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Job Categories</CardTitle>
                          <CardDescription>
                            Manage job categories on the platform
                          </CardDescription>
                        </div>
                        <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Add Category
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category Name</TableHead>
                              <TableHead>Icon</TableHead>
                              <TableHead>Job Count</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* This is a placeholder for categories - would be populated from API */}
                            <TableRow>
                              <TableCell>
                                <div className="font-medium">Information Technology</div>
                              </TableCell>
                              <TableCell>💻</TableCell>
                              <TableCell>24</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <div className="font-medium">Finance & Banking</div>
                              </TableCell>
                              <TableCell>💰</TableCell>
                              <TableCell>18</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>
                                <div className="font-medium">Healthcare</div>
                              </TableCell>
                              <TableCell>🏥</TableCell>
                              <TableCell>15</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your admin account and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AccountSettings />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Edit Modal */}
      <UserEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={editingUser}
      />

      {/* Job Details Modal */}
      <JobDetailsModal 
        isOpen={isJobDetailsModalOpen}
        onClose={() => setIsJobDetailsModalOpen(false)}
        job={selectedJob}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        companies={companiesData?.length ? companiesData : []}
      />
    </>
  );
};

export default AdminDashboard;