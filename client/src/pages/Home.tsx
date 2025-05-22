import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/HeroSection';
import FeaturedJobs from '@/components/FeaturedJobs';
import JobCategories from '@/components/JobCategories';
import EmployerCTA from '@/components/EmployerCTA';
import FeaturedEmployers from '@/components/FeaturedEmployers';
import CTASection from '@/components/CTASection';
import DeadlineHighlights from '@/components/DeadlineHighlights';
import CategoryFeaturedAds from '@/components/CategoryFeaturedAds';
import LocationBrowser from '@/components/LocationBrowser';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import IndustryInsights from '@/components/IndustryInsights';
import SuccessStories from '@/components/SuccessStories';
import MobileAppPromo from '@/components/MobileAppPromo';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import SmartScreenTooltip from '@/components/SmartScreenTooltip';
import { Briefcase, MapPin, Tag, Clock, Bell, Star, Flame, CalendarDays, ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Business In Rwanda - Advertisement & Opportunities Portal</title>
        <meta name="description" content="Find jobs, tenders, auctions, and announcements in Rwanda's growing economy. Business In Rwanda connects individuals with opportunities through a modern multi-purpose platform." />
        <meta property="og:title" content="Business In Rwanda - Advertisement Portal" />
        <meta property="og:description" content="Connect with opportunities in Rwanda - jobs, tenders, auctions, and announcements" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <HeroSection />
      
      {/* Quick Access Categories */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {[
              { name: "All", icon: <Briefcase className="h-4 w-4" />, link: "/opportunities", color: "bg-blue-50 text-blue-700" },
              { name: "Jobs", icon: <Briefcase className="h-4 w-4" />, link: "/opportunities?type=job", color: "bg-emerald-50 text-emerald-700" },
              { name: "Tenders", icon: <Bell className="h-4 w-4" />, link: "/opportunities?type=tender", color: "bg-purple-50 text-purple-700" },
              { name: "Auctions", icon: <Bell className="h-4 w-4" />, link: "/opportunities?type=auction", color: "bg-amber-50 text-amber-700" },
              { name: "Announcements", icon: <Bell className="h-4 w-4" />, link: "/opportunities?type=announcement", color: "bg-red-50 text-red-700" },
            ].map((category, index) => (
              <a 
                key={index} 
                href={category.link}
                className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className={`${category.color} p-1 rounded-full`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-800">{category.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured & Recent Opportunities */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0A3D62]">Highlighted Opportunities</h2>
            <a href="/opportunities" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <Tabs defaultValue="featured" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="featured" className="gap-1 text-sm">
                <Star className="h-3 w-3" /> Featured
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-1 text-sm">
                <CalendarDays className="h-3 w-3" /> Recent
              </TabsTrigger>
              <TabsTrigger value="closing" className="gap-1 text-sm">
                <Clock className="h-3 w-3" /> Closing
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-1 text-sm">
                <Flame className="h-3 w-3" /> Popular
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="featured" className="mt-0">
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center">
                  <Star className="text-blue-600 h-4 w-4 mr-2" />
                  <h3 className="text-base font-semibold text-blue-800">Featured Opportunities</h3>
                </div>
                <div className="p-3">
                  <FeaturedJobs 
                    showTitle={false} 
                    showPagination={true} 
                    limit={4}
                    queryKey="/api/jobs/featured"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-green-50 border-b border-green-100 flex items-center">
                  <CalendarDays className="text-green-600 h-4 w-4 mr-2" />
                  <h3 className="text-base font-semibold text-green-800">Recently Posted</h3>
                </div>
                <div className="p-3">
                  <FeaturedJobs 
                    showTitle={false} 
                    showPagination={true} 
                    limit={4}
                    queryKey="/api/jobs"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="closing" className="mt-0">
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-center">
                  <Clock className="text-amber-600 h-4 w-4 mr-2" />
                  <h3 className="text-base font-semibold text-amber-800">Closing Soon</h3>
                </div>
                <div className="p-3">
                  <DeadlineHighlights />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="mt-0">
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="p-3 bg-purple-50 border-b border-purple-100 flex items-center">
                  <Flame className="text-purple-600 h-4 w-4 mr-2" />
                  <h3 className="text-base font-semibold text-purple-800">Popular Opportunities</h3>
                </div>
                <div className="p-3">
                  <FeaturedJobs 
                    showTitle={false} 
                    showPagination={true} 
                    limit={4}
                    queryKey="/api/jobs/featured"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Coming Soon Banner */}
      <section className="bg-white py-3 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 text-sm">New features coming soon!</h3>
              <p className="text-blue-700 text-xs">
                Mobile apps, personalized recommendations, and industry insights will be available in our next update.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content Grid */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Browse by Category */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white py-3">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    <CardTitle className="text-base">Browse by Category</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CategoryFeaturedAds />
                </CardContent>
                <CardFooter className="bg-gray-50 px-4 py-2 border-t flex justify-between">
                  <span className="text-xs text-gray-500">Find opportunities by industry</span>
                  <a href="/categories" className="text-blue-600 text-xs flex items-center hover:text-blue-800">
                    View all categories <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </CardFooter>
              </Card>
              
              {/* Browse by Location */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    <CardTitle>Browse by Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <LocationBrowser />
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-3 border-t">
                  <span className="text-sm text-gray-500">Find opportunities across Rwanda's provinces or work remotely</span>
                </CardFooter>
              </Card>
              
              {/* Personalized Recommendations - Marked as "Coming Soon" */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white relative">
                  <Badge variant="outline" className="absolute top-2 right-2 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                    Coming Soon
                  </Badge>
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    <CardTitle>Recommended For You</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    Personalized opportunities based on your profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PersonalizedRecommendations />
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar column */}
            <div className="space-y-8">
              {/* Quick Links */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white">
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav>
                    {[
                      { href: "/opportunities", text: "Browse All Opportunities", icon: <Briefcase className="h-4 w-4" /> },
                      { href: "/opportunities?type=job", text: "Job Opportunities", icon: <Briefcase className="h-4 w-4" /> },
                      { href: "/opportunities?type=tender", text: "Tenders", icon: <Bell className="h-4 w-4" /> },
                      { href: "/opportunities?type=auction", text: "Auctions/Cyamunara", icon: <Bell className="h-4 w-4" /> },
                      { href: "/opportunities?type=announcement", text: "Announcements", icon: <Bell className="h-4 w-4" /> },
                      { href: "/companies", text: "Partner Organizations", icon: <Briefcase className="h-4 w-4" /> }
                    ].map((link, index) => (
                      <a 
                        key={index}
                        href={link.href} 
                        className="flex items-center justify-between px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-blue-600">
                            {link.icon}
                          </span>
                          {link.text}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
              
              {/* Recent Activity Feed */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white">
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RecentActivityFeed />
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-3 border-t">
                  <span className="text-sm text-gray-500">Latest updates across the platform</span>
                </CardFooter>
              </Card>
              
              {/* Important Deadlines */}
              <Card>
                <CardHeader className="bg-amber-600 text-white">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    <CardTitle>Important Deadlines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b border-amber-100 bg-amber-50">
                    <p className="text-amber-800 text-sm font-medium">Don't miss these closing opportunities</p>
                  </div>
                  <div className="py-4">
                    <DeadlineHighlights />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Explore by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse opportunities across different industries and sectors to find the perfect match for your skills and interests
            </p>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <JobCategories />
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <a href="/categories" className="flex items-center gap-2">
                <span>View all categories</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Employers Section */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0A3D62]">Featured Organizations</h2>
            <a href="/companies" className="text-blue-600 hover:text-blue-800 flex items-center">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <FeaturedEmployers />
          </div>
        </div>
      </section>
      
      {/* Success Stories Section */}
      <SuccessStories />
      
      {/* For Employers Section */}
      <EmployerCTA />
      
      {/* Industry Insights Section (Coming Soon) */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Industry Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Stay informed about Rwanda's job market trends and industry developments
            </p>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Coming Soon in Next Update
            </Badge>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg z-10">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 text-center max-w-md">
                <Bell className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-[#0A3D62] mb-2">Coming Soon</h3>
                <p className="text-gray-600">Our team is working on bringing industry insights to help you make informed career decisions.</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <IndustryInsights />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile App Promo Section (Coming Soon) */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Stay Connected On The Go</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Access opportunities anywhere with our mobile application, designed for the modern job seeker
            </p>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              Coming Soon in Next Update
            </Badge>
          </div>
          
          <MobileAppPromo />
        </div>
      </section>
      
      {/* Final CTA Section */}
      <CTASection />
      
      {/* Smart Screen Optimization Tooltip */}
      <SmartScreenTooltip />
    </>
  );
};

export default Home;
