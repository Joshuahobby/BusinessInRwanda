import { useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['job_seeker', 'employer']),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [, navigate] = useLocation();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'job_seeker' | 'employer'>('job_seeker');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'job_seeker',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role as UserRole,
        phone: data.phone,
      });
      
      // Navigate based on role
      if (data.role === 'employer') {
        navigate('/login'); // Employers need to login to complete profile
      } else {
        navigate('/jobseeker/dashboard'); // Job seekers are auto-logged in
      }
    } catch (error) {
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'job_seeker' | 'employer');
    form.setValue('role', value as 'job_seeker' | 'employer');
  };

  return (
    <>
      <Helmet>
        <title>Register - Business In Rwanda</title>
        <meta name="description" content="Create an account on Business In Rwanda to find your dream job or post job opportunities for your company." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                <CardDescription className="text-center">
                  Sign up to get started with Business In Rwanda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="job_seeker">Job Seeker</TabsTrigger>
                    <TabsTrigger value="employer">Employer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="job_seeker">
                    <p className="text-sm text-neutral-600 mb-4">
                      Create a job seeker account to find jobs, submit applications, and track your career progress.
                    </p>
                  </TabsContent>
                  <TabsContent value="employer">
                    <p className="text-sm text-neutral-600 mb-4">
                      Create an employer account to post jobs, review applications, and connect with top talent in Rwanda.
                    </p>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4">
                  {/* Social Registration Buttons */}
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
                  
                  {/* Registration Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="hidden"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="job_seeker" id="role-seeker" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="employer" id="role-employer" />
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#0A3D62] hover:bg-[#082C46]"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Register'}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center text-sm">
                    <span className="text-neutral-600">Already have an account?</span>{' '}
                    <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                      Sign in
                    </Button>
                  </div>
                  
                  <div className="text-center text-xs text-neutral-500 mt-6">
                    By registering, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-neutral-800">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline hover:text-neutral-800">Privacy Policy</a>.
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

export default Register;
