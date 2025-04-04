"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import {
  queryKeys,
  handleError,
  getPaginationParams,
  type PaginationOptions,
  type FilterOptions,
  getFilterParams,
} from "../utils";
import type { Tables, InsertTables, UpdateTables } from "../supabase";

// Types
export type Product = Tables<"products">;
export type ProductInsert = InsertTables<"products">;
export type ProductUpdate = UpdateTables<"products">;

// Get all products with pagination and filtering
export function useProducts(
  options: PaginationOptions & FilterOptions = { page: 1, perPage: 10 }
) {
  const { page, perPage, ...filters } = options;
  const pagination = getPaginationParams({ page, perPage });
  const filterParams = getFilterParams(filters);

  return useQuery({
    queryKey: [...queryKeys.products.all, pagination, filterParams],
    queryFn: async () => {
      let query = supabase.from("products").select("*", { count: "exact" });

      // Apply filters
      Object.entries(filterParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === "object" && value !== null) {
          if ("gte" in value) query = query.gte(key, value.gte);
          if ("lte" in value) query = query.lte(key, value.lte);
          if ("gt" in value) query = query.gt(key, value.gt);
          if ("lt" in value) query = query.lt(key, value.lt);
        } else {
          query = query.eq(key, value);
        }
      });

      // Apply pagination
      const { data, count, error } = await query
        .range(pagination.from, pagination.to)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        products: data as Product[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / perPage) : 0,
        currentPage: page,
      };
    },
  });
}

// Get a single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.details(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("slug", slug)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Product & { categories: Tables<"categories"> };
    },
    enabled: !!slug,
  });
}

// Get trending products
export function useTrendingProducts(limit: number = 4) {
  return useQuery({
    queryKey: ["trendingProducts", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("trending", true)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}

// Get products by category
export function useProductsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 12
) {
  return useQuery({
    queryKey: ["productsByCategory", categoryId, page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const {
        data: products,
        error,
        count,
      } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("category_id", categoryId)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        products,
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        currentPage: page,
      };
    },
    enabled: !!categoryId,
  });
}

// Search products
export function useSearchProducts(
  query: string,
  options: PaginationOptions = { page: 1, perPage: 10 }
) {
  const pagination = getPaginationParams(options);

  return useQuery({
    queryKey: [...queryKeys.products.search(query), pagination],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .textSearch("name", query)
        .range(pagination.from, pagination.to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        products: data as Product[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / options.perPage) : 0,
        currentPage: options.page,
      };
    },
    enabled: !!query,
  });
}

// Add a new product (admin only)
export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: ProductInsert) => {
      const { data, error } = await supabase
        .from("products")
        .insert(newProduct)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Product;
    },
    onSuccess: () => {
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
    onError: (error) => {
      console.error("Error adding product:", handleError(error));
    },
  });
}

// Update a product (admin only)
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      product,
    }: {
      id: string;
      product: ProductUpdate;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Product;
    },
    onSuccess: (data) => {
      // Invalidate product details query
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      if (data.slug) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.details(data.slug),
        });
      }
    },
    onError: (error) => {
      console.error("Error updating product:", handleError(error));
    },
  });
}

// Delete a product (admin only)
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate products queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
    onError: (error) => {
      console.error("Error deleting product:", handleError(error));
    },
  });
}

export function useAllProducts(page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const {
        data: products,
        error,
        count,
      } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        products,
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        currentPage: page,
      };
    },
  });
}
