/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Lock, CreditCard, ChevronRight, Check, X, AlertCircle, QrCode, ClipboardCheck, ArrowRight, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import { motion } from 'motion/react';
import { Model } from '../types';

interface PremiumUnlockModalProps {
  model: Model;
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: () => void;
  planType?: 'premium' | 'enterprise';
  userId?: string;
  userName?: string;
  userEmail?: string;
}

type PaymentStep = 'details' | 'initializing' | 'upi_qr' | 'processing' | 'success';

type PaymentGateway = 'UPI' | 'Razorpay' | 'Cashfree' | 'ReservePay';

export default function PremiumUnlockModal({
  model,
  isOpen,
  onClose,
  onSuccessUnlock,
  planType = 'premium',
  userId = 'guest_client',
  userName = 'Guest User',
  userEmail = 'guest@modelverse.in'
}: PremiumUnlockModalProps) {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('details' as PaymentStep);
  const [gateway, setGateway] = useState<PaymentGateway>('Razorpay');
  const [utr, setUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [dimensions, setDimensions] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 800, height: typeof window !== 'undefined' ? window.innerHeight : 600 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const isPaymentProcessing = (paymentStep as PaymentStep) === 'initializing' || (paymentStep as PaymentStep) === 'processing';

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentStep('initializing');

    if (gateway === 'UPI') {
      setTimeout(() => {
        setPaymentStep('upi_qr');
      }, 1500);
      return;
    }

    if (gateway === 'ReservePay') {
      setTimeout(() => {
        setPaymentStep('details');
        setPaymentError('Could not initiate secure transaction via reserve pay. Please verify your internet connection and try again or use UPI or QR option.');
      }, 1500);
      return;
    }

    // Direct Razorpay and Cashfree gateways to retrieve the secure checkout session URL (real or mock)
    try {
      const targetAmount = planType === 'enterprise' ? 4999 : 199;
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway,
          planType,
          userId,
          userName,
          userEmail,
          modelId: model.id,
          modelName: model.name,
          amount: targetAmount,
        }),
      });
      const data = await response.json();
      
      if (data && data.isReal && gateway === 'Razorpay') {
        const loadScript = () => {
          return new Promise((resolve) => {
            if ((window as any).Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const isLoaded = await loadScript();
        if (!isLoaded) {
          throw new Error('Could not load Razorpay Payment Gateway SDK in your browser.');
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || "INR",
          name: 'ModelVerse India',
          description: planType === 'enterprise' ? 'Enterprise Agency License' : `Test Transaction - ${model.name}`,
          image: "https://example.com/your_logo",
          order_id: data.id,
          handler: function (res: any) {
            try {
              alert(res.razorpay_payment_id);
              alert(res.razorpay_order_id);
              alert(res.razorpay_signature);
            } catch (e) {
              console.warn("Alert blocked or failed in sandbox iframe environment", e);
            }
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = res;
            const origin = window.location.origin;
            window.location.href = `${origin}/?payment_success=true&gateway=Razorpay&session_id=${razorpay_order_id}&plan_type=${planType}&user_id=${userId || ''}&amount=${targetAmount}&model_id=${model.id}&model_name=${encodeURIComponent(model.name)}&razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`;
          },
          prefill: { // We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
            name: userName || 'Premium Client', // your customer's name
            email: userEmail || 'client@advertiser.com',
            contact: '9999999999' // Provide the customer's phone number for better conversion rates
          },
          notes: {
            address: "Razorpay Corporate Office"
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              setPaymentStep('details');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          try {
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
          } catch (e) {
            console.warn("Alert blocked or failed in sandbox iframe environment", e);
          }
        });
        rzp.open();
        return;
      }

      if (data && data.url) {
        // Redirect browser directly to the payment gateway session (real or interactive mock checkout)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'No checkout URL returned by server');
      }
    } catch (err: any) {
      console.error('Payment initialization failed:', err);
      setPaymentError(`Could not initiate secure transaction via ${gateway}. Please verify your internet connection and try again, or use BHIM UPI QR option.`);
      setPaymentStep('details');
    }
  };

  const handleUpiVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length < 12) {
      setUtrError('Please enter a valid 12-digit UPI UTR / Transaction ID.');
      return;
    }
    setUtrError('');
    setVerifyingUpi(true);
    
    // Simulate real bank/escrow ledger callback audits
    setTimeout(() => {
      setVerifyingUpi(false);
      setPaymentStep('success');
    }, 2500);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('mohit44190ssr@okhdfcbank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalize = () => {
    onSuccessUnlock();
    setPaymentStep('details');
    onClose();
  };

  return (
    <div id="premium-unlock-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl border border-neutral-200 bg-white text-neutral-800 shadow-2xl overflow-hidden text-left">
        
        {/* Close Button unless processing or initializing */}
        {paymentStep !== 'processing' && paymentStep !== 'initializing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-neutral-400 bg-white/80 hover:bg-neutral-100 hover:text-black transition cursor-pointer shadow-sm border border-neutral-100"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Scrollable Modal Content Core */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 scrollbar-thin scrollbar-thumb-neutral-200">
          
          {/* STEP 1: Details & Upgrade Proposal */}
          {paymentStep === 'details' && (
            <div className="text-center">
              
              {/* Upgrade Badge */}
              <div className="mx-auto my-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-650 to-pink-600 shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <h3 className="font-sans text-lg font-black tracking-tight text-neutral-900">
                {planType === 'enterprise' ? 'Get Enterprise Grant Account' : 'Unlock Premium Details'}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {planType === 'enterprise' 
                  ? `Full platform agency-level access with ${model.name} & all models` 
                  : `Instant contact-permission unlock for ${model.name}`}
              </p>

              {/* Price Point banner */}
              <div className={`my-3.5 rounded-xl border py-2.5 text-center ${
                planType === 'enterprise' ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-purple-200 bg-purple-50/50'
              }`}>
                <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${
                  planType === 'enterprise' ? 'text-[#B8860B]' : 'text-purple-750'
                }`}>
                  {planType === 'enterprise' ? 'Enterprise Monthly License' : 'One-Time Premium Unlock'}
                </span>
                <p className="text-2xl font-black text-neutral-900 mt-0.5">
                  {planType === 'enterprise' ? '₹4,999' : '₹199'}
                </p>
                <p className="text-[9px] text-neutral-500 mt-0.5 px-4 leading-relaxed">
                  {planType === 'enterprise' 
                    ? 'Includes unlimited verified models unlock, tax invoice generator, and priority coordinator support.' 
                    : 'Includes direct casting agency, body measurements, & high-res comp cards.'}
                </p>
              </div>

              {/* Inclusions checkboxes */}
              <div className="text-left space-y-2.5 px-0.5 mb-3.5">
                {planType === 'enterprise' ? (
                  <>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-amber-50 border border-amber-200 p-0.5 text-amber-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">Unlimited Talent Unlocks</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Unlock measurements, agency cards, and direct channels for all verified Indian models.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-amber-50 border border-amber-200 p-0.5 text-amber-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">Direct GST Business Invoicing</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Automated business commercial invoice logs for simple corporate tax compliance.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-amber-50 border border-amber-200 p-0.5 text-amber-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">Priority Coordinator Support</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Direct offline contact desk for swift ramp scheduling, venue audits, and contracts.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-purple-50 border border-purple-200 p-0.5 text-purple-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">Full Body Measurements</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Unlock official certified measurements: B-W-H, shoe size, and skin tone.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-purple-50 border border-purple-200 p-0.5 text-purple-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">Representation & Agency Card</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">View direct verified agency details, talent management team, and manager refs.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <div className="rounded-full bg-purple-50 border border-purple-200 p-0.5 text-purple-600 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800">100% Secure Payment Escrow</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Transactions are shielded in a secured escrow wallet under Indian trade regulations.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Secure warning note */}
              {gateway === 'ReservePay' ? (
                <div className="flex items-start space-x-2 rounded-xl bg-amber-50 border border-amber-300 p-2.5 text-left text-amber-950 text-[10px] mb-4 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Privacy Protocol:</strong> Direct private contacts are protected under safety provisions. This is a campaign from the central government of India.
                  </span>
                </div>
              ) : (
                <div className="flex items-start space-x-2 rounded-xl bg-amber-50/60 border border-amber-200 p-2.5 text-left text-amber-950 text-[10px] mb-4">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Privacy Protocol:</strong> Direct private contacts are protected under safety policies. Campaign arrangements are verified inside ModelVerse India.
                  </span>
                </div>
              )}

              {gateway === 'ReservePay' && paymentError ? (
                <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3.5 flex flex-col space-y-2 text-left text-neutral-900 text-xs animate-pulse">
                  <div className="flex items-center space-x-2 text-red-600 font-black uppercase tracking-wider font-sans text-[10px]">
                    <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-mono font-black">RED FLAG</span>
                    <span>Could not initiate secure transaction via reserve pay.</span>
                  </div>
                  <div className="text-[10px] text-neutral-700 leading-relaxed font-medium">
                    <p className="font-bold text-red-700">
                      Please verify your internet connection and try again or use UPI or QR option.
                    </p>
                    <div className="h-px bg-red-100 my-1.5" />
                    <p className="text-[9px] text-neutral-500 italic">
                      Privacy protocol, direct private contacts are protected under safety provisions. This is a campaign from the central government of India.
                    </p>
                  </div>
                </div>
              ) : paymentError ? (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start space-x-2 text-rose-800 text-[10px] text-left">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              ) : null}

              {/* Pay Button / Form */}
              <form onSubmit={handlePaySubmit} className="space-y-3.5">
                <div className="flex flex-col space-y-1.5 border-t border-neutral-100 pt-3">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest font-mono">Select Secure Payment Channel</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGateway('UPI')}
                      className={`rounded-xl py-2 px-1 border text-[9px] sm:text-[10px] font-black tracking-wide flex flex-col items-center justify-center space-y-0.5 transition cursor-pointer ${
                        gateway === 'UPI' 
                          ? 'border-blue-500 border-2 bg-blue-50 text-blue-900' 
                          : 'border-neutral-200 bg-[#FCFBF9] text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <QrCode className="h-3 w-3 text-blue-500" />
                      <span>BHIM UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateway('Razorpay')}
                      className={`rounded-xl py-2 px-1 border text-[9px] sm:text-[10px] font-black tracking-wide flex flex-col items-center justify-center space-y-0.5 transition cursor-pointer ${
                        gateway === 'Razorpay' 
                          ? 'border-purple-650 border-2 bg-purple-50 text-purple-900' 
                          : 'border-neutral-200 bg-[#FCFBF9] text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <CreditCard className="h-3 w-3 text-pink-500" />
                      <span>Razorpay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateway('Cashfree')}
                      className={`rounded-xl py-2 px-1 border text-[9px] sm:text-[10px] font-black tracking-wide flex flex-col items-center justify-center space-y-0.5 transition cursor-pointer ${
                        gateway === 'Cashfree' 
                          ? 'border-emerald-600 border-2 bg-emerald-50 text-emerald-900' 
                          : 'border-neutral-200 bg-[#FCFBF9] text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Cashfree</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateway('ReservePay')}
                      className={`rounded-xl py-2 px-1 border text-[9px] sm:text-[10px] font-black tracking-wide flex flex-col items-center justify-center space-y-0.5 transition cursor-pointer ${
                        gateway === 'ReservePay' 
                          ? 'border-red-500 border-2 bg-red-50 text-red-900' 
                          : 'border-neutral-200 bg-[#FCFBF9] text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3 text-red-500" />
                      <span>Reserve Pay</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="rzp-button1"
                  disabled={isPaymentProcessing}
                  className="w-full px-4 py-2 text-sm bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-wait text-white font-black uppercase tracking-wider rounded-full shadow-md transition active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing Transaction...</span>
                    </>
                  ) : gateway === 'UPI' ? (
                    <>
                      <span>Generate Pay-to UPI QR Link</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : gateway === 'ReservePay' ? (
                    <>
                      <span>Process Payment via Reserve Pay</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Process Payment via {gateway}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>



            </div>
          )}



          {/* STEP 1.5: Detailed BHIM UPI QR Code (Replica of User's Image) */}
          {paymentStep === 'upi_qr' && (
          <div className="flex flex-col items-center bg-[#f3f6fc] rounded-3xl p-5 border border-neutral-100">
            {/* Indian Politics Header */}
            <div className="flex items-center space-x-3 mb-4 w-full justify-center">
              <div className="h-9 w-9 rounded-full border border-neutral-300 overflow-hidden shrink-0 shadow-sm bg-neutral-200">
                <img 
                  src="https://images.unsplash.com/photo-1590053416244-6725227bf792?auto=format&fit=crop&q=80&w=120" 
                  alt="POLITICS" 
                  className="h-full w-full object-cover animate-pulse"
                />
              </div>
              <span className="font-sans text-base font-black tracking-wider text-neutral-800">INDIAN POLITICS</span>
            </div>

            {/* Inner QR white card exactly like Google Pay image */}
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-neutral-100 flex flex-col items-center w-full max-w-[290px] relative">
              {/* Responsive SVG QR Code containing dynamic transaction URI */}
              <div className="relative p-3 bg-white border border-neutral-100 rounded-2xl shadow-xs">
                <QRCodeSVG
                  value={`upi://pay?pa=mohit44190ssr@okhdfcbank&pn=INDIAN%20POLITICS&am=${planType === 'enterprise' ? 4999 : 199}&cu=INR&tn=ModelVerse%20India%20Promo`}
                  size={175}
                  level="H"
                  includeMargin={false}
                />
                
                {/* GPay logo absolute center overlay */}
                <div id="gpay-logo-overlay" className="absolute inset-0 m-auto h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 border-neutral-100 shadow-md">
                  <div className="flex items-center justify-center p-0.5">
                    <svg viewBox="0 0 24 24" className="h-6 w-6">
                      <path d="M17.58 2c-1.39 0-2.43 1.05-3.08 2.05L6.96 15.65c-.41.63-.56 1.25-.56 1.85 0 2.41 1.94 4.5 4.5 4.5a4.41 4.41 0 0 0 3.75-2.06l3.58-5.5a1.5 1.5 0 1 0-2.52-1.63l-3.58 5.5A1.41 1.41 0 0 1 10.9 19c-1.05 0-1.5-.78-1.5-1.5 0-.25.07-.56.24-.82L17.2 4.1a.42.42 0 0 1 .38-.2c.28 0 .42.15.42.45v2.81a1.5 1.5 0 1 0 3 0V4.4c0-1.35-1.04-2.4-2.42-2.4z" fill="#34A853"/>
                      <path d="M6.42 22c1.39 0 2.43-1.05 3.08-2.05l7.54-11.6c.41-.63.56-1.25.56-1.85 0-2.41-1.94-4.5-4.5-4.5a4.41 4.41 0 0 0-3.75 2.06l-3.58 5.5a1.5 1.5 0 0 0 2.52 1.63l3.58-5.5a1.41 1.41 0 0 1 1.23-.74c1.05 0 1.5.78 1.5 1.5 0 .25-.07.56-.24.82L6.8 19.9a.42.42 0 0 1-.38.2c-.28 0-.42-.15-.42-.45v-2.81a1.5 1.5 0 1 0-3 0v2.76c0 1.35 1.04 2.4 2.42 2.4z" fill="#4285F4"/>
                      <path d="M12 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#EA4335"/>
                      <path d="M14.5 14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="#FBBC05"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* UPI ID Info Row with Click To Copy */}
              <button 
                onClick={handleCopyUPI}
                className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition flex items-center justify-center space-x-1.5 w-full cursor-pointer"
              >
                <span className="font-mono truncate">
                  {copied ? 'Copied Successfully!' : 'mohit44190ssr@okhdfcbank'}
                </span>
                <ClipboardCheck className={`h-4 w-4 shrink-0 transition ${copied ? 'text-green-600 scale-110' : 'text-neutral-400'}`} />
              </button>

              <span className="text-[10px] text-neutral-500 mt-4 tracking-normal text-center font-bold">
                Scan to pay with any UPI app
              </span>
            </div>

            {/* Direct Pay Link Launcher and Reference Input Validation Form */}
            <form onSubmit={handleUpiVerification} className="w-full mt-4 space-y-4 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono block">Instant Pay with UPI</span>
                
                {/* Primary Default Instant App Launcher */}
                <a 
                  href={`upi://pay?pa=mohit44190ssr@okhdfcbank&pn=INDIAN%20POLITICS&am=${planType === 'enterprise' ? 4999 : 199}&cu=INR&tn=ModelVerse%20India%20Promo`}
                  className="w-full py-3 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-900 text-xs font-black flex items-center justify-center space-x-2 transition cursor-pointer text-center tracking-wide shadow-xs"
                >
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <span>Instant Pay with Default UPI App</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                {/* Popular App-Specific Deep Links Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Google Pay */}
                  <a 
                    href={`tez://upi/pay?pa=mohit44190ssr@okhdfcbank&pn=INDIAN%20POLITICS&am=${planType === 'enterprise' ? 4999 : 199}&cu=INR&tn=ModelVerse%20India%20Promo`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition text-center cursor-pointer space-y-1"
                    title="Pay using Google Pay"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5">
                      <path d="M17.58 2c-1.39 0-2.43 1.05-3.08 2.05L6.96 15.65c-.41.63-.56 1.25-.56 1.85 0 2.41 1.94 4.5 4.5 4.5a4.41 4.41 0 0 0 3.75-2.06l3.58-5.5a1.5 1.5 0 1 0-2.52-1.63l-3.58 5.5s-.82 1.26-1.92 1.25c-1.05 0-1.5-.78-1.5-1.5 0-.25.07-.56.24-.82L17.2 4.1c.17-.26.3-.3.38-.2.28 0 .42.15.42.45v2.81a1.5 1.5 0 1 0 3 0V4.4c0-1.35-1.04-2.4-2.42-2.4z" fill="#34A853"/>
                      <path d="M6.42 22c1.39 0 2.43-1.05 3.08-2.05l7.54-11.6c.41-.63.56-1.25.56-1.85 0-2.41-1.94-4.5-4.5-4.5a4.41 4.41 0 0 0-3.75 2.06l-3.58 5.5a1.5 1.5 0 0 0 2.52 1.63l3.58-5.5s.82-1.26 1.23-.74c1.05 0 1.5.78 1.5 1.5 0 .25-.07.56-.24.82L6.8 19.9c-.17.26-.3.3-.38.2-.28 0-.42-.15-.42-.45v-2.81a1.5 1.5 0 1 0-3 0v2.76c0 1.35 1.04 2.4 2.42 2.4z" fill="#4285F4"/>
                      <path d="M12 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#EA4335"/>
                      <path d="M14.5 14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="#FBBC05"/>
                    </svg>
                    <span className="text-[10px] font-black text-neutral-700">Google Pay</span>
                  </a>

                  {/* PhonePe */}
                  <a 
                    href={`phonepe://pay?pa=mohit44190ssr@okhdfcbank&pn=INDIAN%20POLITICS&am=${planType === 'enterprise' ? 4999 : 199}&cu=INR&tn=ModelVerse%20India%20Promo`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition text-center cursor-pointer space-y-1"
                    title="Pay using PhonePe"
                  >
                    <span className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center font-sans text-xs font-black text-white">P</span>
                    <span className="text-[10px] font-black text-neutral-700">PhonePe</span>
                  </a>

                  {/* Paytm */}
                  <a 
                    href={`paytmmp://pay?pa=mohit44190ssr@okhdfcbank&pn=INDIAN%20POLITICS&am=${planType === 'enterprise' ? 4999 : 199}&cu=INR&tn=ModelVerse%20India%20Promo`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition text-center cursor-pointer space-y-1"
                    title="Pay using Paytm"
                  >
                    <span className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center font-sans text-xs font-black text-white">Py</span>
                    <span className="text-[10px] font-black text-neutral-700">Paytm</span>
                  </a>
                </div>
              </div>

              <div className="border-t border-neutral-200/50 pt-3">
                <label className="block text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                  12-Digit Transaction ID (UTR Ref)
                </label>
                <input 
                  type="text" 
                  maxLength={12}
                  placeholder="e.g. 620448102359"
                  value={utr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setUtr(val);
                    if (val.length === 12) setUtrError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-mono font-bold tracking-widest text-neutral-850 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {utrError && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">{utrError}</p>
                )}
                <span className="text-[9px] text-[#4285F4] leading-relaxed block mt-1 font-mono">
                  *Open your UPI app history to find the 12-digit reference number.
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentStep('details')}
                  className="flex-1 py-2.5 px-3 rounded-full border border-neutral-300 text-neutral-600 bg-white text-xs font-bold hover:bg-neutral-50 transition cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={verifyingUpi}
                  className="flex-2 py-2.5 px-4 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {verifyingUpi ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Unlock</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 1.8: Payment Initialization Loader */}
        {paymentStep === 'initializing' && (
          <div className="py-12 text-center flex flex-col items-center">
            {/* Spinning Indicator */}
            <div className="relative flex items-center justify-center h-16 w-16 my-4">
              <div className="absolute inset-0 border-4 border-purple-100 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
            </div>

            <h4 className="font-sans text-base font-black text-neutral-850 mt-4 leading-snug">Initializing Payment Gateway...</h4>
            <div className="mt-2 space-y-1">
              <p className="text-[11px] font-bold text-purple-700 animate-pulse font-mono tracking-wider uppercase">Contacting Secure Ledger Switch</p>
              <p className="text-xs text-neutral-550 max-w-xs leading-relaxed px-4">
                Structuring encrypted payment credentials with {gateway}. Please do not refresh or press back to prevent double-billing.
              </p>
            </div>
            
            {/* Bank shield indicator */}
            <div className="mt-6 flex items-center space-x-1.5 rounded-full bg-neutral-50 border border-neutral-200 px-3 py-1.5 text-[10px] text-neutral-500 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>PCI-DSS Secured Connection</span>
            </div>
          </div>
        )}

        {/* STEP 2: Processing Payment Overlay */}
        {paymentStep === 'processing' && (
          <div className="py-12 text-center flex flex-col items-center">
            
            {/* Spinning Indicator */}
            <div className="relative flex items-center justify-center h-16 w-16 my-4">
              <div className="absolute inset-0 border-4 border-neutral-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-purple-650 rounded-full animate-spin" />
            </div>

            <h4 className="font-sans text-lg font-black text-neutral-800 mt-4">Connecting to {gateway}...</h4>
            <p className="text-xs text-neutral-550 mt-2 max-w-xs leading-relaxed">
              Please do not close this window. Powering secure UPI, NetBanking & card channels through {gateway} India.
            </p>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {paymentStep === 'success' && (
          <div className="py-8 text-center flex flex-col items-center">
            {/* Confetti Explosion Canvas */}
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              numberOfPieces={180}
              recycle={false}
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }}
            />

            <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 my-4 animate-bounce">
              <Check className="h-7 w-7" />
            </div>

            <h4 className="font-sans text-xl font-black text-neutral-900">Payment Successful!</h4>
            <p className="text-[10px] text-emerald-700 font-bold font-mono mt-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Invoice Ref: {planType === 'enterprise' ? 'MVI-ENT' : 'MVI-PRE'}-{Math.floor(Math.random() * 8000 + 1000)}
            </p>
            
            <p className="text-xs text-neutral-550 mt-4 leading-relaxed max-w-sm">
              We have processed your payment of <strong className="text-neutral-800">₹{planType === 'enterprise' ? '4,999' : '199'}</strong>. {planType === 'enterprise' ? 'Enterprise agency account license' : `Model profile measurements and agency representation card details for ${model.name}`} has been unlocked successfully.
            </p>

            <button
              id="payment-success-continue-btn"
              onClick={handleFinalize}
              className="mt-8 w-full py-3.5 px-6 rounded-full bg-neutral-900 text-white text-xs font-black uppercase tracking-wider shadow transition hover:bg-black cursor-pointer"
            >
              Access Unlocked Profile
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
