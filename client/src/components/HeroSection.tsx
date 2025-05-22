import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Briefcase, FileText, Gavel, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JobSearchParams } from "@/lib/types";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    keyword: "",
    location: ""
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create query string for search
    const queryParams = new URLSearchParams();
    if (searchParams.keyword) queryParams.append("keyword", searchParams.keyword);
    if (searchParams.location) queryParams.append("location", searchParams.location);
    
    // Add the post type to the search query
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

  const [searchType, setSearchType] = useState<string>("all");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0A3D62] to-[#0d2f45] text-white overflow-hidden">
      {/* Background with improved overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" 
        style={{ 
          backgroundImage: `url('https://pixabay.com/get/gf4d729d1eefce0587362410854ccd1ae81e1cdd601a62dd8463c1c753f71c3e3e88705300dfc5886d438f26be2bda6d92830621afd29d56a50938b06c001a709_1280.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: 'contrast(1.1) brightness(0.7)'
        }}
      />
      
      {/* Abstract shapes for modern look */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -right-40 top-10 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute -left-20 top-40 w-72 h-72 rounded-full bg-red-400 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-0 w-80 h-80 rounded-full bg-yellow-300 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            variants={fadeIn} 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight"
          >
            Your Gateway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Opportunities</span> in Rwanda
          </motion.h1>
          
          <motion.p 
            variants={fadeIn}
            className="text-xl md:text-2xl mb-10 text-blue-100 font-light"
          >
            Find jobs, tenders, auctions, and announcements in Rwanda's growing economy
          </motion.p>
          
          {/* Search Form with improved design */}
          <motion.div 
            variants={fadeIn}
            className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/10 mb-10"
          >
            <div className="flex justify-center overflow-hidden rounded-xl bg-white/10 mb-6 p-1">
              <div className="flex w-full max-w-xl">
                <button 
                  type="button"
                  onClick={() => setSearchType("all")}
                  className={`flex-1 flex justify-center items-center py-3 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchType === "all" 
                      ? "bg-white text-[#0A3D62] shadow-lg" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  All Types
                </button>
                <button 
                  type="button"
                  onClick={() => setSearchType("job")}
                  className={`flex-1 flex justify-center items-center gap-1 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchType === "job" 
                      ? "bg-white text-[#0A3D62] shadow-lg" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Briefcase className="h-4 w-4" /> Jobs
                </button>
                <button 
                  type="button"
                  onClick={() => setSearchType("tender")}
                  className={`flex-1 flex justify-center items-center gap-1 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchType === "tender" 
                      ? "bg-white text-[#0A3D62] shadow-lg" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <FileText className="h-4 w-4" /> Tenders
                </button>
                <button 
                  type="button"
                  onClick={() => setSearchType("auction")}
                  className={`flex-1 flex justify-center items-center gap-1 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    searchType === "auction" 
                      ? "bg-white text-[#0A3D62] shadow-lg" 
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Gavel className="h-4 w-4" /> Auctions
                </button>
              </div>
            </div>
            
            <form className="flex flex-col md:flex-row md:items-end gap-4" onSubmit={handleSearch}>
              <div className="flex-1">
                <Label htmlFor="keyword" className="text-white text-sm font-medium mb-2 block">What are you looking for?</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input 
                    id="keyword" 
                    placeholder={searchType === "job" ? "Job title or skill" : 
                                searchType === "tender" ? "Tender title or category" : 
                                searchType === "auction" ? "Property or item" : 
                                "Keywords (title, description)"}
                    className="pl-10 py-6 bg-white/10 text-white border-white/20 placeholder:text-white/50 focus:border-white focus:ring-2 focus:ring-white/30"
                    value={searchParams.keyword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="location" className="text-white text-sm font-medium mb-2 block">Where?</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 z-10" />
                  <Select onValueChange={handleLocationChange} value={searchParams.location || 'all'}>
                    <SelectTrigger className="pl-10 py-6 h-auto bg-white/10 text-white border-white/20 focus:ring-2 focus:ring-white/30 focus:border-white">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A3D62] border-white/20 text-white">
                      <SelectItem value="all">All locations</SelectItem>
                      <SelectItem value="kigali">Kigali</SelectItem>
                      <SelectItem value="northern">Northern Province</SelectItem>
                      <SelectItem value="southern">Southern Province</SelectItem>
                      <SelectItem value="eastern">Eastern Province</SelectItem>
                      <SelectItem value="western">Western Province</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full md:w-auto py-6 px-8 bg-gradient-to-r from-[#BD2031] to-[#A31B2A] hover:from-[#A31B2A] hover:to-[#8F1725] text-white border-0 shadow-lg font-medium text-base">
                  Search Now
                </Button>
              </div>
            </form>
          </motion.div>
          
          {/* Quick Stats with improved styling */}
          <motion.div 
            variants={fadeIn}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6"
          >
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-transform">
              <div className="bg-white/10 rounded-full p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-2xl font-bold">1,500+</span>
                <span className="text-sm text-blue-100">Ads Available</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-transform">
              <div className="bg-white/10 rounded-full p-3">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-2xl font-bold">300+</span>
                <span className="text-sm text-blue-100">Organizations</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 transform hover:scale-105 transition-transform">
              <div className="bg-white/10 rounded-full p-3">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block text-2xl font-bold">5,000+</span>
                <span className="text-sm text-blue-100">Active Users</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
