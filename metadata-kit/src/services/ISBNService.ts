// ISBN Service for book metadata extraction
import type { BookMetadata } from '../types/index.js';

export async function extractISBN(input: string): Promise<string | null> {
  const isbnMatch = input.match(/\b(?:ISBN[-\s]?)?(\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1})\b/i);
  return isbnMatch ? isbnMatch[1] : null;
}