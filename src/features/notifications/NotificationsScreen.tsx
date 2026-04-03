import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Star, Clock, Check } from 'lucide-react';
import { StandardHeader } from '../../shared/Header';
import { useContextStore } from '../../core/stores';
import './NotificationsScreen.css';

type NotifType = 'omer' | 'zmanim';

interface ReminderConfig {
  type: NotifType;
  enabled: boolean;
  minutesBefore?: number;
}

function getStoredReminders(): Record<NotifType, ReminderConfig> {
  try {
    const raw = localStorage.getItem('siddur-reminders');
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return {
    omer: { type: 'omer', enabled: false },
    zmanim: { type: 'zmanim', enabled: false, minutesBefore: 15 },
  };
}

function saveReminders(r: Record<NotifType, ReminderConfig>) {
  localStorage.setItem('siddur-reminders', JSON.stringify(r));
}

async function requestNotifPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

async function scheduleOmerNotification(context: { sefiraDay: number | null; zmanim: { tzeitHakochavim: Date } | null }) {
  if (!context.sefiraDay || !context.zmanim) return;
  const tzeit = new Date(context.zmanim.tzeitHakochavim);
  const now = new Date();
  const ms = tzeit.getTime() - now.getTime();
  if (ms < 0 || ms > 24 * 60 * 60 * 1000) return;

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('ספירת העומר', {
        body: `היום הוא יום ${context.sefiraDay} בעומר`,
        icon: '/apple-touch-icon.png',
        tag: 'omer-reminder',
      });
    }
  }, ms);
}

async function scheduleZmanimNotification(
  context: { zmanim: { sunset: Date; tzeitHakochavim: Date } | null },
  minutesBefore: number
) {
  if (!context.zmanim) return;
  const sunset = new Date(context.zmanim.sunset);
  const fireAt = new Date(sunset.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();
  const ms = fireAt.getTime() - now.getTime();
  if (ms < 0 || ms > 24 * 60 * 60 * 1000) return;

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('שקיעת החמה בקרוב', {
        body: `שקיעה בעוד ${minutesBefore} דקות (${sunset.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })})`,
        icon: '/apple-touch-icon.png',
        tag: 'zmanim-sunset',
      });
    }
  }, ms);
}

export function NotificationsScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const [reminders, setReminders] = useState<Record<NotifType, ReminderConfig>>(getStoredReminders);
  const [permission, setPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const toggleReminder = async (type: NotifType) => {
    const current = reminders[type];
    if (!current.enabled) {
      const granted = await requestNotifPermission();
      setPermission(granted ? 'granted' : 'denied');
      if (!granted) return;
    }
    const updated = {
      ...reminders,
      [type]: { ...current, enabled: !current.enabled },
    };
    setReminders(updated);
    saveReminders(updated);
  };

  const saveAndSchedule = async () => {
    saveReminders(reminders);
    if (context && reminders.omer.enabled) {
      await scheduleOmerNotification(context as Parameters<typeof scheduleOmerNotification>[0]);
    }
    if (context && reminders.zmanim.enabled) {
      await scheduleZmanimNotification(
        context as Parameters<typeof scheduleZmanimNotification>[0],
        reminders.zmanim.minutesBefore ?? 15
      );
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const notifSupported = 'Notification' in window;

  return (
    <div className="screen">
      <StandardHeader title="התראות ותזכורות" showBack={true} onBack={() => navigate(-1)} />

      <div className="container fade-in notif-container">
        {!notifSupported ? (
          <div className="notif-unsupported card">
            <BellOff size={40} className="notif-unsupported-icon" />
            <h2>התראות אינן נתמכות</h2>
            <p>הדפדפן שלך אינו תומך בהתראות. נסה להתקין את האפליקציה כ-PWA.</p>
          </div>
        ) : (
          <>
            {permission === 'denied' && (
              <div className="notif-denied-banner">
                <BellOff size={18} />
                <span>ההתראות חסומות. יש לאפשר אותן בהגדרות הדפדפן.</span>
              </div>
            )}

            <div className="notif-hero">
              <Bell size={48} className="notif-hero-icon" />
              <h1 className="notif-hero-title">הוסף התראה</h1>
              <p className="notif-hero-desc">הגדר תזכורות לשמור לך על זמנים חשובים</p>
            </div>

            <h2 className="section-title">סוג ההתראה</h2>

            <div className="notif-cards">
              {/* Omer */}
              <div
                className={`notif-card ${reminders.omer.enabled ? 'active' : ''}`}
                onClick={() => toggleReminder('omer')}
                role="button"
                tabIndex={0}
              >
                <div className="notif-card-icon">
                  <Star size={24} />
                </div>
                <div className="notif-card-body">
                  <span className="notif-card-title">ספירת העומר</span>
                  <span className="notif-card-desc">תזכורת יומית בתקופת ספירת העומר</span>
                </div>
                <div className={`notif-card-toggle ${reminders.omer.enabled ? 'on' : ''}`}>
                  {reminders.omer.enabled ? <Check size={16} /> : null}
                </div>
              </div>

              {/* Zmanim */}
              <div
                className={`notif-card ${reminders.zmanim.enabled ? 'active' : ''}`}
                onClick={() => toggleReminder('zmanim')}
                role="button"
                tabIndex={0}
              >
                <div className="notif-card-icon">
                  <Clock size={24} />
                </div>
                <div className="notif-card-body">
                  <span className="notif-card-title">זמנים הלכתיים</span>
                  <span className="notif-card-desc">קבל התראה לפני זמנים הלכתיים</span>
                </div>
                <div className={`notif-card-toggle ${reminders.zmanim.enabled ? 'on' : ''}`}>
                  {reminders.zmanim.enabled ? <Check size={16} /> : null}
                </div>
              </div>
            </div>

            {/* Zmanim options */}
            {reminders.zmanim.enabled && (
              <div className="notif-options card fade-in">
                <label className="notif-option-label">כמה דקות לפני?</label>
                <div className="notif-option-row">
                  {[5, 10, 15, 30].map((m) => (
                    <button
                      key={m}
                      className={`notif-min-btn ${reminders.zmanim.minutesBefore === m ? 'active' : ''}`}
                      onClick={() => {
                        const updated = {
                          ...reminders,
                          zmanim: { ...reminders.zmanim, minutesBefore: m },
                        };
                        setReminders(updated);
                        saveReminders(updated);
                      }}
                    >
                      {m} דק'
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active context info */}
            {context?.sefiraDay && (
              <div className="notif-info-strip">
                <Star size={14} />
                <span>היום יום {context.sefiraDay} בעומר — תמכנו בהתראה יומית</span>
              </div>
            )}

            <button
              className="btn btn-primary notif-save-btn"
              onClick={saveAndSchedule}
              disabled={!Object.values(reminders).some((r) => r.enabled)}
            >
              {saved ? (
                <><Check size={18} /> נשמר ותוזמן!</>
              ) : (
                <><Bell size={18} /> שמור תזכורות</>
              )}
            </button>

            <p className="notif-disclaimer">
              * התזכורות פועלות כל עוד האפליקציה פתוחה. להתראות ברקע, התקן את האפליקציה כ-PWA.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
