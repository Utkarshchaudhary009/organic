"use client";

import { useState } from "react";
import { useAllProducts } from "@/lib/tanstack/queries/products";
import ProductDisplay from "@/components/ProductDisplay";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useAllProducts(currentPage);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (error) {
    return (
      <div className='text-red-500 py-8 text-center'>
        Error loading products: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <ProductsListSkeleton />;
  }

  if (!data?.products?.length) {
    return (
      <div className='text-gray-500 dark:text-gray-400 text-center py-8'>
        No products found. Please check back later.
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {data.products.map((product) => (
          <ProductDisplay
            key={product.id}
            product={product}
            priority={currentPage === 1}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className='flex justify-center mt-12'>
          <nav className='flex items-center space-x-2'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-md flex items-center justify-center",
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              aria-label='Previous page'
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(data.totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              // Show limited page buttons for better UX
              if (
                pageNumber === 1 ||
                pageNumber === data.totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center",
                      currentPage === pageNumber
                        ? "bg-green-600 text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                (pageNumber === currentPage - 2 && currentPage > 3) ||
                (pageNumber === currentPage + 2 &&
                  currentPage < data.totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className='w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200'
                  >
                    ...
                  </span>
                );
              } else {
                return null;
              }
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className={cn(
                "p-2 rounded-md flex items-center justify-center",
                currentPage === data.totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              aria-label='Next page'
            >
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

function ProductsListSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800",
            "animate-pulse h-[380px]"
          )}
        >
          <div className='h-48 bg-gray-200 dark:bg-gray-700' />
          <div className='p-4 flex-1 flex flex-col'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2' />
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4' />
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2' />
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6' />
            <div className='mt-auto pt-4'>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
