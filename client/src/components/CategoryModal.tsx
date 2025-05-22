import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  mode: "create" | "edit";
}

const CategoryModal = ({ isOpen, onClose, category, mode }: CategoryModalProps) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (category && mode === "edit") {
      setName(category.name || "");
      setIcon(category.icon || "");
    } else {
      setName("");
      setIcon("");
    }
  }, [category, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (mode === "create") {
        await apiRequest("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({ name, icon }),
        });
        
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else {
        await apiRequest(`/api/admin/categories/${category?.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, icon }),
        });
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      }
      
      // Refresh categories data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      // Close modal and reset form
      onClose();
      setName("");
      setIcon("");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new job category for your platform." 
              : "Update the details of this job category."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Information Technology"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (CSS class or emoji)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g., 💻 or fa-computer"
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-[#0A3D62] hover:bg-[#082C46]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                mode === "create" ? "Create Category" : "Update Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;