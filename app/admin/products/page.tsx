"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/tanstack/queries/products";
import { useCategories } from "@/lib/tanstack/queries/categories";
import { getUserRole } from "@/utils/rolesClient";
import { redirect } from "next/navigation";
import { Loader2, Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDeleteProduct } from "@/lib/tanstack/queries/products";
import { useEffect } from "react";



export default function ProductsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "10");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category_id: searchParams.get("category_id") || "",
    is_published: searchParams.get("is_published") || ""
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
    const admin = await getUserRole();
      if (!admin) {
        redirect("/");
      }
      setIsAdminUser(admin === 'admin');
    };
    
    checkAdmin();
  }, []);

  // Fetch products with pagination and filters
  const filterOptions = {
    page,
    perPage,
    ...(filters.category_id ? { category_id: filters.category_id } : {}),
    ...(filters.is_published ? { is_published: filters.is_published === "true" } : {})
  };
  
  const { data, isLoading, isError, error } = useProducts(filterOptions);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const deleteProduct = useDeleteProduct();

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      router.push(`/admin/products/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsDeleting(id);
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/products?${params.toString()}`);
  };

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/admin/products?${params.toString()}`);
  };

  // Render loading state
  if (isAdminUser === null || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading products: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Link
          href="/admin/products/new"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <Plus className="w-5 h-5 mr-1" /> Add Product
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="ml-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
          >
            Search
          </button>
        </form>

        {/* Filter button */}
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
        >
          <Filter className="h-5 w-5" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="is_published" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="is_published"
              value={filters.is_published}
              onChange={(e) => handleFilterChange("is_published", e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              name="category_id"
              value={filters.category_id}
              onChange={(e) => handleFilterChange("category_id", e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="">All Categories</option>
              {isLoadingCategories ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data?.products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name || ""}
                            fill
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      ${product.final_price.toFixed(2)}
                    </div>
                    {product.discount > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                        ${product.price?.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.inventory} in stock
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_published
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {product.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting === product.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {data?.products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No products found. <Link href="/admin/products/new" className="text-green-600 hover:underline">Add your first product</Link>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * perPage, data.totalCount)}
            </span>{" "}
            of <span className="font-medium">{data.totalCount}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.totalPages}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 