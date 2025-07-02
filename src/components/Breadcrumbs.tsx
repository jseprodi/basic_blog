'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Handle special cases
      let label = segment;
      if (segment === 'dashboard') {
        label = 'Dashboard';
      } else if (segment === 'new') {
        label = 'New Post';
      } else if (segment === 'edit') {
        label = 'Edit Post';
      } else if (segment === 'login') {
        label = 'Sign In';
      } else if (segment === 'post') {
        label = 'Post';
      } else if (segment === 'api') {
        return; // Skip API routes
      } else if (!isNaN(Number(segment))) {
        // This is an ID, don't add to breadcrumbs
        return;
      } else {
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      // Don't make the last item a link
      const isLast = index === segments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }
  
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              ) : (
                <span className="text-sm text-gray-900 font-medium">
                  {breadcrumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
} 