import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployerCTA = () => {
  return (
    <section className="py-12 bg-[#0A3D62] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-heading">Are You an Employer?</h2>
            <p className="text-lg mb-6 opacity-90">Find the perfect candidate for your business needs. Post jobs and connect with Rwanda's finest talent.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/post-job">
                <Button className="bg-white text-[#0A3D62] hover:bg-neutral-100">
                  Post a Job
                </Button>
              </Link>
              <Link href="/employers">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#0A3D62]">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-5/12">
            <Card className="bg-white rounded-lg shadow-lg text-neutral-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0A3D62]">Why Choose Business In Rwanda?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#00A86B] mr-2 mt-0.5" />
                    <span>Reach thousands of qualified candidates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#00A86B] mr-2 mt-0.5" />
                    <span>AI-powered candidate matching</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#00A86B] mr-2 mt-0.5" />
                    <span>Branded company profile</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#00A86B] mr-2 mt-0.5" />
                    <span>Full applicant tracking system</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[#00A86B] mr-2 mt-0.5" />
                    <span>Dedicated support team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployerCTA;
