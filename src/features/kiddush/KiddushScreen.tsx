import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardHeader } from '../../shared/Header';
import { useContextStore } from '../../core/stores';
import './KiddushScreen.css';

// ============================================================
//  Kiddush text definitions
// ============================================================

interface KiddushSection {
  id: string;
  title: string;
  subtitle?: string;
  instruction?: string;
  text: string;
}

interface KiddushVariant {
  id: string;
  title: string;
  icon: string;
  description?: string;
  sections: KiddushSection[];
}

const LEIL_SHABBAT: KiddushSection[] = [
  {
    id: 'vayehi',
    title: 'ויהי ערב',
    instruction: 'אומרים פסוקים אלו בקול — (בבית הכנסת מהפסוק ויכלו)',
    text: `וַיְהִי עֶרֶב וַיְהִי בֹקֶר יוֹם הַשִּׁשִּׁי.
וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל צְבָאָם.
וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה, וַיִּשְׁבֹּת בַּיּוֹם הַשְּׁבִיעִי מִכָּל מְלַאכְתּוֹ אֲשֶׁר עָשָׂה.
וַיְבָרֶךְ אֱלֹהִים אֶת יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ, כִּי בוֹ שָׁבַת מִכָּל מְלַאכְתּוֹ אֲשֶׁר בָּרָא אֱלֹהִים לַעֲשׂוֹת.`,
  },
  {
    id: 'savri',
    title: 'סברי',
    instruction: 'מגביהים את הכוס ואומרים:',
    text: `סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.`,
  },
  {
    id: 'hagafen-leil-shabbat',
    title: 'ברכת הגפן',
    text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.`,
  },
  {
    id: 'kiddush-leil-shabbat',
    title: 'קידוש השבת',
    text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְרָצָה בָנוּ, וְשַׁבַּת קָדְשׁוֹ בְּאַהֲבָה וּבְרָצוֹן הִנְחִילָנוּ, זִכָּרוֹן לְמַעֲשֵׂה בְרֵאשִׁית. כִּי הוּא יוֹם תְּחִלָּה לְמִקְרָאֵי קֹדֶשׁ, זֵכֶר לִיצִיאַת מִצְרָיִם. כִּי בָנוּ בָחַרְתָּ וְאוֹתָנוּ קִדַּשְׁתָּ מִכָּל הָעַמִּים, וְשַׁבַּת קָדְשֶׁךָ בְּאַהֲבָה וּבְרָצוֹן הִנְחַלְתָּנוּ.
בָּרוּךְ אַתָּה יְהֹוָה מְקַדֵּשׁ הַשַּׁבָּת.`,
  },
];

