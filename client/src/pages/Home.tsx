import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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
import { Briefcase, MapPin, Tag, Bell, ArrowRight, Clock, Sparkles, FileText, Gavel, Building } from 'lucide-react';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const sectionVariants = {
  offscreen: { opacity: 0, y: 50 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8
    }
  }
};

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
      <motion.section 
        className="py-24 relative overflow-hidden"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4">Featured Opportunities</h2>
              <p className="text-neutral-600 md:text-lg">Discover top opportunities across Rwanda's growing economy</p>
            </motion.div>
          </div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FeaturedJobs />
          </motion.div>
        </div>
      </motion.section>
      
      {/* Main Content Section */}
      <section className="py-16 bg-gray-50 relative">
        {/* Abstract decoration */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
        
        <div className="container mx-auto px-4">
          {/* "Coming Soon" Banner with modern design */}
          <motion.div 
            className="mb-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 flex items-center shadow-sm border border-blue-200/30 overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl"></div>
            <div className="absolute right-10 bottom-0 w-24 h-24 bg-blue-300/20 rounded-full blur-xl"></div>
            
            <div className="bg-blue-500/10 rounded-full p-3 mr-4">
              <Bell className="text-blue-600 h-6 w-6" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="font-semibold text-blue-800 mb-1">New features coming soon!</h3>
              <p className="text-blue-700/80 text-sm">
                Mobile apps, personalized recommendations, and industry insights will be available in our next update.
              </p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content column */}
            <motion.div 
              className="lg:col-span-2 space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Deadline Highlights */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="bg-gradient-to-r from-[#0A3D62] to-[#135d94] px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" /> Closing Soon
                  </h2>
                </div>
                <div className="p-6">
                  <DeadlineHighlights />
                </div>
              </motion.div>
              
              {/* Category Featured Ads */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="bg-gradient-to-r from-[#0A3D62] to-[#135d94] px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Tag className="h-5 w-5 mr-2" /> Browse by Category
                  </h2>
                </div>
                <div className="p-6">
                  <CategoryFeaturedAds />
                </div>
              </motion.div>
              
              {/* Personalized Recommendations - Marked as "Coming Soon" */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 relative hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" /> Coming Soon
                </div>
                <div className="bg-gradient-to-r from-[#0A3D62] to-[#135d94] px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" /> Recommended For You
                  </h2>
                </div>
                <div className="p-6">
                  <PersonalizedRecommendations />
                </div>
              </motion.div>
            </motion.div>
            
            {/* Sidebar column */}
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Quick Links with improved design */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="bg-gradient-to-r from-[#0A3D62] to-[#135d94] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Quick Links</h2>
                </div>
                <div className="p-4">
                  <nav className="divide-y divide-gray-100">
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
                        className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg text-neutral-700 transition-colors group"
                      >
                        <span className="flex items-center">
                          <span className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                            {link.icon}
                          </span>
                          {link.text}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:transform group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </nav>
                </div>
              </motion.div>
              
              {/* Recent Activity Feed */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="bg-gradient-to-r from-[#0A3D62] to-[#135d94] px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <RecentActivityFeed />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Browse by Location Section with improved design */}
      <motion.section 
        className="py-24 relative bg-white"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-6"
            >
              <MapPin className="h-4 w-4 mr-2" /> Location-based Search
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Find Opportunities Near You
            </motion.h2>
            <motion.p 
              className="text-neutral-600 md:text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Discover listings across Rwanda's provinces or work remotely with our easy-to-use location browser
            </motion.p>
          </div>
          
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <LocationBrowser />
          </motion.div>
        </div>
      </motion.section>
      
      {/* Categories Section with improved design */}
      <motion.section 
        className="py-24 relative bg-gray-50"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-6"
            >
              <Tag className="h-4 w-4 mr-2" /> Industry Categories
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Explore by Category
            </motion.h2>
            <motion.p 
              className="text-neutral-600 md:text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Browse opportunities across different industries and sectors to find the perfect match for your skills and interests
            </motion.p>
          </div>
          
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <JobCategories />
          </motion.div>
        </div>
      </motion.section>
      
      {/* Success Stories Section */}
      <SuccessStories />
      
      {/* Industry Insights Section with improved design */}
      <motion.section 
        className="py-24 relative bg-white"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Industry Insights
            </motion.h2>
            <motion.p 
              className="text-neutral-600 md:text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Stay informed about Rwanda's job market trends and industry developments
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Coming Soon in Next Update
            </motion.div>
          </div>
          
          <motion.div 
            className="opacity-90 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-[#0A3D62] mb-2">Coming Soon</h3>
                <p className="text-neutral-600">Our team is working on bringing industry insights to help you make informed career decisions.</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <IndustryInsights />
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Mobile App Promo Section with improved design */}
      <motion.section 
        className="py-24 relative bg-gray-50"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Stay Connected On The Go
            </motion.h2>
            <motion.p 
              className="text-neutral-600 md:text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Access opportunities anywhere with our mobile application, designed for the modern job seeker
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Coming Soon in Next Update
            </motion.div>
          </div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <MobileAppPromo />
          </motion.div>
        </div>
      </motion.section>
      
      {/* For Employers Section with improved design */}
      <motion.div 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <EmployerCTA />
      </motion.div>
      
      {/* Featured Employers Section with improved design */}
      <motion.section 
        className="py-24 relative bg-white"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-6"
            >
              <Building className="h-4 w-4 mr-2" /> Top Organizations
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#0A3D62] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Featured Organizations
            </motion.h2>
            <motion.p 
              className="text-neutral-600 md:text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Connect with Rwanda's leading employers and partners offering the best opportunities
            </motion.p>
          </div>
          
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <FeaturedEmployers />
          </motion.div>
        </div>
      </motion.section>
      
      {/* Final CTA Section with improved design */}
      <motion.div 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <CTASection />
      </motion.div>
    </>
  );
};

export default Home;
