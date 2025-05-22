import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/HeroSection';
import FeaturedJobs from '@/components/FeaturedJobs';
import JobCategories from '@/components/JobCategories';
import EmployerCTA from '@/components/EmployerCTA';
import FeaturedEmployers from '@/components/FeaturedEmployers';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import DeadlineHighlights from '@/components/DeadlineHighlights';
import CategoryFeaturedAds from '@/components/CategoryFeaturedAds';
import LocationBrowser from '@/components/LocationBrowser';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import IndustryInsights from '@/components/IndustryInsights';
import SuccessStories from '@/components/SuccessStories';
import MobileAppPromo from '@/components/MobileAppPromo';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Business In Rwanda - Advertisement & Opportunities Portal</title>
        <meta name="description" content="Find jobs, tenders, auctions, and announcements in Rwanda's growing economy. Business In Rwanda connects individuals with opportunities through a modern multi-purpose platform." />
        {/* Open Graph tags */}
        <meta property="og:title" content="Business In Rwanda - Advertisement Portal" />
        <meta property="og:description" content="Connect with opportunities in Rwanda - jobs, tenders, auctions, and announcements" />
        <meta property="og:type" content="website" />
      </Helmet>

      <HeroSection />
      
      {/* Main layout with 2 columns on desktop */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="lg:col-span-2">
            <FeaturedJobs />
            <CategoryFeaturedAds />
            <DeadlineHighlights />
            <PersonalizedRecommendations />
          </div>
          
          {/* Sidebar column */}
          <div className="space-y-8">
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">Quick Links</h2>
              <nav className="space-y-2">
                <a href="/find-jobs" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Browse All Listings
                </a>
                <a href="/find-jobs?type=job" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Job Opportunities
                </a>
                <a href="/find-jobs?type=tender" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Tenders
                </a>
                <a href="/find-jobs?type=auction" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Auctions/Cyamunara
                </a>
                <a href="/find-jobs?type=announcement" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Announcements
                </a>
                <a href="/companies" className="block p-2 hover:bg-neutral-100 rounded text-[#0A3D62]">
                  Partner Organizations
                </a>
              </nav>
            </div>
            
            <RecentActivityFeed />
          </div>
        </div>
      </div>
      
      <JobCategories />
      <LocationBrowser />
      <SuccessStories />
      <IndustryInsights />
      <MobileAppPromo />
      <EmployerCTA />
      <FeaturedEmployers />
      <CTASection />
    </>
  );
};

export default Home;
