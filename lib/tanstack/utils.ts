// Query Keys
export const queryKeys = {
  // Users
  users: {
    all: ['users'] as const,
    details: (id: string) => [...queryKeys.users.all, 'details', id] as const,
    cart: (id: string) => [...queryKeys.users.all, 'cart', id] as const,
    wishlist: (id: string) => [...queryKeys.users.all, 'wishlist', id] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    details: (slug: string) => [...queryKeys.products.all, 'details', slug] as const,
    byCategory: (categoryId: string) => [...queryKeys.products.all, 'byCategory', categoryId] as const,
    trending: () => [...queryKeys.products.all, 'trending'] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    details: (slug: string) => [...queryKeys.categories.all, 'details', slug] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    details: (id: string) => [...queryKeys.orders.all, 'details', id] as const,
    byUser: (userId: string) => [...queryKeys.orders.all, 'byUser', userId] as const,
  },
  
  // Store
  store: {
    details: ['store', 'details'] as const,
  },
};

// Error handling
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Pagination utils
export interface PaginationOptions {
  page: number;
  perPage: number;
}

export function getPaginationParams(options: PaginationOptions) {
  const { page, perPage } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  return { from, to };
}

// Filter utils
export interface FilterOptions {
  [key: string]: any;
}

export function getFilterParams(filters: FilterOptions) {
  return Object.entries(filters).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );
} 