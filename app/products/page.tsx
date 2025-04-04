import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsList from "./products-list";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Shop All Products | Organic - Fresh & Healthy Food",
  description:
    "Browse our complete collection of organic and healthy food products. Find fresh produce, pantry essentials, and more delivered right to your door.",
  openGraph: {
    title: "Shop All Products | Organic",
    description:
      "Browse our complete collection of organic and healthy food products. Find fresh produce, pantry essentials, and more delivered right to your door.",
    type: "website",
    url: "/products",
  },
};

// Get products count for page description
async function getProductsCount() {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (error) {
    console.error("Error getting products count:", error);
    return 0;
  }

  return count || 0;
}

export default async function ProductsPage() {
  const productsCount = await getProductsCount();

  return (
    <div className='container mx-auto px-4 pt-16 pb-12'>
      <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-2'>
        All Products
      </h1>

      <div className='mb-8'>
        <p className='text-gray-600 dark:text-gray-300'>
          Browse our selection of {productsCount} organic and healthy products
        </p>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}

function ProductsLoading() {
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
