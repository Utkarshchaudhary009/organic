## TanStack Query Setup

The application uses TanStack Query for efficient data fetching and caching with Supabase.

### Installation

To use the TanStack Query setup, install the required dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Features

- **Optimized data fetching** with automatic caching and background updates
- **Type-safe queries** with TypeScript for Supabase tables
- **Consistent error handling** across the application
- **Automatic cache invalidation** for related queries
- **Pagination, filtering, and advanced querying** utilities
- **Real-time updates** support via Supabase

### Directory Structure

- `lib/tanstack/provider.tsx` - TanStack Query provider with global configuration
- `lib/tanstack/supabase.ts` - Supabase client with TypeScript types for the database schema
- `lib/tanstack/utils.ts` - Utility functions for query keys, error handling, and more
- `lib/tanstack/queries/` - Directory containing query hooks for each entity
  - `products.ts` - Product-related query hooks
  - `categories.ts` - Category-related query hooks
  - `users.ts` - User-related query hooks
  - `orders.ts` - Order-related query hooks
  - `store.ts` - Store-related query hooks

### Usage Examples

#### Fetching Products

```tsx
import { useProducts, useTrendingProducts } from "@/lib/tanstack";

function ProductList() {
  // Get products with pagination
  const { data, isLoading, error } = useProducts({ page: 1, perPage: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

function TrendingProducts() {
  // Get trending products
  const { data, isLoading } = useTrendingProducts(4);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

#### User Cart Operations

```tsx
import { useUserCart, useAddToCart } from "@/lib/tanstack";

function ShoppingCart({ userId }) {
  // Get user's cart
  const { data: cartItems, isLoading } = useUserCart(userId);

  // Add to cart mutation
  const addToCart = useAddToCart();

  const handleAddToCart = (product) => {
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

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div>
      {cartItems.map((item) => (
        <div key={item.id}>
          {item.name} - {item.quantity} x ${item.final_price}
        </div>
      ))}
    </div>
  );
}
```
