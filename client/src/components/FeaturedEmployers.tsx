import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Company } from "@shared/schema";

const FeaturedEmployers = () => {
  const { data: employers = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies/featured'],
  });

  // Placeholder logos for fallback if no API data
  const fallbackLogos = [
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=64",
    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=64",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=64",
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=64",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=64"
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-heading">Featured Employers</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Connect with top companies hiring across Rwanda</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-32 h-16 bg-neutral-100 animate-pulse rounded"></div>
            ))}
          </div>
        ) : employers.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {employers.map((employer) => (
              <Link key={employer.id} href={`/company/${employer.id}`}>
                <div className="w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                  <img 
                    src={employer.logo || fallbackLogos[0]} 
                    alt={`${employer.name}`} 
                    className="max-h-12" 
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {fallbackLogos.map((logo, index) => (
              <div key={index} className="w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                <img src={logo} alt={`Company ${index + 1}`} className="max-h-12" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEmployers;
