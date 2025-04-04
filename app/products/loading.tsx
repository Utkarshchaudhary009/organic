import { cn } from '@/lib/utils';

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 pt-16 pb-12">
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8 mt-8" />
      
      <div className="h-6 w-72 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-8" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800",
              "animate-pulse h-[380px]"
            )}
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="mt-auto pt-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 