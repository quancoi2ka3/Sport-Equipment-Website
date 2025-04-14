'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/app/services/api';
import { getImagePath } from '@/app/utils/image-utils';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${category.id}`}
      className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
    >
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <Image
          src={getImagePath(category.imageUrl || "/images/categories/placeholder.jpg")}
          alt={category.name}
          className="object-cover w-full h-48 sm:h-64 group-hover:scale-110 transition-transform duration-500"
          width={400}
          height={250}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{category.name}</h3>
          <p className="text-sm text-gray-200 line-clamp-2">{category.description}</p>
          <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm text-white text-sm py-2 px-4 rounded-full font-medium group-hover:bg-blue-600 transition-colors duration-300">
            View Products
          </div>
        </div>
      </div>
    </Link>
  );
}