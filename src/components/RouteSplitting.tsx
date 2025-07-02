import dynamic from 'next/dynamic';

// Dashboard Pages - Route-based splitting
export const DynamicDashboard = dynamic(
  () => import('@/app/dashboard/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    ),
  }
);

export const DynamicNewPost = dynamic(
  () => import('@/app/dashboard/new/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export const DynamicEditPost = dynamic(
  () => import('@/app/dashboard/edit/[id]/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export const DynamicImagesPage = dynamic(
  () => import('@/app/dashboard/images/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading image manager...</p>
        </div>
      </div>
    ),
  }
);

export const DynamicPWAPage = dynamic(
  () => import('@/app/dashboard/pwa/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PWA settings...</p>
        </div>
      </div>
    ),
  }
);

// Public Pages - Lighter splitting
export const DynamicPostPage = dynamic(
  () => import('@/app/post/[id]/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    ),
  }
);

// Authentication Pages
export const DynamicLoginPage = dynamic(
  () => import('@/app/login/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading login...</p>
        </div>
      </div>
    ),
  }
); 