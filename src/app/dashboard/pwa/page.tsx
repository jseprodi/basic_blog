'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/components/ToastProvider';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  HardDrive, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Info
} from 'lucide-react';

export default function PWASettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const {
    isOnline,
    isInstalled,
    canInstall,
    serviceWorkerStatus,
    installApp,
    checkForUpdates,
    clearCache,
  } = usePWA();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      showSuccess('App installation started!');
    } else {
      showError('Installation failed or was cancelled.');
    }
  };

  const handleCheckUpdates = async () => {
    await checkForUpdates();
    showSuccess('Update check completed!');
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached data? This will remove offline content.')) {
      const success = await clearCache();
      if (success) {
        showSuccess('Cache cleared successfully!');
      } else {
        showError('Failed to clear cache.');
      }
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  PWA Settings
                </h1>
              </div>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex space-x-4 mb-6 pb-4 border-b">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              >
                Posts
              </Link>
              <Link
                href="/dashboard/images"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              >
                Images
              </Link>
              <Link
                href="/dashboard/pwa"
                className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
              >
                PWA Settings
              </Link>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Connection</span>
                </div>
                <p className={`text-lg font-semibold ${
                  isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Installation</span>
                </div>
                <p className={`text-lg font-semibold ${
                  isInstalled ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isInstalled ? 'Installed' : 'Not Installed'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Cache</span>
                </div>
                <p className="text-lg font-semibold text-purple-600">
                  Available
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {serviceWorkerStatus === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Service Worker</span>
                </div>
                <p className={`text-lg font-semibold ${
                  serviceWorkerStatus === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {serviceWorkerStatus === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">PWA Actions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleInstall}
                  disabled={!canInstall || isInstalled}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </button>

                <button
                  onClick={handleCheckUpdates}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Check for Updates
                </button>

                <button
                  onClick={handleClearCache}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Cache
                </button>
              </div>
            </div>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    About Progressive Web App (PWA)
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      This blog is a Progressive Web App that provides:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Offline reading capabilities</li>
                      <li>Fast loading with intelligent caching</li>
                      <li>Installation on home screen</li>
                      <li>Automatic updates</li>
                      <li>Native app-like experience</li>
                    </ul>
                    <p className="mt-3">
                      <strong>Note:</strong> PWA features work best on modern browsers and mobile devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 