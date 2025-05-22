import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import LoginModal from "./LoginModal";

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [location] = useLocation();
  const { currentUser, isAuthenticated, logout, isEmployer, isJobSeeker } = useFirebaseAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and site name */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = "/"}>
              <div className="bg-[#0A3D62] p-2 rounded">
                <span className="material-icons text-white text-base sm:text-lg">work</span>
              </div>
              <span className="ml-2 text-sm sm:text-lg lg:text-xl font-bold text-[#0A3D62] font-heading truncate max-w-[140px] sm:max-w-none">
                Business In Rwanda
              </span>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link href="/" className={`text-neutral-700 hover:text-[#0A3D62] font-medium text-sm xl:text-base transition-colors ${location === '/' ? 'text-[#0A3D62]' : ''}`}>
              Home
            </Link>
            <Link href="/opportunities" className={`text-neutral-700 hover:text-[#0A3D62] font-medium text-sm xl:text-base transition-colors ${location === '/opportunities' ? 'text-[#0A3D62]' : ''}`}>
              Opportunities
            </Link>
            <Link href="/employers" className={`text-neutral-700 hover:text-[#0A3D62] font-medium text-sm xl:text-base transition-colors ${location === '/employers' ? 'text-[#0A3D62]' : ''}`}>
              Employers
            </Link>
            <Link href="/resources" className={`text-neutral-700 hover:text-[#0A3D62] font-medium text-sm xl:text-base transition-colors ${location === '/resources' ? 'text-[#0A3D62]' : ''}`}>
              Resources
            </Link>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-neutral-700 hover:text-[#0A3D62] font-medium text-sm">
                <span>EN</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Kinyarwanda</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Auth buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm max-w-[100px] lg:max-w-none truncate">
                      {currentUser?.fullName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isEmployer() && (
                    <DropdownMenuItem asChild>
                      <Link href="/employer/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {isJobSeeker() && (
                    <DropdownMenuItem asChild>
                      <Link href="/jobseeker/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex text-[#0A3D62] hover:text-[#082C46] text-sm px-3"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Sign In
                </Button>
                <Link href="/register">
                  <Button className="bg-[#0A3D62] hover:bg-[#082C46] text-white text-sm px-3 sm:px-4">
                    Register
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="px-3 py-2 text-base font-medium text-neutral-700 hover:text-[#0A3D62]">
                    Home
                  </Link>
                  <Link href="/opportunities" className="px-3 py-2 text-base font-medium text-neutral-700 hover:text-[#0A3D62]">
                    Find Opportunities
                  </Link>
                  <Link href="/employers" className="px-3 py-2 text-base font-medium text-neutral-700 hover:text-[#0A3D62]">
                    Employers
                  </Link>
                  <Link href="/resources" className="px-3 py-2 text-base font-medium text-neutral-700 hover:text-[#0A3D62]">
                    Resources
                  </Link>
                  <div className="px-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center space-x-1 text-neutral-700">
                        <span>EN</span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>English</DropdownMenuItem>
                        <DropdownMenuItem>Kinyarwanda</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {!isAuthenticated && (
                    <div className="mt-4 space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        Sign In
                      </Button>
                      <Link href="/register" className="block w-full">
                        <Button className="w-full bg-[#0A3D62] hover:bg-[#082C46]">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;
