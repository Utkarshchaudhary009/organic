"use client";

import { useState, useRef } from "react";
import {
  Loader2,
  Plus,
  X,
  Upload,
  Link as LinkIcon,
  Camera,
} from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/utils/storage";

interface ProductImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  error?: string;
}

export default function ProductImageUploader({
  images,
  onImagesChange,
  error,
}: ProductImageUploaderProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setInputError(null);

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setInputError("Only image files are allowed");
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setInputError("Image size should be less than 5MB");
          continue;
        }

        // Upload image to storage
        const imageUrl = await uploadImage(file, "products");

        if (imageUrl) {
          onImagesChange([...images, imageUrl]);
        } else {
          setInputError("Failed to upload image");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setInputError("Error uploading image. Please try again.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Add image URL
  const handleAddImageUrl = () => {
    if (!newImageUrl) return;

    // Simple URL validation
    if (
      !newImageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)
    ) {
      setInputError("Please enter a valid image URL (jpg, png, webp, gif)");
      return;
    }

    setIsLoading(true);

    // Test if the image loads correctly
    const img = document.createElement("img");
    img.onload = () => {
      // Image loaded successfully
      onImagesChange([...images, newImageUrl]);
      setNewImageUrl("");
      setInputError(null);
      setIsLoading(false);
    };

    img.onerror = () => {
      // Image failed to load
      setInputError("The image URL is invalid or the image cannot be loaded");
      setIsLoading(false);
    };

    img.src = newImageUrl;
  };

  // Remove image URL
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChange(updatedImages);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle camera capture for mobile
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };

  return (
    <div className='w-full'>
      <label className='block text-sm font-medium mb-2'>
        Product Images{" "}
        {images.length === 0 && <span className='text-red-500'>*</span>}
      </label>

      {/* Tab switcher */}
      <div className='flex justify-center mb-4'>
        <div className='flex w-full max-w-xs'>
          <button
            type='button'
            onClick={() => setUploadMode("file")}
            className={`flex-1 py-3 text-sm font-medium rounded-l-lg transition ${
              uploadMode === "file"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Upload File
          </button>
          <button
            type='button'
            onClick={() => setUploadMode("url")}
            className={`flex-1 py-3 text-sm font-medium rounded-r-lg transition ${
              uploadMode === "url"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {uploadMode === "file" ? (
        <div className='mb-4'>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
            ref={fileInputRef}
            multiple
          />
          <div className='flex flex-col gap-3 sm:flex-row'>
            <div
              onClick={triggerFileInput}
              className={`border-2 border-dashed ${
                inputError ? "border-red-500" : "border-gray-300"
              } rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-1`}
            >
              {isLoading ? (
                <div className='flex flex-col items-center py-6'>
                  <Loader2 className='h-10 w-10 animate-spin text-green-600 mb-3' />
                  <p className='text-sm text-gray-500'>Uploading image...</p>
                </div>
              ) : (
                <div className='flex flex-col items-center py-6'>
                  <Upload className='h-10 w-10 text-gray-400 mb-3' />
                  <p className='text-sm font-medium'>Tap to browse files</p>
                  <p className='text-xs text-gray-500 mt-2'>
                    JPG, PNG, WebP or GIF (max. 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Mobile camera button */}
            <button
              type='button'
              onClick={handleCameraCapture}
              disabled={isLoading}
              className='flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg sm:w-auto h-auto disabled:opacity-50 sm:flex-initial'
            >
              <div className='flex flex-col items-center'>
                <Camera className='h-6 w-6 mb-2' />
                <span className='text-xs'>Take Photo</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className='flex flex-col sm:flex-row items-center gap-2 mb-4'>
          <input
            type='url'
            value={newImageUrl}
            onChange={(e) => {
              setNewImageUrl(e.target.value);
              setInputError(null);
            }}
            placeholder='Enter image URL'
            className={`w-full p-3 border rounded-md ${
              inputError ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          />
          <button
            type='button'
            onClick={handleAddImageUrl}
            disabled={!newImageUrl || isLoading}
            className='w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded flex items-center justify-center disabled:opacity-50'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-5 w-5 mr-2 animate-spin' /> Loading
              </>
            ) : (
              <>
                <LinkIcon className='h-5 w-5 mr-2' /> Add URL
              </>
            )}
          </button>
        </div>
      )}

      {inputError && (
        <p className='mt-1 text-sm text-red-500 mb-3'>{inputError}</p>
      )}

      {error && <p className='mt-1 text-sm text-red-500 mb-3'>{error}</p>}

      {/* Image Preview Grid - Enhanced for mobile */}
      {images.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mt-3'>
          {images.map((url, index) => (
            <div
              key={index}
              className='relative border rounded-md overflow-hidden aspect-square shadow-sm'
            >
              <div className='relative w-full h-full'>
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes='(max-width: 640px) 45vw, (max-width: 768px) 30vw, 20vw'
                  className='object-cover'
                />
              </div>
              <button
                type='button'
                onClick={() => handleRemoveImage(index)}
                className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md'
                title='Remove image'
                aria-label='Remove image'
              >
                <X className='h-4 w-4' />
              </button>
              {index === 0 && (
                <div className='absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs font-medium py-1.5 text-center'>
                  Main Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !isLoading && uploadMode === "url" && (
        <div className='mt-3 border-2 border-dashed border-gray-300 rounded-md p-6 text-center'>
          <p className='text-gray-500'>
            No product images added yet. Add at least one image.
          </p>
        </div>
      )}
    </div>
  );
}
