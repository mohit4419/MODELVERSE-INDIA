/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Model, Booking, PaymentRecord, Message, UserRole, Review } from './types';
import { dbService } from './services/db';
import { supabase } from './supabaseClient';

// SUB-COMPONENTS
import Logo from './components/Logo';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import ModelCard from './components/ModelCard';
import ModelCardSkeleton from './components/ModelCardSkeleton';
import Filters from './components/Filters';
import ProfileView from './components/ProfileView';
import PremiumUnlockModal from './components/PremiumUnlockModal';
import MockCheckout from './components/MockCheckout';
import BookingWizard from './components/BookingWizard';
import BookingWizardSkeleton from './components/BookingWizardSkeleton';
import ChatWindow from './components/ChatWindow';
import BecomeModelForm from './components/BecomeModelForm';
import AdminDashboard from './components/AdminDashboard';
import AgentDashboard from './components/AgentDashboard';
import ClientDashboard from './components/ClientDashboard';
import BlogSection from './components/BlogSection';
import AboutContact from './components/AboutContact';
import AuthView from './components/AuthView';
import CustomCursor from './components/CustomCursor';
import DynamicMetadata from './components/DynamicMetadata';
import ShootingStars from './components/ShootingStars';
import AICreativeStudio from './components/AICreativeStudio';
import TestimonialSlider from './components/TestimonialSlider';
import ToastNotification, { Toast, ToastType } from './components/ToastNotification';
import BannerAd from './components/BannerAd';
import { calculateHaversineDistance, getCityCoordinates } from './utils/location';

import { Sparkles, Star, MapPin, Heart, ShieldAlert, CheckCircle2, MessageCircle, DollarSign, Calendar, Flame, Instagram, X, MessageSquare, Clock, User as UserIcon, LogIn, UserPlus, Search, Sun, Moon, LifeBuoy, SlidersHorizontal } from 'lucide-react';
import { motion, useScroll, useSpring, animate, AnimatePresence, type Variants } from 'motion/react';

const HOME_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'all': 'Explore our complete, premium registry of models, influencers, and actors available across India.',
  'Fashion Models': 'High fashion couture, runway collections, designer campaigns, and editorial showcases.',
  'Commercial Models': 'Print advertisements, cosmetics and beauty branding, television commercials, and product catalogs.',
  'Fitness Models': 'Athletic wear, active healthy lifestyles, gym promotions, and sports gear campaigns.',
  'Influencers': 'High-profile lifestyle figures, content creators, and social media brand ambassadors.',
  'UGC Creators': 'Self-produced high-retention organic content curators for high-converting social media ads.',
  'Actors': 'Professional screen actors, theatre artists, OTT series, and film production talent.',
  'Event Hosts': 'Charismatic corporate presenters, luxury event MCs, and high-end brand spokespeople.',
  'Promotional Models': 'Live convention representatives, high-impact product launches, and interactive tech exhibitions.',
  'Brand Ambassadors': 'Long-term corporate figures, exclusive campaign faces, and signature runway personalities.'
};

const marketplaceGridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const marketplaceItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 14,
    },
  },
};

