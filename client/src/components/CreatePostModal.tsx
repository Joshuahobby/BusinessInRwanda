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
  postType: z.enum(["job", "tender", "announcement"]),
  // Allow company ID to be either a number or a string (since select values are strings)
  companyId: z.union([z.number(), z.string().transform(val => parseInt(val, 10))]),
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
      companyId: companies.length > 0 ? companies[0].id : undefined,
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
        experienceLevel: data.experienceLevel,
        companyId: data.companyId,
        postType: data.postType // Include postType in the payload
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

            {companies.length > 0 && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the company associated with this {form.watch("postType")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
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
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    Select the currency for the salary (RWF is default)
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the {form.watch("postType")}
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
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    List the requirements for this {form.watch("postType")}
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
                      {...field}
                      rows={3}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    List the responsibilities for this position
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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