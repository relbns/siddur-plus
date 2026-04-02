import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/data');

// Base URL for Sefaria API
const SEFARIA_BASE = 'https://www.sefaria.org/api/v3/texts';

/**
 * Clean text from nikud (Hebrew vowels/cantillation)
 */
function cleanNikud(text: string): string {
  // Removes unicode range for Hebrew vowels & cantillation marks
  return text.replace(/[\u0591-\u05C7]/g, '');
}

/**
 * Remove HTML tags from Sefaria text (e.g. <b>, <i>, <small>)
 */
function stripHtml(text: string): string {
  return text.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Process raw text array from Sefaria into standard ContentNode objects
 */
function processTextNodes(
  rawTexts: string[],
  prefixId: string,
  condition?: string
): any[] {
  return rawTexts.map((text, index) => {
    const cleanedHtml = stripHtml(text);
    return {
      id: `${prefixId}-${index + 1}`,
      type: 'text',
      contentHe: cleanedHtml,
      contentHeClean: cleanNikud(cleanedHtml),
      ...(condition ? { renderCondition: condition } : {}),
    };
  });
}

/**
 * Fetch a text ref from Sefaria
 */
async function fetchSefariaText(ref: string): Promise<string[]> {
  console.log(`Fetching ${ref}...`);
  const res = await fetch(`${SEFARIA_BASE}/${encodeURIComponent(ref)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${ref}: ${res.statusText}`);
  }
  const data = await res.json();
  
  // v3 API structure: return versions[0].text which is array of strings (or nested arrays)
  const textPayload = data.versions?.[0]?.text;
  if (!textPayload) return [];

  // Flatten if it's nested arrays
  return Array.isArray(textPayload) ? textPayload.flat(Infinity) : [textPayload];
}

/**
 * Command: Build Tehillim Full (1-150)
 */
async function buildTehillim() {
  console.log('Building Tehillim (Chapters 1-150)...');
  
  const chapters = [];
  
  // Fetch sequentially to respect rate limits
  for (let i = 1; i <= 150; i++) {
    process.stdout.write(`Fetching Psalms.${i}... `);
    try {
      const raw = await fetchSefariaText(`Psalms.${i}`);
      chapters.push({
        number: i,
        contentHe: raw.join('\\n'),
        contentHeClean: cleanNikud(raw.join('\\n')),
        verseCount: raw.length,
      });
      console.log('OK');
      
      // Delay 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.log('ERROR');
      console.error(`Failed on chapter ${i}:`, err);
      // We shouldn't fail the whole build if one fails, but standard is they all exist.
    }
  }

  await fs.writeFile(
    path.join(DATA_DIR, 'tehillim.json'),
    JSON.stringify(chapters, null, 2),
    'utf-8'
  );
  console.log(`Tehillim written to public/data/tehillim.json (${chapters.length} chapters)`);
}

/**
 * Main execution
 */
async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await buildTehillim();
    console.log('✅ Content Build Complete!');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

main();
