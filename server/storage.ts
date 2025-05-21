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
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  getCompanyWithJobs(id: number): Promise<(Company & { jobs: Job[] }) | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: InsertCompany): Promise<Company>;
  getFeaturedCompanies(): Promise<Company[]>;
  
  // Job seeker profile operations
  getJobSeekerProfile(userId: string): Promise<JobSeekerProfile | undefined>;
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
    
    // Add sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create sample users
    const users = [
      {
        email: "employer@example.com",
        password: "password123",
        fullName: "Jane Smith",
        role: "employer",
        phone: "+250789123456",
        profilePicture: null,
        bio: null,
        location: null
      },
      {
        email: "jobseeker@example.com",
        password: "password123",
        fullName: "John Doe",
        role: "job_seeker",
        phone: "+250722987654",
        profilePicture: null,
        bio: null,
        location: null
      },
      {
        email: "admin@example.com",
        password: "adminpass",
        fullName: "Admin User",
        role: "admin",
        phone: null,
        profilePicture: null,
        bio: null,
        location: null
      }
    ];
    
    users.forEach(userData => {
      const user = {
        id: this.userIdCounter++,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        role: userData.role as any,
        phone: userData.phone,
        profilePicture: userData.profilePicture,
        bio: userData.bio,
        location: userData.location,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000))
      };
      this.usersData.set(user.id, user);
    });
    
    // Create sample companies
    const companies = [
      {
        name: "Kigali Tech Solutions",
        description: "Leading technology solutions provider in Rwanda, focused on digital transformation and software development.",
        userId: 1, // Employer user
        logo: "https://picsum.photos/200",
        website: "https://example.com/kigalitech",
        location: "Kigali",
        industry: "Information Technology",
        employeeCount: "50-200",
        founded: "2015"
      },
      {
        name: "Rwanda Banking Corporation",
        description: "Premier banking institution with 25+ branches across Rwanda providing financial services to individuals and businesses.",
        userId: 1, // Using same employer for demo
        logo: "https://picsum.photos/201",
        website: "https://example.com/rwandabanking",
        location: "Kigali",
        industry: "Finance & Banking",
        employeeCount: "200-500",
        founded: "2005"
      },
      {
        name: "Green Farms Rwanda",
        description: "Sustainable agricultural company focusing on organic farming and agricultural technology solutions.",
        userId: 1, // Using same employer for demo
        logo: "https://picsum.photos/202",
        website: "https://example.com/greenfarms",
        location: "Eastern Province",
        industry: "Agriculture",
        employeeCount: "50-200",
        founded: "2010"
      },
      {
        name: "Rwanda Healthcare Partners",
        description: "Leading healthcare provider with multiple clinics and telehealth solutions across Rwanda.",
        userId: 1, // Using same employer for demo
        logo: "https://picsum.photos/203",
        website: "https://example.com/rwandahealthcare",
        location: "Kigali",
        industry: "Healthcare",
        employeeCount: "100-500",
        founded: "2008"
      },
      {
        name: "Educate Rwanda",
        description: "Educational institution dedicated to providing quality education and skills training for the digital economy.",
        userId: 1, // Using same employer for demo
        logo: "https://picsum.photos/204",
        website: "https://example.com/educaterwanda",
        location: "Kigali",
        industry: "Education & Training",
        employeeCount: "20-100",
        founded: "2012"
      }
    ];
    
    companies.forEach(companyData => {
      const company = {
        id: this.companyIdCounter++,
        ...companyData
      };
      this.companiesData.set(company.id, company);
    });
    
    // Create job seeker profile
    const jobSeekerProfile = {
      userId: 2, // Job seeker user
      title: "Software Developer",
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "Mobile Development"],
      experience: "3 years",
      education: "Bachelor's in Computer Science, University of Rwanda",
      resumeUrl: "https://example.com/resume",
      coverLetterUrl: null
    };
    
    this.jobSeekerProfilesData.set(this.profileIdCounter, {
      id: this.profileIdCounter++,
      ...jobSeekerProfile
    });
    
    // Create sample jobs
    const jobs = [
      {
        title: "Senior Frontend Developer",
        companyId: 1, // Kigali Tech Solutions
        location: "Kigali",
        type: "full_time",
        experienceLevel: "senior",
        category: "Information Technology",
        salary: "$3000-$4000 monthly",
        description: "We are seeking a Senior Frontend Developer to join our growing team in Kigali. The ideal candidate will have strong expertise in React and modern JavaScript frameworks.",
        requirements: "- 4+ years of experience with frontend development\n- Strong proficiency in React, Redux, and TypeScript\n- Experience with responsive design and cross-browser compatibility\n- Excellent problem-solving skills and attention to detail",
        responsibilities: "- Develop responsive web applications using React\n- Collaborate with backend developers on API integration\n- Optimize applications for maximum performance\n- Implement UI/UX designs with precision",
        benefits: "- Competitive salary\n- Health insurance\n- Flexible working hours\n- Professional development opportunities\n- Modern office in central Kigali",
        isActive: true,
        isFeatured: true,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Backend Engineer",
        companyId: 1, // Kigali Tech Solutions
        location: "Kigali",
        type: "full_time",
        experienceLevel: "intermediate",
        category: "Information Technology",
        salary: "$2500-$3500 monthly",
        description: "Join our backend team to build scalable APIs and services that power our growing suite of applications. You'll work with modern technologies in a collaborative environment.",
        requirements: "- 2+ years of experience with backend development\n- Proficiency in Node.js and Express\n- Experience with SQL and NoSQL databases\n- Understanding of RESTful API design principles",
        responsibilities: "- Design and implement RESTful APIs\n- Configure and optimize database schemas\n- Implement authentication and authorization systems\n- Collaborate with frontend developers",
        benefits: "- Competitive salary\n- Health insurance\n- Flexible working hours\n- Professional development budget\n- Team building activities",
        isActive: true,
        isFeatured: true,
        isRemote: true,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Bank Branch Manager",
        companyId: 2, // Rwanda Banking Corporation
        location: "Kigali",
        type: "full_time",
        experienceLevel: "senior",
        category: "Finance & Banking",
        salary: "$4000-$5000 monthly",
        description: "Lead our flagship branch in Kigali, overseeing daily operations, team management, and customer service excellence. Responsible for meeting sales targets and ensuring compliance with banking regulations.",
        requirements: "- 5+ years of experience in banking\n- 3+ years in a management role\n- Strong leadership and communication skills\n- Bachelor's degree in Finance, Business, or related field",
        responsibilities: "- Oversee branch operations and staff management\n- Ensure compliance with banking regulations\n- Meet sales and customer satisfaction targets\n- Build relationships with key clients",
        benefits: "- Competitive salary package\n- Performance bonuses\n- Comprehensive health coverage\n- Retirement benefits\n- Professional development opportunities",
        isActive: true,
        isFeatured: true,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Agricultural Project Manager",
        companyId: 3, // Green Farms Rwanda
        location: "Eastern Province",
        type: "full_time",
        experienceLevel: "intermediate",
        category: "Agriculture",
        salary: "$2500-$3000 monthly",
        description: "Oversee agricultural projects including planning, implementation, and evaluation. Work with local farmers to improve crop yields and sustainable farming practices.",
        requirements: "- Degree in Agriculture, Environmental Science, or related field\n- 3+ years experience in agricultural project management\n- Knowledge of sustainable farming practices\n- Strong community engagement skills\n- Valid driver's license",
        responsibilities: "- Manage agricultural development projects\n- Provide training to local farmers\n- Monitor project implementation and outcomes\n- Prepare detailed reports for stakeholders",
        benefits: "- Competitive salary\n- Housing allowance\n- Transportation\n- Health insurance\n- Capacity building opportunities",
        isActive: true,
        isFeatured: false,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Registered Nurse",
        companyId: 4, // Rwanda Healthcare Partners
        location: "Kigali",
        type: "full_time",
        experienceLevel: "intermediate",
        category: "Healthcare",
        salary: "$1800-$2200 monthly",
        description: "Join our medical team to provide quality patient care in our expanding healthcare facility. Responsibilities include patient assessment, treatment planning, and health education.",
        requirements: "- Nursing degree or diploma\n- Valid nursing license\n- 2+ years of clinical experience\n- Strong communication skills\n- Ability to work in shifts",
        responsibilities: "- Conduct patient assessments and implement care plans\n- Administer medications and treatments\n- Educate patients on health management\n- Maintain accurate medical records",
        benefits: "- Competitive salary\n- Medical coverage\n- Continuing education support\n- Career advancement opportunities",
        isActive: true,
        isFeatured: false,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Mathematics Teacher",
        companyId: 5, // Educate Rwanda
        location: "Kigali",
        type: "full_time",
        experienceLevel: "entry",
        category: "Education & Training",
        salary: "$1500-$1800 monthly",
        description: "Teach mathematics to secondary school students using modern teaching methodologies. Develop lesson plans, assess student progress, and participate in school activities.",
        requirements: "- Bachelor's degree in Mathematics or Education\n- Teaching certification (preferred)\n- Passion for education and student development\n- Strong communication skills\n- Fluency in English and Kinyarwanda",
        responsibilities: "- Develop and implement mathematics curriculum\n- Assess student progress and provide feedback\n- Participate in school activities and meetings\n- Mentor students and provide additional support",
        benefits: "- Competitive salary\n- Housing allowance\n- End-of-year bonus\n- Professional development opportunities\n- Supportive teaching environment",
        isActive: true,
        isFeatured: true,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Marketing Coordinator",
        companyId: 1, // Kigali Tech Solutions
        location: "Kigali",
        type: "full_time",
        experienceLevel: "entry",
        category: "Marketing & Sales",
        salary: "$1500-$2000 monthly",
        description: "Support our marketing team in planning and executing campaigns across digital and traditional channels. Coordinate with different departments to ensure consistent brand messaging.",
        requirements: "- Bachelor's degree in Marketing, Communications, or related field\n- 1+ years of marketing experience\n- Proficiency in social media platforms and basic design tools\n- Strong writing and communication skills\n- Analytical mindset",
        responsibilities: "- Assist in planning and executing marketing campaigns\n- Create and schedule social media content\n- Coordinate with design team on marketing materials\n- Track campaign performance and prepare reports",
        benefits: "- Competitive salary\n- Performance bonuses\n- Flexible working hours\n- Professional development opportunities\n- Modern office environment",
        isActive: true,
        isFeatured: false,
        isRemote: false,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      },
      {
        title: "UI/UX Designer",
        companyId: 1, // Kigali Tech Solutions
        location: "Kigali",
        type: "full_time",
        experienceLevel: "intermediate",
        category: "Information Technology",
        salary: "$2000-$3000 monthly",
        description: "Create intuitive and visually appealing user interfaces for web and mobile applications. Work closely with development teams to implement designs that enhance user experience.",
        requirements: "- 3+ years of UI/UX design experience\n- Proficiency in Figma, Adobe XD, or similar tools\n- Experience with user research and usability testing\n- Portfolio demonstrating past work\n- Understanding of frontend development basics",
        responsibilities: "- Design user interfaces for web and mobile applications\n- Conduct user research and usability testing\n- Create wireframes, prototypes, and high-fidelity designs\n- Collaborate with development teams on implementation",
        benefits: "- Competitive salary\n- Health insurance\n- Flexible working hours\n- Design equipment allowance\n- Professional development budget",
        isActive: true,
        isFeatured: true,
        isRemote: true,
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      }
    ];
    
    jobs.forEach(jobData => {
      const job = {
        id: this.jobIdCounter++,
        ...jobData,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000))
      };
      this.jobsData.set(job.id, job);
    });
    
    // Create a sample application
    const application = {
      userId: 2, // Job seeker
      jobId: 1, // Senior Frontend Developer
      coverLetter: "I am excited to apply for the Senior Frontend Developer position at Kigali Tech Solutions. With over 3 years of experience in React and modern web development, I believe I would be a great fit for your team.",
      status: "applied" as "applied" | "reviewed" | "interview_scheduled" | "rejected" | "hired",
      resumeUrl: "https://example.com/johndoe-resume.pdf"
    };
    
    this.applicationsData.set(this.applicationIdCounter, {
      id: this.applicationIdCounter++,
      ...application,
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
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
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id: existingUser.id, // Ensure ID doesn't change
      createdAt: existingUser.createdAt // Preserve original creation date
    };
    
    this.usersData.set(id, updatedUser);
    return updatedUser;
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

// Import the database storage implementation
import { DatabaseStorage } from "./db.storage";

// Use the database storage instead of memory storage
export const storage = new DatabaseStorage();
