import { useState, useEffect, useCallback } from 'react';
import { X, Compass } from 'lucide-react';
import { useSettingsStore } from '@/core/stores';
import './CompassModal.css';

interface CompassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KOTEL_COORDS = { lat: 31.7767, lng: 35.2345 };

/**
 * Kibla/Mizrach Compass Modal
 * Calculates bearing from user to Jerusalem and displays an interactive compass.
 */
export function CompassModal({ isOpen, onClose }: CompassModalProps) {
  const settings = useSettingsStore();
  const [heading, setHeading] = useState<number | null>(null);
  const [bearingToKotel, setBearingToKotel] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate bearing from user to Kotel
  const calculateBearing = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
    const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
               Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
    let brng = Math.atan2(y, x) * (180 / Math.PI);
    return (brng + 360) % 360;
  }, []);

  const requestOrientation = async () => {
    // @ts-ignore - iOS specific API
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          startListening();
        } else {
          setError('גישה לחיישנים נדחתה');
        }
      } catch (e) {
        setError('שגיאה בגישה לחיישנים');
      }
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore
      const h = e.webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : null);
      if (h !== null) setHeading(h);
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (settings.location) {
      setBearingToKotel(calculateBearing(
        settings.location.lat, 
        settings.location.lng, 
        KOTEL_COORDS.lat, 
        KOTEL_COORDS.lng
      ));
    } else {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          settings.updateSetting('location', { lat: latitude, lng: longitude });
          setBearingToKotel(calculateBearing(latitude, longitude, KOTEL_COORDS.lat, KOTEL_COORDS.lng));
          setLoading(false);
          requestOrientation();
        },
        () => {
          setError('לא ניתן לקבל מיקום');
          setLoading(false);
        }
      );
    }

    const cleanup = startListening();
    return cleanup;
  }, [isOpen, settings.location, calculateBearing]);

  if (!isOpen) return null;

  const arrowRotation = bearingToKotel !== null && heading !== null 
    ? (bearingToKotel - heading) 
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compass-modal card fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="compass-header">
          <div className="header-main">
            <h2 className="header-title">כיוון התפילה (מזרח)</h2>
            <p className="header-subtitle">מציאת הכותל המערבי</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="סגור">
            <X size={20} />
          </button>
        </div>

        <div className="compass-body">
          {!window.isSecureContext && (
            <div className="secure-context-warning">
              <p>⚠️ המכשיר דורש חיבור מאובטח (HTTPS) כדי להפעיל את המצפן והמיקום.</p>
              <small>מציג זמנים לפי ברירת מחדל (ירושלים).</small>
            </div>
          )}

          {loading && <div className="compass-loader">מחשב מיקום...</div>}
          {error && !window.isSecureContext && (
             <p className="compass-hint-info">השתמש בכתובת localhost או HTTPS לדיוק מרבי</p>
          )}
          {error && <p className="compass-error">{error}</p>}
          
          <div className="compass-visual-wrapper">
            <div className="compass-circle">
              <div className="cardinal-point north">N</div>
              <div className="cardinal-point east">E</div>
              <div className="cardinal-point south">S</div>
              <div className="cardinal-point west">W</div>
              
              <div 
                className="compass-arrow-wrapper"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <div className="compass-arrow-needle"></div>
                <div className="kotel-indicator">כותל</div>
              </div>
            </div>
            
            {heading === null && window.isSecureContext && (
              <div className="orientation-request fade-in">
                <button className="btn btn-primary btn-lg" onClick={requestOrientation}>
                  הפעל חיישן כיוון
                </button>
                <p className="hint">נדרש בטלפונים ג׳ירוסקופ פעיל</p>
              </div>
            )}
          </div>

          <div className="compass-info">
            <p className="location-label">הכותל המערבי, ירושלים</p>
            {bearingToKotel !== null ? (
              <p className="bearing-text">{Math.round(bearingToKotel)}° צפון</p>
            ) : (
              <p className="bearing-text">---°</p>
            )}
            <div className="compass-footer-note">
               <Compass size={14} />
               <span>תואם למגנטומטר המכשיר</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
