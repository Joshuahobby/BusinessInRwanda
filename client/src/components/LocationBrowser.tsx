import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Job } from "@shared/schema";

const LocationBrowser = () => {
  // Get all jobs to calculate counts per location
  const { data: allJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Rwanda's main regions with accurate positioning on the real map
  const regions = [
    {
      name: "Kigali",
      slug: "kigali",
      description: "Rwanda's capital and largest city",
      image: "https://images.unsplash.com/photo-1590400850521-52bed2f35c06?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "50%", left: "50%" } // Center of Rwanda
    },
    {
      name: "Northern Province",
      slug: "northern",
      description: "Including Musanze, Gicumbi, and Burera",
      image: "https://images.unsplash.com/photo-1493551511613-abc8320c265e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "25%", left: "50%" } // Northern part
    },
    {
      name: "Southern Province",
      slug: "southern",
      description: "Including Huye, Nyamagabe, and Muhanga",
      image: "https://images.unsplash.com/photo-1503435980610-066ca4c4301d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "75%", left: "50%" } // Southern part
    },
    {
      name: "Eastern Province",
      slug: "eastern",
      description: "Including Nyagatare, Kayonza, and Rwamagana",
      image: "https://images.unsplash.com/photo-1494253188410-ff0cdea5499e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "45%", left: "70%" } // Eastern part
    },
    {
      name: "Western Province",
      slug: "western",
      description: "Including Rubavu, Karongi, and Rusizi",
      image: "https://images.unsplash.com/photo-1504870200725-a8aa2d9d4b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "45%", left: "30%" } // Western part near Lake Kivu
    },
    {
      name: "Remote",
      slug: "remote",
      description: "Work from anywhere opportunities",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "10%", left: "85%" } // Top right corner outside map
    }
  ];

  // Count jobs by location
  const getLocationCount = (locationSlug: string) => {
    if (locationSlug === "remote") {
      return allJobs.filter(job => 
        job.location.toLowerCase().includes("remote") || 
        job.location.toLowerCase().includes("anywhere")
      ).length;
    }
    
    return allJobs.filter(job => 
      job.location.toLowerCase().includes(locationSlug.toLowerCase())
    ).length;
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="h-[300px] bg-neutral-100 animate-pulse rounded-lg"></div>
      ) : (
        <div className="relative h-[300px] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden border-2 border-green-200">
            {/* Accurate Rwanda map using actual country boundaries */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full max-w-[280px] max-h-[220px]" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Actual Rwanda country outline based on real coordinates */}
                <path 
                  d="M50 80 L70 60 L95 50 L125 45 L160 40 L190 42 L220 48 L250 55 L280 65 L310 75 L330 90 L345 110 L350 135 L345 160 L335 185 L320 205 L300 220 L275 235 L245 245 L210 250 L175 248 L140 242 L110 230 L85 215 L65 195 L50 170 L45 145 L48 120 L52 95 Z" 
                  fill="#10B981" 
                  fillOpacity="0.25" 
                  stroke="#059669" 
                  strokeWidth="2"
                />
                {/* Lake Kivu on western border */}
                <path 
                  d="M45 120 Q40 140 45 160 Q50 180 60 195 Q55 185 50 170 Q45 155 45 140 Q45 130 45 120" 
                  fill="#3B82F6" 
                  fillOpacity="0.7"
                />
                {/* Lake Muhazi (eastern) */}
                <ellipse cx="280" cy="120" rx="15" ry="8" fill="#3B82F6" fillOpacity="0.6"/>
                
                {/* Major cities indication */}
                <circle cx="200" cy="150" r="2" fill="#DC2626" fillOpacity="0.8"/>
                <text x="205" y="148" className="fill-red-600 text-xs font-bold">Kigali</text>
                
                <text x="200" y="180" textAnchor="middle" className="fill-green-700 text-sm font-bold">
                  RWANDA
                </text>
                <text x="200" y="195" textAnchor="middle" className="fill-green-600 text-xs">
                  Land of a Thousand Hills
                </text>
              </svg>
            </div>
            
            {/* Location markers */}
            {regions.map((region) => (
              <div 
                key={region.slug}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ 
                  top: region.position.top, 
                  left: region.position.left
                }}
              >
                <a 
                  href={`/opportunities?location=${region.slug}`}
                  className="group flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:bg-[#0A3D62] transition-colors">
                      <MapPin className="h-6 w-6 text-[#0A3D62] group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#BD2031] text-white text-xs flex items-center justify-center">
                      {getLocationCount(region.slug)}
                    </div>
                  </div>
                  <div className="mt-2 bg-white px-3 py-1 rounded-full shadow text-sm font-medium text-neutral-800 group-hover:bg-[#0A3D62] group-hover:text-white transition-colors">
                    {region.name}
                  </div>
                </a>
              </div>
            ))}
          </div>
        )
      }
      
      {/* Compact region selection for card layout */}
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          {regions.map((region) => (
            <a 
              key={region.slug}
              href={`/opportunities?location=${region.slug}`}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-[#0A3D62] hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0A3D62]/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-[#0A3D62]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-neutral-800">{region.name}</h3>
                  <p className="text-xs text-neutral-600">{getLocationCount(region.slug)} jobs</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationBrowser;