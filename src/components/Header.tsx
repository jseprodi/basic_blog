'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const showKeyboardShortcuts = () => {
    const shortcuts = [
      { key: 'Ctrl/Cmd + S', description: 'Save post' },
      { key: 'Ctrl/Cmd + Enter', description: 'Publish post' },
      { key: 'Ctrl/Cmd + P', description: 'Preview post' },
      { key: 'Ctrl/Cmd + N', description: 'New post' },
      { key: 'Ctrl/Cmd + D', description: 'Go to dashboard' },
      { key: 'Ctrl/Cmd + H', description: 'Go to home' },
      { key: 'Ctrl/Cmd + K', description: 'Search' },
      { key: 'F1 or Ctrl/Cmd + ?', description: 'Show keyboard shortcuts' },
      { key: 'Escape', description: 'Clear search / Close modals' },
    ];

    const shortcutsText = shortcuts
      .map(shortcut => `${shortcut.key}: ${shortcut.description}`)
      .join('\n');

    alert(`Keyboard Shortcuts:\n\n${shortcutsText}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Blog</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              {session && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Keyboard Shortcuts Help */}
            <button
              onClick={showKeyboardShortcuts}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (F1)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Search"
                title="Search (Ctrl/Cmd + K)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      New Post
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 