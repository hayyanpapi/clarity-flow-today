
import { useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const scheduleNotification = useCallback((title: string, message: string, delay: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: 'task-reminder'
        });
        
        // Also show toast as fallback
        toast({
          title: "Task Reminder",
          description: message,
        });
      }, delay);
    } else {
      // Fallback to toast if notifications aren't available
      setTimeout(() => {
        toast({
          title: "Task Reminder",
          description: message,
        });
      }, delay);
    }
  }, []);

  useEffect(() => {
    // Request permission on mount if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, [requestPermission]);

  return {
    requestPermission,
    scheduleNotification,
    isSupported: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'denied'
  };
}