export default function App() {
  // Framer Motion viewport scroll progress monitoring
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // GLOBAL APPLICATION TABS
  // 'home' | 'models' | 'become-model' | 'pricing' | 'blog' | 'about' | 'contact' | 'admin' | 'chat'
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [isAuthenticated, setAuthenticatedState] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('mk5663670@gmail.com');
  const [clientId, setClientId] = useState<string>('c_test');
  const [currentUserName, setCurrentUserName] = useState<string>('Demo Client');
  const [authRoleHint, setAuthRoleHint] = useState<UserRole>('client');
  const [authTabHint, setAuthTabHint] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authEmailHint, setAuthEmailHint] = useState<string>('');
  const [isEmailUnverified, setIsEmailUnverified] = useState<boolean>(false);

  // Monetization bottom banner ad state
  const [showAdBanner, setShowAdBanner] = useState<boolean>(() => {
    return localStorage.getItem('ad_banner_dismissed') !== 'true';
  });

  // Real-time Firebase Auth Synchronization
  useEffect(() => {
    // Initial check for a stored local session (restores session instantly)
    const cachedUser = dbService.getCurrentSessionUser();
    if (cachedUser) {
      setAuthenticatedState(true);
      setUserEmail(cachedUser.email);
      setCurrentUserName(cachedUser.name);
      setClientId(cachedUser.id);
      setCurrentRole(cachedUser.role);
    }

    // Check Supabase session specifically for unverified email address
    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          if (!session.user.email_confirmed_at) {
            setIsEmailUnverified(true);
          } else {
            setIsEmailUnverified(false);
          }
        } else {
          setIsEmailUnverified(false);
        }
      } catch (err) {
        console.warn('Error checking supabase session:', err);
      }
    };
    checkSupabaseSession();

    // Set up auth state change listener for Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        if (!session.user.email_confirmed_at) {
          setIsEmailUnverified(true);
        } else {
          setIsEmailUnverified(false);
        }
      } else {
        setIsEmailUnverified(false);
      }
    });

    let unsubscribeFirebase: (() => void) | undefined;
    if (dbService.auth) {
      unsubscribeFirebase = dbService.auth.onAuthStateChanged(async (user: any) => {
        if (user) {
          const email = user.email || 'mk5663670@gmail.com';
          const allUsers = await dbService.getUsers();
          let existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!existingUser) {
            // Automatically create a new user entry using their email as a unique identifier
            const credInfo = await dbService.getCredentials(email);
            const resolvedRole = credInfo ? (credInfo.role as UserRole) : 'client';
            
            existingUser = {
              id: email,
              role: resolvedRole,
              name: user.displayName || 'Google User',
              email: email,
              phone: user.phoneNumber || '+91 90000 00000',
              status: 'active',
              avatarUrl: user.photoURL || undefined,
              createdAt: new Date().toISOString()
            };
            await dbService.saveUser(existingUser);
          }
          
          dbService.setCurrentSessionUser(existingUser);
          
          setAuthenticatedState(true);
          setUserEmail(existingUser.email);
          setCurrentUserName(existingUser.name);
          setClientId(existingUser.id);
          setCurrentRole(existingUser.role);
        } else {
          // If no active Firebase Auth session, check if we have a robust local session
          const sessionUser = dbService.getCurrentSessionUser();
          if (sessionUser) {
            setAuthenticatedState(true);
            setUserEmail(sessionUser.email);
            setCurrentUserName(sessionUser.name);
            setClientId(sessionUser.id);
            setCurrentRole(sessionUser.role);
          } else {
            setAuthenticatedState(false);
            setUserEmail('guest@modelverse.in');
            setCurrentUserName('Guest');
            setClientId('c_test');
          }
        }
      });
    }

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Enforce role-based tab isolation to secure interfaces
  useEffect(() => {
    if (isAuthenticated) {
      if (currentRole === 'model') {
        const allowedModelTabs = ['home', 'models', 'become-model', 'agent-dashboard', 'auth'];
        if (!allowedModelTabs.includes(currentTab)) {
          setCurrentTab('agent-dashboard');
        }
      } else if (currentRole === 'client') {
        if (currentTab === 'admin' || currentTab === 'agent-dashboard') {
          setCurrentTab('home');
        }
      }
    }
  }, [isAuthenticated, currentRole, currentTab]);

  const setAuthenticated = async (val: boolean) => {
    if (val) {
      setCurrentTab('auth');
    } else {
      try {
        await dbService.logOut();
      } catch (err) {
        console.error('Logout error', err);
      }
      setAuthenticatedState(false);
      setUserEmail('guest@modelverse.in');
      setCurrentUserName('Guest');
      setClientId('c_test');
      setCurrentRole('client');
      setCurrentTab('home');
      triggerToast('Signed Out', 'You have been successfully signed out.', 'info');
    }
  };

  const handleChangePasswordClick = async () => {
    setAuthTabHint('forgot');
    setAuthEmailHint(userEmail);
    await setAuthenticated(false);
    setCurrentTab('auth');
  };

  const handleAuthSuccess = (user: any, role: UserRole) => {
    setAuthenticatedState(true);
    setUserEmail(user.email);
    setCurrentUserName(user.name);
    setClientId(user.id);
    setCurrentRole(role);
    triggerToast('Secure Access Granted', `Successfully logged in as ${user.name} (${role})`, 'success');
    
    // Redirect based on role
    if (role === 'admin') {
      setCurrentTab('admin');
    } else if (role === 'model') {
      setCurrentTab('agent-dashboard');
    } else {
      setCurrentTab('home');
    }
  };

  // MARKETPLACE STATE collections
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [isBookingWizardLoading, setIsBookingWizardLoading] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const triggerToast = (title: string, message: string, type: ToastType = 'success') => {
    const newToast: Toast = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // CLIENT SAVED PREFERENCES
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockedProfiles, setUnlockedProfiles] = useState<string[]>([]);

  // DETAILED VIEW FOCUS STATE
  const [focusedModelId, setFocusedModelId] = useState<string | null>(null);
  const [chatModelUserId, setChatModelUserId] = useState<string | null>(null);

  const focusedModel = models.find(m => m.id === focusedModelId) || null;

  // SEARCH AND FILTER PRE-FILL STATE
  const [activeHomeCategory, setActiveHomeCategory] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchGender, setSearchGender] = useState('');
  const [searchAgeRange, setSearchAgeRange] = useState<[number, number]>([18, 40]);
  const [searchHeightClass, setSearchHeightClass] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchBudgetLimit, setSearchBudgetLimit] = useState(100000);
  const [searchOnlyVerified, setSearchOnlyVerified] = useState(false);
  const [searchAvailableOnly, setSearchAvailableOnly] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(Infinity);
  const [projectCoords, setProjectCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(''); // '', 'price_desc', 'price_asc', 'rating'

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mvi_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const filtered = recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('mvi_recent_searches', JSON.stringify(updated));
  };

  const deleteRecentSearch = (queryToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== queryToDelete);
    setRecentSearches(updated);
    localStorage.setItem('mvi_recent_searches', JSON.stringify(updated));
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mvi_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mvi_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mvi_dark_mode', 'false');
    }
  }, [darkMode]);

  // DIALOG/MODAL OVERLAYS STATE
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [targetModelForPremium, setTargetModelForPremium] = useState<Model | null>(null);
  const [premiumPlanType, setPremiumPlanType] = useState<'premium' | 'enterprise'>('premium');
  const [targetModelForBooking, setTargetModelForBooking] = useState<Model | null>(null);
  const [focusedModelReviews, setFocusedModelReviews] = useState<any[]>([]);

  const handleOpenBookingWizard = (model: Model) => {
    setTargetModelForBooking(model);
    setShowBookingWizard(true);
    setIsBookingWizardLoading(true);
    setTimeout(() => {
      setIsBookingWizardLoading(false);
    }, 750);
  };

  // ELITE TALENT MODAL & 5-MIN CHAT TIMERS STATE
  const [showEliteModal, setShowEliteModal] = useState(false);
  const [eliteModelForModal, setEliteModelForModal] = useState<Model | null>(null);
  const [selectedModelForChat, setSelectedModelForChat] = useState<Model | null>(null);
  const [activeChatEndTime, setActiveChatEndTime] = useState<number | null>(null);

  // MOCK CHECKOUT STATE
  const [showMockCheckout, setShowMockCheckout] = useState(false);
  const [mockCheckoutData, setMockCheckoutData] = useState<{
    gateway: 'Razorpay' | 'Cashfree' | 'UPI';
    planType: string;
    amount: number;
    modelId: string;
    modelName: string;
    userName: string;
    userEmail: string;
    error?: string;
  } | null>(null);

  // VERIFYING PAYMENT STATE (FOR SMOOTH ANIMATED LOTTIE-STYLE SUCCESS/FAILURE OVERLAYS)
  const [verifyingPayment, setVerifyingPayment] = useState<{
    isOpen: boolean;
    step: 'verifying' | 'success' | 'failure';
    amount: number;
    modelName: string;
    gateway: string;
    invoiceId?: string;
    error?: string;
  }>({
    isOpen: false,
    step: 'verifying',
    amount: 199,
    modelName: '',
    gateway: 'Razorpay'
  });

  // Global Razorpay Webhook Payment Success Listener
  useEffect(() => {
    if (!clientId) return;

    const interval = setInterval(() => {
      fetch(`/api/payments/pending-webhook-unlocks?userId=${clientId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Network error fetching pending webhook unlocks');
          return res.json();
        })
        .then((data) => {
          if (data && data.unlocks && data.unlocks.length > 0) {
            for (const unlock of data.unlocks) {
              const { modelId, modelName, planType, amount } = unlock;
              
              // 1. Trigger beautiful global toast notification
              triggerToast(
                'Payment Success (Webhook)',
                `Successful ${planType === 'escrow' ? 'escrow deposit' : 'premium unlock'} of ₹${amount.toLocaleString()} was verified via Razorpay Webhook!`,
                'success'
              );

              // 2. Perform chat unlock/booking updates
              dbService.unlockProfile(modelId);
              setUnlockedProfiles(dbService.getUnlockedProfiles());

              // If it was a booking (escrow), let's activate any pending booking and send system messages
              if (planType === 'escrow') {
                dbService.getBookings().then((allBookings) => {
                  const pendingBooking = allBookings.find(b => b.modelId === modelId && b.clientId === clientId && b.status === 'pending');
                  if (pendingBooking) {
                    const updated = { ...pendingBooking, status: 'accepted' as const };
                    dbService.addBooking(updated).then(() => {
                      dbService.getBookings().then(setBookings);
                    });
                  }
                });

                // Send System Message to Client and Notification Message to Model
                dbService.getModels().then((allModels) => {
                  const modelObj = allModels.find(m => m.id === modelId);
                  const modelUserId = modelObj ? modelObj.userId : modelId;

                  const systemMsg: Message = {
                    id: `msg_sys_wh_${Date.now()}`,
                    senderId: 'system',
                    receiverId: clientId,
                    content: `🎉 Campaign Escrow Payment of ₹${amount.toLocaleString()} Verified via Webhook! Your booking for ${modelName} is officially secured. Chat access is now fully unlocked!`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                  };

                  const modelNotificationMsg: Message = {
                    id: `msg_model_notif_wh_${Date.now()}`,
                    senderId: 'system',
                    receiverId: modelUserId,
                    content: `🔔 Booking Confirmation via Webhook: A client has funded the escrow payment of ₹${amount.toLocaleString()} for your upcoming casting campaign! Chat access is unlocked.`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                  };

                  dbService.addMessage(systemMsg).then(() => {
                    dbService.addMessage(modelNotificationMsg).then(() => {
                      dbService.getMessages().then(setMessages);
                    });
                  });
                });
              } else {
                // Regular Premium profile unlock
                setActiveChatEndTime(Date.now() + 5 * 60 * 1000);
                
                dbService.getModels().then((allModels) => {
                  const modelObj = allModels.find(m => m.id === modelId);
                  if (modelObj) {
                    const systemMsg: Message = {
                      id: `msg_sys_wh_${Date.now()}`,
                      senderId: 'system',
                      receiverId: clientId,
                      content: `🎉 Premium 5-minute Chat Session with ${modelObj.name} activated via Verified Webhook! Timer is ticking...`,
                      timestamp: new Date().toISOString(),
                      isRead: false,
                    };
                    const clientMsg: Message = {
                      id: `msg_client_wh_${Date.now()}`,
                      senderId: clientId,
                      receiverId: modelObj.userId,
                      content: `Hi ${modelObj.name}! I've unlocked our secure premium session. Let's connect on our upcoming fashion campaign!`,
                      timestamp: new Date().toISOString(),
                      isRead: false,
                    };
                    dbService.addMessage(systemMsg).then(() => {
                      dbService.addMessage(clientMsg).then(() => {
                        dbService.getMessages().then(setMessages);
                      });
                    });
                  }
                });
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Error polling for webhook payment successes:', err);
        });
    }, 3500);

    return () => clearInterval(interval);
  }, [clientId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Parse SEO Deep-Linking parameters if present on load
    const seoTab = urlParams.get('tab');
    const seoCategory = urlParams.get('category');
    const seoModelId = urlParams.get('model_id');

    if (seoTab) {
      setCurrentTab(seoTab);
    }
    if (seoCategory) {
      setSearchCategory(seoCategory);
      setActiveHomeCategory(seoCategory);
      setCurrentTab('models');
    }
    if (seoModelId && urlParams.get('payment_success') !== 'true' && urlParams.get('mock_checkout') !== 'true') {
      setFocusedModelId(seoModelId);
      setCurrentTab('models');
    }

    const paymentSuccess = urlParams.get('payment_success');
    const isMock = urlParams.get('mock_checkout') === 'true';

    if (isMock) {
      setShowMockCheckout(true);
      setMockCheckoutData({
        gateway: (urlParams.get('gateway') || 'Razorpay') as 'Razorpay' | 'Cashfree' | 'UPI',
        planType: urlParams.get('plan_type') || 'premium',
        amount: Number(urlParams.get('amount') || '199'),
        modelId: urlParams.get('model_id') || '',
        modelName: urlParams.get('model_name') || '',
        userName: urlParams.get('user_name') || 'Demo Client',
        userEmail: urlParams.get('user_email') || 'client@advertiser.com',
        error: urlParams.get('error') || undefined
      });
      // Clear URL search parameters so refreshing won't lock the applet
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (paymentSuccess === 'true') {
      const gateway = (urlParams.get('gateway') || 'Razorpay') as 'Razorpay' | 'Cashfree' | 'UPI';
      const sessionId = urlParams.get('session_id') || '';
      const planType = urlParams.get('plan_type') as 'premium' | 'enterprise' | 'escrow';
      const amount = Number(urlParams.get('amount') || '199');
      const modelId = urlParams.get('model_id') || '';
      const modelName = urlParams.get('model_name') || '';

      const razorpay_payment_id = urlParams.get('razorpay_payment_id') || undefined;
      const razorpay_order_id = urlParams.get('razorpay_order_id') || undefined;
      const razorpay_signature = urlParams.get('razorpay_signature') || undefined;

      // Launch full-screen verification modal immediately with Lottie-style loader
      setVerifyingPayment({
        isOpen: true,
        step: 'verifying',
        amount,
        modelName,
        gateway
      });

      // Securely verify actual payment with backend before unlocking
      fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gateway,
          sessionId,
          planType,
          amount,
          modelId,
          modelName,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          window.history.replaceState({}, document.title, window.location.pathname);

          if (data.verified) {
            const verifiedPlanType = data.planType || planType;
            const verifiedAmount = data.amount || amount;
            const verifiedModelId = data.modelId || modelId;
            const verifiedModelName = data.modelName || modelName;
            const verifiedGateway = data.gateway || gateway;
            const randomInvoiceId = `MVI-${verifiedGateway.toUpperCase()}-${Math.floor(Math.random() * 8000 + 1000)}`;

            // Transition to success screen with smooth path-drawing animation
            setVerifyingPayment(prev => ({
              ...prev,
              step: 'success',
              amount: verifiedAmount,
              invoiceId: randomInvoiceId,
              modelName: verifiedModelName
            }));

            // Add Secure PaymentRecord
            const paymentRecord: PaymentRecord = {
              id: `pay_mvi_${Date.now()}`,
              userId: clientId,
              userName: currentUserName || 'Premium Client',
              userEmail: userEmail,
              amount: verifiedAmount,
              paymentGateway: verifiedGateway,
              status: 'success',
              description: verifiedPlanType === 'enterprise'
                ? `Enterprise Grant Account Monthly ${verifiedGateway} License`
                : (verifiedPlanType === 'escrow' ? `${verifiedGateway} Campaign Escrow Deposit for ${verifiedModelName}` : `${verifiedGateway} Premium Profile Unlock for ${verifiedModelName}`),
              createdAt: new Date().toISOString(),
              invoiceId: randomInvoiceId,
              sessionId: sessionId,
              modelId: verifiedModelId,
              isSandbox: data.isSandbox,
            };

            dbService.addPayment(paymentRecord).then(() => {
              dbService.getPayments().then(setPayments);

              if (verifiedPlanType === 'premium' && verifiedModelId) {
                // EXPLICITLY query database using helper function before unlocking to prevent client-side tampering
                dbService.verifySessionAndUnlockProfile(verifiedModelId, sessionId).then((isUnlockedSuccessfully) => {
                  if (isUnlockedSuccessfully) {
                    setUnlockedProfiles(dbService.getUnlockedProfiles());
                    setActiveChatEndTime(Date.now() + 5 * 60 * 1000);

                    dbService.getModels().then((allModels) => {
                      const modelObj = allModels.find((m) => m.id === verifiedModelId);
                      if (modelObj) {
                        const systemMsg: Message = {
                          id: `msg_sys_${Date.now()}`,
                          senderId: 'system',
                          receiverId: clientId,
                          content: `🎉 Premium 5-minute Chat Session with ${modelObj.name} activated via Verified ${verifiedGateway} Payment! Timer is ticking...`,
                          timestamp: new Date().toISOString(),
                          isRead: false,
                        };
                        const clientMsg: Message = {
                          id: `msg_client_${Date.now()}`,
                          senderId: clientId,
                          receiverId: modelObj.userId,
                          content: `Hi ${modelObj.name}! I've unlocked our secure premium session via ${verifiedGateway}. Let's connect on our upcoming fashion campaign!`,
                          timestamp: new Date().toISOString(),
                          isRead: false,
                        };
                        dbService.addMessage(systemMsg).then(() => {
                          dbService.addMessage(clientMsg).then(() => {
                            dbService.getMessages().then(setMessages);
                          });
                        });
                        setChatModelUserId(modelObj.userId);
                        setCurrentTab('chat');
                      }
                    });

                    triggerToast(
                      'Payment Verified',
                      `${verifiedGateway} payment of ₹${verifiedAmount.toLocaleString()} was securely verified on our servers and logged in our ledger. Access unlocked!`,
                      'success'
                    );
                  } else {
                    triggerToast(
                      'Payment Verification Failed',
                      'The payment record was not securely verified in the database. Access denied.',
                      'error'
                    );
                  }
                });
              } else if (verifiedPlanType === 'enterprise') {
                localStorage.setItem('mvi_enterprise_activated', 'true');
                triggerToast(
                  'Enterprise Activated',
                  `Your ${verifiedGateway} enterprise grant license is active.`,
                  'success'
                );
              } else if (verifiedPlanType === 'escrow') {
                const pendingBookingStr = localStorage.getItem('mvi_pending_booking');
                if (pendingBookingStr) {
                  try {
                    const pendingBooking: Booking = JSON.parse(pendingBookingStr);
                    pendingBooking.status = 'accepted'; // Confirm/activate the booking as paid

                    dbService.addBooking(pendingBooking).then(() => {
                      dbService.unlockProfile(pendingBooking.modelId);
                      setUnlockedProfiles(dbService.getUnlockedProfiles());
                      dbService.getBookings().then(setBookings);
                      localStorage.removeItem('mvi_pending_booking');

                      dbService.getModels().then((allModels) => {
                        const modelObj = allModels.find(m => m.id === pendingBooking.modelId);
                        const modelUserId = modelObj ? modelObj.userId : pendingBooking.modelId;

                        const systemMsg: Message = {
                          id: `msg_sys_${Date.now()}`,
                          senderId: 'system',
                          receiverId: clientId,
                          content: `🎉 Campaign Escrow Payment of ₹${verifiedAmount.toLocaleString()} Verified! Your booking for ${verifiedModelName} is officially secured. Chat access is now fully unlocked!`,
                          timestamp: new Date().toISOString(),
                          isRead: false
                        };

                        const modelNotificationMsg: Message = {
                          id: `msg_model_notif_${Date.now()}`,
                          senderId: 'system',
                          receiverId: modelUserId,
                          content: `🔔 Booking Confirmation: Client "${pendingBooking.clientName}" has booked you for campaign "${pendingBooking.projectDetails.brandName}" on ${pendingBooking.projectDetails.date}. Escrow payment of ₹${verifiedAmount.toLocaleString()} is fully funded and secured on ModelVerse India!`,
                          timestamp: new Date().toISOString(),
                          isRead: false
                        };

                        dbService.addMessage(systemMsg).then(() => {
                          dbService.addMessage(modelNotificationMsg).then(() => {
                            dbService.getMessages().then(setMessages);
                          });
                        });

                        // Set active chat target to the model
                        setChatModelUserId(modelUserId);
                        // Redirect client directly to Client Dashboard showing My Bookings list
                        setCurrentTab('client-dashboard');

                        triggerToast(
                          'Booking Secured & Paid',
                          `Your escrow payment of ₹${verifiedAmount.toLocaleString()} was successfully funded. ${verifiedModelName} is officially booked and chat access unlocked!`,
                          'success'
                        );
                      });
                    });
                  } catch (e) {
                    console.error('Error unpacking pending booking from local stash:', e);
                  }
                } else {
                  // Fallback in case localStorage was cleared
                  dbService.getModels().then((allModels) => {
                    const modelObj = allModels.find(m => m.id === verifiedModelId);
                    const modelUserId = modelObj ? modelObj.userId : (verifiedModelId || '');

                    const fallbackBooking: Booking = {
                      id: `bk_${Date.now()}`,
                      clientId,
                      clientName: currentUserName || 'Premium Agency (Test Client)',
                      modelId: verifiedModelId || '',
                      modelName: verifiedModelName || 'Selected Model',
                      modelImage: modelObj?.portfolio[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                      projectDetails: {
                        brandName: 'Premium Campaign',
                        companyName: 'Ad Agency',
                        campaignType: 'Commercial Campaign',
                        shootType: 'Digital Prints',
                        location: 'Mumbai',
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        duration: 'Full Day',
                        budgetRange: '₹50,000 - ₹1,00,000'
                      },
                      status: 'accepted',
                      createdAt: new Date().toISOString(),
                      priceAmount: verifiedAmount
                    };

                    dbService.addBooking(fallbackBooking).then(() => {
                      dbService.unlockProfile(verifiedModelId);
                      setUnlockedProfiles(dbService.getUnlockedProfiles());
                      dbService.getBookings().then(setBookings);

                      const systemMsg: Message = {
                        id: `msg_sys_${Date.now()}`,
                        senderId: 'system',
                        receiverId: clientId,
                        content: `🎉 Campaign Escrow Payment of ₹${verifiedAmount.toLocaleString()} Verified! Your booking for ${verifiedModelName} is officially secured. Chat access is now fully unlocked!`,
                        timestamp: new Date().toISOString(),
                        isRead: false
                      };

                      const modelNotificationMsg: Message = {
                        id: `msg_model_notif_${Date.now()}`,
                        senderId: 'system',
                        receiverId: modelUserId,
                        content: `🔔 Booking Confirmation: Client "${fallbackBooking.clientName}" has booked you for campaign "${fallbackBooking.projectDetails.brandName}". Escrow payment of ₹${verifiedAmount.toLocaleString()} is fully funded and secured on ModelVerse India!`,
                        timestamp: new Date().toISOString(),
                        isRead: false
                      };

                      dbService.addMessage(systemMsg).then(() => {
                        dbService.addMessage(modelNotificationMsg).then(() => {
                          dbService.getMessages().then(setMessages);
                        });
                      });

                      setChatModelUserId(modelUserId);
                      setCurrentTab('client-dashboard');

                      triggerToast(
                        'Booking Secured',
                        `Your booking of ₹${verifiedAmount.toLocaleString()} was successfully verified and registered in your dashboard. Chat access unlocked!`,
                        'success'
                      );
                    });
                  });
                }
              } else {
                triggerToast(
                  'Payment Verified',
                  `${verifiedGateway} payment of ₹${verifiedAmount.toLocaleString()} was securely verified on our servers.`,
                  'success'
                );
              }
            });
          } else {
            setVerifyingPayment(prev => ({
              ...prev,
              step: 'failure',
              error: data.error || `The server could not verify your payment status with ${gateway}.`
            }));
            triggerToast(
              'Payment Verification Failed',
              data.error || `The server could not verify your payment status with ${gateway}.`,
              'error'
            );
          }
        })
        .catch((err) => {
          console.error('Payment verification call failed:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
          setVerifyingPayment(prev => ({
            ...prev,
            step: 'failure',
            error: 'Failed to verify your transaction securely. Please check your network and contact support.'
          }));
          triggerToast(
            'Payment Verification Error',
            'Failed to verify your transaction securely. Please contact support.',
            'error'
          );
        });
    } else if (paymentSuccess === 'false') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setVerifyingPayment({
        isOpen: true,
        step: 'failure',
        amount: 199,
        modelName: '',
        gateway: 'Razorpay',
        error: 'The checkout payment was cancelled or failed by the user.'
      });
      triggerToast('Payment Cancelled', 'The checkout payment was cancelled or failed.', 'warning');
    }
  }, [clientId, currentUserName]);

  // Fetch reviews whenever focusedModelId changes to avoid hook cycle crashes
  useEffect(() => {
    if (focusedModelId) {
      dbService.getReviews(focusedModelId).then(setFocusedModelReviews);
    } else {
      setFocusedModelReviews([]);
    }
  }, [focusedModelId]);

  // LOAD COLLECTIONS ON MOUNT & SUBSCRIBE IN REAL-TIME
  useEffect(() => {
    // Models real-time subscription
    const unsubscribeModels = dbService.subscribeToModels((data) => {
      setModels(data);
      setIsLoadingModels(false);
      setSelectedModelForChat(prev => {
        if (prev) {
          const updatedPrev = data.find(m => m.id === prev.id);
          return updatedPrev || prev;
        }
        return data.find(m => m.approved) || data[0];
      });
    });

    // Bookings real-time subscription
    const unsubscribeBookings = dbService.subscribeToBookings((data) => {
      setBookings(data);
    });

    // Payments
    dbService.getPayments().then(setPayments);
    // Unlocked profiles
    setUnlockedProfiles(dbService.getUnlockedProfiles());
    // Favorites (fallback to local; dynamic sync is handled below by a dedicated useEffect)
    const storedFavs = localStorage.getItem('mvi_favs');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
    // Messages
    dbService.getMessages().then(setMessages);

    return () => {
      unsubscribeModels();
      unsubscribeBookings();
    };
  }, []);

  // Synchronize favorites from Supabase profiles table when logged in
  useEffect(() => {
    if (isAuthenticated && clientId && clientId !== 'c_test') {
      dbService.getUserFavorites(clientId).then((fetchedFavs) => {
        if (fetchedFavs) {
          setFavorites(fetchedFavs);
          localStorage.setItem('mvi_favs', JSON.stringify(fetchedFavs));
        }
      });
    } else {
      const storedFavs = localStorage.getItem('mvi_favs');
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      } else {
        setFavorites([]);
      }
    }
  }, [isAuthenticated, clientId]);

  // Listen for tab transitions to smoothly animate viewport using Framer Motion animate
  useEffect(() => {
    if (currentTab === 'models' && !focusedModelId) {
      const timer = setTimeout(() => {
        const element = document.getElementById('marketplace-page');
        if (element) {
          const targetPosition = element.getBoundingClientRect().top + window.scrollY - 80;
          const startPosition = window.scrollY;
          
          animate(startPosition, targetPosition, {
            type: "keyframes",
            duration: 1.2,
            ease: [0.25, 1, 0.5, 1],
            onUpdate: (latestValue) => {
              window.scrollTo(0, latestValue);
            }
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentTab, focusedModelId]);

  // Sync favorites in state
  const handleFavoriteToggle = (modelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let newFavs = [...favorites];
    if (newFavs.includes(modelId)) {
      newFavs = newFavs.filter(id => id !== modelId);
    } else {
      newFavs.push(modelId);
    }
    setFavorites(newFavs);
    localStorage.setItem('mvi_favs', JSON.stringify(newFavs));

    // Synchronize to Supabase profiles table if logged in
    if (isAuthenticated && clientId && clientId !== 'c_test') {
      dbService.saveUserFavorites(clientId, newFavs);
    }
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearchLocation('');
    setSearchCategory('');
    setSearchGender('');
    setSearchAgeRange([18, 40]);
    setSearchHeightClass('');
    setSearchExperience('');
    setSearchBudgetLimit(100000);
    setSearchOnlyVerified(false);
    setSearchAvailableOnly(false);
    setSearchRadius(Infinity);
    setProjectCoords(null);
    setProjectName('');
    setSearchQuery('');
    setSortBy('');
  };

  // FILTERED MODELS CALCULATOR
  const filteredModels = (() => {
    const filtered = models.filter((m) => {
      // 1. Approved state check (admin console controls this, keep basic seeding active)
      // In our marketplace, registered but pending models are seen by admin only, let client see approved models
      if (currentRole !== 'admin' && !m.approved) return false;

      // 2. Hide archived profiles for general public/clients
      if (currentRole !== 'admin' && currentRole !== 'model' && m.archived) return false;

      // 3. Keyword/text search query matching
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.name?.toLowerCase().includes(q);
        const bioMatch = m.biography?.toLowerCase().includes(q);
        const cityMatch = m.city?.toLowerCase().includes(q);
        const stateMatch = m.state?.toLowerCase().includes(q);
        const categoryMatch = m.category?.toLowerCase().includes(q);
        
        if (!nameMatch && !bioMatch && !cityMatch && !stateMatch && !categoryMatch) {
          return false;
        }
      }

      // 4. Filters matching
      if (projectCoords && searchRadius !== Infinity) {
        const modelCoords = getCityCoordinates(m.city);
        if (modelCoords) {
          const distance = calculateHaversineDistance(
            projectCoords.lat,
            projectCoords.lng,
            modelCoords.lat,
            modelCoords.lng
          );
          if (distance > searchRadius) return false;
        }
      } else {
        if (searchLocation && m.city.toLowerCase() !== searchLocation.toLowerCase()) return false;
      }
      if (searchCategory && m.category.toLowerCase() !== searchCategory.toLowerCase()) return false;
      if (searchGender && m.gender !== searchGender) return false;
      if (m.age < searchAgeRange[0] || m.age > searchAgeRange[1]) return false;
      
      if (searchHeightClass) {
        // height format: 5'8" or similar
        const heightInches = parseInt(m.height.replace(/['"]/g, '').split(' ')[0]) || 68; // fallback standard inches 5'8
        if (searchHeightClass === 'petite' && heightInches >= 66) return false; // 5'6 is 66 inches
        if (searchHeightClass === 'medium' && (heightInches < 66 || heightInches > 69)) return false; // 5'6 - 5'9
        if (searchHeightClass === 'tall' && heightInches <= 69) return false; // > 5'9
      }
      if (searchExperience && m.experience !== searchExperience) return false;
      if (m.startingPrice > searchBudgetLimit) return false;
      if (searchOnlyVerified && !m.selfieVerified) return false;
      if (searchAvailableOnly && !m.available) return false;

      return true;
    });

    if (sortBy === 'price_desc') {
      return [...filtered].sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'price_asc') {
      return [...filtered].sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  })();

  const filterKey = `${searchLocation}-${searchCategory}-${searchGender}-${searchAgeRange.join(',')}-${searchHeightClass}-${searchExperience}-${searchBudgetLimit}-${searchOnlyVerified}-${searchAvailableOnly}-${searchRadius}-${searchQuery}-${sortBy}`;

  // BOOKING WIZARD SUBMIT REQUEST
  const handleBookingSubmit = async (bookingData: any) => {
    const freshBooking: Booking = {
      id: `bk_${Date.now()}`,
      clientId,
      clientName: currentUserName || 'Premium Agency (Test Client)',
      modelId: bookingData.modelId,
      modelName: bookingData.modelName,
      modelImage: bookingData.modelImage,
      projectDetails: bookingData.projectDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
      priceAmount: bookingData.priceAmount
    };

    // Stash the pending booking details in localStorage before initiating checkout
    localStorage.setItem('mvi_pending_booking', JSON.stringify(freshBooking));

    triggerToast(
      'Preparing Payment Gateway',
      'Redirecting to secure escrow checkout...',
      'success'
    );

    // Call API to create payment checkout session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke("create-order", {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: {
        model_id: bookingData.modelId,
      },
    });

    if (error) {
      console.error(error);
      throw new Error("Unable to create Razorpay order");
    }

    const order = data;

    // Razorpay checkout
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "ModelVerse India",
      description: "Model Booking",
      handler: async function (response: any) {
        console.log(response);
        // Call your payment verification here
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // SEND MESSAGE CALLBACK IN CHAT PANEL
  const handleSendMessage = (content: string, imageUrl?: string, sendAsModel = false) => {
    if (!chatModelUserId) return;
    const activeModel = models.find(m => m.userId === chatModelUserId);
    if (!activeModel) return;

    const freshMsg: Message = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderId: sendAsModel ? chatModelUserId : clientId,
      receiverId: sendAsModel ? clientId : chatModelUserId,
      content,
      timestamp: new Date().toISOString(),
      imageUrl,
      isRead: false,
      bookingId: bookings.find(b => b.modelId === activeModel.id && b.status === 'pending')?.id
    };

    dbService.addMessage(freshMsg).then(() => {
      dbService.getMessages().then(setMessages);
    });
  };

  // PREMIUM ACCESSIBILITY PAYMENT SUCCESS
  const handlePremiumUnlockSuccess = () => {
    if (!targetModelForPremium) return;
    
    dbService.unlockProfile(targetModelForPremium.id);
    const updatedUnlocked = dbService.getUnlockedProfiles();
    setUnlockedProfiles(updatedUnlocked);

    // Set 5-minute timer countdown
    setActiveChatEndTime(Date.now() + 5 * 60 * 1000);

    // Create system and client initial messages
    const systemMsg: Message = {
      id: `msg_sys_${Date.now()}`,
      senderId: 'system',
      receiverId: clientId,
      content: `🎉 Premium 5-minute Chat Session with ${targetModelForPremium.name} activated! Timer is ticking...`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const clientMsg: Message = {
      id: `msg_client_${Date.now()}`,
      senderId: clientId,
      receiverId: targetModelForPremium.userId,
      content: `Hi ${targetModelForPremium.name}! I've unlocked our secure premium session. Let's connect on our upcoming fashion campaign!`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    dbService.addMessage(systemMsg).then(() => {
      dbService.addMessage(clientMsg).then(() => {
        dbService.getMessages().then(setMessages);
      });
    });

    // Close payment modal
    setShowPremiumModal(false);

    // Redirect to chat tab
    setChatModelUserId(targetModelForPremium.userId);
    setCurrentTab('chat');

    // Create Payment Record log for Invoice matching
    const premiumPayment: PaymentRecord = {
      id: `pay_pre_${Date.now()}`,
      userId: clientId,
      userName: 'Premium Agency (Test Client)',
      userEmail: userEmail,
      amount: premiumPlanType === 'enterprise' ? 4999 : 199,
      paymentGateway: 'Razorpay',
      status: 'success',
      description: premiumPlanType === 'enterprise' 
        ? `Enterprise Grant Account Monthly Unlock` 
        : `Premium Unlock & Chat Session for ${targetModelForPremium.name}`,
      createdAt: new Date().toISOString(),
      invoiceId: `${premiumPlanType === 'enterprise' ? 'MVI-ENT' : 'MVI-PRE'}-${Math.floor(Math.random() * 8000 + 1000)}`
    };

    dbService.addPayment(premiumPayment).then(() => {
      dbService.getPayments().then(setPayments);
    });
  };

  // HANDLER FOR NEW REVIEW TESTIMONIAL SUBMISSION
  const handleReviewSubmit = async (review: Review) => {
    await dbService.addReview(review);
    // Refresh currently focused model's reviews list
    const updatedReviews = await dbService.getReviews(review.modelId);
    setFocusedModelReviews(updatedReviews);
    // Refresh models list to dynamically update ratings, reviewsCount, etc.
    const updatedModels = await dbService.getModels();
    setModels(updatedModels);
  };

  // OPEN ELITE TALENT MODAL POPUP
  const handleOpenEliteModal = () => {
    const elite = models.find(m => m.approved && m.rating >= 4.8) || models.find(m => m.approved) || models[0];
    if (elite) {
      setEliteModelForModal(elite);
      setShowEliteModal(true);
    }
  };

  // TALENT REGISTRATION HANDLER (Become a Model)
  const handleModelRegisterSubmit = (newModel: Model) => {
    // 1. Force state synchronization immediately for instant local responsiveness
    setModels(prev => {
      const filtered = prev.filter(m => m.id !== newModel.id);
      return [...filtered, { ...newModel, approved: true }];
    });
    
    // Set active categories immediately so the profile is listed right away
    setActiveHomeCategory(newModel.category);
    setSearchCategory(newModel.category);

    const applyUpdatedModels = (updatedModels: Model[]) => {
      // Ensure the registered model is definitely included in the final synced list
      const exists = updatedModels.some(m => m.id === newModel.id);
      const finalModels = exists 
        ? updatedModels 
        : [...updatedModels.filter(m => m.id !== newModel.id), { ...newModel, approved: true }];
      
      setModels(finalModels);
      triggerToast(
        'Model Listed!',
        `Successfully registered ${newModel.name} under ${newModel.category}!`,
        'success'
      );
    };

    dbService.saveModel(newModel)
      .then(() => {
        dbService.getModels().then(applyUpdatedModels);
      })
      .catch((err) => {
        console.warn('Firestore registration write failed, loading fallback local copy:', err);
        dbService.getModels().then(applyUpdatedModels);
      });
  };

  // ADMIN DASHBOARD EVENT HANDLERS
  const handleAdminBatchApproveModels = async (modelIds: string[]) => {
    const updatedModels = models.map(m => {
      if (modelIds.includes(m.id)) {
        return { ...m, approved: true };
      }
      return m;
    });
    setModels(updatedModels);

    const promises = updatedModels
      .filter(m => modelIds.includes(m.id))
      .map(m => dbService.saveModel(m));
    
    try {
      await Promise.all(promises);
      
      await dbService.addAuditLog({
        action: 'Batch Registration Approval',
        performedBy: userEmail || 'admin@modelverse.in',
        details: `Batch approved ${modelIds.length} models to the casting registry.`,
        entityType: 'model'
      });

      triggerToast(
        'Batch Approved!',
        `Successfully approved ${modelIds.length} models to the casting registry.`,
        'success'
      );
    } catch (err) {
      console.error('Batch approval background save failed:', err);
    }
  };

  const handleAdminApproveModel = async (modelId: string) => {
    const updatedModels = models.map(m => {
      if (m.id === modelId) {
        return { ...m, approved: true, rejected: false };
      }
      return m;
    });
    setModels(updatedModels);
    
    const target = updatedModels.find(m => m.id === modelId);
    if (target) {
      try {
        await dbService.saveModel(target);
        await dbService.addAuditLog({
          action: 'Registration Approval',
          performedBy: userEmail || 'admin@modelverse.in',
          details: `Approved model profile for "${target.name}".`,
          entityId: modelId,
          entityType: 'model'
        });
      } catch (err) {
        console.error('Failed to save approved model:', err);
      }
    }
  };

  const handleAdminRejectModel = async (modelId: string) => {
    const updatedModels = models.map(m => {
      if (m.id === modelId) {
        return { ...m, approved: false, rejected: true };
      }
      return m;
    });
    setModels(updatedModels);
    
    const target = updatedModels.find(m => m.id === modelId);
    if (target) {
      try {
        await dbService.saveModel(target);
        await dbService.addAuditLog({
          action: 'Registration Revocation',
          performedBy: userEmail || 'admin@modelverse.in',
          details: `Revoked/Rejected model profile for "${target.name}".`,
          entityId: modelId,
          entityType: 'model'
        });
      } catch (err) {
        console.error('Failed to save rejected model:', err);
      }
    }
  };

  const handleAdminSuspendUser = async (userId: string) => {
    console.log('Account status toggle admin level:', userId);
    try {
      const users = await dbService.getUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        const username = user.name;
        const currentStatus = user.status;
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

        await dbService.addAuditLog({
          action: 'User Account Moderation',
          performedBy: userEmail || 'admin@modelverse.in',
          details: `Toggled status of user "${username}" (ID: ${userId}) to "${newStatus.toUpperCase()}".`,
          entityId: userId,
          entityType: 'user'
        });
      }
    } catch (err) {
      console.error('Failed to add user suspend log:', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      await dbService.updateBookingStatus(bookingId, status);
      
      await dbService.addAuditLog({
        action: 'Booking Status Change',
        performedBy: userEmail || 'admin@modelverse.in',
        details: `Booking status for project "${booking.projectDetails.brandName}" (Model: ${booking.modelName}) updated to "${status.toUpperCase()}".`,
        entityId: bookingId,
        entityType: 'booking'
      });
      
      // Reload bookings and payments
      const updatedBookings = await dbService.getBookings();
      setBookings(updatedBookings);
      
      const updatedPayments = await dbService.getPayments();
      setPayments(updatedPayments);

      // Trigger beautiful toast notification
      if (status === 'accepted') {
        triggerToast(
          'Booking Accepted',
          `Booking proposal for ${booking.modelName} (${booking.projectDetails.brandName}) has been accepted. Escrow budget secured.`,
          'success'
        );
      } else if (status === 'rejected') {
        triggerToast(
          'Booking Declined',
          `Booking request for ${booking.modelName} has been declined. Escrow budget returned.`,
          'warning'
        );
      } else if (status === 'completed') {
        triggerToast(
          'Campaign Settled',
          `Escrow payment of ₹${booking.priceAmount.toLocaleString()} has been released to ${booking.modelName}. Campaign successfully completed!`,
          'success'
        );
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      triggerToast('Update Failed', 'An error occurred while updating the booking request.', 'error');
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!userEmail) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        triggerToast('Failed to Send', error.message, 'error');
      } else {
        triggerToast('Verification Sent', 'A verification link has been sent to your email address.', 'success');
      }
    } catch (err: any) {
      triggerToast('Error', err.message || 'Failed to resend verification email', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F2] dark:bg-neutral-950 text-neutral-850 dark:text-neutral-100 font-sans flex flex-col transition-colors duration-200 selection:bg-purple-500/20 dark:selection:bg-purple-500/30 selection:text-neutral-900 dark:selection:text-white">
      
      {/* Dynamic Scroll Progress Bar from useScroll hook */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-600 to-green-500 origin-left z-[100] pointer-events-none" 
        style={{ scaleX }} 
      />

      {/* Dynamic Shooting Stars Background animation */}
      <ShootingStars />
      
      {/* Dynamic sticky header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setFocusedModelId(null);
          setChatModelUserId(null);
        }}
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          // Auto switch tab logic for usability testing
          if (role === 'admin') {
            setCurrentTab('admin');
          } else if (role === 'model') {
            setCurrentTab('agent-dashboard');
          } else {
            setCurrentTab('home');
          }
        }}
        isAuthenticated={isAuthenticated}
        setAuthenticated={setAuthenticated}
        userEmail={userEmail}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isEmailUnverified={isEmailUnverified}
        onResendVerification={handleResendVerificationEmail}
        onChangePassword={handleChangePasswordClick}
      />

      {/* RENDER BODY SCREENS */}
      <main className="flex-1">

        {/* 1. HOMEPAGE */}
        {currentTab === 'home' && !focusedModelId && (
          <div className="animate-fadeIn">
            <Hero
              onSearch={(filters) => {
                if (filters.location) setSearchLocation(filters.location);
                if (filters.category) setSearchCategory(filters.category);
                if (filters.gender) setSearchGender(filters.gender);
                setSearchBudgetLimit(filters.maxBudget);
                setCurrentTab('models');
              }}
              onBrowseClick={handleOpenEliteModal}
              onBecomeModelClick={() => setCurrentTab('become-model')}
              onHireClick={handleOpenEliteModal}
            />
            {/* Categories Bento Grid */}
            <CategoryGrid
              onSelectCategory={(cat) => {
                setSearchCategory(cat);
                setCurrentTab('models');
              }}
            />

            {/* Curated Hot Picks Showcase Section */}
            <section id="homepage-trending" className="py-24 bg-[#FCFBF9] dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 border-b border-black/5 dark:border-white/5">
              <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4 text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono">Top Rated Talent</span>
                    <h3 className="font-sans text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2 mt-1">
                      <Flame className="h-6 w-6 text-pink-600 fill-pink-500 animate-pulse" />
                      <span>Trending Models in India</span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-sans">Discover top-rated fashion profiles, UGC creators, and campaign models with verified portfolios.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (activeHomeCategory !== 'all') {
                        setSearchCategory(activeHomeCategory);
                      } else {
                        setSearchCategory('');
                      }
                      setCurrentTab('models');
                    }}
                    className="text-xs font-black text-purple-650 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline uppercase tracking-wider font-mono cursor-pointer self-start md:self-end"
                  >
                    {activeHomeCategory === 'all' ? 'View All Models' : `View All ${activeHomeCategory}`} &rarr;
                  </button>
                </div>

                {/* Category Navigation Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin select-none">
                  {[
                    { id: 'all', label: 'All Categories' },
                    { id: 'Fashion Models', label: 'Fashion Models' },
                    { id: 'Commercial Models', label: 'Commercial Models' },
                    { id: 'Fitness Models', label: 'Fitness Models' },
                    { id: 'Influencers', label: 'Influencers' },
                    { id: 'UGC Creators', label: 'UGC Creators' },
                    { id: 'Actors', label: 'Actors' },
                    { id: 'Event Hosts', label: 'Event Hosts' },
                    { id: 'Promotional Models', label: 'Promotional Models' },
                    { id: 'Brand Ambassadors', label: 'Brand Ambassadors' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHomeCategory(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        activeHomeCategory === tab.id
                          ? 'bg-[#EA3838] text-white shadow-md shadow-[#EA3838]/20'
                          : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Category Description Banner */}
                <div className="mb-10 bg-neutral-100/60 dark:bg-zinc-900/40 rounded-xl p-4 border border-black/5 dark:border-white/10 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider font-mono">
                      Category Context: {activeHomeCategory === 'all' ? 'Universal Registry' : activeHomeCategory}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {HOME_CATEGORY_DESCRIPTIONS[activeHomeCategory]}
                    </p>
                  </div>
                </div>

                {/* Grid of filtered models */}
                {(() => {
                  const filteredHomeModels = models.filter((m) => {
                    if (!m.approved) return false;
                    if (activeHomeCategory !== 'all' && m.category !== activeHomeCategory) return false;
                    return true;
                  });

                  if (isLoadingModels) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <ModelCardSkeleton key={i} />
                        ))}
                      </div>
                    );
                  }

                  if (filteredHomeModels.length > 0) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredHomeModels.slice(0, 4).map((model) => (
                          <ModelCard
                            key={model.id}
                            model={model}
                            isAuthenticated={isAuthenticated}
                            isLocked={!isAuthenticated || !unlockedProfiles.includes(model.id)}
                            onUnlockClick={(id, e) => {
                              e.stopPropagation();
                              setTargetModelForPremium(model);
                              setShowPremiumModal(true);
                            }}
                            isFavorited={favorites.includes(model.id)}
                            onFavoriteToggle={handleFavoriteToggle}
                            projectCoords={projectCoords}
                            currentRole={currentRole}
                            currentUserId={clientId}
                            onViewProfile={(id) => {
                              setFocusedModelId(id);
                              setCurrentTab('models');
                            }}
                            onBookNow={(id, e) => {
                              e.stopPropagation();
                              if (currentRole === 'model') {
                                if (model.userId === clientId) {
                                  setCurrentTab('become-model');
                                } else {
                                  alert("You are registered as a Model. To book other models, please log in as a Client.");
                                }
                              } else {
                                handleOpenBookingWizard(model);
                              }
                            }}
                          />
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm max-w-md mx-auto">
                      <Sparkles className="h-10 w-10 text-neutral-300 mx-auto mb-3 animate-pulse" />
                      <h4 className="font-sans font-black text-sm text-neutral-800">
                        No {activeHomeCategory} Listed Yet
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                        Be the first premium modeling talent to list under this category in India! Gain direct casting exposure.
                      </p>
                      <button
                        onClick={() => setCurrentTab('become-model')}
                        className="mt-5 rounded-full bg-[#EA3838] text-white px-6 py-2 text-xs font-bold transition hover:bg-[#c02424] shadow-md shadow-[#EA3838]/10 cursor-pointer"
                      >
                        Become a Model
                      </button>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* Verified Agency Testimonial Slider */}
            <TestimonialSlider />
          </div>
        )}

        {/* 2. MODELS MARKETPLACE DIRECTORY */}
        {currentTab === 'models' && !focusedModelId && (
          <div id="marketplace-page" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
            
            {/* If logged in as model and NOT yet registered, show the Apply as Model Form first on top of the center list! */}
            {isAuthenticated && currentRole === 'model' && !models.some(m => m.userId === clientId) && (
              <div className="mb-12 border-b border-neutral-200 dark:border-white/10 pb-10">
                <div className="max-w-4xl mx-auto bg-neutral-950 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EA3838]/15 text-[#EA3838] text-[10px] font-black uppercase tracking-wider font-mono">
                      Action Required
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-2">Apply as a Model</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                      Please complete your professional model registration form first to list yourself in the ModelVerse directory.
                    </p>
                  </div>
                  <BecomeModelForm
                    onRegisterSubmit={handleModelRegisterSubmit}
                    userId={clientId}
                    onViewCategory={(cat) => {
                      setSearchCategory(cat);
                      setActiveHomeCategory(cat);
                    }}
                    onGoHome={() => setCurrentTab('home')}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left filter panels (Hidden on mobile/tablet, shown only on desktop) */}
              <div className="hidden lg:block lg:w-1/4 shrink-0">
                <Filters
                  triggerToast={triggerToast}
                  location={searchLocation}
                  setLocation={setSearchLocation}
                  category={searchCategory}
                  setCategory={setSearchCategory}
                  gender={searchGender}
                  setGender={setSearchGender}
                  ageRange={searchAgeRange}
                  setAgeRange={setSearchAgeRange}
                  heightClass={searchHeightClass}
                  setHeightClass={setSearchHeightClass}
                  experience={searchExperience}
                  setExperience={setSearchExperience}
                  budgetLimit={searchBudgetLimit}
                  setBudgetLimit={setSearchBudgetLimit}
                  onlyVerified={searchOnlyVerified}
                  setOnlyVerified={setSearchOnlyVerified}
                  availableOnly={searchAvailableOnly}
                  setAvailableOnly={setSearchAvailableOnly}
                  onReset={resetFilters}
                  radius={searchRadius}
                  setRadius={setSearchRadius}
                  projectCoords={projectCoords}
                  setProjectCoords={setProjectCoords}
                  projectName={projectName}
                  setProjectName={setProjectName}
                />
              </div>

              {/* Right list cards */}
              <div className="flex-1 space-y-6">
                {/* Search Bar & Recent Searches */}
                <div id="model-keyword-search" className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-white/10 p-5 shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search models by name, category, city, bio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveSearchQuery(searchQuery);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-purple-500 shadow-inner"
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => saveSearchQuery(searchQuery)}
                        className="px-5 py-2.5 rounded-2xl bg-neutral-950 dark:bg-neutral-800 text-white dark:text-neutral-100 hover:bg-black dark:hover:bg-neutral-700 text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        Search
                      </button>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-3 py-2.5 rounded-2xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-500 dark:text-neutral-400 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="text-neutral-400 font-bold uppercase font-mono tracking-wider">Recent Searches:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((query, index) => (
                          <div
                            key={index}
                            onClick={() => setSearchQuery(query)}
                            className="group flex items-center space-x-1.5 px-3 py-1 bg-neutral-50 dark:bg-neutral-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-neutral-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-800 rounded-full cursor-pointer transition text-neutral-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-400 font-bold active:scale-95 select-none animate-fadeIn"
                          >
                            <span>{query}</span>
                            <button
                              type="button"
                              onClick={(e) => deleteRecentSearch(query, e)}
                              className="text-neutral-400 dark:text-neutral-500 hover:text-rose-500 dark:hover:text-rose-450 transition-colors p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              title="Remove search"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('mvi_recent_searches');
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer ml-auto"
                      >
                        Clear History
                      </button>
                    </div>
                  )}

                  {/* Quick Select Popular Preset Filters */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-white/5">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
                      <div className="shrink-0 flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-neutral-400 dark:text-neutral-500 font-mono pr-2.5 border-r border-neutral-200 dark:border-white/10 mr-1.5">
                        <SlidersHorizontal className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        <span>Quick Presets:</span>
                      </div>
                      
                      {/* Selfie Verified */}
                      <button
                        type="button"
                        onClick={() => setSearchOnlyVerified(!searchOnlyVerified)}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          searchOnlyVerified
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-emerald-600 border-neutral-200 dark:border-white/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Selfie Verified</span>
                      </button>

                      {/* Available Now */}
                      <button
                        type="button"
                        onClick={() => setSearchAvailableOnly(!searchAvailableOnly)}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          searchAvailableOnly
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-amber-600 border-neutral-200 dark:border-white/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Available Now</span>
                      </button>

                      {/* Most Expensive / Elite Day Rate */}
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'price_desc') {
                            setSortBy('');
                          } else {
                            setSortBy('price_desc');
                            setSearchBudgetLimit(100000);
                          }
                        }}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          sortBy === 'price_desc'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-purple-600 border-neutral-200 dark:border-white/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Most Expensive</span>
                      </button>

                      {/* Top Rated */}
                      <button
                        type="button"
                        onClick={() => setSortBy(sortBy === 'rating' ? '' : 'rating')}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          sortBy === 'rating'
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm font-black'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-amber-600 border-neutral-200 dark:border-white/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>Top Rated</span>
                      </button>

                      {/* Fashion Runway */}
                      <button
                        type="button"
                        onClick={() => setSearchCategory(searchCategory === 'Fashion Models' ? '' : 'Fashion Models')}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          searchCategory === 'Fashion Models'
                            ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-pink-600 border-neutral-200 dark:border-white/10 hover:bg-pink-50/50 dark:hover:bg-pink-950/20'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Fashion Runway</span>
                      </button>

                      {/* Fresh Faces */}
                      <button
                        type="button"
                        onClick={() => setSearchExperience(searchExperience === 'Fresh Face' ? '' : 'Fresh Face')}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          searchExperience === 'Fresh Face'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-orange-600 border-neutral-200 dark:border-white/10 hover:bg-orange-50/50 dark:hover:bg-orange-950/20'
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>Fresh Faces</span>
                      </button>

                      {/* Budget (Under 40k) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (searchBudgetLimit === 40000 && sortBy === 'price_asc') {
                            setSearchBudgetLimit(100000);
                            setSortBy('');
                          } else {
                            setSearchBudgetLimit(40000);
                            setSortBy('price_asc');
                          }
                        }}
                        className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition duration-200 cursor-pointer active:scale-95 select-none ${
                          searchBudgetLimit === 40000 && sortBy === 'price_asc'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-blue-600 border-neutral-200 dark:border-white/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Budget (Under 40K)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
                    Showing {filteredModels.length} Premium results found
                  </span>
                  
                  {/* Status checklist if search matches */}
                  {searchCategory && (
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 px-3.5 py-1.5 rounded-full font-mono">
                      Category: {searchCategory}
                    </span>
                  )}
                </div>

                {isLoadingModels ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <ModelCardSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredModels.length === 0 ? (
                  <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm">
                    <ShieldAlert className="h-10 w-10 text-neutral-400 dark:text-neutral-500 mx-auto" />
                    <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-200 mt-4 font-sans">No matching model profiles found</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Try resetting details layout or loosening budget rate metrics.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-6 text-xs font-black hover:brightness-110 shadow transition cursor-pointer"
                    >
                      Reset Casting Filters
                    </button>
                  </div>
                ) : (
                  <motion.div
                    key={filterKey}
                    variants={marketplaceGridVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredModels.map((model) => (
                      <motion.div key={model.id} variants={marketplaceItemVariants}>
                        <ModelCard
                          model={model}
                          isAuthenticated={isAuthenticated}
                          isLocked={!isAuthenticated || !unlockedProfiles.includes(model.id)}
                          onUnlockClick={(id, e) => {
                            e.stopPropagation();
                            setTargetModelForPremium(model);
                            setShowPremiumModal(true);
                          }}
                          isFavorited={favorites.includes(model.id)}
                          onFavoriteToggle={handleFavoriteToggle}
                          onViewProfile={setFocusedModelId}
                          projectCoords={projectCoords}
                          currentRole={currentRole}
                          currentUserId={clientId}
                          onBookNow={(id, e) => {
                            e.stopPropagation();
                            if (currentRole === 'model') {
                              if (model.userId === clientId) {
                                setCurrentTab('become-model');
                              } else {
                                alert("You are registered as a Model. To book other models, please log in as a Client.");
                              }
                            } else {
                              handleOpenBookingWizard(model);
                            }
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Persistent mobile-optimized floating action trigger */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white rounded-full px-5 py-3 shadow-xl border border-white/10 text-xs font-black uppercase tracking-widest cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {(() => {
                  let count = 0;
                  if (searchLocation) count++;
                  if (searchCategory && searchCategory !== 'all') count++;
                  if (searchGender && searchGender !== 'all') count++;
                  if (searchHeightClass) count++;
                  if (searchExperience) count++;
                  if (searchBudgetLimit < 150000) count++;
                  if (searchOnlyVerified) count++;
                  if (searchAvailableOnly) count++;
                  if (searchRadius && searchRadius !== Infinity) count++;
                  return count > 0 ? (
                    <span className="flex items-center justify-center bg-white text-purple-700 font-bold rounded-full w-4.5 h-4.5 text-[9px] scale-110 font-mono">
                      {count}
                    </span>
                  ) : null;
                })()}
              </motion.button>
            </div>

            {/* Mobile Bottom Sheet Overlay & Drawer container */}
            <AnimatePresence>
              {isMobileFiltersOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
                  />

                  {/* Drawer */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-[32px] border-t border-neutral-200 dark:border-white/10 z-50 flex flex-col shadow-2xl lg:hidden overflow-hidden"
                  >
                    {/* Grab-bar handle */}
                    <div className="w-12 h-1.5 bg-neutral-350 dark:bg-neutral-750/80 rounded-full mx-auto mt-3.5 mb-1 cursor-grab" onClick={() => setIsMobileFiltersOpen(false)} />

                    {/* Header */}
                    <div className="px-6 py-3 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                      <div>
                        <h3 className="font-sans text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <span>Refine Cast</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 font-mono px-2 py-0.5 rounded-full font-black">
                            {filteredModels.length} active
                          </span>
                        </h3>
                        <p className="text-[9px] text-neutral-400">Apply location, budget, and category metrics.</p>
                      </div>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="p-1.5 bg-neutral-100 dark:bg-white/5 rounded-full text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Scrollable Filters Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      {/* Mobile Sheet Quick Presets Section */}
                      <div className="space-y-2 border-b border-neutral-150 dark:border-white/5 pb-4">
                        <label className="block text-[10px] uppercase font-black tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                          ⚡ Quick Select Presets
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Selfie Verified */}
                          <button
                            type="button"
                            onClick={() => setSearchOnlyVerified(!searchOnlyVerified)}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              searchOnlyVerified
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-emerald-600 border-neutral-200 dark:border-white/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="truncate">Selfie Verified</span>
                          </button>

                          {/* Available Now */}
                          <button
                            type="button"
                            onClick={() => setSearchAvailableOnly(!searchAvailableOnly)}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              searchAvailableOnly
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-amber-600 border-neutral-200 dark:border-white/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                            }`}
                          >
                            <Clock className="h-4 w-4" />
                            <span className="truncate">Available Now</span>
                          </button>

                          {/* Most Expensive */}
                          <button
                            type="button"
                            onClick={() => {
                              if (sortBy === 'price_desc') {
                                setSortBy('');
                              } else {
                                setSortBy('price_desc');
                                setSearchBudgetLimit(100000);
                              }
                            }}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              sortBy === 'price_desc'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-purple-600 border-neutral-200 dark:border-white/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                            }`}
                          >
                            <DollarSign className="h-4 w-4" />
                            <span className="truncate">Most Expensive</span>
                          </button>

                          {/* Top Rated */}
                          <button
                            type="button"
                            onClick={() => setSortBy(sortBy === 'rating' ? '' : 'rating')}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              sortBy === 'rating'
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm font-black'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-amber-600 border-neutral-200 dark:border-white/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                            }`}
                          >
                            <Star className="h-4 w-4 fill-current" />
                            <span className="truncate">Top Rated</span>
                          </button>

                          {/* Fashion Runway */}
                          <button
                            type="button"
                            onClick={() => setSearchCategory(searchCategory === 'Fashion Models' ? '' : 'Fashion Models')}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              searchCategory === 'Fashion Models'
                                ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-pink-600 border-neutral-200 dark:border-white/10 hover:bg-pink-50/50 dark:hover:bg-pink-950/20'
                            }`}
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="truncate">Fashion Runway</span>
                          </button>

                          {/* Fresh Faces */}
                          <button
                            type="button"
                            onClick={() => setSearchExperience(searchExperience === 'Fresh Face' ? '' : 'Fresh Face')}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              searchExperience === 'Fresh Face'
                                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-orange-600 border-neutral-200 dark:border-white/10 hover:bg-orange-50/50 dark:hover:bg-orange-950/20'
                            }`}
                          >
                            <Flame className="h-4 w-4" />
                            <span className="truncate">Fresh Faces</span>
                          </button>

                          {/* Budget Friendly */}
                          <button
                            type="button"
                            onClick={() => {
                              if (searchBudgetLimit === 40000 && sortBy === 'price_asc') {
                                setSearchBudgetLimit(100000);
                                setSortBy('');
                              } else {
                                setSearchBudgetLimit(40000);
                                setSortBy('price_asc');
                              }
                            }}
                            className={`flex items-center space-x-2 p-2.5 rounded-xl border text-[11px] font-bold transition duration-150 cursor-pointer active:scale-95 select-none ${
                              searchBudgetLimit === 40000 && sortBy === 'price_asc'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-blue-600 border-neutral-200 dark:border-white/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                            }`}
                          >
                            <DollarSign className="h-4 w-4" />
                            <span className="truncate">Under 40K</span>
                          </button>
                        </div>
                      </div>

                      <Filters
                        triggerToast={triggerToast}
                        location={searchLocation}
                        setLocation={setSearchLocation}
                        category={searchCategory}
                        setCategory={setSearchCategory}
                        gender={searchGender}
                        setGender={setSearchGender}
                        ageRange={searchAgeRange}
                        setAgeRange={setSearchAgeRange}
                        heightClass={searchHeightClass}
                        setHeightClass={setSearchHeightClass}
                        experience={searchExperience}
                        setExperience={setSearchExperience}
                        budgetLimit={searchBudgetLimit}
                        setBudgetLimit={setSearchBudgetLimit}
                        onlyVerified={searchOnlyVerified}
                        setOnlyVerified={setSearchOnlyVerified}
                        availableOnly={searchAvailableOnly}
                        setAvailableOnly={setSearchAvailableOnly}
                        onReset={resetFilters}
                        radius={searchRadius}
                        setRadius={setSearchRadius}
                        projectCoords={projectCoords}
                        setProjectCoords={setProjectCoords}
                        projectName={projectName}
                        setProjectName={setProjectName}
                      />
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-200/50 dark:border-white/5 flex gap-3.5">
                      <button
                        onClick={() => {
                          resetFilters();
                        }}
                        className="flex-1 rounded-2xl border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 py-3 text-xs font-black uppercase tracking-wider cursor-pointer transition active:scale-98"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-purple-500/20 transition active:scale-98"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* 3. MODEL PROFILE PAGE (FOCUSED DETAIL) */}
        {currentTab === 'models' && focusedModelId && focusedModel && (
          <ProfileView
            model={focusedModel}
            reviews={focusedModelReviews}
            isLocked={!isAuthenticated || !unlockedProfiles.includes(focusedModel.id)}
            isFavorited={favorites.includes(focusedModel.id)}
            onFavoriteToggle={handleFavoriteToggle}
            onBookNow={() => {
              handleOpenBookingWizard(focusedModel);
            }}
            onUnlockClick={() => {
              setTargetModelForPremium(focusedModel);
              setShowPremiumModal(true);
            }}
            onBack={() => setFocusedModelId(null)}
            onGoHome={() => {
              setFocusedModelId(null);
              setCurrentTab('home');
            }}
            onStartChat={(modelUserId) => {
              setChatModelUserId(modelUserId);
              setCurrentTab('chat');
            }}
            onReviewSubmit={handleReviewSubmit}
            isAuthenticated={isAuthenticated}
            currentRole={currentRole}
            currentUserId={clientId}
            currentUserName={currentUserName}
          />
        )}

        {/* 4. CHAT MESSAGING PORTAL */}
        {currentTab === 'chat' && chatModelUserId && (
          (() => {
            const activeModel = models.find(m => m.userId === chatModelUserId);
            if (!activeModel) {
              setCurrentTab('home');
              return null;
            }

            const activeBooking = bookings.find(b => b.modelId === activeModel.id && b.status === 'pending');
            // Filter conversations for the specific model
            const conversationMsgs = messages.filter(
              m => (m.senderId === clientId && m.receiverId === chatModelUserId) ||
                   (m.senderId === chatModelUserId && m.receiverId === clientId) ||
                   (m.senderId === 'system' && m.receiverId === clientId && m.bookingId === activeBooking?.id)
            );

            return (
              <div className="py-10 px-4">
                <ChatWindow
                  model={activeModel}
                  messages={conversationMsgs}
                  clientId={clientId}
                  onSendMessage={handleSendMessage}
                  bookingRef={activeBooking}
                  activeChatEndTime={activeChatEndTime}
                />
              </div>
            );
          })()
        )}

        {/* 5. BECOME A MODEL FORM */}
        {currentTab === 'become-model' && (
          !isAuthenticated ? (
            <div className="py-24 max-w-xl mx-auto px-6 text-center space-y-6 animate-fadeIn">
              <div className="inline-flex p-4 rounded-full bg-pink-50 text-pink-500 border border-pink-100 shadow-sm">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Onboard as Certified Model</h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
                Join India's most secure modeling node. To build your verified campaign portfolio, please log in or sign up as a certified Model.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setAuthRoleHint('model');
                    setCurrentTab('auth');
                  }}
                  className="inline-flex items-center space-x-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white px-8 py-3.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <span>Sign Up / Log In as Model</span>
                </button>
              </div>
            </div>
          ) : currentRole !== 'model' ? (
            <div className="py-24 max-w-xl mx-auto px-6 text-center space-y-6 animate-fadeIn">
              <div className="inline-flex p-4 rounded-full bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
                <UserIcon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Access Restricted</h2>
              <p className="text-neutral-500 max-w-md mx-auto text-sm leading-relaxed">
                You are currently logged in with a <strong className="text-purple-750 font-bold capitalize">{currentRole}</strong> account. The onboarding application is only open for certified Model accounts.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setAuthRoleHint('model');
                    setAuthenticated(false); // logs out and goes to auth tab
                    setTimeout(() => {
                      setCurrentTab('auth');
                      setAuthRoleHint('model');
                    }, 100);
                  }}
                  className="inline-flex items-center space-x-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  <span>Switch to Model Account</span>
                </button>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="inline-flex items-center space-x-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3 text-xs font-bold transition cursor-pointer"
                >
                  <span>Return Home</span>
                </button>
              </div>
            </div>
          ) : (
             <BecomeModelForm
              onRegisterSubmit={handleModelRegisterSubmit}
              userId={clientId}
              initialModel={models.find((m) => m.userId === clientId)}
              onViewCategory={(cat) => {
                setSearchCategory(cat);
                setActiveHomeCategory(cat);
                setCurrentTab('models');
              }}
              onGoHome={() => setCurrentTab('home')}
            />
          )
        )}

        {/* 6. SUBSCRIPTIONS & PRICING PLANS */}
        {currentTab === 'pricing' && (
          <div className="mx-auto max-w-7xl py-16 px-4 text-center text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-white/5 rounded-full px-3 py-1.5 border border-[#D4AF37]/30">
              Pricing Options
            </span>
            <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-4">
              Transparent Casting Rates
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 leading-normal font-normal mb-8">
              Zero listing markup. We host verified talents directly with only client unlock premium tiers to prevent casting spam.
            </p>

            {/* Custom Model Selector */}
            <div className="mb-8 max-w-xl mx-auto text-left bg-[#121212] border border-white/10 p-5 rounded-2xl shadow-xl">
              <label className="block text-[11px] font-black text-[#D4AF37] uppercase tracking-wider mb-2 font-mono">
                Select Model for Premium / Enterprise Unlock
              </label>
              <select
                value={selectedModelForChat?.id || ''}
                onChange={(e) => {
                  const found = models.find(m => m.id === e.target.value);
                  if (found) {
                    setSelectedModelForChat(found);
                  }
                }}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id} className="bg-zinc-950 text-white">
                    {m.name} ({m.city} • {m.category})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-500 mt-2 font-normal leading-normal">
                Choose any registered talent from our verified index to customize your campaign unlocks.
              </p>
            </div>

            {selectedModelForChat && (
              <div className="mb-8 p-4 bg-zinc-900/60 border border-[#D4AF37]/30 rounded-2xl max-w-xl mx-auto flex items-center justify-between animate-fadeIn text-left mt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedModelForChat.portfolio[0]}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <p className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider font-bold">Selected Model for Chat</p>
                    <h4 className="text-sm font-black text-white">{selectedModelForChat.name}</h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/20">Active Selection</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 text-left">
              
              {/* Premium unlock description */}
              <div className="rounded-3xl border border-white/5 bg-[#121212] p-8 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-sans text-lg font-bold text-white">Premium Talent Unlock</h3>
                    <span className="text-[9px] uppercase font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 rounded-full px-2.5 py-0.5 border border-[#D4AF37]/20">Custom Option</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Access complete physical comp card measurements and registered booking agency references for your shortlisted model. Includes dedicated chat protocol features.
                  </p>
                  <p className="text-3xl font-black text-[#D4AF37] mt-6 font-sans">₹199 <span className="text-xs font-normal text-zinc-500 font-sans">/ per model</span></p>
                </div>
                <button
                  onClick={() => {
                    const target = selectedModelForChat || models.find(m => m.approved) || models[0];
                    if (target) {
                      setPremiumPlanType('premium');
                      setTargetModelForPremium(target);
                      setShowPremiumModal(true);
                    }
                  }}
                  className="mt-8 w-full py-3 px-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black text-xs font-black shadow text-center hover:brightness-110 transition cursor-pointer"
                >
                  {selectedModelForChat ? `Unlock Chat with ${selectedModelForChat.name} (₹199)` : "Choose Talent & Unlock"}
                </button>
              </div>

              {/* Enterprise Agency Account */}
              <div className="rounded-3xl border border-white/5 bg-[#121212] text-white p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-[#D4AF37]/10 blur-xl" />
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-sans text-lg font-bold text-white">Enterprise Grant Account</h3>
                    <span className="text-[9px] uppercase font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 rounded-full px-2.5 py-0.5 border border-[#D4AF37]/20">SaaS Agency</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Designed for heavy couture designers, cosmetic brands, and modeling agencies across Mumbai & Delhi. Unlimited talent unlock accesses, direct GST business tax invoice generator, and prioritized casting coordinator assistance.
                  </p>
                  <p className="text-3xl font-black text-[#D4AF37] mt-6">₹4,999 <span className="text-xs font-normal text-zinc-500">/ monthly</span></p>
                </div>
                <button
                  onClick={() => {
                    const target = selectedModelForChat || models.find(m => m.approved) || models[0];
                    if (target) {
                      setPremiumPlanType('enterprise');
                      setTargetModelForPremium(target);
                      setShowPremiumModal(true);
                    }
                  }}
                  className="mt-8 w-full py-3 px-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black text-xs font-black shadow text-center transition hover:brightness-110 cursor-pointer"
                >
                  {selectedModelForChat ? `Enterprise Unlock with ${selectedModelForChat.name} (₹4,999)` : "Get Enterprise Grant Account"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 7. BLOG SPACE */}
        {currentTab === 'blog' && (
          <BlogSection />
        )}

        {/* 8. ABOUT US SCREEN */}
        {currentTab === 'about' && (
          <AboutContact type="about" />
        )}

        {/* 9. CONTACT SUPPORT SCREEN */}
        {currentTab === 'contact' && (
          <AboutContact type="contact" />
        )}

        {/* AI CREATIVE LAB */}
        {currentTab === 'ai-studio' && (
          <AICreativeStudio userEmail={userEmail} triggerToast={triggerToast} />
        )}

        {/* AGENT DASHBOARD VIEW */}
        {currentTab === 'agent-dashboard' && (
          <AgentDashboard
            models={models}
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateModel={(updatedModel) => {
              setModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m));
            }}
            triggerToast={triggerToast}
            onUpdateBooking={(updatedBk) => {
              setBookings(prev => prev.map(b => b.id === updatedBk.id ? updatedBk : b));
            }}
          />
        )}

        {/* CLIENT DASHBOARD VIEW */}
        {currentTab === 'client-dashboard' && (
          <ClientDashboard
            bookings={bookings}
            models={models}
            clientId={clientId}
            triggerToast={triggerToast}
          />
        )}

        {/* 10. ADMIN DASHBOARD VIEW */}
        {currentTab === 'admin' && (
          <AdminDashboard
            models={models}
            bookings={bookings}
            payments={payments}
            onApproveModel={handleAdminApproveModel}
            onRejectModel={handleAdminRejectModel}
            onSuspendUser={handleAdminSuspendUser}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onBatchApproveModels={handleAdminBatchApproveModels}
            onImpersonateUser={(user: any) => {
              handleAuthSuccess(user, user.role);
            }}
          />
        )}

        {/* 11. DYNAMIC AUTH (LOGIN & SIGNUP) VIEW */}
        {currentTab === 'auth' && (
          <AuthView
            onAuthSuccess={(user, role) => {
              handleAuthSuccess(user, role);
              setAuthRoleHint('client'); // reset to default after success
            }}
            onCancel={() => {
              setCurrentTab('home');
              setAuthRoleHint('client'); // reset on cancel
            }}
            initialRole={authRoleHint}
            initialTab={authTabHint}
            initialEmail={authEmailHint}
          />
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-white/5 bg-[#090909] py-16 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 space-y-4 md:space-y-0 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="font-extrabold text-white font-mono tracking-wider text-sm flex items-center gap-1.5">
              <span className="text-[#D4AF37]">MODEL</span>VERSE
            </span>
            <p className="text-zinc-500 text-[11px] max-w-xs leading-normal">Premium model discovery & secure contract escrow operations.</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 font-semibold text-zinc-400">
            <button onClick={() => setCurrentTab('about')} className="hover:text-[#D4AF37] transition cursor-pointer">About Us</button>
            <button onClick={() => setCurrentTab('pricing')} className="hover:text-[#D4AF37] transition cursor-pointer">Escrow Rates</button>
            <button onClick={() => setCurrentTab('blog')} className="hover:text-[#D4AF37] transition cursor-pointer">Casting Blog</button>
            
            {/* Contact Support Button - Relocated from Navbar */}
            <button
              onClick={() => setCurrentTab('contact')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border transition cursor-pointer text-xs font-bold ${
                currentTab === 'contact'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-white/5 border-white/10 text-[#D4AF37] hover:bg-white/10 hover:text-white'
              }`}
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Contact & Support</span>
            </button>

            {/* Dark & Light Mode Button - Relocated from Navbar */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Ad Banner Restorer */}
            {!showAdBanner && (
              <button
                onClick={() => {
                  setShowAdBanner(true);
                  localStorage.removeItem('ad_banner_dismissed');
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition cursor-pointer"
                title="Show sponsor campaign banner"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>View Sponsor Deals</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end font-medium text-zinc-500 space-y-1">
            <p className="text-[10px]">© 2026 ModelVerse India Inc. All Rights Reserved.</p>
            <p className="text-[8px] font-mono tracking-widest text-[#D4AF37] mt-1 uppercase">PROUDLY CASTED IN MUMBAI & DELHI</p>
          </div>
        </div>
      </footer>

      {/* GLOBAL MODALS AND OVERLAYS PORTALS */}
      {showEliteModal && eliteModelForModal && (
        <div id="elite-talent-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#121212] text-white shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-5 bg-[#0a0a0a]">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="font-sans text-lg font-black tracking-tight text-white">Elite Shortlisted Talent</h3>
              </div>
              <button
                onClick={() => {
                  setShowEliteModal(false);
                  setEliteModelForModal(null);
                }}
                className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Photo */}
                <div className="w-full sm:w-1/2 h-64 rounded-2xl overflow-hidden border border-white/10 relative shrink-0">
                  <img
                    src={eliteModelForModal.portfolio[0]}
                    alt={eliteModelForModal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 text-[#D4AF37] font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold">
                    Elite Tier
                  </div>
                </div>

                {/* Main Stats */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-white leading-tight">{eliteModelForModal.name}</h4>
                    <span className="inline-block mt-1 text-xs text-zinc-400 font-medium font-sans">
                      {eliteModelForModal.category}
                    </span>
                    <div className="mt-2 flex items-center space-x-1.5 text-xs text-zinc-500">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{eliteModelForModal.city}, {eliteModelForModal.state}</span>
                    </div>
                  </div>

                  {/* Star Rating & Verified */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-6 items-center space-x-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 text-[11px] font-bold text-amber-400">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{eliteModelForModal.rating}</span>
                    </div>
                    {eliteModelForModal.approved && (
                      <span className="flex h-6 items-center space-x-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wide">
                        Verified Profile
                      </span>
                    )}
                  </div>

                  {/* Core specs */}
                  <div className="grid grid-cols-3 gap-1.5 border-y border-white/5 py-3 text-center text-[10px] font-mono font-bold uppercase text-zinc-400">
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-sans mb-0.5">Height</span>
                      <span className="text-white">{eliteModelForModal.height}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-sans mb-0.5">Age</span>
                      <span className="text-white">{eliteModelForModal.age} yrs</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-sans mb-0.5">Experience</span>
                      <span className="text-white">{eliteModelForModal.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate & details info banner */}
              <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Daily Shoot Budget</span>
                  <p className="text-lg font-black text-white mt-0.5 font-sans">
                    ₹{eliteModelForModal.startingPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-zinc-500 font-sans">/ day</span>
                  </p>
                </div>
                <div className="text-right text-[10px] text-zinc-400 leading-relaxed font-sans max-w-[200px]">
                  Includes standard digital media usage & full agency licensing references.
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="border-t border-white/5 p-5 bg-[#0a0a0a] flex gap-3">
              {/* Book Session button */}
              <button
                id="modal-elite-book-btn"
                onClick={() => {
                  if (eliteModelForModal) {
                    handleOpenBookingWizard(eliteModelForModal);
                  }
                  setShowEliteModal(false);
                }}
                className="flex-1 py-3 px-5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-xs font-black uppercase tracking-wider transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Session</span>
              </button>

              {/* Chat button */}
              <button
                id="modal-elite-chat-btn"
                onClick={() => {
                  setSelectedModelForChat(eliteModelForModal);
                  setCurrentTab('pricing');
                  setShowEliteModal(false);
                }}
                className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-purple-650 to-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {targetModelForPremium && (
        <PremiumUnlockModal
          model={targetModelForPremium}
          isOpen={showPremiumModal}
          planType={premiumPlanType}
          userId={clientId}
          userName={currentUserName}
          userEmail={userEmail}
          onClose={() => {
            setShowPremiumModal(false);
            setTargetModelForPremium(null);
          }}
          onSuccessUnlock={handlePremiumUnlockSuccess}
        />
      )}

      {/* LOTTIE-STYLE SMOOTH PAYMENT VERIFICATION OVERLAY (SUCCESS & FAILURE STATE ANIMATIONS) */}
      {verifyingPayment.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
            {verifyingPayment.step === 'verifying' && (
              <div className="flex flex-col items-center py-6">
                <div className="relative flex items-center justify-center h-20 w-20 mb-6">
                  <div className="absolute inset-0 border-4 border-purple-100 dark:border-purple-900/30 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-650 rounded-full animate-spin" />
                </div>
                <h3 className="font-sans text-lg font-black text-neutral-800 dark:text-neutral-100">Verifying Payment...</h3>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-bold font-mono tracking-wider uppercase mt-1 animate-pulse font-sans">Contacting Bank Gateway</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 max-w-xs leading-relaxed font-sans">
                  Verifying transaction state with {verifyingPayment.gateway} secure ledger. Please do not refresh or navigate away.
                </p>
              </div>
            )}

            {verifyingPayment.step === 'success' && (
              <div className="flex flex-col items-center py-4">
                {/* Lottie-style path-drawing checkmark */}
                <div className="relative flex items-center justify-center h-24 w-24 mb-4">
                  <motion.div 
                    className="absolute inset-0 bg-emerald-100 dark:bg-emerald-950/40 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <svg className="h-20 w-20 text-emerald-500 relative z-10" viewBox="0 0 52 52" fill="none">
                    <motion.circle 
                      cx="26" 
                      cy="26" 
                      r="23" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      initial={{ pathLength: 0, scale: 0.8, rotate: -90 }}
                      animate={{ pathLength: 1, scale: 1, rotate: 0 }}
                      transition={{ 
                        pathLength: { duration: 0.8, ease: "easeOut" },
                        scale: { type: "spring", stiffness: 120, damping: 10 }
                      }}
                    />
                    <motion.path 
                      d="M16 27l7 7 13.5-13.5" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                    />
                  </svg>
                </div>

                <h3 className="font-sans text-xl font-black text-neutral-900 dark:text-neutral-50">Transaction Secure!</h3>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold font-mono mt-1 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-mono">
                  REF: {verifyingPayment.invoiceId}
                </p>

                <p className="text-xs text-neutral-550 dark:text-neutral-400 mt-4 leading-relaxed max-w-sm font-sans">
                  We successfully received your payment of <strong className="text-neutral-800 dark:text-white font-bold font-sans">₹{verifyingPayment.amount.toLocaleString()}</strong>. Access to {verifyingPayment.modelName ? `${verifyingPayment.modelName}'s measurements & live premium chat` : 'the selected premium license'} is now fully unlocked!
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyingPayment(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="mt-6 w-full py-3 px-6 rounded-full bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer font-sans"
                >
                  Proceed to Unlocked Profile
                </button>
              </div>
            )}

            {verifyingPayment.step === 'failure' && (
              <div className="flex flex-col items-center py-4">
                {/* Lottie-style path-drawing cross */}
                <div className="relative flex items-center justify-center h-24 w-24 mb-4">
                  <motion.div 
                    className="absolute inset-0 bg-rose-100 dark:bg-rose-950/40 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <svg className="h-20 w-20 text-rose-500 relative z-10" viewBox="0 0 52 52" fill="none">
                    <motion.circle 
                      cx="26" 
                      cy="26" 
                      r="23" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      initial={{ pathLength: 0, scale: 0.8 }}
                      animate={{ pathLength: 1, scale: 1 }}
                      transition={{ 
                        pathLength: { duration: 0.8, ease: "easeOut" },
                        scale: { type: "spring", stiffness: 120, damping: 10 }
                      }}
                    />
                    <motion.path 
                      d="M17 17l18 18M35 17L17 35" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                    />
                  </svg>
                </div>

                <h3 className="font-sans text-xl font-black text-rose-600 dark:text-rose-500">Transaction Failed</h3>
                <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold font-mono mt-1 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/40 font-mono">
                  Verification Declined
                </p>

                <p className="text-xs text-neutral-550 dark:text-neutral-400 mt-4 leading-relaxed max-w-sm font-sans">
                  {verifyingPayment.error || 'The banking networks declined the request. Please verify your account balance and credentials, and try again.'}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyingPayment(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="mt-6 w-full py-3 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer font-sans"
                >
                  Close & Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMockCheckout && mockCheckoutData && (
        <MockCheckout
          gateway={mockCheckoutData.gateway}
          planType={mockCheckoutData.planType}
          amount={mockCheckoutData.amount}
          modelId={mockCheckoutData.modelId}
          modelName={mockCheckoutData.modelName}
          userName={mockCheckoutData.userName}
          userEmail={mockCheckoutData.userEmail}
          onCancel={() => {
            setShowMockCheckout(false);
            setMockCheckoutData(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      )}

      {targetModelForBooking && (
        isBookingWizardLoading ? (
          <BookingWizardSkeleton
            isOpen={showBookingWizard}
            onClose={() => {
              setShowBookingWizard(false);
              setTargetModelForBooking(null);
            }}
            modelName={targetModelForBooking.name}
          />
        ) : (
          <BookingWizard
            model={targetModelForBooking}
            isOpen={showBookingWizard}
            onClose={() => {
              setShowBookingWizard(false);
              setTargetModelForBooking(null);
            }}
            onSubmitBooking={handleBookingSubmit}
            clientName="Premium Agency (Test Client)"
          />
        )
      )}

      {/* Floating Action Buttons Column (Bottom Right) */}
      <div className={`fixed transition-all duration-300 ${showAdBanner ? 'bottom-[120px] md:bottom-[84px]' : 'bottom-6'} right-6 z-40 flex flex-col items-center space-y-3`}>
        {/* Floating Instagram Action Button */}
        <div className="group flex items-center space-x-2">
          <a
            href="https://www.instagram.com/model_verse_india?igsh=MWdhdzU0bThua2ZsNA=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg transition duration-300 hover:scale-105 active:scale-95 focus:outline-none relative group ring-4 ring-white/10"
            id="instagram-action-btn"
          >
            <Instagram className="h-5 w-5" />
            
            {/* Elegant Tooltip pill that expands on hover */}
            <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all origin-right duration-200 bg-neutral-950 border border-neutral-800 text-white rounded-2xl px-3 py-2 text-[11px] font-black tracking-wide whitespace-nowrap shadow-xl flex items-center space-x-1.5 opacity-0 group-hover:opacity-100">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="font-sans text-neutral-200">Instagram Profile</span>
            </span>
          </a>
        </div>

        {/* Floating WhatsApp Business Action Button */}
        <div className="group flex items-center space-x-2">
          <a
            href="https://wa.me/918377998636?text=Hello%20ModelVerse%20India%21%20I%20have%20an%20inquiry%20regarding%20model%20booking%20or%20premium%20profile%20unlock."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[#25D366]/30 shadow-lg transition duration-300 hover:bg-[#128C7E] hover:scale-105 active:scale-95 focus:outline-none relative group ring-4 ring-white/10"
            id="whatsapp-business-fab"
          >
            {/* Pulsing beacon green indicator */}
            <span className="absolute -top-1 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white text-[8px] font-black items-center justify-center text-white">1</span>
            </span>

            <MessageCircle className="h-7 w-7 fill-white" />
            
            {/* Elegant Tooltip pill that expands on hover */}
            <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all origin-right duration-250 bg-neutral-950 border border-neutral-800 text-white rounded-2xl px-3 py-2 text-[11px] font-black tracking-wide whitespace-nowrap shadow-xl flex items-center space-x-1.5 opacity-0 group-hover:opacity-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-sans text-neutral-200">WhatsApp Business Chat</span>
            </span>
          </a>
        </div>
      </div>

      {/* Beautiful Gating Overlay when NOT authenticated */}
      {!isAuthenticated && currentTab !== 'auth' && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md max-h-[95vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 text-center shadow-2xl border border-neutral-200/80 relative">
            {/* Ambient dynamic glows */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-pink-500/10 blur-xl pointer-events-none" />

            {/* Logo black square icon - Compact & Small Logo */}
            <div className="flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 border border-neutral-900 shadow-xl mb-4 mx-auto w-fit">
              <Logo size={28} variant="compact" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
              Unlock ModelVerse India
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto font-medium">
              Access India's premier verified modeling registry, secure casting escrow systems, and real-time coordinator chat modules.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => {
                  setCurrentTab('auth');
                  setAuthRoleHint('client');
                }}
                className="w-full py-3 px-5 rounded-xl bg-neutral-950 text-white hover:bg-black border border-neutral-900 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-150 active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
              >
                <LogIn className="h-4 w-4 text-white" />
                <span>Log In to Account</span>
              </button>
              <button
                onClick={() => {
                  setCurrentTab('auth');
                  setAuthRoleHint('client');
                }}
                className="w-full py-3 px-5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 text-neutral-800 text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-4 w-4 text-purple-650" />
                <span>Register Certified Profile</span>
              </button>
            </div>

            {/* Small active role descriptions */}
            <div className="mt-6 pt-5 border-t border-neutral-150 grid grid-cols-3 gap-2 text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-wider">
              <div className="flex flex-col items-center">
                <span className="text-purple-650 font-black">Client</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 font-sans font-medium">Hire Talents</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-pink-650 font-black">Model</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 font-sans font-medium">Onboard Registry</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-amber-600 font-black">Admin</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 font-sans font-medium">Vetting Panel</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern interactive neon angle custom cursor with spark physical light streams */}
      <CustomCursor />

      {/* Dynamic metadata & SEO structured schema management */}
      <DynamicMetadata currentTab={currentTab} focusedModel={focusedModel} />

      {/* Elegant Toast Notifications for Real-Time Booking Updates */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Floating Bottom Monetization Ad Banner */}
      <AnimatePresence>
        {showAdBanner && (
          <motion.div
            initial={{ y: 80, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 80, x: '-50%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            className="fixed bottom-4 left-1/2 z-[45] w-[calc(100%-2rem)] max-w-4xl"
          >
            <BannerAd 
              onClose={() => {
                setShowAdBanner(false);
                localStorage.setItem('ad_banner_dismissed', 'true');
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
