"use client";

import ProductForm from "../../ProductForm";
import { getUserRole } from "@/utils/rolesClient";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await getUserRole();
      if (!admin) {
        redirect("/");
      }
      setIsAdminUser(admin === "admin");
    };

    checkAdmin();
  }, []);

  // Loading state while checking admin status
  if (isAdminUser === null) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-green-600' />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Edit Product</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Update product information
        </p>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
        <ProductForm productId={(await params).id} />
      </div>
    </div>
  );
}
