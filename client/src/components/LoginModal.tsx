import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Facebook, X } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Sign In</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-neutral-600 mb-4">Welcome back! Sign in to access your account</p>
          
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
              <Facebook className="h-4 w-4" />
              Continue with Facebook
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FcGoogle className="h-5 w-5" />
              Continue with Google
            </Button>
            <Button className="w-full bg-[#0077B5] hover:bg-[#005e8b] flex items-center justify-center gap-2">
              <FaLinkedin className="h-4 w-4" />
              Continue with LinkedIn
            </Button>
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
                  <a href="#" className="text-sm text-[#0A3D62] hover:text-[#082C46]">
                    Forgot Password?
                  </a>
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
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
