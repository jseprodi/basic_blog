import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
      />
    </div>
  );
}

// Skeleton components for different content types
export function PostSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
      {/* Featured Image Skeleton */}
      <div className="w-full h-48 bg-gray-200" />
      
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded mb-4" />
        
        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        
        {/* Meta Skeleton */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Tags Skeleton */}
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
      {/* Featured Image Skeleton */}
      <div className="w-full h-48 bg-gray-200" />
      
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-3" />
        
        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        
        {/* Meta Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPostSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        
        {/* Status Badge Skeleton */}
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      
      {/* Excerpt Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      
      {/* Meta Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        {/* Author Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-32" />
        
        {/* Date Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6 animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 bg-gray-200 rounded mb-6" />
      
      <div className="space-y-6">
        {/* Form Fields Skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
        
        {/* Submit Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
} 