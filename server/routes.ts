import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as crypto from "crypto";
import session from "express-session";
import { setupSocialAuth, getSessionConfig } from "./socialAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware with PostgreSQL
  app.use(session(getSessionConfig()));

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup Social Authentication with Google and LinkedIn
  setupSocialAuth(app);

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
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
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

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
