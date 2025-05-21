import React from 'react';
import { 
  Briefcase, 
  Building2, 
  Users, 
  GraduationCap, 
  Heart, 
  Clock, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Award, 
  Monitor, 
  BarChart4, 
  Landmark, 
  Stethoscope, 
  School, 
  Megaphone,
  Lightbulb,
  Search,
  Mail,
  Phone,
  Globe,
  Bookmark,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName = 
  | 'job'
  | 'company'
  | 'users'
  | 'education'
  | 'favorite'
  | 'time'
  | 'location'
  | 'salary'
  | 'calendar'
  | 'award'
  | 'it'
  | 'management'
  | 'finance'
  | 'healthcare'
  | 'education-training'
  | 'marketing'
  | 'engineering'
  | 'agriculture'
  | 'search'
  | 'email'
  | 'phone'
  | 'website'
  | 'bookmark'
  | 'share';

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className, ...props }) => {
  const getIcon = (): React.ReactNode => {
    const iconProps = { size, className: cn('', className) };
    
    switch (name) {
      case 'job':
        return <Briefcase {...iconProps} />;
      case 'company':
        return <Building2 {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'education':
        return <GraduationCap {...iconProps} />;
      case 'favorite':
        return <Heart {...iconProps} />;
      case 'time':
        return <Clock {...iconProps} />;
      case 'location':
        return <MapPin {...iconProps} />;
      case 'salary':
        return <CreditCard {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'award':
        return <Award {...iconProps} />;
      case 'it':
        return <Monitor {...iconProps} />;
      case 'management':
        return <BarChart4 {...iconProps} />;
      case 'finance':
        return <Landmark {...iconProps} />;
      case 'healthcare':
        return <Stethoscope {...iconProps} />;
      case 'education-training':
        return <School {...iconProps} />;
      case 'marketing':
        return <Megaphone {...iconProps} />;
      case 'engineering':
        return <Lightbulb {...iconProps} />;
      case 'agriculture':
        return <Briefcase {...iconProps} />; // Placeholder until we find a better icon
      case 'search':
        return <Search {...iconProps} />;
      case 'email':
        return <Mail {...iconProps} />;
      case 'phone':
        return <Phone {...iconProps} />;
      case 'website':
        return <Globe {...iconProps} />;
      case 'bookmark':
        return <Bookmark {...iconProps} />;
      case 'share':
        return <Share2 {...iconProps} />;
      default:
        return <Briefcase {...iconProps} />;
    }
  };

  return (
    <div className={cn('inline-flex', className)} {...props}>
      {getIcon()}
    </div>
  );
};

export default Icon;