import React, { useState } from 'react';
import { Button } from '../../shared/components';
import api from '../../auth/api';

export default function RecipeCard({ recipe, onAddIngredients }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapIngredients = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (!details) {
      setLoading(true);
      try {
        const res = await api.post('/meal/map', { ingredients: recipe.ingredients });
        setDetails(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(true);
  };

  const calculateTotal = () => {
    if (!details) return 0;
    return details
      .filter(item => item.found)
      .reduce((acc, curr) => acc + curr.product.price, 0)
      .toFixed(2);
  };

  const handleAddToCart = () => {
    if (!details) return;
    const addProps = details.map(item => {
      if (item.found) {
        return {
          product: item.product,
          quantity: 1,
          unit: 'unit',
          resolved: true
        };
      } else {
        return {
          rawInput: item.ingredient,
          quantity: 1,
          unit: 'unit',
          resolved: false
        };
      }
    });

    onAddIngredients(addProps);
    setIsExpanded(false);
    alert(`Added ${addProps.length} ingredients to your shopping list!`);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage: `url(${recipe.image_url})` }}
      />
      <div className="p-4 relative">
        <h3 className="text-xl font-bold text-white mb-1">{recipe.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{recipe.time} • {recipe.ingredients.length} ingredients</p>
        
        <Button onClick={handleMapIngredients} isLoading={loading} variant={isExpanded ? 'secondary' : 'primary'} className="py-2">
          {isExpanded ? 'Hide Ingredients' : 'View Ingredients & Map to Store'}
        </Button>
      </div>

      {isExpanded && details && (
        <div className="p-4 bg-gray-950 border-t border-gray-800">
           <h4 className="font-bold text-white mb-3 flex items-center justify-between">
             Ingredient Availability 
             <span className="text-green-400">Total: ${calculateTotal()}</span>
           </h4>
           <ul className="space-y-2 mb-4">
             {details.map((item, i) => (
               <li key={i} className="flex justify-between items-center text-sm">
                 <span className={item.found ? "text-gray-300" : "text-gray-500 line-through"}>
                   {item.ingredient}
                 </span>
                 {item.found ? (
                   <span className="text-blue-400 text-xs text-right">
                     Aisle {item.product.aisle} • ${item.product.price}
                   </span>
                 ) : (
                   <span className="text-red-400 text-xs">Not in stock</span>
                 )}
               </li>
             ))}
           </ul>
           <Button onClick={handleAddToCart} variant="outline" className="w-full py-2 hover:bg-gray-800 border-green-500/50 text-green-400">
             Add All to Active Cart
           </Button>
        </div>
      )}
    </div>
  );
}
