'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner, { DashboardPostSkeleton } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ToastProvider';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  tags: {
    id: number;
    name: string;
  }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
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

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
        showSuccess('Post deleted successfully!');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('An error occurred while deleting the post');
    }
  };

  const togglePublish = async (id: number, published: boolean) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      });
      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === id ? { ...post, published: !published } : post
        ));
        showSuccess(published ? 'Post unpublished successfully!' : 'Post published successfully!');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update post status');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showError('An error occurred while updating the post');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Blog Dashboard
              </h1>
              <Link
                href="/dashboard/new"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                New Post
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
                {[1, 2, 3].map((i) => (
                  <DashboardPostSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No posts yet. Create your first post!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{post.published ? 'Published' : 'Draft'}</span>
                            {post.category && (
                              <>
                                <span>•</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {post.category.name}
                                </span>
                              </>
                            )}
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePublish(post.id, post.published)}
                            className={`px-3 py-1 rounded text-sm ${
                              post.published 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {post.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link
                            href={`/dashboard/edit/${post.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 