import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Briefcase, FileText, Gavel, Bell, TrendingUp, Users, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobSearchParams } from "@/lib/types";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    keyword: "",
    location: ""
  });
  const [searchType, setSearchType] = useState<string>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    if (searchParams.keyword) queryParams.append("keyword", searchParams.keyword);
    if (searchParams.location) queryParams.append("location", searchParams.location);
    
    if (searchType !== "all") {
      queryParams.append("type", searchType);
    }
    
    navigate(`/listings?${queryParams.toString()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleLocationChange = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      location: value === 'all' ? '' : value
    }));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        {/* Large circles */}
        <motion.div 
          {...floatingAnimation}
          className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl"
        />
        <motion.div 
          {...floatingAnimation}
          transition={{ delay: 2 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-300/30 rounded-full blur-3xl"
        />
        <motion.div 
          {...floatingAnimation}
          transition={{ delay: 4 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Hero Content */}
          <div className="text-center mb-16">
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Rwanda's #1 Opportunity Platform
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-tight"
            >
              Discover Your Next
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Big Opportunity
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with thousands of jobs, tenders, auctions, and announcements across Rwanda. 
              Your career journey starts here.
            </motion.p>
          </div>

          {/* Enhanced Search Section */}
          <motion.div 
            variants={fadeInUp}
            className="max-w-4xl mx-auto mb-16"
          >
            {/* Search Type Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
                {[
                  { id: "all", label: "All Types", icon: Search },
                  { id: "job", label: "Jobs", icon: Briefcase },
                  { id: "tender", label: "Tenders", icon: FileText },
                  { id: "auction", label: "Auctions", icon: Gavel }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSearchType(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        searchType === tab.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="grid md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What are you looking for?
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      id="keyword"
                      placeholder={
                        searchType === "job" ? "Job title, skills, or company" : 
                        searchType === "tender" ? "Tender category or description" : 
                        searchType === "auction" ? "Property, vehicle, or item" : 
                        "Search for anything..."
                      }
                      className="pl-12 h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      value={searchParams.keyword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <Select onValueChange={handleLocationChange} value={searchParams.location || 'all'}>
                      <SelectTrigger className="pl-12 h-14 text-lg border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl">
                        <SelectValue placeholder="Anywhere in Rwanda" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="all">Anywhere in Rwanda</SelectItem>
                        <SelectItem value="kigali">Kigali City</SelectItem>
                        <SelectItem value="northern">Northern Province</SelectItem>
                        <SelectItem value="southern">Southern Province</SelectItem>
                        <SelectItem value="eastern">Eastern Province</SelectItem>
                        <SelectItem value="western">Western Province</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Search Now
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Stats Section - Small and Inline */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-6 text-center"
          >
            {[
              { icon: TrendingUp, value: "1,500+", label: "Opportunities" },
              { icon: Users, value: "5,000+", label: "Users" },
              { icon: Briefcase, value: "300+", label: "Organizations" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50"
                >
                  <Icon className="h-5 w-5 text-blue-600" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;