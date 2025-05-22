import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for typesafe fields
export const userRoleEnum = pgEnum('user_role', ['job_seeker', 'employer', 'admin']);
export const jobTypeEnum = pgEnum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'remote', 'temporary']);
export const experienceLevelEnum = pgEnum('experience_level', ['entry', 'intermediate', 'senior', 'executive']);
export const applicationStatusEnum = pgEnum('application_status', ['applied', 'reviewed', 'interview_scheduled', 'rejected', 'hired']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'approved', 'rejected']);
export const currencyEnum = pgEnum('currency_type', ['RWF', 'USD', 'EUR']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(), // Firebase User ID for authentication
  email: text("email").notNull().unique(),
  password: text("password"), // Optional now as Firebase can handle auth
  role: userRoleEnum("role").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company profiles for employers
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  logo: text("logo"),
  website: text("website"),
  description: text("description"),
  employeeCount: text("employee_count"),
  founded: text("founded"),
  location: text("location").notNull(),
});

// Job seeker profiles
export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  skills: text("skills").array(),
  experience: text("experience"),
  education: text("education"),
  resumeUrl: text("resume_url"),
  coverLetterUrl: text("cover_letter_url"),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  companyName: text("company_name"),
  location: text("location").notNull(),
  type: jobTypeEnum("type").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  requirements: text("requirements").notNull(),
  salary: text("salary"),
  currency: currencyEnum("currency").default('RWF').notNull(),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  category: text("category").notNull(),
  status: jobStatusEnum("status").default('pending').notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  adminNotes: text("admin_notes"),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  status: applicationStatusEnum("status").default('applied').notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Category table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

// Session table for auth - required for persistent sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type InsertJobSeekerProfile = z.infer<typeof insertJobSeekerProfileSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
