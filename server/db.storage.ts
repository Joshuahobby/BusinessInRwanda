import { 
  users, type User, type InsertUser,
  companies, type Company, type InsertCompany,
  jobSeekerProfiles, type JobSeekerProfile, type InsertJobSeekerProfile,
  jobs, type Job, type InsertJob,
  applications, type Application, type InsertApplication,
  categories, type Category, type InsertCategory,
} from "@shared/schema";
import { JobSearchParams } from "@/lib/types";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, like, and, or, SQL, ilike, asc, desc, inArray, sql } from "drizzle-orm";
import crypto from "crypto";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Make sure we have an ID (from Replit auth) or generate one
    const userDataWithId = {
      ...userData,
      id: userData.id || crypto.randomUUID(),
      updatedAt: new Date()
    };
    
    const [user] = await db.insert(users).values(userDataWithId).returning();
    return user;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { id: userId, ...updateData } = userData;
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        ...(updateData.profilePicture !== undefined && { profilePicture: updateData.profilePicture }),
        ...(updateData.fullName !== undefined && { fullName: updateData.fullName }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.bio !== undefined && { bio: updateData.bio }),
        ...(updateData.location !== undefined && { location: updateData.location }),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async upsertUser(userData: { id: string, email?: string | null, firstName?: string | null, lastName?: string | null, profileImageUrl?: string | null }): Promise<User> {
    // Create fullName from firstName and lastName if available
    const fullName = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName || 'User';
    
    const userDataToUpsert = {
      id: userData.id,
      email: userData.email || null,
      fullName,
      profilePicture: userData.profileImageUrl || null,
      role: 'job_seeker', // Default role for social login users
      updatedAt: new Date()
    };
    
    // Try to update the user first, if not exists, insert
    const [user] = await db
      .insert(users)
      .values({
        ...userDataToUpsert,
        password: null, // Social login users don't have passwords
        createdAt: new Date()
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userDataToUpsert,
          updatedAt: new Date()
        }
      })
      .returning();
      
    return user;
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
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
  async getJobSeekerProfile(userId: string): Promise<JobSeekerProfile | undefined> {
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
    // In a real app, you would have a "featured" flag in the database
    // Here we'll just return the most recently created jobs
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt))
      .limit(6);
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
}