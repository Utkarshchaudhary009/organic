"use client";

import { useState } from "react";
import { useTrendingProducts } from "@/lib/tanstack";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useAddToCart } from "@/lib/tanstack";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type ProductDisplayProps = {
  product?: any;
  limit?: number;
  priority?: boolean;
};

export default function ProductDisplay({
  product,
  limit = 4,
  priority = false,
}: ProductDisplayProps) {
  const {
    data: trendingProducts,
    isLoading: isTrendingLoading,
    error: trendingError,
  } = !product
    ? useTrendingProducts(limit)
    : { data: null, isLoading: false, error: null };

  const addToCart = useAddToCart();
  const { user, isSignedIn } = useUser();
  const userId = user?.id;

  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const isSingleProduct = !!product;
  const products = isSingleProduct ? [product] : trendingProducts;
  const isLoading = !isSingleProduct && isTrendingLoading;
  const error = !isSingleProduct && trendingError;

  const handleAddToCart = (product: any) => {
    if (!isSignedIn || !userId) {
      // Redirect to sign in or show signin modal
      window.location.href = "/sign-in";
      return;
    }

    addToCart.mutate({
      userId,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        final_price: product.final_price,
        quantity: 1,
        image: product.images?.[0],
      },
    });
  };

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'
          >
            <div className='h-64 bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
            <div className='p-4'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-4'></div>
              <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3'></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-red-500'>
        Error loading products: {error.message}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className='text-gray-500 dark:text-gray-400 text-center py-8'>
        {isSingleProduct ? "Product not found." : "No products found."}
      </div>
    );
  }

  // For single product, just render the card without the grid
  if (isSingleProduct) {
    return renderProductCard(
      product,
      hoveredProduct,
      setHoveredProduct,
      handleAddToCart,
      priority
    );
  }

  // For product grid
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {products.map((product) =>
        renderProductCard(
          product,
          hoveredProduct,
          setHoveredProduct,
          handleAddToCart,
          priority
        )
      )}
    </div>
  );
}

// Helper function to render a product card
function renderProductCard(
  product: any,
  hoveredProduct: string | null,
  setHoveredProduct: (id: string | null) => void,
  handleAddToCart: (product: any) => void,
  priority: boolean = false
) {
  return (
    <div
      key={product.id}
      className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative group'
      onMouseEnter={() => setHoveredProduct(product.id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      {/* Product Image */}
      <div className='relative h-64 overflow-hidden'>
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name || ""}
            fill
            priority={priority}
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
            className='object-cover transition-transform duration-500 group-hover:scale-110'
          />
        ) : (
          <div className='h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
            <span className='text-gray-500 dark:text-gray-400'>No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className='absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
            {product.discount}% OFF
          </span>
        )}

        {/* Quick Action Buttons */}
        <div
          className={cn(
            "absolute right-2 top-2 flex flex-col space-y-2 transform transition-all duration-300",
            hoveredProduct === product.id
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4"
          )}
        >
          <button
            className='w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md hover:bg-green-500 hover:text-white transition-colors'
            aria-label='Add to wishlist'
          >
            <Heart size={16} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className='w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md hover:bg-green-500 hover:text-white transition-colors'
            aria-label='View product details'
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className='p-4'>
        <div className='flex items-center mb-1'>
          {/* Rating stars */}
          <div className='flex text-yellow-400 mr-1'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                fill={
                  index < Math.floor(product.rating) ? "currentColor" : "none"
                }
                className={
                  index < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            ({product.number_of_reviews})
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className='font-medium text-gray-800 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors mb-1 line-clamp-1'>
            {product.name}
          </h3>
        </Link>

        <div className='flex items-center justify-between mt-2'>
          <div className='flex items-center'>
            <span className='text-lg font-bold text-gray-900 dark:text-white'>
              ${product.final_price?.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className='text-sm text-gray-500 dark:text-gray-400 line-through ml-2'>
                ${product?.price?.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            className='p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors'
            aria-label='Add to cart'
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Add to cart overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-black bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
          hoveredProduct === product.id ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => handleAddToCart(product)}
          className='bg-white text-gray-900 dark:bg-gray-800 dark:text-white py-2 px-4 rounded-full shadow-md hover:bg-green-600 hover:text-white transition-colors transform hover:scale-105 flex items-center'
        >
          <ShoppingCart
            size={16}
            className='mr-2'
          />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
