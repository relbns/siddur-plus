import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../core/stores';
import type { UserSettings } from '../../core/types';
import './TefilatHaDerech.css';

const TEFILAT_HADERECH_HE = `יְהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם וְתַצְעִידֵנוּ לְשָׁלוֹם וְתִסְמְכֵנוּ לְשָׁלוֹם, וְתַדְרִיכֵנוּ לְשָׁלוֹם, וְתַגִּיעֵנוּ לִמְחוֹז חֶפְצֵנוּ לְחַיִּים וּלְשִׂמְחָה וּלְשָׁלוֹם. וְתַצִּילֵנוּ מִכַּף כָּל אוֹיֵב וְאוֹרֵב וְלִסְטִים וְחַיּוֹת רָעוֹת בַּדֶּרֶךְ, וּמִכָּל מִינֵי פֻרְעָנִיּוֹת הַמִּתְרַגְּשׁוֹת לָבוֹא לָעוֹלָם, וְתִשְׁלַח בְּרָכָה בְּכָל מַעֲשֵׂה יָדֵינוּ, וְתִתְּנֵנוּ לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָּל רֹאֵינוּ, וְתִשְׁמַע קוֹל תַּחֲנוּנֵינוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלָּה וְתַחֲנוּן אָתָּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.`;

const TEFILAT_HADERECH_CLEAN = `יהי רצון מלפניך יי אלהינו ואלהי אבותינו, שתוליכנו לשלום ותצעידנו לשלום ותסמכנו לשלום, ותדריכנו לשלום, ותגיענו למחוז חפצנו לחיים ולשמחה ולשלום. ותצילנו מכף כל אויב ואורב ולסטים וחיות רעות בדרך, ומכל מיני פורענויות המתרגשות לבוא לעולם, ותשלח ברכה בכל מעשה ידינו, ותתננו לחן ולחסד ולרחמים בעיניך ובעיני כל רואינו, ותשמע קול תחנונינו, כי אל שומע תפלה ותחנון אתה. ברוך אתה יי, שומע תפלה.`;

export function TefilatHaDerech() {
  const navigate = useNavigate();
  const showNikud = useSettingsStore((s: UserSettings) => s.showNikud);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const text = showNikud ? TEFILAT_HADERECH_HE : TEFILAT_HADERECH_CLEAN;

  useEffect(() => {
    // Initialize audio element with path to media file
    const audio = new Audio('./media/tefilat-haderech.mp3');
    
    // Listeners to sync state
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    audio.onplay = () => setIsPlaying(true);
    
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      // Reset to start if user stops
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
        alert('לא ניתן לנגן כרגע. ודא שהקובץ קיים.');
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="screen tefilat-haderech-screen">
      <header className="app-header">
        <button className="reader-back-btn" onClick={() => navigate('/more')} aria-label="חזרה">←</button>
        <h1>תפילת הדרך</h1>
        <div style={{ width: '2rem' }} />
      </header>
      <main className="container fade-in tefilat-content">
        <div className="prayer-text-block">
          <p className="prayer-text">{text}</p>
        </div>

        <button
          className={`tts-btn ${isPlaying ? 'tts-btn--active' : ''}`}
          onClick={togglePlayback}
          aria-label={isPlaying ? 'עצור הקראה' : 'השמע תפילה'}
        >
          <span className="tts-icon">{isPlaying ? '⏹️' : '🔊'}</span>
          <span>{isPlaying ? 'עצור הנגנה' : 'השמע תפילה'}</span>
        </button>

        <div className="tefilat-note">
          <p>
            <strong>מתי אומרים?</strong>
            <br />
            תפילת הדרך נאמרת כשיוצאים לדרך שיש בה סכנה כגון כביש בינעירוני לא מיושב, נסיעות בים או טיסות. 
            נהוג להתחיל לומר אותה רק לאחר שיוצאים מאזור העיר (כ-4 ק״מ מחוץ לעיר, או באזור שאין בו מבני מגורים רצופים).
          </p>
          <p style={{ marginTop: 'var(--space-2)' }}>אומרים אותה פעם אחת ביום, גם אם נוסעים מספר פעמים.</p>
        </div>
      </main>
    </div>
  );
}
