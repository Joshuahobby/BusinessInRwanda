import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobCard from "./JobCard";
import { Job, Category } from "@shared/schema";

const CategoryFeaturedAds = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  const { data: allJobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Get top categories with the most posts
  const topCategories = [...categories]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 4);

  // Default to first category or "all"
  const [activeCategory, setActiveCategory] = useState<string>(
    topCategories.length > 0 ? topCategories[0].name : "all"
  );

  // Filter jobs by category and limit to 3 per category
  const getJobsByCategory = (categoryName: string) => {
    return allJobs
      .filter(job => job.category === categoryName)
      .slice(0, 3);
  };

  // Get company information for job
  const getCompanyName = (job: Job) => {
    return job.companyName || 
      (job.additionalData && typeof job.additionalData === 'object' && 
       'individualName' in job.additionalData ? String(job.additionalData.individualName) : "Individual Employer");
  };

  // Loading state
  if (categoriesLoading || jobsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-neutral-200 animate-pulse rounded-lg w-2/3"></div>
        <div className="h-12 bg-neutral-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[280px] bg-neutral-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // If no categories or jobs are available
  if (topCategories.length === 0 || allJobs.length === 0) {
    return null;
  }

  return (
    <div>
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto p-1 bg-white border rounded-lg mb-6">
          {topCategories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.name}
              className="px-4 py-2 data-[state=active]:bg-[#0A3D62] data-[state=active]:text-white"
            >
              {category.name}
              <span className="ml-2 bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full data-[state=active]:bg-[#082C46] data-[state=active]:text-white">
                {category.count || 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {topCategories.map((category) => {
          const categoryJobs = getJobsByCategory(category.name);
          
          return (
            <TabsContent key={category.id} value={category.name} className="mt-0">
              {categoryJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      companyName={getCompanyName(job)}
                      companyLogo={"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"}
                      location={job.location}
                      jobType={job.type}
                      salary={job.salary ? `${job.salary} ${job.currency || 'RWF'}` : "Competitive salary"}
                      description={job.description}
                      postedAt={new Date(job.createdAt)}
                      isNew={new Date(job.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000}
                      isFeatured={job.isFeatured}
                      isRemote={job.location.toLowerCase().includes('remote')}
                      postType={job.postType || "job"}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white border rounded-lg">
                  <p className="text-neutral-600">No listings available in this category at the moment.</p>
                  <a href={`/find-jobs?category=${encodeURIComponent(category.name)}`} className="mt-2 inline-block text-[#0A3D62] hover:underline">
                    View all {category.name} listings
                  </a>
                </div>
              )}
              
              {categoryJobs.length > 0 && (
                <div className="mt-6 text-center">
                  <a 
                    href={`/find-jobs?category=${encodeURIComponent(category.name)}`}
                    className="inline-flex items-center px-4 py-2 border border-[#0A3D62] text-[#0A3D62] hover:bg-[#0A3D62] hover:text-white rounded-md transition-colors"
                  >
                    View all {category.name} listings
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CategoryFeaturedAds;