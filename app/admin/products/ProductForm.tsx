"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useCategories } from "@/lib/tanstack/queries/categories";
import {
  useAddProduct,
  useUpdateProduct,
  useProduct,
} from "@/lib/tanstack/queries/products";
import { Loader2, Plus, Minus, Save, X, Upload } from "lucide-react";
import Image from "next/image";
import ProductImageUploader from "./components/ProductImageUploader";

// Product schema validation
const productSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Product name is required and must be at least 3 characters",
    }),
  slug: z
    .string()
    .min(3, {
      message: "Product slug is required and must be at least 3 characters",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  details: z
    .string()
    .min(10, { message: "Product details must be at least 10 characters" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  discount: z.coerce
    .number()
    .min(0, { message: "Discount cannot be negative" })
    .max(100, { message: "Discount cannot exceed 100%" }),
  trending: z.boolean().default(false),
  category_id: z.string().min(1, { message: "Please select a category" }),
  inventory: z.coerce
    .number()
    .int()
    .min(0, { message: "Inventory must be a non-negative number" }),
  sku: z
    .string()
    .min(3, { message: "SKU is required and must be at least 3 characters" }),
  images: z
    .array(z.string())
    .min(1, { message: "At least one product image is required" }),
  is_published: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  // State for the form
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    details: "",
    price: 0,
    discount: 0,
    trending: false,
    category_id: "",
    inventory: 0,
    sku: "",
    images: [],
    is_published: false,
    meta_title: "",
    meta_description: "",
  });

  // Editing an existing product
  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(
    productId ? formData.slug || "" : ""
  );

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Load existing product data if editing
  useEffect(() => {
    if (productId && existingProduct) {
      setFormData({
        name: existingProduct.name || "",
        slug: existingProduct.slug || "",
        details: existingProduct.details || "",
        price: existingProduct.price || 0,
        discount: existingProduct.discount || 0,
        trending: existingProduct.trending || false,
        category_id: existingProduct.category_id || "",
        inventory: existingProduct.inventory || 0,
        sku: existingProduct.sku || "",
        images: existingProduct.images || [],
        is_published: existingProduct.is_published || false,
        meta_title: existingProduct.meta_title || "",
        meta_description: existingProduct.meta_description || "",
      });
      setImageUrls(existingProduct.images || []);
    }
  }, [productId, existingProduct]);

  // Generate slug from product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      // Only update slug automatically if it's empty or matches the previous name pattern
      slug:
        !formData.slug || formData.slug === generateSlug(formData.name)
          ? generateSlug(name)
          : formData.slug,
    });
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Add image URL
  const handleAddImage = () => {
    if (!newImageUrl) return;

    if (
      !newImageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)
    ) {
      setErrors({
        ...errors,
        imageUrl: "Please enter a valid image URL (jpg, png, webp, gif)",
      });
      return;
    }

    setImageUrls([...imageUrls, newImageUrl]);
    setFormData({
      ...formData,
      images: [...imageUrls, newImageUrl],
    });
    setNewImageUrl("");

    // Clear image error if it exists
    if (errors.images) {
      const { images, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Remove image URL
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...imageUrls];
    updatedImages.splice(index, 1);
    setImageUrls(updatedImages);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  // Handle images change
  const handleImagesChange = (images: string[]) => {
    setFormData({
      ...formData,
      images,
    });

    // Clear image error if it exists
    if (errors.images) {
      const { images: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = productSchema.parse(formData);

      if (productId) {
        // Update existing product
        await updateProduct.mutateAsync({
          id: productId,
          product: validatedData,
        });
        router.push("/admin/products");
      } else {
        // Add new product
        await addProduct.mutateAsync(validatedData);
        router.push("/admin/products");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our format
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        console.error("Error submitting product form:", error);
        setErrors({
          form: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (productId && isLoadingProduct) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-green-600' />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-8'
    >
      {/* Form error message */}
      {errors.form && (
        <div className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {errors.form}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Product Name */}
        <div className='col-span-2'>
          <label
            htmlFor='name'
            className='block text-sm font-medium mb-1'
          >
            Product Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleNameChange}
            className={`w-full p-2 border rounded-md ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-500'>{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='slug'
            className='block text-sm font-medium mb-1'
          >
            Slug <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='slug'
            name='slug'
            value={formData.slug}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.slug ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.slug && (
            <p className='mt-1 text-sm text-red-500'>{errors.slug}</p>
          )}
        </div>

        {/* SKU */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='sku'
            className='block text-sm font-medium mb-1'
          >
            SKU <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='sku'
            name='sku'
            value={formData.sku}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.sku ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.sku && (
            <p className='mt-1 text-sm text-red-500'>{errors.sku}</p>
          )}
        </div>

        {/* Category */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='category_id'
            className='block text-sm font-medium mb-1'
          >
            Category <span className='text-red-500'>*</span>
          </label>
          <select
            id='category_id'
            name='category_id'
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value=''>Select a category</option>
            {isLoadingCategories ? (
              <option disabled>Loading categories...</option>
            ) : (
              categories?.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))
            )}
          </select>
          {errors.category_id && (
            <p className='mt-1 text-sm text-red-500'>{errors.category_id}</p>
          )}
        </div>

        {/* Inventory */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='inventory'
            className='block text-sm font-medium mb-1'
          >
            Inventory <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            id='inventory'
            name='inventory'
            value={formData.inventory}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.inventory ? "border-red-500" : "border-gray-300"
            }`}
            min='0'
            required
          />
          {errors.inventory && (
            <p className='mt-1 text-sm text-red-500'>{errors.inventory}</p>
          )}
        </div>

        {/* Price */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='price'
            className='block text-sm font-medium mb-1'
          >
            Price <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500'>
              $
            </span>
            <input
              type='number'
              id='price'
              name='price'
              value={formData.price}
              onChange={handleChange}
              className={`w-full p-2 pl-7 border rounded-md ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              step='0.01'
              min='0'
              required
            />
          </div>
          {errors.price && (
            <p className='mt-1 text-sm text-red-500'>{errors.price}</p>
          )}
        </div>

        {/* Discount */}
        <div className='col-span-2 md:col-span-1'>
          <label
            htmlFor='discount'
            className='block text-sm font-medium mb-1'
          >
            Discount (%)
          </label>
          <div className='relative'>
            <input
              type='number'
              id='discount'
              name='discount'
              value={formData.discount}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.discount ? "border-red-500" : "border-gray-300"
              }`}
              min='0'
              max='100'
            />
            <span className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500'>
              %
            </span>
          </div>
          {errors.discount && (
            <p className='mt-1 text-sm text-red-500'>{errors.discount}</p>
          )}
        </div>

        {/* Product Details */}
        <div className='col-span-2'>
          <label
            htmlFor='details'
            className='block text-sm font-medium mb-1'
          >
            Product Details <span className='text-red-500'>*</span>
          </label>
          <textarea
            id='details'
            name='details'
            value={formData.details}
            onChange={handleChange}
            rows={6}
            className={`w-full p-2 border rounded-md ${
              errors.details ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.details && (
            <p className='mt-1 text-sm text-red-500'>{errors.details}</p>
          )}
        </div>

        {/* Images */}
        <div className='col-span-2'>
          <ProductImageUploader
            images={formData.images}
            onImagesChange={handleImagesChange}
            error={errors.images}
          />
        </div>

        {/* Checkboxes */}
        <div className='col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='is_published'
              name='is_published'
              checked={formData.is_published}
              onChange={handleCheckboxChange}
              className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
            />
            <label
              htmlFor='is_published'
              className='ml-2 block text-sm'
            >
              Published (visible to customers)
            </label>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='trending'
              name='trending'
              checked={formData.trending}
              onChange={handleCheckboxChange}
              className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
            />
            <label
              htmlFor='trending'
              className='ml-2 block text-sm'
            >
              Trending Product
            </label>
          </div>
        </div>

        {/* SEO Fields */}
        <div className='col-span-2'>
          <h3 className='font-medium mb-2'>SEO Information</h3>

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='meta_title'
                className='block text-sm font-medium mb-1'
              >
                Meta Title
              </label>
              <input
                type='text'
                id='meta_title'
                name='meta_title'
                value={formData.meta_title || ""}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded-md'
              />
            </div>

            <div>
              <label
                htmlFor='meta_description'
                className='block text-sm font-medium mb-1'
              >
                Meta Description
              </label>
              <textarea
                id='meta_description'
                name='meta_description'
                value={formData.meta_description || ""}
                onChange={handleChange}
                rows={3}
                className='w-full p-2 border border-gray-300 rounded-md'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex justify-end space-x-3'>
        <button
          type='button'
          onClick={() => router.push("/admin/products")}
          className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center disabled:opacity-50'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='animate-spin h-5 w-5 mr-2' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-5 w-5 mr-2' />
              {productId ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
