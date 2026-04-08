import React, { useState } from "react";
import recipesData from "./data/recipes.json";
import RecipeCard from "./components/RecipeCard";
import { Input } from "../shared/components";
import api from "../auth/api";

export default function MealPage() {
  const [search, setSearch] = useState("");
  // Filter recipes based on simple search text
  const filteredRecipes = recipesData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase())),
  );

  const handleAddIngredientsToCart = async (items) => {
    // In a real app we'd append to an active list in context or backend.
    // For now we simulate creating a new list or just alerting success.
    try {
      await api.post("/list", {
        name: `Meal Prep: Auto Generated`,
        list_json: items,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Meal Prep Hub
        </h1>
        <p className="text-gray-400">
          Craving something specific? Search a meal to instantly fetch the exact
          ingredients and their locations in our store.
        </p>
      </div>

      <Input
        type="text"
        placeholder="Search for 'Biryani', 'Omelette', 'Eggs'..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onAddIngredients={handleAddIngredientsToCart}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No recipes found matching "{search}".
        </div>
      )}
    </div>
  );
}
