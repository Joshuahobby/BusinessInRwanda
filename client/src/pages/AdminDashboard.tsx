import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { 
  User as DbUser, 
  User as UserModel, 
  Job as JobModel, 
  Company as CompanyModel, 
  Application as ApplicationModel 
} from "@shared/schema";
import UserEditModal from "@/components/UserEditModal";
import JobManagementTable from "@/components/JobManagementTable";
import PostManagementTable from "@/components/PostManagementTable";
import JobApprovalModal from "@/components/JobApprovalModal";
import JobDetailsModal from "@/components/JobDetailsModal";
import CreatePostModal from "@/components/CreatePostModal";
import EditPostModal from "@/components/EditPostModal";
import CreateCompanyModal from "@/components/CreateCompanyModal";
import CategoryModal from "@/components/CategoryModal";
import DeleteCategoryDialog from "@/components/DeleteCategoryDialog";
import FeaturedSectionsModal from "@/components/FeaturedSectionsModal";
import NotificationModal from "@/components/NotificationModal";
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
  Database,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardCheck,
  UserCircle,
  FileDown,
  TagIcon,
  Gavel,
  Megaphone,
  ChevronDown,
  Calendar,
  GanttChartSquare,
  Loader2,
  Bell,
  Menu,
  LogOut,
  PanelLeft,
  LayoutDashboard,
  CircleCheck,
  ChevronLeft,
  Clock,
  Filter,
  FilePlus2,
  MoveUpRight,
  TrendingUp,
  CircleUser
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
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobModel | null>(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JobModel | null>(null);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  
  // Category management state
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  
  // Featured sections state
  const [isFeaturedSectionsModalOpen, setIsFeaturedSectionsModalOpen] = useState(false);
  const [featuredSectionsData, setFeaturedSectionsData] = useState<any>(null);
  
  // Platform notifications state
  const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] = useState(false);
  const [isEditNotificationModalOpen, setIsEditNotificationModalOpen] = useState(false);
  const [isDeleteNotificationModalOpen, setIsDeleteNotificationModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  const [deletingNotification, setDeletingNotification] = useState<any>(null);

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

  // Fetch companies - always enabled to support CreatePostModal
  const { 
    data: companies = [] as CompanyModel[], 
    isLoading: isLoadingCompanies,
    error: companiesError
  } = useQuery<CompanyModel[]>({
    queryKey: ["/api/admin/companies"],
    enabled: currentUser?.role === "admin", // Always fetch companies for modals
  });
  
  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['/api/admin/categories'],
    enabled: currentUser?.role === 'admin' && activeTab === 'categories',
  });
  
  // Fetch featured sections
  const {
    data: featuredSections,
    isLoading: isLoadingFeaturedSections,
    error: featuredSectionsError,
    refetch: refetchFeaturedSections
  } = useQuery({
    queryKey: ['/api/admin/featured-sections'],
    enabled: currentUser?.role === 'admin' && activeTab === 'settings',
    onSuccess: (data: any) => {
      setFeaturedSectionsData(data);
    }
  });
  
  // Fetch notifications
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['/api/admin/notifications'],
    enabled: currentUser?.role === 'admin' && activeTab === 'settings',
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

  // Filter jobs based on search query, status filter, and post type
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = jobStatusFilter === "all" || 
      (jobStatusFilter === "pending" && job.status === "pending") ||
      (jobStatusFilter === "approved" && job.status === "approved") ||
      (jobStatusFilter === "rejected" && job.status === "rejected");
    
    const matchesPostType = postTypeFilter === "all" || 
      job.postType === postTypeFilter || 
      // If no post type is specified, assume it's a job (for backward compatibility)
      (postTypeFilter === "job" && !job.postType);
    
    return matchesSearch && matchesStatus && matchesPostType;
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
        <title>Ad Portal Admin - Business In Rwanda</title>
        <meta name="description" content="Admin dashboard for managing jobs, tenders, auctions and announcements on the Business In Rwanda platform" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Ad Portal Dashboard</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Manage jobs, tenders, auctions, announcements, and platform settings
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
                      <span>Platform Settings</span>
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Ad Portal Analytics</h2>
                      <p className="text-muted-foreground">Monitor ad performance across jobs, tenders, auctions and announcements</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select defaultValue="week">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>

                  {isLoadingStats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <Card key={i} className="h-[120px] animate-pulse">
                            <CardContent className="p-6">
                              <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4"></div>
                              <div className="h-8 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="h-[350px] animate-pulse">
                          <CardHeader>
                            <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-[250px] bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                          </CardContent>
                        </Card>
                        <Card className="h-[350px] animate-pulse">
                          <CardHeader>
                            <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : statsError ? (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-3" />
                        <div>
                          <h3 className="font-medium">Error Loading Statistics</h3>
                          <p className="text-sm mt-1">Unable to fetch platform statistics. Please try refreshing the page.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Stat Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</h3>
                                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span>+12% from last month</span>
                                </div>
                              </div>
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-l-4 border-l-green-500 dark:border-l-green-400">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Advertisements</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalJobs || 0}</h3>
                                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span>+8% from last month</span>
                                </div>
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-l-4 border-l-purple-500 dark:border-l-purple-400">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">Partner Organizations</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalCompanies || 0}</h3>
                                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span>+5% from last month</span>
                                </div>
                              </div>
                              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-l-4 border-l-amber-500 dark:border-l-amber-400">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground">Applications</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalApplications || 0}</h3>
                                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  <span>+15% from last month</span>
                                </div>
                              </div>
                              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Charts and Activity */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Post Type Distribution</CardTitle>
                            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => setActiveTab("posts")}>
                              View All
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="pt-4 space-y-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span>Jobs</span>
                                  </div>
                                  <span className="font-medium">65%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span>Tenders</span>
                                  </div>
                                  <span className="font-medium">15%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500" style={{ width: '15%' }}></div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                    <span>Auctions</span>
                                  </div>
                                  <span className="font-medium">12%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: '12%' }}></div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span>Announcements</span>
                                  </div>
                                  <span className="font-medium">8%</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: '8%' }}></div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-8">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-medium">User Distribution</h4>
                                <div className="flex -space-x-2">
                                  {(stats?.usersByRole || []).map((item, i) => (
                                    <div 
                                      key={item.role} 
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                                        item.role === 'job_seeker' ? 'bg-blue-500' :
                                        item.role === 'employer' ? 'bg-green-500' : 'bg-purple-500'
                                      }`}
                                      style={{ zIndex: 3 - i }}
                                    >
                                      {item.role === 'job_seeker' ? 'J' : 
                                       item.role === 'employer' ? 'E' : 'A'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {(stats?.usersByRole || []).map((item) => (
                                  <div key={item.role} className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-md p-2 text-center">
                                    <div className="text-xs text-muted-foreground capitalize">{item.role.replace('_', ' ')}</div>
                                    <div className="font-medium mt-1">{item.count}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {Math.round((item.count / (stats?.totalUsers || 1)) * 100)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-lg">Recent Advertisements</CardTitle>
                              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => setActiveTab("posts")}>
                                View All
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {(stats?.recentJobs || []).length > 0 ? (
                                  (stats?.recentJobs || []).slice(0, 4).map((job: any) => (
                                    <div key={job.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                          job.postType === 'job' || !job.postType ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 
                                          job.postType === 'tender' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                          job.postType === 'auction' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        }`}>
                                          {job.postType === 'job' || !job.postType ? <Briefcase className="h-4 w-4" /> : 
                                           job.postType === 'tender' ? <FileText className="h-4 w-4" /> :
                                           job.postType === 'auction' ? <Gavel className="h-4 w-4" /> :
                                           <Megaphone className="h-4 w-4" />}
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm truncate max-w-[180px] md:max-w-[240px]">{job.title}</p>
                                          <p className="text-xs text-muted-foreground">{job.companyName || 'Individual Post'}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            job.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                            job.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                          }`}
                                        >
                                          {job.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center justify-center h-[150px] bg-neutral-50 dark:bg-neutral-800/50 rounded-md">
                                    <p className="text-muted-foreground text-sm">No recent posts found</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-3">
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                                  onClick={() => setIsCreatePostModalOpen(true)}
                                >
                                  <FilePlus2 className="h-5 w-5" />
                                  <span className="text-xs">New Post</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                                  onClick={() => setIsCreateCompanyModalOpen(true)}
                                >
                                  <Building className="h-5 w-5" />
                                  <span className="text-xs">New Company</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                                  onClick={() => setIsCreateCategoryModalOpen(true)}
                                >
                                  <TagIcon className="h-5 w-5" />
                                  <span className="text-xs">New Category</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                                  onClick={() => navigate("/")}
                                >
                                  <MoveUpRight className="h-5 w-5" />
                                  <span className="text-xs">View Site</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </>
                  )}
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

                {/* Posts Management Tab */}
                <TabsContent value="posts" className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">Advertisement Management</h2>
                      <p className="text-muted-foreground">Manage all ad types: jobs, tenders, auctions, and announcements</p>
                    </div>
                    <Button 
                      onClick={() => setIsCreatePostModalOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Advertisement
                    </Button>
                  </div>
                  
                  <Card className="overflow-hidden border-t-4 border-t-primary">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-[300px]">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search posts..."
                            className="pl-9 w-full bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-md px-3 py-1.5">
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                              <SelectTrigger className="border-0 p-0 h-auto font-medium bg-transparent hover:bg-transparent focus:ring-0">
                                <SelectValue placeholder="Post Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="job">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                    Jobs
                                  </div>
                                </SelectItem>
                                <SelectItem value="auction">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                    Auctions
                                  </div>
                                </SelectItem>
                                <SelectItem value="tender">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                                    Tenders
                                  </div>
                                </SelectItem>
                                <SelectItem value="announcement">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                    Announcements
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-md px-3 py-1.5">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                              <SelectTrigger className="border-0 p-0 h-auto font-medium bg-transparent hover:bg-transparent focus:ring-0">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                    Pending
                                  </div>
                                </SelectItem>
                                <SelectItem value="approved">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                    Approved
                                  </div>
                                </SelectItem>
                                <SelectItem value="rejected">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                    Rejected
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">

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
                        <PostManagementTable 
                          posts={filteredJobs}
                          isLoading={isLoadingJobs}
                          filterType={postTypeFilter}
                          onFilterChange={setPostTypeFilter}
                          onViewPost={(job) => {
                            setSelectedJob(job);
                            setIsJobDetailsModalOpen(true);
                          }}
                          onEditPost={(job) => {
                            setEditingPost(job);
                            setIsEditPostModalOpen(true);
                          }}
                          onApprovePost={async (job) => {
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
                              console.error("Error approving post:", error);
                              return Promise.reject(error);
                            }
                          }}
                          onRejectPost={async (job) => {
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
                              console.error("Error rejecting post:", error);
                              return Promise.reject(error);
                            }
                          }}
                          onFeaturePost={async (job, featured) => {
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
                          onDeletePost={async (job) => {
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
                              console.error("Error deleting post:", error);
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
                        <Button 
                          className="bg-[#0A3D62] hover:bg-[#082C46]"
                          onClick={() => setIsCreateCompanyModalOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Add Company
                        </Button>
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
                        <Button 
                          className="bg-[#0A3D62] hover:bg-[#082C46]"
                          onClick={() => setIsCreateCategoryModalOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Add Category
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingCategories ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          ))}
                        </div>
                      ) : categoriesError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load categories. Please try again later.
                        </div>
                      ) : (
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
                              {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                  <TableRow key={category.id}>
                                    <TableCell>
                                      <div className="font-medium">{category.name}</div>
                                    </TableCell>
                                    <TableCell>{category.icon}</TableCell>
                                    <TableCell>{category.count || 0}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="icon"
                                          onClick={() => {
                                            setEditingCategory(category);
                                            setIsEditCategoryModalOpen(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-red-500 hover:text-red-600"
                                          onClick={() => {
                                            setDeletingCategory(category);
                                            setIsDeleteCategoryModalOpen(true);
                                          }}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-6 text-neutral-500">
                                    No categories found. Click "Add Category" to create a new category.
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

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="mb-6">
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
                  
                  {/* Featured Sections Configuration */}
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Featured Sections</CardTitle>
                          <CardDescription>
                            Configure featured content on the homepage
                          </CardDescription>
                        </div>
                        <Button 
                          className="bg-[#0A3D62] hover:bg-[#082C46]"
                          onClick={() => setIsFeaturedSectionsModalOpen(true)}
                        >
                          <Settings className="h-4 w-4 mr-1.5" />
                          Configure Featured Content
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingFeaturedSections ? (
                        <div className="space-y-3">
                          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                        </div>
                      ) : featuredSectionsError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load featured sections. Please try again later.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium text-lg mb-2">Homepage Hero</h3>
                            {featuredSectionsData?.homepageHero ? (
                              <div>
                                <p><span className="font-medium">Title:</span> {featuredSectionsData.homepageHero.title}</p>
                                <p><span className="font-medium">Subtitle:</span> {featuredSectionsData.homepageHero.subtitle}</p>
                                <p><span className="font-medium">Status:</span> {featuredSectionsData.homepageHero.enabled ? (
                                  <Badge className="bg-green-600">Enabled</Badge>
                                ) : (
                                  <Badge variant="outline">Disabled</Badge>
                                )}</p>
                              </div>
                            ) : (
                              <p className="text-neutral-500">No hero configuration found.</p>
                            )}
                          </div>
                          
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium text-lg mb-2">Featured Jobs</h3>
                            {featuredSectionsData?.featuredJobs?.length > 0 ? (
                              <div>
                                <p><span className="font-medium">Total Featured Jobs:</span> {featuredSectionsData.featuredJobs.length}</p>
                                <ul className="list-disc list-inside mt-2">
                                  {featuredSectionsData.featuredJobs.slice(0, 3).map((jobId: number) => {
                                    const job = jobs.find(j => j.id === jobId);
                                    return (
                                      <li key={jobId}>
                                        {job ? job.title : `Job #${jobId}`}
                                      </li>
                                    );
                                  })}
                                  {featuredSectionsData.featuredJobs.length > 3 && (
                                    <li>And {featuredSectionsData.featuredJobs.length - 3} more...</li>
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-neutral-500">No featured jobs configured.</p>
                            )}
                          </div>
                          
                          <div className="border rounded-md p-4">
                            <h3 className="font-medium text-lg mb-2">Featured Companies</h3>
                            {featuredSectionsData?.featuredCompanies?.length > 0 ? (
                              <div>
                                <p><span className="font-medium">Total Featured Companies:</span> {featuredSectionsData.featuredCompanies.length}</p>
                                <ul className="list-disc list-inside mt-2">
                                  {featuredSectionsData.featuredCompanies.slice(0, 3).map((companyId: number) => {
                                    const company = companies.find(c => c.id === companyId);
                                    return (
                                      <li key={companyId}>
                                        {company ? company.name : `Company #${companyId}`}
                                      </li>
                                    );
                                  })}
                                  {featuredSectionsData.featuredCompanies.length > 3 && (
                                    <li>And {featuredSectionsData.featuredCompanies.length - 3} more...</li>
                                  )}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-neutral-500">No featured companies configured.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Platform Notifications */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Platform Notifications</CardTitle>
                          <CardDescription>
                            Manage site-wide notification messages
                          </CardDescription>
                        </div>
                        <Button 
                          className="bg-[#0A3D62] hover:bg-[#082C46]"
                          onClick={() => setIsCreateNotificationModalOpen(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          Add Notification
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingNotifications ? (
                        <div className="space-y-3">
                          <div className="h-16 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                          <div className="h-16 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                        </div>
                      ) : notificationsError ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                          <AlertTriangle className="h-5 w-5 inline mr-2" />
                          Failed to load notifications. Please try again later.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notifications && notifications.length > 0 ? (
                            notifications.map((notification: any) => (
                              <div key={notification.id} className="border rounded-md p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={notification.type === 'info' ? 'outline' : notification.type === 'warning' ? 'secondary' : 'destructive'}>
                                      {notification.type}
                                    </Badge>
                                    <Badge variant={notification.enabled ? 'default' : 'outline'}>
                                      {notification.enabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setEditingNotification(notification);
                                        setIsEditNotificationModalOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => {
                                        setDeletingNotification(notification);
                                        setIsDeleteNotificationModalOpen(true);
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <p className="text-neutral-800 dark:text-neutral-100 mb-1">{notification.message}</p>
                                
                                <p className="text-xs text-neutral-500">
                                  Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-neutral-500">
                              No notifications found. Click "Add Notification" to create a new site-wide notification.
                            </div>
                          )}
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
        companies={companies || []}
      />

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isCreateCompanyModalOpen}
        onClose={() => setIsCreateCompanyModalOpen(false)}
      />
      
      {/* Category Management Modals */}
      <CategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        mode="create"
      />
      
      <CategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        category={editingCategory}
        mode="edit"
      />
      
      <DeleteCategoryDialog
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => setIsDeleteCategoryModalOpen(false)}
        category={deletingCategory}
      />
      
      {/* Featured Sections Modal */}
      <FeaturedSectionsModal
        isOpen={isFeaturedSectionsModalOpen}
        onClose={() => setIsFeaturedSectionsModalOpen(false)}
        initialData={featuredSectionsData}
        jobs={stats?.recentJobs || []}
        companies={companies || []}
      />
      
      {/* Notification Modals */}
      <NotificationModal
        isOpen={isCreateNotificationModalOpen}
        onClose={() => setIsCreateNotificationModalOpen(false)}
        mode="create"
      />
      
      <NotificationModal
        isOpen={isEditNotificationModalOpen}
        onClose={() => setIsEditNotificationModalOpen(false)}
        notification={editingNotification}
        mode="edit"
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditPostModalOpen}
        onClose={() => setIsEditPostModalOpen(false)}
        post={editingPost}
        companies={companies || []}
      />
    </>
  );
};

export default AdminDashboard;