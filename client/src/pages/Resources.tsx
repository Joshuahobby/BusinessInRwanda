import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Video, Calendar, ChevronRight, Download, ExternalLink } from 'lucide-react';

const Resources = () => {
  return (
    <>
      <Helmet>
        <title>Career Resources | Business In Rwanda</title>
        <meta 
          name="description" 
          content="Access career guides, resume templates, job interview tips and professional development resources to advance your career in Rwanda."
        />
        <meta property="og:title" content="Career Resources | Business In Rwanda" />
        <meta 
          property="og:description" 
          content="Access career guides, resume templates, job interview tips and professional development resources to advance your career in Rwanda."
        />
      </Helmet>
      
      <div className="bg-[#0A3D62] py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Career Resources</h1>
          <p className="text-lg mb-6 max-w-2xl">
            Explore our collection of resources designed to help you develop your career, improve your job search, and succeed in interviews.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="guides" className="mb-12">
          <TabsList className="mb-8">
            <TabsTrigger value="guides">Career Guides</TabsTrigger>
            <TabsTrigger value="templates">Resume Templates</TabsTrigger>
            <TabsTrigger value="interviews">Interview Prep</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guides" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Finding Jobs in Rwanda's Tech Industry"
                description="A comprehensive guide to job hunting in Rwanda's growing technology sector, including tips for networking and skill development."
                link="#"
              />
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Career Transition Guide"
                description="Step-by-step advice for professionals looking to change careers or industries in Rwanda's evolving job market."
                link="#"
              />
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Salary Negotiation Strategies"
                description="Learn effective techniques to negotiate better compensation packages with Rwanda-specific advice and examples."
                link="#"
              />
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Workplace Skills for the Digital Economy"
                description="Essential skills required to thrive in Rwanda's growing digital economy and practical ways to develop them."
                link="#"
              />
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Women in Leadership"
                description="Resources and strategies for women advancing into leadership positions in Rwanda's business environment."
                link="#"
              />
              <ResourceCard 
                icon={<BookOpen className="h-8 w-8 text-[#0A3D62]" />}
                title="Entrepreneurship Basics"
                description="Guide to starting and growing a business in Rwanda, including regulatory requirements and funding options."
                link="#"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="Professional Resume Template"
                description="Clean, modern resume template designed for business professionals in Rwanda's corporate environment."
                link="#"
                buttonText="Download Template"
                buttonIcon={<Download className="h-4 w-4" />}
              />
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="Technical Resume Template"
                description="Resume template focused on showcasing technical skills and projects for IT and engineering professionals."
                link="#"
                buttonText="Download Template"
                buttonIcon={<Download className="h-4 w-4" />}
              />
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="Creative Resume Template"
                description="Eye-catching resume design for creative professionals in marketing, design, and media roles."
                link="#"
                buttonText="Download Template"
                buttonIcon={<Download className="h-4 w-4" />}
              />
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="Cover Letter Templates"
                description="Customizable cover letter templates with examples tailored for different industries in Rwanda."
                link="#"
                buttonText="Download Templates"
                buttonIcon={<Download className="h-4 w-4" />}
              />
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="CV Writing Guide"
                description="Comprehensive guide to writing an effective CV specifically for Rwanda's job market, with before/after examples."
                link="#"
                buttonIcon={<ChevronRight className="h-4 w-4" />}
              />
              <ResourceCard 
                icon={<FileText className="h-8 w-8 text-[#0A3D62]" />}
                title="LinkedIn Profile Optimization Guide"
                description="Step-by-step instructions to create a standout LinkedIn profile that attracts recruiters in Rwanda."
                link="#"
                buttonIcon={<ChevronRight className="h-4 w-4" />}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="interviews" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Common Interview Questions"
                description="Practice responding to frequently asked questions in job interviews with sample answers tailored for Rwanda's context."
                link="#"
              />
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Technical Interview Preparation"
                description="Guide to preparing for technical assessments and coding interviews for IT roles in Rwanda."
                link="#"
              />
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Behavioral Interview Techniques"
                description="Learn the STAR method and prepare compelling stories that demonstrate your skills and experience."
                link="#"
              />
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Virtual Interview Success"
                description="Tips for making a great impression in online interviews, including technology setup and virtual etiquette."
                link="#"
              />
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Interview Attire Guide"
                description="Advice on appropriate professional dress for different types of interviews in Rwanda's business culture."
                link="#"
              />
              <ResourceCard 
                icon={<Video className="h-8 w-8 text-[#0A3D62]" />}
                title="Salary Discussions"
                description="Strategies for handling salary questions during interviews and techniques for negotiation in Rwanda."
                link="#"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Tech Career Fair - Kigali"
                description="June 15, 2025 | Connect with top technology companies hiring in Rwanda at this in-person career fair in Kigali."
                link="#"
                buttonText="Register Now"
              />
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Virtual Networking Event"
                description="July 3, 2025 | Online networking opportunity with HR managers and recruiters from Rwanda's leading companies."
                link="#"
                buttonText="Register Now"
              />
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Resume Review Workshop"
                description="June 22, 2025 | Get personalized feedback on your resume from professional career coaches in this interactive workshop."
                link="#"
                buttonText="Register Now"
              />
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Financial Services Career Panel"
                description="July 10, 2025 | Learn about career paths in Rwanda's banking and financial services sector from industry leaders."
                link="#"
                buttonText="Register Now"
              />
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Job Search Strategy Webinar"
                description="June 30, 2025 | Online webinar covering effective job search strategies for Rwanda's competitive job market."
                link="#"
                buttonText="Register Now"
              />
              <ResourceCard 
                icon={<Calendar className="h-8 w-8 text-[#0A3D62]" />}
                title="Career Development Conference"
                description="August 5-6, 2025 | Two-day conference in Kigali featuring workshops, networking, and career development sessions."
                link="#"
                buttonText="Register Now"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-neutral-100 p-8 rounded-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Need Personalized Career Guidance?</h2>
            <p className="text-neutral-700 mb-6">
              Business In Rwanda offers career coaching services to help you navigate your professional journey. Our expert coaches can help with resume reviews, interview preparation, and career planning.
            </p>
            <Button className="bg-[#0A3D62] hover:bg-[#082C46] text-white" size="lg">
              Schedule a Consultation
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}

const ResourceCard = ({ icon, title, description, link, buttonText = "Learn More", buttonIcon = <ChevronRight className="h-4 w-4" /> }: ResourceCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-neutral-600">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={link}>
            <div className="flex items-center justify-center gap-2">
              <span>{buttonText}</span>
              {buttonIcon}
            </div>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Resources;