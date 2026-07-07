/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Clock, FileText, ChevronRight, ChevronLeft, CheckCircle, HelpCircle, X } from 'lucide-react';
import { Model, Booking } from '../types';

interface BookingWizardProps {
  model: Model;
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (bookingData: Omit<Booking, 'id' | 'clientId' | 'clientName' | 'createdAt'>) => void;
  clientName: string;
}

export default function BookingWizard({
  model,
  isOpen,
  onClose,
  onSubmitBooking,
  clientName
}: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [campaignType, setCampaignType] = useState('Digital Advertisement');
  const [shootType, setShootType] = useState('E-Commerce Fashion Catalog');
  
  const [location, setLocation] = useState('Mumbai, MH');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('1 Day');

  const [budgetRange, setBudgetRange] = useState('₹25,000 - ₹50,000');
  const [notes, setNotes] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  if (!isOpen) return null;

  const campaignOptions = [
    'Digital Advertisement',
    'Couture Print Editorial',
    'TV Commercial (TVC)',
    'E-Commerce Catalogue',
    'Social Media Collaborations',
    'Event Stage Emcee'
  ];

  const shootOptions = [
    'E-Commerce Fashion Catalog',
    'Outdoor Designer Editorial',
    'Indoor Studio Lighting set',
    'Live Ramp runway show',
    'UGC Video Ad content',
    'Corporate Launch Presenting'
  ];

  const durations = ['Half Day (4 hrs)', '1 Day (8 hrs)', '2 Days', '3 Days', '5 Days+'];

  const budgetRanges = [
    'Under ₹20,000',
    '₹20,000 - ₹50,000',
    '₹50,000 - ₹1,00000',
    '₹1,00,000 - ₹2,50,000',
    'Above ₹2,50,000'
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Day conversion rate
    let multiplier = 1;
    if (duration.includes('Half')) multiplier = 0.6;
    else if (duration.includes('2')) multiplier = 2;
    else if (duration.includes('3')) multiplier = 3;
    else if (duration.includes('5')) multiplier = 5;

    const estimatedPrice = Math.round(model.startingPrice * multiplier);

    onSubmitBooking({
      modelId: model.id,
      modelName: model.name,
      modelImage: model.portfolio[0],
      projectDetails: {
        brandName,
        companyName,
        campaignType,
        shootType,
        location,
        date,
        duration,
        budgetRange,
        notes
      },
      status: 'pending',
      priceAmount: estimatedPrice
    });

    setStep(1);
    onClose();
  };

  return (
    <div id="booking-wizard-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/5 bg-[#121212] text-white shadow-2xl">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              Step {step} of 4
            </span>
            <h3 className="font-sans text-base font-extrabold text-white mt-1.5">
              Book {model.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard progress visual notches */}
        <div className="grid grid-cols-4 gap-1 bg-white/5 h-1.5">
          <div className={`h-full ${step >= 1 ? 'bg-[#D4AF37]' : 'bg-transparent'}`} />
          <div className={`h-full ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-transparent'}`} />
          <div className={`h-full ${step >= 3 ? 'bg-[#D4AF37]' : 'bg-transparent'}`} />
          <div className={`h-full ${step >= 4 ? 'bg-emerald-550' : 'bg-transparent'}`} />
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* STEP 1: Project Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#D4AF37]" />
                  <span>Project Overview & Brand Profile</span>
                </h4>
                <p className="text-[11px] text-zinc-400">Provide company background and shoot details.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-350 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sabyasachi, Nykaa"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-350 mb-1">Corporate Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sabyasachi Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-350 mb-1">Campaign Type</label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {campaignOptions.map(opt => (
                    <option key={opt} value={opt} className="bg-[#121212] text-white">{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-350 mb-1">Shoot Format / Medium</label>
                <select
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {shootOptions.map(opt => (
                    <option key={opt} value={opt} className="bg-[#121212] text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Booking Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <span>Location & Timing Specifications</span>
                </h4>
                <p className="text-[11px] text-zinc-400">Pick locations and scheduled calendar duration.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-350 mb-1">Physical Shoot Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra Studios, Mumbai"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-350 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-350 mb-1">Booking Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {durations.map(d => (
                      <option key={d} value={d} className="bg-[#121212] text-white">{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Notes */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-[#D4AF37]" />
                  <span>Budget & Creative Notes</span>
                </h4>
                <p className="text-[11px] text-zinc-400">State your client budgets and requirements.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-350 mb-1">Budget Allocation Range *</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {budgetRanges.map(br => (
                    <option key={br} value={br} className="bg-[#121212] text-white">{br}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-350 mb-1">Additional Project/Styling Notes</label>
                <textarea
                  rows={4}
                  placeholder="Describe your design aesthetics, styling details, clothing sizes required, moodboard links..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Summary */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-white/5 pb-2 text-center py-2 bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                <CheckCircle className="h-7 w-7 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-extrabold text-white mt-1">Review Your Casting Proposal</h4>
                <p className="text-[10px] text-zinc-400">Check model details and pricing estimates before submitting.</p>
              </div>

              {/* Review card */}
              <div className="rounded-xl border border-white/5 p-4 space-y-3 bg-white/5 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500 font-medium">Model:</span>
                  <span className="font-extrabold text-[#D4AF37]">{model.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500 font-medium">Brand & Company:</span>
                  <span className="font-bold text-white">{brandName || 'N/A'} ({companyName || 'N/A'})</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500 font-medium">Format:</span>
                  <span className="font-medium text-zinc-300">{shootType} ({campaignType})</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500 font-medium">Schedule Timing:</span>
                  <span className="font-medium text-zinc-300">{date} • {duration}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500 font-medium">Location Spot:</span>
                  <span className="font-medium text-zinc-300">{location}</span>
                </div>
                <div className="flex items-center justify-between pt-1 font-bold text-white">
                  <span className="text-[#D4AF37]">Model's Base Daily Rate:</span>
                  <span>₹{model.startingPrice.toLocaleString('en-IN')} / day</span>
                </div>
              </div>

              <div className="rounded-xl border border-transparent p-3 bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black text-xs flex justify-between items-center shadow-lg">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-black/75">Total Estimation</p>
                  <p className="text-[10px] text-black/60 font-semibold">Calculated on day duration</p>
                </div>
                <p className="text-base font-black text-black">
                  ₹{(model.startingPrice * (duration.includes('Half') ? 0.6 : duration.includes('2') ? 2 : duration.includes('3') ? 3 : duration.includes('5') ? 5 : 1)).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Secure Confirmation Dialog Checkbox */}
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#D4AF37]/5 mt-4">
                <input
                  id="confirm-checkout-checkbox"
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-white/20 bg-[#121212] h-4 w-4 cursor-pointer"
                />
                <label htmlFor="confirm-checkout-checkbox" className="text-[11px] leading-tight text-zinc-300 select-none cursor-pointer">
                  I confirm that the casting project details summary are correct and I explicitly authorize proceeding to secure Escrow payment gateway verification.
                </label>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center space-x-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 py-2 px-5 text-xs font-bold text-white transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div /> // placeholder
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 ? (!brandName || !companyName) : step === 2 ? (!location || !date) : false}
                className="flex items-center space-x-1.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black disabled:opacity-40 py-2 px-6 text-xs font-black transition ml-auto cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="booking-submit-wizard-btn"
                disabled={!paymentConfirmed}
                className="rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed hover:brightness-110 py-2.5 px-8 text-xs font-black text-white shadow-lg transition ml-auto flex items-center gap-1.5 cursor-pointer"
              >
                <span>Confirm & Proceed to Payment</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
