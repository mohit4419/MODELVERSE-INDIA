/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, User as UserIcon, LogIn, Menu, X, ShieldAlert, CheckCircle2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import Logo from './Logo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setAuthenticated: (val: boolean) => void;
  userEmail: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  isEmailUnverified?: boolean;
  onResendVerification?: () => void;
  onChangePassword?: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  isAuthenticated,
  setAuthenticated,
  userEmail,
  darkMode = false,
  onToggleDarkMode,
  isEmailUnverified = false,
  onResendVerification,
  onChangePassword,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showLogoDropdown, setShowLogoDropdown] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Lock background body scrolling when mobile drawer navigation is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const menuItems = [
    { label: 'Home', id: 'home' },
    ...(currentRole === 'client' ? [
      { label: 'Models Directory', id: 'models' },
      { label: 'My Bookings', id: 'client-dashboard' },
      { label: 'AI Creative Lab', id: 'ai-studio' },
      { label: 'Casting Rates', id: 'pricing' },
      { label: 'Insights Blog', id: 'blog' },
    ] : []),
    ...(currentRole === 'model' ? [
      { label: 'Model Dashboard', id: 'agent-dashboard' },
      { label: 'Apply', id: 'become-model' },
    ] : []),
    ...(currentRole === 'admin' ? [
      { label: 'Models Directory', id: 'models' },
      { label: 'My Bookings', id: 'client-dashboard' },
      { label: 'Admin Panel', id: 'admin' },
      { label: 'Model Dashboard', id: 'agent-dashboard' },
      { label: 'AI Creative Lab', id: 'ai-studio' },
      { label: 'Casting Rates', id: 'pricing' },
      { label: 'Insights Blog', id: 'blog' },
    ] : []),
  ];

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-[#FAF5F2]/90 dark:bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo - Styled precisely like the clean black rounded square in the reference image */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (isAuthenticated) {
                setShowLogoDropdown(true);
              }
            }}
            onMouseLeave={() => {
              setShowLogoDropdown(false);
            }}
          >
            <div 
              onClick={() => {
                if (isAuthenticated) {
                  setShowLogoDropdown(prev => !prev);
                } else {
                  if (currentRole === 'admin') {
                    setCurrentTab('home');
                  } else if (currentRole === 'model') {
                    setCurrentTab('agent-dashboard');
                  } else {
                    setCurrentTab('home');
                  }
                }
              }} 
              className="flex cursor-pointer items-center transition hover:opacity-95 select-none"
            >
              <Logo size={42} variant="compact" />
            </div>

            {/* Logo Click/Hover Card for Logged In Session */}
            {isAuthenticated && showLogoDropdown && (
              <div 
                id="logo-action-card"
                className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#FAF5F2] dark:bg-neutral-900 p-4 shadow-xl z-50 animate-fadeIn text-left"
              >
                <div className="mb-3 pb-2 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 font-mono">QUICK SESSION CONTROLS</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-800 dark:text-white truncate mt-1">{userEmail}</p>
                </div>
                
                <div className="space-y-2">
                  {onChangePassword && (
                    <button
                      onClick={() => {
                        onChangePassword();
                        setShowLogoDropdown(false);
                      }}
                      className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer text-center shadow-md flex items-center justify-center space-x-1 border border-purple-600 hover:border-purple-800"
                    >
                      Change Password
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAuthenticated(false);
                      setShowLogoDropdown(false);
                    }}
                    className="w-full py-2 px-3 bg-red-600 hover:bg-red-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer text-center shadow-md flex items-center justify-center space-x-1 border border-red-600 hover:border-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center Navigation - Minimalist, high contrast, matched style */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4 xl:space-x-8 lg:ml-8 xl:ml-16">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`relative font-sans text-xs sm:text-xs font-black tracking-wider uppercase transition-colors duration-150 py-1 cursor-pointer ${
                  currentTab === item.id 
                    ? 'text-purple-650 dark:text-purple-400 font-black border-b-2 border-purple-600 dark:border-purple-400' 
                    : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA & Role Switcher Actions (Right-aligned) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            
            {/* Locked/Secure Role Badge */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 shadow-sm font-mono select-none">
                <div className={`h-2 w-2 rounded-full ${
                  currentRole === 'admin' ? 'bg-red-500 animate-pulse' : currentRole === 'model' ? 'bg-pink-500' : 'bg-purple-500'
                }`} />
                <span className="capitalize text-[10px] tracking-wide">{currentRole} Portal</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-400 dark:text-neutral-500 shadow-sm font-mono select-none">
                <div className="h-2 w-2 rounded-full bg-neutral-450 dark:bg-neutral-600" />
                <span className="text-[9px] uppercase tracking-wider">Locked Guest</span>
              </div>
            )}

            {/* Premium CTA Button matching the gorgeous style */}
            <button
              onClick={() => setCurrentTab('pricing')}
              className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/10 transition hover:brightness-110 cursor-pointer active:scale-98"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Premium Unlock</span>
            </button>

            {isAuthenticated && isEmailUnverified && (
              <button
                onClick={onResendVerification}
                className="flex items-center space-x-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/10 transition cursor-pointer active:scale-98"
                title="Your email is unverified. Click to resend verification email."
              >
                <ShieldAlert className="h-3.5 w-3.5 text-white animate-pulse" />
                <span>Resend Verification Email</span>
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div 
                className="relative"
                onMouseEnter={() => setShowProfileCard(true)}
                onMouseLeave={() => setShowProfileCard(false)}
              >
                <div className="flex items-center space-x-3.5">
                  <div 
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-750 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 shadow-sm"
                    title={`Logged in as ${userEmail}`}
                    onClick={() => {
                      setShowProfileCard(prev => !prev);
                    }}
                  >
                    <UserIcon className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    {onChangePassword && (
                      <button 
                        onClick={onChangePassword}
                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 hover:underline cursor-pointer mb-1"
                      >
                        Change Password
                      </button>
                    )}
                    <button 
                      onClick={() => setAuthenticated(false)}
                      className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-500 hover:underline cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Profile Hover Card */}
                {showProfileCard && (
                  <div 
                    id="profile-hover-card"
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#FAF5F2] dark:bg-neutral-900 p-4 shadow-xl z-50 animate-fadeIn text-left animate-duration-150"
                  >
                    <div className="mb-3 pb-2 border-b border-black/10 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 font-mono">SECURE ACCESS LEVEL</span>
                      </div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-white truncate mt-1">{userEmail}</p>
                      <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-wide capitalize mt-0.5">{currentRole} Portal</p>
                    </div>

                    <div className="space-y-2">
                      {onChangePassword && (
                        <button
                          onClick={() => {
                            onChangePassword();
                            setShowProfileCard(false);
                          }}
                          className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer text-center shadow-md flex items-center justify-center space-x-1 border border-purple-600 hover:border-purple-800"
                        >
                          Change Password
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAuthenticated(false);
                          setShowProfileCard(false);
                        }}
                        className="w-full py-2 px-3 bg-red-600 hover:bg-red-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer text-center shadow-md flex items-center justify-center space-x-1 border border-red-600 hover:border-red-800"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-register-btn"
                onClick={() => setAuthenticated(true)}
                className="flex items-center space-x-1.5 rounded-full border border-neutral-900 dark:border-neutral-800 bg-neutral-950 dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-black dark:hover:bg-black/40 shadow-md cursor-pointer transition-all duration-150 active:scale-98"
              >
                <LogIn className="h-3.5 w-3.5 text-white" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2.5">
            <div className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-2.5 py-1 text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-300 shadow-sm select-none">
              <span className="capitalize">{currentRole}</span>
            </div>

            <button
              id="mobile-menu-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Rendered in Document Body to spread sidebar cleanly) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                id="mobile-menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md lg:hidden"
              />

              {/* Slide-out Drawer Panel - Modern Sidebar styled layout */}
              <motion.div
                id="mobile-menu-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed inset-y-0 right-0 z-[70] w-72 sm:w-80 max-w-[85vw] bg-[#FAF5F2] dark:bg-neutral-950 p-6 shadow-2xl lg:hidden flex flex-col justify-between overflow-y-auto no-scrollbar border-l border-black/5 dark:border-white/10"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/10">
                    <div 
                      onClick={() => {
                        if (currentRole === 'admin') {
                          setCurrentTab('home');
                        } else if (currentRole === 'model') {
                          setCurrentTab('agent-dashboard');
                        } else {
                          setCurrentTab('home');
                        }
                        setMobileMenuOpen(false);
                      }} 
                      className="flex cursor-pointer items-center select-none"
                    >
                      <Logo size={36} variant="compact" />
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-full border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Secure Active Role State Badge */}
                  <div className="mt-6 px-1 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono">Access State</span>
                    {isAuthenticated ? (
                      <div className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/5 bg-neutral-100/50 dark:bg-neutral-900/50 px-3 py-1 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 shadow-sm font-mono select-none">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          currentRole === 'admin' ? 'bg-red-500 animate-pulse' : currentRole === 'model' ? 'bg-pink-500' : 'bg-purple-500'
                        }`} />
                        <span className="capitalize">{currentRole} Portal</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/5 bg-neutral-100/50 dark:bg-neutral-900/50 px-3 py-1 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 shadow-sm font-mono select-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-450 dark:bg-neutral-600" />
                        <span>Guest Mode</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Navigation Links */}
                  <div className="mt-8 space-y-1">
                    <div className="px-1 text-[9px] font-black uppercase tracking-widest text-neutral-455 dark:text-neutral-500 font-mono mb-2">Main Navigation</div>
                    {menuItems
                      .filter((item) => !['pricing', 'blog', 'about'].includes(item.id))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`block w-full rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                            currentTab === item.id 
                              ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 font-black border-l-4 border-purple-600 dark:border-purple-400' 
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                  </div>

                  {/* Drawer auxiliary / slide-out links section (Specifically for Pricing, Blog, About) */}
                  {menuItems.some((item) => ['pricing', 'blog', 'about'].includes(item.id)) && (
                    <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 space-y-1">
                      <div className="px-1 text-[9px] font-black uppercase tracking-widest text-neutral-455 dark:text-neutral-500 font-mono mb-2">Auxiliary & Resources</div>
                      {menuItems
                        .filter((item) => ['pricing', 'blog', 'about'].includes(item.id))
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentTab(item.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`block w-full rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                              currentTab === item.id 
                                ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-650 dark:text-purple-400 font-black border-l-4 border-purple-600 dark:border-purple-400' 
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions section */}
                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 space-y-4">
                  {/* Premium Lock/Unlock Trigger */}
                  <button
                    onClick={() => {
                      setCurrentTab('pricing');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 w-full rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-3 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-pink-500/10 hover:brightness-110 active:scale-98 transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Unlock Premium Access</span>
                  </button>

                  {isAuthenticated && isEmailUnverified && (
                    <button
                      onClick={() => {
                        if (onResendVerification) onResendVerification();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full rounded-full bg-amber-500 py-3 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-amber-500/10 hover:bg-amber-600 active:scale-98 transition cursor-pointer"
                    >
                      <ShieldAlert className="h-4 w-4 animate-pulse" />
                      <span>Resend Verification Email</span>
                    </button>
                  )}

                  {/* User Info / Login status */}
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-850 dark:text-neutral-300 shadow-sm">
                          <UserIcon className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wide font-mono">Logged in as</p>
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{userEmail}</p>
                        </div>
                      </div>
                      {onChangePassword && (
                        <button 
                          onClick={() => {
                            onChangePassword();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-center py-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50 text-purple-650 dark:text-purple-450 text-xs font-black uppercase tracking-wider hover:bg-purple-500/5 transition cursor-pointer"
                        >
                          Change Password
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setAuthenticated(false);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-center py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-500/5 transition cursor-pointer"
                      >
                        Logout Session
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthenticated(true);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full rounded-xl border border-neutral-900 dark:border-neutral-800 bg-neutral-950 dark:bg-neutral-900 py-3 text-xs font-black text-white uppercase tracking-wider hover:bg-black transition cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login / Sign Up</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
}
