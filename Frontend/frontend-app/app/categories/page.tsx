'use client';

import { useEffect, useState } from 'react';
import { Category, getCategories } from '@/app/services/api';
import CategoryCard from '@/app/components/products/CategoryCard';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

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
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Shop By Categories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our collection of sports equipment organized by categories.
          Find the perfect gear for your favorite sport or activity.
        </p>
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      
      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">Please check back later for our updated categories</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Browse All Products
          </Link>
        </div>
      )}
      
      {/* Sports Guide Section */}
      <div className="mt-16 bg-gray-50 p-8 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sports Equipment Guide</h2>
          <p className="text-gray-600">
            Not sure what equipment you need? Check out our comprehensive guides for different sports.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Beginner Guide to Basketball</h3>
            <p className="text-gray-600 mb-4">
              Learn about the essential equipment every basketball player needs to get started.
            </p>
            <Link 
              href="/guides/basketball"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Guide →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Choosing the Right Running Shoes</h3>
            <p className="text-gray-600 mb-4">
              Find the perfect running shoes based on your running style and needs.
            </p>
            <Link 
              href="/guides/running-shoes"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Guide →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Home Gym Essentials</h3>
            <p className="text-gray-600 mb-4">
              Everything you need to create an effective workout space in your home.
            </p>
            <Link 
              href="/guides/home-gym"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Guide →
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/guides"
            className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
          >
            View All Guides
          </Link>
        </div>
      </div>
    </div>
  );
}