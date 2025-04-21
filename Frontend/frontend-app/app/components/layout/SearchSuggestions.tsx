'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, searchProducts } from '@/app/services/api';
import { getImagePath } from '@/app/utils/image-utils';

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: () => void;
}

export default function SearchSuggestions({ query, onSelectSuggestion }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search for suggestions when query changes
  useEffect(() => {
    const searchDelay = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchProducts(query);
        setSuggestions(results.slice(0, 5)); // Limit to top 5 results
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce by 300ms
    
    return () => clearTimeout(searchDelay);
  }, [query]);
  
  if (query.length < 2 || (!loading && suggestions.length === 0)) {
    return null;
  }
  
  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md border mt-2 z-50">
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Searching...
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {suggestions.map((product) => (
            <li key={product.id}>
              <Link 
                href={`/products/${product.id}`}
                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={onSelectSuggestion}
              >
                <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={getImagePath(product.imageUrl)}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category} • ${product.price.toFixed(2)}</p>
                </div>
                {product.discount && (
                  <span className="ml-auto text-xs text-red-600 font-medium">
                    {product.discount}% OFF
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li>
            <Link 
              href={`/search?q=${encodeURIComponent(query)}`}
              className="block px-4 py-3 text-sm text-blue-600 text-center hover:bg-gray-50 transition-colors font-medium"
              onClick={onSelectSuggestion}
            >
              See all results for &quot;{query}&quot;
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}