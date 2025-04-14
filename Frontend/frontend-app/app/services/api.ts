// API service to communicate with the .NET Core backend
const API_BASE_URL = 'https://localhost:7182'; // Default .NET Core Kestrel HTTPS port, adjust if needed

// Weather forecast interface (existing)
export interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

// E-commerce interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  brand: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Existing weather forecast function
export async function getWeatherForecasts(): Promise<WeatherForecast[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/weatherforecast`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather forecasts:', error);
    throw error;
  }
}

// For now, we'll use mock data until the backend is ready
// Mock products data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pro Basketball',
    description: 'Professional grade basketball with superior grip and durability',
    price: 59.99,
    category: 'basketball',
    imageUrl: '/images/products/basketball.jpg',
    brand: 'SportElite',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Tennis Racket Pro',
    description: 'Lightweight professional tennis racket for competitive players',
    price: 149.99,
    category: 'tennis',
    imageUrl: '/images/products/tennis-racket.jpg',
    brand: 'AceSports',
    inStock: true,
    rating: 4.7,
    reviews: 89,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Premium Soccer Ball',
    description: 'Match quality soccer ball with enhanced durability',
    price: 45.99,
    category: 'soccer',
    imageUrl: '/images/products/soccer-ball.jpg',
    brand: 'KickMaster',
    inStock: true,
    rating: 4.9,
    reviews: 211,
    discount: 10,
    isFeatured: true
  },
  {
    id: '4',
    name: 'Running Shoes X3',
    description: 'Lightweight running shoes with responsive cushioning',
    price: 129.99,
    category: 'running',
    imageUrl: '/images/products/running-shoes.jpg',
    brand: 'SpeedStep',
    inStock: true,
    rating: 4.6,
    reviews: 178,
    isFeatured: true
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    description: 'Extra thick yoga mat with non-slip surface',
    price: 39.99,
    category: 'yoga',
    imageUrl: '/images/products/yoga-mat.jpg',
    brand: 'ZenFlex',
    inStock: true,
    rating: 4.5,
    reviews: 143,
    discount: 15,
    isFeatured: true
  },
  {
    id: '6',
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells for home workouts',
    price: 199.99,
    category: 'fitness',
    imageUrl: '/images/products/dumbbells.jpg',
    brand: 'PowerFit',
    inStock: true,
    rating: 4.7,
    reviews: 96,
    isFeatured: true
  },
  {
    id: '7',
    name: 'Swimming Goggles Pro',
    description: 'Anti-fog swimming goggles with UV protection',
    price: 29.99,
    category: 'swimming',
    imageUrl: '/images/products/goggles.jpg',
    brand: 'AquaSpeed',
    inStock: true,
    rating: 4.4,
    reviews: 68,
    isNew: true
  },
  {
    id: '8',
    name: 'Cycling Helmet Ultra',
    description: 'Lightweight aerodynamic cycling helmet with adjustable fit',
    price: 89.99,
    category: 'cycling',
    imageUrl: '/images/products/helmet.jpg',
    brand: 'VeloTech',
    inStock: true,
    rating: 4.8,
    reviews: 112,
    isNew: true
  }
];

// Mock categories data
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Basketball',
    imageUrl: '/images/categories/basketball.jpg',
    description: 'Basketball equipment and accessories'
  },
  {
    id: '2',
    name: 'Tennis',
    imageUrl: '/images/categories/tennis.jpg',
    description: 'Tennis rackets, balls, and accessories'
  },
  {
    id: '3',
    name: 'Soccer',
    imageUrl: '/images/categories/soccer.jpg',
    description: 'Soccer balls, cleats, and training equipment'
  },
  {
    id: '4',
    name: 'Running',
    imageUrl: '/images/categories/running.jpg',
    description: 'Running shoes and apparel'
  },
  {
    id: '5',
    name: 'Yoga',
    imageUrl: '/images/categories/yoga.jpg',
    description: 'Yoga mats, blocks, and accessories'
  },
  {
    id: '6',
    name: 'Fitness',
    imageUrl: '/images/categories/fitness.jpg',
    description: 'Weights, resistance bands, and fitness equipment'
  }
];

// E-commerce API functions
export async function getProducts(): Promise<Product[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products`).then(res => res.json());
  
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_PRODUCTS), 500); // Simulate network delay
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products/${id}`).then(res => res.json());
  
  // For now, return mock data
  return new Promise((resolve) => {
    const product = MOCK_PRODUCTS.find(p => p.id === id) || null;
    setTimeout(() => resolve(product), 300); // Simulate network delay
  });
}

export async function getCategories(): Promise<Category[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/categories`).then(res => res.json());
  
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_CATEGORIES), 300); // Simulate network delay
  });
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products?category=${categoryId}`).then(res => res.json());
  
  // For now, filter mock data
  return new Promise((resolve) => {
    const category = MOCK_CATEGORIES.find(c => c.id === categoryId);
    const products = category 
      ? MOCK_PRODUCTS.filter(p => p.category.toLowerCase() === category.name.toLowerCase())
      : [];
    setTimeout(() => resolve(products), 300); // Simulate network delay
  });
}

export async function getFeaturedProducts(): Promise<Product[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products/featured`).then(res => res.json());
  
  // For now, filter mock data
  return new Promise((resolve) => {
    const products = MOCK_PRODUCTS.filter(p => p.isFeatured);
    setTimeout(() => resolve(products), 300); // Simulate network delay
  });
}

export async function getNewArrivals(): Promise<Product[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products/new`).then(res => res.json());
  
  // For now, filter mock data
  return new Promise((resolve) => {
    const products = MOCK_PRODUCTS.filter(p => p.isNew);
    setTimeout(() => resolve(products), 300); // Simulate network delay
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  // In a real app, this would fetch from the backend
  // return await fetch(`${API_BASE_URL}/products/search?q=${query}`).then(res => res.json());
  
  // For now, filter mock data
  return new Promise((resolve) => {
    const products = MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    setTimeout(() => resolve(products), 300); // Simulate network delay
  });
}