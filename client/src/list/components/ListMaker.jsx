import React, { useMemo, useState } from "react";
import { Button, Input } from "../../shared/components";
import { fuzzyMatch } from "../parser/fuzzyMatcher";

export default function ListMaker({ catalogue, onAddItems }) {
  const [term, setTerm] = useState("");
  const suggestions = useMemo(() => {
    if (term.trim().length <= 1) return [];

    // Very crude typeahead search using fuzzyMatch just to show suggestions
    const result = fuzzyMatch(term, catalogue);
    return result ? [result.product] : [];
  }, [term, catalogue]);

  const handleAdd = (product) => {
    onAddItems([
      {
        product,
        quantity: 1,
        unit: "unit",
        resolved: true,
      },
    ]);
    setTerm("");
  };

  const handleCustomAdd = () => {
    if (!term.trim()) return;
    onAddItems([
      {
        rawInput: term,
        quantity: 1,
        unit: "unit",
        resolved: false,
      },
    ]);
    setTerm("");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <h3 className="text-xl font-bold text-white mb-4">Quick Add</h3>
      <div className="relative">
        <Input
          placeholder="e.g. Doodh, Apple, Bread..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="mb-0"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
            {suggestions.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white flex justify-between items-center"
              >
                <span>
                  {p.name}{" "}
                  <span className="text-gray-400 text-sm">({p.category})</span>
                </span>
                <span className="text-blue-400 font-bold">${p.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {term.trim() && suggestions.length === 0 && (
        <Button
          onClick={handleCustomAdd}
          variant="outline"
          className="mt-2 py-2 w-auto px-4 text-sm"
        >
          Add '{term}' anyway (Unrecognized)
        </Button>
      )}
    </div>
  );
}
