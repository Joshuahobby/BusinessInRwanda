import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 bg-[#BD2031] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">Ready to Take the Next Step in Your Career?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of job seekers and employers on Rwanda's premier job platform
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/find-jobs">
            <Button className="bg-white text-[#BD2031] hover:bg-neutral-100 font-medium py-3 px-8">
              Find Jobs
            </Button>
          </Link>
          <Link href="/post-job">
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-[#BD2031] font-medium py-3 px-8">
              Post a Job
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
