import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: any;
  mode: "create" | "edit";
}

const NotificationModal = ({ isOpen, onClose, notification, mode }: NotificationModalProps) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [enabled, setEnabled] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (notification && mode === "edit") {
      setMessage(notification.message || "");
      setType(notification.type || "info");
      setEnabled(notification.enabled !== false);
      
      // Format date for input field
      if (notification.expiresAt) {
        const date = new Date(notification.expiresAt);
        setExpiresAt(format(date, "yyyy-MM-dd"));
      } else {
        // Default to 30 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        setExpiresAt(format(defaultDate, "yyyy-MM-dd"));
      }
    } else {
      // Default values for new notification
      setMessage("");
      setType("info");
      setEnabled(true);
      
      // Default to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setExpiresAt(format(defaultDate, "yyyy-MM-dd"));
    }
  }, [notification, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Validation Error",
        description: "Notification message is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const notificationData = {
      message,
      type,
      enabled,
      expiresAt: new Date(expiresAt).toISOString(),
    };
    
    try {
      if (mode === "create") {
        await apiRequest("/api/admin/notifications", "POST", 
          JSON.stringify(notificationData)
        );
        
        toast({
          title: "Success",
          description: "Notification created successfully",
        });
      } else {
        await apiRequest(`/api/admin/notifications/${notification?.id}`, "PATCH", 
          JSON.stringify(notificationData)
        );
        
        toast({
          title: "Success",
          description: "Notification updated successfully",
        });
      }
      
      // Refresh notifications data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      
      // Close modal and reset form
      onClose();
    } catch (error) {
      console.error("Error saving notification:", error);
      toast({
        title: "Error",
        description: "Failed to save notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Notification" : "Edit Notification"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new platform-wide notification message" 
              : "Update this notification message"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Notification Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., We'll be performing system maintenance on Saturday..."
              disabled={isLoading}
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <RadioGroup 
              value={type} 
              onValueChange={setType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="info" id="type-info" />
                <Label htmlFor="type-info" className="cursor-pointer">Info</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warning" id="type-warning" />
                <Label htmlFor="type-warning" className="cursor-pointer">Warning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="error" id="type-error" />
                <Label htmlFor="type-error" className="cursor-pointer">Error</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-neutral-500">
              The notification will automatically be removed after this date.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading}
            />
            <Label htmlFor="enabled">Enable Notification</Label>
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
                mode === "create" ? "Create Notification" : "Update Notification"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;