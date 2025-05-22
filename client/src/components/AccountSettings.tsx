import { useState } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const AccountSettings = () => {
  const { currentUser, loginWithGoogle, logout } = useFirebaseAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [progressStatus, setProgressStatus] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  
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
      // Start loading sequence
      setIsChangingRole(true);
      setProgressStatus(10);
      setLoadingMessage("Logging out of current account...");
      
      // Perform logout
      await logout();
      setProgressStatus(30);
      
      // Short delay to ensure logout completes
      setTimeout(async () => {
        try {
          setLoadingMessage("Logging in with new role...");
          setProgressStatus(50);
          
          // Log back in with new role
          await loginWithGoogle(newRole);
          
          setProgressStatus(80);
          setLoadingMessage("Updating your profile...");
          
          // Complete the process
          setTimeout(() => {
            setProgressStatus(100);
            setLoadingMessage("Redirecting to dashboard...");
            
            toast({
              title: "Role updated successfully",
              description: `Your account has been switched to ${newRole === "job_seeker" ? "Job Seeker" : "Employer"}`,
            });
            
            // Redirect to appropriate dashboard with role_change query parameter
            const redirectPath = newRole === "job_seeker" 
              ? "/jobseeker/dashboard?redirect=role_change" 
              : "/employer/dashboard?redirect=role_change";
              
            navigate(redirectPath);
          }, 500);
        } catch (error) {
          console.error("Error during role change:", error);
          setProgressStatus(0);
          toast({
            title: "Error changing role",
            description: "Please try again later",
            variant: "destructive",
          });
        } finally {
          // Don't reset the loading state here, as it will cause a flash before navigation
          if (progressStatus < 100) {
            setIsChangingRole(false);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Error during logout:", error);
      setProgressStatus(0);
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
      
      {isChangingRole ? (
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <Loader2 className="h-10 w-10 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-medium mb-3">Switching Account Type</h3>
            <p className="text-neutral-600 mb-4">{loadingMessage}</p>
            
            <div className="w-full max-w-md mx-auto mb-2">
              <Progress value={progressStatus} className="h-2" />
            </div>
            <p className="text-xs text-neutral-500">Please do not close or refresh the page</p>
          </div>
        </CardContent>
      ) : (
        <>
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
        </>
      )}
    </Card>
  );
};

export default AccountSettings;