'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-red-600 mb-4">500</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
          <p className="text-lg text-gray-600 mb-8">
            We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <div className="text-sm text-gray-500">
            <p>Or go back to safety:</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 underline">
              Return Home
            </Link>
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
} 