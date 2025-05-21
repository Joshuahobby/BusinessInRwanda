import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AccountSettings = () => {
  const { currentUser, loginWithGoogle, logout } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isChangingRole, setIsChangingRole] = useState(false);
  
  if (!currentUser) {
    return null;
  }

  const handleRoleChange = async (newRole: "job_seeker" | "employer") => {
    if (newRole === currentUser.role) {
      toast({
        title: "No change needed",
        description: `You are already registered as a ${newRole === "job_seeker" ? "Job Seeker" : "Employer"}`,
      });
      return;
    }

    try {
      setIsChangingRole(true);
      await logout();
      
      // Short delay to ensure logout completes
      setTimeout(async () => {
        try {
          // Log back in with new role
          await loginWithGoogle(newRole);
          toast({
            title: "Role updated successfully",
            description: `Your account has been switched to ${newRole === "job_seeker" ? "Job Seeker" : "Employer"}`,
          });
          
          // Redirect to appropriate dashboard
          const redirectPath = newRole === "job_seeker" ? "/dashboard" : "/employer";
          navigate(redirectPath);
        } catch (error) {
          console.error("Error during role change:", error);
          toast({
            title: "Error changing role",
            description: "Please try again later",
            variant: "destructive",
          });
        } finally {
          setIsChangingRole(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsChangingRole(false);
      toast({
        title: "Error changing role",
        description: "Failed to update your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="mt-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md">
            {currentUser.email}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <Label htmlFor="accountType">Account Type</Label>
          <div className="mt-2">
            <Select 
              defaultValue={currentUser.role} 
              onValueChange={(value) => handleRoleChange(value as "job_seeker" | "employer")}
              disabled={isChangingRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job_seeker">Job Seeker</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            You are currently registered as: <span className="font-medium">{currentUser.role === "job_seeker" ? "Job Seeker" : "Employer"}</span>
          </p>
        </div>
        
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Changing your account type will switch your dashboard and features. Your existing data remains intact.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={() => navigate("/")}>Cancel</Button>
        <Button 
          variant="destructive" 
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountSettings;