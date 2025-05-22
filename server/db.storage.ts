import { 
  users, type User, type InsertUser,
  companies, type Company, type InsertCompany,
  jobSeekerProfiles, type JobSeekerProfile, type InsertJobSeekerProfile,
  jobs, type Job, type InsertJob,
  applications, type Application, type InsertApplication,
  categories, type Category, type InsertCategory,
  userRoleEnum
} from "@shared/schema";
import { JobSearchParams } from "@/lib/types";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, like, and, or, desc, sql, count } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async getCompanyWithJobs(id: number): Promise<(Company & { jobs: Job[] }) | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const jobsList = await db.select().from(jobs).where(eq(jobs.companyId, id));
    return { ...company, jobs: jobsList };
  }

  async createCompany(companyData: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(companyData).returning();
    return company;
  }

  async updateCompany(id: number, companyData: InsertCompany): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(companyData)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async getFeaturedCompanies(): Promise<Company[]> {
    // For demonstration, just return first 5 companies
    // In a real app, you would have a "featured" flag
    return await db.select().from(companies).limit(5);
  }

  // Job seeker profile operations
  async getJobSeekerProfile(userId: number): Promise<JobSeekerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, userId));
    return profile;
  }

  async createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<JobSeekerProfile> {
    const [jobSeekerProfile] = await db
      .insert(jobSeekerProfiles)
      .values(profile)
      .returning();
    return jobSeekerProfile;
  }

  async updateJobSeekerProfile(
    id: number,
    profile: InsertJobSeekerProfile
  ): Promise<JobSeekerProfile> {
    const [updatedProfile] = await db
      .update(jobSeekerProfiles)
      .set(profile)
      .where(eq(jobSeekerProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobsByCompanyId(companyId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.companyId, companyId));
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(jobData).returning();
    return job;
  }

  async updateJob(id: number, jobData: InsertJob): Promise<Job> {
    const [job] = await db.update(jobs).set(jobData).where(eq(jobs.id, id)).returning();
    return job;
  }

  async searchJobs(params: JobSearchParams): Promise<Job[]> {
    const { keyword, location, category, jobType, experienceLevel } = params;

    let conditions = [];

    if (keyword) {
      conditions.push(
        or(
          like(jobs.title, `%${keyword}%`),
          like(jobs.description, `%${keyword}%`),
          like(jobs.requirements, `%${keyword}%`)
        )
      );
    }

    if (location) {
      conditions.push(like(jobs.location, `%${location}%`));
    }

    if (category) {
      conditions.push(eq(jobs.category, category));
    }

    if (jobType) {
      conditions.push(eq(jobs.type, jobType));
    }

    if (experienceLevel) {
      conditions.push(eq(jobs.experienceLevel, experienceLevel));
    }

    // Active jobs only
    conditions.push(eq(jobs.isActive, true));

    const query = conditions.length > 0
      ? db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt))
      : db.select().from(jobs).where(eq(jobs.isActive, true)).orderBy(desc(jobs.createdAt));

    return await query;
  }

  async getFeaturedJobs(): Promise<Job[]> {
    // Get featured jobs
    const featuredJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.isFeatured, true))
      .orderBy(desc(jobs.createdAt))
      .limit(6);
      
    // Make sure company names are available
    const enhancedJobs = await Promise.all(featuredJobs.map(async (job) => {
      // If company name is already set, use it
      if (job.companyName) {
        return job;
      }
      
      // Otherwise, fetch the company name
      try {
        const company = await this.getCompany(job.companyId);
        return {
          ...job,
          companyName: company?.name || "Unknown Company"
        };
      } catch (error) {
        return {
          ...job,
          companyName: "Unknown Company"
        };
      }
    }));
    
    return enhancedJobs;
  }

  async getRecommendedJobs(userId: number): Promise<Job[]> {
    // Get the user's job seeker profile
    const [profile] = await db
      .select()
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, userId));

    if (!profile || !profile.skills || profile.skills.length === 0) {
      // If no profile or skills, return recent jobs
      return await this.getFeaturedJobs();
    }

    // In a real app, you would do more complex matching based on skills
    // For now, we'll just filter by similar title if available
    if (profile.title) {
      const titleKeywords = profile.title.split(' ');
      const likeConditions = titleKeywords.map(keyword => 
        like(jobs.title, `%${keyword}%`)
      );
      
      return await db
        .select()
        .from(jobs)
        .where(and(eq(jobs.isActive, true), or(...likeConditions)))
        .orderBy(desc(jobs.createdAt))
        .limit(6);
    }

    // Fallback to featured jobs
    return await this.getFeaturedJobs();
  }

  // Application operations
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values({
        ...applicationData,
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return application;
  }

  async getApplicationByUserAndJob(userId: number, jobId: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.jobId, jobId)));
    return application;
  }

  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplicationsByCompanyId(companyId: number): Promise<Application[]> {
    const jobsQuery = db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.companyId, companyId));

    const jobIds = (await jobsQuery).map(j => j.id);

    if (jobIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(applications)
      .where(sql`${applications.jobId} IN (${jobIds.join(',')})`)
      .orderBy(desc(applications.appliedAt));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Category operations
  async getAllCategories(): Promise<(Category & { count: number })[]> {
    // First get all categories
    const categoriesData = await db.select().from(categories);
    
    // For each category, count the number of jobs
    const categoriesWithCount = await Promise.all(
      categoriesData.map(async (category) => {
        const jobsCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(and(
            eq(jobs.category, category.name),
            eq(jobs.isActive, true)
          ));
        
        return {
          ...category,
          count: jobsCount[0]?.count || 0
        };
      })
    );
    
    return categoriesWithCount;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(companies.name);
  }

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }

  async getJobCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(jobs);
    return result[0].count;
  }

  async getCompanyCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(companies);
    return result[0].count;
  }

  async getApplicationCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(applications);
    return result[0].count;
  }

  async getUserCountByRole(): Promise<{role: string, count: number}[]> {
    const result = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role);
    
    return result;
  }

  async getRecentJobs(limit: number): Promise<Job[]> {
    const recentJobs = await db.select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
    
    // Enhance with company information
    const enhancedJobs = await Promise.all(recentJobs.map(async (job) => {
      try {
        const company = await this.getCompany(job.companyId);
        return {
          ...job,
          companyName: company?.name || "Unknown Company"
        };
      } catch (error) {
        return {
          ...job,
          companyName: "Unknown Company"
        };
      }
    }));
    
    return enhancedJobs;
  }

  async getRecentApplications(limit: number): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .orderBy(desc(applications.appliedAt))
      .limit(limit);
  }
}