/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, BookOpen } from 'lucide-react';
import { dbService } from '../services/db';
import { BlogItem } from '../types';

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dbService.getBlogs().then(setBlogs);
  }, []);

  const handleCopyLink = (blogId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${blogId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="blog-panel-portal" className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 bg-[#FCFBF9] dark:bg-[#0a0a0a] min-h-screen text-neutral-800 dark:text-white transition-colors duration-200">
      
      {selectedBlog ? (
        /* Blog Detail Reader */
        <div className="max-w-3xl mx-auto animate-fadeIn bg-white dark:bg-[#121212] rounded-2xl border border-neutral-200 dark:border-white/5 p-6 sm:p-10 shadow-2xl">
          <button
            onClick={() => setSelectedBlog(null)}
            className="mb-8 flex items-center space-x-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to casting insights</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider font-mono">
            <span>{selectedBlog.category}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{selectedBlog.publishedDate}</span>
            </div>
          </div>

          <h2 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-3.5 leading-tight">
            {selectedBlog.title}
          </h2>

          <div className="mt-4 flex items-center space-x-4 border-y border-neutral-150 dark:border-white/5 py-3.5 text-xs text-neutral-500 dark:text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <User className="h-4 w-4 text-neutral-400 dark:text-zinc-500" />
              <strong>By: {selectedBlog.author}</strong>
            </div>
          </div>

          <div className="my-8 rounded-2xl overflow-hidden aspect-video border border-neutral-200 dark:border-white/5 bg-black">
            <img src={selectedBlog.imageUrl} alt={selectedBlog.title} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          </div>

          {/* Render blog markdown-inspired custom content safely */}
          <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-zinc-350 leading-relaxed font-normal whitespace-pre-line">
            {selectedBlog.content}
          </div>

          {/* Social share widget mock */}
          <div className="border-t border-neutral-150 dark:border-white/5 mt-10 pt-6 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-zinc-500 tracking-wider">Share this casting article</span>
            <button
              onClick={() => handleCopyLink(selectedBlog.id)}
              className="flex items-center space-x-1.5 rounded-full border border-neutral-350 dark:border-white/10 hover:border-neutral-800 dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-white/5 px-4 py-2 text-xs font-bold text-neutral-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Blog List Homepage */
        <div>
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 inline-flex items-center space-x-1.5 rounded-full bg-neutral-100 dark:bg-white/5 px-3 py-1.5 border border-neutral-350 dark:border-[#D4AF37]/35">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="font-mono text-[10px] font-black uppercase text-[#D4AF37]">Insights & Industry Guides</span>
            </div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mt-3">
              ModelVerse Academy India
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-650 dark:text-zinc-400 text-sm">
              Get behind-the-scenes coaching, portfolio guides, agency insider tips, and updates directly from the casting crew.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {blogs.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBlog(b)}
                className="group cursor-pointer flex flex-col rounded-2xl bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 overflow-hidden shadow-lg dark:shadow-2xl transition duration-300 hover:border-[#D4AF37]/30 hover:-translate-y-1 transform"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-neutral-250 dark:border-white/5 animate-shimmer">
                  <img src={b.imageUrl} alt={b.title} referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-300 group-hover:scale-102" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] border border-white/10">
                    {b.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-neutral-500 dark:text-zinc-500">{b.publishedDate}</span>
                    <h3 className="font-sans text-md font-extrabold text-neutral-900 dark:text-white mt-1.5 group-hover:text-[#D4AF37] transition duration-200">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-650 dark:text-zinc-400 leading-relaxed font-normal line-clamp-2">
                      {b.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-150 dark:border-white/5 flex items-center justify-between text-xs text-neutral-500 dark:text-zinc-400">
                    <span className="font-semibold text-neutral-700 dark:text-zinc-300 font-sans">By: {b.author.split('(')[0]}</span>
                    <span className="font-extrabold text-[#D4AF37] group-hover:underline flex items-center gap-1 hover:brightness-110">
                      <span>Read Guide</span>
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
