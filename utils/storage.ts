import { supabase } from "@//lib/tanstack/supabase";

/**
 * Uploads an image to the Supabase storage
 * @param file The file to upload
 * @param path The path within the bucket (e.g., 'products', 'categories')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  path: string = ""
): Promise<string | null> {
  try {
    // Create a unique file name
    const fileName = `${path ? path + "/" : ""}${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    // Upload the file to the 'images' bucket
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    return null;
  }
}

/**
 * Deletes an image from the Supabase storage
 * @param url The full public URL of the image to delete
 * @returns Success status
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    const bucketIndex = pathSegments.findIndex(
      (segment) => segment === "images"
    );

    if (bucketIndex === -1 || bucketIndex === pathSegments.length - 1) {
      console.error("Invalid image URL format");
      return false;
    }

    // Get the file path within the bucket
    const filePath = pathSegments.slice(bucketIndex + 1).join("/");

    // Delete the file
    const { error } = await supabase.storage.from("images").remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return false;
  }
}

/**
 * Get a list of images from a specific path in the bucket
 * @param path The path within the bucket to list images from
 * @returns Array of image URLs
 */
export async function listImages(path: string = ""): Promise<string[]> {
  try {
    // List all files in the path
    const { data, error } = await supabase.storage.from("images").list(path);

    if (error) {
      console.error("Error listing images:", error);
      return [];
    }

    // Get public URLs for all files
    return data
      .filter((item) => !item.id.endsWith("/")) // Filter out folders
      .map((item) => {
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(`${path ? path + "/" : ""}${item.name}`);

        return urlData.publicUrl;
      });
  } catch (error) {
    console.error("Error in listImages:", error);
    return [];
  }
}
