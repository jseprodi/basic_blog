import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PWAClientPanel from './PWAClientPanel';

export const metadata: Metadata = {
  title: 'PWA Settings - Blog Dashboard',
  description: 'Manage Progressive Web App settings and cache',
};

export default async function PWAPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            PWA Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage Progressive Web App settings, cache, and offline functionality
          </p>
        </div>

        <PWAClientPanel />

        {/* Additional PWA Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Offline Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your blog works offline with cached content and automatic sync when connection is restored.
            </p>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Enabled
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Push Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get notified about new posts and updates even when the app is closed.
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Enable Notifications
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Background Sync
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automatically sync data in the background when connection is restored.
            </p>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 