'use client';

import PWAStatus from '@/components/PWAStatus';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import CacheManager from '@/components/CacheManager';

export default function PWAClientPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* PWA Status */}
      <div className="space-y-6">
        <PWAStatus />
        <PWAInstallPrompt />
      </div>

      {/* Cache Management */}
      <div className="space-y-6">
        <CacheManager />
      </div>
    </div>
  );
} 