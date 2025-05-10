import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 font-heading">Business In Rwanda</h3>
            <p className="mb-4">Your gateway to career opportunities in Rwanda's growing economy.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4 font-heading">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link href="/find-jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Create Resume</Link></li>
              <li><Link href="/job-alerts" className="hover:text-white transition-colors">Job Alerts</Link></li>
              <li><Link href="/career-advice" className="hover:text-white transition-colors">Career Advice</Link></li>
              <li><Link href="/skill-assessments" className="hover:text-white transition-colors">Skill Assessments</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4 font-heading">For Employers</h3>
            <ul className="space-y-2">
              <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link href="/browse-candidates" className="hover:text-white transition-colors">Browse Candidates</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/employer-resources" className="hover:text-white transition-colors">Employer Resources</Link></li>
              <li><Link href="/company-profile" className="hover:text-white transition-colors">Company Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-bold mb-4 font-heading">Contact & Support</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-neutral-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Business In Rwanda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
