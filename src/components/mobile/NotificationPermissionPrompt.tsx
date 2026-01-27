import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    setPermissionStatus(Notification.permission);

    // Only show prompt on mobile if permission is not granted and not denied
    if (isMobile && Notification.permission === 'default') {
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      // Show prompt if never dismissed or dismissed more than 24 hours ago
      if (!dismissed || dismissedTime < oneDayAgo) {
        // Delay showing prompt for better UX
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [isMobile]);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Show a test notification
        new Notification('Notifications Enabled! 🔔', {
          body: 'You will now receive important updates.',
          icon: '/favicon.png',
        });
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShowPrompt(false);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || permissionStatus !== 'default') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/50 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Stay Updated!</h3>
                <p className="text-sm opacity-90">Never miss important alerts</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={dismissPrompt}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-lg">📦</span>
              <span>Order status updates & delivery alerts</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔥</span>
              <span>Flash sales & exclusive deals</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💰</span>
              <span>Price drops on wishlist items</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={dismissPrompt}
            >
              Not Now
            </Button>
            <Button
              className="flex-1"
              onClick={requestPermission}
            >
              <Bell className="h-4 w-4 mr-2" />
              Allow
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can change this anytime in your browser settings
          </p>
        </div>
      </div>
    </div>
  );
}