const YOM_SHABBAT: KiddushSection[] = [
  {
    id: 'veshamru',
    title: 'וְשָׁמְרוּ',
    instruction: 'אומרים פסוקים אלו:',
    text: `וְשָׁמְרוּ בְנֵי יִשְׂרָאֵל אֶת הַשַּׁבָּת, לַעֲשׂוֹת אֶת הַשַּׁבָּת לְדֹרֹתָם בְּרִית עוֹלָם. בֵּינִי וּבֵין בְּנֵי יִשְׂרָאֵל אוֹת הִוא לְעֹלָם, כִּי שֵׁשֶׁת יָמִים עָשָׂה יְהֹוָה אֶת הַשָּׁמַיִם וְאֶת הָאָרֶץ, וּבַיּוֹם הַשְּׁבִיעִי שָׁבַת וַיִּנָּפַשׁ.
עַל כֵּן בֵּרַךְ יְהֹוָה אֶת יוֹם הַשַּׁבָּת וַיְקַדְּשֵׁהוּ.`,
  },
  {
    id: 'savri-yom',
    title: 'סברי',
    instruction: 'מגביהים את הכוס:',
    text: `סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.`,
  },
  {
    id: 'hagafen-yom',
    title: 'ברכת הגפן',
    text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.`,
  },
];

function buildYomTovKiddush(holidayName: string, hebrewHoliday: string, isShabbat: boolean, isDay: boolean): KiddushSection[] {
  const shabbatClause = isShabbat ? 'שַׁבָּתוֹת לִמְנוּחָה וּ' : '';
  const shabbatPreHoliday = isShabbat ? 'הַשַּׁבָּת הַזֶּה וְ' : '';
  const shabbatEnd = isShabbat ? 'הַשַּׁבָּת וְ' : '';


  const isZikaron = holidayName.includes('ראש השנה');
  const shabbatKiddushEnd = isZikaron
    ? 'מְקַדֵּשׁ ' + shabbatEnd + 'יִשְׂרָאֵל וְיוֹם הַזִּכָּרוֹן'
    : 'מְקַדֵּשׁ ' + shabbatEnd + 'יִשְׂרָאֵל וְהַזְּמַנִּים';

  const sections: KiddushSection[] = [];

  if (isDay) {
    // Day kiddush — simpler
    sections.push({
      id: 'savri-day-yomtov',
      title: 'סברי',
      instruction: 'מגביהים את הכוס:',
      text: 'סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.',
    });
    sections.push({
      id: 'hagafen-day-yomtov',
      title: 'ברכת הגפן',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.',
    });
    return sections;
  }

  sections.push({
    id: 'savri-yomtov',
    title: 'סברי',
    instruction: 'מגביהים את הכוס — קודם שמברכים:',
    text: 'סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.',
  });

  sections.push({
    id: 'hagafen-yomtov',
    title: 'ברכת הגפן',
    text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.',
  });

  sections.push({
    id: 'kiddush-yomtov',
    title: 'קידוש יום טוב',
    text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל עָם, וְרוֹמְמָנוּ מִכָּל לָשׁוֹן, וְקִדְּשָׁנוּ בְּמִצְוֹתָיו. וַתִּתֶּן לָנוּ יְהֹוָה אֱלֹהֵינוּ בְּאַהֲבָה ${shabbatClause}מוֹעֲדִים לְשִׂמְחָה, חַגִּים וּזְמַנִּים לְשָׂשׂוֹן, אֶת יוֹם ${shabbatPreHoliday}${hebrewHoliday} הַזֶּה, זְמַן ${hebrewHoliday.includes('פסח') ? 'חֵרוּתֵנוּ' : hebrewHoliday.includes('שבועות') ? 'מַתַּן תּוֹרָתֵנוּ' : hebrewHoliday.includes('סוכות') ? 'שִׂמְחָתֵנוּ' : 'שִׂמְחָתֵנוּ'}, מִקְרָא קֹדֶשׁ, זֵכֶר לִיצִיאַת מִצְרָיִם.
בָּרוּךְ אַתָּה יְהֹוָה ${shabbatKiddushEnd}.`,
  });

  sections.push({
    id: 'shehecheyanu',
    title: 'שהחיינו',
    instruction: 'אומרים שהחיינו בלילה הראשון (ובשני של ראש השנה):',
    text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.',
  });

  return sections;
}

