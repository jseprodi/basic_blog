'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  author: string;
  readTime: number;
  score: number;
}

interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void;
  placeholder?: string;
  className?: string;
}

export default function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search posts, categories, tags...",
  className = ""
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    tags: [] as string[],
    dateRange: '',
    sortBy: 'relevance' as 'relevance' | 'date' | 'title' | 'readTime',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: typeof filters) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category: searchFilters.category,
          tags: searchFilters.tags.join(','),
          dateRange: searchFilters.dateRange,
          sortBy: searchFilters.sortBy,
          sortOrder: searchFilters.sortOrder
        });

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          onSearch?.(data.results || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [onSearch]
  );

  // Update search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    
    // Update filters in URL
    if (filters.category) params.set('category', filters.category);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [query, filters, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(query, filters);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFilters({
      category: '',
      tags: [],
      dateRange: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as 'relevance' | 'date' | 'title' | 'readTime'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="readTime">Read Time</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <button
                type="button"
                onClick={toggleSortOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white flex items-center justify-between"
              >
                <span className="capitalize">{filters.sortOrder}</span>
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/post/${result.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {result.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{result.author}</span>
                    <span>{result.readTime} min read</span>
                    <span>{result.category}</span>
                    <span>Score: {result.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      )}

      {/* No Results */}
      {!isSearching && query && results.length === 0 && (
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
          No results found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 