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

import LiveActivityFeed from '@/components/LiveActivityFeed';

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
      <div data-tour="search-section">
        <HeroSection />
      </div>
      



      {/* Key Statistics Section */}
      <section className="bg-[#0A3D62] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Our Impact Across Rwanda</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2 text-blue-300">18+</div>
              <div className="text-blue-200 font-medium">Active Opportunities</div>
              <div className="text-xs text-blue-300 mt-1">Updated Daily</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2 text-blue-300">16+</div>
              <div className="text-blue-200 font-medium">Registered Users</div>
              <div className="text-xs text-blue-300 mt-1">Growing Community</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2 text-blue-300">8+</div>
              <div className="text-blue-200 font-medium">Partner Organizations</div>
              <div className="text-xs text-blue-300 mt-1">Trusted Employers</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2 text-blue-300">5</div>
              <div className="text-blue-200 font-medium">Provinces Covered</div>
              <div className="text-xs text-blue-300 mt-1">Nationwide Reach</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Categories */}
      <section className="bg-white border-b border-gray-200" data-tour="categories-section">
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-lg font-bold text-[#0A3D62] text-center mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "All Opportunities", icon: <Briefcase className="h-5 w-5" />, link: "/opportunities", color: "bg-blue-50 text-blue-700 border-blue-200", count: "18+" },
              { name: "Jobs", icon: <Briefcase className="h-5 w-5" />, link: "/opportunities?type=job", color: "bg-emerald-50 text-emerald-700 border-emerald-200", count: "12+" },
              { name: "Tenders", icon: <Bell className="h-5 w-5" />, link: "/opportunities?type=tender", color: "bg-purple-50 text-purple-700 border-purple-200", count: "4+" },
              { name: "Auctions", icon: <Tag className="h-5 w-5" />, link: "/opportunities?type=auction", color: "bg-amber-50 text-amber-700 border-amber-200", count: "2+" },
              { name: "Announcements", icon: <Bell className="h-5 w-5" />, link: "/opportunities?type=announcement", color: "bg-red-50 text-red-700 border-red-200", count: "3+" },
            ].map((category, index) => (
              <a 
                key={index} 
                href={category.link}
                className={`${category.color} hover:shadow-md block p-4 rounded-lg border transition-all hover:scale-105 text-center group`}
              >
                <div className="flex flex-col items-center gap-2">
                  {category.icon}
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs opacity-75">{category.count}</span>
                </div>
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
            
            <TabsContent value="featured" className="mt-0" data-tour="featured-section">
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
                <CardContent className="p-6">
                  <CategoryFeaturedAds />
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-3 border-t flex justify-between">
                  <span className="text-sm text-gray-500">Find opportunities by industry</span>
                  <a href="/categories" className="text-blue-600 text-sm flex items-center hover:text-blue-800">
                    View all categories <ArrowRight className="ml-1 h-4 w-4" />
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
              
              {/* Quick Apply Section */}
              <Card>
                <CardHeader className="bg-[#0A3D62] text-white">
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    <CardTitle>Quick Actions</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    Fast access to common tasks and applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <a 
                      href="/opportunities?type=job" 
                      className="block w-full bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">Browse Latest Jobs</h4>
                          <p className="text-sm text-green-600">Find your next career opportunity</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-green-600" />
                      </div>
                    </a>
                    
                    <a 
                      href="/opportunities?type=tender" 
                      className="block w-full bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-800">View Active Tenders</h4>
                          <p className="text-sm text-blue-600">Government and private tenders</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                      </div>
                    </a>
                    
                    <a 
                      href="/register" 
                      className="block w-full bg-purple-50 hover:bg-purple-100 p-4 rounded-lg border border-purple-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-purple-800">Create Account</h4>
                          <p className="text-sm text-purple-600">Get personalized notifications</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-600" />
                      </div>
                    </a>
                  </div>
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
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from professionals who found their opportunities through Business In Rwanda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">JM</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-[#0A3D62]">Jean Marie</h4>
                  <p className="text-sm text-gray-600">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"Found my dream job in tech through this platform. The application process was smooth and professional."</p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">AM</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-[#0A3D62]">Alice Mukamana</h4>
                  <p className="text-sm text-gray-600">Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"Won several government tenders that helped grow my construction business significantly."</p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">DK</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-[#0A3D62]">David Kayigi</h4>
                  <p className="text-sm text-gray-600">Healthcare Worker</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"The healthcare opportunities section helped me find a position that matches my qualifications perfectly."</p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* For Employers Section */}
      <EmployerCTA />
      
      {/* Rwanda Business Insights Section */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Rwanda Business Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key trends and opportunities in Rwanda's growing economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0A3D62] ml-3">IT & Technology</h3>
              </div>
              <p className="text-gray-600 mb-4">Growing demand for digital skills and technology professionals across Rwanda.</p>
              <div className="text-sm text-green-600 font-medium">🔥 High Demand Sector</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0A3D62] ml-3">Government Tenders</h3>
              </div>
              <p className="text-gray-600 mb-4">Regular procurement opportunities across various government institutions.</p>
              <div className="text-sm text-blue-600 font-medium">📈 Consistent Opportunities</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0A3D62] ml-3">Healthcare</h3>
              </div>
              <p className="text-gray-600 mb-4">Medical professionals and healthcare services remain in high demand.</p>
              <div className="text-sm text-purple-600 font-medium">⚕️ Essential Services</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Business In Rwanda Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#0A3D62] mb-4">Why Choose Business In Rwanda?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your trusted platform for opportunities across Rwanda's dynamic economy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0A3D62] mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">Get instant notifications about new opportunities matching your interests.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0A3D62] mb-2">Nationwide Coverage</h3>
              <p className="text-gray-600">Opportunities from all provinces of Rwanda, plus remote work options.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0A3D62] mb-2">Verified Opportunities</h3>
              <p className="text-gray-600">All listings are verified to ensure authenticity and reliability.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0A3D62] mb-2">Multiple Categories</h3>
              <p className="text-gray-600">Jobs, tenders, auctions, and announcements all in one platform.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ready to Get Started Section */}
      <section className="bg-gradient-to-r from-[#0A3D62] to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Find Your Next Opportunity?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals and businesses who trust Business In Rwanda for their career and business growth.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button size="lg" variant="secondary" asChild className="bg-white text-[#0A3D62] hover:bg-gray-100">
              <a href="/register" className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Start Your Journey
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-[#0A3D62]">
              <a href="/opportunities" className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Explore Opportunities
              </a>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="text-white">
              <h4 className="font-bold mb-2">For Job Seekers</h4>
              <p className="text-blue-200 text-sm">Find your perfect role with personalized recommendations</p>
            </div>
            <div className="text-white">
              <h4 className="font-bold mb-2">For Employers</h4>
              <p className="text-blue-200 text-sm">Connect with qualified candidates across Rwanda</p>
            </div>
            <div className="text-white">
              <h4 className="font-bold mb-2">For Businesses</h4>
              <p className="text-blue-200 text-sm">Access tenders and auctions to grow your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <CTASection />
      
      {/* Live Activity Feed */}
      <LiveActivityFeed />
      

    </>
  );
};

export default Home;
