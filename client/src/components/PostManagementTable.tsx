import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash,
  Star,
  StarOff,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileText,
  Briefcase,
  Megaphone,
  Gavel
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostManagementTableProps {
  posts: Job[];
  isLoading: boolean;
  onViewPost: (post: Job) => void;
  onEditPost: (post: Job) => void;
  onApprovePost: (post: Job) => void;
  onRejectPost: (post: Job) => void;
  onFeaturePost: (post: Job, featured: boolean) => void;
  onDeletePost: (post: Job) => void;
  filterType?: string;
  onFilterChange?: (type: string) => void;
}

const PostManagementTable = ({
  posts,
  isLoading,
  onViewPost,
  onEditPost,
  onApprovePost,
  onRejectPost,
  onFeaturePost,
  onDeletePost,
  filterType = "all",
  onFilterChange
}: PostManagementTableProps) => {
  const { toast } = useToast();
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const handleFeatureToggle = async (post: Job, featured: boolean) => {
    try {
      setActionInProgress(post.id);
      await onFeaturePost(post, featured);
      
      toast({
        title: featured ? "Post Featured" : "Post Unfeatured",
        description: featured
          ? "The post has been featured and will be highlighted on the platform."
          : "The post has been removed from featured listings.",
      });
    } catch (error) {
      console.error("Error featuring post:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem updating the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApprove = async (post: Job) => {
    try {
      setActionInProgress(post.id);
      await onApprovePost(post);
      
      toast({
        title: "Post Approved",
        description: "The post has been approved and is now visible to users.",
      });
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem approving the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (post: Job) => {
    try {
      setActionInProgress(post.id);
      await onRejectPost(post);
      
      toast({
        title: "Post Rejected",
        description: "The post has been rejected and will not be shown to users.",
      });
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem rejecting the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (post: Job) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setActionInProgress(post.id);
      await onDeletePost(post);
      
      toast({
        title: "Post Deleted",
        description: "The post has been permanently deleted from the platform.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Action Failed",
        description: "There was a problem deleting the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper function to get post status badge
  const getStatusBadge = (post: Job) => {
    const status = post.status || 'pending';
    
    switch(status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Pending
          </Badge>
        );
    }
  };

  // Helper function to get post type icon and badge
  const getPostTypeBadge = (post: Job) => {
    const postType = post.postType || 'job';
    
    switch(postType) {
      case 'auction':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            <Gavel className="h-3 w-3 mr-1" />
            Auction
          </Badge>
        );
      case 'tender':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <FileText className="h-3 w-3 mr-1" />
            Tender
          </Badge>
        );
      case 'announcement':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            <Megaphone className="h-3 w-3 mr-1" />
            Announcement
          </Badge>
        );
      case 'job':
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <Briefcase className="h-3 w-3 mr-1" />
            Job
          </Badge>
        );
    }
  };

  // Filter posts by type if a filter is applied
  const filteredPosts = filterType === 'all' 
    ? posts 
    : posts.filter(post => post.postType === filterType);

  return (
    <div>
      {onFilterChange && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium">Filter by type:</span>
          <div className="flex gap-1">
            <Button 
              variant={filterType === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => onFilterChange("all")}
            >
              All
            </Button>
            <Button 
              variant={filterType === "job" ? "default" : "outline"} 
              size="sm"
              onClick={() => onFilterChange("job")}
              className={filterType === "job" ? "" : "text-green-700 border-green-200 bg-green-50 hover:bg-green-100"}
            >
              <Briefcase className="h-3.5 w-3.5 mr-1" />
              Jobs
            </Button>
            <Button 
              variant={filterType === "auction" ? "default" : "outline"} 
              size="sm"
              onClick={() => onFilterChange("auction")}
              className={filterType === "auction" ? "" : "text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100"}
            >
              <Gavel className="h-3.5 w-3.5 mr-1" />
              Auctions
            </Button>
            <Button 
              variant={filterType === "tender" ? "default" : "outline"} 
              size="sm"
              onClick={() => onFilterChange("tender")}
              className={filterType === "tender" ? "" : "text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100"}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Tenders
            </Button>
            <Button 
              variant={filterType === "announcement" ? "default" : "outline"} 
              size="sm"
              onClick={() => onFilterChange("announcement")}
              className={filterType === "announcement" ? "" : "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"}
            >
              <Megaphone className="h-3.5 w-3.5 mr-1" />
              Announcements
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {isLoading 
              ? 'Loading posts...' 
              : filterType === 'all'
                ? `Total of ${filteredPosts.length} posts`
                : `Total of ${filteredPosts.length} ${filterType} posts`
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state - show skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell colSpan={7}>
                    <div className="h-10 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPosts.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                  {filterType === 'all' 
                    ? 'No posts found' 
                    : `No ${filterType} posts found`
                  }
                </TableCell>
              </TableRow>
            ) : (
              // Posts list
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {post.isFeatured && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Star className="h-4 w-4 text-amber-500" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Featured post</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span>{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPostTypeBadge(post)}</TableCell>
                  <TableCell>{post.companyName || "Unknown"}</TableCell>
                  <TableCell>{post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                  <TableCell>{post.location}</TableCell>
                  <TableCell>
                    {getStatusBadge(post)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onViewPost(post)}
                        disabled={actionInProgress === post.id}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={actionInProgress === post.id}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Manage {post.postType || 'Post'}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEditPost(post)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          
                          {post.status !== 'approved' && (
                            <DropdownMenuItem 
                              onClick={() => handleApprove(post)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve Post
                            </DropdownMenuItem>
                          )}
                          
                          {post.status !== 'rejected' && (
                            <DropdownMenuItem 
                              onClick={() => handleReject(post)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Post
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {post.isFeatured ? (
                            <DropdownMenuItem onClick={() => handleFeatureToggle(post, false)}>
                              <StarOff className="h-4 w-4 mr-2" />
                              Remove Featured
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleFeatureToggle(post, true)}>
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              Feature Post
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(post)}
                        disabled={actionInProgress === post.id}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PostManagementTable;