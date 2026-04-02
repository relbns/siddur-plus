/**
 * Sefaria Content Ingestion Script
 * Fetches Tehillim (all 150 chapters) from Sefaria API and formats
 * into the app's JSON data structure.
 *
 * Run: npx tsx scripts/build-content.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const API_BASE = 'https://www.sefaria.org/api/v3/texts';
const OUT_DIR = join(import.meta.dirname ?? __dirname, '..', 'public', 'data');

// Unicode ranges for stripping
const CANTILLATION_RE = /[\u0591-\u05AF]/g;   // te'amim (cantillation marks)
const NIKUD_RE = /[\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g; // vowel points
const HTML_RE = /<[^>]+>/g;                    // HTML tags
const SPECIAL_CHARS_RE = /&[a-z]+;/g;          // HTML entities like &thinsp;

interface TehillimChapter {
  number: number;
  book: number;
  verseCount: number;
  contentHe: string;
  contentHeClean: string;
}

function getBook(chapter: number): number {
  if (chapter <= 41) return 1;
  if (chapter <= 72) return 2;
  if (chapter <= 89) return 3;
  if (chapter <= 106) return 4;
  return 5;
}

/** Strip HTML tags and entities */
function stripHtml(s: string): string {
  return s
    .replace(HTML_RE, '')
    .replace(SPECIAL_CHARS_RE, '')
    .replace(/\u00A0/g, ' ')
    .trim();
}

/** Strip cantillation marks but keep nikud */
function withNikud(s: string): string {
  return stripHtml(s).replace(CANTILLATION_RE, '');
}

/** Strip both cantillation and nikud */
function withoutNikud(s: string): string {
  return withNikud(s).replace(NIKUD_RE, '');
}

async function fetchChapter(num: number): Promise<TehillimChapter | null> {
  const url = `${API_BASE}/Psalms.${num}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ❌ HTTP ${res.status} for chapter ${num}`);
      return null;
    }
    const data = await res.json();
    const versions = data.versions ?? [];
    const heVersion = versions.find((v: { language: string }) => v.language === 'he');
    if (!heVersion?.text) {
      console.error(`  ❌ No Hebrew text for chapter ${num}`);
      return null;
    }

    const verses: string[] = Array.isArray(heVersion.text) ? heVersion.text : [heVersion.text];

    return {
      number: num,
      book: getBook(num),
      verseCount: verses.length,
      contentHe: verses.map(withNikud).join('\n'),
      contentHeClean: verses.map(withoutNikud).join('\n'),
    };
  } catch (err) {
    console.error(`  ❌ Fetch error for chapter ${num}:`, err);
    return null;
  }
}

async function buildTehillim() {
  console.log('📖 Fetching Tehillim from Sefaria API...');
  mkdirSync(OUT_DIR, { recursive: true });

  const chapters: TehillimChapter[] = [];
  const BATCH_SIZE = 5; // Rate limit friendly

  for (let start = 1; start <= 150; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, 150);
    const batch: Promise<TehillimChapter | null>[] = [];

    for (let i = start; i <= end; i++) {
      batch.push(fetchChapter(i));
    }

    const results = await Promise.all(batch);
    for (const ch of results) {
      if (ch) {
        chapters.push(ch);
        process.stdout.write(`  ✅ ${ch.number} `);
      }
    }
    // Rate limit pause between batches
    if (end < 150) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n\n📝 Writing ${chapters.length} chapters to tehillim.json`);

  writeFileSync(
    join(OUT_DIR, 'tehillim.json'),
    JSON.stringify(chapters, null, 2),
    'utf-8'
  );

  console.log('✅ Done!');
}

buildTehillim().catch(console.error);
