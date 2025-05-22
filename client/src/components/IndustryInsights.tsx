import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { LineChart, Line } from "recharts";
import { TrendingUp, Users, BriefcaseIcon, BarChart2 } from "lucide-react";
import { Job, Category } from "@shared/schema";

const IndustryInsights = () => {
  // Get all jobs for statistics
  const { data: allJobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Get categories for industry breakdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  // Calculate job type breakdown (full-time, part-time, etc.)
  const jobTypeStats = allJobs.reduce((acc: Record<string, number>, job) => {
    const type = job.type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Format job type data for chart
  const jobTypeData = Object.entries(jobTypeStats)
    .map(([name, value]) => ({ name: formatJobType(name), value }))
    .sort((a, b) => b.value - a.value);

  // Get post type breakdown (job, tender, auction, announcement)
  const postTypeStats = allJobs.reduce((acc: Record<string, number>, job) => {
    const type = job.postType || "job";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Format post type data for chart
  const postTypeData = Object.entries(postTypeStats)
    .map(([name, value]) => ({ name: formatPostType(name), value }))
    .sort((a, b) => b.value - a.value);

  // Helper function to format job type for display
  function formatJobType(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Helper function to format post type for display
  function formatPostType(type: string): string {
    switch(type) {
      case "job": return "Jobs";
      case "tender": return "Tenders";
      case "auction": return "Auctions";
      case "announcement": return "Announcements";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  // Mock data for trends over time (would be replaced with real data from API)
  const trendData = [
    { month: 'Jan', jobs: 65, tenders: 28, auctions: 15 },
    { month: 'Feb', jobs: 59, tenders: 32, auctions: 22 },
    { month: 'Mar', jobs: 80, tenders: 35, auctions: 18 },
    { month: 'Apr', jobs: 81, tenders: 30, auctions: 20 },
    { month: 'May', jobs: 95, tenders: 42, auctions: 25 },
    { month: 'Jun', jobs: 110, tenders: 45, auctions: 30 }
  ];

  const isLoading = jobsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 bg-neutral-200 w-1/3 mx-auto rounded-md animate-pulse mb-2"></div>
            <div className="h-4 bg-neutral-200 w-1/2 mx-auto rounded-md animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm h-[300px] animate-pulse"></div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-[300px] animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  // If no data is available
  if (allJobs.length === 0 && categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading">Rwanda Job Market Insights</h2>
          <p className="text-neutral-600 mt-2">Discover trends and opportunities in Rwanda's growing economy</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Total Jobs Card */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-neutral-600 text-sm">Total Listings</p>
                <h3 className="text-2xl font-bold text-neutral-800">{allJobs.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              Across all categories and types
            </div>
          </div>
          
          {/* Job Types Card */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-neutral-600 text-sm">Job Types</p>
                <h3 className="text-2xl font-bold text-neutral-800">{Object.keys(jobTypeStats).length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              Most common: {jobTypeData[0]?.name || "N/A"} ({jobTypeData[0]?.value || 0})
            </div>
          </div>
          
          {/* Categories Card */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-neutral-600 text-sm">Categories</p>
                <h3 className="text-2xl font-bold text-neutral-800">{categories.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              Top category: {categories[0]?.name || "N/A"} ({categories[0]?.count || 0})
            </div>
          </div>
          
          {/* Growth Card */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-neutral-600 text-sm">Monthly Growth</p>
                <h3 className="text-2xl font-bold text-neutral-800">+15%</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-neutral-500">
              Based on new listings in the last 30 days
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Types Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Job Types Distribution</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <XAxis type="number" hide={true} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip 
                    formatter={(value) => [`${value} listings`, 'Count']}
                    labelFormatter={(name) => `${name}`}
                  />
                  <Bar dataKey="value" fill="#0A3D62" barSize={25} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Listings Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Listings Trend (Last 6 Months)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jobs" stroke="#0A3D62" strokeWidth={2} />
                  <Line type="monotone" dataKey="tenders" stroke="#BD2031" strokeWidth={2} />
                  <Line type="monotone" dataKey="auctions" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link 
            href="/market-trends" 
            className="inline-flex items-center px-4 py-2 border border-[#0A3D62] text-[#0A3D62] rounded-md hover:bg-[#0A3D62] hover:text-white transition-colors"
          >
            View Detailed Market Analysis
            <TrendingUp className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IndustryInsights;