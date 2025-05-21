import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Search, MapPin, ExternalLink, Globe, Users } from 'lucide-react';
import type { Company } from '@shared/schema';

const Employers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });
  
  // Get unique industries from companies
  const industriesSet = new Set<string>();
  industriesSet.add('all');
  companies.forEach(company => {
    if (company.industry) {
      industriesSet.add(company.industry);
    }
  });
  const industries = Array.from(industriesSet);
  
  // Filter companies based on search term and industry
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });

  return (
    <>
      <Helmet>
        <title>Explore Employers | Business In Rwanda</title>
        <meta name="description" content="Discover top employers in Rwanda across various industries. Find companies that match your career goals and values." />
        <meta property="og:title" content="Explore Employers | Business In Rwanda" />
        <meta property="og:description" content="Discover top employers in Rwanda across various industries. Find companies that match your career goals and values." />
      </Helmet>
      
      <div className="bg-[#0A3D62] py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Ideal Employer</h1>
          <p className="text-lg mb-8 max-w-2xl">Discover top companies across Rwanda that are hiring and building the future of the nation's economy.</p>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input 
                  placeholder="Search companies by name or keyword" 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-[#BD2031] hover:bg-[#A31B2A] text-white">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Browse Employers</h2>
            <TabsList>
              {industries.map(industry => (
                <TabsTrigger 
                  key={industry} 
                  value={industry}
                  onClick={() => setIndustryFilter(industry)}
                >
                  {industry === 'all' ? 'All Industries' : industry}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-neutral-200 rounded-t-lg"></div>
                  <CardContent className="pt-6 pb-2">
                    <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Building size={48} className="mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-xl font-semibold mb-1">No companies found</h3>
                  <p className="text-neutral-500">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredCompanies.map(company => (
                  <Link key={company.id} href={`/company/${company.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
                      <div className="h-40 bg-neutral-100 relative">
                        <div 
                          className="absolute inset-0 flex items-center justify-center p-8 bg-white"
                          style={{ backgroundImage: `url(${company.logo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                          {!company.logo && (
                            <Building size={64} className="text-neutral-300" />
                          )}
                        </div>
                      </div>
                      <CardContent className="pt-6 pb-2 flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-neutral-500 mt-1 flex-shrink-0" />
                          <span className="text-neutral-600">{company.location}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-2">
                          <Globe className="h-4 w-4 text-neutral-500 mt-1 flex-shrink-0" />
                          <span className="text-neutral-600">{company.industry}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-4">
                          <Users className="h-4 w-4 text-neutral-500 mt-1 flex-shrink-0" />
                          <span className="text-neutral-600">{company.employeeCount}</span>
                        </div>
                        <p className="text-neutral-600 line-clamp-3">{company.description}</p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" className="w-full" asChild>
                          <div className="flex items-center justify-center gap-2">
                            <span>View profile</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          )}
        </Tabs>
      </div>
      
      <div className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Are You an Employer?</h2>
            <p className="text-lg text-neutral-700 mb-8">
              Join Business In Rwanda to showcase your company, post jobs, and find the right talent to help your business grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#0A3D62] hover:bg-[#082C46] text-white" size="lg" asChild>
                <Link href="/register">Register Your Company</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/post-job">Post a Job</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Employers;