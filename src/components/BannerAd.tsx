import React, { useState, useEffect, useRef, Component } from 'react';
import { X, ExternalLink, Settings, Sparkles, Check, DollarSign, TrendingUp, HelpCircle, Save, Sliders, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SponsorCampaign {
  brand: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
  accentColor: string;
  logoBg: string;
}

const CAMPAIGNS: SponsorCampaign[] = [
  {
    brand: 'Sony Alpha India',
    tagline: 'Capture flawless portraits with real-time eye tracking. Special 15% discount code applied.',
    ctaText: 'View Cameras',
    ctaUrl: 'https://www.sony.co.in',
    accentColor: 'from-blue-600 to-indigo-600',
    logoBg: 'bg-zinc-900 text-white font-sans font-black tracking-widest'
  },
  {
    brand: 'Lakme Cosmetics',
    tagline: 'Premium matte lipstick line designed for cinematic studio shoots. Order direct sample packs today.',
    ctaText: 'Get Samples',
    ctaUrl: 'https://www.lakmeindia.com',
    accentColor: 'from-pink-600 to-rose-700',
    logoBg: 'bg-pink-900 text-white font-sans font-bold tracking-tight'
  },
  {
    brand: 'Zara Fashion',
    tagline: 'Explore the new summer street wear catalogue. Modern silhouettes & earth-safe materials.',
    ctaText: 'Browse Collection',
    ctaUrl: 'https://www.zara.com/in',
    accentColor: 'from-neutral-800 to-neutral-950',
    logoBg: 'bg-neutral-900 text-white font-mono tracking-widest'
  }
];

interface BannerAdProps {
  onClose: () => void;
}

// React Error Boundary to handle AdSense script runtime failures and guard against empty blank states
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AdSenseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props!: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("AdSense component crashed, caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function BannerAd({ onClose }: BannerAdProps) {
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [adSenseState, setAdSenseState] = useState<'loading' | 'loaded' | 'error' | 'unfilled'>('loading');

  // IntersectionObserver Visibility Tracking state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  // Load initial settings
  const [publisherId, setPublisherId] = useState(() => {
    return localStorage.getItem('adsense_publisher_id') || 'ca-pub-2960926541753229';
  });
  const [slotId, setSlotId] = useState(() => {
    return localStorage.getItem('adsense_slot_id') || '4254411111';
  });
  const [useRealAdSense, setUseRealAdSense] = useState(() => {
    const saved = localStorage.getItem('adsense_enabled');
    return saved === null ? false : saved === 'true'; // Default to false to avoid invalid render warnings
  });

  const isValidPublisher = /^ca-pub-\d{12,20}$/.test(publisherId.trim());
  const isValidSlot = /^\d{8,15}$/.test(slotId.trim());
  const isValidCredentials = isValidPublisher && isValidSlot;

  // Observe container visibility via IntersectionObserver
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !hasTrackedImpression) {
          setHasTrackedImpression(true);
          console.log('[BannerAd] Impression captured successfully via IntersectionObserver.');
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasTrackedImpression]);

  // Rotate campaigns (active when not rendering real AdSense and within viewport)
  useEffect(() => {
    if (!isVisible) return;
    if (useRealAdSense && isValidCredentials && adSenseState === 'loaded') return;
    
    const interval = setInterval(() => {
      setCurrentCampaignIndex((prev) => (prev + 1) % CAMPAIGNS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [useRealAdSense, isValidCredentials, adSenseState, isVisible]);

  // Load and inject the official Google AdSense script tags dynamically
  useEffect(() => {
    if (!isVisible) return;
    if (!useRealAdSense) {
      setAdSenseState('unfilled');
      return;
    }

    if (!isValidCredentials) {
      setAdSenseState('error');
      return;
    }

    setAdSenseState('loading');
    let observer: MutationObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const initializeAd = () => {
        try {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
          setAdSenseState('loaded');

          const insElement = document.getElementById('modelverse-adsense-ins');
          if (insElement) {
            observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
                  const status = insElement.getAttribute('data-ad-status');
                  if (status === 'unfilled') {
                    setAdSenseState('unfilled');
                  } else if (status === 'filled') {
                    setAdSenseState('loaded');
                  }
                }
              });
            });
            observer.observe(insElement, { attributes: true });
          }

          timeoutId = setTimeout(() => {
            const status = insElement?.getAttribute('data-ad-status');
            if (!status || status === 'unfilled') {
              setAdSenseState('unfilled');
            }
          }, 4000);

        } catch (err) {
          console.error(err);
          setAdSenseState('error');
        }
      };

      // Ensure single clean instance of the official AdSense script tag
      const existingScript = document.getElementById('google-adsense-script') as HTMLScriptElement;
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'google-adsense-script';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId.trim()}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = initializeAd;
      script.onerror = () => setAdSenseState('error');
      document.head.appendChild(script);

    } catch (err) {
      console.error(err);
      setAdSenseState('error');
    }

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [useRealAdSense, publisherId, slotId, isValidCredentials, isVisible]);

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('adsense_publisher_id', publisherId.trim());
    localStorage.setItem('adsense_slot_id', slotId.trim());
    localStorage.setItem('adsense_enabled', String(useRealAdSense));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const campaign = CAMPAIGNS[currentCampaignIndex];
  const renderRealAdSense = useRealAdSense && isValidCredentials && adSenseState !== 'unfilled';

  return (
    <div id="banner-ad-portal" ref={containerRef} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50">
      
      {/* Accent frame with 2mm left indicator strip & responsive min-height to prevent layout shift */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 overflow-hidden select-none animate-slideUp min-h-[145px] md:min-h-[72px] justify-center">
        
        {/* Left Glow border set to EXACTLY 2mm width constraint! */}
        <div className="absolute top-0 left-0 h-full w-[2mm] bg-[#EA3838]" title="2mm Red Ad Accent border" />

        {/* Content row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pl-4">
          
          {/* Badge & Network info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="bg-red-500 text-white text-[9px] font-mono font-black tracking-widest uppercase px-2 py-0.5 rounded">
              {renderRealAdSense ? 'LIVE AD' : 'AD SPONSOR'}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-red-500" />
              <span>Earn with AdSense</span>
              {hasTrackedImpression && (
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">
                  IMPRESSION ACTIVE
                </span>
              )}
            </span>
          </div>

          {/* Core Ad Body with guaranteed stable minimum height */}
          <div className="flex-1 w-full min-h-[44px] flex items-center">
            {renderRealAdSense ? (
              <AdSenseErrorBoundary
                fallback={
                  <div className="text-[11px] text-zinc-400 font-medium w-full text-center md:text-left h-11 flex items-center">
                    Google AdSense is loading. Connect your publisher ID to activate.
                  </div>
                }
              >
                {adSenseState === 'loading' ? (
                  <div className="flex items-center justify-center py-2 bg-zinc-50 dark:bg-black/20 rounded-lg w-full h-11">
                    <Loader2 className="h-4 w-4 text-[#EA3838] animate-spin mr-2" />
                    <span className="text-[10px] text-zinc-400 font-mono">Initializing AdSense ({publisherId})...</span>
                  </div>
                ) : adSenseState === 'error' ? (
                  <div className="text-[11px] text-red-400 font-medium flex items-center justify-between w-full h-11">
                    <span>Invalid Credentials or AdBlocker block. Fallen back to sponsors.</span>
                    <button 
                      onClick={() => setUseRealAdSense(false)}
                      className="text-[9px] underline font-bold cursor-pointer"
                    >
                      Use Local Sponsors
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-lg mx-auto flex items-center justify-center h-11 overflow-hidden">
                    <ins 
                      id="modelverse-adsense-ins"
                      className="adsbygoogle"
                      style={{ display: 'block', textAlign: 'center', width: '100%', height: '100%' }}
                      data-ad-client={publisherId}
                      data-ad-slot={slotId}
                      data-ad-format="horizontal"
                      data-full-width-responsive="true"
                    />
                  </div>
                )}
              </AdSenseErrorBoundary>
            ) : (
              <div className="flex items-center gap-3 animate-fadeIn text-left w-full h-11">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black uppercase shadow-inner shrink-0 ${campaign.logoBg}`}>
                  {campaign.brand.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{campaign.brand}</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate leading-relaxed">{campaign.tagline}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {!renderRealAdSense && (
              <a
                href={campaign.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 px-4 py-1.5 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>{campaign.ctaText}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-1.5 text-zinc-400 hover:text-[#EA3838] transition cursor-pointer"
              title="Monetization Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-[#EA3838] transition cursor-pointer"
              title="Dismiss Ad"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Collapsible Inline Configuration Panel (No settings are hidden! Includes save button!) */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-100 dark:border-zinc-850 pt-3 mt-1 overflow-hidden"
            >
              <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-4 space-y-3.5 text-left pl-6">
                
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Google AdSense Monetization</h6>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">Enter your official credentials. Your ads.txt snippet is auto-injected.</p>
                  </div>
                  
                  {/* Switch */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Real AdSense:</span>
                    <input 
                      type="checkbox" 
                      checked={useRealAdSense}
                      onChange={(e) => {
                        setUseRealAdSense(e.target.checked);
                      }}
                      className="rounded text-[#EA3838] bg-transparent border-zinc-300 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono mb-1">Publisher ID</label>
                    <input 
                      type="text" 
                      value={publisherId}
                      onChange={(e) => setPublisherId(e.target.value)}
                      placeholder="ca-pub-2960926541753229"
                      className="w-full text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:border-[#EA3838]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono mb-1">Slot ID</label>
                    <input 
                      type="text" 
                      value={slotId}
                      onChange={(e) => setSlotId(e.target.value)}
                      placeholder="4254411111"
                      className="w-full text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:border-[#EA3838]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-850/50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUseRealAdSense(false);
                      setShowConfig(false);
                    }}
                    className="rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 px-4 py-1.5 text-[10px] font-bold cursor-pointer"
                  >
                    Reset fallback
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveConfig();
                      setShowConfig(false);
                    }}
                    className="rounded-full bg-[#EA3838] hover:bg-red-600 text-white px-5 py-1.5 text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="h-3 w-3" />
                    <span>{isSaved ? 'Credentials Saved!' : 'Save Credentials'}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
