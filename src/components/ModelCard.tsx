/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, MapPin, CheckCircle2, ShieldCheck, Heart, ChevronLeft, ChevronRight, Play, Video, Volume2, VolumeX, X, Lock } from 'lucide-react';
import { Model } from '../types';
import { getCityCoordinates, calculateHaversineDistance } from '../utils/location';
import { motion } from 'motion/react';

interface ModelCardProps {
  key?: string;
  model: Model;
  isFavorited: boolean;
  onFavoriteToggle: (modelId: string, e?: React.MouseEvent) => void;
  onViewProfile: (modelId: string) => void;
  onBookNow: (modelId: string, e: React.MouseEvent) => void;
  projectCoords?: { lat: number; lng: number } | null;
  isAuthenticated?: boolean;
  currentRole?: string;
  currentUserId?: string;
  isLocked?: boolean;
  onUnlockClick?: (modelId: string, e: React.MouseEvent) => void;
}

export default function ModelCard({
  model,
  isFavorited,
  onFavoriteToggle,
  onViewProfile,
  onBookNow,
  projectCoords,
  isAuthenticated = false,
  currentRole,
  currentUserId,
  isLocked = false,
  onUnlockClick
}: ModelCardProps) {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = React.useState<number>(0);
  const [swipeState, setSwipeState] = React.useState<'idle' | 'swiped-left' | 'swiped-right'>('idle');
  const [showSwipeBadge, setShowSwipeBadge] = React.useState<'like' | 'reject' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingVideo(true);
  };

  const handleStopVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingVideo(false);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const getAvailabilityBadge = (status?: 'Available' | 'Booked' | 'On-Leave') => {
    const s = status || 'Available';
    switch (s) {
      case 'Available':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[10px] font-black font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available</span>
          </span>
        );
      case 'Booked':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 text-[10px] font-black font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Booked</span>
          </span>
        );
      case 'On-Leave':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-[10px] font-black font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>On-Leave</span>
          </span>
        );
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? model.portfolio.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === model.portfolio.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStart.x;
    const diffY = touch.clientY - touchStart.y;

    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 15) {
        setSwipeOffset(diffX);
        if (diffX > 60) {
          setShowSwipeBadge('like');
        } else if (diffX < -60) {
          setShowSwipeBadge('reject');
        } else {
          setShowSwipeBadge(null);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    const threshold = 110; // swipe threshold in px
    if (swipeOffset > threshold) {
      // Swiped Right -> Favorite / Like
      setSwipeState('swiped-right');
      setShowSwipeBadge('like');
      if (!isFavorited) {
        onFavoriteToggle(model.id);
      }
      setTimeout(() => {
        setSwipeOffset(0);
        setSwipeState('idle');
        setShowSwipeBadge(null);
      }, 500);
    } else if (swipeOffset < -threshold) {
      // Swiped Left -> Reject/Pass with Undo option
      setSwipeState('swiped-left');
      setShowSwipeBadge('reject');
      setTimeout(() => {
        setShowSwipeBadge(null);
      }, 300);
    } else {
      // Reset
      setSwipeOffset(0);
      setShowSwipeBadge(null);
    }
    setTouchStart(null);
  };

  // Distance calculation relative to target project coords
  let distanceStr = '';
  if (projectCoords) {
    const modelCoords = getCityCoordinates(model.city);
    if (modelCoords) {
      const distance = calculateHaversineDistance(
        projectCoords.lat,
        projectCoords.lng,
        modelCoords.lat,
        modelCoords.lng
      );
      distanceStr = ` • ${Math.round(distance)} km`;
    }
  }

  return (
    <motion.div
      id={`model-card-${model.id}`}
      onClick={() => swipeState === 'idle' && onViewProfile(model.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.04}deg)`,
        transition: touchStart ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        opacity: swipeState === 'swiped-left' ? 0.9 : 1
      }}
      whileHover={{
        y: -6,
        scale: 1.015,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group cursor-pointer flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-white/10 overflow-hidden shadow-sm hover:border-purple-300 dark:hover:border-purple-500 transform relative"
    >
      {/* Swipe Badges Overlay */}
      {showSwipeBadge === 'like' && (
        <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
          <span className="text-emerald-500 text-xs font-black uppercase font-mono tracking-widest bg-white dark:bg-neutral-900 border-2 border-emerald-500 px-4 py-2 rounded-full rotate-[-12deg] shadow-lg animate-pulse">
            COUTURE LIKE
          </span>
        </div>
      )}
      {showSwipeBadge === 'reject' && (
        <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-[2px] z-20 flex items-center justify-center pointer-events-none">
          <span className="text-rose-500 text-xs font-black uppercase font-mono tracking-widest bg-white dark:bg-neutral-900 border-2 border-rose-500 px-4 py-2 rounded-full rotate-[12deg] shadow-lg animate-pulse">
            PASS / SKIP
          </span>
        </div>
      )}

      {/* REJECTED / SCROLL CANCEL COVER */}
      {swipeState === 'swiped-left' && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#EA3838] uppercase mb-1">Pass / Skipped</span>
          <p className="text-[11px] text-zinc-400 font-medium">Bypassed model card profile.</p>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSwipeState('idle');
              setSwipeOffset(0);
            }}
            className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase transition border border-white/5 cursor-pointer"
          >
            Undo Pass
          </button>
        </div>
      )}

      {/* Portfolio Cover Image with Airbnb aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950 group/slideshow">
        {isPlayingVideo && model.videoUrl ? (
          <div className="absolute inset-0 z-20 bg-black animate-fadeIn">
            <video
              src={model.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="h-full w-full object-cover"
            />
            {/* Video Controls */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-30">
              <button
                type="button"
                onClick={handleToggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition cursor-pointer border border-white/10"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleStopVideo}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition cursor-pointer border border-white/10"
                title="Close Video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Live Reel Indicator */}
            <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-purple-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              <span>Live Reel</span>
            </div>
          </div>
        ) : (
          <>
            {/* Horizontal sliding portfolio images */}
            <div 
              className="absolute inset-0 flex transition-transform duration-300 ease-out h-full w-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {model.portfolio.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400'}
                  alt={`${model.name} Portfolio ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover shrink-0 select-none"
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            {model.portfolio.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-600 hover:text-white text-neutral-800 dark:text-neutral-250 shadow-md border border-neutral-200 dark:border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-600 hover:text-white text-neutral-800 dark:text-neutral-250 shadow-md border border-neutral-200 dark:border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 opacity-100 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Slideshow Pagination Dots */}
            {model.portfolio.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                {model.portfolio.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      currentImageIndex === idx ? 'w-3 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Hover Horizontal Thumbnail Scroll Gallery */}
            {model.portfolio.length > 1 && (
              <div 
                className="absolute bottom-13 left-0 right-0 z-20 flex justify-center opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl max-w-[90%]"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {model.portfolio.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setCurrentImageIndex(idx)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`relative h-10 w-7.5 rounded overflow-hidden shrink-0 border transition-all duration-200 ${
                        currentImageIndex === idx 
                          ? 'border-[#D4AF37] scale-105 shadow-sm shadow-[#D4AF37]/30' 
                          : 'border-white/25 hover:border-white/60'
                      }`}
                    >
                      <img 
                        src={imgUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100'} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Heart Trigger */}
            <button
              type="button"
              id={`fav-btn-${model.id}`}
              onClick={(e) => onFavoriteToggle(model.id, e)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 shadow-sm transition hover:bg-neutral-900 dark:hover:bg-neutral-800 hover:text-white dark:hover:text-white hover:scale-110 active:scale-95"
            >
              <Heart
                className={`h-4.5 w-4.5 transition-colors ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              />
            </button>

            {/* Category Pill Tag */}
            <span className="absolute left-3 bottom-3 rounded-full bg-black text-white backdrop-blur-md px-3 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm">
              {model.category}
            </span>

            {/* Watch Reel floating button overlay */}
            {model.videoUrl && (
              <button
                type="button"
                onClick={handlePlayVideo}
                className="absolute right-3 bottom-3 z-10 flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-black uppercase tracking-wider shadow-md transition duration-200 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="h-3 w-3 fill-white mr-1" />
                <span>Watch Reel</span>
              </button>
            )}

            {/* Verification Banner */}
            {model.selfieVerified && (
              <span className="absolute left-3 top-3 flex items-center space-x-1 rounded-full bg-[#10B981] px-2.5 py-1 text-[9px] font-bold text-white shadow-md z-10">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified</span>
              </span>
            )}
          </>
        )}
      </div>

      {/* Model Information */}
      <div className="p-5 flex flex-col flex-1 text-left">
        
        {/* Name, City & Rating section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="font-sans text-md font-bold tracking-tight text-[#0F0F0F] dark:text-neutral-100 dark:group-hover:text-purple-400 group-hover:text-purple-600 transition-colors flex items-center gap-1">
                {model.name}
                {model.approved && (
                  <CheckCircle2 className="h-4.5 w-4.5 fill-[#D4AF37] text-white" title="ModelVerse India Approved Agent" />
                )}
              </h4>
              {isAuthenticated && getAvailabilityBadge(model.availabilityStatus)}
            </div>
            <div className="mt-1 flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              <span>
                {model.city}, {model.state}
                {distanceStr && (
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-[10px] ml-1 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-900">
                    {distanceStr}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Star review score with light themed pill */}
          {isAuthenticated && !isLocked ? (
            <div className="flex h-6 items-center space-x-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-400">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{model.rating}</span>
            </div>
          ) : (
            <div className="flex h-6 items-center space-x-1 rounded-full bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
              <Lock className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* Advanced Model Specific Stats */}
        {isAuthenticated && !isLocked ? (
          <div className="mt-4 grid grid-cols-3 gap-1 border-y border-neutral-100 dark:border-white/5 py-2.5 text-center text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-300">
            <div className="border-r border-neutral-100 dark:border-white/5">
              <span className="block text-[8px] text-neutral-400 dark:text-neutral-500 font-sans font-bold uppercase tracking-wider mb-0.5">Height</span>
              {model.height}
            </div>
            <div className="border-r border-neutral-100 dark:border-white/5">
              <span className="block text-[8px] text-neutral-400 dark:text-neutral-500 font-sans font-bold uppercase tracking-wider mb-0.5">Age</span>
              {model.age} yrs
            </div>
            <div>
              <span className="block text-[8px] text-neutral-400 dark:text-neutral-500 font-sans font-bold uppercase tracking-wider mb-0.5">Experience</span>
              {model.experience}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center border-y border-neutral-100 dark:border-white/5 py-3 text-center text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
            <Lock className="h-3.5 w-3.5 text-[#EA3838] mr-1.5 animate-pulse" />
            <span>Specs & Experience Locked</span>
          </div>
        )}

        {/* Price & Action Button */}
        <div className="mt-5 flex items-center justify-between pt-1">
          {isAuthenticated && !isLocked ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">Daily Rate</p>
              <p className="text-sm font-black text-neutral-900 dark:text-white font-sans mt-0.5">
                ₹{model.startingPrice.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] font-normal text-neutral-500 dark:text-neutral-400">/ day</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">Daily Rate</p>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1 flex items-center">
                <Lock className="h-3 w-3 mr-1 text-[#EA3838]" /> Rates Locked
              </p>
            </div>
          )}

          <button
            id={`book-now-card-${model.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                alert('Please log in or register to unlock and book a professional modeling session!');
                return;
              }
              if (isLocked) {
                onUnlockClick?.(model.id, e);
                return;
              }
              onBookNow(model.id, e);
            }}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 px-4 py-2 text-xs font-black text-white hover:shadow-md transition active:scale-95 duration-100 cursor-pointer"
          >
            {isAuthenticated && currentRole === 'model' && model.userId === currentUserId
              ? 'Edit Portfolio'
              : isLocked
                ? 'Unlock Specs'
                : 'Book Session'}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
