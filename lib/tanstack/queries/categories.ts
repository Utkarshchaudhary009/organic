"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { queryKeys, handleError } from "../utils";
import type { Tables, InsertTables, UpdateTables } from "../supabase";

// Types
export type Category = Tables<"categories">;
export type CategoryInsert = InsertTables<"categories">;
export type CategoryUpdate = UpdateTables<"categories">;

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data as Category[];
    },
  });
}

// Get category by slug
export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.details(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Category;
    },
    enabled: !!slug,
  });
}

// Get categories with subcategories
export function useCategoriesWithSubcategories() {
  return useQuery({
    queryKey: [...queryKeys.categories.all, "with-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      const categories = data as Category[];
      const parentCategories = categories.filter(
        (cat) => !cat.parent_category_id
      );

      // Map subcategories to their parents
      return parentCategories.map((parent) => {
        const subcategories = categories.filter(
          (cat) => cat.parent_category_id === parent.id
        );
        return {
          ...parent,
          subcategories,
        };
      });
    },
  });
}

// Add a category (admin only)
export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory: CategoryInsert) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(newCategory)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => {
      console.error("Error adding category:", handleError(error));
    },
  });
}

// Update a category (admin only)
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      category,
    }: {
      id: string;
      category: CategoryUpdate;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.details(data.slug),
        });
      }
    },
    onError: (error) => {
      console.error("Error updating category:", handleError(error));
    },
  });
}

// Delete a category (admin only)
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => {
      console.error("Error deleting category:", handleError(error));
    },
  });
}
