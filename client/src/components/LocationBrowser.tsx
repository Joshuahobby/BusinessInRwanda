import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Job } from "@shared/schema";

const LocationBrowser = () => {
  // Get all jobs to calculate counts per location
  const { data: allJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Rwanda's main regions
  const regions = [
    {
      name: "Kigali",
      slug: "kigali",
      description: "Rwanda's capital and largest city",
      image: "https://images.unsplash.com/photo-1590400850521-52bed2f35c06?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "45%", left: "45%" }
    },
    {
      name: "Northern Province",
      slug: "northern",
      description: "Including Musanze, Gicumbi, and Burera",
      image: "https://images.unsplash.com/photo-1493551511613-abc8320c265e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "25%", left: "45%" }
    },
    {
      name: "Southern Province",
      slug: "southern",
      description: "Including Huye, Nyamagabe, and Muhanga",
      image: "https://images.unsplash.com/photo-1503435980610-066ca4c4301d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "65%", left: "45%" }
    },
    {
      name: "Eastern Province",
      slug: "eastern",
      description: "Including Nyagatare, Kayonza, and Rwamagana",
      image: "https://images.unsplash.com/photo-1494253188410-ff0cdea5499e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "45%", left: "65%" }
    },
    {
      name: "Western Province",
      slug: "western",
      description: "Including Rubavu, Karongi, and Rusizi",
      image: "https://images.unsplash.com/photo-1504870200725-a8aa2d9d4b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "45%", left: "25%" }
    },
    {
      name: "Remote",
      slug: "remote",
      description: "Work from anywhere opportunities",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      position: { top: "85%", left: "85%" }
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
            {/* Simple Rwanda map representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full max-w-[250px] max-h-[200px]" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Rwanda country outline - more accurate shape */}
                <path 
                  d="M60 70 L80 50 L120 45 L160 50 L200 55 L240 65 L250 80 L245 110 L240 140 L230 160 L210 170 L180 175 L140 170 L100 165 L70 155 L50 140 L45 120 L50 100 L55 85 Z" 
                  fill="#10B981" 
                  fillOpacity="0.3" 
                  stroke="#059669" 
                  strokeWidth="2"
                />
                {/* Lake Kivu indication */}
                <path 
                  d="M50 100 Q45 110 50 120 Q55 115 50 100" 
                  fill="#3B82F6" 
                  fillOpacity="0.6"
                />
                {/* Hills indication */}
                <circle cx="120" cy="100" r="3" fill="#059669" fillOpacity="0.4"/>
                <circle cx="140" cy="90" r="2" fill="#059669" fillOpacity="0.4"/>
                <circle cx="160" cy="110" r="2.5" fill="#059669" fillOpacity="0.4"/>
                <circle cx="180" cy="95" r="2" fill="#059669" fillOpacity="0.4"/>
                
                <text x="150" y="115" textAnchor="middle" className="fill-green-700 text-xs font-bold">
                  RWANDA
                </text>
                <text x="150" y="130" textAnchor="middle" className="fill-green-600 text-xs">
                  Land of 1000 Hills
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