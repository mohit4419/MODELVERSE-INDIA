/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

export default function TypingHeadline() {
  const line1 = "Casting analysis";
  const line2 = "for real-time campaign discussions";

  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    // Blinking clean indicator cursor
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setText1("");
    setText2("");

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runTypingSequence = async () => {
      // 1. Initial short pause for elegance
      await sleep(350);
      if (isCancelled) return;

      // 2. Type "Casting analysis" with human timing (randomized delay simulating actual human keypress cadence)
      for (let i = 1; i <= line1.length; i++) {
        if (isCancelled) return;
        setText1(line1.substring(0, i));
        await sleep(55 + Math.random() * 65);
      }

      // Hold briefly at the end of the first line
      await sleep(250);
      if (isCancelled) return;

      // 3. Type "for real-time campaign discussions" at an active copywriter velocity
      for (let i = 1; i <= line2.length; i++) {
        if (isCancelled) return;
        setText2(line2.substring(0, i));
        await sleep(35 + Math.random() * 55);
      }
    };

    runTypingSequence();

    // Reset loop exactly every 10 seconds
    const intervalTimer = setTimeout(() => {
      setCycleKey(prev => prev + 1);
    }, 10000);

    return () => {
      isCancelled = true;
      clearTimeout(intervalTimer);
    };
  }, [cycleKey]);

  // Track animation state to position cursor seamlessly without jumpiness
  const isLine1Typing = text1.length < line1.length;
  const isLine2Typing = text1.length === line1.length && text2.length < line2.length;
  const isFinished = text2.length === line2.length;

  return (
    <h1 
      id="hero-typing-headline"
      className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F0F0F] leading-[1.2] overflow-visible select-none"
    >
      {/* Line 1 with premium vivid sunset gradient */}
      <span className="block min-h-[1.25em] overflow-visible py-1">
        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          {text1}
        </span>
        {isLine1Typing && (
          <span 
            className={`inline-block ml-1 bg-gradient-to-r from-purple-600 to-pink-600 w-[3px] h-[0.8em] align-middle animate-pulse ${
              showCursor ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        )}
      </span>

      {/* Line 2 with high contrast readable charcoal dark shade */}
      <span className="block text-neutral-900 mt-2 min-h-[1.25em] overflow-visible">
        {text2}
        {(isLine2Typing || (isFinished && showCursor)) && (
          <span 
            className={`inline-block ml-1 bg-neutral-900 w-[3px] h-[0.8em] align-middle ${
              isFinished ? 'animate-none' : 'animate-pulse'
            }`} 
          />
        )}
      </span>
    </h1>
  );
}
