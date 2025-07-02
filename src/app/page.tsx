'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { PostCardSkeleton } from '@/components/LoadingSpinner';
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

function HomeContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
    fetchPosts(query);
  }, [searchParams]);

  const fetchPosts = async (search?: string) => {
    try {
      const url = search 
        ? `/api/public/posts?search=${encodeURIComponent(search)}`
        : '/api/public/posts';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to My Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A personal blog built with Next.js and NextAuth
          </p>
          
          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, {session.user?.name}!
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Please sign in to access your blog dashboard.
              </p>
              <Link
                href="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="mb-8">
            <SearchBar className="max-w-md mx-auto" />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Posts'}
            </h2>
            {searchQuery && (
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Clear Search
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? `No posts found for "${searchQuery}"` : 'No published posts yet.'}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {post.featuredImage && (
                    <div className="w-full h-48 bg-gray-200">
                      <OptimizedImage
                        src={post.featuredImage}
                        alt={post.title}
                        width={800}
                        height={400}
                        className="w-full h-full object-cover"
                        placeholder="blur"
                        blurDataURL="/vercel.svg"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link 
                        href={`/post/${post.id}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {post.excerpt || (post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {post.category && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {post.category.name}
                        </span>
                      )}
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>By {post.author.name}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
