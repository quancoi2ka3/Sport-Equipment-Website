'use client';

import { useState, useEffect } from 'react';
import { Product, getProducts } from '@/app/services/api';
import ProductGrid from '@/app/components/products/ProductGrid';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Fetch products on page load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products whenever filters change
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Apply brand filter
    if (selectedBrand) {
      result = result.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }
    
    // Apply price range
    result = result.filter(p => {
      const price = p.discount 
        ? p.price - (p.price * p.discount / 100) 
        : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply sorting
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => {
        const priceA = a.discount ? a.price - (a.price * a.discount / 100) : a.price;
        const priceB = b.discount ? b.price - (b.price * b.discount / 100) : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => {
        const priceA = a.discount ? a.price - (a.price * a.discount / 100) : a.price;
        const priceB = b.discount ? b.price - (b.price * b.discount / 100) : b.price;
        return priceB - priceA;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, selectedBrand, priceRange, sortBy]);
  
  // Extract unique categories and brands for filters
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  
  // Price range slider handler
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, 500]);
    setSortBy('default');
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
        <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
        <p className="text-gray-600 mt-2">Browse our collection of high-quality sports equipment</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button 
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reset All
              </button>
            </div>
            
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="all-categories"
                    type="radio"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-categories" className="ml-2 text-gray-700">
                    All Categories
                  </label>
                </div>
                
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Brands Filter */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Brands</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="all-brands"
                    type="radio"
                    name="brand"
                    checked={selectedBrand === ''}
                    onChange={() => setSelectedBrand('')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-brands" className="ml-2 text-gray-700">
                    All Brands
                  </label>
                </div>
                
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      id={`brand-${brand}`}
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-700">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                
                <div className="flex space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
            
            <div className="flex items-center">
              <label htmlFor="sort-by" className="mr-2 text-gray-700">Sort by:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          
          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or browse our categories</p>
              <Link
                href="/categories"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
              >
                Browse Categories
              </Link>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  );
}