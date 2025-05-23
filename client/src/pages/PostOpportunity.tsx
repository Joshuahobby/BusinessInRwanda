import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { insertJobSchema, Category, Company } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Calendar, 
  Info, 
  Briefcase, 
  Gavel, 
  FileText, 
  Megaphone,
  DollarSign,
  Clock,
  MapPin,
  Building
} from "lucide-react";

// Enhanced schema that adapts to different opportunity types
const baseOpportunitySchema = insertJobSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(50, "Please provide a detailed description (at least 50 characters)"),
  deadline: z.string().optional(),
  isActive: z.boolean().default(true),
  category: z.string(),
  postType: z.enum(["job", "auction", "tender", "announcement"]),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Conditional schema based on opportunity type
const opportunitySchema = z.discriminatedUnion("postType", [
  // Job posting schema
  baseOpportunitySchema.extend({
    postType: z.literal("job"),
    type: z.enum(["full_time", "part_time", "contract", "internship", "remote", "temporary"]),
    requirements: z.string().min(30, "Please list the requirements (at least 30 characters)"),
    responsibilities: z.string().optional(),
    salary: z.string().optional(),
    experienceLevel: z.enum(["entry", "intermediate", "senior", "executive"]),
  }),
  // Auction schema
  baseOpportunitySchema.extend({
    postType: z.literal("auction"),
    startingPrice: z.string().optional(),
    currency: z.enum(["RWF", "USD", "EUR"]).default("RWF"),
    auctionDate: z.string().optional(),
    auctionLocation: z.string().optional(),
    itemCondition: z.string().optional(),
    requirements: z.string().optional(),
  }),
  // Tender schema
  baseOpportunitySchema.extend({
    postType: z.literal("tender"),
    budget: z.string().optional(),
    currency: z.enum(["RWF", "USD", "EUR"]).default("RWF"),
    submissionDeadline: z.string().optional(),
    requirements: z.string().min(30, "Please specify tender requirements"),
    evaluationCriteria: z.string().optional(),
    contactInfo: z.string().optional(),
  }),
  // Announcement schema
  baseOpportunitySchema.extend({
    postType: z.literal("announcement"),
    announcementType: z.enum(["event", "policy", "general", "urgent"]).default("general"),
    eventDate: z.string().optional(),
    contactInfo: z.string().optional(),
    requirements: z.string().optional(),
  }),
]);

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

