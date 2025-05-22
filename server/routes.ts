import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as crypto from "crypto";
import session from "express-session";
import { setupSocialAuth, getSessionConfig } from "./socialAuth";
import { setupFirebaseRoutes } from "./firebase-routes";
import { setupAdminRoutes } from "./admin-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware with PostgreSQL
  app.use(session(getSessionConfig()));

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Set up static file serving for uploaded files
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  
  // Setup Social Authentication with Google and LinkedIn
  setupSocialAuth(app);
  
  // Setup Firebase Authentication
  setupFirebaseRoutes(app);
  
  // Setup Admin Routes
  setupAdminRoutes(app);

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }

          // Verify password (simple hash verification)
          const passwordHash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
          
          if (passwordHash !== user.password) {
            return done(null, false, { message: "Incorrect password" });
          }

          // Remove password from user object before returning
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Cache user data to reduce database calls
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized: Please log in" });
  };

  const isEmployer = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "employer") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Employer access required" });
  };

  const isJobSeeker = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "job_seeker") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Job seeker access required" });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
  };

  // ===== AUTH ROUTES =====
  
  // Register a new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, role, fullName, phone } = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Hash password
      const passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      
      // Create user
      const newUser = await storage.createUser({
        email,
        password: passwordHash,
        role,
        fullName,
        phone,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Login route
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  // Social login routes were configured in socialAuth.ts

  // Firebase authentication endpoint
  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { email, fullName, profilePicture, role = 'job_seeker' } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Missing required auth data' });
      }
      
      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      // Create user if doesn't exist
      if (!user) {
        user = await storage.createUser({
          email,
          password: '', // Firebase handles auth, so no password needed
          fullName: fullName || email.split('@')[0],
          role,
          profilePicture
        });
      }
      
      // Log user in (establish session)
      req.login(user, (err) => {
        if (err) {
          console.error('Firebase login error:', err);
          return res.status(500).json({ message: 'Error logging in' });
        }
        return res.status(200).json(user);
      });
    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json(null);
    }
  });

  // ===== CATEGORIES ROUTES =====
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== JOBS ROUTES =====
  
  // Get featured jobs
  app.get("/api/jobs/featured", async (req, res) => {
    try {
      const featuredJobs = await storage.getFeaturedJobs();
      res.json(featuredJobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const { keyword, location, category, jobType, experienceLevel } = req.query as {
        [key: string]: string | undefined;
      };
      
      const jobs = await storage.searchJobs({
        keyword,
        location,
        category,
        jobType: jobType as any,
        experienceLevel: experienceLevel as any,
      });
      
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a job (employer only)
  app.post("/api/jobs", isEmployer, async (req, res) => {
    try {
      const jobData = req.body;
      
      // Ensure the company belongs to the current user
      const company = await storage.getCompany(jobData.companyId);
      if (!company || company.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "You can only post jobs for your own company" });
      }
      
      const newJob = await storage.createJob(jobData);
      res.status(201).json(newJob);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Apply for a job (job seeker only)
  app.post("/api/jobs/:id/apply", isJobSeeker, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if already applied
      const existingApplication = await storage.getApplicationByUserAndJob(userId, jobId);
      if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      
      const application = await storage.createApplication({
        jobId,
        userId,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl,
        status: "applied",
      });
      
      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Register interest for announcements or auctions
  app.post("/api/jobs/:id/interest", isJobSeeker, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Check if opportunity exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      // Create interest record (we'll add this to storage later)
      const interestData = {
        jobId,
        userId,
        message: req.body.message,
        contactPreference: req.body.contactPreference || 'email',
        notifyUpdates: req.body.notifyUpdates !== false,
      };
      
      // For now, create a simple application record with special status
      const application = await storage.createApplication({
        jobId,
        userId,
        coverLetter: req.body.message || `Interest registered for ${job.postType}`,
        resumeUrl: req.body.documentsUrl,
        status: "applied",
      });
      
      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit proposal for tenders
  app.post("/api/jobs/:id/proposal", isJobSeeker, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Check if tender exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      if (job.postType !== 'tender') {
        return res.status(400).json({ message: "This endpoint is only for tender proposals" });
      }
      
      // Create proposal as application for now
      const application = await storage.createApplication({
        jobId,
        userId,
        coverLetter: `${req.body.proposalTitle}\n\n${req.body.proposalDescription}\n\n${req.body.coverLetter || ''}`,
        resumeUrl: req.body.documentsUrl,
        status: "applied",
      });
      
      res.status(201).json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== COMPANY ROUTES =====
  
  // Get featured companies
  app.get("/api/companies/featured", async (req, res) => {
    try {
      const featuredCompanies = await storage.getFeaturedCompanies();
      res.json(featuredCompanies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get company by ID
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompanyWithJobs(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create/update company profile (employer only)
  app.post("/api/companies", isEmployer, async (req, res) => {
    try {
      const companyData = req.body;
      const userId = (req.user as any).id;
      
      // Check if company already exists for this user
      const existingCompany = await storage.getCompanyByUserId(userId);
      
      let company;
      if (existingCompany) {
        // Update existing company
        company = await storage.updateCompany(existingCompany.id, {
          ...companyData,
          userId,
        });
      } else {
        // Create new company
        company = await storage.createCompany({
          ...companyData,
          userId,
        });
      }
      
      res.status(201).json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== EMPLOYER DASHBOARD ROUTES =====
  
  // Get employer's company profile
  app.get("/api/employer/company", isEmployer, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(404).json(null);
      }
      
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get employer's jobs
  app.get("/api/employer/jobs", isEmployer, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.json([]);
      }
      
      const jobs = await storage.getJobsByCompanyId(company.id);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get applications for employer's jobs
  app.get("/api/employer/applications", isEmployer, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.json([]);
      }
      
      const applications = await storage.getApplicationsByCompanyId(company.id);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== JOB SEEKER DASHBOARD ROUTES =====
  
  // Get job seeker profile
  app.get("/api/jobseeker/profile", isJobSeeker, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const profile = await storage.getJobSeekerProfile(userId);
      
      if (!profile) {
        return res.status(404).json(null);
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create/update job seeker profile
  app.post("/api/jobseeker/profile", isJobSeeker, async (req, res) => {
    try {
      const profileData = req.body;
      const userId = (req.user as any).id;
      
      // Check if profile already exists
      const existingProfile = await storage.getJobSeekerProfile(userId);
      
      let profile;
      if (existingProfile) {
        // Update existing profile
        profile = await storage.updateJobSeekerProfile(existingProfile.id, {
          ...profileData,
          userId,
        });
      } else {
        // Create new profile
        profile = await storage.createJobSeekerProfile({
          ...profileData,
          userId,
        });
      }
      
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get job seeker's applications
  app.get("/api/jobseeker/applications", isJobSeeker, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const applications = await storage.getApplicationsByUserId(userId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get recommended jobs for job seeker
  app.get("/api/jobseeker/recommended-jobs", isJobSeeker, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const recommendedJobs = await storage.getRecommendedJobs(userId);
      res.json(recommendedJobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes are defined below

  // Admin routes
  
  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // In a real implementation, we would add pagination
      const users = await storage.getAllUsers();
      
      // Remove sensitive data
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user by ID
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user (admin can change roles, status, etc.) - PATCH for partial updates
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Verify user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update user completely - PUT for full updates from admin panel
  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Verify user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Preserve fields that shouldn't be updated via this endpoint
      const protectedData = {
        id: existingUser.id,
        password: existingUser.password,
        firebaseUid: existingUser.firebaseUid,
        createdAt: existingUser.createdAt
      };
      
      // Update user with merged data
      const updatedUser = await storage.updateUser(userId, {
        ...userData,
        ...protectedData
      });
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all jobs (with filtering options)
  app.get("/api/admin/jobs", isAdmin, async (req, res) => {
    try {
      // In a production app, this would use query params for filtering
      const jobs = await storage.searchJobs({});
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update job status (approve, reject, feature, etc.)
  app.patch("/api/admin/jobs/:id", isAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const jobData = req.body;
      
      // Verify job exists
      const existingJob = await storage.getJob(jobId);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Update job
      const updatedJob = await storage.updateJob(jobId, {
        ...existingJob,
        ...jobData
      });
      res.json(updatedJob);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all companies
  app.get("/api/admin/companies", isAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all jobs (admin)
  app.get("/api/admin/jobs", isAdmin, async (req, res) => {
    try {
      const jobs = await storage.getRecentJobs(100); // Get the most recent 100 jobs
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get platform statistics
  app.get("/api/admin/statistics", isAdmin, async (req, res) => {
    try {
      // This would calculate various platform statistics
      // For now, we'll return mock data
      const stats = {
        totalUsers: await storage.getUserCount(),
        totalJobs: await storage.getJobCount(),
        totalCompanies: await storage.getCompanyCount(),
        totalApplications: await storage.getApplicationCount(),
        usersByRole: await storage.getUserCountByRole(),
        recentJobs: await storage.getRecentJobs(5),
        recentApplications: await storage.getRecentApplications(5)
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
