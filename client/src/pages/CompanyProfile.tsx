import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Company, Job } from "@shared/schema";
import { MapPin, Globe, Users, Calendar, Building, AlertCircle, Briefcase, ExternalLink } from "lucide-react";
import JobCard from "@/components/JobCard";

// Company with active jobs relation
type CompanyWithJobs = Company & {
  jobs: Job[];
};

const CompanyProfile = () => {
  const [match] = useRoute<{ id: string }>("/company/:id");
  const companyId = match?.params.id ? parseInt(match.params.id) : null;

  // Fetch company data
  const { data: company, isLoading, error } = useQuery<CompanyWithJobs>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-64 bg-white animate-pulse rounded-lg mb-6"></div>
            <div className="h-96 bg-white animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <h2 className="text-xl font-medium">Company Not Found</h2>
                </div>
                <p className="mt-2 text-neutral-600">
                  The company you're looking for doesn't exist or was removed.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/find-jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = company.jobs.filter(job => job.isActive);

  return (
    <>
      <Helmet>
        <title>{`${company.name} - Company Profile | Business In Rwanda`}</title>
        <meta name="description" content={`Learn about ${company.name}, view their open positions, and join their team. ${company.description?.substring(0, 120) || ""}`} />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Company Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 flex justify-center">
                    <div className="h-36 w-36 bg-white rounded-md border flex items-center justify-center p-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={`${company.name} logo`}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building className="h-16 w-16 text-neutral-300" />
                      )}
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{company.industry}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {company.location}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-neutral-500" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0A3D62] hover:underline flex items-center"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      
                      {company.employeeCount && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-neutral-500" />
                          <span>{company.employeeCount} employees</span>
                        </div>
                      )}
                      
                      {company.founded && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span>Founded in {company.founded}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-neutral-500" />
                        <span>{activeJobs.length} active jobs</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="bg-[#0A3D62] hover:bg-[#082C46]">
                        Follow Company
                      </Button>
                      {company.website && (
                        <Button variant="outline" asChild>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Tabs */}
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({activeJobs.length})</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description ? (
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{company.description}</p>
                      </div>
                    ) : (
                      <p className="text-neutral-500">
                        No company description available.
                      </p>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Company Information</h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <dt className="text-sm text-neutral-500">Industry</dt>
                          <dd className="font-medium">{company.industry}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-neutral-500">Location</dt>
                          <dd className="font-medium">{company.location}</dd>
                        </div>
                        {company.website && (
                          <div>
                            <dt className="text-sm text-neutral-500">Website</dt>
                            <dd>
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0A3D62] hover:underline"
                              >
                                {company.website}
                              </a>
                            </dd>
                          </div>
                        )}
                        {company.founded && (
                          <div>
                            <dt className="text-sm text-neutral-500">Founded</dt>
                            <dd className="font-medium">{company.founded}</dd>
                          </div>
                        )}
                        {company.employeeCount && (
                          <div>
                            <dt className="text-sm text-neutral-500">Company Size</dt>
                            <dd className="font-medium">{company.employeeCount} employees</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Jobs Tab */}
              <TabsContent value="jobs">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Positions at {company.name}</CardTitle>
                    <CardDescription>
                      {activeJobs.length > 0
                        ? `${activeJobs.length} active job${activeJobs.length > 1 ? "s" : ""}`
                        : "No active jobs at the moment"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeJobs.length > 0 ? (
                      <div className="space-y-4">
                        {activeJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            id={job.id}
                            title={job.title}
                            companyName={company.name}
                            companyLogo={company.logo || "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"}
                            location={job.location}
                            jobType={job.type}
                            salary={job.salary || "Competitive salary"}
                            description={job.description}
                            postedAt={job.createdAt}
                            isNew={new Date(job.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                        <h3 className="text-lg font-medium mb-2">No open positions</h3>
                        <p className="text-neutral-500 mb-4">
                          {company.name} doesn't have any active job listings at the moment.
                          Check back later or browse other companies.
                        </p>
                        <Button asChild>
                          <Link href="/find-jobs">Browse All Jobs</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;
