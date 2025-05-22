import { Route, Switch, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider } from "@/context/FirebaseAuthContext";
import { HelmetProvider } from "react-helmet-async";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Opportunities from "@/pages/Opportunities";
import JobDetail from "@/pages/JobDetail";
import EmployerDashboard from "@/pages/EmployerDashboard";
import JobSeekerDashboard from "@/pages/JobSeekerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PostJob from "@/pages/PostJob";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import CompanyProfile from "@/pages/CompanyProfile";
import Employers from "@/pages/Employers";
import Resources from "@/pages/Resources";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/opportunities" component={Opportunities} />
          <Route path="/job/:id" component={JobDetail} />
          <Route path="/tender/:id" component={JobDetail} />
          <Route path="/auction/:id" component={JobDetail} />
          <Route path="/announcement/:id" component={JobDetail} />
          <Route path="/employer/dashboard" component={EmployerDashboard} />
          <Route path="/jobseeker/dashboard" component={JobSeekerDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/post-job" component={PostJob} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/company/:id" component={CompanyProfile} />
          <Route path="/employers" component={Employers} />
          <Route path="/resources" component={Resources} />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FirebaseAuthProvider>
            <Toaster />
            <AppRoutes />
          </FirebaseAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;