import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  href: string;
}

const CategoryCard = ({ name, icon, count, href }: CategoryCardProps) => {
  return (
    <Link href={href}>
      <Card className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 border border-neutral-200 cursor-pointer">
        <span className="material-icons text-3xl text-[#0A3D62] mb-3">{icon}</span>
        <h3 className="font-medium text-neutral-800 text-center">{name}</h3>
        <p className="text-sm text-neutral-500 mt-2 text-center">{count} jobs</p>
      </Card>
    </Link>
  );
};

export default CategoryCard;
