import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { JobSearchParams, JobType, ExperienceLevel } from '@/lib/types';
import { Job, postTypeEnum } from '@shared/schema';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Briefcase, Filter, Calendar, Bookmark, Share2, Download, Bell, FileText, Gavel, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';
import Icon from '@/components/ui/icon';

const FindJobs = () => {
  const [loc, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<JobSearchParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [datePosted, setDatePosted] = useState('');
  const [salaryRange, setSalaryRange] = useState<[number, number]>([100000, 1000000]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('RWF');
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertKeyword, setAlertKeyword] = useState('');
  const [savedSearches, setSavedSearches] = useState<{name: string, params: JobSearchParams}[]>([]);
  const [postType, setPostType] = useState<string>("all");
  
  const { toast } = useToast();
  const { isAuthenticated, currentUser } = useFirebaseAuth();

  // Parse initial search params from URL
  useEffect(() => {
    const params = new URLSearchParams(loc.split('?')[1]);
    const initialParams: JobSearchParams = {};
    
    if (params.has('keyword')) initialParams.keyword = params.get('keyword') || undefined;
    if (params.has('location')) initialParams.location = params.get('location') || undefined;
    if (params.has('category')) initialParams.category = params.get('category') || undefined;
    if (params.has('jobType')) initialParams.jobType = params.get('jobType') as JobType || undefined;
    if (params.has('experienceLevel')) initialParams.experienceLevel = params.get('experienceLevel') as ExperienceLevel || undefined;
    if (params.has('type')) initialParams.postType = params.get('type') || undefined;
    
    setSearchParams(initialParams);
    
    // Extract post type if present
    if (params.has('type')) {
      const type = params.get('type') || 'all';
      setPostType(type);
      // Update search params with post type
      initialParams.postType = type;
    }
    
    // Extract job type if present
    if (params.has('jobType')) {
      setSelectedJobTypes([params.get('jobType') as JobType]);
    }
    
    // Extract experience level if present
    if (params.has('experienceLevel')) {
      setExperienceLevel(params.get('experienceLevel') as ExperienceLevel || '');
    }
  }, [loc]);

  // Fetch jobs based on search params
  const { data: allJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', searchParams, currentPage, sortOrder],
  });
  
  // Filter jobs based on post type
  const jobs = allJobs.filter(job => {
    // If no specific post type is selected, show all jobs
    if (postType === "all") return true;
    
    // Otherwise, filter by the selected post type
    return job.postType === postType;
  });
  
  // Fetch job categories for filter
  const { data: categories = [] } = useQuery<{name: string, count: number}[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Create query params
    const queryParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    // Update URL
    setLocation(`/find-jobs?${queryParams.toString()}`);
  };

  const handleFilterChange = (key: keyof JobSearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };
  
  const handleJobTypeChange = (type: JobType, checked: boolean) => {
    if (checked) {
      setSelectedJobTypes(prev => [...prev, type]);
      handleFilterChange('jobType', type);
    } else {
      setSelectedJobTypes(prev => prev.filter(t => t !== type));
      handleFilterChange('jobType', '');
    }
  };
  
  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    handleFilterChange('experienceLevel', level);
  };
  
  const handleDatePostedChange = (date: string) => {
    setDatePosted(date);
    
    // Calculate the date based on selection
    const now = new Date();
    let fromDate = new Date();
    
    if (date === 'today') {
      fromDate.setHours(0, 0, 0, 0);
    } else if (date === 'week') {
      fromDate.setDate(now.getDate() - 7);
    } else if (date === 'month') {
      fromDate.setMonth(now.getMonth() - 1);
    }
    
    // We would add a dateFrom parameter to the API if we were implementing this fully
  };
  
  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };
  
  const handleSalaryRangeChange = (values: number[]) => {
    setSalaryRange([values[0], values[1]]);
    
    // Update search params with the new salary range
    handleFilterChange('minSalary', values[0].toString());
    handleFilterChange('maxSalary', values[1].toString());
  };
  
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    handleFilterChange('currency', currency);
  };
  
  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save searches",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a name for the search
    const searchName = searchParams.keyword 
      ? `${searchParams.keyword} in ${searchParams.location || 'All Locations'}` 
      : `Jobs in ${searchParams.location || 'All Locations'}`;
      
    setSavedSearches(prev => [
      ...prev, 
      { name: searchName, params: { ...searchParams } }
    ]);
    
    toast({
      title: "Search saved",
      description: "You can access this search later from your dashboard"
    });
  };
  
  const handleCreateJobAlert = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create job alerts",
        variant: "destructive"
      });
      return;
    }
    
    setAlertKeyword(searchParams.keyword || '');
    setShowAlertDialog(true);
  };
  
  const handleSetJobAlert = () => {
    toast({
      title: "Job alert created",
      description: `You'll receive notifications for new "${alertKeyword}" jobs`
    });
    setShowAlertDialog(false);
  };
  
  const handleApplyFilters = () => {
    setCurrentPage(1);
    
    // Create query params from all filters
    const queryParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    // Update URL with all filters
    setLocation(`/find-jobs?${queryParams.toString()}`);
  };
  
  const clearAllFilters = () => {
    setSearchParams({});
    setSelectedJobTypes([]);
    setExperienceLevel('');
    setDatePosted('');
    setSalaryRange([100000, 1000000]);
    setSelectedCurrency('RWF');
    setCurrentPage(1);
    setLocation('/find-jobs');
  };

  return (
    <>
      <Helmet>
        <title>Find Jobs - Business In Rwanda</title>
        <meta name="description" content="Search and apply for jobs across Rwanda. Filter by location, job type, and experience level to find your ideal career opportunity." />
        <meta property="og:title" content="Find Jobs - Business In Rwanda" />
        <meta property="og:description" content="Search and apply for jobs across Rwanda. Filter by location, job type, and experience level to find your ideal career opportunity." />
      </Helmet>
      
      {/* Job Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
            <DialogDescription>
              We'll send you email notifications when new jobs matching your criteria are posted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-keyword">Keywords</Label>
              <Input 
                id="alert-keyword" 
                value={alertKeyword} 
                onChange={(e) => setAlertKeyword(e.target.value)}
                placeholder="e.g. Frontend Developer, Marketing"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alert Frequency</Label>
              <RadioGroup defaultValue="daily" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <label htmlFor="daily" className="text-sm">Daily</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <label htmlFor="weekly" className="text-sm">Weekly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instant" id="instant" />
                  <label htmlFor="instant" className="text-sm">Instant</label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSetJobAlert} 
              className="bg-[#0A3D62] hover:bg-[#082C46]"
            >
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2 font-heading">
              {postType === "all" && "Find Opportunities"}
              {postType === "job" && "Find Jobs"}
              {postType === "tender" && "Find Tenders"}
              {postType === "auction" && "Find Auctions/Cyamunara"}
              {postType === "announcement" && "Find Announcements"}
            </h1>
            <p className="text-neutral-600">
              {postType === "all" && "Search all listings across Rwanda's marketplace"}
              {postType === "job" && "Search job opportunities across Rwanda's job market"}
              {postType === "tender" && "Search tender opportunities from organizations across Rwanda"}
              {postType === "auction" && "Search auctions and Cyamunara listings in Rwanda"}
              {postType === "announcement" && "Search official announcements from organizations"}
            </p>
          </div>
          
          {/* Post Type Selection Tabs */}
          <div className="bg-white p-2 rounded-lg shadow-sm mb-4 overflow-x-auto">
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setPostType("all");
                  handleFilterChange('postType', '');
                  handleApplyFilters(); // Apply filters immediately
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
                  postType === "all" 
                    ? "bg-[#0A3D62] text-white" 
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>All Listings</span>
              </button>
              
              <button
                onClick={() => {
                  setPostType("job");
                  handleFilterChange('postType', 'job');
                  setSearchParams(prev => ({...prev, postType: 'job'}));
                  handleApplyFilters(); // Apply filters immediately
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
                  postType === "job" 
                    ? "bg-[#0A3D62] text-white" 
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Jobs</span>
              </button>
              
              <button
                onClick={() => {
                  setPostType("tender");
                  handleFilterChange('postType', 'tender');
                  setSearchParams(prev => ({...prev, postType: 'tender'}));
                  handleApplyFilters(); // Apply filters immediately
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
                  postType === "tender" 
                    ? "bg-[#0A3D62] text-white" 
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
              </button>
              
              <button
                onClick={() => {
                  setPostType("auction");
                  handleFilterChange('postType', 'auction');
                  setSearchParams(prev => ({...prev, postType: 'auction'}));
                  handleApplyFilters(); // Apply filters immediately
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
                  postType === "auction" 
                    ? "bg-[#0A3D62] text-white" 
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <Gavel className="h-4 w-4" />
                <span>Auctions/Cyamunara</span>
              </button>
              
              <button
                onClick={() => {
                  setPostType("announcement");
                  handleFilterChange('postType', 'announcement');
                  setSearchParams(prev => ({...prev, postType: 'announcement'}));
                  handleApplyFilters(); // Apply filters immediately
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors ${
                  postType === "announcement" 
                    ? "bg-[#0A3D62] text-white" 
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </button>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSearch}>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Job title, skill or company" 
                    className="pl-9"
                    value={searchParams.keyword || ''}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                  <Select 
                    value={searchParams.location || 'all'} 
                    onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      <SelectItem value="kigali">Kigali</SelectItem>
                      <SelectItem value="northern">Northern Province</SelectItem>
                      <SelectItem value="southern">Southern Province</SelectItem>
                      <SelectItem value="eastern">Eastern Province</SelectItem>
                      <SelectItem value="western">Western Province</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="bg-[#0A3D62] hover:bg-[#082C46]">
                Search Jobs
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="md:hidden flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </form>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Desktop & Mobile (conditionally shown) */}
            <div className={`w-full md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <h2 className="font-medium text-lg mb-4">Filters</h2>
                
                <div className="space-y-6">
                  {/* Category - Label changes based on post type */}
                  <div>
                    <Label className="font-medium mb-2 block">
                      {postType === "job" && "Job Category"}
                      {postType === "tender" && "Tender Category"}
                      {postType === "auction" && "Property Category"}
                      {postType === "announcement" && "Announcement Category"}
                      {postType === "all" && "Category"}
                    </Label>
                    <Select 
                      value={searchParams.category || 'all-categories'} 
                      onValueChange={(value) => handleFilterChange('category', value === 'all-categories' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Job Type - Only show for jobs */}
                  {(postType === "job" || postType === "all") && (
                    <div>
                      <Label className="font-medium mb-2 block">Job Type</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="type-fulltime"
                            checked={selectedJobTypes.includes('full_time')}
                            onCheckedChange={(checked) => handleJobTypeChange('full_time', checked as boolean)}
                          />
                          <label htmlFor="type-fulltime" className="text-sm">Full Time</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="type-parttime" 
                            checked={selectedJobTypes.includes('part_time')}
                            onCheckedChange={(checked) => handleJobTypeChange('part_time', checked as boolean)}
                          />
                          <label htmlFor="type-parttime" className="text-sm">Part Time</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="type-contract" 
                            checked={selectedJobTypes.includes('contract')}
                            onCheckedChange={(checked) => handleJobTypeChange('contract', checked as boolean)}
                          />
                          <label htmlFor="type-contract" className="text-sm">Contract</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="type-internship" 
                            checked={selectedJobTypes.includes('internship')}
                            onCheckedChange={(checked) => handleJobTypeChange('internship', checked as boolean)}
                          />
                          <label htmlFor="type-internship" className="text-sm">Internship</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="type-remote" 
                            checked={selectedJobTypes.includes('remote')}
                            onCheckedChange={(checked) => handleJobTypeChange('remote', checked as boolean)}
                          />
                          <label htmlFor="type-remote" className="text-sm">Remote</label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Experience Level - Only for jobs and tenders */}
                  {(postType === "job" || postType === "tender" || postType === "all") && (
                    <div>
                      <Label className="font-medium mb-2 block">
                        {postType === "tender" ? "Required Experience" : "Experience Level"}
                      </Label>
                      <RadioGroup 
                        value={experienceLevel} 
                        onValueChange={(value) => handleExperienceLevelChange(value as ExperienceLevel)}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="entry" id="exp-entry" />
                          <label htmlFor="exp-entry" className="text-sm">Entry Level</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="intermediate" id="exp-intermediate" />
                          <label htmlFor="exp-intermediate" className="text-sm">Intermediate</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="senior" id="exp-senior" />
                          <label htmlFor="exp-senior" className="text-sm">Senior</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="executive" id="exp-executive" />
                          <label htmlFor="exp-executive" className="text-sm">Executive</label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  {/* Value Range - Context-based on post type */}
                  {postType !== "announcement" && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="font-medium">
                          {postType === "job" && "Salary Range"}
                          {postType === "tender" && "Budget Range"}
                          {postType === "auction" && "Estimated Value"}
                          {postType === "all" && "Value Range"} 
                        </Label>
                        <span className="text-sm text-neutral-500">{selectedCurrency} {salaryRange[0].toLocaleString()} - {salaryRange[1].toLocaleString()}</span>
                      </div>
                      <div className="mb-3">
                        <Select 
                          value={selectedCurrency}
                          onValueChange={handleCurrencyChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RWF">Rwandan Franc (RWF)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Slider 
                        defaultValue={salaryRange} 
                        value={salaryRange}
                        onValueChange={handleSalaryRangeChange}
                        min={100000} 
                        max={2000000} 
                        step={50000} 
                        className="my-6"
                      />
                    </div>
                  )}
                  
                  {/* Date Posted - with contextual label */}
                  <div>
                    <Label className="font-medium mb-2 block">
                      {postType === "job" && "Date Posted"}
                      {postType === "tender" && "Tender Date"}
                      {postType === "auction" && "Auction Date"}
                      {postType === "announcement" && "Announcement Date"}
                      {postType === "all" && "Date Posted"}
                    </Label>
                    <RadioGroup 
                      value={datePosted} 
                      onValueChange={handleDatePostedChange}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="date-any" />
                        <label htmlFor="date-any" className="text-sm">Any time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="today" id="date-today" />
                        <label htmlFor="date-today" className="text-sm">Today</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="week" id="date-week" />
                        <label htmlFor="date-week" className="text-sm">This week</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="month" id="date-month" />
                        <label htmlFor="date-month" className="text-sm">This month</label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-[#0A3D62] hover:bg-[#082C46]"
                      onClick={handleApplyFilters}
                    >
                      {postType === "job" && "Apply Job Filters"}
                      {postType === "tender" && "Apply Tender Filters"}
                      {postType === "auction" && "Apply Auction Filters"}
                      {postType === "announcement" && "Apply Filters"}
                      {postType === "all" && "Apply All Filters"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      Clear {postType !== "all" ? postType.charAt(0).toUpperCase() + postType.slice(1) : ""} Filters
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleSaveSearch}
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Save this search</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={handleCreateJobAlert}
                    >
                      <Bell className="h-4 w-4" />
                      <span>Create job alert</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Jobs List */}
            <div className="w-full md:w-3/4">
              <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="font-medium">
                      {isLoading ? 
                        `Loading ${postType === "all" ? "listings" : 
                          postType === "job" ? "jobs" : 
                          postType === "tender" ? "tenders" : 
                          postType === "auction" ? "auctions" : 
                          postType === "announcement" ? "announcements" : 
                          "listings"}...` : 
                        `${jobs.length} ${
                          postType === "all" ? "Listings" : 
                          postType === "job" ? "Jobs" : 
                          postType === "tender" ? "Tenders" : 
                          postType === "auction" ? "Auctions" : 
                          postType === "announcement" ? "Announcements" : 
                          "Listings"
                        } Found`
                      }
                    </h2>
                    {Object.keys(searchParams).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {searchParams.keyword && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>Keyword: {searchParams.keyword}</span>
                          </Badge>
                        )}
                        {searchParams.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>Location: {searchParams.location}</span>
                          </Badge>
                        )}
                        {searchParams.category && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>Category: {searchParams.category}</span>
                          </Badge>
                        )}
                        {searchParams.jobType && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>Type: {searchParams.jobType.replace('_', ' ')}</span>
                          </Badge>
                        )}
                        {searchParams.experienceLevel && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>Experience: {searchParams.experienceLevel}</span>
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Select 
                    value={sortOrder} 
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="relevant">Most Relevant</SelectItem>
                      <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
                      <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-[200px] bg-white animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      companyName="Company Name" // This would come from the company relation
                      companyLogo="https://picsum.photos/200" // Using a placeholder image service
                      location={job.location}
                      jobType={job.type}
                      salary={job.salary || "Competitive salary"}
                      description={job.description}
                      postedAt={job.createdAt}
                      isNew={new Date(job.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000}
                      isRemote={job.type === 'remote'}
                      className="mb-4"
                    />
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Previous
                      </Button>
                      {[...Array(Math.min(3, Math.ceil(jobs.length / 10)))].map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          className={currentPage === i + 1 ? "bg-[#0A3D62]" : ""}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button 
                        variant="outline"
                        disabled={currentPage >= Math.ceil(jobs.length / 10)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  {/* Dynamic icon based on selected post type */}
                  {postType === "job" && <Briefcase className="h-12 w-12 text-neutral-400 mx-auto mb-4" />}
                  {postType === "tender" && <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />}
                  {postType === "auction" && <Gavel className="h-12 w-12 text-neutral-400 mx-auto mb-4" />}
                  {postType === "announcement" && <Megaphone className="h-12 w-12 text-neutral-400 mx-auto mb-4" />}
                  {postType === "all" && <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />}
                  
                  {/* Dynamic heading based on selected post type */}
                  <h3 className="text-xl font-medium mb-2">
                    {postType === "job" && "No jobs found"}
                    {postType === "tender" && "No tenders found"}
                    {postType === "auction" && "No auctions found"}
                    {postType === "announcement" && "No announcements found"}
                    {postType === "all" && "No listings found"}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    We couldn't find any {postType === "all" ? "listings" : postType + "s"} matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchParams({});
                      setCurrentPage(1);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FindJobs;
