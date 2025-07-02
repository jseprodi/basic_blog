'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Smartphone, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';

interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  cacheStatus: 'available' | 'unavailable' | 'checking';
  serviceWorkerStatus: 'active' | 'inactive' | 'checking' | 'unavailable';
}

export default function PWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: true,
    isInstalled: false,
    cacheStatus: 'checking',
    serviceWorkerStatus: 'checking',
  });

  useEffect(() => {
    checkPWAStatus();
    
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPWAStatus = async () => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;

    // Check service worker status
    let serviceWorkerStatus: 'active' | 'inactive' | 'checking' | 'unavailable' = 'checking';
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        serviceWorkerStatus = registration?.active ? 'active' : 'inactive';
      } catch (error) {
        serviceWorkerStatus = 'inactive';
      }
    } else {
      serviceWorkerStatus = 'unavailable';
    }

    // Check cache status
    let cacheStatus: 'available' | 'unavailable' | 'checking' = 'checking';
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        cacheStatus = cacheNames.length > 0 ? 'available' : 'unavailable';
      } catch (error) {
        cacheStatus = 'unavailable';
      }
    } else {
      cacheStatus = 'unavailable';
    }

    setStatus({
      isOnline: navigator.onLine,
      isInstalled,
      cacheStatus,
      serviceWorkerStatus,
    });
  };

  const getStatusIcon = (type: keyof PWAStatus) => {
    switch (type) {
      case 'isOnline':
        return status.isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        );
      case 'isInstalled':
        return status.isInstalled ? (
          <Smartphone className="w-4 h-4 text-green-500" />
        ) : (
          <Smartphone className="w-4 h-4 text-gray-400" />
        );
      case 'cacheStatus':
        return status.cacheStatus === 'available' ? (
          <HardDrive className="w-4 h-4 text-green-500" />
        ) : status.cacheStatus === 'checking' ? (
          <HardDrive className="w-4 h-4 text-yellow-500" />
        ) : (
          <HardDrive className="w-4 h-4 text-red-500" />
        );
      case 'serviceWorkerStatus':
        return status.serviceWorkerStatus === 'active' ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : status.serviceWorkerStatus === 'checking' ? (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        );
      default:
        return null;
    }
  };

  const getStatusText = (type: keyof PWAStatus) => {
    switch (type) {
      case 'isOnline':
        return status.isOnline ? 'Online' : 'Offline';
      case 'isInstalled':
        return status.isInstalled ? 'Installed' : 'Not Installed';
      case 'cacheStatus':
        return status.cacheStatus === 'available' ? 'Cache Available' : 
               status.cacheStatus === 'checking' ? 'Checking Cache' : 'Cache Unavailable';
      case 'serviceWorkerStatus':
        return status.serviceWorkerStatus === 'active' ? 'Service Worker Active' :
               status.serviceWorkerStatus === 'checking' ? 'Checking Service Worker' : 'Service Worker Inactive';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">PWA Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon('isOnline')}
            <span className="text-sm text-gray-700">Connection</span>
          </div>
          <span className={`text-sm font-medium ${
            status.isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {getStatusText('isOnline')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon('isInstalled')}
            <span className="text-sm text-gray-700">Installation</span>
          </div>
          <span className={`text-sm font-medium ${
            status.isInstalled ? 'text-green-600' : 'text-gray-600'
          }`}>
            {getStatusText('isInstalled')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon('cacheStatus')}
            <span className="text-sm text-gray-700">Cache</span>
          </div>
          <span className={`text-sm font-medium ${
            status.cacheStatus === 'available' ? 'text-green-600' :
            status.cacheStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {getStatusText('cacheStatus')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon('serviceWorkerStatus')}
            <span className="text-sm text-gray-700">Service Worker</span>
          </div>
          <span className={`text-sm font-medium ${
            status.serviceWorkerStatus === 'active' ? 'text-green-600' :
            status.serviceWorkerStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {getStatusText('serviceWorkerStatus')}
          </span>
        </div>
      </div>

      <button
        onClick={checkPWAStatus}
        className="mt-4 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Refresh Status
      </button>
    </div>
  );
} 