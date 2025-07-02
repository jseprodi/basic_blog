'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';
import CategoryTagManager from '@/components/CategoryTagManager';
import LoadingSpinner, { FormSkeleton } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ToastProvider';
import { validateForm, validationRules } from '@/components/FormValidation';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcuts';
import ImageUpload from '@/components/ImageUpload';
import OptimizedImage from '@/components/OptimizedImage';

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form
    const formData = { title, content, excerpt, featuredImage };
    const validation = validateForm(formData, {
      title: validationRules.title,
      content: validationRules.content,
      excerpt: validationRules.excerpt,
      featuredImage: featuredImage ? validationRules.url : {}
    });

    if (!validation.isValid) {
      const fieldErrors: Record<string, string[]> = {};
      validation.errors.forEach(error => {
        const [field, message] = error.split(': ');
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(message);
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          featuredImage,
          published,
          categoryId,
          tagIds,
        }),
      });

      if (response.ok) {
        showSuccess('Post created successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to create post');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    if (!published) {
      handleSubmit();
    }
  };

  const handlePublish = () => {
    setPublished(true);
    handleSubmit();
  };

  const handlePreview = () => {
    // For now, just save as draft and show a message
    setPublished(false);
    handleSubmit();
  };

  // Keyboard shortcuts
  const keyboardShortcuts = useKeyboardShortcuts({
    onSave: handleSave,
    onPublish: handlePublish,
    onPreview: handlePreview,
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <FormSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {keyboardShortcuts}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
              <p className="text-sm text-gray-600 mt-2">
                Use Ctrl/Cmd + S to save, Ctrl/Cmd + Enter to publish, or F1 for all shortcuts
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.title && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.title.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (Optional)
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
                    errors.excerpt ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="A brief summary of your post..."
                />
                {errors.excerpt && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.excerpt.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    id="featuredImage"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
                      errors.featuredImage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg or upload an image below"
                  />
                  {errors.featuredImage && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.featuredImage.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Upload Component */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">Or upload an image:</p>
                    <ImageUpload 
                      onImageUploaded={(url) => setFeaturedImage(url)}
                      className="max-w-md"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {featuredImage && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="relative max-w-xs">
                        <OptimizedImage
                          src={featuredImage}
                          alt="Featured image preview"
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg border"
                          placeholder="blur"
                          blurDataURL="/vercel.svg" // fallback blur
                        />
                        <button
                          type="button"
                          onClick={() => setFeaturedImage('')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CategoryTagManager
                selectedCategoryId={categoryId}
                selectedTagIds={tagIds}
                onCategoryChange={setCategoryId}
                onTagsChange={setTagIds}
              />

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your post content here..."
                />
                {errors.content && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.content.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Publish immediately
                </label>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(errors).map(([field, fieldErrors]) => (
                    <div key={field} className="text-red-600 text-sm">
                      {fieldErrors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 