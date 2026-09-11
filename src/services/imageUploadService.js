import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PRIMARY_BUCKET = 'store-assets';
const FALLBACK_BUCKET = 'store-media';

/**
 * Converts a File object to a Base64 data URL string (fallback for offline/local storage)
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Uploads an image file to Supabase Storage bucket ('store-assets' or 'store-media'), or returns base64 on fallback
 * @param {File} file - The file to upload
 * @param {string} folder - Destination subfolder ('banners', 'products', 'festivals', 'categories', 'brands')
 * @returns {Promise<string>} The public URL or data URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'general') => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (PNG, JPG, WEBP, or SVG)');
  }

  // Validate size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB');
  }

  // If Supabase is configured and connected, upload to Supabase Storage bucket
  if (isSupabaseConfigured && supabase) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = `${folder}/${timestamp}_${randomStr}_${sanitizedName}`;

    // Try primary bucket first
    try {
      const { data, error } = await supabase.storage
        .from(PRIMARY_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from(PRIMARY_BUCKET)
          .getPublicUrl(filePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      // ignore and try fallback
    }

    // Try fallback bucket
    try {
      const { data, error } = await supabase.storage
        .from(FALLBACK_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from(FALLBACK_BUCKET)
          .getPublicUrl(filePath);
        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Fallback for local testing / demo mode without backend keys or if bucket not yet created
  return await fileToBase64(file);
};

/**
 * Deletes an image from Supabase Storage if it was uploaded there
 * @param {string} imageUrl - The full image URL
 * @returns {Promise<boolean>} True if deleted or skipped safely
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string' || !isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    let bucket = null;
    let path = null;

    if (imageUrl.includes(`/storage/v1/object/public/${PRIMARY_BUCKET}/`)) {
      bucket = PRIMARY_BUCKET;
      path = imageUrl.split(`/storage/v1/object/public/${PRIMARY_BUCKET}/`)[1];
    } else if (imageUrl.includes(`/storage/v1/object/public/${FALLBACK_BUCKET}/`)) {
      bucket = FALLBACK_BUCKET;
      path = imageUrl.split(`/storage/v1/object/public/${FALLBACK_BUCKET}/`)[1];
    }

    if (bucket && path) {
      const cleanPath = decodeURIComponent(path.split('?')[0]);
      const { error } = await supabase.storage.from(bucket).remove([cleanPath]);
      if (error) console.warn('Image storage removal notice:', error.message);
      return !error;
    }
  } catch (err) {
    console.warn('Could not delete image from Supabase storage:', err);
  }
  return false;
};

/**
 * Uploads multiple image files concurrently
 * @param {FileList|File[]} files - List of files
 * @param {string} folder - Subfolder
 * @returns {Promise<string[]>} Array of image URLs
 */
export const uploadMultipleImages = async (files, folder = 'products') => {
  if (!files || files.length === 0) return [];
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map((file) => uploadImage(file, folder));
  return await Promise.all(uploadPromises);
};

export default {
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  fileToBase64
};
