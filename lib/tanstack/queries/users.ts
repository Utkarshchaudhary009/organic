'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { queryKeys, handleError } from '../utils';
import type { Tables, InsertTables, UpdateTables } from '../supabase';

// Types
export type User = Tables<'users'>;
export type UserInsert = InsertTables<'users'>;
export type UserUpdate = UpdateTables<'users'>;

// Get user by clerk ID
export function useUser(clerkId: string) {
  return useQuery({
    queryKey: queryKeys.users.details(clerkId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as User;
    },
    enabled: !!clerkId,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: UserInsert) => {
      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(data.clerk_id) });
    },
    onError: (error) => {
      console.error('Error creating user:', handleError(error));
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, user }: { id: string; user: UserUpdate }) => {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(data.clerk_id) });
    },
    onError: (error) => {
      console.error('Error updating user:', handleError(error));
    },
  });
}

// Get user cart
export function useUserCart(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.cart(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('cart_products')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data.cart_products || [];
    },
    enabled: !!userId,
  });
}

// Update user cart
export function useUpdateUserCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cartProducts }: { userId: string; cartProducts: any[] }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ cart_products: cartProducts })
        .eq('id', userId)
        .select('id, clerk_id, cart_products')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.cart(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(data.clerk_id) });
    },
    onError: (error) => {
      console.error('Error updating user cart:', handleError(error));
    },
  });
}

// Add product to cart
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      product 
    }: { 
      userId: string;
      product: {
        id: string;
        name: string;
        price: number;
        final_price: number;
        quantity: number;
        image?: string;
      }
    }) => {
      // Get current cart
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('cart_products, clerk_id')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const currentCart = userData.cart_products || [];

      // Check if product already exists in cart
      const existingProductIndex = currentCart.findIndex(
        (item: any) => item.id === product.id
      );

      let updatedCart;
      if (existingProductIndex >= 0) {
        // Update quantity of existing product
        updatedCart = [...currentCart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + product.quantity,
        };
      } else {
        // Add new product to cart
        updatedCart = [...currentCart, product];
      }

      // Update cart in database
      const { data, error } = await supabase
        .from('users')
        .update({ cart_products: updatedCart })
        .eq('id', userId)
        .select('id, clerk_id, cart_products')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.cart(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(data.clerk_id) });
    },
    onError: (error) => {
      console.error('Error adding to cart:', handleError(error));
    },
  });
}

// Get user wishlist
export function useUserWishlist(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.wishlist(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('wishlist_products')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data.wishlist_products || data.wishlist_products.length === 0) {
        return [] as Product[];
      }

      // Fetch the actual products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', data.wishlist_products);

      if (productsError) {
        throw new Error(productsError.message);
      }

      return products as Product[];
    },
    enabled: !!userId,
  });
}

// Update user wishlist
export function useUpdateUserWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      wishlistProducts 
    }: { 
      userId: string; 
      wishlistProducts: string[] 
    }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ wishlist_products: wishlistProducts })
        .eq('id', userId)
        .select('id, clerk_id, wishlist_products')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.wishlist(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.details(data.clerk_id) });
    },
    onError: (error) => {
      console.error('Error updating user wishlist:', handleError(error));
    },
  });
}

// Type for consistent usage with wishlist
type Product = Tables<'products'>;