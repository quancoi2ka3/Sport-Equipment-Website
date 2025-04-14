'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a cart item
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
}

// Define the shape of our cart context
interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemsCount: () => number;
  getCartTotal: () => number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getItemsCount: () => 0,
  getCartTotal: () => 0
});

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart from localStorage if available
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('sportshop-cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('sportshop-cart');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sportshop-cart', JSON.stringify(items));
  }, [items]);
  
  // Add an item to the cart
  const addToCart = (newItem: CartItem) => {
    setItems(currentItems => {
      // Check if the item already exists in the cart
      const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update the quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it to the cart
        return [...currentItems, newItem];
      }
    });
  };
  
  // Remove an item from the cart
  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  // Update the quantity of an item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      // If quantity is less than 1, remove the item
      removeFromCart(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Get the total number of items in the cart
  const getItemsCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  // Calculate the total price of all items in the cart
  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.discount 
        ? item.price - (item.price * item.discount / 100) 
        : item.price;
      
      return total + (price * item.quantity);
    }, 0);
  };
  
  // Provide the cart context to the children components
  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemsCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};