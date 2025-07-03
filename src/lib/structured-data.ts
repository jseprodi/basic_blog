interface ArticleStructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
}

interface WebsiteStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

interface BreadcrumbStructuredData {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateArticleStructuredData(post: {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt?: string;
  author: { name: string };
}): ArticleStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: post.featuredImage ? `${baseUrl}${post.featuredImage}` : `${baseUrl}/icons/icon-512x512.png`,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icons/icon-512x512.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/post/${post.id}`,
    },
  };
}

export function generateWebsiteStructuredData(): WebsiteStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Your Blog',
    description: 'A modern blog built with Next.js',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icons/icon-512x512.png`,
      },
    },
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
}>): BreadcrumbStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Blog',
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-512x512.png`,
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/yourblog',
      // 'https://facebook.com/yourblog',
    ],
  };
}

export function generateBlogPostingStructuredData(post: {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt?: string;
  author: { name: string };
  category?: { name: string };
  tags: Array<{ name: string }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: post.featuredImage ? `${baseUrl}${post.featuredImage}` : `${baseUrl}/icons/icon-512x512.png`,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icons/icon-512x512.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/post/${post.id}`,
    },
    articleSection: post.category?.name,
    keywords: post.tags.map(tag => tag.name).join(', '),
  };
} 