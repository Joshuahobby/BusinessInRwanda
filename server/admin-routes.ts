import { Request, Response, Express, NextFunction } from "express";
import { storage } from "./storage";
import { Job, insertJobSchema } from "@shared/schema";

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
      const userCount = await storage.getUserCount();
      const jobCount = await storage.getJobCount();
      const companyCount = await storage.getCompanyCount();
      const applicationCount = await storage.getApplicationCount();
      const usersByRole = await storage.getUserCountByRole();
      const recentJobs = await storage.getRecentJobs(5);
      const recentApplications = await storage.getRecentApplications(5);
      
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
      // For now just get all jobs, could add filtering later
      const jobs = await storage.searchJobs({});
      
      // Enhance jobs with company information
      const enhancedJobs = await Promise.all(jobs.map(async (job) => {
        try {
          const company = await storage.getCompany(job.companyId);
          return {
            ...job,
            companyName: company?.name || "Unknown Company"
          };
        } catch (e) {
          return {
            ...job,
            companyName: "Unknown Company"
          };
        }
      }));
      
      res.json(enhancedJobs);
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
}