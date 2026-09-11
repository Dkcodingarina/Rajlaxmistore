import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Link2, Check, AlertCircle, Plus } from 'lucide-react';
import { uploadImage, uploadMultipleImages } from '../../services/imageUploadService';

/**
 * Modern Image Upload Dropzone for Admin Panels
 * Supports both direct device file uploads (Supabase Storage / Base64 fallback) and URL inputs.
 * 
 * Props:
 * - value: string (for single) or string[] (for multiple)
 * - onChange: function(newUrl | newUrlsArray)
 * - multiple: boolean (default false)
 * - folder: string ('banners' | 'products' | 'festivals' | 'categories' | 'brands')
 * - label: string
 * - helperText: string
 * - aspectRatioText: string (e.g., "16:9 Banner (1920x800px)" or "1:1 Square (800x800px)")
 */
export default function ImageUploadDropzone({
  value,
  onChange,
  multiple = false,
  folder = 'general',
  label = 'Upload Image',
  helperText = 'PNG, JPG, WEBP or SVG up to 8MB',
  aspectRatioText = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Normalize current images array
  const images = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (typeof value === 'string' && value ? [value] : []);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setIsUploading(true);

    try {
      if (multiple) {
        const newUrls = await uploadMultipleImages(files, folder);
        const combined = [...images, ...newUrls];
        onChange(combined);
      } else {
        const file = files[0];
        const newUrl = await uploadImage(file, folder);
        onChange(newUrl);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    if (multiple) {
      const updated = images.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (multiple) {
      onChange([...images, urlInput.trim()]);
    } else {
      onChange(urlInput.trim());
    }
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      {/* Label and Upload Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block font-bold text-neutral-800 text-xs flex items-center space-x-1.5">
          <span>{label}</span>
          {aspectRatioText && (
            <span className="text-[10px] font-normal text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {aspectRatioText}
            </span>
          )}
        </label>

        {/* Tab switch for direct upload vs image url */}
        <div className="flex items-center space-x-1 bg-neutral-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            📁 Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            🔗 Paste URL
          </button>
        </div>
      </div>

      {/* Mode 1: DIRECT FILE UPLOAD (Dropzone) */}
      {activeTab === 'upload' && (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-rose-500 bg-rose-50/80 scale-[1.01]'
                : 'border-neutral-300 hover:border-rose-400 bg-neutral-50/60 hover:bg-neutral-50'
            } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center py-3 space-y-2">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                <span className="text-xs font-bold text-rose-700">
                  Uploading image to server...
                </span>
                <span className="text-[10px] text-neutral-500">Please wait a moment</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">
                    <span className="text-rose-600 hover:underline">Click to browse</span> or drag and drop image here
                  </p>
                  <p className="text-[10px] text-neutral-500">{helperText}</p>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: PASTE URL INPUT */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW GALLERY FOR UPLOADED IMAGES */}
      {images.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
            {multiple ? `Uploaded Photos (${images.length})` : 'Selected Image Preview:'}
          </span>

          {multiple ? (
            /* Multi-Image Grid Preview */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-2xs"
                >
                  <img
                    src={imgUrl}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition opacity-90 group-hover:opacity-100 cursor-pointer shadow-xs"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Quick Add More Tile in Multiple Mode */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-rose-400 bg-neutral-50 hover:bg-rose-50/50 flex flex-col items-center justify-center text-neutral-500 hover:text-rose-600 transition cursor-pointer p-2"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold leading-tight text-center">Add More</span>
              </button>
            </div>
          ) : (
            /* Single Image Banner/Poster Preview */
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-xs group max-h-48">
              <img
                src={images[0]}
                alt="Uploaded preview"
                className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition"
              />
              <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white/90 hover:bg-white text-neutral-900 text-[10px] font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(0)}
                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
