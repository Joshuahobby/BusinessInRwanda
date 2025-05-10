import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { JobSearchParams, JobType, ExperienceLevel } from '@/lib/types';
import { Job } from '@shared/schema';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';

const FindJobs = () => {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<JobSearchParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Parse initial search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const initialParams: JobSearchParams = {};
    
    if (params.has('keyword')) initialParams.keyword = params.get('keyword') || undefined;
    if (params.has('location')) initialParams.location = params.get('location') || undefined;
    if (params.has('category')) initialParams.category = params.get('category') || undefined;
    
    setSearchParams(initialParams);
  }, [location]);

  // Fetch jobs based on search params
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs', searchParams, currentPage],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Here we would update the URL with the new search params
  };

  const handleFilterChange = (key: keyof JobSearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      <Helmet>
        <title>Find Jobs - Business In Rwanda</title>
        <meta name="description" content="Search and apply for jobs across Rwanda. Filter by location, job type, and experience level to find your ideal career opportunity." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2 font-heading">Find Jobs</h1>
            <p className="text-neutral-600">Search opportunities across Rwanda's job market</p>
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
                    value={searchParams.location || ''} 
                    onValueChange={(value) => handleFilterChange('location', value)}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
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
                  {/* Job Type */}
                  <div>
                    <Label className="font-medium mb-2 block">Job Type</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="type-fulltime" />
                        <label htmlFor="type-fulltime" className="text-sm">Full Time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="type-parttime" />
                        <label htmlFor="type-parttime" className="text-sm">Part Time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="type-contract" />
                        <label htmlFor="type-contract" className="text-sm">Contract</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="type-internship" />
                        <label htmlFor="type-internship" className="text-sm">Internship</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="type-remote" />
                        <label htmlFor="type-remote" className="text-sm">Remote</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Experience Level */}
                  <div>
                    <Label className="font-medium mb-2 block">Experience Level</Label>
                    <RadioGroup className="space-y-2">
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
                  
                  {/* Salary Range */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="font-medium">Salary Range (RWF)</Label>
                      <span className="text-sm text-neutral-500">100k - 1M+</span>
                    </div>
                    <Slider 
                      defaultValue={[100000, 1000000]} 
                      min={100000} 
                      max={2000000} 
                      step={50000} 
                    />
                  </div>
                  
                  {/* Date Posted */}
                  <div>
                    <Label className="font-medium mb-2 block">Date Posted</Label>
                    <RadioGroup className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="date-any" />
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
                  
                  <Button className="w-full bg-[#0A3D62] hover:bg-[#082C46]">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Jobs List */}
            <div className="w-full md:w-3/4">
              <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium">
                    {isLoading ? 'Loading jobs...' : `${jobs.length} Jobs Found`}
                  </h2>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[180px]">
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
                      companyLogo="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"
                      location={job.location}
                      jobType={job.type}
                      salary={job.salary || "Competitive salary"}
                      description={job.description}
                      postedAt={job.createdAt}
                      isNew={new Date(job.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000}
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
                      {[...Array(3)].map((_, i) => (
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
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <Briefcase className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                  <p className="text-neutral-600 mb-4">
                    We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms.
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
