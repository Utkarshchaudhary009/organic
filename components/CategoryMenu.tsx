'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCategoriesWithSubcategories } from '@/lib/tanstack';
import { cn } from '@/lib/utils';

export default function CategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition"
      >
        Categories
        <ChevronDown
          size={16}
          className={cn(
            "ml-1 transition-transform duration-200",
            isOpen ? "transform rotate-180" : ""
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : categories && categories.length > 0 ? (
            <ul className="py-2">
              {categories.map((category) => (
                <li key={category.id} className="relative group">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{category.name}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronRight size={16} />
                    )}
                  </Link>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ul className="invisible group-hover:visible absolute left-full top-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                      {category.subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link
                            href={`/categories/${subcategory.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsOpen(false)}
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                <Link
                  href="/categories"
                  className="block px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  View All Categories
                </Link>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
} 