import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, X, Mail, ArrowLeft } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email")
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      onClose();
    } catch (error) {
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      // In a real application, we would make an API call to send a password reset email
      // await apiRequest({
      //   url: "/api/auth/forgot-password",
      //   method: "POST",
      //   body: { email: data.email }
      // });
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setPasswordResetSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForms = () => {
    setShowForgotPassword(false);
    setPasswordResetSent(false);
    form.reset();
    forgotPasswordForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      resetForms();
      onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        {!showForgotPassword ? (
          // Login Screen
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Sign In</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-neutral-600 mb-4">Welcome back! Sign in to access your account</p>
              
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <a 
                  href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&response_type=code&scope=email+profile&access_type=offline&prompt=consent`}
                  className="w-full no-underline"
                >
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-gray-300"
                    type="button"
                  >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                  </Button>
                </a>
                <a href="/api/auth/linkedin" className="w-full no-underline">
                  <Button 
                    className="w-full bg-[#0077B5] hover:bg-[#005e8b] flex items-center justify-center gap-2"
                    type="button"
                  >
                    <FaLinkedin className="h-4 w-4 text-white" />
                    Continue with LinkedIn
                  </Button>
                </a>
              </div>
              
              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-neutral-300 absolute w-full"></div>
                <span className="bg-white px-3 relative text-neutral-600 text-sm">OR</span>
              </div>
              
              {/* Email/Password Form */}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-[#0A3D62] hover:text-[#082C46]"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      {...form.register("rememberMe")}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#0A3D62] hover:bg-[#082C46]" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </div>

            <DialogFooter className="sm:justify-center">
              <p className="text-center text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#0A3D62] hover:text-[#082C46] font-medium" onClick={onClose}>
                  Register
                </Link>
              </p>
            </DialogFooter>
          </>
        ) : (
          // Forgot Password Screen
          <>
            <DialogHeader>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-lg font-bold">Reset Password</DialogTitle>
              </div>
              <DialogDescription>
                {!passwordResetSent 
                  ? "Enter your email address and we'll send you a link to reset your password."
                  : "We've sent you an email with instructions to reset your password."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {!passwordResetSent ? (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="email@example.com"
                        {...forgotPasswordForm.register("email")}
                      />
                      {forgotPasswordForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{forgotPasswordForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full bg-[#0A3D62] hover:bg-[#082C46]" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="bg-green-50 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Check your email</h3>
                  <p className="text-neutral-600 mb-4">
                    We've sent a password reset link to your email address.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
