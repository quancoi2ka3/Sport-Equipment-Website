'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product, getProductById } from '@/app/services/api';
import { useCart } from '@/app/context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  
  // Simulated additional product images
  const productImages = [
    { id: 0, url: product?.imageUrl || '/images/placeholder.jpg' },
    { id: 1, url: '/images/products/placeholder-2.jpg' },
    { id: 2, url: '/images/products/placeholder-3.jpg' },
  ];
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof id !== 'string') return;
      
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/images/products/placeholder.jpg",
      quantity: quantity,
      discount: product.discount
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <p className="font-bold">Error!</p>
          <p>{error || 'Product not found'}</p>
          <Link href="/products" className="text-blue-600 underline mt-4 inline-block">
            Back to all products
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate the sale price if there's a discount
  const salePrice = product.discount 
    ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
    : null;
  
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex text-sm text-gray-600">
          <li className="flex items-center">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href={`/categories/${product.category.toLowerCase()}`} className="hover:text-blue-600">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-400">{product.name}</li>
        </ol>
      </nav>
      
      {/* Product Details Content */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Images */}
        <div className="md:w-1/2">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-[400px] md:h-[500px]">
            <Image
              src={productImages[selectedImage].url}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            
            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {product.discount}% OFF
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          <div className="flex space-x-4">
            {productImages.map((img, index) => (
              <div 
                key={img.id}
                className={`w-24 h-24 bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={img.url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2">
          {/* Brand & Product Name */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 ml-2">{product.rating.toFixed(1)} ({product.reviews} reviews)</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="mb-6">
            {salePrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-800">${salePrice}</span>
                <span className="text-xl text-gray-500 line-through ml-3">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Stock Status */}
          <div className="mb-6">
            <p className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex">
              <button 
                onClick={decreaseQuantity}
                className="bg-gray-200 px-3 py-2 rounded-l border border-gray-300"
                disabled={!product.inStock}
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                className="w-16 text-center border-y border-gray-300 py-2"
                disabled={!product.inStock}
              />
              <button 
                onClick={increaseQuantity}
                className="bg-gray-200 px-3 py-2 rounded-r border border-gray-300"
                disabled={!product.inStock}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
              product.inStock 
                ? 'bg-blue-600 hover:bg-blue-700 transition-colors duration-300' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          {/* Additional Info */}
          <div className="mt-10">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center cursor-pointer py-3">
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
              </div>
              <div className="py-2">
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>Professional grade {product.category.toLowerCase()} equipment</li>
                  <li>Durable construction for long-lasting performance</li>
                  <li>Lightweight design for enhanced mobility</li>
                  <li>Premium materials for superior grip and control</li>
                  <li>Ergonomic design for comfortable use</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center cursor-pointer py-3">
                <h3 className="text-lg font-medium text-gray-900">Shipping & Returns</h3>
              </div>
              <div className="py-2">
                <p className="text-gray-600">
                  Free shipping on orders over $50. Standard delivery 3-5 business days.
                  Free returns within 30 days of delivery. See our <Link href="/shipping" className="text-blue-600 hover:underline">shipping policy</Link> for more details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}