function buildRoshHashanaKiddush(isShabbat: boolean): KiddushSection[] {
  const shabbatClause = isShabbat ? 'שַׁבָּתוֹת לִמְנוּחָה וּ' : '';
  const shabbatPreHoliday = isShabbat ? 'הַשַּׁבָּת הַזֶּה וְ' : '';
  const shabbatEnd = isShabbat ? 'הַשַּׁבָּת וְ' : '';

  return [
    {
      id: 'savri-rh',
      title: 'סברי',
      instruction: 'מגביהים את הכוס:',
      text: 'סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.',
    },
    {
      id: 'hagafen-rh',
      title: 'ברכת הגפן',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.',
    },
    {
      id: 'kiddush-rh',
      title: 'קידוש ראש השנה',
      text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל עָם, וְרוֹמְמָנוּ מִכָּל לָשׁוֹן, וְקִדְּשָׁנוּ בְּמִצְוֹתָיו. וַתִּתֶּן לָנוּ יְהֹוָה אֱלֹהֵינוּ בְּאַהֲבָה ${shabbatClause}אֶת יוֹם ${shabbatPreHoliday}הַזִּכָּרוֹן הַזֶּה, יוֹם תְּרוּעָה, מִקְרָא קֹדֶשׁ, זֵכֶר לִיצִיאַת מִצְרָיִם.
בָּרוּךְ אַתָּה יְהֹוָה מְקַדֵּשׁ ${shabbatEnd}יִשְׂרָאֵל וְיוֹם הַזִּכָּרוֹן.`,
    },
    {
      id: 'shehecheyanu-rh',
      title: 'שהחיינו',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.',
    },
  ];
}

function buildHavdalaKiddush(): KiddushSection[] {
  return [
    {
      id: 'yom-tov-after-shabbat-intro',
      title: 'הבדלה ביום טוב',
      instruction: 'ביום טוב שחל במוצאי שבת — אומרים יקנה״ז (יין, קידוש, נר, הבדלה, זמן):',
      text: 'סַבְרִי מָרָנָן וְרַבָּנָן וְרַבּוֹתַי.',
    },
    {
      id: 'hagafen-yknhz',
      title: 'ברכת הגפן',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.',
    },
    {
      id: 'kiddush-yknhz',
      title: 'קידוש',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל עָם...',
    },
    {
      id: 'ner-yknhz',
      title: 'בורא מאורי האש',
      instruction: 'מברכים על נר של יום טוב (שהיה דלוק מלפני שבת):',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא מְאוֹרֵי הָאֵשׁ.',
    },
    {
      id: 'havdala-yknhz',
      title: 'הבדלה',
      text: `בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּבְדִּיל בֵּין קֹדֶשׁ לְקֹדֶשׁ, בֵּין אוֹר לְחֹשֶׁךְ, בֵּין יִשְׂרָאֵל לָעַמִּים, בֵּין יוֹם הַשְּׁבִיעִי לְשֵׁשֶׁת יְמֵי הַמַּעֲשֶׂה. בֵּין קְדֻשַּׁת שַׁבָּת לִקְדֻשַּׁת יוֹם טוֹב הִבְדַּלְתָּ, וְאֶת יוֹם הַשְּׁבִיעִי מִשֵּׁשֶׁת יְמֵי הַמַּעֲשֶׂה קִדַּשְׁתָּ, הִבְדַּלְתָּ וְקִדַּשְׁתָּ אֶת עַמְּךָ יִשְׂרָאֵל בִּקְדֻשָּׁתֶּךָ.
בָּרוּךְ אַתָּה יְהֹוָה הַמַּבְדִּיל בֵּין קֹדֶשׁ לְקֹדֶשׁ.`,
    },
    {
      id: 'shehecheyanu-yknhz',
      title: 'שהחיינו',
      text: 'בָּרוּךְ אַתָּה יְהֹוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.',
    },
  ];
}

// ============================================================
//  Main component
// ============================================================

export function KiddushScreen() {
  const navigate = useNavigate();
  const context = useContextStore((s) => s.context);

  const variants = useMemo((): KiddushVariant[] => {
    const variants: KiddushVariant[] = [];
    const isNight = context?.currentTimeSlot === 'evening' || context?.currentTimeSlot === 'night';
    const isShabbat = !!context?.isShabbat;
    const isErevShabbat = !!context?.isErevShabbat;
    const isYomTov = !!context?.isYomTov;
    const isErevYomTov = !!context?.isErevYomTov;
    const holidayName = context?.holidayName ?? '';

    // ליל שבת
    if (isErevShabbat || (isShabbat && isNight)) {
      variants.push({
        id: 'leil-shabbat',
        title: 'קידוש ליל שבת',
        icon: '🕯️',
        description: 'קידוש הנאמר בלילה שישי לאחר תפילת ערבית',
        sections: LEIL_SHABBAT,
      });
    }

    // יום שבת
    if (isShabbat && !isNight) {
      variants.push({
        id: 'yom-shabbat',
        title: 'קידוש יום שבת',
        icon: '☀️',
        description: 'קידושא רבה — הקידוש הנאמר בשבת בבוקר',
        sections: YOM_SHABBAT,
      });
    }

    // ראש השנה
    if (holidayName.includes('ראש השנה')) {
      variants.push({
        id: 'rosh-hashana',
        title: `קידוש ראש השנה`,
        icon: '🍎',
        description: 'קידוש מיוחד לראש השנה',
        sections: buildRoshHashanaKiddush(isShabbat),
      });
    }
    // יום טוב אחר (פסח, שבועות, סוכות)
    else if (isYomTov || isErevYomTov) {
      const hebrewMap: Record<string, string> = {
        'פסח': 'חַג הַפֶּסַח',
        'שבועות': 'חַג הַשָּׁבוּעוֹת',
        'סוכות': 'חַג הַסֻּכּוֹת',
        'שמחת תורה': 'חַג הַשְּׂמִינִי חַג הָעֲצֶרֶת',
        'שמיני עצרת': 'חַג הַשְּׂמִינִי חַג הָעֲצֶרֶת',
      };
      const hebrewHoliday = Object.entries(hebrewMap).find(([k]) => holidayName.includes(k))?.[1] ?? holidayName;
      variants.push({
        id: 'leil-yomtov',
        title: `קידוש ל${holidayName}`,
        icon: holidayName.includes('פסח') ? '🫙' : holidayName.includes('סוכות') ? '🌿' : '✡️',
        description: `קידוש מיוחד ל${holidayName}`,
        sections: buildYomTovKiddush(holidayName, hebrewHoliday, isShabbat, false),
      });
      if (!isNight) {
        variants.push({
          id: 'yom-yomtov',
          title: `קידוש יום ${holidayName}`,
          icon: '🍷',
          description: 'קידוש הבוקר ביום טוב',
          sections: buildYomTovKiddush(holidayName, hebrewHoliday, isShabbat, true),
        });
      }
    }

    // יקנה"ז (יום טוב במוצאי שבת)
    if (isErevYomTov && isShabbat) {
      variants.push({
        id: 'yknhz',
        title: 'יקנה״ז — יו"ט במוצאי שבת',
        icon: '🕍',
        description: 'קידוש מיוחד כשחל יום טוב במוצאי שבת',
        sections: buildHavdalaKiddush(),
      });
    }

    // אם אין הקשר — הצג הכל
    if (variants.length === 0) {
      variants.push({
        id: 'leil-shabbat',
        title: 'קידוש ליל שבת',
        icon: '🕯️',
        description: 'קידוש הנאמר בלילה שישי לאחר תפילת ערבית',
        sections: LEIL_SHABBAT,
      },
      {
        id: 'yom-shabbat',
        title: 'קידוש יום שבת',
        icon: '☀️',
        description: 'קידושא רבה — הקידוש הנאמר בשבת בבוקר',
        sections: YOM_SHABBAT,
      });
    }

    return variants;
  }, [context]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id ?? '');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  function scrollToSection(id: string) {
    setActiveSection(id);
    const el = document.getElementById(`kiddush-${id}`);
    if (el) {
      const offset = 56;
      const y = el.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  return (
    <div className="screen kiddush-screen">
      <StandardHeader title="ספר קידושים" showBack={true} onBack={() => navigate(-1)} />

      {/* Variant tabs */}
      {variants.length > 1 && (
        <div className="kiddush-tabs">
          <div className="kiddush-tabs-inner">
            {variants.map((v) => (
              <button
                key={v.id}
                className={`kiddush-tab ${selectedVariantId === v.id ? 'active' : ''}`}
                onClick={() => { setSelectedVariantId(v.id); setActiveSection(null); }}
              >
                <span className="kiddush-tab-icon">{v.icon}</span>
                <span className="kiddush-tab-label">{v.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Variant hero */}
      <div className="kiddush-hero">
        <div className="kiddush-hero-icon">{selectedVariant?.icon}</div>
        <h1 className="kiddush-hero-title">{selectedVariant?.title}</h1>
        {selectedVariant?.description && (
          <p className="kiddush-hero-desc">{selectedVariant.description}</p>
        )}
      </div>

      {/* Section quick-nav */}
      {(selectedVariant?.sections.length ?? 0) > 2 && (
        <nav className="kiddush-section-nav">
          <div className="kiddush-section-nav-inner">
            {selectedVariant?.sections.map((s) => (
              <button
                key={s.id}
                className={`kiddush-sec-btn ${activeSection === s.id ? 'active' : ''}`}
                onClick={() => scrollToSection(s.id)}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Content */}
      <div className="container kiddush-content">
        {selectedVariant?.sections.map((section) => (
          <div key={section.id} id={`kiddush-${section.id}`} className="kiddush-section">
            <h2 className="kiddush-section-title">{section.title}</h2>
            {section.instruction && (
              <div className="kiddush-instruction">
                <span className="kiddush-instruction-arrow">▸</span>
                <p>{section.instruction}</p>
              </div>
            )}
            <div className="kiddush-text-block">
              {section.text.split('\n').map((line, i) => (
                line.trim() ? (
                  <p key={i} className="kiddush-text-line">{line}</p>
                ) : (
                  <br key={i} />
                )
              ))}
            </div>
          </div>
        ))}

        {/* Tip */}
        <div className="kiddush-tip card">
          <div className="kiddush-tip-icon">💡</div>
          <div className="kiddush-tip-text">
            <strong>הלכה:</strong> מצות קידוש מן התורה חלה גם על הנשים. הכוס צריכה להכיל לפחות רביעית (≈81 מ"ל).
          </div>
        </div>
      </div>
    </div>
  );
}
