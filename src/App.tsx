import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContextStore } from './core/stores';
import { Sidebar } from './shared/Sidebar';
import { TodayScreen } from './features/home/TodayScreen';
import { SiddurScreen } from './features/siddur/SiddurScreen';
import { PrayerReader } from './features/siddur/PrayerReader';
import { TehillimScreen } from './features/tehillim/TehillimScreen';
import { TehillimReader } from './features/tehillim/TehillimReader';
import { HalachaScreen } from './features/halacha/HalachaScreen';
import { HalachaDetailScreen } from './features/halacha/HalachaDetailScreen';
import { SearchScreen } from './features/search/SearchScreen';
import { MoreScreen } from './features/more/MoreScreen';
import { AboutScreen } from './features/more/AboutScreen';
import { SettingsScreen } from './features/more/SettingsScreen';
import { ZmanimScreen } from './features/zmanim/ZmanimScreen';
import { TefilatHaDerech } from './features/prayer/TefilatHaDerech';
import { DateConverter } from './features/tools/DateConverter';
import { CalendarScreen } from './features/calendar/CalendarScreen';
import { NotificationsScreen } from './features/notifications/NotificationsScreen';
import { KiddushScreen } from './features/kiddush/KiddushScreen';

export default function App() {
  const refreshContext = useContextStore((s) => s.refreshContext);

  useEffect(() => {
    refreshContext();
    const interval = setInterval(refreshContext, 5 * 60 * 1000);

    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 500);
    }

    return () => clearInterval(interval);
  }, [refreshContext]);

  return (
    <HashRouter>
      <div className="app-root">
        <Sidebar />
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/siddur" element={<SiddurScreen />} />
          <Route path="/siddur/:prayerId" element={<PrayerReader />} />
          <Route path="/tehillim" element={<TehillimScreen />} />
          <Route path="/tehillim/:chapterId" element={<TehillimReader />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/halacha" element={<HalachaScreen />} />
          <Route path="/halacha/:id" element={<HalachaDetailScreen />} />
          <Route path="/zmanim" element={<ZmanimScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/kiddush" element={<KiddushScreen />} />
          <Route path="/tefilat-haderech" element={<TefilatHaDerech />} />
          <Route path="/date-converter" element={<DateConverter />} />
          <Route path="/more" element={<MoreScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
