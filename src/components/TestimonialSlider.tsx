import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface Testimonial {
  id: string;
  agencyName: string;
  logoColor: string;
  reviewerName: string;
  reviewerRole: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  location: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    agencyName: 'Sabyasachi Couture',
    logoColor: 'text-[#D4AF37]',
    reviewerName: 'Vikram Rathore',
    reviewerRole: 'Lead Casting Director',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    quote: "ModelVerse India has completely transformed how we scout face talent for our heritage campaigns. The direct, verified measurements and seamless communication saved us weeks of standard agency negotiations. We casted four top-tier models in just two days.",
    rating: 5,
    location: 'Kolkata / Mumbai'
  },
  {
    id: 't2',
    agencyName: 'Nykaa Beauty',
    logoColor: 'text-pink-600',
    reviewerName: 'Ananya Mehta',
    reviewerRole: 'Head of Brand Campaigns',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    quote: "Finding versatile UGC creators and commercial talent used to be an expensive gamble. With ModelVerse's verified portfolios and 100% secure escrow payment structures, we launched three major product campaigns smoothly and exactly on schedule.",
    rating: 5,
    location: 'Mumbai'
  },
  {
    id: 't3',
    agencyName: 'Vogue India',
    logoColor: 'text-neutral-900',
    reviewerName: 'Devendra Singh',
    reviewerRole: 'Senior Editorial Producer',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    quote: "Direct access to top-tier elite runway models in Mumbai and Delhi with verified high-res comp cards has made casting for our seasonal digital cover shoots incredibly straightforward. A masterpiece of a modern casting workspace.",
    rating: 5,
    location: 'Delhi'
  },
  {
    id: 't4',
    agencyName: 'Myntra Fashion',
    logoColor: 'text-red-500',
    reviewerName: 'Rohan Kapoor',
    reviewerRole: 'Studio Productions Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    quote: "We book dozens of e-commerce models every single week. The direct access to bookable talent without standard middleman markup has slashed our model coordinator overheads while keeping talent standards pristine.",
    rating: 5,
    location: 'Bengaluru'
  }
];

export default function TestimonialSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  // Optional auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const active = TESTIMONIALS[activeIndex];

  return (
    <section id="agency-testimonials" className="py-24 bg-neutral-950 px-4 sm:px-6 lg:px-8 overflow-hidden text-left relative">
      {/* Absolute design decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono">Agency Endorsements</span>
          <h3 className="font-sans text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Endorsed by Top Fashion Agencies
          </h3>
          <p className="text-xs text-neutral-400 mt-2 max-w-xl mx-auto leading-relaxed">
            See how major fashion publications, commercial beauty brands, and premium couture designers cast high-fashion talents securely with zero platform markups.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl relative">
          <div className="absolute top-6 right-6 sm:top-12 sm:right-12 text-neutral-800 opacity-40">
            <Quote className="h-16 w-16 sm:h-24 sm:w-24 stroke-[1]" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Reviewer Headshot */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#D4AF37] to-purple-600 blur opacity-40" />
              <img
                src={active.avatarUrl}
                alt={active.reviewerName}
                referrerPolicy="no-referrer"
                className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-white/10 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-neutral-950 border border-white/10 rounded-full px-2 py-0.5 flex items-center space-x-1 shadow-md">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" />
                <span className="text-[8px] font-bold text-emerald-400 font-mono">VERIFIED</span>
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="flex-1 text-center md:text-left">
              {/* Stars & Agency */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-4">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.floor(active.rating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="hidden md:block h-3 w-px bg-white/20" />
                <span className={`text-sm font-black tracking-wide uppercase font-sans ${active.logoColor}`}>
                  {active.agencyName}
                </span>
              </div>

              {/* Quote text */}
              <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed italic mb-6">
                "{active.quote}"
              </p>

              {/* Author details */}
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">{active.reviewerName}</h4>
                <p className="text-xs text-[#D4AF37] font-mono mt-0.5">
                  {active.reviewerRole} &bull; <span className="text-zinc-500">{active.location}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-350 cursor-pointer ${
                    activeIndex === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev/Next arrows - clean and non-animated as instructed */}
            <div className="flex items-center gap-3">
              <button
                id="testimonial-prev-btn"
                onClick={handlePrev}
                className="h-10 w-10 rounded-full border border-white/10 bg-neutral-900 text-zinc-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                id="testimonial-next-btn"
                onClick={handleNext}
                className="h-10 w-10 rounded-full border border-white/10 bg-neutral-900 text-zinc-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
