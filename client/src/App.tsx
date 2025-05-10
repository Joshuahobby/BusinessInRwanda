import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FindJobs from "@/pages/FindJobs";
import JobDetail from "@/pages/JobDetail";
import EmployerDashboard from "@/pages/EmployerDashboard";
import JobSeekerDashboard from "@/pages/JobSeekerDashboard";
import PostJob from "@/pages/PostJob";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import CompanyProfile from "@/pages/CompanyProfile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/find-jobs" component={FindJobs} />
          <Route path="/job/:id" component={JobDetail} />
          <Route path="/employer/dashboard" component={EmployerDashboard} />
          <Route path="/jobseeker/dashboard" component={JobSeekerDashboard} />
          <Route path="/post-job" component={PostJob} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/company/:id" component={CompanyProfile} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
