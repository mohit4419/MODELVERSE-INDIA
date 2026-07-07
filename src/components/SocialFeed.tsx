/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Send, Plus, Image as ImageIcon, Loader2, X, Grid, List, Calendar } from 'lucide-react';
import { Post, Model, User } from '../types';
import { dbService } from '../services/db';

interface SocialFeedProps {
  modelId?: string; // Optional filtering to only show one model's posts (e.g. in ProfileView)
  currentModel?: Model | null; // Currently logged-in model, if any
  currentUser?: User | null; // Logged-in user, for comments and post ownership
}

export default function SocialFeed({ modelId, currentModel, currentUser }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>(modelId ? 'grid' : 'feed');
  
  // Create Post Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Comment Modal State
  const [activePostComments, setActivePostComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<{ [postId: string]: Array<{ author: string; text: string; date: string }> }>({
    'post_1': [
      { author: 'Vikram Singh', text: 'Stellar walk Priya! You absolutely crushed it on the ramp! 🔥', date: '3d ago' },
      { author: 'Nykaa Creative', text: 'Loved the energy and outfit poise! 💖', date: '3d ago' }
    ],
    'post_2': [
      { author: 'Anjali Rao', text: 'Insane physique Kabir! Keep inspiring! ⚡', date: '2d ago' },
      { author: 'Rohan Kapoor', text: 'The Nike summer colors look incredibly sleek on you.', date: '2d ago' }
    ]
  });

  useEffect(() => {
    fetchPosts();
  }, [modelId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let fetched = await dbService.getPosts();
      if (modelId) {
        fetched = fetched.filter(p => p.modelId === modelId);
      }
      setPosts(fetched);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await dbService.toggleLikePost(postId);
      
      // Update local state smoothly
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const liked = !p.likedByMe;
          return {
            ...p,
            likedByMe: liked,
            likesCount: liked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
          };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressAndGetBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 700; // Optimal size for high quality feed rendering
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressedBase64);
          } else {
            reject(new Error('Canvas context failed'));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setErrorMsg('Please write a caption for your post.');
      return;
    }
    if (!imageFile && !imagePreview) {
      setErrorMsg('Please select or drag an image for your post.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let finalImgUrl = imagePreview;
      if (imageFile) {
        finalImgUrl = await compressAndGetBase64(imageFile);
      }

      // Determine author metadata
      const authorId = currentModel?.id || modelId || 'unknown_model';
      const authorName = currentModel?.name || currentUser?.name || 'Anonymous Model';
      const authorAvatar = currentModel?.portfolio?.[0] || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150';

      const newPost: Post = {
        id: `post_${Date.now()}`,
        modelId: authorId,
        modelName: authorName,
        modelAvatar: authorAvatar,
        imageUrl: finalImgUrl,
        caption: caption.trim(),
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString()
      };

      await dbService.savePost(newPost);
      
      // Clear states and close
      setCaption('');
      setImageFile(null);
      setImagePreview('');
      setIsCreateOpen(false);
      
      // Reload feed
      fetchPosts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    
    const authorName = currentUser?.name || currentModel?.name || 'Guest Client';
    const newComment = {
      author: authorName,
      text: commentText.trim(),
      date: 'Just now'
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, commentsCount: p.commentsCount + 1 };
      }
      return p;
    }));

    setCommentText('');
  };

  const canPost = !!currentModel || (currentUser && currentUser.role === 'model');

  return (
    <div className="w-full bg-zinc-50 dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-white/5 p-6 shadow-sm">
      {/* Header section of Social Feed */}
      <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-white/5 pb-4 mb-6">
        <div>
          <h3 className="font-sans text-xl font-extrabold text-[#0F0F0F] dark:text-white flex items-center gap-1.5">
            <span>Model Social Feed</span>
            <span className="text-[10px] bg-red-500 text-white font-mono px-1.5 py-0.5 rounded-full uppercase animate-pulse">Live</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {modelId ? "Behind-the-scenes shoots, test campaigns, and agency polaroids." : "Aggregated Instagram-like stories directly from the field."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Layout switches */}
          <div className="flex items-center rounded-xl bg-neutral-200/50 dark:bg-neutral-800 p-1 border border-neutral-300/45 dark:border-neutral-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'feed' ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
              title="Full Feed View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create Post Button (Shown only to authorized model/user accounts) */}
          {canPost && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-1 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition active:scale-95 duration-100 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Post</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
          <p className="text-xs font-mono">Curating lookbooks & social feeds...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200 dark:border-neutral-700">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No social posts published yet.</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            {canPost ? "Be the first to upload behind-the-scenes content and share your lifestyle feeds directly with premium casting directors!" : "Check back later to see exclusive stories from this model's daily schedules."}
          </p>
          {canPost && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 border border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
            >
              Post Lookbook Polaroid
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid look (Instagram Style Category Grid) */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.015 }}
              onClick={() => setViewMode('feed')}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-neutral-200/50 dark:border-white/5 bg-white dark:bg-neutral-800 cursor-pointer shadow-xs"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Cover overlay detailing stats */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-6 text-white text-xs font-bold font-mono">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4.5 w-4.5 fill-white" />
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4.5 w-4.5 fill-white" />
                  <span>{postComments[post.id]?.length || post.commentsCount}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Interactive Feed View (Scrollable Post Cards) */
        <div className="space-y-6 max-w-lg mx-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/65 dark:border-white/5 overflow-hidden shadow-xs hover:shadow-sm transition duration-300"
            >
              {/* Header profile block */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-white/5">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={post.modelAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
                    alt={post.modelName}
                    className="h-8.5 w-8.5 rounded-full object-cover border border-purple-500/20"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100">{post.modelName}</h4>
                    <p className="text-[9px] font-mono font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="relative aspect-square bg-neutral-900 overflow-hidden group">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Action Buttons bar */}
              <div className="p-4 pt-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="group/btn flex items-center space-x-1.5 focus:outline-none cursor-pointer"
                    >
                      <Heart
                        className={`h-5 w-5 transition-transform duration-200 group-active/btn:scale-130 ${
                          post.likedByMe
                            ? 'fill-red-500 text-red-500'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:scale-105'
                        }`}
                      />
                      <span className="text-xs font-bold font-mono text-neutral-700 dark:text-neutral-300">
                        {post.likesCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setActivePostComments(activePostComments === post.id ? null : post.id)}
                      className="flex items-center space-x-1.5 text-neutral-600 dark:text-neutral-400 hover:text-purple-600 focus:outline-none cursor-pointer"
                    >
                      <MessageCircle className="h-5 w-5 hover:scale-105" />
                      <span className="text-xs font-bold font-mono text-neutral-700 dark:text-neutral-300">
                        {postComments[post.id]?.length || post.commentsCount}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Caption info text */}
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans mt-1">
                  <span className="font-extrabold text-neutral-900 dark:text-neutral-100 mr-1.5">{post.modelName}</span>
                  {post.caption}
                </p>

                {/* Comments box accordion */}
                {activePostComments === post.id && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5 space-y-2.5 animate-slideDown">
                    <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
                      {(postComments[post.id] || []).map((comm, cidx) => (
                        <div key={cidx} className="text-[11px] bg-neutral-50 dark:bg-neutral-850/50 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-extrabold text-neutral-950 dark:text-white">{comm.author}</span>
                            <span className="text-[9px] font-mono text-neutral-400">{comm.date}</span>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">{comm.text}</p>
                        </div>
                      ))}
                      {(!postComments[post.id] || postComments[post.id].length === 0) && (
                        <p className="text-[10px] text-neutral-400 font-mono italic text-center py-2">No comments yet. Write yours below!</p>
                      )}
                    </div>

                    {/* Writing a comment box */}
                    <div className="flex items-center space-x-2 mt-2 pt-1 border-t border-neutral-100 dark:border-white/5">
                      <input
                        type="text"
                        placeholder="Add transparent reaction..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-white focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:hover:bg-purple-900 dark:text-purple-400 transition cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {activePostComments !== post.id && (postComments[post.id]?.length || 0) > 0 && (
                  <button
                    onClick={() => setActivePostComments(post.id)}
                    className="text-[10px] text-neutral-400 hover:text-purple-600 font-mono font-bold mt-2"
                  >
                    View all {postComments[post.id]?.length} comments
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Lookbook Post Modal Overlay */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 text-white rounded-3xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0C0C0C]">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-purple-400">Postlook Polaroid Story</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Let directors view your ramp setup or live schedule</p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-900 rounded-2xl text-[11px] text-red-400 leading-normal flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Upload Section */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 font-mono">Select Campaign Shot *</label>
                  
                  {imagePreview ? (
                    <div className="relative rounded-2xl aspect-square overflow-hidden bg-[#121212] border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-black/80 hover:bg-black rounded-full text-white hover:scale-105"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl aspect-square border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/10 transition flex flex-col items-center justify-center p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="h-11 w-11 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400 mb-2.5 border border-purple-500/20">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-extrabold text-white">Drag or Browse Campaign Photo</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">Accepts JPG, PNG portrait or square matches (700px width limit)</p>
                    </div>
                  )}
                </div>

                {/* Caption form */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 font-mono">Caption / Story details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe this commercial photoshoot, runway experience, or daily fit look..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 py-3 text-xs font-black uppercase tracking-wider text-white hover:shadow-lg transition active:scale-98 duration-100 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      <span>Optimizing look & Publishing...</span>
                    </>
                  ) : (
                    <span>Publish to Live Feed</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
