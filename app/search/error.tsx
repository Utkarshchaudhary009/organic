"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Search page error:", error);
  }, [error]);

  return (
    <div className='container mx-auto px-4 pt-16 pb-12 flex flex-col items-center justify-center min-h-[50vh]'>
      <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
        Something went wrong!
      </h2>

      <p className='text-gray-600 dark:text-gray-300 mb-8 text-center max-w-lg'>
        We encountered an error while searching for products. Please try again
        or browse our categories.
      </p>

      <div className='flex flex-col sm:flex-row gap-4'>
        <button
          onClick={reset}
          className='px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition'
        >
          Try again
        </button>

        <Link
          href='/products'
          className='px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center'
        >
          Browse all products
        </Link>
      </div>
    </div>
  );
}
