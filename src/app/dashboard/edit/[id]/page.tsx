'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import React from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import CategoryTagManager from '@/components/CategoryTagManager';
import LoadingSpinner, { FormSkeleton } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ToastProvider';
import { validateForm, validationRules } from '@/components/FormValidation';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcuts';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published: boolean;
  categoryId?: number | null;
  tagIds: number[];
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPost();
    }
  }, [session, resolvedParams.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt || '');
        setFeaturedImage(data.featuredImage || '');
        setPublished(data.published);
        setCategoryId(data.categoryId || null);
        setTagIds(data.tagIds || []);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError('');
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
      const response = await fetch(`/api/posts/${resolvedParams.id}`, {
        method: 'PATCH',
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
        showSuccess('Post updated successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to update post';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    handleSubmit();
  };

  const handlePublish = () => {
    setPublished(true);
    handleSubmit();
  };

  const handlePreview = () => {
    // For now, just update and show a message
    handleSubmit();
  };

  // Keyboard shortcuts
  const keyboardShortcuts = useKeyboardShortcuts({
    onSave: handleSave,
    onPublish: handlePublish,
    onPreview: handlePreview,
  });

  if (status === 'loading' || isLoading) {
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

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                <p className="text-red-600 mb-4">{error}</p>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {keyboardShortcuts}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
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
                  Featured Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
                    errors.featuredImage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.featuredImage && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.featuredImage.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
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
                  Published
                </label>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Post'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 