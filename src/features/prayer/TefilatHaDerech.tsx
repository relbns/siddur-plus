import { useState, useEffect } from 'react';
import { StandardHeader } from '../../shared/Header';
import { useSettingsStore } from '../../core/stores';
import type { UserSettings } from '../../core/types';
import './TefilatHaDerech.css';

const TEFILAT_HADERECH_HE = `יְהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם וְתַצְעִידֵנוּ לְשָׁלוֹם וְתִסְמְכֵנוּ לְשָׁלוֹם, וְתַדְרִיכֵנוּ לְשָׁלוֹם, וְתַגִּיעֵנוּ לִמְחוֹז חֶפְצֵנוּ לְחַיִּים וּלְשִׂמְחָה וּלְשָׁלוֹם. וְתַצִּילֵנוּ מִכַּף כָּל אוֹיֵב וְאוֹרֵב וְלִסְטִים וְחַיּוֹת רָעוֹת בַּדֶּרֶךְ, וּמִכָּל מִינֵי פֻרְעָנִיּוֹת הַמִּתְרַגְּשׁוֹת לָבוֹא לָעוֹלָם, וְתִשְׁלַח בְּרָכָה בְּכָל מַעֲשֵׂה יָדֵינוּ, וְתִתְּנֵנוּ לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל רֹאֵינוּ, וְתִשְׁמַע קוֹל תַּחֲנוּנֵינוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלָּה וְתַחֲנוּן אָתָּה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.`;

const TEFILAT_HADERECH_CLEAN = `יהי רצון מלפניך יי אלהינו ואלהי אבותינו, שתוליכנו לשלום ותצעידנו לשלום ותסמכנו לשלום, ותדריכנו לשלום, ותגיענו למחוז חפצנו לחיים ולשמחה ולשלום. ותצילנו מכף כל אויב ואורב ולסטים וחיות רעות בדרך, ומכל מיני פורענויות המתרגשות לבוא לעולם, ותשלח ברכה בכל מעשה ידינו, ותתננו לחן ולחסד ולרחמים בעיניך ובעיני כל רואינו, ותשמע קול תחנונינו, כי אל שומע תפלה ותחנון אתה. ברוך אתה יי, שומע תפלה.`;

const TEFILAT_HADERECH_VOICE = `יהי רצון מלפניך אדוניי אלוהינו ואלוהי אבותינו, שתוליכינו לשלום ותאצעידינו לשלום ותסמיכינו לשלום, ותדריכינו לשלום, ותגיעיינו למחוז חפציינו לחיים ולשמחה ולשלום. ותציליינו מכף כול אויב ואורב וליסטים וחיות רעות בדרך, ומכול מיני פורענויות המתרגשות לבוא לעולם, ותשלח ברכה בכול מעשה ידינו, ותתננו לחן ולחסד ולרחמים בעיניך ובעיני כול רואינו, ותשמע קול תחנונינו, כי אל שומע תפלה ותחנון אתה. ברוך אתה אדוניי, שומע תפלה.`;

export function TefilatHaDerech() {
  const showNikud = useSettingsStore((s: UserSettings) => s.showNikud);
  const [isPlaying, setIsPlaying] = useState(false);

  const text = showNikud ? TEFILAT_HADERECH_HE : TEFILAT_HADERECH_CLEAN;

  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(TEFILAT_HADERECH_VOICE);
      utterance.lang = 'he-IL';
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      const voices = window.speechSynthesis.getVoices();
      const hebVoice = voices.find(v => v.lang.startsWith('he'));
      if (hebVoice) utterance.voice = hebVoice;

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="screen tefilat-haderech-screen">
      <StandardHeader title="תפילת הדרך" showBack={true} />
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
