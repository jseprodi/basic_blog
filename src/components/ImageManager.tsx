'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastProvider';
import LoadingSpinner from './LoadingSpinner';
import ImageUpload from './ImageUpload';
import OptimizedImage from './OptimizedImage';

interface UploadedImage {
  filename: string;
  url: string;
  uploadedAt: string;
}

export default function ImageManager() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        showError('Failed to fetch images');
      }
    } catch (error) {
      showError('An error occurred while fetching images');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const deleteImage = useCallback(async (filename: string) => {
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
        fetchImages(); // Refresh the list
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete image');
      }
    } catch (error) {
      showError('An error occurred while deleting the image');
    }
  }, [showSuccess, showError, fetchImages]);

  const copyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    showSuccess('Image URL copied to clipboard!');
  }, [showSuccess]);

  const handleImageUploaded = useCallback((url: string) => {
    showSuccess('Image uploaded successfully!');
    fetchImages(); // Refresh the list
  }, [showSuccess, fetchImages]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Image Manager</h2>
        <div className="text-sm text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Image</h3>
        <ImageUpload onImageUploaded={handleImageUploaded} />
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Images</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.filename} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                    <OptimizedImage
                      src={image.url}
                      alt={image.filename}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      placeholder="blur"
                      blurDataURL="/vercel.svg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                        <button
                          type="button"
                          onClick={() => copyImageUrl(image.url)}
                          className="block w-full px-3 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                        >
                          Copy URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedImage(image.url)}
                          className="block w-full px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(image.filename)}
                          className="block w-full px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(image.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-8 w-8"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
              style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px' }}
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h3>
          <p className="text-gray-500">
            Upload your first image to get started with your blog.
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Image Preview</h3>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <OptimizedImage
                src={selectedImage}
                alt="Preview"
                width={800}
                height={600}
                className="max-w-full h-auto rounded-lg"
                placeholder="blur"
                blurDataURL="/vercel.svg"
              />
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => copyImageUrl(selectedImage)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 