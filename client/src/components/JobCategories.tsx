import { useQuery } from "@tanstack/react-query";
import CategoryCard from "./CategoryCard";
import { Category } from "@shared/schema";

const JobCategories = () => {
  const { data: categories = [], isLoading } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
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
