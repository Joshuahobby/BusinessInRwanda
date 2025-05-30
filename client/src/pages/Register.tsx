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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, CheckCircle2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useToast } from '@/hooks/use-toast';

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
  const { registerWithEmail, loginWithGoogle } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();

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
      
      // Store registration data to display on verification screen
      setRegisteredEmail(data.email);
      
      // Register with Firebase
      await registerWithEmail(
        data.email,
        data.password,
        data.fullName,
        data.role
      );
      
      // Show verification screen
      setRegistrationComplete(true);
      
      toast({
        title: "Account created",
        description: "Please verify your email to continue",
      });
      
    } catch (error) {
      // Error handling is done in FirebaseAuthContext
      toast({
        title: "Registration failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendVerification = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      });
    } catch (error) {
      toast({
        title: "Failed to send verification email",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'job_seeker' | 'employer');
    form.setValue('role', value as 'job_seeker' | 'employer');
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Pass the currently selected role tab to the Google sign-in function
      await loginWithGoogle(activeTab);
      navigate('/');
    } catch (error) {
      // Error handling is done in FirebaseAuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - Business In Rwanda</title>
        <meta name="description" content="Create an account on Business In Rwanda to find your dream job or post job opportunities for your company." />
        <meta property="og:title" content="Register - Business In Rwanda" />
        <meta property="og:description" content="Create an account on Business In Rwanda to find your dream job or post job opportunities for your company." />
      </Helmet>

      <div className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {!registrationComplete ? (
              // Registration Form
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
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                        onClick={handleGoogleSignIn}
                        type="button"
                        disabled={isLoading}
                      >
                        <FcGoogle className="h-5 w-5 mr-2" />
                        <span className="md:text-sm">Continue with Google</span>
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
            ) : (
              // Email Verification Screen
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
                  <CardDescription className="text-center">
                    We've sent a verification link to your email address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-6">
                    <div className="bg-blue-50 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">Check your inbox</h3>
                    <p className="text-neutral-600 mb-1">
                      We've sent a verification email to:
                    </p>
                    <p className="font-medium text-neutral-800 mb-4">
                      {registeredEmail}
                    </p>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 mb-4">
                      <p>
                        Click the link in the email to verify your account and get started.
                        If you don't see the email, check your spam folder.
                      </p>
                    </div>
                    
                    {!verificationSent ? (
                      <div className="mt-4">
                        <p className="text-neutral-600 text-sm mb-2">Didn't receive the email?</p>
                        <Button 
                          variant="outline" 
                          onClick={resendVerification}
                          disabled={isLoading}
                          className="mt-2"
                        >
                          {isLoading ? "Sending..." : "Resend verification email"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-green-600 gap-1 mt-4">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Verification email sent!</span>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => navigate('/')}
                      >
                        Go to homepage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-neutral-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-xl font-semibold mb-4">Why Join Business In Rwanda?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-2">For Job Seekers</h4>
              <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                <li>Access to top jobs from Rwanda's best employers</li>
                <li>Easy application process with profile tracking</li>
                <li>Career resources and skill development tools</li>
                <li>Job alerts tailored to your skills and preferences</li>
              </ul>
            </div>
            
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-2">For Employers</h4>
              <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                <li>Connect with qualified talent quickly and efficiently</li>
                <li>Showcase your company culture and benefits</li>
                <li>Streamlined candidate screening and management</li>
                <li>Insights and analytics on your recruitment process</li>
              </ul>
            </div>
            
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium mb-2">Community Benefits</h4>
              <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                <li>Support Rwanda's economic development</li>
                <li>Connect with industry professionals and peers</li>
                <li>Stay informed about market trends and opportunities</li>
                <li>Participate in events, workshops, and networking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;