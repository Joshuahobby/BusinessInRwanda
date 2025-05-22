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
import { Bell } from 'lucide-react';

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

      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Listings Section */}
      <section className="bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 py-16">
          <FeaturedJobs />
        </div>
      </section>
      
      {/* Main Content Section */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          {/* "Coming Soon" Banner for new features */}
          <div className="mb-10 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center animate-fadeIn">
            <Bell className="text-blue-500 mr-3 h-5 w-5 animate-pulse-slow" />
            <p className="text-blue-700 text-sm">
              <span className="font-semibold">New features coming soon!</span> Mobile apps, personalized recommendations, and industry insights will be available in our next update.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Deadline Highlights */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover-lift animate-fadeIn">
                <div className="border-b border-neutral-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-[#0A3D62] flex items-center">
                    <span className="animate-pulse-slow mr-2">⏱️</span> Closing Soon
                  </h2>
                </div>
                <div className="p-6">
                  <DeadlineHighlights />
                </div>
              </div>
              
              {/* Category Featured Ads */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover-lift animate-fadeIn delay-1">
                <div className="border-b border-neutral-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-[#0A3D62]">Browse by Category</h2>
                </div>
                <div className="p-6">
                  <CategoryFeaturedAds />
                </div>
              </div>
              
              {/* Personalized Recommendations - Marked as "Coming Soon" */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 relative hover-lift animate-fadeIn delay-2">
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full animate-pulse-slow">
                  Coming Soon
                </div>
                <div className="border-b border-neutral-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-[#0A3D62]">Recommended For You</h2>
                </div>
                <div className="p-6">
                  <PersonalizedRecommendations />
                </div>
              </div>
            </div>
            
            {/* Sidebar column */}
            <div className="space-y-8">
              {/* Quick Links */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover-lift animate-fadeIn">
                <div className="border-b border-neutral-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-[#0A3D62]">Quick Links</h2>
                </div>
                <div className="p-6">
                  <nav className="space-y-2">
                    <a href="/listings" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-1">
                      Browse All Listings
                    </a>
                    <a href="/listings?type=job" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-2">
                      Job Opportunities
                    </a>
                    <a href="/listings?type=tender" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-3">
                      Tenders
                    </a>
                    <a href="/listings?type=auction" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-4">
                      Auctions/Cyamunara
                    </a>
                    <a href="/listings?type=announcement" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-5">
                      Announcements
                    </a>
                    <a href="/companies" className="block p-2 hover:bg-neutral-50 rounded text-[#0A3D62] transition-colors animate-slideInRight delay-5">
                      Partner Organizations
                    </a>
                  </nav>
                </div>
              </div>
              
              {/* Recent Activity Feed */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover-lift animate-fadeIn delay-1">
                <div className="border-b border-neutral-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-[#0A3D62]">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <RecentActivityFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Browse by Location Section */}
      <section className="bg-white border-y border-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Find Opportunities Near You</h2>
            <p className="text-neutral-600">Discover listings across Rwanda's provinces or work remotely</p>
            <div className="w-20 h-1 bg-[#0A3D62] mx-auto mt-6 rounded-full animate-shimmer"></div>
          </div>
          <div className="hover-scale">
            <LocationBrowser />
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="bg-neutral-50 border-b border-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Explore by Category</h2>
            <p className="text-neutral-600">Browse opportunities across different industries and sectors</p>
            <div className="w-20 h-1 bg-[#0A3D62] mx-auto mt-6 rounded-full animate-shimmer"></div>
          </div>
          <div className="hover-scale">
            <JobCategories />
          </div>
        </div>
      </section>
      
      {/* Success Stories Section */}
      <SuccessStories />
      
      {/* Industry Insights Section - Marked as "Coming Soon" */}
      <section className="bg-white border-y border-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Industry Insights</h2>
            <p className="text-neutral-600">Stay informed about Rwanda's job market trends</p>
            <div className="inline-block mt-4 bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full animate-pulse-slow">
              Coming Soon in Next Update
            </div>
            <div className="w-20 h-1 bg-[#0A3D62] mx-auto mt-6 rounded-full animate-shimmer"></div>
          </div>
          <div className="opacity-75 hover-lift transition-all duration-300">
            <IndustryInsights />
          </div>
        </div>
      </section>
      
      {/* Mobile App Promo Section - Marked as "Coming Soon" */}
      <section className="bg-neutral-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Stay Connected On The Go</h2>
            <p className="text-neutral-600">Access opportunities anywhere with our mobile application</p>
            <div className="inline-block mt-4 bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full animate-pulse-slow">
              Coming Soon in Next Update
            </div>
            <div className="w-20 h-1 bg-[#0A3D62] mx-auto mt-6 rounded-full animate-shimmer"></div>
          </div>
          <div className="hover-scale">
            <MobileAppPromo />
          </div>
        </div>
      </section>
      
      {/* For Employers Section */}
      <div className="animate-fadeIn">
        <EmployerCTA />
      </div>
      
      {/* Featured Employers Section */}
      <section className="bg-white border-t border-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Featured Organizations</h2>
            <p className="text-neutral-600">Connect with Rwanda's leading employers and partners</p>
            <div className="w-20 h-1 bg-[#0A3D62] mx-auto mt-6 rounded-full animate-shimmer"></div>
          </div>
          <div className="hover-scale">
            <FeaturedEmployers />
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <div className="animate-fadeIn delay-2">
        <CTASection />
      </div>
    </>
  );
};

export default Home;
