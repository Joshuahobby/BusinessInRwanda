import { Request, Response, Express, NextFunction } from "express";
import { storage } from "./storage";
import { Job, jobs, insertJobSchema } from "@shared/schema";
import { desc } from "drizzle-orm";
import { db } from "./db";

// Define a type for user with the properties we need
interface AuthUser {
  id: number;
  role: string;
  email: string;
}

// Middleware to check if user is admin
const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || (req.user as AuthUser).role !== 'admin') {
    return res.status(403).json({ 
      message: "Access denied. Admin role required."
    });
  }
  next();
};

export function setupAdminRoutes(app: Express) {
  // Add admin middleware protection to all admin routes
  app.use('/api/admin/*', requireAdminRole);
  
  // Get admin dashboard statistics
  app.get('/api/admin/statistics', async (req: Request, res: Response) => {
    try {
      // Get basic statistics
      const [
        userCount,
        jobCount,
        companyCount,
        applicationCount,
        usersByRole
      ] = await Promise.all([
        storage.getUserCount(),
        storage.getJobCount(),
        storage.getCompanyCount(),
        storage.getApplicationCount(),
        storage.getUserCountByRole()
      ]);
      
      // For recent jobs, handle directly to avoid company_name issues
      let recentJobs = [];
      try {
        const jobResults = await db.select()
          .from(jobs)
          .orderBy(desc(jobs.createdAt))
          .limit(5);
          
        // Add company name through manual lookup
        recentJobs = await Promise.all(jobResults.map(async (job) => {
          const company = await storage.getCompany(job.companyId);
          return {
            ...job,
            companyName: company?.name || "Unknown Company"
          };
        }));
      } catch (error) {
        console.error("Error fetching recent jobs:", error);
        recentJobs = [];
      }
      
      // Get recent applications
      let recentApplications = [];
      try {
        recentApplications = await storage.getRecentApplications(5);
      } catch (error) {
        console.error("Error fetching recent applications:", error);
        recentApplications = [];
      }
      
      res.json({
        totalUsers: userCount,
        totalJobs: jobCount,
        totalCompanies: companyCount,
        totalApplications: applicationCount,
        usersByRole,
        recentJobs,
        recentApplications
      });
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });
  
  // Get all users for admin management
  app.get('/api/admin/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive info like password before sending
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Create a new user (admin only)
  app.post('/api/admin/users', async (req: Request, res: Response) => {
    try {
      const { email, fullName, role, password } = req.body;
      
      if (!email || !fullName || !role) {
        return res.status(400).json({ message: "Missing required fields: email, fullName, and role are required" });
      }
      
      // Create the user
      const user = await storage.createUser({
        email,
        fullName,
        role,
        password: password || null,
        firebaseUid: null,
        phone: null,
        profilePicture: null,
        bio: null,
        location: null,
      });
      
      // Remove sensitive info before sending response
      const { password: _, ...sanitizedUser } = user;
      
      res.status(201).json(sanitizedUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update user (admin only)
  app.patch('/api/admin/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      
      // Prevent changing own role for security
      if ((req.user as AuthUser).id === userId && req.body.role && req.body.role !== (req.user as AuthUser).role) {
        return res.status(403).json({ message: "You cannot change your own admin role" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Remove sensitive info before sending response
      const { password, ...sanitizedUser } = updatedUser;
      
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Get all jobs for admin management
  app.get('/api/admin/jobs', async (req: Request, res: Response) => {
    try {
      // Use storage method that already handles company name enhancement
      const allJobs = await storage.getRecentJobs(100); // Get up to 100 recent jobs
      res.json(allJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  
  // Update job (admin only)
  app.patch('/api/admin/jobs/:id', async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Process the update payload
      const updateData: any = { ...req.body };
      
      // Handle isActive field for backward compatibility with our UI
      if (typeof updateData.isActive !== 'undefined') {
        updateData.status = updateData.isActive ? 'approved' : 'rejected';
        delete updateData.isActive;
      }
      
      // Handle isFeatured field for featured jobs
      if (typeof updateData.isFeatured !== 'undefined') {
        updateData.featured = updateData.isFeatured;
        delete updateData.isFeatured;
      }
      
      // Apply admin notes if provided
      if (updateData.adminNotes) {
        updateData.adminNotes = updateData.adminNotes;
      }
      
      const updatedJob = await storage.updateJob(jobId, {
        ...job,
        ...updateData
      });
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  
  // Delete job (admin only)
  app.delete('/api/admin/jobs/:id', async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      
      // For now, we'll just mark the job as rejected since we don't have a delete method
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.updateJob(jobId, {
        ...job,
        status: 'rejected',
        adminNotes: job.adminNotes ? `${job.adminNotes} | Marked as deleted by admin` : 'Marked as deleted by admin'
      });
      
      res.status(200).json({ message: "Job successfully deleted" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  
  // Get all companies for admin management
  app.get('/api/admin/companies', async (req: Request, res: Response) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  
  // Create a new company (admin only)
  app.post('/api/admin/companies', async (req: Request, res: Response) => {
    try {
      const { name, industry, location, logo, website, description, employeeCount, founded, userId } = req.body;
      
      if (!name || !industry || !location || !userId) {
        return res.status(400).json({ message: "Missing required fields: name, industry, location, and userId are required" });
      }
      
      // Create the company
      const company = await storage.createCompany({
        name,
        industry,
        location,
        userId,
        logo: logo || null,
        website: website || null,
        description: description || null,
        employeeCount: employeeCount || null,
        founded: founded || null,
      });
      
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });
  
  // Create new post (admin only)
  app.post('/api/admin/jobs', async (req: Request, res: Response) => {
    try {
      // Extract postType from the request body, but keep a copy of the full body for logging
      const { postType, ...postData } = req.body;
      
      console.log("Received job creation request with data:", { 
        postType, 
        hasCompanyId: !!postData.companyId,
      });
      
      // Make sure companyId is a number
      if (typeof postData.companyId === 'string') {
        postData.companyId = parseInt(postData.companyId, 10);
      }
      
      // Handle optional fields that might be empty strings
      if (postData.salary === '') postData.salary = null;
      if (postData.responsibilities === '') postData.responsibilities = null;
      
      // Handle currency with RWF as default if not provided
      if (!postData.currency) postData.currency = 'RWF';
      
      // Add default status
      postData.status = 'pending';
      
      // Validate the incoming data with custom error handling
      try {
        const validationResult = insertJobSchema.safeParse(postData);
        if (!validationResult.success) {
          console.error("Validation failed:", validationResult.error.errors);
          return res.status(400).json({ 
            message: "Invalid job data", 
            errors: validationResult.error.errors 
          });
        }
      } catch (validationError) {
        console.error("Exception during validation:", validationError);
        return res.status(400).json({ 
          message: "Error validating job data", 
          error: validationError.toString()
        });
      }
      
      // Get company information to set companyName
      const company = await storage.getCompany(postData.companyId);
      if (!company) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      // Create the job with additional metadata
      const jobData = {
        ...postData,
        companyName: company.name,
        status: 'pending', // All posts start as pending and need approval
        adminNotes: `Created by admin as ${postType || 'job'}`
      };
      
      console.log("Creating job with data:", JSON.stringify(jobData));
      const newJob = await storage.createJob(jobData);
      
      res.status(201).json(newJob);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });
}