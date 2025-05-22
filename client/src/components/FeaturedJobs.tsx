import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import JobCard from "./JobCard";
import { Job, Company } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface JobWithCompany extends Job {
  company?: Company;
}

interface FeaturedJobsProps {
  limit?: number;
  showTitle?: boolean;
  showPagination?: boolean;
  className?: string;
}

const FeaturedJobs = ({ 
  limit = 6, 
  showTitle = true, 
  showPagination = true,
  className = ""
}: FeaturedJobsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = limit;

  const { data: featuredJobs = [], isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/jobs/featured'],
  });

  // Get relevant companies data for the featured jobs
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies/featured'],
  });

  // Get company information for each job
  const getCompanyInfo = (companyId: number | null) => {
    if (!companyId) return null;
    return companies.find(company => company.id === companyId);
  };

  // Calculate pagination
  const totalItems = featuredJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = featuredJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <section className={`py-8 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading">Featured Advertisements</h2>
            <Link href="/listings" className="text-[#0A3D62] hover:text-[#082C46] font-medium flex items-center">
              View All Listings
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[280px] bg-neutral-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((job) => {
                const company = getCompanyInfo(job.companyId);
                // Get company logo or use a placeholder
                const companyLogo = company?.logo || null;
                
                // For job posts with individual owners (no company)
                const companyName = company?.name || 
                  (job.additionalData && typeof job.additionalData === 'object' && 
                  'individualName' in job.additionalData ? String(job.additionalData.individualName) : "Individual Employer");
                
                // Handle additional post type attributes
                // Default to job if postType is not specified
                const postType = job.postType || "job";
                
                return (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    companyName={companyName}
                    companyLogo={companyLogo}
                    location={job.location}
                    jobType={job.type}
                    salary={job.salary ? `${job.salary} ${job.currency || 'RWF'}` : "Competitive salary"}
                    description={job.description}
                    postedAt={new Date(job.createdAt)}
                    isNew={new Date(job.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000}
                    isFeatured={true}
                    isRemote={job.location.toLowerCase().includes('remote')}
                    postType={postType}
                  />
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {showPagination && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button 
                      key={i} 
                      variant={currentPage === i + 1 ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 p-0 ${currentPage === i + 1 ? 'bg-[#0A3D62]' : ''}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No featured advertisements available at this time. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJobs;
