import { useQuery } from "@tanstack/react-query";
import { Star, StarHalf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  photo: string;
  rating: number;
  content: string;
}

const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  // Fallback testimonials data if API doesn't return data
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Jean Mutoni",
      position: "Software Developer",
      company: "MTN Rwanda",
      photo: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128",
      rating: 5,
      content: "Business In Rwanda helped me find my dream job! The platform was easy to use, and within two weeks of creating my profile, I received an interview request from MTN. Now I'm working on exciting projects with a great team."
    },
    {
      id: 2,
      name: "Marie Uwase",
      position: "HR Manager",
      company: "Bank of Kigali",
      photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128",
      rating: 5,
      content: "As an employer, I've found the quality of candidates on Business In Rwanda to be exceptional. The platform's filtering tools help us identify the most qualified applicants quickly, saving us time and resources in the hiring process."
    },
    {
      id: 3,
      name: "Eric Mugabo",
      position: "Marketing Specialist",
      company: "Equity Bank",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&h=128",
      rating: 4.5,
      content: "The skill assessment feature helped me identify areas where I needed improvement. After completing the recommended courses, I was able to secure a position that matched my career goals. The platform truly adds value beyond just job listings."
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 font-heading">Success Stories</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Hear from job seekers and employers who found success through our platform</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[280px] bg-white animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      className="w-12 h-12 rounded-full object-cover" 
                      src={testimonial.photo} 
                      alt={testimonial.name} 
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-neutral-800">{testimonial.name}</h4>
                      <p className="text-sm text-neutral-600">{testimonial.position} at {testimonial.company}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex text-yellow-400">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-neutral-700">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
