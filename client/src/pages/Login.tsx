import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Facebook } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [, navigate] = useLocation();
  const { loginWithEmail, isJobSeeker, isEmployer } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await loginWithEmail(data.email, data.password);
      
      // Navigate based on role
      if (isJobSeeker()) {
        navigate('/jobseeker/dashboard');
      } else if (isEmployer()) {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Business In Rwanda</title>
        <meta name="description" content="Sign in to your Business In Rwanda account to access job applications, postings, and your profile." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  Welcome back to Business In Rwanda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="w-full">
                      <Facebook className="h-4 w-4 mr-2" />
                      <span className="sr-only md:not-sr-only md:text-xs">Facebook</span>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FcGoogle className="h-4 w-4 mr-2" />
                      <span className="sr-only md:not-sr-only md:text-xs">Google</span>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FaLinkedin className="h-4 w-4 mr-2 text-[#0077B5]" />
                      <span className="sr-only md:not-sr-only md:text-xs">LinkedIn</span>
                    </Button>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-neutral-300 absolute w-full"></div>
                    <span className="bg-white px-3 relative text-neutral-600 text-sm">OR</span>
                  </div>
                  
                  {/* Login Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button variant="link" className="p-0 text-xs" onClick={() => navigate('/forgot-password')}>
                            Forgot Password?
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#0A3D62] hover:bg-[#082C46]"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center text-sm">
                    <span className="text-neutral-600">Don't have an account?</span>{' '}
                    <Button variant="link" className="p-0" onClick={() => navigate('/register')}>
                      Register
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
