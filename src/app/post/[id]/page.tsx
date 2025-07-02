'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DynamicComments } from '@/components/DynamicImports';
import React from 'react';
import { PostSkeleton } from '@/components/LoadingSpinner';
import OptimizedImage from '@/components/OptimizedImage';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  author: {
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  tags: {
    id: number;
    name: string;
  }[];
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/posts/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setError('Post not found');
      }
    } catch {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="w-full h-64 md:h-96 bg-gray-200">
              <OptimizedImage
                src={post.featuredImage}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
                priority={true}
                sizes="(max-width: 768px) 100vw, 800px"
                placeholder="blur"
                blurDataURL="/vercel.svg"
              />
            </div>
          )}

          <div className="p-8">
            <div className="mb-8">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Blog
              </Link>
            </div>

            <article>
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-gray-600 mb-4 italic">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <span>By {post.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Category and Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {post.category && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category.name}
                    </span>
                  )}
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </header>

              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </article>

            {/* Comments Section */}
            <DynamicComments postId={post.id} />

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 