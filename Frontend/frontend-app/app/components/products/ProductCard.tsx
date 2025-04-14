'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/services/api';
import { getImagePath } from '@/app/utils/image-utils';
import { useCart } from '@/app/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  // Calculate the sale price if there's a discount
  const salePrice = product.discount 
    ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product.inStock) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/images/products/placeholder.jpg",
      quantity: 1,
      discount: product.discount
    });
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with Link */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 relative">
          <Image
            src={getImagePath(product.imageUrl || "/images/products/placeholder.jpg")}
            alt={product.name}
            className={`object-cover w-full h-64 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
            width={300}
            height={300}
          />
          
          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              {product.discount}% OFF
            </div>
          )}
          
          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              NEW
            </div>
          )}
          
          {/* Quick Action Button - only shows on hover */}
          <div 
            className={`absolute bottom-0 left-0 right-0 flex justify-center p-3 bg-black bg-opacity-50 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 
                ${product.inStock 
                  ? 'bg-white text-gray-800 hover:bg-blue-600 hover:text-white' 
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              onClick={handleQuickAdd}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Quick Add' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </Link>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </div>
        
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300 mb-1">
            {product.name}
          </h3>
        </Link>
        
        {/* Brand */}
        <div className="text-sm text-gray-600 mb-2">
          {product.brand}
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-600 text-xs ml-1">({product.reviews})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center">
          {salePrice ? (
            <>
              <span className="text-lg font-bold text-gray-800">${salePrice}</span>
              <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Availability */}
        <div className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'} mt-1`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
    </div>
  );
}