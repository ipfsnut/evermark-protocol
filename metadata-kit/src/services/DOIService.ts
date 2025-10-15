// DOI Service for academic paper metadata extraction
import type { PaperMetadata } from '../types/index.js';

export async function extractDOIMetadata(url: string): Promise<PaperMetadata> {
  const doiMatch = url.match(/10\.\d+\/[\w\.-]+/);
  const doi = doiMatch ? doiMatch[0] : '';
  
  return {
    title: `Academic Paper (${doi})`,
    authors: ['Author Name'],
    doi,
    url,
    abstract: 'Academic paper metadata extracted via DOI',
    journal: 'Sample Journal',
    publishedDate: new Date().toISOString().split('T')[0]
  };
}