/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Image, Paperclip, CheckCheck, Loader2, Sparkles, MessageCircle, AlertCircle, Clock } from 'lucide-react';
import { Message, Model, Booking } from '../types';

interface ChatWindowProps {
  model: Model;
  messages: Message[];
  clientId: string;
  onSendMessage: (content: string, imageUrl?: string, sendAsModel?: boolean) => void;
  bookingRef?: Booking;
  activeChatEndTime?: number | null;
  onTimerExpire?: () => void;
}

export default function ChatWindow({
  model,
  messages,
  clientId,
  onSendMessage,
  bookingRef,
  activeChatEndTime,
  onTimerExpire
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [imageInputUrl, setImageInputUrl] = useState('');
  const [showAttachmentOption, setShowAttachmentOption] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 5-minute timer countdown logic
  useEffect(() => {
    if (!activeChatEndTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((activeChatEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && onTimerExpire) {
        onTimerExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeChatEndTime, onTimerExpire]);

  const isExpired = activeChatEndTime ? timeLeft === 0 : false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Scroll to bottom when message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageInputUrl) return;

    onSendMessage(inputText.trim(), imageInputUrl || undefined);
    setInputText('');
    setImageInputUrl('');
    setShowAttachmentOption(false);

    // Simulate AI Model replying after a small delay
    setIsTyping(true);

    // Call server-side API proxy (Gemini)
    setTimeout(async () => {
      try {
        const res = await fetch('/api/chat/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelName: model.name,
            modelCategory: model.category,
            modelBiography: model.biography,
            messages,
            userMessage: inputText,
            clientId,
            modelId: model.id
          })
        });
        const data = await res.json();
        setIsTyping(false);
        // Call parent callback to append model's reply
        onSendMessage(data.response, undefined, true); // sendAsModel flag
      } catch (err) {
        setIsTyping(false);
        onSendMessage(`Thanks for your proposal! I'll review the details of "${bookingRef?.projectDetails.brandName || 'your campaign'}" and coordinate with my booking agency. Let's process the dates right here!`, undefined, true);
      }
    }, 2500);
  };

  return (
    <div id="model-chat-portal" className="border border-white/5 rounded-2xl bg-[#121212] shadow-2xl overflow-hidden flex flex-col h-[600px] max-w-4xl mx-auto text-white">
      
      {/* Header bar showing active model status */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#0a0a0a] text-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={model.portfolio[0]}
              alt={model.name}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover border border-white/10"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-[#0a0a0a]" />
          </div>
          <div>
            <h4 className="font-sans text-sm font-extrabold flex items-center gap-1.5">
              <span>{model.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-mono">Model</span>
            </h4>
            <span className="text-[10px] text-zinc-400">{model.category} • active now</span>
          </div>
        </div>

        {/* Static Booking Reference status if active */}
        {activeChatEndTime && timeLeft > 0 ? (
          <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full py-1.5 px-3.5 text-xs font-bold font-mono animate-pulse">
            <Clock className="h-3.5 w-3.5 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Session Ends: {formatTime(timeLeft)}</span>
          </div>
        ) : activeChatEndTime && timeLeft === 0 ? (
          <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/30 text-rose-400 rounded-full py-1.5 px-3.5 text-xs font-bold font-mono">
            <Clock className="h-3.5 w-3.5 text-rose-500" />
            <span>Session Expired</span>
          </div>
        ) : bookingRef ? (
          <div className="hidden sm:block text-right bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 text-[10px]">
            <span className="block text-zinc-500 uppercase font-mono tracking-widest text-[8px]">Active Booking</span>
            <strong className="text-[#D4AF37]">{bookingRef.projectDetails.brandName}</strong>
            <span className="ml-1.5 text-zinc-300 font-bold capitalize">[{bookingRef.status}]</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-full py-1 px-3 text-[10px] font-bold">
            <Sparkles className="h-3 w-3" />
            <span>Chatting via Secure Escrow</span>
          </div>
        )}
      </div>

      {/* Booking Quick Reference Guide */}
      {bookingRef && (
        <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 p-3 px-6 text-xs text-zinc-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
            <p>
              Booking proposal <strong className="text-white">₹{bookingRef.priceAmount.toLocaleString()}</strong> is pending model acceptance.
            </p>
          </div>
          <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#D4AF37] bg-white/5 border border-white/10 rounded px-2 py-0.5">
            MVI-Ref-{bookingRef.id}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#0d0d0d]">
        
        {messages.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <MessageCircle className="h-10 w-10 text-zinc-700 animate-bounce" />
            <h5 className="text-xs font-bold text-zinc-300 mt-2">Start Secure Conversation</h5>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
              Introduce your fashion campaign and negotiate budget rate scales here. Do not exchange numbers.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === clientId;
            const isSystem = msg.senderId === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="mx-auto text-center py-1 max-w-md">
                  <span className="inline-block text-[10px] bg-white/5 text-zinc-400 px-3 py-1 rounded-full font-semibold border border-white/10">
                    {msg.content}
                   </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 max-w-[75%] ${isMe ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {!isMe && (
                  <img
                    src={model.portfolio[0]}
                    alt={model.name}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-full object-cover border border-white/10"
                  />
                )}

                <div className="space-y-1 bg-transparent">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black font-semibold rounded-br-none' 
                        : 'bg-white/5 border border-white/5 text-zinc-100 rounded-bl-none'
                    }`}
                  >
                    {/* Render newlines */}
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Image Attachment showcase */}
                    {msg.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                        <img src={msg.imageUrl} alt="attachment" referrerPolicy="no-referrer" className="max-h-40 object-cover w-full" />
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Read state info */}
                  <div className={`flex items-center space-x-1 text-[8px] text-zinc-550 ${isMe ? 'justify-end' : ''}`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="h-3 w-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Model Typing Loading Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 max-w-[75%]">
            <img
              src={model.portfolio[0]}
              alt={model.name}
              referrerPolicy="no-referrer"
              className="h-6 w-6 rounded-full object-cover border border-white/10"
            />
            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-2.5 shadow-sm text-xs text-zinc-400 flex items-center space-x-1.5 font-semibold">
              <Loader2 className="h-3 w-3 animate-spin text-[#D4AF37]" />
              <span>{model.name} is drafting a reply...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar and attachments block */}
      <div className="border-t border-white/5 p-4 bg-[#121212]">
        {isExpired && (
          <div className="mb-4 flex items-start space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-left text-rose-350 text-[11px] animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Premium Chat Session Expired:</strong> Your 5-minute premium chat session with <span className="font-bold text-white">{model.name}</span> has expired. Please go to the <strong>Pricing Plans</strong> to purchase another unlock and continue chatting.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Collapsible Attachment Dialog */}
          {showAttachmentOption && !isExpired && (
            <div className="rounded-xl border border-dashed border-white/15 p-3 bg-white/5 flex items-center gap-2 animate-fadeIn">
              <span className="text-[10px] font-bold text-zinc-400 uppercase whitespace-nowrap">Image link:</span>
              <input
                type="text"
                placeholder="Paste portfolio link (https://...)"
                value={imageInputUrl}
                disabled={isExpired}
                onChange={(e) => setImageInputUrl(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-[#121212] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setImageInputUrl('')}
                disabled={isExpired}
                className="text-xs font-semibold text-red-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Attachment Button */}
            <button
              type="button"
              disabled={isExpired}
              onClick={() => setShowAttachmentOption(!showAttachmentOption)}
              className="rounded-full h-10 w-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 transition shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Attach Campaign moodboard or shoot designs"
            >
              <Image className="h-4.5 w-4.5" />
            </button>

            {/* Main Message input layout */}
            <input
              type="text"
              placeholder={isExpired ? "Chat session expired..." : `Send secure message to ${model.name}...`}
              value={inputText}
              disabled={isExpired}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#D4AF37] bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            />

            {/* Submit Button */}
            <button
              type="submit"
              id="chat-send-submit"
              disabled={isExpired}
              className="rounded-full h-10 w-10 flex items-center justify-center bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] text-black hover:brightness-110 transition shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <p className="text-[9px] text-center text-zinc-500 mt-2.5 font-medium flex items-center justify-center gap-1">
          🛡️ Secure messaging under Escrow Protocol. Please do not submit real phone handles. Close deals safely here.
        </p>
      </div>

    </div>
  );
}
