/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BookingWizardSkeletonProps {
  isOpen: boolean;
  onClose: () => void;
  modelName?: string;
}

export default function BookingWizardSkeleton({ isOpen, onClose, modelName = 'Model' }: BookingWizardSkeletonProps) {
  if (!isOpen) return null;

  return (
    <div id="booking-wizard-skeleton-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/5 bg-[#121212] text-white shadow-2xl animate-pulse">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-20 rounded-full bg-white/10" />
            <div className="h-5 w-48 rounded-md bg-white/15" />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition cursor-pointer"
          >
            <div className="h-5 w-5 rounded-full bg-white/10" />
          </button>
        </div>

        {/* Progress visual notches placeholder */}
        <div className="grid grid-cols-4 gap-1 bg-white/5 h-1.5">
          <div className="h-full bg-white/20" />
          <div className="h-full bg-white/5" />
          <div className="h-full bg-white/5" />
          <div className="h-full bg-white/5" />
        </div>

        {/* Content Area skeleton */}
        <div className="p-6 space-y-6">
          {/* Section Header */}
          <div className="border-b border-white/5 pb-3 space-y-2">
            <div className="h-4 w-1/3 bg-white/25 rounded-md" />
            <div className="h-3 w-1/2 bg-white/10 rounded-sm" />
          </div>

          {/* Form grid skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-white/10 rounded-sm" />
              <div className="h-9.5 w-full bg-white/5 rounded-xl border border-white/10" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-white/10 rounded-sm" />
              <div className="h-9.5 w-full bg-white/5 rounded-xl border border-white/10" />
            </div>
          </div>

          {/* Large single input rows skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-white/10 rounded-sm" />
            <div className="h-9.5 w-full bg-white/5 rounded-xl border border-white/10" />
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-white/10 rounded-sm" />
            <div className="h-9.5 w-full bg-white/5 rounded-xl border border-white/10" />
          </div>
        </div>

        {/* Footer actions skeleton */}
        <div className="mt-4 px-6 py-4 flex items-center justify-between border-t border-white/5">
          <div className="h-9 w-20 rounded-full bg-white/5 border border-white/10" />
          <div className="h-9 w-28 rounded-full bg-white/20 ml-auto" />
        </div>

      </div>
    </div>
  );
}
