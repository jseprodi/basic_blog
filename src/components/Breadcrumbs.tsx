'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === '/') {
    return null;
  }

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Handle dynamic routes
      if (path === '[id]' || path.match(/^\d+$/)) {
        const prevPath = paths[index - 1];
        if (prevPath === 'post') {
          breadcrumbs.push({ name: 'Post', href: currentPath });
        } else if (prevPath === 'edit') {
          breadcrumbs.push({ name: 'Edit Post', href: currentPath });
        } else {
          breadcrumbs.push({ name: path, href: currentPath });
        }
      } else {
        // Handle static routes
        const name = path.charAt(0).toUpperCase() + path.slice(1);
        breadcrumbs.push({ name, href: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">
                  {breadcrumb.name}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
} 