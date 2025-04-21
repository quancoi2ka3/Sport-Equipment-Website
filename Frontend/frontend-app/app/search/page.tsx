'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, searchProducts } from '@/app/services/api';
import ProductGrid from '@/app/components/products/ProductGrid';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch search results on page load or when query changes
  useEffect(() => {
    setSearchTerm(query);
    
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        const data = await searchProducts(query);
        setProducts(data);
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Search Results</h1>
        <p className="text-gray-600 mt-2">
          {query ? `Showing results for "${query}"` : 'Search for products'}
          {products.length > 0 && ` (${products.length} ${products.length === 1 ? 'product' : 'products'} found)`}
        </p>
      </div>
      
      {/* Search Form for refinement */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Refine your search..."
            className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition duration-200"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Products Display */}
      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {query 
              ? `We couldn't find any products matching "${query}". Try different keywords or browse our categories.`
              : 'Enter search terms to find products.'}
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <ProductGrid products={products} />
          
          {/* Related Categories (optional) */}
          <div className="mt-16 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">You might also be interested in</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(products.map(p => p.category))).map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${category}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}