'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from './ToastProvider';
import LoadingSpinner from './LoadingSpinner';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

interface UploadedImage {
  filename: string;
  url: string;
  uploadedAt: string;
}

export default function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Image uploaded successfully!');
        onImageUploaded(data.url);
        
        // Refresh image library
        fetchUploadedImages();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      showError('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded, showSuccess, showError]);

  const fetchUploadedImages = useCallback(async () => {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setUploadedImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch uploaded images:', error);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    uploadImage(file);
  }, [uploadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDeleteImage = useCallback(async (filename: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (response.ok) {
        showSuccess('Image deleted successfully!');
        fetchUploadedImages();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete image');
      }
    } catch (error) {
      showError('An error occurred while deleting the image');
    }
  }, [showSuccess, showError, fetchUploadedImages]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload an image</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleFileInputChange}
                ref={fileInputRef}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Uploading image...</span>
        </div>
      )}

      {/* Image Library Toggle */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            setShowImageLibrary(!showImageLibrary);
            if (!showImageLibrary) {
              fetchUploadedImages();
            }
          }}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          {showImageLibrary ? 'Hide' : 'Show'} Image Library
        </button>
      </div>

      {/* Image Library */}
      {showImageLibrary && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Images</h3>
          {uploadedImages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.filename} className="relative group">
                  <div className="aspect-square bg-white rounded-lg border overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                        <button
                          type="button"
                          onClick={() => onImageUploaded(image.url)}
                          className="block w-full px-3 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                        >
                          Use Image
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.filename)}
                          className="block w-full px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{image.filename}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 