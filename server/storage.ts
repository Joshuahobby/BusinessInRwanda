import { 
  users, type User, type InsertUser,
  companies, type Company, type InsertCompany,
  jobSeekerProfiles, type JobSeekerProfile, type InsertJobSeekerProfile,
  jobs, type Job, type InsertJob,
  applications, type Application, type InsertApplication,
  categories, type Category, type InsertCategory,
  userRoleEnum, jobTypeEnum, experienceLevelEnum, applicationStatusEnum
} from "@shared/schema";
import { JobSearchParams } from "@/lib/types";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  getCompanyWithJobs(id: number): Promise<(Company & { jobs: Job[] }) | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: InsertCompany): Promise<Company>;
  getFeaturedCompanies(): Promise<Company[]>;
  
  // Job seeker profile operations
  getJobSeekerProfile(userId: number): Promise<JobSeekerProfile | undefined>;
  createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<JobSeekerProfile>;
  updateJobSeekerProfile(id: number, profile: InsertJobSeekerProfile): Promise<JobSeekerProfile>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobsByCompanyId(companyId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: InsertJob): Promise<Job>;
  searchJobs(params: JobSearchParams): Promise<Job[]>;
  getFeaturedJobs(): Promise<Job[]>;
  getRecommendedJobs(userId: number): Promise<Job[]>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationByUserAndJob(userId: number, jobId: number): Promise<Application | undefined>;
  getApplicationsByUserId(userId: number): Promise<Application[]>;
  getApplicationsByCompanyId(companyId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Category operations
  getAllCategories(): Promise<(Category & { count: number })[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private companiesData: Map<number, Company>;
  private jobSeekerProfilesData: Map<number, JobSeekerProfile>;
  private jobsData: Map<number, Job>;
  private applicationsData: Map<number, Application>;
  private categoriesData: Map<number, Category>;
  
  private userIdCounter: number;
  private companyIdCounter: number;
  private profileIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private categoryIdCounter: number;
  
  constructor() {
    this.usersData = new Map();
    this.companiesData = new Map();
    this.jobSeekerProfilesData = new Map();
    this.jobsData = new Map();
    this.applicationsData = new Map();
    this.categoriesData = new Map();
    
    this.userIdCounter = 1;
    this.companyIdCounter = 1;
    this.profileIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
    this.categoryIdCounter = 1;
    
    // Initialize with some categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const categoriesList = [
      { name: "Information Technology", icon: "computer" },
      { name: "Finance & Banking", icon: "attach_money" },
      { name: "Management & Admin", icon: "business" },
      { name: "Healthcare", icon: "health_and_safety" },
      { name: "Education & Training", icon: "school" },
      { name: "Engineering", icon: "engineering" },
      { name: "Marketing & Sales", icon: "campaign" },
      { name: "Agriculture", icon: "agriculture" }
    ];
    
    categoriesList.forEach(cat => {
      const id = this.categoryIdCounter++;
      this.categoriesData.set(id, {
        id,
        name: cat.name,
        icon: cat.icon
      });
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      createdAt: now
    };
    this.usersData.set(id, user);
    return user;
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companiesData.get(id);
  }
  
  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    return Array.from(this.companiesData.values()).find(company => 
      company.userId === userId
    );
  }
  
  async getCompanyWithJobs(id: number): Promise<(Company & { jobs: Job[] }) | undefined> {
    const company = this.companiesData.get(id);
    if (!company) return undefined;
    
    const companyJobs = Array.from(this.jobsData.values()).filter(job => 
      job.companyId === id
    );
    
    return {
      ...company,
      jobs: companyJobs
    };
  }
  
  async createCompany(companyData: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const company: Company = {
      id,
      ...companyData
    };
    this.companiesData.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, companyData: InsertCompany): Promise<Company> {
    const existingCompany = this.companiesData.get(id);
    if (!existingCompany) {
      throw new Error("Company not found");
    }
    
    const updatedCompany: Company = {
      ...existingCompany,
      ...companyData
    };
    this.companiesData.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async getFeaturedCompanies(): Promise<Company[]> {
    // In a real DB, we'd have a featured flag or some algorithm to determine featured companies
    // For now, just return all companies, limited to 5
    return Array.from(this.companiesData.values()).slice(0, 5);
  }
  
  // Job seeker profile operations
  async getJobSeekerProfile(userId: number): Promise<JobSeekerProfile | undefined> {
    return Array.from(this.jobSeekerProfilesData.values()).find(profile => 
      profile.userId === userId
    );
  }
  
  async createJobSeekerProfile(profileData: InsertJobSeekerProfile): Promise<JobSeekerProfile> {
    const id = this.profileIdCounter++;
    const profile: JobSeekerProfile = {
      id,
      ...profileData
    };
    this.jobSeekerProfilesData.set(id, profile);
    return profile;
  }
  
  async updateJobSeekerProfile(id: number, profileData: InsertJobSeekerProfile): Promise<JobSeekerProfile> {
    const existingProfile = this.jobSeekerProfilesData.get(id);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }
    
    const updatedProfile: JobSeekerProfile = {
      ...existingProfile,
      ...profileData
    };
    this.jobSeekerProfilesData.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobsData.get(id);
  }
  
  async getJobsByCompanyId(companyId: number): Promise<Job[]> {
    return Array.from(this.jobsData.values()).filter(job => 
      job.companyId === companyId
    );
  }
  
  async createJob(jobData: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const now = new Date();
    const job: Job = {
      id,
      ...jobData,
      createdAt: now
    };
    this.jobsData.set(id, job);
    return job;
  }
  
  async updateJob(id: number, jobData: InsertJob): Promise<Job> {
    const existingJob = this.jobsData.get(id);
    if (!existingJob) {
      throw new Error("Job not found");
    }
    
    const updatedJob: Job = {
      ...existingJob,
      ...jobData
    };
    this.jobsData.set(id, updatedJob);
    return updatedJob;
  }
  
  async searchJobs(params: JobSearchParams): Promise<Job[]> {
    let jobs = Array.from(this.jobsData.values()).filter(job => job.isActive);
    
    // Apply filters if provided
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword) ||
        (job.requirements && job.requirements.toLowerCase().includes(keyword))
      );
    }
    
    if (params.location) {
      const location = params.location.toLowerCase();
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(location)
      );
    }
    
    if (params.category) {
      jobs = jobs.filter(job => 
        job.category === params.category
      );
    }
    
    if (params.jobType) {
      jobs = jobs.filter(job => 
        job.type === params.jobType
      );
    }
    
    if (params.experienceLevel) {
      jobs = jobs.filter(job => 
        job.experienceLevel === params.experienceLevel
      );
    }
    
    // Sort by creation date (newest first)
    jobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return jobs;
  }
  
  async getFeaturedJobs(): Promise<Job[]> {
    // In a real DB, we'd have a featured flag
    // For now, just return active jobs, limited to 6, newest first
    const activeJobs = Array.from(this.jobsData.values())
      .filter(job => job.isActive)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    return activeJobs.slice(0, 6);
  }
  
  async getRecommendedJobs(userId: number): Promise<Job[]> {
    // In a real system, this would use an algorithm based on user skills and preferences
    // For now, just return active jobs that the user hasn't applied to
    const profile = await this.getJobSeekerProfile(userId);
    const userApplications = await this.getApplicationsByUserId(userId);
    const appliedJobIds = userApplications.map(app => app.jobId);
    
    let recommendedJobs = Array.from(this.jobsData.values())
      .filter(job => job.isActive && !appliedJobIds.includes(job.id));
    
    // Sort by match with user skills if profile exists
    if (profile && profile.skills && profile.skills.length > 0) {
      recommendedJobs.sort((a, b) => {
        const textA = `${a.title} ${a.description} ${a.requirements}`.toLowerCase();
        const textB = `${b.title} ${b.description} ${b.requirements}`.toLowerCase();
        
        let scoreA = 0;
        let scoreB = 0;
        
        profile.skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (textA.includes(skillLower)) scoreA++;
          if (textB.includes(skillLower)) scoreB++;
        });
        
        return scoreB - scoreA;
      });
    }
    
    return recommendedJobs.slice(0, 10);
  }
  
  // Application operations
  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const application: Application = {
      id,
      ...applicationData,
      appliedAt: now,
      updatedAt: now
    };
    this.applicationsData.set(id, application);
    return application;
  }
  
  async getApplicationByUserAndJob(userId: number, jobId: number): Promise<Application | undefined> {
    return Array.from(this.applicationsData.values()).find(app => 
      app.userId === userId && app.jobId === jobId
    );
  }
  
  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    // Get all applications for this user
    const userApplications = Array.from(this.applicationsData.values())
      .filter(app => app.userId === userId);
    
    // Enhance with job details
    return userApplications.map(app => {
      const job = this.jobsData.get(app.jobId);
      const company = job ? this.companiesData.get(job.companyId) : undefined;
      
      return {
        ...app,
        job: {
          ...job!,
          company: {
            id: company?.id || 0,
            name: company?.name || "Unknown Company",
            logo: company?.logo
          }
        }
      } as any;
    });
  }
  
  async getApplicationsByCompanyId(companyId: number): Promise<Application[]> {
    // Get all jobs for this company
    const companyJobs = Array.from(this.jobsData.values())
      .filter(job => job.companyId === companyId);
    
    const companyJobIds = companyJobs.map(job => job.id);
    
    // Get all applications for these jobs
    const applications = Array.from(this.applicationsData.values())
      .filter(app => companyJobIds.includes(app.jobId));
    
    // Enhance with applicant and job details
    return applications.map(app => {
      const job = this.jobsData.get(app.jobId);
      const user = this.usersData.get(app.userId);
      
      return {
        ...app,
        job: job!,
        applicant: {
          id: user?.id || 0,
          fullName: user?.fullName || "Unknown User",
          email: user?.email || "",
          profilePicture: user?.profilePicture
        }
      } as any;
    });
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const application = this.applicationsData.get(id);
    if (!application) {
      throw new Error("Application not found");
    }
    
    const updatedApplication: Application = {
      ...application,
      status: status as any,
      updatedAt: new Date()
    };
    
    this.applicationsData.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Category operations
  async getAllCategories(): Promise<(Category & { count: number })[]> {
    const categories = Array.from(this.categoriesData.values());
    
    // Count jobs in each category
    return categories.map(category => {
      const count = Array.from(this.jobsData.values())
        .filter(job => job.isActive && job.category === category.name)
        .length;
      
      return {
        ...category,
        count
      };
    });
  }
}

export const storage = new MemStorage();
