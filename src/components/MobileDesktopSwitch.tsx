
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MobileDesktopSwitch() {
  const isMobile = useIsMobile();

  const handleDesktopSwitch = () => {
    if (isMobile) {
      // Show instructions for switching to desktop mode
      toast("Switch to Desktop Mode", {
        description: "Open your browser menu and select 'Desktop site' or 'Request desktop site' for the best experience.",
        duration: 5000,
      });
      
      // Optional: You can also try to force desktop user agent
      // This is a hint to the browser but may not always work
      try {
        // Add viewport meta tag for desktop
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=1024');
        }
      } catch (error) {
        console.log('Could not modify viewport');
      }
    } else {
      toast.success("You're already in desktop mode!");
    }
  };

  const handleMobileOptimized = () => {
    toast.success("Mobile view optimized!");
    // Reset viewport for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
  };

  if (!isMobile) {
    return (
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMobileOptimized}
          className="text-primary"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Mobile Optimized
        </Button>
      </div>
    );
  }

  return (
    <div className="desktop-switch-container">
      <p className="text-white text-sm mb-3 font-medium">
        For the best experience on larger screens
      </p>
      <button 
        className="desktop-switch-btn"
        onClick={handleDesktopSwitch}
      >
        <Monitor className="inline h-4 w-4 mr-2" />
        Switch to Desktop Version
      </button>
    </div>
  );
}
