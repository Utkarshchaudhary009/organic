"use client";

import { useUserCart } from "@/lib/tanstack";
import { useUser } from "@clerk/nextjs";

export default function CartCount() {
  const { user } = useUser();
  const userId = user?.id;

  const { data: cartItems, isLoading } = useUserCart(userId || "");

  // Calculate total items in cart
  const itemCount =
    !isLoading && cartItems
      ? cartItems.reduce(
          (total: number, item: any) => total + (item.quantity || 1),
          0
        )
      : 0;

  // Don't show if no items or loading
  if (isLoading || itemCount === 0) return null;

  return (
    <span className='absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
      {itemCount > 9 ? "9+" : itemCount}
    </span>
  );
}
