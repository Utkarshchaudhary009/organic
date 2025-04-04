import { Suspense } from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDisplay from "@/components/ProductDisplay";
import { cn } from "@/lib/utils";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate dynamic metadata
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = (await searchParams).q || "";

  const baseMetadata = await parent;

  return {
    title: query
      ? `Search results for "${query}" | Organic - Fresh & Healthy Food`
      : "Search Products | Organic - Fresh & Healthy Food",
    description: query
      ? `Browse our organic products matching "${query}". Find fresh, healthy options for your lifestyle.`
      : "Search our wide selection of organic produce and healthy food items.",
    openGraph: {
      ...baseMetadata.openGraph,
      title: query
        ? `Search results for "${query}" | Organic`
        : "Search Products | Organic",
      description: query
        ? `Browse our organic products matching "${query}". Find fresh, healthy options for your lifestyle.`
        : "Search our wide selection of organic produce and healthy food items.",
    },
  };
}

// Search products with query
async function searchProducts(query: string) {
  if (!query.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,details.ilike.%${query}%`)
    .eq("is_published", true)
    .order("trending", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }

  return data;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const products = await searchProducts(query);
  const hasResults = products.length > 0;

  return (
    <div className='container mx-auto px-4 pt-16 pb-12'>
      <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4'>
        {query ? `Search results for "${query}"` : "Search Products"}
      </h1>

      {!query && (
        <p className='text-gray-600 dark:text-gray-300 mb-8'>
          Enter a search term above to find products.
        </p>
      )}

      {query && !hasResults && (
        <div className='py-8 text-center'>
          <p className='text-gray-600 dark:text-gray-300 mb-2'>
            No products found matching "{query}"
          </p>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>
            Try different keywords or browse our categories.
          </p>
        </div>
      )}

      {hasResults && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          <Suspense fallback={<SearchResultsSkeleton />}>
            {products.map((product) => (
              <ProductDisplay
                key={product.id}
                product={product}
                priority={false}
              />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
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
    </>
  );
}
