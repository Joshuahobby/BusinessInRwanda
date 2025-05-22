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
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          {...floatingAnimation}
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-2xl"
        />
        <motion.div 
          {...floatingAnimation}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-2xl"
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Compact Hero Content */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Star className="h-3 w-3" />
              Rwanda's #1 Opportunity Platform
            </span>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-tight">
              Discover Your Next
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Big Opportunity
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Find jobs, tenders, auctions, and announcements across Rwanda
            </p>
          </motion.div>

          {/* Compact Search Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            {/* Search Type Tabs */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-white rounded-xl p-1 shadow-md border border-gray-100">
                {[
                  { id: "all", label: "All", icon: Search },
                  { id: "job", label: "Jobs", icon: Briefcase },
                  { id: "tender", label: "Tenders", icon: FileText },
                  { id: "auction", label: "Auctions", icon: Gavel }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSearchType(tab.id)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        searchType === tab.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <div className="grid md:grid-cols-10 gap-4 items-end">
                <div className="md:col-span-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="keyword"
                      placeholder={
                        searchType === "job" ? "Job title or skills" : 
                        searchType === "tender" ? "Tender category" : 
                        searchType === "auction" ? "Property or item" : 
                        "Search anything..."
                      }
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                      value={searchParams.keyword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={handleLocationChange} value={searchParams.location || 'all'}>
                      <SelectTrigger className="pl-10 h-12 border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="all">All Rwanda</SelectItem>
                        <SelectItem value="kigali">Kigali</SelectItem>
                        <SelectItem value="northern">Northern</SelectItem>
                        <SelectItem value="southern">Southern</SelectItem>
                        <SelectItem value="eastern">Eastern</SelectItem>
                        <SelectItem value="western">Western</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <Button 
                    type="submit" 
                    className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Inline Stats */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: TrendingUp, value: "1,500+", label: "Opportunities" },
              { icon: Users, value: "5,000+", label: "Users" },
              { icon: Briefcase, value: "300+", label: "Organizations" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50"
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;