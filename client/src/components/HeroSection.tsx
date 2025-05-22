import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JobSearchParams } from "@/lib/types";

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

  return (
    <section className="relative bg-[#0A3D62] text-white">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        style={{ 
          backgroundImage: `url('https://pixabay.com/get/gf4d729d1eefce0587362410854ccd1ae81e1cdd601a62dd8463c1c753f71c3e3e88705300dfc5886d438f26be2bda6d92830621afd29d56a50938b06c001a709_1280.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          mixBlendMode: 'overlay'
        }}
      ></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Your Gateway to Opportunities in Rwanda</h1>
          <p className="text-xl mb-8 opacity-90">Find jobs, tenders, auctions, and announcements in Rwanda's growing economy</p>
          
          {/* Search Form */}
          <div className="bg-white p-4 rounded-lg shadow-lg mb-8">
            <div className="grid grid-cols-4 gap-1 mb-4 p-1 bg-gray-100 rounded">
              <button 
                type="button"
                onClick={() => setSearchType("all")}
                className={`text-center py-2 px-1 text-sm rounded transition-colors ${
                  searchType === "all" ? "bg-white shadow-sm font-medium" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Types
              </button>
              <button 
                type="button"
                onClick={() => setSearchType("job")}
                className={`text-center py-2 px-1 text-sm rounded transition-colors ${
                  searchType === "job" ? "bg-white shadow-sm font-medium" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Jobs
              </button>
              <button 
                type="button"
                onClick={() => setSearchType("tender")}
                className={`text-center py-2 px-1 text-sm rounded transition-colors ${
                  searchType === "tender" ? "bg-white shadow-sm font-medium" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tenders
              </button>
              <button 
                type="button"
                onClick={() => setSearchType("auction")}
                className={`text-center py-2 px-1 text-sm rounded transition-colors ${
                  searchType === "auction" ? "bg-white shadow-sm font-medium" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Auctions
              </button>
            </div>
            
            <form className="flex flex-col md:flex-row md:items-center gap-3" onSubmit={handleSearch}>
              <div className="flex-1">
                <Label htmlFor="keyword" className="text-neutral-700 text-sm font-medium mb-1 block">What</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input 
                    id="keyword" 
                    placeholder={searchType === "job" ? "Job title or skill" : 
                                searchType === "tender" ? "Tender title or category" : 
                                searchType === "auction" ? "Property or item" : 
                                "Keywords (title, description)"}
                    className="pl-9"
                    value={searchParams.keyword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="location" className="text-neutral-700 text-sm font-medium mb-1 block">Where</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                  <Select onValueChange={handleLocationChange} value={searchParams.location || 'all'}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
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
              <div className="md:pt-6">
                <Button type="submit" className="w-full md:w-auto bg-[#BD2031] hover:bg-[#A31B2A] text-white">
                  Search
                </Button>
              </div>
            </form>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-start gap-8 text-white">
            <div className="flex items-center">
              <span className="material-icons mr-2">post_add</span>
              <span><strong>1,500+</strong> Ads Available</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons mr-2">business</span>
              <span><strong>300+</strong> Partner Organizations</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons mr-2">people</span>
              <span><strong>5,000+</strong> Active Users</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
