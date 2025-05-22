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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 font-heading">Browse by Location</h2>
          <p className="text-neutral-600 mt-2 max-w-2xl mx-auto">Find opportunities across Rwanda's provinces or work remotely</p>
        </div>
        
        {isLoading ? (
          <div className="h-[400px] bg-neutral-100 animate-pulse rounded-lg"></div>
        ) : (
          <div className="relative h-[500px] md:h-[600px] bg-neutral-100 rounded-lg overflow-hidden">
            {/* Map background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ 
                backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Rwanda_relief_location_map.svg/800px-Rwanda_relief_location_map.svg.png')",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            ></div>
            
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
            
            {/* Location cards - visible on hover or mobile */}
            <div className="hidden md:grid grid-cols-3 gap-4 absolute bottom-4 left-4 right-4">
              {regions.slice(0, 3).map((region) => (
                <a 
                  key={region.slug}
                  href={`/opportunities?location=${region.slug}`}
                  className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden">
                      <img 
                        src={region.image} 
                        alt={region.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800 group-hover:text-[#0A3D62]">{region.name}</h3>
                      <p className="text-xs text-neutral-600">{getLocationCount(region.slug)} opportunities</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile-friendly region selection */}
        <div className="mt-8 md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {regions.map((region) => (
              <a 
                key={region.slug}
                href={`/opportunities?location=${region.slug}`}
                className="bg-white p-4 rounded-lg border border-neutral-200 hover:border-[#0A3D62] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A3D62]/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#0A3D62]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">{region.name}</h3>
                    <p className="text-xs text-neutral-600">{getLocationCount(region.slug)} listings</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationBrowser;