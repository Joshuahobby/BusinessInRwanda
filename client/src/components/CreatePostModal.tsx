import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define form schema for post creation
const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["full_time", "part_time", "contract", "internship", "remote", "temporary"]),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  responsibilities: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  salary: z.string().optional(),
  currency: z.enum(["RWF", "USD", "EUR"]).default("RWF"),
  experienceLevel: z.enum(["entry", "intermediate", "senior", "executive"]),
  postType: z.enum(["job", "auction", "tender", "announcement"]),
  
  // Owner type selection (company or individual)
  ownerType: z.enum(["company", "individual"]),
  
  // Allow company ID to be either a number or a string (since select values are strings)
  companyId: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]).optional(),
  
  // Individual owner information (only required if ownerType is individual)
  individualName: z.string().optional(),
  individualContact: z.string().optional(),
  
  // Auction-specific fields
  auctionDate: z.string().optional(),
  auctionTime: z.string().optional(),
  viewingDates: z.string().optional(),
  auctionItems: z.string().optional(),
  auctionRequirements: z.string().optional(),
  
  // Tender-specific fields
  tenderDeadline: z.string().optional(),
  tenderRequirements: z.string().optional(),
  tenderDocuments: z.string().optional(),
})
.refine(data => {
  // Require individualName if ownerType is individual
  if (data.ownerType === 'individual' && !data.individualName) {
    return false;
  }
  // Require companyId if ownerType is company
  if (data.ownerType === 'company' && !data.companyId) {
    return false;
  }
  return true;
}, {
  message: "Please provide required owner information",
  path: ["ownerType"],
});

type FormValues = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: { id: number; name: string }[];
}

