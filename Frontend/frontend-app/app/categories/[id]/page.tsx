'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Category, Product, getCategories, getProductsByCategory } from '@/app/services/api';
import ProductGrid from '@/app/components/products/ProductGrid';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (typeof id !== 'string') return;
      
      try {
        setLoading(true);
        
        // Fetch all categories to find the current one
        const categoriesData = await getCategories();
        const currentCategory = categoriesData.find(cat => cat.id === id) || null;
        setCategory(currentCategory);
        
        if (currentCategory) {
          // Fetch products for this category
          const productsData = await getProductsByCategory(id);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError('Failed to load category and products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndProducts();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <p className="font-bold">Error!</p>
          <p>{error || 'Category not found'}</p>
          <Link href="/categories" className="text-blue-600 underline mt-4 inline-block">
            Browse all categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Category Hero */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-900">
        <Image
          src={category.imageUrl || '/images/categories/placeholder.jpg'}
          alt={category.name}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-lg text-white max-w-2xl px-4">{category.description}</p>
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav>
          <ol className="flex text-sm text-gray-600">
            <li className="flex items-center">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link href="/categories" className="hover:text-blue-600">Categories</Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-400">{category.name}</li>
          </ol>
        </nav>
      </div>
      
      {/* Category Products */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{category.name} Equipment</h2>
          <p className="text-gray-600">{products.length} products found</p>
        </div>
        
        {/* Products Grid */}
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No products found in this category</h3>
            <p className="text-gray-600 mb-4">Check out our other categories or browse all products</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
              >
                Browse Categories
              </Link>
              <Link
                href="/products"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
              >
                See All Products
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Related Categories */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Related Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11a6 6 0 01-12 0"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a6 6 0 0012 0"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Accessories</h3>
              <p className="text-gray-600 mb-4">
                Complete your equipment set with our range of high-quality accessories.
              </p>
              <Link 
                href="/categories/accessories"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Accessories →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Apparel</h3>
              <p className="text-gray-600 mb-4">
                Performance clothing designed for comfort and durability.
              </p>
              <Link 
                href="/categories/apparel"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Apparel →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Training Guides</h3>
              <p className="text-gray-600 mb-4">
                Expert guides and resources to help you improve your skills.
              </p>
              <Link 
                href="/guides"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Guides →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}