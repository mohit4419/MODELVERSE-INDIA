/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Star, MapPin, Calendar, Heart, ShieldCheck, Mail, Lock, CheckCircle2, ChevronLeft, AlertTriangle, Maximize2, ChevronRight, X, FileText, MessageSquare, Send, UploadCloud, Image as ImageIcon, Play, Video, ArrowLeft } from 'lucide-react';
import { Model, Review, UserRole, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import SocialFeed from './SocialFeed';

interface ProfileViewProps {
  model: Model;
  reviews: Review[];
  isLocked: boolean; // if true, measurements and agency are blurred
  isFavorited: boolean;
  onFavoriteToggle: (modelId: string) => void;
  onBookNow: (modelId: string) => void;
  onUnlockClick: (modelId: string) => void;
  onBack: () => void;
  onGoHome?: () => void;
  onStartChat: (modelId: string) => void;
  onReviewSubmit?: (review: Review) => Promise<void>;
  isAuthenticated?: boolean;
  currentRole?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
}

export default function ProfileView({
  model,
  reviews,
  isLocked,
  isFavorited,
  onFavoriteToggle,
  onBookNow,
  onUnlockClick,
  onBack,
  onGoHome,
  onStartChat,
  onReviewSubmit,
  isAuthenticated = false,
  currentRole,
  currentUserId,
  currentUserName
}: ProfileViewProps) {
  const [activeImage, setActiveImage] = useState(model.portfolio[0]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [customLightboxUrl, setCustomLightboxUrl] = useState<string | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>(model.videoUrl ? 'video' : 'image');

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollPosition = container.scrollLeft;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const newIndex = Math.round(scrollPosition / slideWidth);
      if (newIndex !== currentSlide && newIndex >= 0 && newIndex < model.portfolio.length) {
        setCurrentSlide(newIndex);
        setActiveImage(model.portfolio[newIndex]);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const slideWidth = container.clientWidth;
    container.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    setCurrentSlide(index);
    setActiveImage(model.portfolio[index]);
  };

  const [touchStartX, setTouchStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // pixels to trigger swipe
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // swipe left -> next slide
        const nextIdx = (currentSlide + 1) % model.portfolio.length;
        scrollToSlide(nextIdx);
      } else {
        // swipe right -> prev slide
        const prevIdx = (currentSlide - 1 + model.portfolio.length) % model.portfolio.length;
        scrollToSlide(prevIdx);
      }
    }
  };

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUserName || 'Premium Talent Partner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (currentUserName) {
      setReviewerName(currentUserName);
    }
  }, [currentUserName]);

  const averageRating = reviews.length > 0 
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)) 
    : model.rating || 5.0;
  const totalReviewsCount = reviews.length;
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New photo upload and presets states
  const [campaignPhotoUrl, setCampaignPhotoUrl] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const PRESET_PHOTOS = [
    { name: '👗 Fashion Couture', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop' },
    { name: '💄 Cosmetics Glam', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400&auto=format&fit=crop' },
    { name: '👟 Streetwear', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop' },
    { name: '💎 Fine Jewelry', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop' },
  ];

  const handlePhotoUpload = (file: File) => {
    setIsCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCampaignPhotoUrl(event.target.result as string);
      }
      setIsCompressingPhoto(false);
    };
    reader.onerror = () => {
      setIsCompressingPhoto(false);
      setSubmitError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handleDragLeave = () => {
    setIsDraggingPhoto(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoUpload(file);
    } else {
      setSubmitError('Please drop a valid image file.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setSubmitError('Please write an endorsement message.');
      return;
    }
    if (reviewComment.trim().length < 10) {
      setSubmitError('Endorsement must be at least 10 characters.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const newReview: Review = {
        id: `rev_${Date.now()}`,
        clientId: currentUserId || 'client_active_id',
        clientName: currentUserName || reviewerName.trim() || 'Premium Talent Partner',
        clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        modelId: model.id,
        rating: reviewRating,
        review: reviewComment.trim(),
        campaignPhotoUrl: campaignPhotoUrl || undefined,
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      };

      if (onReviewSubmit) {
        await onReviewSubmit(newReview);
      }
      
      setSubmitSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      setCampaignPhotoUrl('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReviewForm(false);
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit endorsement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight' && !customLightboxUrl) {
        setLightboxIndex((prev) => (prev + 1) % model.portfolio.length);
      } else if (e.key === 'ArrowLeft' && !customLightboxUrl) {
        setLightboxIndex((prev) => (prev - 1 + model.portfolio.length) % model.portfolio.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, model.portfolio.length, customLightboxUrl]);

  const openLightbox = (index: number) => {
    setCustomLightboxUrl(null);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const openCustomLightbox = (url: string) => {
    setCustomLightboxUrl(url);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setCustomLightboxUrl(null);
  };

  // Availability calendar Simulator
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const busyDays = [4, 10, 11, 12, 19, 20, 26];

  return (
    <div id={`profile-view-${model.id}`} className="mx-auto max-w-6xl py-10 px-4 sm:px-6 lg:px-8 anim-fadeIn text-left">
      
      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          id="profile-back-btn"
          className="flex items-center space-x-2 text-xs font-black text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition cursor-pointer uppercase tracking-wider font-mono"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to Directory</span>
        </button>

        {/* Home Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            id="profile-home-btn"
            className="flex items-center space-x-2 text-xs font-black text-[#EA3838] hover:text-red-600 transition cursor-pointer uppercase tracking-wider font-mono"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* Grid structure: Gallery (Left) vs Specs/Booking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Gallery Panel */}
        <div className="lg:col-span-7 space-y-4">
          {model.videoUrl && (
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full w-fit">
              <button
                type="button"
                onClick={() => setActiveMediaType('image')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeMediaType === 'image'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 text-neutral-500" />
                <span>Photos ({model.portfolio.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaType('video')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  activeMediaType === 'video'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Video Reel</span>
              </button>
            </div>
          )}

          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 group/zoom shadow-sm">
            {activeMediaType === 'video' && model.videoUrl ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center animate-fadeIn">
                <video
                  src={model.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white shadow backdrop-blur-md">
                  <Video className="h-3.5 w-3.5" />
                  <span>Interactive Video Reel</span>
                </div>
              </div>
            ) : (
              <>
                {/* Horizontally scrollable track with native momentum/snapping and swipe touch handlers */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="absolute inset-0 flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none h-full w-full"
                >
                  {model.portfolio.map((imgUrl, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-full h-full relative">
                      <img
                        src={imgUrl}
                        alt={`${model.name} Portfolio ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
                        onClick={() => openLightbox(idx)}
                      />
                      {/* Premium gradient and caption/category display */}
                      {(model.portfolioCaptions?.[idx] || model.portfolioCategories?.[idx]) && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-24 flex flex-col justify-end text-left select-none pointer-events-none">
                          {model.portfolioCategories?.[idx] && (
                            <span className="inline-block self-start text-[9px] uppercase tracking-widest font-black font-mono text-purple-400 bg-purple-950/75 px-2.5 py-1 rounded-full border border-purple-500/35 mb-2 backdrop-blur-xs">
                              {model.portfolioCategories[idx]}
                            </span>
                          )}
                          {model.portfolioCaptions?.[idx] && (
                            <p className="text-white text-xs font-semibold tracking-tight leading-relaxed max-w-sm drop-shadow-md">
                              {model.portfolioCaptions[idx]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Left navigation arrow button */}
                {model.portfolio.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevIdx = (currentSlide - 1 + model.portfolio.length) % model.portfolio.length;
                      scrollToSlide(prevIdx);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow text-neutral-850 hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Right navigation arrow button */}
                {model.portfolio.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIdx = (currentSlide + 1) % model.portfolio.length;
                      scrollToSlide(nextIdx);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow text-neutral-850 hover:bg-neutral-900 hover:text-white transition cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

                {/* Slide indicators / pagination dots */}
                {model.portfolio.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {model.portfolio.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => scrollToSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                          currentSlide === idx ? 'w-4 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* View Fullscreen overlay/badge */}
                <button
                  onClick={() => {
                    openLightbox(currentSlide);
                  }}
                  className="absolute right-4 bottom-4 z-10 flex items-center space-x-1.5 rounded-full bg-neutral-900 text-white hover:bg-purple-600 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md opacity-100 transition-all duration-300 cursor-pointer border border-neutral-800 hover:border-purple-600 hover:scale-[1.03]"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span>Zoom Portfolio</span>
                </button>
              </>
            )}
            
            {/* Heart on profile */}
            <button
              onClick={() => onFavoriteToggle(model.id)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow text-neutral-800 border border-neutral-200 transition hover:bg-neutral-900 hover:text-white"
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} />
            </button>

            {model.selfieVerified && (
              <span className="absolute left-4 top-4 z-10 flex items-center space-x-1.5 rounded-full bg-[#10B981] px-3.5 py-1.5 text-[10px] font-bold text-white shadow backdrop-blur-md">
                <ShieldCheck className="h-4 w-4" />
                <span>Selfie & ID Verified</span>
              </span>
            )}
          </div>

          {/* Mini Portfolio grid */}
          <div className="grid grid-cols-5 gap-3">
            {model.videoUrl && (
              <button
                type="button"
                onClick={() => setActiveMediaType('video')}
                className={`aspect-square rounded-2xl overflow-hidden bg-black border-2 transition relative flex flex-col items-center justify-center ${
                  activeMediaType === 'video' ? 'border-purple-600 scale-95 shadow-md' : 'border-transparent hover:scale-[1.02]'
                }`}
              >
                <img
                  src={model.portfolio[0]}
                  alt="Video Thumbnail"
                  className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <Play className="h-6 w-6 text-white absolute z-10 fill-white/20" />
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-white uppercase tracking-wider bg-purple-600 px-1.5 py-0.5 rounded font-mono z-10">REEL</span>
              </button>
            )}
            {model.portfolio.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveMediaType('image');
                  scrollToSlide(idx);
                }}
                className={`aspect-square rounded-2xl overflow-hidden bg-[#FCFBF9] border-2 transition relative group ${
                  activeMediaType === 'image' && currentSlide === idx ? 'border-purple-600 scale-95 shadow-md' : 'border-transparent hover:scale-[1.02]'
                }`}
              >
                <img
                  src={img}
                  alt={`Portfolio ${idx}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaType('image');
                    scrollToSlide(idx);
                    openLightbox(idx);
                  }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-zoom-in"
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </div>
              </button>
            ))}
          </div>

          {/* Biography and Description */}
          <div className="pt-8 border-t border-black/5 text-left">
            <h3 className="font-sans text-xl font-extrabold text-[#0F0F0F]">About {model.name}</h3>
            {isLocked ? (
              <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-150 flex items-center space-x-3 text-neutral-500 font-medium">
                <Lock className="h-5 w-5 text-[#EA3838]" />
                <span className="text-xs">Biography is locked. Log in or unlock profile to view biographical insights.</span>
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-600 leading-relaxed font-normal whitespace-pre-line font-sans">
                {model.biography}
              </p>
            )}
          </div>

          {/* Professional Social Proof & Trust Metrics */}
          <div className="pt-8 border-t border-black/5 space-y-6 text-left">
            <h3 className="font-sans text-xl font-extrabold text-[#0F0F0F] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Verified Trust & Social Proof</span>
            </h3>

            {/* Trust Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-left">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Job Completion</span>
                <strong className="block text-lg font-black text-neutral-800 mt-1">100%</strong>
                <span className="text-[10px] text-neutral-500 font-medium">All shoots delivered</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-left">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Repeat Hires</span>
                <strong className="block text-lg font-black text-neutral-800 mt-1">42%</strong>
                <span className="text-[10px] text-neutral-500 font-medium">Clients booked again</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-left">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Avg Response</span>
                <strong className="block text-lg font-black text-neutral-800 mt-1">&lt; 2h</strong>
                <span className="text-[10px] text-neutral-500 font-medium">Fast communication</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-left">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono font-black text-[#D4AF37]">Casting Score</span>
                <strong className="block text-lg font-black text-[#D4AF37] mt-1">Elite</strong>
                <span className="text-[10px] text-neutral-500 font-medium">Approved by Directors</span>
              </div>
            </div>

            {/* Brands Worked with Row */}
            <div className="p-5 rounded-3xl border border-neutral-150 bg-white space-y-3">
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">Verified Brand Collaborations</span>
              <div className="flex flex-wrap gap-2">
                {['Sabyasachi', 'Nykaa', 'Myntra', 'Zara India', 'Tanishq', 'Vogue India'].map((brand) => (
                  <span key={brand} className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{brand}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Instagram-like Social Feed Integration */}
          <div className="pt-8 border-t border-black/5 text-left">
            <SocialFeed
              modelId={model.id}
              currentUser={isAuthenticated && currentUserId ? {
                id: currentUserId,
                role: currentRole || 'client',
                name: currentUserName || 'Logged User',
                email: '',
                phone: '',
                status: 'active' as const,
                createdAt: ''
              } : null}
              currentModel={currentRole === 'model' && currentUserId === model.userId ? model : null}
            />
          </div>

          {model.pdfName && (
            <div className="mt-6 p-4 rounded-2xl border border-purple-100 bg-purple-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 anim-fadeIn text-left">
              <div className="flex items-center space-x-3 text-purple-950">
                <div className="p-2 bg-purple-200/50 rounded-xl text-purple-700 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-left select-none">
                  <span className="block text-[9px] uppercase font-bold text-purple-600 tracking-wider font-mono">Model Comp Card (PDF Portfolio)</span>
                  <p className="text-xs font-black text-purple-900 truncate max-w-[200px] sm:max-w-xs">{model.pdfName}</p>
                </div>
              </div>
              <a
                href={model.pdfUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition duration-200 shadow-sm hover:shadow active:scale-98 cursor-pointer flex items-center justify-center space-x-1 font-mono uppercase tracking-wide"
              >
                <span>View Portfolio PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Specs & Booking Sidebar Grid */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main header block */}
          <div className="border-b border-black/5 pb-6">
            <div className="flex items-center space-x-2 text-[10px] font-bold font-mono text-purple-600 uppercase tracking-widest">
              <span>{model.category}</span>
              <span>•</span>
              <span>{model.experience} Experience</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <h2 className="font-sans text-3xl font-black tracking-tight text-[#0F0F0F] flex items-center gap-1.5">
                {model.name}
                {model.approved && <CheckCircle2 className="h-6 w-6 fill-[#D4AF37] text-white" title="Casted Approved" />}
              </h2>
              {(() => {
                const s = model.availabilityStatus || 'Available';
                switch (s) {
                  case 'Available':
                    return (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Available</span>
                      </span>
                    );
                  case 'Booked':
                    return (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black font-mono">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>Booked</span>
                      </span>
                    );
                  case 'On-Leave':
                    return (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black font-mono">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span>On-Leave</span>
                      </span>
                    );
                }
              })()}
            </div>

            <div className="mt-3 flex items-center space-x-4 text-xs text-neutral-500">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{model.city}, {model.state}</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{averageRating}</span>
                <span className="text-amber-600/70 font-normal">({totalReviewsCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Specifications list */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-neutral-150 p-5 bg-white">
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono">Gender</span>
              <span className="text-xs font-bold text-neutral-800 capitalize mt-0.5 block">{model.gender}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono">Height</span>
              <span className="text-xs font-bold text-neutral-800 mt-0.5 block">{model.height}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono">Age</span>
              <span className="text-xs font-bold text-neutral-800 mt-0.5 block">{model.age} years old</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-mono">Languages</span>
              <span className="text-xs font-bold text-neutral-800 truncate mt-0.5 block" title={model.languages.join(', ')}>
                {model.languages.slice(0, 2).join(', ')} {model.languages.length > 2 && '...'}
              </span>
            </div>
          </div>

          {/* Premium Locked Details section */}
          <div className="rounded-3xl border border-neutral-150 p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F0F0F] font-mono">Premium Locked specs</h4>
              <span className="flex items-center text-[10px] font-bold text-[#D4AF37] bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <Lock className="h-3 w-3 mr-1" />
                <span>₹199 Match</span>
              </span>
            </div>

            {isLocked ? (
              <div 
                id="locked_details_trigger"
                onClick={() => onUnlockClick(model.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed border-red-200 bg-[#FFF5F5] p-5 transition hover:bg-neutral-50"
              >
                {/* Blurred backdrop elements */}
                <div className="space-y-3 blur-md filter select-none transition-filter group-hover:blur-[8px]">
                  <div>
                    <span className="block text-[8px] text-neutral-400 uppercase font-black tracking-wider">Measurements</span>
                    <p className="text-xs font-bold text-neutral-800">Bust: 34" • Waist: 25" • Hips: 36"</p>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-400 uppercase font-black tracking-wider">Agency Representation</span>
                    <p className="text-xs font-bold text-neutral-800">Inega Model Management (Sanjay Dutt)</p>
                  </div>
                </div>

                {/* Overlay Locked Invitation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/5 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md">
                    <Lock className="h-4.5 w-4.5 text-white" />
                  </div>
                  <h5 className="text-xs font-black text-neutral-900 mt-2">Reveal Spec Card</h5>
                  <p className="text-[9px] text-neutral-500 mt-0.5 max-w-[220px] font-medium leading-relaxed">
                    Pay ₹199 to unlock measurements, booking agents, verified comps, and direct approvals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs border border-purple-100 rounded-2xl p-3.5 bg-purple-50/50">
                  <div className="border-r border-neutral-150">
                    <span className="block text-[8px] text-neutral-400 uppercase font-bold mb-0.5 font-mono">Bust Size</span>
                    <strong className="text-neutral-800 font-mono text-xs">{model.measurements?.bust || '34"'}</strong>
                  </div>
                  <div className="border-r border-neutral-150">
                    <span className="block text-[8px] text-neutral-400 uppercase font-bold mb-0.5 font-mono">Waist Size</span>
                    <strong className="text-neutral-800 font-mono text-xs">{model.measurements?.waist || '26"'}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-400 uppercase font-bold mb-0.5 font-mono">Hips Size</span>
                    <strong className="text-neutral-800 font-mono text-xs">{model.measurements?.hips || '36"'}</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-150 p-4 bg-[#FCFBF9] flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5 font-mono">Casting Agency</span>
                    <strong className="text-xs text-neutral-800">{model.agencyInfo?.name || 'Independent'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5 font-mono">Manager Reference</span>
                    <strong className="text-xs text-neutral-800">{model.agencyInfo?.contactName || 'Self'}</strong>
                  </div>
                </div>

                {/* Secure policy highlight */}
                <span className="block text-[9px] text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] px-3 py-2 rounded-xl font-medium leading-relaxed">
                  🔒 Direct contacts are shielded. Please book or initiate chats right here inside ModelVerse India.
                </span>
              </div>
            )}
          </div>

          {/* Availability Calendar visual preview */}
          <div className="rounded-3xl border border-neutral-150 p-6 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono text-[#0F0F0F]">
                <Calendar className="h-4.5 w-4.5 text-pink-600" />
                <span>Shoot Availability Calendar</span>
              </h4>
              <span className="text-[10px] font-bold text-neutral-400">July 2026</span>
            </div>

            <p className="text-[10px] text-neutral-400 leading-normal">
              Click on an open day date to initiate a booking request matching that start date.
            </p>

            {/* Simulated Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 border-t border-neutral-100 pt-3 text-center text-[9px] font-black uppercase text-neutral-400 font-mono">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1 font-sans text-[10px] font-bold">
              <div className="h-7" />
              <div className="h-7" />
              {daysInMonth.map((day) => {
                const isBusy = busyDays.includes(day);
                return (
                  <button
                    key={day}
                    disabled={isBusy}
                    onClick={() => {
                      setSelectedCalendarDate(`2026-07-${day < 10 ? '0' + day : day}`);
                      onBookNow(model.id);
                    }}
                    className={`h-7 rounded-lg flex items-center justify-center transition border ${
                      isBusy 
                        ? 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF] cursor-not-allowed' 
                        : 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-purple-600 hover:text-white cursor-pointer shadow-sm'
                    }`}
                    title={isBusy ? 'Shoot Scheduled (Locked)' : 'Available for Booking'}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] pt-3 border-t border-neutral-100 text-neutral-500">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available Open Day
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-[#C5221F]" /> Scheduled Shoot
              </span>
            </div>
          </div>

          {/* Pricing & CTA Panel */}
          <div className="rounded-3xl border border-[#FFE8DA] bg-[#FFF5EE] p-6 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between text-left">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-black font-mono">Day Cast Rate</span>
                <p className="text-2xl font-black text-neutral-900 mt-1">
                  ₹{model.startingPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-neutral-505">/ day</span>
                </p>
              </div>
              <span className="text-[10px] font-bold text-orange-850 bg-orange-100/50 rounded-full px-3.5 py-1 border border-orange-200">
                Escrow Protected
              </span>
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                id="profile-chat-btn"
                onClick={() => {
                  if (isLocked) {
                    onUnlockClick(model.id);
                  } else {
                    onStartChat(model.userId);
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-1 rounded-full border py-3 text-xs font-bold transition active:scale-98 cursor-pointer shadow-sm ${
                  isLocked
                    ? 'border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700'
                    : 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="h-3 w-3.5 text-red-500 mr-1 animate-pulse shrink-0" />
                    <span>Chat Locked (Unlock Specs)</span>
                  </>
                ) : (
                  <span>Chat with Model</span>
                )}
              </button>
              <button
                id="profile-book-btn"
                onClick={() => onBookNow(model.id)}
                className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 text-xs font-black shadow-md transition hover:brightness-110 active:scale-98 cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS GRID PANEL */}
      <div className="mt-16 border-t border-black/5 pt-12 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h3 className="font-sans text-xl font-extrabold text-[#0F0F0F]">Client Reviews & Endorsements</h3>
            <p className="text-xs text-neutral-450 mt-1">Authentic campaign feedback left by Indian businesses.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex h-10 items-center space-x-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 px-4 text-xs font-bold text-neutral-800 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-neutral-600" />
              <span>{showReviewForm ? 'Close Form' : 'Write Endorsement'}</span>
            </button>
            <div className="flex h-10 items-center space-x-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 text-xs font-black text-amber-900">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500 animate-spin-slow" />
              <span>{averageRating} Rating ({totalReviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10 items-stretch">
          <div className="md:col-span-4 p-6 rounded-3xl border border-neutral-150 bg-[#FDFCFA] text-center flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">Average Rating</span>
              <strong className="block text-5xl font-black text-neutral-900">{averageRating}</strong>
              <div className="flex justify-center space-x-0.5 text-amber-400 pt-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isLit = i < Math.round(averageRating);
                  return <Star key={i} className={`h-5 w-5 ${isLit ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />;
                })}
              </div>
              <span className="block text-[10px] font-bold text-neutral-500 pt-1">Based on {totalReviewsCount} verified review{totalReviewsCount === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="md:col-span-8 p-6 rounded-3xl border border-neutral-150 bg-white space-y-3.5 text-left flex flex-col justify-center">
            <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">Score Distribution</span>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center space-x-3 text-xs">
                    <span className="w-10 font-bold text-neutral-600 text-right">{stars} Star</span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 font-semibold text-neutral-400 text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Review Submission Form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8 rounded-3xl border border-neutral-150 bg-[#FDFCFA] p-6 sm:p-8 shadow-sm max-w-2xl text-left"
            >
              <h4 className="font-sans text-base font-black text-neutral-900 mb-1">Submit Verified Campaign Review</h4>
              <p className="text-xs text-neutral-450 mb-6">Leave an official, transparent testimonial for {model.name} based on your last project schedule.</p>

              {!isAuthenticated ? (
                <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <Lock className="h-8 w-8 text-amber-600 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-amber-900">Client Authentication Required</p>
                  <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                    You must be logged into a Client account to leave a verified rating and endorsement for this model. This prevents rating spam and ensures reviews are from authentic shoots.
                  </p>
                </div>
              ) : currentRole !== 'client' ? (
                <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                  <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
                  <p className="text-sm font-bold text-rose-900">Verified Client Role Required</p>
                  <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                    Reviews can only be posted by verified <strong>Clients</strong> who have booked this model. Your current account role is <strong className="capitalize">{currentRole}</strong>.
                  </p>
                </div>
              ) : submitSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold">Endorsement Posted Successfully!</p>
                  <p className="text-xs text-emerald-600">Your feedback has been integrated. Refreshing scores...</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-bold">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider mb-1.5 font-mono">Agency / Client Name</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Sabyasachi, Nykaa, Myntra"
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-800 font-bold focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider mb-1.5 font-mono">Rating Score</label>
                      <div className="flex items-center h-10 gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isLit = star <= (hoverRating !== null ? hoverRating : reviewRating);
                          return (
                            <motion.button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              whileHover={{ scale: 1.25, rotate: 12 }}
                              whileTap={{ scale: 0.85, rotate: -12 }}
                              animate={reviewRating === star ? { scale: [1, 1.35, 1], transition: { duration: 0.3 } } : {}}
                              className="p-1 focus:outline-none cursor-pointer transition-colors duration-200"
                            >
                              <Star
                                className={`h-6.5 w-6.5 transition-colors duration-250 ${
                                  isLit
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                    : 'text-neutral-300'
                                }`}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      {/* Interactive feedback description */}
                      <div className="h-4 overflow-hidden mt-1">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={hoverRating || reviewRating}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="text-[9px] font-black tracking-wider uppercase text-neutral-500 font-mono"
                          >
                            {(() => {
                              const score = hoverRating || reviewRating;
                              if (score === 1) return "😞 Disappointing / Poor contract coordination";
                              if (score === 2) return "😐 Below Average / Moderate challenges occurred";
                              if (score === 3) return "🙂 Good / Professional work overall";
                              if (score === 4) return "✨ Great / Highly satisfactory cooperations";
                              return "👑 Spectacular / Elite shoot performance!";
                            })()}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial message */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider mb-1.5 font-mono">Testimonial & Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={`Describe ${model.name}'s professionalism, ramp presence, schedule cooperative behavior, or look versatility during the project...`}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-800 leading-relaxed font-normal focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Photo Upload Trigger and Campaign Mockups presets */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase text-neutral-500 tracking-wider font-mono">Optional Photoshoot Campaign Mockup (Photo Upload)</label>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center transition duration-200 flex flex-col items-center justify-center min-h-[120px] ${
                        isDraggingPhoto 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' 
                          : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {campaignPhotoUrl ? (
                        <div className="relative w-full max-w-[240px] rounded-xl overflow-hidden shadow-md group">
                          <img 
                            src={campaignPhotoUrl} 
                            alt="Campaign Mockup Preview" 
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <button
                            type="button"
                            onClick={() => setCampaignPhotoUrl('')}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full shadow transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white py-1 text-[9px] font-bold">
                            Campaign Shot Ready!
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadCloud className="h-8 w-8 text-neutral-400 mx-auto animate-pulse" />
                          <div className="text-[11px]">
                            <span className="font-bold text-neutral-700">Drag & drop campaign image here</span> or{' '}
                            <label className="text-[#D4AF37] font-bold hover:underline cursor-pointer">
                              browse files
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePhotoUpload(file);
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-[9px] text-neutral-400">Supports PNG, JPG, WebP up to 5MB</p>
                        </div>
                      )}
                    </div>

                    {/* Presets and custom URL paste option */}
                    <div className="bg-neutral-50 border border-neutral-150 p-3 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Or Use Brand Presets:</span>
                        <input
                          type="text"
                          placeholder="Paste custom image URL..."
                          value={campaignPhotoUrl.startsWith('data:') ? '' : campaignPhotoUrl}
                          onChange={(e) => setCampaignPhotoUrl(e.target.value)}
                          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] text-neutral-800 w-full sm:w-48 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_PHOTOS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setCampaignPhotoUrl(preset.url)}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                              campaignPhotoUrl === preset.url
                                ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || isCompressingPhoto}
                      className="inline-flex items-center space-x-2 bg-neutral-900 text-white rounded-full px-6 py-2.5 text-xs font-black hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Posting...' : 'Post Endorsement'}</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 rounded-3xl bg-white shadow-sm">
            <ShieldAlert className="h-8 w-8 text-neutral-400 mx-auto" />
            <h4 className="text-xs font-bold text-neutral-600 mt-2">Zero active reviews</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">This model is ready for booking. Submit an invitation now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-3xl border border-neutral-150 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'}
                      alt={rev.clientName}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover border border-neutral-200"
                    />
                    <div>
                      <strong className="block text-xs font-bold text-neutral-900">{rev.clientName}</strong>
                      <span className="text-[9px] font-semibold text-neutral-400 font-mono">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex space-x-0.5 text-[#D4AF37]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-600 font-medium leading-relaxed italic">
                    "{rev.review}"
                  </p>
                </div>

                {/* Campaign photo render */}
                {rev.campaignPhotoUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-neutral-100 max-h-48 bg-neutral-50 flex items-center justify-center">
                    <img
                      src={rev.campaignPhotoUrl}
                      alt="Campaign Photoshoot Proof"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover max-h-48 hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                      onClick={() => openCustomLightbox(rev.campaignPhotoUrl!)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Main Interactive Carousel container */}
            <div 
              className="relative flex items-center justify-center w-full max-w-4xl h-[70vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Button - Only show if not a custom campaign image */}
              {!customLightboxUrl && model.portfolio.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev - 1 + model.portfolio.length) % model.portfolio.length);
                  }}
                  className="absolute left-2 md:-left-16 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-250 cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* High resolution zoomed image with smooth motion layout transition */}
              <motion.img
                key={customLightboxUrl || lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                src={customLightboxUrl || model.portfolio[lightboxIndex]}
                alt="Expanded High Resolution View"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 select-none animate-fadeIn"
              />

              {/* Next Button - Only show if not a custom campaign image */}
              {!customLightboxUrl && model.portfolio.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev + 1) % model.portfolio.length);
                  }}
                  className="absolute right-2 md:-right-16 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-250 cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom thumbnail strip and indicators */}
            {!customLightboxUrl && (
              <div 
                className="mt-6 flex flex-col items-center space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Index indicator */}
                <p className="text-zinc-400 text-xs font-mono font-bold tracking-widest uppercase">
                  Image {lightboxIndex + 1} / {model.portfolio.length}
                </p>

                {/* Thumbnails */}
                <div className="flex space-x-2.5 overflow-x-auto max-w-full px-4 py-1 scrollbar-none">
                  {model.portfolio.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className={`h-12 w-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                        lightboxIndex === i ? 'border-[#D4AF37] scale-110 shadow-lg' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`strip-thumb-${i}`} 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
