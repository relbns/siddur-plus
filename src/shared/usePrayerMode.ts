import { useEffect, useState } from 'react';
import { useSettingsStore } from '../core/stores';

export function usePrayerMode() {
  const { keepScreenAwake, silentModeReminder } = useSettingsStore();
  const [showDndToast, setShowDndToast] = useState(false);

  useEffect(() => {
    let wakeLock: any = null; // any to bypass standard DOM typings if outdated

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    };

    if (keepScreenAwake) {
      requestWakeLock();
      
      // Re-request when document becomes visible again
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          requestWakeLock();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (wakeLock) wakeLock.release().catch(console.warn);
      };
    }
  }, [keepScreenAwake]);

  useEffect(() => {
    if (silentModeReminder) {
      // Show toast on mount, but delay slightly
      const timer = setTimeout(() => {
        setShowDndToast(true);
      }, 500);

      // Hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowDndToast(false);
      }, 4500);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [silentModeReminder]);

  return { showDndToast };
}
