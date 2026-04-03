import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/data');
const SEFARIA_BASE = 'https://www.sefaria.org/api/v3/texts';
const SEFARIA_INDEX_BASE = 'https://www.sefaria.org/api/v2/index';

function cleanNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

/**
 * Strip HTML — remove span elements but keep meaningful elements like <b>, <i>
 * For prayer text we want clean, HTML-free plain text
 */
function stripHtmlFull(text: string): string {
  // Replace tags except <small> and </small>
  return text.replace(/<\/?(?!(?:small)\b)[^>]+>/gi, '').replace(/&thinsp;/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}

/** Rate-limit safe fetch */
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

/** Fetch Hebrew text for a Sefaria ref, returns flat array of paragraphs */
async function fetchRefText(ref: string): Promise<string[]> {
  const encoded = encodeURIComponent(ref);
  const data = await fetchJson(`${SEFARIA_BASE}/${encoded}`);
  const vers = (data.versions ?? []) as any[];
  
  // Try to find Hebrew version
  const he = vers.find((v: any) => v.language === 'he') ?? vers[0];
  if (!he) return [];
  
  const text = he.text;
  if (!text) return [];
  if (typeof text === 'string') return [stripHtmlFull(text)];
  if (Array.isArray(text)) {
    return (text as any[]).flat(Infinity).map((t: any) => stripHtmlFull(String(t ?? '')));
  }
  return [];
}

/** Get the full tree of leaf refs from a Sefaria index node */
function collectLeafRefs(node: any, prefix: string): { ref: string; title: string }[] {
  const nodeTitle = node.title ?? '';
  const ref = prefix ? `${prefix}, ${nodeTitle}` : nodeTitle;
  
  if (!node.nodes) {
    // Leaf node
    return [{ ref, title: nodeTitle }];
  }
  
  const results: { ref: string; title: string }[] = [];
  for (const child of node.nodes) {
    results.push(...collectLeafRefs(child, ref));
  }
  return results;
}

/** Find a node by title path in index tree */
function findNode(nodes: any[], titlePath: string[]): any | null {
  const [head, ...rest] = titlePath;
  const found = nodes.find((n: any) => n.title === head);
  if (!found) return null;
  if (rest.length === 0) return found;
  if (!found.nodes) return null;
  return findNode(found.nodes, rest);
}

interface SectionSpec {
  titlePath: string[];   // path to the section node in the index
  sectionTitle: string;  // Hebrew label for the section
  id: string;            // slug for the section
}

interface PrayerSpec {
  id: string;
  titleHe: string;
  category: 'daily' | 'shabbat' | 'holiday' | 'special';
  sefariaBook: string;  // top-level Sefaria book title
  sections: SectionSpec[];
}

// ============================================================
// PRAYER DEFINITIONS PER NUSACH
// ============================================================

type NusachId = 'sefard' | 'ashkenaz' | 'edot-hamizrach';

const PRAYER_DEFINITIONS: Record<NusachId, PrayerSpec[]> = {
  sefard: [
    {
      id: 'shacharit',
      titleHe: 'שחרית',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'morning-blessings', titlePath: ['Weekday Shacharit', 'Morning Blessings'], sectionTitle: 'ברכות השחר' },
        { id: 'torah-blessings', titlePath: ['Weekday Shacharit', 'Blessings on Torah'], sectionTitle: 'ברכות התורה' },
        { id: 'morning-prayer', titlePath: ['Weekday Shacharit', 'Morning Prayer'], sectionTitle: 'פסוקי דזימרה' },
        { id: 'korbanot', titlePath: ['Weekday Shacharit', 'Korbanot'], sectionTitle: 'קורבנות' },
        { id: 'hodu', titlePath: ['Weekday Shacharit', 'Hodu'], sectionTitle: 'הודו' },
        { id: 'yishtabach', titlePath: ['Weekday Shacharit', 'Yishtabach'], sectionTitle: 'ישתבח' },
        { id: 'shema', titlePath: ['Weekday Shacharit', 'The Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday Shacharit', 'Amidah'], sectionTitle: 'עמידה' },
        { id: 'tachanun', titlePath: ['Weekday Shacharit', 'Tachanun'], sectionTitle: 'תחנון' },
        { id: 'ashrei', titlePath: ['Weekday Shacharit', 'Ashrei'], sectionTitle: 'אשרי' },
        { id: 'aleinu', titlePath: ['Weekday Shacharit', 'Aleinu'], sectionTitle: 'עלינו לשבח' },
        { id: 'song-of-day', titlePath: ['Weekday Shacharit', 'Song of the Day'], sectionTitle: 'שיר של יום' },
      ],
    },
    {
      id: 'mincha',
      titleHe: 'מנחה',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'korbanot', titlePath: ['Weekday Mincha', 'Korbanot'], sectionTitle: 'קורבנות' },
        { id: 'ashrei', titlePath: ['Weekday Mincha', 'Ashrei'], sectionTitle: 'אשרי' },
        { id: 'amidah', titlePath: ['Weekday Mincha', 'Amidah'], sectionTitle: 'עמידה' },
        { id: 'tachanun', titlePath: ['Weekday Mincha', 'Tachanun'], sectionTitle: 'תחנון' },
        { id: 'aleinu', titlePath: ['Weekday Mincha', 'Aleinu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'maariv',
      titleHe: 'ערבית',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'shema', titlePath: ['Weekday Maariv', 'The Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday Maariv', 'Amidah'], sectionTitle: 'עמידה' },
        { id: 'aleinu', titlePath: ['Weekday Maariv', 'Aleinu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'bedtime-shema',
      titleHe: 'קריאת שמע על המיטה',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'bedtime-shema', titlePath: ['Bedtime Shema'], sectionTitle: 'קריאת שמע על המיטה' },
      ],
    },
    {
      id: 'birkat-hamazon',
      titleHe: 'ברכת המזון',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'birkat-hamazon', titlePath: ['Birchat HaMazon'], sectionTitle: 'ברכת המזון' },
      ],
    },
    {
      id: 'parashat-haman',
      titleHe: 'פרשת המן',
      category: 'special',
      sefariaBook: 'Exodus',
      sections: [
        { id: 'haman', titlePath: ['16', '4-36'], sectionTitle: 'פרשת המן' },
      ],
    },
    {
      id: 'tefilat-hashlah',
      titleHe: 'תפילת השל״ה',
      category: 'special',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'shlah', titlePath: ['Tefilat HaShlah'], sectionTitle: 'תפילת השל״ה הקדוש' },
      ],
    },
    {
      id: 'candle-lighting',
      titleHe: 'הדלקת נרות',
      category: 'special',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'candles', titlePath: ['Shabbat Prayers', 'Lighting of the Candles'], sectionTitle: 'סדר הדלקת נרות' },
      ],
    },
  ],

  ashkenaz: [
    {
      id: 'shacharit',
      titleHe: 'שחרית',
      category: 'daily',
      sefariaBook: 'Siddur Ashkenaz',
      sections: [
        { id: 'morning-blessings', titlePath: ['Weekday', 'Shacharit', 'Preparatory Prayers', 'Morning Blessings'], sectionTitle: 'ברכות השחר' },
        { id: 'modeh-ani', titlePath: ['Weekday', 'Shacharit', 'Preparatory Prayers', 'Modeh Ani'], sectionTitle: 'מודה אני' },
        { id: 'ma-tovu', titlePath: ['Weekday', 'Shacharit', 'Preparatory Prayers', 'Ma Tovu'], sectionTitle: 'מה טובו' },
        { id: 'adon-olam', titlePath: ['Weekday', 'Shacharit', 'Preparatory Prayers', 'Adon Olam'], sectionTitle: 'אדון עולם' },
        { id: 'pesukei-dezimra', titlePath: ['Weekday', 'Shacharit', 'Pesukei Dezimra', 'Barukh She\'amar'], sectionTitle: 'ברוך שאמר' },
        { id: 'ashrei', titlePath: ['Weekday', 'Shacharit', 'Pesukei Dezimra', 'Ashrei'], sectionTitle: 'אשרי' },
        { id: 'yishtabach', titlePath: ['Weekday', 'Shacharit', 'Pesukei Dezimra', 'Yishtabach'], sectionTitle: 'ישתבח' },
        { id: 'shema', titlePath: ['Weekday', 'Shacharit', 'Shacharit', 'Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday', 'Shacharit', 'Shacharit', 'Amidah', 'Patriarchs'], sectionTitle: 'עמידה' },
        { id: 'tachanun', titlePath: ['Weekday', 'Shacharit', 'Tachanun', 'Nefilat Appayim'], sectionTitle: 'תחנון' },
        { id: 'aleinu', titlePath: ['Weekday', 'Shacharit', 'Concluding Prayers', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'mincha',
      titleHe: 'מנחה',
      category: 'daily',
      sefariaBook: 'Siddur Ashkenaz',
      sections: [
        { id: 'ashrei', titlePath: ['Weekday', 'Minchah', 'Ashrei'], sectionTitle: 'אשרי' },
        { id: 'amidah', titlePath: ['Weekday', 'Minchah', 'Amida', 'Patriarchs'], sectionTitle: 'עמידה' },
        { id: 'tachanun', titlePath: ['Weekday', 'Minchah', 'Post Amidah', 'Tachanun', 'Nefilat Appayim'], sectionTitle: 'תחנון' },
        { id: 'aleinu', titlePath: ['Weekday', 'Minchah', 'Concluding Prayers', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'maariv',
      titleHe: 'ערבית',
      category: 'daily',
      sefariaBook: 'Siddur Ashkenaz',
      sections: [
        { id: 'shema', titlePath: ['Weekday', 'Maariv', 'Blessings of the Shema', 'Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday', 'Maariv', 'Amidah', 'Divine Might'], sectionTitle: 'עמידה' },
        { id: 'aleinu', titlePath: ['Weekday', 'Maariv', 'Concluding Prayers', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'bedtime-shema',
      titleHe: 'קריאת שמע על המיטה',
      category: 'daily',
      sefariaBook: 'Siddur Ashkenaz',
      sections: [
        { id: 'bedtime-shema', titlePath: ['Weekday', 'Bedtime Shema', 'Shema'], sectionTitle: 'קריאת שמע על המיטה' },
      ],
    },
    {
      id: 'birkat-hamazon',
      titleHe: 'ברכת המזון',
      category: 'daily',
      sefariaBook: 'Siddur Ashkenaz',
      sections: [
        { id: 'birkat-hamazon', titlePath: ['Berachot', 'Birkat Hamazon'], sectionTitle: 'ברכת המזון' },
      ],
    },
  ],

  'edot-hamizrach': [
    {
      id: 'shacharit',
      titleHe: 'שחרית',
      category: 'daily',
      sefariaBook: 'Siddur Edot HaMizrach',
      sections: [
        { id: 'morning-prayer', titlePath: ['Weekday Shacharit', 'Morning Prayer'], sectionTitle: 'פסוקי דזימרה' },
        { id: 'hodu', titlePath: ['Weekday Shacharit', 'Hodu'], sectionTitle: 'הודו' },
        { id: 'pesukei-dezimra', titlePath: ['Weekday Shacharit', 'Pesukei D\'Zimra'], sectionTitle: 'פסוקי דזימרה' },
        { id: 'shema', titlePath: ['Weekday Shacharit', 'The Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday Shacharit', 'Amida'], sectionTitle: 'עמידה' },
        { id: 'vidui', titlePath: ['Weekday Shacharit', 'Vidui'], sectionTitle: 'וידוי ותחנון' },
        { id: 'ashrei', titlePath: ['Weekday Shacharit', 'Ashrei'], sectionTitle: 'אשרי' },
        { id: 'uva-letzion', titlePath: ['Weekday Shacharit', 'Uva LeSion'], sectionTitle: 'ובא לציון' },
        { id: 'aleinu', titlePath: ['Weekday Shacharit', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'mincha',
      titleHe: 'מנחה',
      category: 'daily',
      sefariaBook: 'Siddur Edot HaMizrach',
      sections: [
        { id: 'offerings', titlePath: ['Weekday Mincha', 'Offerings'], sectionTitle: 'קורבנות' },
        { id: 'amidah', titlePath: ['Weekday Mincha', 'Amida'], sectionTitle: 'עמידה' },
        { id: 'vidui', titlePath: ['Weekday Mincha', 'Vidui'], sectionTitle: 'וידוי ותחנון' },
        { id: 'aleinu', titlePath: ['Weekday Mincha', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'maariv',
      titleHe: 'ערבית',
      category: 'daily',
      sefariaBook: 'Siddur Edot HaMizrach',
      sections: [
        { id: 'barchu', titlePath: ['Weekday Arvit', 'Barchu'], sectionTitle: 'ברכו' },
        { id: 'shema', titlePath: ['Weekday Arvit', 'The Shema'], sectionTitle: 'קריאת שמע' },
        { id: 'amidah', titlePath: ['Weekday Arvit', 'Amidah'], sectionTitle: 'עמידה' },
        { id: 'aleinu', titlePath: ['Weekday Arvit', 'Alenu'], sectionTitle: 'עלינו לשבח' },
      ],
    },
    {
      id: 'bedtime-shema',
      titleHe: 'קריאת שמע על המיטה',
      category: 'daily',
      sefariaBook: 'Siddur Edot HaMizrach',
      sections: [
        { id: 'bedtime-shema', titlePath: ['Bedtime Shema'], sectionTitle: 'קריאת שמע על המיטה' },
      ],
    },
    {
      id: 'birkat-hamazon',
      titleHe: 'ברכת המזון',
      category: 'daily',
      sefariaBook: 'Siddur Sefard',  // fallback to Sefard
      sections: [
        { id: 'birkat-hamazon', titlePath: ['Birchat HaMazon'], sectionTitle: 'ברכת המזון' },
      ],
    },
    {
      id: 'parashat-haman',
      titleHe: 'פרשת המן',
      category: 'special',
      sefariaBook: 'Exodus',
      sections: [
        { id: 'haman', titlePath: ['16', '4-36'], sectionTitle: 'פרשת המן' },
      ],
    },
    {
      id: 'tefilat-hashlah',
      titleHe: 'תפילת השל״ה',
      category: 'special',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'shlah', titlePath: ['Tefilat HaShlah'], sectionTitle: 'תפילת השל״ה הקדוש' },
      ],
    },
    {
      id: 'candle-lighting',
      titleHe: 'הדלקת נרות',
      category: 'special',
      sefariaBook: 'Siddur Sefard',
      sections: [
        { id: 'candles', titlePath: ['Shabbat Prayers', 'Lighting of the Candles'], sectionTitle: 'סדר הדלקת נרות' },
      ],
    },
  ],
};

/** Delay helper */
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Build a single prayer JSON for one nusach */
async function buildPrayer(nusach: NusachId, prayerSpec: PrayerSpec) {
  const filename = `prayer-${prayerSpec.id}-${nusach}.json`;
  console.log(`\n📖 Building ${filename}...`);

  // Load the index once
  const indexUrl = `${SEFARIA_INDEX_BASE}/${prayerSpec.sefariaBook.replace(/ /g, '_')}`;
  const index = await fetchJson(indexUrl);
  const rootNodes: any[] = index.schema?.nodes ?? [];

  const sections = [];

  for (const sectionSpec of prayerSpec.sections) {
    const node = findNode(rootNodes, sectionSpec.titlePath);
    if (!node) {
      console.warn(`  ⚠️  Section not found: ${sectionSpec.titlePath.join(' > ')}`);
      continue;
    }

    // Collect all leaf refs under this node
    const bookTitle = prayerSpec.sefariaBook;
    const parentPath = sectionSpec.titlePath.slice(0, -1).join(', ');
    const prefix = parentPath ? `${bookTitle}, ${parentPath}` : bookTitle;
    const leafRefs = collectLeafRefs(node, prefix);

    const nodes: any[] = [];

    for (const leaf of leafRefs) {
      try {
        console.log(`  → Fetching: ${leaf.ref}`);
        const paragraphs = await fetchRefText(leaf.ref);
        await delay(150); // rate limit

        for (let i = 0; i < paragraphs.length; i++) {
          const text = paragraphs[i].trim();
          if (!text) continue;
          nodes.push({
            id: `${sectionSpec.id}-${leaf.title.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`,
            type: 'text',
            contentHe: text,
            contentHeClean: cleanNikud(text),
          });
        }
      } catch (err) {
        console.warn(`  ⚠️  Failed: ${leaf.ref}:`, (err as Error).message);
      }
    }

    if (nodes.length > 0) {
      sections.push({
        id: sectionSpec.id,
        title: sectionSpec.sectionTitle,
        nodes,
      });
    } else {
      console.warn(`  ⚠️  No content fetched for section: ${sectionSpec.sectionTitle}`);
    }
  }

  const doc = {
    id: prayerSpec.id,
    title: prayerSpec.titleHe,
    category: prayerSpec.category,
    nusach: nusach === 'sefard' ? 'sefard' : nusach === 'ashkenaz' ? 'ashkenaz' : 'edot-hamizrach',
    sections,
  };

  const outPath = path.join(DATA_DIR, filename);
  await fs.writeFile(outPath, JSON.stringify(doc, null, 2), 'utf-8');
  console.log(`  ✅ Saved ${filename} (${sections.length} sections, ${sections.reduce((a, s) => a + s.nodes.length, 0)} nodes)`);
}

/** Build Tehillim */
async function buildTehillim() {
  console.log('\n📖 Building Tehillim (1-150)...');
  const chapters = [];
  for (let i = 1; i <= 150; i++) {
    process.stdout.write(`  Psalms.${i}... `);
    try {
      const raw = await fetchRefText(`Psalms.${i}`);
      chapters.push({
        number: i,
        contentHe: raw.join('\n'),
        contentHeClean: cleanNikud(raw.join('\n')),
        verseCount: raw.length,
      });
      console.log('OK');
      await delay(100);
    } catch (err) {
      console.log('ERROR:', (err as Error).message);
    }
  }
  const outPath = path.join(DATA_DIR, 'tehillim.json');
  await fs.writeFile(outPath, JSON.stringify(chapters, null, 2), 'utf-8');
  console.log(`✅ Tehillim saved (${chapters.length} chapters)`);
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const buildAll = args.length === 0 || args.includes('all');
  const buildTehillimOnly = args.includes('tehillim');
  const nusachFilter = args.find(a => ['sefard', 'ashkenaz', 'edot-hamizrach'].includes(a)) as NusachId | undefined;
  const prayerFilter = args.find(a => ['shacharit', 'mincha', 'maariv', 'bedtime-shema', 'birkat-hamazon'].includes(a));

  try {
    if (buildTehillimOnly || buildAll) {
      await buildTehillim();
    }

    if (!buildTehillimOnly) {
      const nusachList: NusachId[] = nusachFilter ? [nusachFilter] : ['sefard', 'ashkenaz', 'edot-hamizrach'];
      
      for (const nusach of nusachList) {
        const prayers = PRAYER_DEFINITIONS[nusach];
        const filtered = prayerFilter ? prayers.filter(p => p.id === prayerFilter) : prayers;
        
        for (const prayer of filtered) {
          await buildPrayer(nusach, prayer);
        }
      }
    }

    console.log('\n🎉 Content build complete!');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

main();
