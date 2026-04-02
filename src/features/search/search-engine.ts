import MiniSearch from 'minisearch';

export interface SearchResult {
  id: string;
  type: 'prayer' | 'tehillim';
  title: string;
  preview: string;
  route: string;
}

interface IndexedDocument {
  id: string; // The exact node id
  type: 'prayer' | 'tehillim';
  docId: string; // The parent document id (e.g., 'shacharit' or chapter '23')
  title: string; // Human readable title
  text: string; // Clean Hebrew text for search
  rawText: string; // Original Hebrew text for preview
}

const cleanNikud = (text: string) => text.replace(/[\u0591-\u05C7]/g, '');

class OfflineSearchEngine {
  private minisearch: MiniSearch<IndexedDocument>;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.minisearch = new MiniSearch({
      fields: ['title', 'text'],
      storeFields: ['id', 'type', 'docId', 'title', 'rawText'],
      processTerm: (term) => cleanNikud(term).toLowerCase(),
      searchOptions: {
        processTerm: (term) => cleanNikud(term).toLowerCase(),
        prefix: true,
        fuzzy: 0.2
      }
    });
  }

  async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadAllData();
    await this.loadPromise;
    this.isLoaded = true;
  }

  private async _loadAllData() {
    const docs: IndexedDocument[] = [];

    // Load available common prayers
    const prayerIds = ['shacharit', 'mincha', 'maariv', 'bedtime-shema', 'birkat-hamazon'];
    for (const pid of prayerIds) {
      try {
        const res = await fetch(`./data/prayer-${pid}-sefard.json`);
        if (!res.ok) continue;
        const data = await res.json();
        
        // Traverse nodes
        for (const section of data.sections) {
          for (const node of section.nodes) {
            if (node.type === 'text') {
              docs.push({
                id: node.id,
                type: 'prayer',
                docId: data.id,
                title: `${data.title} - ${section.title}`,
                text: node.contentHeClean || cleanNikud(node.contentHe || ''),
                rawText: node.contentHe || ''
              });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to load ${pid} for search`, err);
      }
    }

    // Load Tehillim
    try {
      const res = await fetch('./data/tehillim.json');
      if (res.ok) {
        const chapters = await res.json();
        for (const ch of chapters) {
          docs.push({
            id: `tehillim-ch-${ch.number}`,
            type: 'tehillim',
            docId: ch.number.toString(),
            title: `תהילים פרק ${ch.number}`,
            text: ch.contentHeClean,
            rawText: ch.contentHe
          });
        }
      }
    } catch (err) {
      console.error('Failed to load Tehillim for search', err);
    }

    this.minisearch.addAll(docs);
  }

  search(query: string): SearchResult[] {
    if (!query || query.trim() === '') return [];
    
    // Use prefix search to match partial words (e.g. searching "ברו" matches "ברוך")
    const results = this.minisearch.search(query, { prefix: true, combineWith: 'AND' });
    
    return results.slice(0, 20).map(r => {
      // Find the snippet around the match in the raw text
      const rawText = r.rawText as string;
      const preview = rawText.length > 100 ? rawText.substring(0, 100) + '...' : rawText;
      
      const type = r.type as 'prayer' | 'tehillim';
      const docId = r.docId as string;
      
      let route = '';
      if (type === 'prayer') route = `/siddur/${docId}#${r.id}`;
      else route = `/tehillim/${docId}`;
      
      return {
        id: r.id,
        type,
        title: r.title as string,
        preview,
        route
      };
    });
  }
}

export const searchEngine = new OfflineSearchEngine();
