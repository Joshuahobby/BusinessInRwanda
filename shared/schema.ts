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
export const postTypeEnum = pgEnum('post_type', ['job', 'auction', 'tender', 'announcement']);
export const claimTypeEnum = pgEnum('claim_type', ['application', 'bid', 'proposal', 'interest']);
export const bidStatusEnum = pgEnum('bid_status', ['active', 'outbid', 'winning', 'won', 'lost']);

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
  companyId: integer("company_id").references(() => companies.id), // Make nullable for individual posters
  companyName: text("company_name"), // Store individual name here for individual posters
  location: text("location").notNull(),
  type: jobTypeEnum("type").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  requirements: text("requirements").notNull(),
  salary: text("salary"),
  currency: currencyEnum("currency").default('RWF').notNull(),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  deadline: text("deadline"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  category: text("category").notNull(),
  status: jobStatusEnum("status").default('pending').notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  adminNotes: text("admin_notes"),
  
  // Add post type field to differentiate between different kinds of posts
  postType: postTypeEnum("post_type").default('job').notNull(),
  
  // Fields specific to auctions - all made optional
  auctionDate: text("auction_date"), // Store as text for flexibility
  viewingDates: text("viewing_dates"),
  auctionItems: text("auction_items"), // Store as text instead of array
  auctionRequirements: text("auction_requirements"),
  
  // Fields specific to tenders - all made optional
  tenderDeadline: text("tender_deadline"), // Store as text for flexibility
  tenderRequirements: text("tender_requirements"),
  tenderDocuments: text("tender_documents"),
  
  // Custom JSON field for any additional type-specific data
  additionalData: jsonb("additional_data"),
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

// Bids table for auction opportunities
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bidAmount: integer("bid_amount").notNull(),
  currency: currencyEnum("currency").default('RWF').notNull(),
  message: text("message"),
  documentsUrl: text("documents_url"),
  status: bidStatusEnum("status").default('active').notNull(),
  bidAt: timestamp("bid_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposals table for tender opportunities
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  proposalTitle: text("proposal_title").notNull(),
  proposalDescription: text("proposal_description").notNull(),
  proposedAmount: integer("proposed_amount"),
  currency: currencyEnum("currency").default('RWF'),
  documentsUrl: text("documents_url"),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").default('applied').notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interest registrations for announcements
export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message"),
  contactPreference: text("contact_preference").default('email'),
  notifyUpdates: boolean("notify_updates").default(true).notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
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
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, bidAt: true, updatedAt: true });
export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, submittedAt: true, updatedAt: true });
export const insertInterestSchema = createInsertSchema(interests).omit({ id: true, registeredAt: true });
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

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export type Interest = typeof interests.$inferSelect;
export type InsertInterest = z.infer<typeof insertInterestSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
