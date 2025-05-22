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

const Opportunities = () => {
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
    setLocation(`/opportunities?${queryParams.toString()}`);
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
    setLocation(`/opportunities?${queryParams.toString()}`);
  };
  
  const clearAllFilters = () => {
    setSearchParams({});
    setSelectedJobTypes([]);
    setExperienceLevel('');
    setDatePosted('');
    setSalaryRange([100000, 1000000]);
    setSelectedCurrency('RWF');
    setCurrentPage(1);
    setLocation('/opportunities');
  };

  return (
    <>
      <Helmet>
        <title>
          {postType === "all" ? "Browse Opportunities - Business In Rwanda" :
          postType === "job" ? "Job Opportunities - Business In Rwanda" :
          postType === "tender" ? "Tender Opportunities - Business In Rwanda" :
          postType === "auction" ? "Auction/Cyamunara Opportunities - Business In Rwanda" :
          "Announcements - Business In Rwanda"}
        </title>
        <meta name="description" content={
          postType === "all" 
            ? "Search jobs, tenders, auctions, and announcements across Rwanda. Filter by location, type, and other criteria to find the right opportunity."
            : postType === "job"
            ? "Search and apply for jobs across Rwanda. Filter by location, job type, and experience level to find your ideal career opportunity."
            : postType === "tender"
            ? "Browse tender opportunities from organizations across Rwanda. Find and bid on projects that match your expertise."
            : postType === "auction"
            ? "Discover property and asset auctions (Cyamunara) across Rwanda. Find valuable opportunities and place your bids."
            : "View official announcements from organizations and government entities across Rwanda."
        } />
        <meta property="og:title" content={
          postType === "all" 
            ? "Find Opportunities - Business In Rwanda"
            : postType === "job"
            ? "Find Jobs - Business In Rwanda"
            : postType === "tender"
            ? "Find Tenders - Business In Rwanda"
            : postType === "auction"
            ? "Find Auctions/Cyamunara - Business In Rwanda"
            : "Announcements - Business In Rwanda"
        } />
        <meta property="og:description" content={
          postType === "all" 
            ? "Search jobs, tenders, auctions, and announcements across Rwanda. Filter by location, type, and other criteria to find the right opportunity."
            : postType === "job"
            ? "Search and apply for jobs across Rwanda. Filter by location, job type, and experience level to find your ideal career opportunity."
            : postType === "tender"
            ? "Browse tender opportunities from organizations across Rwanda. Find and bid on projects that match your expertise."
            : postType === "auction"
            ? "Discover property and asset auctions (Cyamunara) across Rwanda. Find valuable opportunities and place your bids."
            : "View official announcements from organizations and government entities across Rwanda."
        } />
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
              {postType === "all" && "Search all opportunities across Rwanda's marketplace"}
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
                <span>All Opportunities</span>
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
                <span>Auctions</span>
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
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full md:w-1/4">
              {/* Search Form */}
              <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                <form onSubmit={handleSearch}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="search-keyword">Keywords</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input 
                          id="search-keyword"
                          placeholder="Job title, skills, or keywords" 
                          className="pl-9"
                          value={searchParams.keyword || ''}
                          onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="search-location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input 
                          id="search-location"
                          placeholder="City, district, or region" 
                          className="pl-9"
                          value={searchParams.location || ''}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="search-category">Category</Label>
                      <Select 
                        value={searchParams.category || ''}
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger id="search-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                              {category.name} ({category.count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#0A3D62] hover:bg-[#082C46]"
                    >
                      Search
                    </Button>
                    
                    <div className="pt-3 text-center">
                      <button 
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-sm text-[#0A3D62] font-medium inline-flex items-center"
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        {showFilters ? 'Hide filters' : 'Show more filters'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Additional Filters */}
              {showFilters && (
                <div className="bg-white p-5 rounded-lg shadow-sm mb-4">
                  <h3 className="font-semibold mb-4">Additional Filters</h3>
                  
                  {postType === "job" && (
                    <>
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3">Job Type</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Checkbox 
                              id="job-type-full-time" 
                              checked={selectedJobTypes.includes('full_time')}
                              onCheckedChange={(checked) => handleJobTypeChange('full_time', checked as boolean)}
                            />
                            <label htmlFor="job-type-full-time" className="ml-2 text-sm">Full Time</label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="job-type-part-time"
                              checked={selectedJobTypes.includes('part_time')}
                              onCheckedChange={(checked) => handleJobTypeChange('part_time', checked as boolean)}
                            />
                            <label htmlFor="job-type-part-time" className="ml-2 text-sm">Part Time</label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="job-type-contract"
                              checked={selectedJobTypes.includes('contract')}
                              onCheckedChange={(checked) => handleJobTypeChange('contract', checked as boolean)}
                            />
                            <label htmlFor="job-type-contract" className="ml-2 text-sm">Contract</label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="job-type-internship"
                              checked={selectedJobTypes.includes('internship')}
                              onCheckedChange={(checked) => handleJobTypeChange('internship', checked as boolean)}
                            />
                            <label htmlFor="job-type-internship" className="ml-2 text-sm">Internship</label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="job-type-remote"
                              checked={selectedJobTypes.includes('remote')}
                              onCheckedChange={(checked) => handleJobTypeChange('remote', checked as boolean)}
                            />
                            <label htmlFor="job-type-remote" className="ml-2 text-sm">Remote</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3">Experience Level</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <RadioGroup 
                              value={experienceLevel} 
                              onValueChange={handleExperienceLevelChange}
                              className="space-y-2"
                            >
                              <div className="flex items-center">
                                <RadioGroupItem value="entry" id="exp-entry" />
                                <label htmlFor="exp-entry" className="ml-2 text-sm">Entry Level</label>
                              </div>
                              <div className="flex items-center">
                                <RadioGroupItem value="intermediate" id="exp-intermediate" />
                                <label htmlFor="exp-intermediate" className="ml-2 text-sm">Intermediate</label>
                              </div>
                              <div className="flex items-center">
                                <RadioGroupItem value="senior" id="exp-senior" />
                                <label htmlFor="exp-senior" className="ml-2 text-sm">Senior</label>
                              </div>
                              <div className="flex items-center">
                                <RadioGroupItem value="executive" id="exp-executive" />
                                <label htmlFor="exp-executive" className="ml-2 text-sm">Executive</label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3">Date Posted</h4>
                    <div className="space-y-2">
                      <RadioGroup 
                        value={datePosted} 
                        onValueChange={handleDatePostedChange}
                        className="space-y-2"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="today" id="date-today" />
                          <label htmlFor="date-today" className="ml-2 text-sm">Today</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="week" id="date-week" />
                          <label htmlFor="date-week" className="ml-2 text-sm">Past Week</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="month" id="date-month" />
                          <label htmlFor="date-month" className="ml-2 text-sm">Past Month</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="any" id="date-any" />
                          <label htmlFor="date-any" className="ml-2 text-sm">Any Time</label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  {postType === "job" && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3">Salary Range</h4>
                      <div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm">{salaryRange[0].toLocaleString()} {selectedCurrency}</div>
                          <div className="text-sm">{salaryRange[1].toLocaleString()} {selectedCurrency}</div>
                        </div>
                        <Slider
                          value={[salaryRange[0], salaryRange[1]]}
                          min={0}
                          max={2000000}
                          step={50000}
                          onValueChange={handleSalaryRangeChange}
                          className="mb-6"
                        />
                      </div>
                      <Select
                        value={selectedCurrency}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">RWF</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleApplyFilters}
                      className="flex-1 bg-[#0A3D62] hover:bg-[#082C46]"
                    >
                      Apply Filters
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Jobs List */}
            <div className="w-full md:w-3/4">
              <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="font-medium">
                      {isLoading ? 
                        `Loading ${postType === "all" ? "opportunities" : 
                          postType === "job" ? "jobs" : 
                          postType === "tender" ? "tenders" : 
                          postType === "auction" ? "auctions" : 
                          postType === "announcement" ? "announcements" : 
                          "opportunities"}...` : 
                        `${jobs.length} ${
                          postType === "all" ? "Opportunities" : 
                          postType === "job" ? "Jobs" : 
                          postType === "tender" ? "Tenders" : 
                          postType === "auction" ? "Auctions" : 
                          postType === "announcement" ? "Announcements" : 
                          "Opportunities"
                        } Found`
                      }
                    </h2>
                    {Object.keys(searchParams).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {searchParams.keyword && (
                          <Badge variant="outline" className="text-xs">
                            Keyword: {searchParams.keyword}
                          </Badge>
                        )}
                        {searchParams.location && (
                          <Badge variant="outline" className="text-xs">
                            Location: {searchParams.location}
                          </Badge>
                        )}
                        {searchParams.category && (
                          <Badge variant="outline" className="text-xs">
                            Category: {searchParams.category}
                          </Badge>
                        )}
                        {searchParams.jobType && (
                          <Badge variant="outline" className="text-xs">
                            Job Type: {searchParams.jobType.replace('_', ' ')}
                          </Badge>
                        )}
                        {searchParams.experienceLevel && (
                          <Badge variant="outline" className="text-xs">
                            Experience: {searchParams.experienceLevel}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="self-end sm:self-auto">
                    <Select 
                      value={sortOrder}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="relevant">Most Relevant</SelectItem>
                        {postType === "job" && (
                          <>
                            <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                            <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Search Tools */}
              <div className="bg-white p-2 rounded-lg shadow-sm mb-6 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveSearch}
                  className="flex items-center text-xs"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  Save Search
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateJobAlert}
                  className="flex items-center text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Create Alert
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
              
              {/* Active Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-blue-700 mb-2">Saved Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((saved, index) => (
                      <Badge key={index} variant="outline" className="bg-white cursor-pointer">
                        {saved.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Job Results */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div>
                  {/* Job Cards */}
                  <div className="space-y-4 mb-8">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral-600">
                      Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, jobs.length)} of {jobs.length}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={currentPage * 10 >= jobs.length}
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
                    {postType === "all" && "No opportunities found"}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    We couldn't find any {postType === "all" ? "opportunities" : postType + "s"} matching your search criteria. Try adjusting your filters or search terms.
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

export default Opportunities;