"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);

        // Get product count
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        // Get users count
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        // Get orders count
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Get total revenue
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("payment_status", "paid");

        const totalRevenue =
          orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
          0;

        setStats({
          totalProducts: productsCount || 0,
          totalUsers: usersCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <StatCard
        title='Total Products'
        value={stats.totalProducts}
        icon={<Package className='h-8 w-8 text-green-600' />}
        isLoading={isLoading}
      />
      <StatCard
        title='Total Users'
        value={stats.totalUsers}
        icon={<Users className='h-8 w-8 text-blue-600' />}
        isLoading={isLoading}
      />
      <StatCard
        title='Total Orders'
        value={stats.totalOrders}
        icon={<ShoppingBag className='h-8 w-8 text-purple-600' />}
        isLoading={isLoading}
      />
      <StatCard
        title='Revenue'
        value={stats.totalRevenue}
        prefix='$'
        formatter={(val) => val.toFixed(2)}
        icon={<TrendingUp className='h-8 w-8 text-red-600' />}
        isLoading={isLoading}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  prefix = "",
  formatter = (val: number) => val.toString(),
  isLoading = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  prefix?: string;
  formatter?: (val: number) => string;
  isLoading?: boolean;
}) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
            {title}
          </p>
          <div className='mt-1'>
            {isLoading ? (
              <div className='h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            ) : (
              <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {prefix}
                {formatter(value)}
              </h4>
            )}
          </div>
        </div>
        {icon}
      </div>
    </div>
  );
}
