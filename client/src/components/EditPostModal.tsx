import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Job } from "@shared/schema";

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

// Define form schema for post editing
const editPostSchema = z.object({
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

type FormValues = z.infer<typeof editPostSchema>;

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Job | null;
  companies: { id: number; name: string }[];
}

const EditPostModal = ({ isOpen, onClose, post, companies }: EditPostModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', location: '', website: '', logo: '' });

  const form = useForm<FormValues>({
    resolver: zodResolver(editPostSchema),
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
      companyId: undefined,
      individualName: "",
      individualContact: "",
    },
  });

  // Initialize form values when post data is available
  useEffect(() => {
    if (post) {
      // Determine owner type from post data
      const ownerType = post.companyId ? "company" : "individual";
      
      // Extract additionalData object, defaulting to empty object if not present
      const additionalData = (post.additionalData as Record<string, any>) || {};
      
      // Initialize form with values from post
      const defaultValues: Partial<FormValues> = {
        title: post.title || "",
        type: post.type || "full_time",
        location: post.location || "",
        description: post.description || "",
        requirements: post.requirements || "",
        responsibilities: post.responsibilities || "",
        category: post.category || "",
        salary: post.salary?.toString() || "",
        currency: post.currency || "RWF",
        experienceLevel: post.experienceLevel || "entry",
        postType: post.postType || "job",
        ownerType: ownerType,
        companyId: post.companyId || undefined,
        individualName: post.individualName || "",
        individualContact: post.individualContact || "",
      };
      
      // Handle post-type specific fields
      if (post.postType === 'auction') {
        defaultValues.auctionDate = post.auctionDate || additionalData.auctionDateRaw || "";
        defaultValues.auctionTime = post.auctionTime || additionalData.auctionTimeRaw || "";
        defaultValues.viewingDates = post.viewingDates || additionalData.viewingDatesRaw || "";
        defaultValues.auctionItems = additionalData.auctionItemsRaw || 
          (Array.isArray(additionalData.auctionItems) ? additionalData.auctionItems.join('\n') : "");
        defaultValues.auctionRequirements = post.auctionRequirements || "";
      }
      
      if (post.postType === 'tender') {
        defaultValues.tenderDeadline = post.tenderDeadline || 
          (additionalData.tenderInfo?.deadline || "");
        defaultValues.tenderRequirements = post.tenderRequirements || 
          (additionalData.tenderInfo?.requirements || "");
        defaultValues.tenderDocuments = post.tenderDocuments || 
          (additionalData.tenderInfo?.documents || "");
      }
      
      form.reset(defaultValues);
    }
  }, [post, form]);

  const onSubmit = async (data: FormValues) => {
    if (!post) return;
    
    setIsSubmitting(true);
    try {
      // Log form data for debugging
      console.log("Form data being submitted:", data);
      
      // Prepare the basic payload
      const payload: Record<string, any> = {
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
        postType: data.postType, // Include postType in the payload
        additionalData: {}, // Initialize empty additionalData
      };
      
      // Handle owner type selection
      payload.ownerType = data.ownerType;
      
      if (data.ownerType === 'company') {
        // Company owner - include companyId
        payload.companyId = data.companyId;
        // Reset individual info
        payload.individualName = null;
        payload.individualContact = null;
      } else {
        // Individual owner - include name and contact
        payload.companyId = null;
        payload.individualName = data.individualName;
        payload.individualContact = data.individualContact;
        
        // Store in additionalData as well
        payload.additionalData.ownerInfo = {
          name: data.individualName,
          contact: data.individualContact
        };
      }
      
      // Handle post-type specific fields
      if (data.postType === 'auction') {
        // Convert auction items to array in additionalData
        if (data.auctionItems) {
          payload.additionalData.auctionItems = data.auctionItems.split('\n').filter(item => item.trim());
        }
        
        // Store all auction fields in the main payload
        payload.auctionDate = data.auctionDate || null;
        payload.auctionTime = data.auctionTime || null;
        payload.viewingDates = data.viewingDates || null;
        payload.auctionRequirements = data.auctionRequirements || null;
        
        // Also store raw values in additionalData to prevent validation issues
        payload.additionalData.auctionDateRaw = data.auctionDate;
        payload.additionalData.auctionTimeRaw = data.auctionTime;
        payload.additionalData.viewingDatesRaw = data.viewingDates;
        payload.additionalData.auctionItemsRaw = data.auctionItems;
      }
      
      if (data.postType === 'tender') {
        payload.tenderDeadline = data.tenderDeadline || null;
        payload.tenderRequirements = data.tenderRequirements || null;
        payload.tenderDocuments = data.tenderDocuments || null;
        
        // Store in additionalData too
        payload.additionalData.tenderInfo = {
          deadline: data.tenderDeadline,
          requirements: data.tenderRequirements,
          documents: data.tenderDocuments
        };
      }
      
      // If additionalData is empty, remove it
      if (Object.keys(payload.additionalData).length === 0) {
        delete payload.additionalData;
      }

      // Send the request to update the post
      console.log("Sending payload to server:", payload);
      const response = await fetch(`/api/admin/jobs/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server error:", errorData);
        throw new Error(`Failed to update post: ${errorData ? JSON.stringify(errorData) : "Unknown error"}`);
      }
      
      const responseData = await response.json();
      console.log("Post updated successfully:", responseData);

      // Show success toast and invalidate queries to refresh data
      toast({
        title: "Post Updated",
        description: `The ${data.postType} has been updated successfully.`,
      });

      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update the post. Please try again.",
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
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update this {form.watch("postType")} post with the latest information.
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
                            field.onChange(parseInt(value, 10));
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
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose the company for this post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Individual Owner Info (only shown if ownerType is 'individual') */}
            {form.watch("ownerType") === "individual" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="individualName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Individual Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the individual posting this {form.watch("postType")}
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
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>
                        Enter phone number, email, or other contact information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Location field for job, auction and tender types (with different labels) */}
            {(form.watch("postType") === "job" || form.watch("postType") === "auction" || form.watch("postType") === "tender") && (
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
                        placeholder={
                          form.watch("postType") === "job" 
                          ? "e.g., Kigali, Rwanda or Remote"
                          : form.watch("postType") === "auction"
                          ? "e.g., Kimihurura, Kigali"
                          : "e.g., Company Headquarters, Nyarugenge"
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
            )}

            {/* Job Type field (only for job post type) */}
            {form.watch("postType") === "job" && (
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
                    <FormDescription>Select the employment type</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Category field for all post types */}
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
                    {form.watch("postType") === "job" && "The job category or industry (e.g., IT, Healthcare)"}
                    {form.watch("postType") === "auction" && "The category of auction (e.g., Real Estate, Vehicle)"}
                    {form.watch("postType") === "tender" && "The category of tender (e.g., Construction, Services)"}
                    {form.watch("postType") === "announcement" && "The category of this announcement"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field for all post types */}
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
                        disabled={isSubmitting}
                        placeholder={
                          form.watch("postType") === "job" 
                          ? "Describe the position, its responsibilities, and the role..."
                          : form.watch("postType") === "auction" 
                          ? "Provide details about the auction, its background and importance..."
                          : "Describe the tender opportunity and what your organization is seeking..."
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("postType") === "job" && "Provide a detailed overview of the job position and what the role entails"}
                      {form.watch("postType") === "auction" && "Provide a detailed overview of this auction, its purpose, and background information"}
                      {form.watch("postType") === "tender" && "Explain what your organization is seeking from bidders and provide context"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Requirements field for job, auction, and tender */}
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
                        disabled={isSubmitting}
                        placeholder={
                          form.watch("postType") === "job" 
                          ? "List the qualifications, skills, and experience required for this position..."
                          : form.watch("postType") === "auction" 
                          ? "Specify any requirements bidders must meet to participate..."
                          : "Detail the requirements bidders must meet to be eligible..."
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("postType") === "job" && "List qualifications, skills, education, and experience needed for this position"}
                      {form.watch("postType") === "auction" && "Specify requirements that bidders must meet to participate in this auction"}
                      {form.watch("postType") === "tender" && "Detail the requirements and qualifications bidders must meet for this tender"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Responsibilities field (only for job post type) */}
            {form.watch("postType") === "job" && (
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        disabled={isSubmitting}
                        placeholder="List the key responsibilities and duties of this position..."
                      />
                    </FormControl>
                    <FormDescription>Outline the main duties and responsibilities of this role</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Experience Level (only for job posts) */}
            {form.watch("postType") === "job" && (
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
                    <FormDescription>The level of experience required for this position</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Salary field (only for job post type) */}
            {form.watch("postType") === "job" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="text" 
                          disabled={isSubmitting}
                          placeholder="e.g., 500,000 or Competitive"
                        />
                      </FormControl>
                      <FormDescription>Salary or salary range</FormDescription>
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
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RWF">Rwandan Franc (RWF)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Currency for the salary</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Auction-specific fields */}
            {form.watch("postType") === "auction" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="auctionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auction Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
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
                            {...field} 
                            type="time" 
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
                      <FormLabel>Viewing Dates (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                          placeholder="e.g., June 1-5, 2023, 9 AM - 5 PM"
                        />
                      </FormControl>
                      <FormDescription>
                        When interested parties can view the items before the auction
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
                          disabled={isSubmitting}
                          placeholder="List each item being auctioned on a new line"
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
                      <FormLabel>Special Requirements (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
                          disabled={isSubmitting}
                          placeholder="Any special conditions, deposit requirements, etc."
                        />
                      </FormControl>
                      <FormDescription>
                        Additional requirements or conditions for this auction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Tender-specific fields */}
            {form.watch("postType") === "tender" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tenderDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submission Deadline</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
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
                  name="tenderRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={5}
                          disabled={isSubmitting}
                          placeholder="Detailed requirements and specifications..."
                        />
                      </FormControl>
                      <FormDescription>
                        Technical specifications and detailed requirements
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
                      <FormLabel>Documents & Submission Info</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3}
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
              </div>
            )}

            {/* Announcement-specific fields - just needs the content in the description */}
            {form.watch("postType") === "announcement" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSubmitting}
                          placeholder="e.g., Nationwide, Kigali, Musanze, etc."
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
                          placeholder="e.g., Public Notice, Event, Policy Change, etc."
                        />
                      </FormControl>
                      <FormDescription>
                        The type or category of announcement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={8}
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
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0A3D62] hover:bg-[#082C46]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Post
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;