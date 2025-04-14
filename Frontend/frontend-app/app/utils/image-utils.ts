/**
 * Utility functions for handling image paths and placeholders
 */

// Map to check if an image file exists, otherwise use placeholder
export const getImagePath = (path: string): string => {
  // List of image paths that should use the placeholder
  const missingImages = [
    // Hero images
    '/images/hero/basketball.jpg',
    '/images/hero/summer-sports.jpg',
    '/images/hero/fitness.jpg',
    
    // Category images
    '/images/categories/basketball.jpg',
    '/images/categories/tennis.jpg',
    '/images/categories/soccer.jpg',
    '/images/categories/running.jpg',
    '/images/categories/yoga.jpg',
    '/images/categories/fitness.jpg',
    
    // Product images
    '/images/products/basketball.jpg',
    '/images/products/tennis-racket.jpg',
    '/images/products/soccer-ball.jpg',
    '/images/products/running-shoes.jpg',
    '/images/products/yoga-mat.jpg',
    '/images/products/dumbbells.jpg',
    '/images/products/goggles.jpg',
    '/images/products/helmet.jpg',
  ];
  
  // Return placeholder for missing images, otherwise return original path
  return missingImages.includes(path) ? '/placeholder.svg' : path;
};