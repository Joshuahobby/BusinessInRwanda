import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, Maximize2, Minimize2, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenInfo {
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'desktop';
  optimization: string;
  tips: string[];
}

const SmartScreenTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null);
  const [hasShown, setHasShown] = useState(false);

  const getScreenInfo = (): ScreenInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let device: 'mobile' | 'tablet' | 'desktop';
    let optimization: string;
    let tips: string[];

    if (width < 768) {
      device = 'mobile';
      optimization = 'Mobile Optimized';
      tips = [
        'Tabs and cards are stacked vertically for easier scrolling',
        'Touch-friendly buttons with larger tap areas',
        'Simplified navigation menu for one-handed use',
        'Hero section is compact to show more content quickly'
      ];
    } else if (width < 1024) {
      device = 'tablet';
      optimization = 'Tablet Optimized';
      tips = [
        'Two-column layout balances content and whitespace',
        'Medium-sized cards perfect for touch interaction',
        'Sidebar content adapts to available space',
        'Search form optimized for tablet keyboards'
      ];
    } else {
      device = 'desktop';
      optimization = 'Desktop Optimized';
      tips = [
        'Three-column layout maximizes screen real estate',
        'Hover effects enhance interactivity',
        'Detailed sidebar information visible simultaneously',
        'Compact design shows more opportunities at once'
      ];
    }

    return { width, height, device, optimization, tips };
  };

  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenInfo(getScreenInfo());
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);

    // Show tooltip automatically after 3 seconds on first visit
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateScreenInfo);
      };
    }

    return () => window.removeEventListener('resize', updateScreenInfo);
  }, [hasShown]);

  const getDeviceIcon = () => {
    if (!screenInfo) return <Monitor className="h-5 w-5" />;
    
    switch (screenInfo.device) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getDeviceColor = () => {
    if (!screenInfo) return 'bg-gray-100 text-gray-600';
    
    switch (screenInfo.device) {
      case 'mobile':
        return 'bg-green-100 text-green-700';
      case 'tablet':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  if (!screenInfo) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className={`rounded-full w-12 h-12 shadow-lg ${getDeviceColor()} border-2 border-white hover:scale-110 transition-all duration-300`}
          variant="ghost"
        >
          {getDeviceIcon()}
        </Button>
      </motion.div>

      {/* Tooltip Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-xl border-2 border-gray-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getDeviceColor()}`}>
                      {getDeviceIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-base">Screen Optimization</CardTitle>
                      <Badge variant="outline" className={getDeviceColor()}>
                        {screenInfo.optimization}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-8 w-8 p-0"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-sm">
                  {screenInfo.width} × {screenInfo.height} pixels
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Eye className="h-4 w-4" />
                    Smart Optimizations Active:
                  </div>
                  
                  <ul className="space-y-2">
                    {screenInfo.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Settings className="h-3 w-3" />
                      Interface adapts automatically to your screen size
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartScreenTooltip;