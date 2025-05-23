import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";
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
import { Building, ArrowLeft } from "lucide-react";

// Enhanced company schema with validation
const createCompanySchema = insertCompanySchema.extend({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(2, "Industry is required"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(50, "Please provide a detailed description (at least 50 characters)"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  employeeCount: z.string().min(1, "Employee count is required"),
  founded: z.string().optional(),
});

type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

const CreateCompany = () => {
  const { currentUser, isAuthenticated, isEmployer } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      industry: "",
      location: "",
      description: "",
      website: "",
      employeeCount: "",
      founded: "",
      userId: currentUser?.id || 0,
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyFormValues) => {
      const response = await apiRequest("POST", "/api/companies", {
        ...data,
        userId: currentUser?.id,
        employeeCount: parseInt(data.employeeCount),
        founded: data.founded ? parseInt(data.founded) : null,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Company profile created successfully!",
        description: "Your company profile has been created. You can now post opportunities.",
      });
      
      // Invalidate company query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/employer/company'] });
      
      // Redirect to employer dashboard
      navigate("/employer/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create company profile",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateCompanyFormValues) => {
    setIsSubmitting(true);
    await createCompanyMutation.mutateAsync(data);
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

  return (
    <>
      <Helmet>
        <title>Create Company Profile - Business In Rwanda</title>
        <meta name="description" content="Create your company profile to start posting opportunities on Business In Rwanda." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/employer/dashboard")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Create Company Profile</h1>
                  <p className="text-neutral-600">
                    Set up your company profile to start posting opportunities
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Provide details about your company to attract the best talent
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
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name*</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Business In Rwanda Ltd"
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
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                                    <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="Construction">Construction</SelectItem>
                                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                                    <SelectItem value="Tourism & Hospitality">Tourism & Hospitality</SelectItem>
                                    <SelectItem value="Transportation">Transportation</SelectItem>
                                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                                    <SelectItem value="Energy">Energy</SelectItem>
                                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                                    <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                                    <SelectItem value="Government">Government</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location*</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. Kigali, Rwanda"
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
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your company, mission, values, and what makes it unique..."
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This will be displayed on your company profile and job listings
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Details */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Additional Details</h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://www.yourcompany.com"
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
                            name="employeeCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of Employees*</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1-10">1-10 employees</SelectItem>
                                    <SelectItem value="11-50">11-50 employees</SelectItem>
                                    <SelectItem value="51-200">51-200 employees</SelectItem>
                                    <SelectItem value="201-500">201-500 employees</SelectItem>
                                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                                    <SelectItem value="1000+">1000+ employees</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="founded"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year Founded (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. 2020"
                                    type="number"
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end space-x-4 pt-6">
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
                        {isSubmitting ? "Creating..." : "Create Company Profile"}
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

export default CreateCompany;