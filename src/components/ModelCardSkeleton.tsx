/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function ModelCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/10 overflow-hidden shadow-sm animate-pulse">
      {/* Portfolio Cover Image aspect ratio skeleton */}
      <div className="relative aspect-[3/4] w-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
        {/* Shimmer overlay accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
        
        {/* Favorite Heart Badge Placeholder */}
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        
        {/* Category Pill Tag Placeholder */}
        <div className="absolute left-3 bottom-3 h-5 w-20 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>

      {/* Model Information Skeleton details */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* Name, City & Rating section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Name */}
            <div className="h-4.5 w-2/3 bg-neutral-300 dark:bg-neutral-700 rounded-lg" />
            {/* City, State */}
            <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          </div>

          {/* Star review score pill placeholder */}
          <div className="h-6 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
        </div>

        {/* Advanced Model Specific Stats in grid */}
        <div className="grid grid-cols-3 gap-1 border-y border-neutral-150 dark:border-white/5 py-2.5">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="h-2 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
            <div className="h-3.5 w-12 bg-neutral-300 dark:bg-neutral-700 rounded-md" />
          </div>
          <div className="space-y-1.5 flex flex-col items-center border-x border-neutral-150 dark:border-white/5">
            <div className="h-2 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
            <div className="h-3.5 w-10 bg-neutral-300 dark:bg-neutral-700 rounded-md" />
          </div>
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="h-2 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
            <div className="h-3.5 w-14 bg-neutral-300 dark:bg-neutral-700 rounded-md" />
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1.5">
            <div className="h-2.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
            <div className="h-4 w-20 bg-neutral-300 dark:bg-neutral-700 rounded-md" />
          </div>

          {/* Book button placeholder */}
          <div className="h-8.5 w-28 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}
