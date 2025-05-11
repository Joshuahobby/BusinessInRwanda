import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
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
  CardFooter,
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
import { AlertCircle, Calendar, Info } from "lucide-react";

// Extend the insertJobSchema for more specific validation
const postJobSchema = insertJobSchema.extend({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["full_time", "part_time", "contract", "internship", "remote", "temporary"]),
  description: z.string().min(50, "Please provide a detailed description (at least 50 characters)"),
  requirements: z.string().min(30, "Please list the requirements (at least 30 characters)"),
  responsibilities: z.string().optional(),
  salary: z.string().optional(),
  experienceLevel: z.enum(["entry", "intermediate", "senior", "executive"]),
  deadline: z.string().optional(),
  isActive: z.boolean().default(true),
  category: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type PostJobFormValues = z.infer<typeof postJobSchema>;

const PostJob = () => {
  const { user, isAuthenticated, isEmployer } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always define hooks first, before any conditional returns
  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ['/api/employer/company'],
    enabled: isAuthenticated && isEmployer(), // Only run query if authenticated and employer
  });

  // Fetch categories for the dropdown
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<(Category & { count: number })[]>({
    queryKey: ['/api/categories'],
  });

  // Initialize form with default values
  const form = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      companyId: company?.id || 0, // Default to 0 for TypeScript, will be updated when company loads
      location: "",
      type: "full_time",
      description: "",
      responsibilities: "",
      requirements: "",
      salary: "",
      experienceLevel: "entry",
      deadline: "",
      isActive: true,
      category: "",
      agreeToTerms: false,
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: PostJobFormValues) => {
      // Remove agreeToTerms as it's not part of the schema
      const { agreeToTerms, ...jobData } = data;
      
      const response = await apiRequest("POST", "/api/jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posted successfully",
        description: "Your job has been published and is now visible to job seekers",
      });
      
      // Invalidate jobs query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/employer/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      
      // Redirect to employer dashboard
      navigate("/employer/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post job",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: PostJobFormValues) => {
    setIsSubmitting(true);
    await createJobMutation.mutateAsync(data);
  };

  // When company data loads, update form
  if (company && !form.getValues().companyId) {
    form.setValue("companyId", company.id);
  }

  // Redirect if not authenticated or not an employer
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isEmployer()) {
    navigate("/");
    return null;
  }

  // Show message if no company profile exists
  if (!isLoadingCompany && !company) {
    return (
      <>
        <Helmet>
          <title>Post a Job - Business In Rwanda</title>
          <meta name="description" content="Post a job and find the best talent in Rwanda for your organization." />
        </Helmet>

        <div className="bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create Company Profile First</CardTitle>
                <CardDescription>
                  You need to create a company profile before posting jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No company profile found</AlertTitle>
                  <AlertDescription>
                    To post jobs, you first need to create a company profile with your organization's details.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => navigate("/company/create")}
                  className="bg-[#0A3D62] hover:bg-[#082C46]"
                >
                  Create Company Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Post a Job - Business In Rwanda</title>
        <meta name="description" content="Post a job and find the best talent in Rwanda for your organization." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new job listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title*</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Software Developer, Marketing Manager"
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
                                    placeholder="e.g. Kigali, Remote"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Type*</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category*</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isLoadingCategories ? (
                                      <SelectItem value="loading">Loading categories...</SelectItem>
                                    ) : categories.length > 0 ? (
                                      categories.map((category: Category & { count: number }) => (
                                        <SelectItem key={category.id} value={category.name}>
                                          {category.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <>
                                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                                        <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
                                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                                        <SelectItem value="Education">Education</SelectItem>
                                        <SelectItem value="Engineering">Engineering</SelectItem>
                                        <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
                                        <SelectItem value="Management & Admin">Management & Admin</SelectItem>
                                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                                      </>
                                    )}
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
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salary (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. 500,000 - 700,000 RWF monthly"
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

                          <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Application Deadline (Optional)</FormLabel>
                                <FormControl>
                                  <div className="flex">
                                    <Input 
                                      type="date"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Job Details</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Description*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter a detailed description of the job"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Provide details about the role, company, and what makes this position unique
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="requirements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requirements*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="List the qualifications, skills, and experience required"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Include education level, years of experience, technical skills, etc.
                              </FormDescription>
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
                                  placeholder="List the key responsibilities and duties"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Describe the day-to-day tasks and long-term projects
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Terms & Status */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Terms & Status</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isActive"
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
                                  Make job active immediately
                                </FormLabel>
                                <FormDescription>
                                  If unchecked, the job will be saved as a draft
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

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
                              </div>
                            </FormItem>
                          )}
                        />
                        {form.formState.errors.agreeToTerms && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.agreeToTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between border-t pt-6 px-0">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => navigate("/employer/dashboard")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#0A3D62] hover:bg-[#082C46]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Posting..." : "Post Job"}
                      </Button>
                    </CardFooter>
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

export default PostJob;