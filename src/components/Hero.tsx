/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Sparkles, SlidersHorizontal, ArrowRight, Video, Play, Mic, Check, Star, ChevronDown } from 'lucide-react';
import { motion, animate } from 'motion/react';
import ParticleText from './ParticleText';
import TypingHeadline from './TypingHeadline';

interface HeroProps {
  onSearch: (filters: { location: string; category: string; gender: string; maxBudget: number }) => void;
  onBrowseClick: () => void;
  onBecomeModelClick: () => void;
  onHireClick: () => void;
}

export default function Hero({ onSearch, onBrowseClick, onBecomeModelClick, onHireClick }: HeroProps) {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [budget, setBudget] = useState(50000);
  const [showFilters, setShowFilters] = useState(true);

  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    
    animate(startPosition, targetPosition, {
      type: "keyframes",
      duration: 1.2,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (latestValue) => {
        window.scrollTo(0, latestValue);
      }
    });
  };

  const locations = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  const categories = [
    'All',
    'Fashion Models',
    'Commercial Models',
    'Fitness Models',
    'Influencers',
    'UGC Creators',
    'Actors',
    'Event Hosts'
  ];
  const genders = [
    { label: 'All Genders', value: '' },
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Non-Binary', value: 'non-binary' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: location === 'All' ? '' : location,
      category: category === 'All' ? '' : category,
      gender,
      maxBudget: budget,
    });
  };

  return (
    <div id="homepage-hero" className="relative overflow-hidden bg-[#FAF5F2] dark:bg-[#0c0a09] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-black/5 dark:border-white/5">
      {/* Light-mode ambient warm blurred lights / Dark mode glows */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-orange-500/10 dark:bg-purple-950/20 blur-[130px]" />
      <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/5 dark:bg-pink-950/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: HIGH IMPACT COPYWRITING */}
          <div className="lg:col-span-6 space-y-8 text-left animate-fadeIn">
            {/* Real-time Ticker Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <ParticleText />
            </motion.div>

            {/* Headline with gorgeous gradient, typing simulation, and zero reflow shift */}
            <TypingHeadline />

            {/* Subheadline description */}
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-300 leading-relaxed max-w-xl font-normal">
              ModelVerse India records your campaign requirements, matches verified model portfolios, locks secure contract escrow gates, and provides real-time contract settlement — all without taking traditional agency commissions.
            </p>

            {/* Image-Style Action Capsule Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Start Casting / Free Access */}
              <button
                id="hero-browse-btn"
                onClick={onBrowseClick}
                className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-7 py-3 text-xs sm:text-sm font-black shadow-lg shadow-purple-500/20 transition duration-200 hover:brightness-110 active:scale-98 cursor-pointer"
              >
                <span>Browse Elite Talents</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </button>

              {/* Hire Talent */}
              <button
                id="hero-hire-btn"
                onClick={onHireClick}
                className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-400 text-white px-7 py-3 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 transition duration-200 hover:brightness-110 active:scale-98 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-emerald-100" />
                <span>Hire Talent</span>
              </button>

              {/* Apply / Contact */}
              <button
                id="hero-become-btn"
                onClick={onBecomeModelClick}
                className="flex items-center space-x-2 rounded-full border border-neutral-300 bg-white/80 backdrop-blur px-7 py-3 text-xs sm:text-sm font-bold text-neutral-800 transition duration-200 hover:bg-neutral-50 cursor-pointer"
              >
                <Video className="h-4 w-4 text-pink-600" />
                <span>Apply as Model</span>
              </button>
            </div>

            {/* Core checklist criteria from reference image */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-neutral-450 uppercase font-mono tracking-widest">
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" /> Selfid Verified
              </span>
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-600" /> No markup fees
              </span>
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Cancel anytime
              </span>
            </div>

            {/* Smooth Scroll Navigation Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-neutral-300/40 text-xs">
              <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Explore Internally:</span>
              <button
                type="button"
                onClick={() => handleScrollTo('homepage-categories')}
                className="rounded-full bg-neutral-200/50 hover:bg-neutral-100 hover:text-black px-3.5 py-1.5 text-neutral-600 font-bold tracking-tight transition shadow-sm cursor-pointer"
              >
                Categories Grid
              </button>
              <button
                type="button"
                onClick={() => handleScrollTo('homepage-trending')}
                className="rounded-full bg-neutral-200/50 hover:bg-neutral-100 hover:text-black px-3.5 py-1.5 text-neutral-600 font-bold tracking-tight transition shadow-sm cursor-pointer"
              >
                Trending Talent
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: REVOLUTIONARY INTERACTIVE WEB COLLAGE COPIED FROM IMAGE */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] select-none">
            {/* Connecty Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 450">
              {/* Line 1 link (Top Left Model to Center Card) */}
              <motion.path
                d="M 100 130 C 180 130, 160 220, 240 220"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="2"
                strokeDasharray="4,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
              />
              {/* Line 2 link (Top Right Model to Center Card) */}
              <motion.path
                d="M 400 150 C 330 150, 310 220, 240 220"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="2"
                strokeDasharray="4,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}
              />
              {/* Line 3 link (Bottom Left Model to Center Card) */}
              <motion.path
                d="M 120 330 C 180 330, 190 260, 240 260"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2 }}
              />
              {/* Line 4 link (Bottom Right Model to Center Card) */}
              <motion.path
                d="M 380 340 C 310 340, 290 260, 240 260"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
              />

              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF69B4" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing connecting dots */}
            <div className="absolute left-[200px] top-[180px] h-3 w-3 rounded-full bg-pink-500 animate-ping opacity-60" />

            {/* 1. CENTRAL SMARTPHONE DIRECTORY DEVICE */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 w-[240px] h-[375px] bg-black text-white rounded-3xl p-4 shadow-2xl border-4 border-neutral-800 flex flex-col justify-between overflow-hidden"
            >
              {/* Dynamic status network bar */}
              <div className="flex justify-between items-center text-[10px] text-zinc-400 border-b border-white/5 pb-2">
                <span className="font-mono tracking-wider">End-of-Sprint Session</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Core live audio-wave segment */}
              <div className="my-3 text-center space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px]">
                  <Mic className="h-3 w-3 text-pink-500 animate-pulse" />
                  <span className="font-mono text-zinc-300">00:05:39</span>
                </div>
                
                {/* Audio Waves visual overlay */}
                <div className="flex items-center justify-center gap-1.5 py-3 h-12">
                  <div className="w-1 bg-purple-600 rounded-full animate-bounce h-4" />
                  <div className="w-1 bg-pink-500 rounded-full animate-bounce h-8" />
                  <div className="w-1 bg-orange-400 rounded-full animate-bounce h-10" />
                  <div className="w-1 bg-yellow-400 rounded-full animate-bounce h-6" />
                  <div className="w-1 bg-purple-500 rounded-full animate-bounce h-3" />
                  <div className="w-1 bg-pink-600 rounded-full animate-bounce h-7" />
                  <div className="w-1 bg-orange-500 rounded-full animate-bounce h-9" />
                  <div className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" />
                </div>
                <div className="text-[10px] text-[#D4AF37] font-semibold tracking-wider font-mono uppercase">
                  Analysing Escrow...
                </div>
              </div>

              {/* Text transcript cards overlapping over dashboard */}
              <div className="space-y-3 flex-1 overflow-hidden pointer-events-none select-none text-left py-2">
                {/* Message A */}
                <div className="bg-white/10 p-2 rounded-xl border border-white/5 text-[10px]">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                    <span className="text-zinc-200 font-bold">Priya (Verified)</span>
                  </div>
                  <p className="text-zinc-300 line-clamp-2">"The only thing left is to get the final photoshoot layout ready."</p>
                </div>

                {/* Message B */}
                <div className="bg-neutral-900 border border-white/5 p-2 rounded-xl text-[10px]">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-zinc-200 font-bold">Client Booking Hub</span>
                  </div>
                  <p className="text-zinc-400 line-clamp-2">"Perfect. Locked in the ₹35k deposit. Let's start the shoot."</p>
                </div>
              </div>

              {/* Controls footer */}
              <div className="flex justify-center pt-2 border-t border-white/5">
                <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
              </div>
            </motion.div>

            {/* 2. TOP-LEFT FLOATING HEADSHOT: PRIYA */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-4 top-10 z-20"
            >
              <div className="relative group p-1 bg-white rounded-2xl shadow-xl border border-purple-500/20">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                  alt="Priya"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover"
                />
                <span className="absolute bottom-1 right-1 h-5 w-5 bg-purple-600 text-white flex items-center justify-center rounded-full text-[9px] shadow border border-white">
                  <Mic className="h-2.5 w-2.5" />
                </span>
              </div>
            </motion.div>

            {/* 3. TOP-RIGHT FLOATING HEADSHOT: KABIR */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-4 top-12 z-20"
            >
              <div className="relative p-1 bg-white rounded-2xl shadow-xl border border-blue-500/20">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"
                  alt="Kabir"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover"
                />
                <span className="absolute bottom-1 right-1 h-5 w-5 bg-blue-500 text-white flex items-center justify-center rounded-full text-[9px] shadow border border-white">
                  <Mic className="h-2.5 w-2.5" />
                </span>
              </div>
            </motion.div>

            {/* 4. BOTTOM-LEFT FLOATING HEADSHOT: ANJALI */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-10 bottom-6 z-20"
            >
              <div className="relative p-1 bg-white rounded-2xl shadow-xl border border-yellow-500/20">
                <img
                  src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=300&auto=format&fit=crop"
                  alt="Anjali"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 sm:h-18 sm:w-18 rounded-xl object-cover"
                />
              </div>
            </motion.div>

            {/* 5. BOTTOM-RIGHT FLOATING HEADSHOT: VIKRAM */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-6 bottom-4 z-20"
            >
              <div className="relative p-1 bg-white rounded-2xl shadow-xl border border-pink-500/20">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
                  alt="Vikram"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover"
                />
              </div>
            </motion.div>

            {/* 6. FLOATING 5-STAR RATING STARTS AS IN ATTACHED IMAGE */}
            <div className="absolute right-6 top-0 z-30 transform translate-y-[-10px] bg-white rounded-xl shadow-lg border border-neutral-100 p-2.5 flex flex-col items-start">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[10px] font-bold text-neutral-800 ml-1.5">5.0 / 5.0</span>
              </div>
              <p className="text-[9px] text-zinc-400 font-semibold font-mono mt-0.5">#1 Cast Network</p>
            </div>
          </div>

        </div>

        {/* AIRBNB STYLE CASINO RICH SEARCH BAR */}
        <div className="mt-16 sm:mt-20">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-pink-600 animate-pulse" />
              <span>Instant Discovery Parameters</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
            >
              {showFilters ? 'Hide Parameters Panel' : 'Show Parameters Panel'}
            </button>
          </div>

          {showFilters && (
            <form
              onSubmit={handleSearchSubmit}
              className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-3 shadow-xl backdrop-blur-md"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                
                {/* Location Selection */}
                <div className="flex flex-col items-start px-4 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-150 dark:border-white/10 text-left">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-400 font-mono">Location Node</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">All India</option>
                    {locations.filter(l => l !== 'All').map(loc => (
                      <option key={loc} value={loc} className="text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-900">{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="flex flex-col items-start px-4 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-150 dark:border-white/10 text-left">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-pink-600 dark:text-pink-400 font-mono">Category Tier</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">All Professions</option>
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} className="text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-900">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Gender Selection */}
                <div className="flex flex-col items-start px-4 py-1.5 border-b sm:border-b-0 sm:border-r border-neutral-150 dark:border-white/10 text-left">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-orange-600 dark:text-orange-400 font-mono">Gender Group</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
                  >
                    {genders.map(g => (
                      <option key={g.label} value={g.value} className="text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-900">{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Range */}
                <div className="flex items-center justify-between pl-4 pr-1 text-left col-span-1">
                  <div className="flex flex-col items-start mr-2">
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-600 dark:text-neutral-400 font-mono">Max Budget (₹/Day)</label>
                    <span className="mt-0.5 text-xs font-black text-neutral-800 dark:text-neutral-100 font-sans">
                      ₹{budget.toLocaleString('en-IN')}
                    </span>
                    <input
                      type="range"
                      min="10000"
                      max="100000"
                      step="5000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="mt-1 w-24 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="hero-search-submit"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110 active:scale-95 transition shadow-md cursor-pointer"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            </form>
          )}
        </div>

        {/* BOTTOM TICKER SPONSOR BAR FROM REFERENCE IMAGE */}
        <div className="mt-16 sm:mt-24 border-t border-black/5 pt-8">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono text-center mb-6">
            Trusted by premium brands & couture giants
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-35 hover:opacity-50 transition duration-300">
            {/* Sponsor A */}
            <span className="font-sans text-xs font-black tracking-[0.25em] text-[#0C0C0C]">
              SHELLS
            </span>
            {/* Sponsor B */}
            <span className="font-sans text-xs font-black tracking-[0.2em] text-[#0C0C0C] flex items-center gap-1">
              <span className="inline-block h-3.5 w-3.5 bg-current rounded-full" /> SmartFinder
            </span>
            {/* Sponsor C */}
            <span className="font-sans text-xs font-black tracking-[0.23em] text-[#0C0C0C]">
              ZOOMERR
            </span>
            {/* Sponsor D */}
            <span className="font-sans text-xs font-black tracking-[0.25em] text-[#0C0C0C]">
              KONTRASTR
            </span>
            {/* Sponsor E */}
            <span className="font-sans text-xs font-black tracking-[0.18em] text-[#0C0C0C]">
              WAVESMARATHON
            </span>
          </div>
        </div>

        {/* Central scrolling indicator button */}
        <div className="mt-12 flex justify-center">
          <motion.button
            type="button"
            onClick={() => handleScrollTo('homepage-categories')}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center space-y-1 text-neutral-400 hover:text-purple-600 cursor-pointer bg-white/60 hover:bg-white border border-neutral-200/80 rounded-full px-4 py-2.5 shadow-sm transition"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Scroll to explore</span>
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        </div>

      </div>
    </div>
  );
}
