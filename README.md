
# Business in Rwanda Job Portal

A modern job portal platform built with React, Express, and TypeScript, designed to connect job seekers and employers in Rwanda.

## Features

- Job listing and search functionality
- User roles: Job Seekers, Employers, and Administrators
- Job categories and filters
- Company profiles
- Resource center with guides and templates
- Authentication with multiple providers
- Mobile-responsive design

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Radix UI
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Multiple providers including Google OAuth

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will start on port 5000.

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas
- `/components` - Reusable UI components

## Environment Variables

The following environment variables are required:

- `DATABASE_URL` - PostgreSQL database connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SESSION_SECRET` - Session encryption secret

## Features

### For Job Seekers
- Search and filter job listings
- Create and manage professional profiles
- Apply for jobs
- Access career resources and templates

### For Employers
- Post and manage job listings
- Review applications
- Company profile management
- Access to applicant tracking

### For Administrators
- User management
- Content moderation
- Analytics dashboard
- System configuration

## License

MIT
