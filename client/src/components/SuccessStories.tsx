import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Success stories data structure
interface SuccessStory {
  id: number;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  content: string;
  type: "employer" | "jobseeker";
  rating: number;
}

const SuccessStories = () => {
  // Sample success stories (in a real app, this would come from an API)
  const successStories: SuccessStory[] = [
    {
      id: 1,
      name: "Jean-Pierre Niyonzima",
      role: "IT Manager",
      company: "RwandAir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      content: "As an employer, I was impressed with the quality of candidates we received through the platform. We filled our senior developer position in just two weeks with the perfect candidate.",
      type: "employer",
      rating: 5
    },
    {
      id: 2,
      name: "Marie Uwase",
      role: "Software Engineer",
      company: "Andela Rwanda",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      content: "I found my dream job through this platform after searching for months. The application process was smooth, and I appreciated the transparency about the role and company.",
      type: "jobseeker",
      rating: 5
    },
    {
      id: 3,
      name: "Emmanuel Hakizimana",
      role: "Procurement Officer",
      company: "Ministry of Infrastructure",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      content: "The tender posting process was straightforward, and we received high-quality bids within days. The platform has streamlined our procurement process significantly.",
      type: "employer",
      rating: 4
    },
    {
      id: 4,
      name: "Diane Mukasine",
      role: "Property Owner",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80",
      content: "I listed my property for auction and was pleased with the response. The platform attracted serious bidders and the process was well-organized and transparent.",
      type: "employer",
      rating: 5
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Navigate to previous story
  const prevStory = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? successStories.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Navigate to next story
  const nextStory = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === successStories.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="py-16 bg-[#0A3D62] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 font-heading">Success Stories</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Hear from employers and job seekers who have found success through our platform
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          {/* Navigation buttons */}
          <button 
            onClick={prevStory}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors -translate-x-5"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextStory}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors translate-x-5"
            aria-label="Next story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Success story cards */}
          <div className="overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm p-6 md:p-10">
            <div 
              className={cn(
                "transition-opacity duration-300",
                isAnimating ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/20">
                    <img 
                      src={successStories[activeIndex].avatar} 
                      alt={successStories[activeIndex].name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{successStories[activeIndex].name}</h3>
                      <p className="text-white/70">
                        {successStories[activeIndex].role}
                        {successStories[activeIndex].company && ` at ${successStories[activeIndex].company}`}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <Quote className="w-10 h-10 text-white/30" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-white/90 text-lg italic leading-relaxed">
                      "{successStories[activeIndex].content}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={cn(
                          "w-5 h-5",
                          i < successStories[activeIndex].rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-white/30"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-white/70 text-sm">
                      {successStories[activeIndex].type === "employer" ? "Employer" : "Job Seeker"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setActiveIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex 
                    ? "bg-white w-6" 
                    : "bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;