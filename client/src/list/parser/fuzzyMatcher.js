import Fuse from 'fuse.js';
import dictionaryMapping from './dictionary.json';

/**
 * fuzzyMatch
 * Maps a raw search term into a standard catalogue item.
 * 
 * Flow:
 * 1. Check exact dictionary match (Hindi/Hinglish -> English mapping)
 * 2. If no exact mapping, use Fuse.js to find the closest match in the catalogue.
 * 
 * @param {string} rawTerm - The string typed by user
 * @param {Array} catalogue - Array of objects like { id, name, category, ... }
 * @returns {Object|null} - Best matching product from catalogue or null if no match > threshold.
 */
export function fuzzyMatch(rawTerm, catalogue) {
  if (!rawTerm || !catalogue || catalogue.length === 0) return null;
  
  const term = rawTerm.trim().toLowerCase();
  
  // 1. Dictionary translation (Hinglish -> English)
  let translatedTerm = dictionaryMapping[term] || term;

  // Search catalogue using fuse
  const options = {
    includeScore: true,
    keys: ['name', 'category', 'hindi_names', 'common_misspellings'],
    threshold: 0.4, // Lower is more exact. 0.4 allows for some typos.
  };

  const fuse = new Fuse(catalogue, options);
  const results = fuse.search(translatedTerm);

  if (results.length > 0 && results[0].score <= 0.4) {
    return {
      product: results[0].item,
      confidence: 1 - results[0].score
    };
  }

  // Fallback: If not found, maybe translation wasn't needed or was misspelled as well.
  // We can do another raw fuse search on the original term just in case the catalogue 
  // already contains the hinglish term.
  if (translatedTerm !== term) {
    const rawResults = fuse.search(term);
    if (rawResults.length > 0 && rawResults[0].score <= 0.4) {
       return {
         product: rawResults[0].item,
         confidence: 1 - rawResults[0].score
       };
    }
  }

  return null; // Unrecognized
}
