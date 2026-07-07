/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle, Clock } from 'lucide-react';

interface TabProps {
  type: 'about' | 'contact';
}

export default function AboutContact({ type }: TabProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setUserName('');
    setUserEmail('');
    setSubject('');
    setMessage('');
  };

  const faqs = [
    {
      q: "How does the ₹199 Premium Profile Unlock work?",
      a: "By paying a minor one-time ₹199 certification fee via Razorpay, you securely unlock complete verified measurements, agency direct info, and full-resolution portfolio comps. This helps keep modeling talent safe from unsolicited scouting or marketing spam in India."
    },
    {
      q: "Is there an escrow protection for client payments in India?",
      a: "Yes! 100% of agreed budget payments are held in secure platform escrow accounts during campaign schedules. Funds are only distributed to models' or agencies' registered bank nodes when clients and talents digitally sign off on campaign deliverables."
    },
    {
      q: "How long does model portfolio approval take?",
      a: "Our casting moderation panel verifies passport/Aadhaar compliance proofs and portfolio quality guidelines within 3-4 hours of talent submitting their registrations."
    },
    {
      q: "Can I manage multiple modeling agencies under ModelVerse India?",
      a: "Enterprise agency multi-account management is currently on our active roadmap for release in late 2026. For now, booking managers can set agency ref contacts directly under model specs."
    }
  ];

  if (type === 'about') {
    return (
      <div id="about-us-portal" className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 space-y-16 text-neutral-850 dark:text-white transition-colors duration-250">
        
        {/* Mission block */}
        <div className="text-center space-y-4">
          <span className="font-mono text-xs font-black uppercase tracking-widest text-[#D4AF37] bg-neutral-100 dark:bg-white/5 border border-[#D4AF37]/30 rounded-full px-3 py-1.5">
            ESTABLISHED 2026
          </span>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-4">
            India's Leading Casting Ecosystem
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm sm:text-base text-neutral-600 dark:text-zinc-400 leading-relaxed font-normal">
            ModelVerse India specializes in streamlining model discovery, secure contract escrow, real-time campaign chat arrangements, and automated financial settlements. We empower brands, couturiers, and event directors to connect seamlessly with verified models, actors, event hosts, and digital UGC creators.
          </p>
        </div>

        {/* Corporate core metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-6 shadow-2xl">
            <strong className="block text-3xl font-extrabold text-[#D4AF37]">6 +</strong>
            <span className="text-xs text-neutral-500 dark:text-zinc-450 mt-1.5 block uppercase font-mono tracking-wider font-bold">Niche Agencies Consolidated</span>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-6 shadow-2xl">
            <strong className="block text-3xl font-extrabold text-[#D4AF37]">₹25,00,000 +</strong>
            <span className="text-xs text-neutral-500 dark:text-zinc-450 mt-1.5 block uppercase font-mono tracking-wider font-bold">Escrow Settled Safely</span>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-6 shadow-2xl">
            <strong className="block text-3xl font-extrabold text-[#D4AF37]">100%</strong>
            <span className="text-xs text-neutral-500 dark:text-zinc-450 mt-1.5 block uppercase font-mono tracking-wider font-bold">Selfie & ID Verified Talent</span>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="border-t border-neutral-200 dark:border-white/5 pt-12">
          <div className="mb-8 text-center sm:text-left">
            <h3 className="font-sans text-xl font-black text-neutral-900 dark:text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-neutral-500 dark:text-zinc-450 mt-1">Get fast guidance on casting approvals, payments, and client rules.</p>
          </div>

          <div className="space-y-4 max-w-4xl">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-sans text-xs sm:text-sm font-bold text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className="h-4.5 w-4.5 text-[#D4AF37] shrink-0" />
                </button>
                {activeFaq === idx && (
                  <div className="p-4 pt-0 border-t border-neutral-200 dark:border-white/5 text-[11px] sm:text-xs text-neutral-600 dark:text-zinc-400 leading-relaxed font-semibold bg-neutral-50/50 dark:bg-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // CONTACT US PORTAL
  return (
    <div id="contact-us-portal" className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8 text-neutral-850 dark:text-white animate-fadeIn transition-colors duration-250">
      <div className="mb-12 text-center">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Contact ModelVerse India Support
        </h2>
        <p className="mt-3 text-xs text-neutral-500 dark:text-zinc-450 max-w-md mx-auto leading-relaxed">
          Need special casting coordination, bulk enterprise contracts, or invoice mediation? Reach our support crew 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact info details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-white/5 bg-white dark:bg-[#121212] p-6 shadow-2xl space-y-6 text-xs text-neutral-600 dark:text-zinc-400">
            <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">Casting Head Office</h4>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 dark:text-white">Castic Tower, Nariman Point</strong>
                <p className="text-neutral-500 dark:text-zinc-500 mt-1">Marine Drive East, Mumbai, Maharashtra 400021</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 dark:text-white">Call Support Nodes</strong>
                <p className="text-neutral-500 dark:text-zinc-500 mt-1">+91 (22) 4880-9002 (Escrow Help)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 dark:text-white">Corporate Inquiries</strong>
                <p className="text-neutral-500 dark:text-zinc-500 mt-1">escalations@modelverse.in</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 dark:text-white">Business Hours</strong>
                <p className="text-neutral-500 dark:text-zinc-500 mt-1">10:00 AM - 7:00 PM (Monday - Saturday)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form panel */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-2xl p-6 shadow-2xl">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-550/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce border border-emerald-500/30">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-base font-extrabold text-neutral-900 dark:text-white">Message Transmitted!</h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-sm mx-auto">
                We have logged your escalation concern. A Senior Casting Manager will follow up at your email in 90 minutes.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-full border border-neutral-300 dark:border-white/10 px-5 py-2 text-xs font-semibold text-neutral-750 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10 transition cursor-pointer"
              >
                Send another dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-350 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Sethi"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-white/5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-350 mb-1">Your Corporate Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aman@company.co"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-white/5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-350 mb-1">Subject Matter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request support with bulk corporate bookings"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-white/5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-zinc-350 mb-1">Detailed Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your casting escalation, bank payout questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-[#FCFBF9] dark:bg-white/5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black text-xs font-black flex items-center justify-center space-x-1.5 transition active:scale-98 hover:brightness-110 cursor-pointer shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Transmit Escalation Protocol</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
