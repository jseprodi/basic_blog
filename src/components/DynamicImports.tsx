import dynamic from 'next/dynamic';

// Rich Text Editor - Heavy component with Quill
export const DynamicRichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    ),
    ssr: false, // Disable SSR for Quill editor
  }
);

// Analytics Component - Heavy with charts and data processing
export const DynamicAnalytics = dynamic(
  () => import('./Analytics'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    ),
  }
);

// Security Monitor - Heavy with real-time monitoring
export const DynamicSecurityMonitor = dynamic(
  () => import('./SecurityMonitor'),
  {
    loading: () => (
      <div className="w-full h-48 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading security monitor...</div>
      </div>
    ),
  }
);

// Image Manager - Heavy with image processing
export const DynamicImageManager = dynamic(
  () => import('./ImageManager'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading image manager...</div>
      </div>
    ),
  }
);

// Image Upload - Heavy with file handling
export const DynamicImageUpload = dynamic(
  () => import('./ImageUpload'),
  {
    loading: () => (
      <div className="w-full h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading upload...</div>
      </div>
    ),
  }
);

// Advanced Search - Heavy with complex search logic
export const DynamicAdvancedSearch = dynamic(
  () => import('./AdvancedSearch'),
  {
    loading: () => (
      <div className="w-full h-16 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading search...</div>
      </div>
    ),
  }
);

// PWA Components - Only needed for PWA features
export const DynamicPWAInstallPrompt = dynamic(
  () => import('./PWAInstallPrompt'),
  {
    loading: () => null,
    ssr: false, // Disable SSR for PWA components
  }
);

export const DynamicPWAStatus = dynamic(
  () => import('./PWAStatus'),
  {
    loading: () => null,
    ssr: false,
  }
);

// Comments - Can be lazy loaded since it's below the fold
export const DynamicComments = dynamic(
  () => import('./Comments'),
  {
    loading: () => (
      <div className="w-full h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    ),
  }
);

// Category Tag Manager - Heavy with complex state management
export const DynamicCategoryTagManager = dynamic(
  () => import('./CategoryTagManager'),
  {
    loading: () => (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    ),
  }
); 