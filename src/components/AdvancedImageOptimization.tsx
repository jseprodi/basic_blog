'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface AdvancedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function AdvancedImageOptimization({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'blur',
  blurDataURL = '/vercel.svg',
  onLoad,
  onError,
  fallbackSrc = '/vercel.svg',
}: AdvancedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
    onError?.();
  };

  // Generate responsive srcSet for different formats
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    const densities = [1, 2];
    
    return densities.map(density => 
      widths.map(width => 
        `${baseSrc}?w=${width * density}&q=${quality}&f=webp ${width * density}w`
      ).join(', ')
    ).join(', ');
  };

  // Generate multiple formats for better browser support
  const generatePictureSources = () => {
    const webpSrc = `${imageSrc}?f=webp&q=${quality}`;
    const avifSrc = `${imageSrc}?f=avif&q=${quality}`;
    const jpgSrc = `${imageSrc}?f=jpg&q=${quality}`;

    return (
      <>
        <source
          srcSet={generateSrcSet(avifSrc)}
          sizes={sizes}
          type="image/avif"
        />
        <source
          srcSet={generateSrcSet(webpSrc)}
          sizes={sizes}
          type="image/webp"
        />
        <source
          srcSet={generateSrcSet(jpgSrc)}
          sizes={sizes}
          type="image/jpeg"
        />
      </>
    );
  };

  if (hasError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 mx-auto mb-2">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <picture>
        {generatePictureSources()}
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      </picture>
    </div>
  );
}

// Specialized components for different use cases
export function HeroImage(props: Omit<AdvancedImageProps, 'priority'>) {
  return <AdvancedImageOptimization {...props} priority={true} />;
}

export function ThumbnailImage(props: Omit<AdvancedImageProps, 'sizes'>) {
  return (
    <AdvancedImageOptimization 
      {...props} 
      sizes="(max-width: 768px) 100vw, 300px"
      quality={60}
    />
  );
}

export function GalleryImage(props: Omit<AdvancedImageProps, 'sizes'>) {
  return (
    <AdvancedImageOptimization 
      {...props} 
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={80}
    />
  );
} 