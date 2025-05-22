import { Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileAppPromo = () => {
  // Mock app download links (would be replaced with actual links in production)
  const appStoreLink = "#";
  const playStoreLink = "#";

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0A3D62] to-[#1E5D8C] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content */}
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="h-6 w-6 text-white" />
                <h2 className="text-xl md:text-2xl font-bold text-white">Get the Business In Rwanda App</h2>
              </div>
              
              <p className="text-white/80 mb-6">
                Access job listings, auctions, tenders, and announcements on the go. Get notified about new opportunities matching your preferences.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white">Apply to jobs with a single tap</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white">Receive real-time notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white">Track application status offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-white">Save listings for later</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a href={appStoreLink} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white hover:bg-white/90 text-[#0A3D62]">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" 
                      alt="App Store" 
                      className="h-5 mr-2" 
                    />
                    App Store
                  </Button>
                </a>
                <a href={playStoreLink} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white hover:bg-white/90 text-[#0A3D62]">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" 
                      alt="Google Play" 
                      className="h-5 mr-2" 
                    />
                    Google Play
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative hidden md:block">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D62] via-transparent to-transparent opacity-50"></div>
              
              {/* App screenshot mockup */}
              <div className="absolute bottom-10 right-10 w-60 h-96 bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-[#1A1A1A] transform rotate-6">
                <div className="absolute inset-0 bg-[#F8F8F8] z-0"></div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1A1A1A] z-10 flex justify-center items-end pb-1">
                  <div className="w-16 h-1 bg-[#3A3A3A] rounded-full"></div>
                </div>
                <div className="absolute top-8 inset-x-0 bottom-0 z-10 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=700&q=80')",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppPromo;