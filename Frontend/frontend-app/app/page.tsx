'use client';

import { useEffect, useState } from "react";
import HeroSection from "./components/home/HeroSection";
import CategoriesSection from "./components/home/CategoriesSection";
import FeaturedProductsSection from "./components/home/FeaturedProductsSection";
import Link from "next/link";
import { getNewArrivals, Product } from "./services/api";
import ProductGrid from "./components/products/ProductGrid";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const data = await getNewArrivals();
        setNewArrivals(data);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewArrivals();
  }, []);

  return (
    <div>
      {/* Hero Section with Slider */}
      <HeroSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Featured Products Section */}
      <FeaturedProductsSection />
      
      {/* New Arrivals Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">New Arrivals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Check out the latest additions to our sports equipment collection.
              Be the first to get your hands on our newest products.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <ProductGrid products={newArrivals} />
              
              {newArrivals.length > 0 && (
                <div className="mt-10 text-center">
                  <Link 
                    href="/new-arrivals" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-300"
                  >
                    View All New Arrivals
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {/* Sports Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are dedicated to providing the best sports equipment to help you achieve your athletic goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                All our products undergo rigorous quality checks to ensure you receive only the best.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick shipping to get your equipment to you when you need it.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                Multiple secure payment options including credit cards, Apple Pay, and Google Pay through Stripe secure platform.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Our team of sports enthusiasts is always ready to help with your questions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter and be the first to know about new products, special offers, and training tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-full text-gray-800 w-full sm:w-auto sm:min-w-[300px] focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-full transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-sm opacity-80">
              By subscribing, you agree to receive marketing emails from us. Do not worry, we do not spam.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
