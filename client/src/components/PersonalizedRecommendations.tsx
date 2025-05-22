import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, ArrowRight } from "lucide-react";
import { Job } from "@shared/schema";
import JobCard from "./JobCard";

const PersonalizedRecommendations = () => {
  // Get user info and browsing history
  // In a real app, this would come from user session data
  const isLoggedIn = true; // Mock value, would be determined by auth state
  const userId = 5; // Mock value, would be determined by auth state
  
  // Get recommended jobs for the user
  const { data: recommendedJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs/recommended', userId],
    // Only fetch if user is logged in
    enabled: isLoggedIn,
  });

  // If user is not logged in, show nothing
  if (!isLoggedIn) {
    return null;
  }

  // Show a loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="h-6 bg-neutral-100 animate-pulse rounded-md w-1/3"></h2>
            <div className="h-4 bg-neutral-100 animate-pulse rounded-md w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[280px] bg-neutral-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no recommendations are available, show nothing
  if (recommendedJobs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading flex items-center">
              <Star className="text-yellow-500 mr-2 h-6 w-6" />
              Recommended For You
            </h2>
            <p className="text-neutral-600 mt-1">Opportunities tailored to your profile and browsing history</p>
          </div>
          <Link href="/recommendations" className="text-[#0A3D62] hover:text-[#082C46] font-medium flex items-center">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedJobs.slice(0, 3).map((job) => {
            const companyName = job.companyName || 
              (job.additionalData && typeof job.additionalData === 'object' && 
               'individualName' in job.additionalData ? String(job.additionalData.individualName) : "Individual Employer");
            
            return (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                companyName={companyName}
                companyLogo={job.companyLogo || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"}
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
            );
          })}
        </div>
        
        <div className="mt-10 p-5 bg-[#F8F9FA] rounded-lg border border-neutral-200">
          <h3 className="font-medium text-neutral-800 mb-3">Why am I seeing these recommendations?</h3>
          <p className="text-sm text-neutral-600">
            These recommendations are based on your profile information, job search history, and the types of listings you've shown interest in. We use this data to find opportunities that align with your skills and preferences.
          </p>
          <div className="mt-4 flex justify-end">
            <Link href="/account/preferences" className="text-sm text-[#0A3D62] hover:underline">
              Update my preferences
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;