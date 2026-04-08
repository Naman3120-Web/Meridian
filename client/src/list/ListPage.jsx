import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import api from '../auth/api';
import ListMaker from './components/ListMaker';
import ImportList from './components/ImportList';
import SuggestionRow from '../suggestions/SuggestionRow';
import { Button } from '../shared/components';

export default function ListPage() {
  const [catalogue, setCatalogue] = useState([]);
  const [myList, setMyList] = useState([]);
  const [mode, setMode] = useState('view'); // 'view' | 'import'
  const storeId = useStore(state => state.storeId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch catalogue from the store
    const fetchCatalogue = async () => {
      try {
        const res = await api.get(`/products?store_id=${storeId}`);
        // Normalizing the response structure since the route might return products
        // where name is nested inside master_product.
        const mappedCatalogue = res.data.map(p => ({
            id: p.id,
            master_product_id: p.master_product_id,
            name: p.master_product?.name || 'Unknown',
            hindi_names: JSON.parse(p.master_product?.hindi_names || '[]'),
            category: p.master_product?.category || 'General',
            price: p.price,
            aisle: p.aisle,
        }));
        setCatalogue(mappedCatalogue);
      } catch (e) {
        console.error("Failed to fetch catalogue", e);
        // Fallback for UI building if backend fails
        setCatalogue([
            { id: 1, name: 'Milk', hindi_names: ['doodh'], category: 'Dairy', price: 2.99, aisle: 1 },
            { id: 2, name: 'Eggs', hindi_names: ['anda'], category: 'Dairy', price: 3.50, aisle: 1 },
            { id: 3, name: 'Sugar', hindi_names: ['cheeni', 'chini'], category: 'Pantry', price: 1.99, aisle: 3 }
        ]);
      }
    };
    fetchCatalogue();
  }, [storeId]);

  const handleAddItems = (newItems) => {
    setMyList([...myList, ...newItems]);
  };

  const handleRemove = (index) => {
    setMyList(myList.filter((_, i) => i !== index));
  };

  const saveList = async () => {
    if (myList.length === 0) return;
    setIsSaving(true);
    try {
      await api.post('/list', {
        name: `My List ${new Date().toLocaleDateString()}`,
        list_json: myList
      });
      alert('List saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save list');
    } finally {
      setIsSaving(false);
    }
  };

  const currentCartIds = myList.filter(i => i.resolved && i.product).map(i => i.product.id);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">My List</h1>
        <Button variant="outline" className="w-auto py-1 px-3 text-sm" onClick={() => setMode(mode === 'view' ? 'import' : 'view')}>
          {mode === 'view' ? 'Smart Import' : 'Done'}
        </Button>
      </div>

      {mode === 'import' ? (
        <ImportList catalogue={catalogue} onAddItems={handleAddItems} onComplete={() => setMode('view')} />
      ) : (
        <ListMaker catalogue={catalogue} onAddItems={handleAddItems} />
      )}

      {/* Render Suggestions */}
      <SuggestionRow 
        currentCartIds={currentCartIds} 
        onAdd={(product) => handleAddItems([{ product, quantity: 1, unit: 'unit', resolved: true }])} 
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Cart ({myList.length})</h2>
        {myList.length === 0 ? (
          <p className="text-gray-500">Your list is empty. Add items above.</p>
        ) : (
          <ul className="space-y-3">
            {myList.map((item, i) => (
              <li key={i} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  {item.resolved ? (
                    <>
                      <p className="text-white font-semibold">{item.product.name}</p>
                      <p className="text-xs text-blue-400">Aisle {item.product.aisle} • ${item.product.price} ({item.quantity} {item.unit})</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-400 font-semibold">{item.rawInput}</p>
                      <p className="text-xs text-gray-400">Unrecognized item • Map it manually</p>
                    </>
                  )}
                </div>
                <button onClick={() => handleRemove(i)} className="text-gray-500 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {myList.length > 0 && (
         <div className="mt-8">
           <Button onClick={saveList} isLoading={isSaving}>Save List</Button>
         </div>
      )}
    </div>
  );
}
