import React, { useState } from 'react';
import { Button } from '../../shared/components';
import { tokenizeList } from '../parser/tokenizer';
import { fuzzyMatch } from '../parser/fuzzyMatcher';

export default function ImportList({ catalogue, onAddItems, onComplete }) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    setIsProcessing(true);
    
    // Slight timeout to show processing state if catalogue is huge
    setTimeout(() => {
      const tokens = tokenizeList(text);
      const newItems = tokens.map(token => {
        const matchResult = fuzzyMatch(token.term, catalogue);
        if (matchResult) {
          return {
            product: matchResult.product,
            quantity: token.quantity,
            unit: token.unit,
            resolved: true
          };
        } else {
          return {
            rawInput: token.rawInput,
            quantity: token.quantity,
            unit: token.unit,
            resolved: false
          };
        }
      });

      onAddItems(newItems);
      setText('');
      setIsProcessing(false);
      onComplete(); // Switch back to view mode
    }, 300);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <h3 className="text-xl font-bold text-white mb-2">Smart Import</h3>
      <p className="text-gray-400 text-sm mb-4">Paste your shopping list (English, Hindi, or Hinglish). We'll auto-match the items.</p>
      
      <textarea
        className="w-full h-40 bg-gray-950 border border-gray-800 text-white rounded-xl p-4 focus:outline-none focus:border-blue-500 mb-4 resize-none placeholder-gray-600"
        placeholder={`2 ltr doodh\n1 dozen eggs\n500g paneer\ncheeni`}
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <Button onClick={handleParse} isLoading={isProcessing} disabled={!text.trim()}>
        Parse & Add Items
      </Button>
    </div>
  );
}
