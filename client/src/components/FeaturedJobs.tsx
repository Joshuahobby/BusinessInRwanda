import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import JobCard from "./JobCard";
import { Job } from "@shared/schema";

const FeaturedJobs = () => {
  const { data: featuredJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs/featured'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading">Featured Jobs</h2>
          <Link href="/find-jobs" className="text-[#0A3D62] hover:text-[#082C46] font-medium flex items-center">
            View All Jobs
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[280px] bg-neutral-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
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
                isFeatured={true}
                isRemote={job.location.toLowerCase().includes('remote')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No featured jobs available at this time. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJobs;
