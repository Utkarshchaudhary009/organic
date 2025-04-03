"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import {
  queryKeys,
  handleError,
  getPaginationParams,
  type PaginationOptions,
} from "../utils";
import type { Tables, InsertTables, UpdateTables } from "../supabase";

// Types
export type Order = Tables<"orders">;
export type OrderInsert = InsertTables<"orders">;
export type OrderUpdate = UpdateTables<"orders">;
export type OrderItem = Tables<"order_items">;
export type OrderItemInsert = InsertTables<"order_items">;

// Get orders for a user
export function useUserOrders(
  userId: string,
  options: PaginationOptions = { page: 1, perPage: 10 }
) {
  const pagination = getPaginationParams(options);

  return useQuery({
    queryKey: [...queryKeys.orders.byUser(userId), pagination],
    queryFn: async () => {
      const { data, count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .range(pagination.from, pagination.to)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        orders: data as Order[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / options.perPage) : 0,
        currentPage: options.page,
      };
    },
    enabled: !!userId,
  });
}

// Get a single order with order items
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.details(orderId),
    queryFn: async () => {
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      return {
        ...orderData,
        items: itemsData,
      } as Order & { items: OrderItem[] };
    },
    enabled: !!orderId,
  });
}

// Create a new order with order items
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      orderItems,
    }: {
      order: OrderInsert;
      orderItems: Omit<OrderItemInsert, "order_id">[];
    }) => {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Insert the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({ ...order, order_number: orderNumber })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      // Insert order items
      const orderItemsWithOrderId = orderItems.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsWithOrderId);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Clear the user's cart
      const { error: cartError } = await supabase
        .from("users")
        .update({ cart_products: [] })
        .eq("id", order.user_id);

      if (cartError) {
        throw new Error(cartError.message);
      }

      return orderData as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byUser(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.cart(data.user_id),
      });
    },
    onError: (error) => {
      console.error("Error creating order:", handleError(error));
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: {
        payment_status?: string;
        shipping_status?: string;
        tracking_number?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update(status)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.details(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.byUser(data.user_id),
      });
    },
    onError: (error) => {
      console.error("Error updating order status:", handleError(error));
    },
  });
}
