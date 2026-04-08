/**
 * Tokenizer
 * Given a raw string (e.g. pasted shopping list), attempts to split it
 * into recognized product names and quantities.
 */

export function tokenizeList(rawText) {
  if (!rawText) return [];

  // Split by newline or commas
  const lines = rawText.split(/\n|,/).map(line => line.trim()).filter(Boolean);
  
  const parsedItems = lines.map(line => {
    // Basic regex to find quantity separated from text
    // Matches e.g. "2 milk", "milk 2", "1.5 kg rice", "rice 500g"
    const qtyRegex = /(?:^|\s)(\d+(?:\.\d+)?)\s*(kg|g|l|ml|pcs|pack|packet|litres|liter|)?(?:\s|$)/i;
    const match = line.match(qtyRegex);
    
    let quantity = 1;
    let unit = 'unit';
    let rawName = line;

    if (match) {
      quantity = parseFloat(match[1]);
      unit = match[2] ? match[2].toLowerCase() : 'unit';
      // Remove the quantity part from the name string
      rawName = line.replace(match[0], ' ').trim();
    }

    return {
      rawInput: line,
      term: rawName.toLowerCase(), // term to lookup
      quantity,
      unit
    };
  });

  return parsedItems;
}
