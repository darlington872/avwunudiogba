import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * NotificationRequest component that provides a browser-compatible notification request button
 * This component gracefully degrades for browsers that don't support notifications
 */
const NotificationRequest: React.FC = () => {
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for notification support only after component mounts (client-side)
  useEffect(() => {
    // Required to handle SSR environments where window might not be available
    const checkNotificationSupport = () => {
      try {
        const isSupported = 
          typeof window !== 'undefined' && 
          'Notification' in window && 
          'serviceWorker' in navigator;
        
        setNotificationsSupported(isSupported);
        
        if (isSupported) {
          // Check current permission status
          if (Notification.permission === 'granted') {
            setPermission('granted');
          } else if (Notification.permission === 'denied') {
            setPermission('denied');
          }
        } else {
          console.log("This browser does not support notifications");
        }
      } catch (error) {
        console.error("Error checking notification support:", error);
        setNotificationsSupported(false);
      }
    };
    
    checkNotificationSupport();
  }, []);

  const sendTestNotification = () => {
    try {
      // Using a timeout to ensure the notification appears after permission is granted
      setTimeout(() => {
        try {
          // Create the notification with only standard options
          const notification = new Notification('ETHERVOX SMS', {
            body: 'You will now receive notifications about your orders and referrals!',
            icon: '/assets/ethervox-globe-small.svg', 
            tag: 'welcome-notification'
          });
          
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (e) {
          console.log('Error sending welcome notification:', e);
          // Still show success since permission is granted
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  };

  const requestPermission = async () => {
    // Double-check if notifications are supported before proceeding
    if (!notificationsSupported || !('Notification' in window)) {
      toast({
        title: 'Notifications Not Supported',
        description: 'Your browser does not support notifications or they are blocked at the system level.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Modern approach using async/await
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        const notificationSent = sendTestNotification();
        
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive important notifications about your orders and referrals!',
          variant: 'default',
        });
      } else if (result === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'You will not receive notifications. You can enable them in your browser settings if you change your mind.',
          variant: 'destructive',
        });
      } else {
        // For 'default' (dismissed dialog) state
        toast({
          title: 'Notification Permission Required',
          description: 'Please allow notifications to receive important updates about your account.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      
      // More descriptive error message
      toast({
        title: 'Notification Error',
        description: 'There was an error enabling notifications. This may be due to security settings in your browser or system.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // If notifications aren't supported, show a message without trying to request permissions
  if (!notificationsSupported) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-amber-900/20 text-amber-400 border-amber-500/20 hover:bg-amber-900/30 hover:text-amber-300"
        disabled
      >
        <AlertCircle className="h-4 w-4 mr-2" /> Notifications Not Available
      </Button>
    );
  }

  if (permission === 'granted') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-green-900/20 text-green-400 border-green-500/20 hover:bg-green-900/30 hover:text-green-300 shadow-md"
      >
        <CheckCircle className="h-4 w-4 mr-2" /> Notifications Enabled
      </Button>
    );
  }

  if (permission === 'denied') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-red-900/20 text-red-400 border-red-500/20 hover:bg-red-900/30 hover:text-red-300 shadow-md"
        disabled
      >
        <BellOff className="h-4 w-4 mr-2" /> Notifications Blocked
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="bg-purple-900/20 text-purple-400 border-purple-500/20 hover:bg-purple-900/30 hover:text-purple-300 shadow-md hover:shadow-lg transition-all duration-300"
      onClick={requestPermission}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" /> Enable Notifications
        </>
      )}
    </Button>
  );
};

export default NotificationRequest;