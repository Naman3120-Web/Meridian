import React, { useState, useEffect } from "react";
import api from "../auth/api";
import { Loader, Button } from "../shared/components";

export default function SuggestionRow({ currentCartIds, onAdd }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cartIdsKey = currentCartIds.join(",");

  useEffect(() => {
    // Only fetch suggestions if we have things in the cart
    if (currentCartIds.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await api.post("/suggestions", {
          current_cart_ids: currentCartIds,
        });
        setSuggestions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentCartIds, cartIdsKey]); // re-run when cart ids change

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4">
      <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Smart Suggestions
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="min-w-[150px] bg-gray-800 rounded-xl p-3 flex-shrink-0 border border-gray-700"
          >
            <p className="text-white font-semibold truncate">
              {item.master_product?.name || "Product"}
            </p>
            <p className="text-xs text-gray-400 mb-2">Often bought together</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-blue-400 font-bold">${item.price}</span>
              <Button
                onClick={() => onAdd(item)}
                className="py-1 px-3 text-xs w-auto"
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
