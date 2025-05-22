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
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-green-700 mb-2">🇷🇼 Browse by Location</h3>
            <p className="text-sm text-green-600">Find opportunities across Rwanda's provinces</p>
          </div>
          
          {/* Location grid - clean and functional */}
          <div className="grid grid-cols-2 gap-4">
            {regions.map((region) => (
              <a 
                key={region.slug}
                href={`/opportunities?location=${region.slug}`}
                className="bg-white p-4 rounded-lg border border-green-200 hover:border-[#0A3D62] hover:bg-blue-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A3D62]/10 flex items-center justify-center group-hover:bg-[#0A3D62] transition-colors">
                    <MapPin className="h-5 w-5 text-[#0A3D62] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 group-hover:text-[#0A3D62] transition-colors">
                      {region.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getLocationCount(region.slug)} opportunities
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#BD2031] text-white text-sm font-bold flex items-center justify-center">
                    {getLocationCount(region.slug)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        )
      }
    </div>
  );
};

export default LocationBrowser;