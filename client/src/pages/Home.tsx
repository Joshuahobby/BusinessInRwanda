import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/HeroSection';
import FeaturedJobs from '@/components/FeaturedJobs';
import JobCategories from '@/components/JobCategories';
import EmployerCTA from '@/components/EmployerCTA';
import FeaturedEmployers from '@/components/FeaturedEmployers';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Business In Rwanda - Your Gateway to Career Opportunities</title>
        <meta name="description" content="Find your dream job or top talent in Rwanda's growing economy. Business In Rwanda connects job seekers with employers through a modern job portal platform." />
        {/* Open Graph tags */}
        <meta property="og:title" content="Business In Rwanda - Job Portal" />
        <meta property="og:description" content="Connect with top employers and find your dream job in Rwanda's growing economy" />
        <meta property="og:type" content="website" />
      </Helmet>

      <HeroSection />
      <FeaturedJobs />
      <JobCategories />
      <EmployerCTA />
      <FeaturedEmployers />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default Home;
