'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

export default function HomeContent() {
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
    <main id="main-content" className="min-h-screen bg-black relative" role="main">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-500 mb-4 font-mono tracking-wider glitch">
            JOSHUA SEPRODI
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-mono tracking-wide">
            I KNOW LESS THE MORE I LEARN
          </p>
          
          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-300 font-mono">
                WELCOME BACK, {session.user?.name?.toUpperCase()}!
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 font-mono"
                aria-label="Go to dashboard"
              >
                ENTER DASHBOARD
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-300 font-mono">
                WELCOME TO MY BLOG
              </p>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 font-mono"
                aria-label="Sign in to access dashboard"
              >
                SIGN IN
              </Link>
            </div>
          )}
        </div>

        <section className="mt-12" aria-labelledby="posts-heading">
          <div className="mb-8">
            <SearchBar className="max-w-md mx-auto" />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 id="posts-heading" className="text-2xl font-bold text-yellow-500 font-mono tracking-wide">
              {searchQuery ? `SEARCH RESULTS: "${searchQuery.toUpperCase()}"` : 'LATEST POSTS'}
            </h2>
            {searchQuery && (
              <Link
                href="/"
                className="text-yellow-500 hover:text-yellow-400 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                aria-label="Clear search results"
              >
                CLEAR SEARCH
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-6" role="status" aria-live="polite">
              {[1, 2, 3].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-mono" role="status" aria-live="polite">
              {searchQuery ? `NO POSTS FOUND FOR "${searchQuery.toUpperCase()}"` : 'NO PUBLISHED POSTS YET.'}
            </div>
          ) : (
            <div className="space-y-6" role="feed" aria-label="Blog posts">
              {posts.map((post) => (
                <article key={post.id} className="bg-black/50 backdrop-blur-sm border border-gray-800 shadow-2xl rounded-lg overflow-hidden hover:border-yellow-500/50 transition-all duration-300" role="article">
                  {post.featuredImage && (
                    <div className="w-full h-48 bg-gray-200">
                      <OptimizedImage
                        src={post.featuredImage}
                        alt={`Featured image for ${post.title}`}
                        width={800}
                        height={400}
                        className="w-full h-full object-cover"
                        placeholder="blur"
                        blurDataURL="/vercel.svg"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-yellow-500 mb-2 font-mono">
                      <Link 
                        href={`/post/${post.id}`}
                        className="hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                        aria-label={`Read full article: ${post.title}`}
                      >
                        {post.title.toUpperCase()}
                      </Link>
                    </h3>
                    <div className="text-gray-300 mb-4 font-mono text-sm">
                      {post.excerpt ? (
                        <p>{post.excerpt}</p>
                      ) : (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: post.content.length > 200 
                              ? post.content.substring(0, 200) + '...' 
                              : post.content 
                          }}
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Post categories and tags">
                      {post.category && (
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-mono font-medium border border-yellow-500/30" role="tag">
                          {post.category.name.toUpperCase()}
                        </span>
                      )}
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded-full text-xs font-mono border border-gray-700"
                          role="tag"
                        >
                          {tag.name.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <footer className="flex justify-between items-center text-sm text-gray-400 font-mono">
                      <span>BY {post.author.name.toUpperCase()}</span>
                      <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString().toUpperCase()}</time>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
} 