import { useQuery } from "@tanstack/react-query";
import CategoryCard from "./CategoryCard";
import { Category } from "@shared/schema";
import { Briefcase, Gavel, FileText, Megaphone } from "lucide-react";

const JobCategories = () => {
  const { data: categories = [], isLoading } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  // Different advertisement types with their own styling
  const adTypes = [
    {
      name: "Job Opportunities",
      icon: "work",
      iconComponent: <Briefcase className="w-12 h-12 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
      href: "/find-jobs?type=job",
      description: "Browse open positions"
    },
    {
      name: "Cyamunara / Auctions",
      icon: "gavel",
      iconComponent: <Gavel className="w-12 h-12 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-800",
      href: "/find-jobs?type=auction",
      description: "Properties and assets"
    },
    {
      name: "Tenders",
      icon: "description",
      iconComponent: <FileText className="w-12 h-12 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-200",
      textColor: "text-indigo-800",
      href: "/find-jobs?type=tender",
      description: "Procurement opportunities"
    },
    {
      name: "Announcements",
      icon: "campaign",
      iconComponent: <Megaphone className="w-12 h-12 text-amber-600" />,
      color: "bg-amber-50 border-amber-200",
      textColor: "text-amber-800",
      href: "/find-jobs?type=announcement",
      description: "Public announcements"
    }
  ];

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-heading">Browse by Advertisement Type</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Explore various opportunities across Rwanda</p>
        </div>
        
        {/* Advertisement Types Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {adTypes.map((type, index) => (
            <a 
              key={index} 
              href={type.href}
              className={`flex flex-col items-center p-6 rounded-lg shadow-sm border ${type.color} hover:shadow-md transition-shadow duration-300`}
            >
              <div className="mb-4">
                {type.iconComponent}
              </div>
              <h3 className={`text-lg font-semibold mb-1 ${type.textColor}`}>{type.name}</h3>
              <p className="text-sm text-center text-neutral-600">{type.description}</p>
            </a>
          ))}
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-heading">Explore Job Categories</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Discover opportunities across Rwanda's fastest-growing industries</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[150px] bg-white animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                count={category.count}
                href={`/find-jobs?category=${category.name}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Fallback categories if API doesn't return data */}
            <CategoryCard name="Information Technology" icon="computer" count={156} href="/find-jobs?category=it" />
            <CategoryCard name="Finance & Banking" icon="attach_money" count={89} href="/find-jobs?category=finance" />
            <CategoryCard name="Management & Admin" icon="business" count={124} href="/find-jobs?category=management" />
            <CategoryCard name="Healthcare" icon="health_and_safety" count={76} href="/find-jobs?category=healthcare" />
            <CategoryCard name="Education & Training" icon="school" count={93} href="/find-jobs?category=education" />
            <CategoryCard name="Engineering" icon="engineering" count={67} href="/find-jobs?category=engineering" />
            <CategoryCard name="Marketing & Sales" icon="campaign" count={102} href="/find-jobs?category=marketing" />
            <CategoryCard name="Agriculture" icon="agriculture" count={45} href="/find-jobs?category=agriculture" />
          </div>
        )}
      </div>
    </section>
  );
};

export default JobCategories;
