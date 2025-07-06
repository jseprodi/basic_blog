'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';


export default function Header() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionRetryCount, setSessionRetryCount] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Retry session update if session is empty but status is authenticated
  useEffect(() => {
    if (status === 'authenticated' && !session?.user && sessionRetryCount < 3) {
      console.log('Session empty but authenticated, retrying...', { sessionRetryCount });
      const timer = setTimeout(() => {
        update();
        setSessionRetryCount(prev => prev + 1);
      }, 1000 * (sessionRetryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [status, session, update, sessionRetryCount]);

  // Reset retry count when session is restored
  useEffect(() => {
    if (session?.user) {
      setSessionRetryCount(0);
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      router.push('/');
    }
  };

  const updateDropdownPosition = () => {
    if (typeof window !== 'undefined') {
      const button = document.querySelector('[data-user-menu-button]');
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownWidth = 176;
        const viewportWidth = window.innerWidth;
        
        // Calculate left position to keep dropdown in viewport
        let left = rect.left;
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 10;
        }
        
        setDropdownPosition({
          top: rect.bottom + 8,
          left: Math.max(10, left)
        });
      }
    }
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

  // Ensure consistent rendering between server and client
  const logoText = 'J';
  const brandText = 'JOSHUA SEPRODI';

  // Debug logging
  useEffect(() => {
    if (isMounted) {
      console.log('Header session state:', { 
        status, 
        hasUser: !!session?.user, 
        userName: session?.user?.name,
        userEmail: session?.user?.email 
      });
      console.log('Header component re-rendered with dropdown positioning fixes - v10');
      console.log('Current timestamp:', new Date().toISOString());
      console.log('Dropdown positioning: dynamic fixed positioning applied');
      console.log('Unique ID:', Math.random().toString(36).substr(2, 9));
      console.log('Dropdown position:', dropdownPosition);
    }
  }, [isMounted, status, session]);

  return (
    <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                <span className="text-white font-bold text-lg font-mono">{logoText}</span>
              </div>
              <span className="text-xl font-bold text-yellow-500 font-mono tracking-wider group-hover:text-yellow-400 transition-colors">{brandText}</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-mono tracking-wide transition-colors hover:bg-black/20"
              >
                HOME
              </Link>
              {session && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-mono tracking-wide transition-colors hover:bg-black/20"
                >
                  DASHBOARD
                </Link>
              )}
            </nav>
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {isMounted && <ThemeToggle />}

            {/* Keyboard Shortcuts Help */}
            <button
              onClick={showKeyboardShortcuts}
              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
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
                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                aria-label="Search"
                title="Search (Ctrl/Cmd + K)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {isSearchOpen && (
                <div key={`search-dropdown-${Date.now()}`} className="absolute top-full mt-2 w-72 sm:w-80 rounded-md shadow-2xl border border-gray-800 z-50 dropdown-solid-bg" style={{ position: 'absolute', top: '100%', left: '0px', right: 'auto', transform: 'none', marginTop: '8px', width: '320px', minWidth: '288px', zIndex: 50 }}>
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH POSTS..."
                        className="flex-1 px-3 py-2 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white bg-gray-900 font-mono text-sm"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-600 text-black rounded-r-md hover:bg-yellow-500 transition-colors font-mono text-sm font-bold"
                      >
                        SEARCH
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-700 h-8 w-8 rounded-full"></div>
            ) : session ? (
              <div className="relative group">
                <button 
                  data-user-menu-button
                  className="flex items-center space-x-2 text-gray-300 hover:text-yellow-500 transition-colors"
                  onMouseEnter={updateDropdownPosition}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-mono font-bold">
                      {isMounted ? (session.user?.name?.[0] || session.user?.email?.[0] || 'U') : 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-mono font-medium">
                    {isMounted ? (session.user?.name || session.user?.email) : 'User'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div key={`user-dropdown-${Date.now()}`} className="fixed rounded-md shadow-2xl border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 dropdown-solid-bg" style={{ width: '176px', zIndex: 9999, top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors font-mono"
                    >
                      DASHBOARD
                    </Link>
                    <Link
                      href="/dashboard/new"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors font-mono"
                    >
                      NEW POST
                    </Link>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-500 transition-colors font-mono"
                    >
                      SIGN OUT
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black px-4 py-2 rounded-md text-sm font-mono font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 