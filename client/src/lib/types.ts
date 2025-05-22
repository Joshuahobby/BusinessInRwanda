// Extend types from schema as needed for frontend

export type UserRole = 'job_seeker' | 'employer' | 'admin';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote' | 'temporary';

export type ExperienceLevel = 'entry' | 'intermediate' | 'senior' | 'executive';

export type ApplicationStatus = 'applied' | 'reviewed' | 'interview_scheduled' | 'rejected' | 'hired';

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  category?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
}