const CreatePostModal = ({ isOpen, onClose, companies }: CreatePostModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', location: '', website: '', logo: '' });

  const form = useForm<FormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      type: "full_time",
      location: "",
      description: "",
      requirements: "",
      responsibilities: "",
      category: "",
      salary: "",
      currency: "RWF",
      experienceLevel: "entry",
      postType: "job",
      ownerType: "company",
      companyId: companies.length > 0 ? companies[0].id : undefined,
      individualName: "",
      individualContact: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Log form data for debugging
      console.log("Form data being submitted:", data);
      
      // Prepare the payload based on post type
      const payload = {
        title: data.title,
        type: data.type,
        location: data.location,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities || "",
        category: data.category,
        salary: data.salary || "",
        currency: data.currency,
        experienceLevel: data.experienceLevel,
        companyId: data.companyId,
        postType: data.postType, // Include postType in the payload
        
        // Add auction specific fields if post type is auction
        ...(data.postType === 'auction' && {
          auctionDate: data.auctionDate,
          auctionTime: data.auctionTime,
          viewingDates: data.viewingDates,
          auctionItems: data.auctionItems,
          auctionRequirements: data.auctionRequirements,
          // Store auction items as an array in additionalData
          additionalData: {
            auctionItems: data.auctionItems?.split('\n').filter(item => item.trim())
          }
        }),
        
        // Add tender specific fields if post type is tender
        ...(data.postType === 'tender' && {
          tenderDeadline: data.tenderDeadline,
          tenderRequirements: data.tenderRequirements,
          tenderDocuments: data.tenderDocuments
        })
      };

      // Send the request to create the post
      console.log("Sending payload to server:", payload);
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server error:", errorData);
        throw new Error(`Failed to create post: ${errorData ? JSON.stringify(errorData) : "Unknown error"}`);
      }
      
      const responseData = await response.json();
      console.log("Post created successfully:", responseData);

      // Show success toast and invalidate queries to refresh data
      toast({
        title: "Post Created",
        description: `The ${data.postType} has been created successfully and is pending approval.`,
      });

      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });

      // Close the modal
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Create a new job posting, tender, or announcement for the platform.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job">Job Vacancy</SelectItem>
                        <SelectItem value="auction">Auction (Cyamunara)</SelectItem>
                        <SelectItem value="tender">Tender</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the type of post you want to create
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>
                    Enter a descriptive title for the {form.watch("postType")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner Type Selection (Company vs Individual) */}
            <FormField
              control={form.control}
              name="ownerType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Post Owner Type</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="ownerCompany" />
                        <label htmlFor="ownerCompany" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Company / Organization
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="ownerIndividual" />
                        <label htmlFor="ownerIndividual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Individual
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select who is posting this {form.watch("postType")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Selector (only shown if ownerType is 'company') */}
            {form.watch("ownerType") === "company" && (
              <div className="space-y-4">
                {companies.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Company</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Select
                              value={field.value ? field.value.toString() : ''}
                              onValueChange={(value) => {
                                if (value === "new") {
                                  // Open the new company form
                                  setShowNewCompanyForm(true);
                                  // Reset the company ID field
                                  field.onChange("");
                                } else {
                                  setShowNewCompanyForm(false);
                                  field.onChange(parseInt(value, 10));
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select existing company" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="new" className="font-medium text-primary">
                                  + Add New Company
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                window.open('/admin/companies', '_blank');
                              }}
                            >
                              Manage
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose an existing company or add a new one
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No companies available</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            There are no companies in the system yet. You can add a new company from the Company Management section.
                          </p>
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                window.open('/admin/companies', '_blank');
                              }}
                              className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                            >
                              Go to Company Management
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Individual Owner Information (only shown if ownerType is 'individual') */}
            {form.watch("ownerType") === "individual" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="individualName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Individual Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                          placeholder="Full name of individual posting this ad" 
                        />
                      </FormControl>
                      <FormDescription>
                        Name of the person posting this {form.watch("postType")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="individualContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                          placeholder="Phone number or email" 
                        />
                      </FormControl>
                      <FormDescription>
                        How interested parties can reach this individual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>
                    Enter the category for this {form.watch("postType")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job-specific fields */}
            {form.watch("postType") === "job" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Location field for job, auction and tender types (with different labels) */}
            {(form.watch("postType") === "job" || form.watch("postType") === "auction" || form.watch("postType") === "tender") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("postType") === "job" && "Job Location"}
                        {form.watch("postType") === "auction" && "Auction Location"}
                        {form.watch("postType") === "tender" && "Tender Location"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting} 
                          placeholder={form.watch("postType") === "job" 
                            ? "e.g., Kigali, Remote, Hybrid" 
                            : form.watch("postType") === "auction"
                            ? "e.g., Company premises, Auction house"
                            : "e.g., Company address, Online submission"
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("postType") === "job" && "Where the job is located or if it's remote"}
                        {form.watch("postType") === "auction" && "Where the auction will take place"}
                        {form.watch("postType") === "tender" && "Where tender documents should be submitted"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Salary only for jobs */}
                {form.watch("postType") === "job" && (
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={isSubmitting} 
                            placeholder="e.g., 500,000-700,000, Negotiable, Competitive"
                          />
                        </FormControl>
                        <FormDescription>
                          Salary or compensation range
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Currency selector only for jobs */}
            {form.watch("postType") === "job" && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RWF">Rwandan Franc (RWF)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Currency for the salary (RWF is default)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Common description field with post-type specific labels and placeholders */}
            {form.watch("postType") !== "announcement" && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("postType") === "job" && "Job Description"}
                      {form.watch("postType") === "auction" && "Auction Description"}
                      {form.watch("postType") === "tender" && "Tender Description"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        className="resize-none"
                        disabled={isSubmitting}
                        placeholder={form.watch("postType") === "job" 
                          ? "Describe the job position, roles, and opportunities in detail..."
                          : form.watch("postType") === "auction" 
                          ? "Provide details about the auction, its background and importance..."
                          : "Describe the tender opportunity and what your organization is seeking..."
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("postType") === "job" && "Describe the job position in detail, including daily tasks and work environment"}
                      {form.watch("postType") === "auction" && "Provide a detailed overview of this auction, its purpose, and background information"}
                      {form.watch("postType") === "tender" && "Explain what your organization is seeking from bidders and provide context"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Post-specific requirements field */}
            {form.watch("postType") !== "announcement" && (
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("postType") === "job" && "Job Requirements"}
                      {form.watch("postType") === "auction" && "Bidder Requirements"}
                      {form.watch("postType") === "tender" && "Eligibility Requirements"}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        className="resize-none"
                        disabled={isSubmitting}
                        placeholder={form.watch("postType") === "job" 
                          ? "List required qualifications, experience, skills, education, etc."
                          : form.watch("postType") === "auction" 
                          ? "List requirements for bidders like registration, deposits, documentation, etc."
                          : "Detail eligibility criteria such as licenses, certifications, experience, etc."
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("postType") === "job" && "List qualifications, skills, education, and experience required for this position"}
                      {form.watch("postType") === "auction" && "Specify requirements that bidders must meet to participate in this auction"}
                      {form.watch("postType") === "tender" && "Detail the requirements and qualifications bidders must meet for this tender"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("postType") === "job" && (
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="resize-none"
                        disabled={isSubmitting}
                        placeholder="e.g., Managing team of 5 developers, Coordinating with stakeholders, etc."
                      />
                    </FormControl>
                    <FormDescription>
                      List the key responsibilities for this job position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Auction-specific fields */}
            {form.watch("postType") === "auction" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="auctionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={isSubmitting} 
                          />
                        </FormControl>
                        <FormDescription>
                          The date when the auction will take place
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="auctionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            disabled={isSubmitting} 
                          />
                        </FormControl>
                        <FormDescription>
                          The time when the auction will start
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="viewingDates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viewing Dates</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="e.g., Viewing will be available from May 9-10, 2025 at the location."
                        />
                      </FormControl>
                      <FormDescription>
                        When and where interested bidders can view the items
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="auctionItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Items</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="List each item on a separate line, e.g.:&#10;Toyota Carina E (1997)&#10;Small farming machine&#10;Metal scraps"
                        />
                      </FormControl>
                      <FormDescription>
                        List all items being auctioned (one per line)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="auctionRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auction Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="e.g., Deposit requirements, payment conditions, bidder responsibilities"
                        />
                      </FormControl>
                      <FormDescription>
                        Special requirements for bidders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Tender-specific fields */}
            {form.watch("postType") === "tender" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tenderDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Deadline</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={isSubmitting} 
                          />
                        </FormControl>
                        <FormDescription>
                          The deadline for tender submissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tender Category</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} placeholder="e.g., Construction, IT Services, Supplies" />
                        </FormControl>
                        <FormDescription>
                          Category of goods or services being sought
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tenderRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="e.g., Minimum years in business, required certifications, financial requirements"
                        />
                      </FormControl>
                      <FormDescription>
                        Requirements bidders must meet to be eligible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tenderDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documents & Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="e.g., How to obtain tender documents, submission process, evaluation criteria"
                        />
                      </FormControl>
                      <FormDescription>
                        Information about required documents and submission process
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Announcement-specific fields */}
            {form.watch("postType") === "announcement" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={isSubmitting} 
                            placeholder="e.g., Kigali, Online, Company offices"
                          />
                        </FormControl>
                        <FormDescription>
                          Where this announcement is relevant to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Announcement Type</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={isSubmitting} 
                            placeholder="e.g., Event, Public Notice, Opportunity"
                          />
                        </FormControl>
                        <FormDescription>
                          The type or category of announcement
                        </FormDescription>
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
                      <FormLabel>Announcement Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={6}
                          className="resize-none"
                          disabled={isSubmitting}
                          placeholder="Provide comprehensive details about this announcement. Include all relevant information such as dates, times, purposes, benefits, and any other important information for the audience."
                        />
                      </FormControl>
                      <FormDescription>
                        Complete details of the announcement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;