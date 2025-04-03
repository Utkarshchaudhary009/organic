'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { queryKeys, handleError } from '../utils';
import type { Tables, UpdateTables } from '../supabase';

// Types
export type Store = Tables<'store'>;
export type StoreUpdate = UpdateTables<'store'>;

// Get store details
export function useStore() {
  return useQuery({
    queryKey: queryKeys.store.details,
    queryFn: async () => {
      // Get the first store entry (assuming only one store record)
      const { data, error } = await supabase
        .from('store')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Store;
    },
  });
}

// Update store details (admin only)
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storeData }: { id: string; storeData: StoreUpdate }) => {
      const { data, error } = await supabase
        .from('store')
        .update(storeData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.store.details });
    },
    onError: (error) => {
      console.error('Error updating store:', handleError(error));
    },
  });
}

// Create store if not exists (admin only)
export function useCreateStoreIfNotExists() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeData: Partial<Store>) => {
      // Check if store exists
      const { data: existingStore, error: checkError } = await supabase
        .from('store')
        .select('id')
        .limit(1);

      if (checkError) {
        throw new Error(checkError.message);
      }

      // If store exists, update it
      if (existingStore && existingStore.length > 0) {
        const { data, error } = await supabase
          .from('store')
          .update(storeData)
          .eq('id', existingStore[0].id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data as Store;
      } 
      // Otherwise create new store
      else {
        const { data, error } = await supabase
          .from('store')
          .insert(storeData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data as Store;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.store.details });
    },
    onError: (error) => {
      console.error('Error creating/updating store:', handleError(error));
    },
  });
} 