const PostOpportunity = () => {
  const { currentUser, isAuthenticated, isEmployer } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<"job" | "auction" | "tender" | "announcement">("job");

  // Company query
  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ['/api/employer/company'],
    enabled: isAuthenticated && isEmployer(),
  });

  // Categories query
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  // Initialize form
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      companyId: company?.id || 0,
      location: "",
      description: "",
      deadline: "",
      isActive: true,
      category: "",
      postType: selectedType,
      agreeToTerms: false,
      // Job-specific defaults
      ...(selectedType === "job" && {
        type: "full_time",
        requirements: "",
        responsibilities: "",
        salary: "",
        experienceLevel: "entry",
      }),
      // Auction-specific defaults
      ...(selectedType === "auction" && {
        startingPrice: "",
        currency: "RWF",
        auctionDate: "",
        auctionLocation: "",
        itemCondition: "",
        requirements: "",
      }),
      // Tender-specific defaults
      ...(selectedType === "tender" && {
        budget: "",
        currency: "RWF",
        submissionDeadline: "",
        requirements: "",
        evaluationCriteria: "",
        contactInfo: "",
      }),
      // Announcement-specific defaults
      ...(selectedType === "announcement" && {
        announcementType: "general",
        eventDate: "",
        contactInfo: "",
        requirements: "",
      }),
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormValues) => {
      const { agreeToTerms, ...opportunityData } = data;
      const response = await apiRequest("POST", "/api/jobs", opportunityData);
      return response;
    },
    onSuccess: () => {
      const typeNames = {
        job: "Job",
        auction: "Auction",
        tender: "Tender", 
        announcement: "Announcement"
      };
      
      toast({
        title: `${typeNames[selectedType]} posted successfully!`,
        description: `Your ${selectedType} has been published and is now visible to users`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      
      navigate("/employer/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post opportunity",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    setIsSubmitting(true);
    await createOpportunityMutation.mutateAsync(data);
  };

  // Update form when company loads
  if (company && !form.getValues().companyId) {
    form.setValue("companyId", company.id);
  }

  // Handle type change
  const handleTypeChange = (newType: "job" | "auction" | "tender" | "announcement") => {
    setSelectedType(newType);
    form.setValue("postType", newType);
    form.reset({
      ...form.getValues(),
      postType: newType,
    });
  };

  // Auth checks
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isEmployer()) {
    navigate("/");
    return null;
  }

  // Company profile check
  if (!isLoadingCompany && !company) {
    return (
      <>
        <Helmet>
          <title>Post Opportunity - Business In Rwanda</title>
          <meta name="description" content="Post jobs, auctions, tenders, and announcements on Business In Rwanda." />
        </Helmet>

        <div className="bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create Company Profile First</CardTitle>
                <CardDescription>
                  You need to create a company profile before posting opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No company profile found</AlertTitle>
                  <AlertDescription>
                    To post opportunities, you first need to create a company profile with your organization's details.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => navigate("/employer/dashboard")}
                  className="bg-[#0A3D62] hover:bg-[#082C46]"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const getTypeConfig = () => {
    const configs = {
      job: {
        icon: <Briefcase className="w-5 h-5" />,
        title: "Job Posting",
        description: "Post a job opportunity to find qualified candidates",
        color: "bg-blue-50 border-blue-200 text-blue-800"
      },
      auction: {
        icon: <Gavel className="w-5 h-5" />,
        title: "Cyamunara/Auction",
        description: "Post an auction for items or assets",
        color: "bg-purple-50 border-purple-200 text-purple-800"
      },
      tender: {
        icon: <FileText className="w-5 h-5" />,
        title: "Tender/Procurement",
        description: "Post a tender opportunity for services or goods",
        color: "bg-indigo-50 border-indigo-200 text-indigo-800"
      },
      announcement: {
        icon: <Megaphone className="w-5 h-5" />,
        title: "Announcement",
        description: "Share important news or information",
        color: "bg-amber-50 border-amber-200 text-amber-800"
      }
    };
    return configs[selectedType];
  };

  return (
    <>
      <Helmet>
        <title>Post Opportunity - Business In Rwanda</title>
        <meta name="description" content="Post jobs, auctions, tenders, and announcements on Business In Rwanda." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Post New Opportunity</CardTitle>
                <CardDescription>
                  Choose your opportunity type and fill out the details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Opportunity Type Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Select Opportunity Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(["job", "auction", "tender", "announcement"] as const).map((type) => {
                      const config = {
                        job: {
                          icon: <Briefcase className="w-5 h-5" />,
                          title: "Job Posting",
                          description: "Hire qualified candidates",
                          color: selectedType === type ? "bg-blue-50 border-blue-500 text-blue-800" : "bg-white border-neutral-200"
                        },
                        auction: {
                          icon: <Gavel className="w-5 h-5" />,
                          title: "Cyamunara",
                          description: "Auction items or assets",
                          color: selectedType === type ? "bg-purple-50 border-purple-500 text-purple-800" : "bg-white border-neutral-200"
                        },
                        tender: {
                          icon: <FileText className="w-5 h-5" />,
                          title: "Tender",
                          description: "Procurement opportunities",
                          color: selectedType === type ? "bg-indigo-50 border-indigo-500 text-indigo-800" : "bg-white border-neutral-200"
                        },
                        announcement: {
                          icon: <Megaphone className="w-5 h-5" />,
                          title: "Announcement",
                          description: "Share important news",
                          color: selectedType === type ? "bg-amber-50 border-amber-500 text-amber-800" : "bg-white border-neutral-200"
                        }
                      }[type];

                      return (
                        <Card 
                          key={type}
                          className={`cursor-pointer transition-all hover:shadow-md ${config.color}`}
                          onClick={() => handleTypeChange(type)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="mb-2 flex justify-center">
                              {config.icon}
                            </div>
                            <h4 className="font-medium mb-1">{config.title}</h4>
                            <p className="text-xs opacity-75">{config.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Dynamic Form Based on Type */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Current Type Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getTypeConfig().color}>
                        {getTypeConfig().icon}
                        <span className="ml-1">{getTypeConfig().title}</span>
                      </Badge>
                    </div>

                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {selectedType === "job" ? "Job Title" : 
                                 selectedType === "auction" ? "Auction Title" :
                                 selectedType === "tender" ? "Tender Title" : "Announcement Title"}*
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={
                                    selectedType === "job" ? "e.g. Software Developer, Marketing Manager" :
                                    selectedType === "auction" ? "e.g. Office Equipment Auction, Vehicle Sale" :
                                    selectedType === "tender" ? "e.g. Construction Services Tender, IT Equipment Procurement" :
                                    "e.g. New Policy Update, Community Event"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location*</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={
                                      selectedType === "auction" ? "e.g. Kigali Convention Centre" :
                                      selectedType === "tender" ? "e.g. Project location or office" :
                                      "e.g. Kigali, Remote, Nationwide"
                                    }
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category*</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={
                                    selectedType === "job" ? "Describe the role, company culture, and what makes this opportunity attractive..." :
                                    selectedType === "auction" ? "Describe the items being auctioned, their condition, and any important details..." :
                                    selectedType === "tender" ? "Describe the project scope, requirements, and expectations..." :
                                    "Provide details about this announcement and its importance..."
                                  }
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Type-specific fields */}
                    {selectedType === "job" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Job Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Type*</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select job type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="full_time">Full Time</SelectItem>
                                      <SelectItem value="part_time">Part Time</SelectItem>
                                      <SelectItem value="contract">Contract</SelectItem>
                                      <SelectItem value="internship">Internship</SelectItem>
                                      <SelectItem value="remote">Remote</SelectItem>
                                      <SelectItem value="temporary">Temporary</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="experienceLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Experience Level*</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select experience level" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="entry">Entry Level</SelectItem>
                                      <SelectItem value="intermediate">Intermediate</SelectItem>
                                      <SelectItem value="senior">Senior</SelectItem>
                                      <SelectItem value="executive">Executive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requirements*</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="List the required skills, qualifications, and experience..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="responsibilities"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Responsibilities (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="What will this person be responsible for?..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salary (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. 500,000 - 700,000 RWF monthly or Competitive"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  You can enter a range or "Competitive"
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === "auction" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Auction Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="startingPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Starting Price (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g. 100,000"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="RWF">RWF</SelectItem>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="auctionDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Auction Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="auctionLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Auction Venue (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Where will the auction take place?"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="itemCondition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Condition (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the condition of items being auctioned..."
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === "tender" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Tender Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="budget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Budget (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g. 5,000,000"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="RWF">RWF</SelectItem>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="submissionDeadline"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Submission Deadline</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requirements*</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Specify the technical and legal requirements for this tender..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="evaluationCriteria"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evaluation Criteria (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="How will proposals be evaluated?..."
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contactInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Information (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Contact person or department for inquiries"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === "announcement" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Announcement Details</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="announcementType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Announcement Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="general">General</SelectItem>
                                      <SelectItem value="event">Event</SelectItem>
                                      <SelectItem value="policy">Policy</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="eventDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Event Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="contactInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Information (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Contact details for more information"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Common fields */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType === "job" ? "Application Deadline" :
                               selectedType === "auction" ? "Registration Deadline" :
                               selectedType === "tender" ? "Tender Deadline" : "Response Deadline"} (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Terms agreement */}
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the terms and conditions*
                            </FormLabel>
                            <FormDescription>
                              By posting this opportunity, you agree to our posting guidelines and terms of service.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit button */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/employer/dashboard")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0A3D62] hover:bg-[#082C46]"
                      >
                        {isSubmitting ? "Publishing..." : `Publish ${getTypeConfig().title}`}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostOpportunity;