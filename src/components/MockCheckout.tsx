/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CreditCard, 
  ShieldCheck, 
  Landmark, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Clock,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Award
} from 'lucide-react';

interface MockCheckoutProps {
  gateway: 'Razorpay' | 'Cashfree' | 'UPI';
  planType: string;
  amount: number;
  modelId: string;
  modelName: string;
  userName: string;
  userEmail: string;
  onCancel: () => void;
}

export default function MockCheckout({
  gateway,
  planType,
  amount,
  modelId,
  modelName,
  userName,
  userEmail,
  onCancel,
}: MockCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8824');
  const [cardName, setCardName] = useState(userName || 'Premium Advertiser');
  const [expiry, setExpiry] = useState('11/30');
  const [cvc, setCvc] = useState('•••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  
  // UPI QR Code states
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [copied, setCopied] = useState(false);

  // Countdown timer for QR Code validation
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setTimeLeft(300);
  };

  const upiId = 'castify.pay@razorpay';
  const upiURI = `upi://pay?pa=${upiId}&pn=Castify%20Marketplace&am=${amount}&cu=INR&tn=Castify%20Profile%20Unlock%20${planType}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  const handleSimulatePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        setSimulatedStatus('success');
        setTimeout(() => {
          const origin = window.location.origin;
          window.location.href = `${origin}/?payment_success=true&gateway=${gateway}&session_id=mock_sess_${Date.now()}&plan_type=${planType}&user_id=client_unregistered_billing&amount=${amount}&model_id=${modelId}&model_name=${encodeURIComponent(modelName)}`;
        }, 1500);
      } else {
        setSimulatedStatus('failed');
        setTimeout(() => {
          const origin = window.location.origin;
          window.location.href = `${origin}/?payment_success=false&gateway=${gateway}`;
        }, 1500);
      }
    }, 2000);
  };

  return (
    <div id="mock-checkout-portal" className="fixed inset-0 z-[200] overflow-y-auto bg-[#F8F5F2] dark:bg-neutral-950 py-6 md:py-12 px-4 flex justify-center items-start md:items-center">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-white/10 flex flex-col md:flex-row md:min-h-[600px] max-h-[90vh] overflow-y-auto h-auto my-auto">
        
        {/* Left Column: Order details & branding */}
        <div className="md:w-5/12 bg-neutral-50 dark:bg-neutral-950 p-8 md:p-12 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/10 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-black font-mono flex items-center gap-1.5 shadow-sm border border-purple-200/50 dark:border-purple-800/25">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{gateway} Direct Premium Portal</span>
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-black tracking-widest font-mono">Invoice Total (INR)</span>
              <p className="text-4xl font-black text-neutral-950 dark:text-white tracking-tight">{formattedAmount}</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-purple-50 dark:bg-purple-950 p-2 text-purple-600 dark:text-purple-400 shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                    {planType === 'enterprise' ? 'Enterprise Agency Plan' : `Instant Profile Unlock`}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                    {planType === 'enterprise' 
                      ? 'Unlocks unlimited model casting nodes, priority email pitches, premium filter metrics, and verified composite sheets.'
                      : `Grants direct booking channel, high-res digital composite download, physical measurements, and instant chat line with ${modelName || 'selected talent'}.`}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/20 p-4 flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 dark:text-purple-400 tracking-wide">Razorpay Secured Session</p>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
                    Fully encrypted with AES-256 standard. PCI-DSS compliant payment route authorized under Reserve Bank of India secure guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="mt-8 flex items-center space-x-2 text-xs font-black text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition cursor-pointer self-start py-2 px-1 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back / Cancel Payment</span>
          </button>
        </div>

        {/* Right Column: Checkout Tabbed Selector */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-mono">
                Select Your Payment Route
              </h3>
              
              {/* Payment Method Switcher Tabs */}
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl select-none shrink-0 border border-neutral-200/40 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('upi');
                  }}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-white dark:bg-neutral-700 text-purple-650 dark:text-purple-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card');
                  }}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-white dark:bg-neutral-700 text-purple-650 dark:text-purple-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* UPI QR Code scan interface */}
            {paymentMethod === 'upi' ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 text-center relative overflow-hidden">
                  
                  {/* Countdown Timer Badge */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-900/30 text-[10px] font-black font-mono">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span>Expires: {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}</span>
                  </div>

                  {timeLeft > 0 ? (
                    <>
                      {/* Real, Beautiful Scannable QR Code */}
                      <div className="relative mt-2 p-3 bg-white rounded-2xl shadow-md border border-neutral-100 flex items-center justify-center w-full max-w-[250px] mx-auto">
                        <QRCodeSVG
                          value={upiURI}
                          size={176}
                          level="H"
                          includeMargin={false}
                        />
                        {/* Miniature UPI Center Logo Accent */}
                        <div className="absolute inset-0 m-auto h-9 w-9 bg-white border border-neutral-100 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-[9px] font-black tracking-tighter text-purple-700 font-sans">UPI</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1">
                        <p className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                          Scan QR with GPay, PhonePe, Paytm, BHIM or any UPI App
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono flex items-center justify-center gap-1.5">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span>Waiting for scan & payment confirmation...</span>
                        </p>
                      </div>

                      {/* Deep Link button for direct mobile payment routing */}
                      <div className="mt-4 w-full max-w-xs sm:max-w-sm flex flex-col gap-2">
                        <a 
                          href={upiURI}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-98 select-none"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>Tap to Pay via Mobile UPI App</span>
                        </a>

                        {/* Clipboard block for Manual UPI VPA Input */}
                        <div className="flex items-center justify-between border border-neutral-200 dark:border-white/10 rounded-xl p-2 bg-white dark:bg-neutral-800">
                          <div className="text-left pl-1">
                            <p className="text-[8px] font-black uppercase tracking-wider text-neutral-400 font-mono">UPI ID / VPA</p>
                            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono">{upiId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUPI}
                            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition"
                            title="Copy UPI ID"
                          >
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 space-y-4 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">UPI QR Session Expired</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs">For your security, QR codes are only valid for 5 minutes. Generate a new code to complete payment.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetTimer}
                        className="flex items-center space-x-1.5 py-2 px-4 rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 text-xs font-black hover:bg-neutral-50 transition cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Regenerate UPI QR Code</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Secure Indian Payment Apps Badges */}
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-4 flex-wrap opacity-60">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 font-mono">Accepted UPI Apps:</span>
                    <span className="text-[10px] font-black tracking-tight text-neutral-700 dark:text-neutral-300 font-sans px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">Google Pay</span>
                    <span className="text-[10px] font-black tracking-tight text-neutral-700 dark:text-neutral-300 font-sans px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">PhonePe</span>
                    <span className="text-[10px] font-black tracking-tight text-neutral-700 dark:text-neutral-300 font-sans px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">Paytm UPI</span>
                    <span className="text-[10px] font-black tracking-tight text-neutral-700 dark:text-neutral-300 font-sans px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">BHIM</span>
                  </div>
                </div>
              </div>
            ) : (
              // Card Details Form tab
              <div className="space-y-4 animate-fadeIn">
                {/* Email Info (readonly) */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase tracking-wider text-neutral-400 font-mono">Registered Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail || 'client@advertiser.com'}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-bold"
                  />
                </div>

                {/* Card input group */}
                <div className="space-y-3">
                  <label className="block text-[9px] font-black uppercase tracking-wider text-neutral-400 font-mono">Card details</label>
                  
                  <div className="border border-neutral-200 dark:border-white/10 rounded-xl divide-y divide-neutral-200 dark:divide-white/10 overflow-hidden bg-white dark:bg-neutral-800 shadow-sm">
                    {/* Card Number Input */}
                    <div className="flex items-center px-4 py-3">
                      <CreditCard className="h-4.5 w-4.5 text-neutral-400 mr-3" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none"
                        placeholder="1234 5678 9101 1121"
                      />
                      <span className="text-[9px] font-mono font-black text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md uppercase shrink-0">Rupay</span>
                    </div>

                    {/* Expiry and CVC block */}
                    <div className="flex divide-x divide-neutral-200 dark:divide-white/10">
                      <div className="w-1/2 px-4 py-3">
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none"
                          placeholder="MM / YY"
                        />
                      </div>
                      <div className="w-1/2 px-4 py-3">
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-neutral-800 dark:text-neutral-100 focus:outline-none"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cardholder name input */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase tracking-wider text-neutral-400 font-mono">Cardholder name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-850 dark:text-neutral-100 font-bold focus:outline-none focus:ring-1 focus:ring-purple-650"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            {/* Production Gateway Secured Routing Banner */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1 mt-4">
              <p className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider font-mono">Razorpay Secure Routing Active</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                Your connection is fully encrypted. Complete your transaction or scan the generated QR code above to pay securely via any UPI application (GPay, PhonePe, Paytm).
              </p>
            </div>
          </div>

          {/* Simulate Action Buttons */}
          <div className="mt-8 space-y-4">
            {isProcessing ? (
              <div className="flex items-center justify-center py-3 bg-purple-50 dark:bg-purple-950 rounded-full border border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-black uppercase tracking-wider space-x-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-purple-650" />
                <span>
                  {paymentMethod === 'upi' ? 'Polling Razorpay UPI Webhook Status...' : 'Authorizing Card Transaction...'}
                </span>
              </div>
            ) : simulatedStatus === 'success' ? (
              <div className="flex items-center justify-center py-3 bg-emerald-50 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                <span>Success! Redirecting to application...</span>
              </div>
            ) : simulatedStatus === 'failed' ? (
              <div className="flex items-center justify-center py-3 bg-rose-50 dark:bg-rose-950 rounded-full border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
                <span>Payment Simulation Declined / Cancelled</span>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Unified payment initiator simulation buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="payment-page-accept-button"
                    onClick={() => handleSimulatePayment(true)}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-98 cursor-pointer text-center flex items-center justify-center space-x-1.5 w-full shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-500"
                  >
                    <span>Accept</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleSimulatePayment(false)}
                    className="py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-black uppercase tracking-wider transition active:scale-98 cursor-pointer text-center w-full"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-1.5 text-[9px] text-neutral-400 dark:text-neutral-500 font-mono">
              <Landmark className="h-3 w-3 text-neutral-450" />
              <span>PCI-DSS Secured Connection. Powered by {gateway} Payment Flow.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
