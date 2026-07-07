import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Mic, MicOff, Search, Compass, Film, FileText, 
  RefreshCcw, Play, Pause, ChevronRight, Eye, Check, Loader2, 
  MapPin, Send, HelpCircle, User, Download, Upload, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICreativeStudioProps {
  userEmail: string;
  triggerToast?: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

interface Coach {
  id: 'riya' | 'aarav' | 'zack' | 'diya';
  name: string;
  title: string;
  voiceName: string;
  gender: 'female' | 'male';
  vibe: string;
  description: string;
  avatarBg: string;
  greeting: string;
}

const COACHES: Record<'riya' | 'aarav' | 'zack' | 'diya', Coach> = {
  riya: {
    id: 'riya',
    name: 'Coach Riya',
    title: 'AI Runway & Casting Vocal Coach',
    voiceName: 'Kore',
    gender: 'female',
    vibe: 'Elegant, warm, and highly supportive',
    description: 'High-fashion casting director focusing on runway poise, speech projection, and contract alignments.',
    avatarBg: 'from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30',
    greeting: 'Welcome to the Live Casting Audition standard room. Speak to voice coach Riya to practice styling answers and receive feedback.'
  },
  aarav: {
    id: 'aarav',
    name: 'Director Aarav',
    title: 'Elite Runway & Campaign Coordinator',
    voiceName: 'Fenrir',
    gender: 'male',
    vibe: 'Deep, professional, and authoritative',
    description: '15+ year runway veteran teaching technical catwalk turns, high-pressure audits, and fierce ramp presence.',
    avatarBg: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    greeting: 'Director Aarav is on air. Let’s get technical. Ask me about complex choreographies, Milan catwalk standards, or negotiation.'
  },
  zack: {
    id: 'zack',
    name: 'Stylist Zack',
    title: 'Fierce Style & Avant-Garde Coach',
    voiceName: 'Puck',
    gender: 'male',
    vibe: 'High-energy, creative, and flamboyant',
    description: 'Vibrant editorial runway stylist teaching bold creative posing, confidence outbursts, and dramatic rhythm.',
    avatarBg: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
    greeting: 'Hey gorgeous! Zack here! Ready to be absolutely fierce and fabulous? Speak up and let’s work that ramp!'
  },
  diya: {
    id: 'diya',
    name: 'Mentor Diya',
    title: 'Mindfulness & Model Wellness Mentor',
    voiceName: 'Aoede',
    gender: 'female',
    vibe: 'Calm, soothing, and compassionate',
    description: 'Empathetic counselor focusing on mental confidence, camera anxiety, and authentic speech projection.',
    avatarBg: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    greeting: 'Hello dear. Take a deep breath. Let’s practice centered speech projection and release any audition stress together.'
  }
};

export default function AICreativeStudio({ userEmail, triggerToast }: AICreativeStudioProps) {
  const [activeSubTab, setActiveSubTab] = useState<'voice' | 'image' | 'video' | 'grounding' | 'brief' | 'bio'>('voice');

  // ==========================================
  // VOICE AUDITION STATE & LOGIC (GEMINI LIVE)
  // ==========================================
  const [selectedCoachId, setSelectedCoachId] = useState<'riya' | 'aarav' | 'zack' | 'diya'>('riya');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceMessages, setVoiceMessages] = useState<{ sender: 'user' | 'ai' | 'sys', text: string }[]>([
    { sender: 'sys', text: COACHES.riya.greeting }
  ]);

  // Synchronize greeting when selected coach changes
  useEffect(() => {
    if (!isVoiceActive) {
      setVoiceMessages([
        { sender: 'sys', text: COACHES[selectedCoachId].greeting }
      ]);
    }
  }, [selectedCoachId, isVoiceActive]);
  const [microphoneAllowed, setMicrophoneAllowed] = useState<boolean | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlaybackTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Real-time audio wave visualization
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const startVoiceSession = async () => {
    try {
      setVoiceMessages(prev => [...prev, { sender: 'sys', text: `Initializing ${COACHES[selectedCoachId].name}'s Voice Coaching feed...` }]);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicrophoneAllowed(true);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-audition?voice=${selectedCoachId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      nextPlaybackTimeRef.current = audioCtx.currentTime;

      // setup visualizer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      ws.onopen = () => {
        setIsVoiceActive(true);
        setVoiceMessages(prev => [...prev, { sender: 'sys', text: 'Live! Speak naturally. Ask: "How do I walk the runway?"' }]);

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;
        
        source.connect(processor);
        processor.connect(audioCtx.destination);

        // Convert audio float samples to Int16 PCM chunks
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const floatSamples = e.inputBuffer.getChannelData(0);
          const intSamples = new Int16Array(floatSamples.length);
          for (let i = 0; i < floatSamples.length; i++) {
            const s = Math.max(-1, Math.min(1, floatSamples[i]));
            intSamples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const bytes = new Uint8Array(intSamples.buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          ws.send(JSON.stringify({ audio: base64 }));
        };

        // start visual analyzer
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const updateWave = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          setAudioLevel(avg / 128); // normalize
          animationFrameRef.current = requestAnimationFrame(updateWave);
        };
        animationFrameRef.current = requestAnimationFrame(updateWave);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setVoiceMessages(prev => [...prev, { sender: 'sys', text: `Error: ${data.error}` }]);
            stopVoiceSession();
          } else if (data.audio) {
            // Queue raw Int16 PCM chunk for smooth gapless audio output
            playIncomingPCM(data.audio);
          } else if (data.interrupted) {
            // Cancel current queued playbacks on interruption
            nextPlaybackTimeRef.current = audioCtx.currentTime;
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onerror = (err) => {
        console.error(err);
        setVoiceMessages(prev => [...prev, { sender: 'sys', text: 'Network connection broke.' }]);
        stopVoiceSession();
      };

      ws.onclose = () => {
        setIsVoiceActive(false);
        setVoiceMessages(prev => [...prev, { sender: 'sys', text: 'Voice Coach offline.' }]);
      };

    } catch (err: any) {
      console.error(err);
      setMicrophoneAllowed(false);
      setVoiceMessages(prev => [...prev, { sender: 'sys', text: 'Microphone permission declined or setup failed.' }]);
    }
  };

  const playIncomingPCM = (base64Audio: string) => {
    if (!audioCtxRef.current) return;
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = audioCtxRef.current.createBuffer(1, float32.length, 16000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);

      const now = audioCtxRef.current.currentTime;
      if (nextPlaybackTimeRef.current < now) {
        nextPlaybackTimeRef.current = now;
      }
      source.start(nextPlaybackTimeRef.current);
      nextPlaybackTimeRef.current += audioBuffer.duration;
    } catch (e) {
      console.error('Error queuing pcm speech output:', e);
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceActive(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const selectCoach = (coachId: 'riya' | 'aarav' | 'zack' | 'diya') => {
    if (isVoiceActive) {
      stopVoiceSession();
    }
    setSelectedCoachId(coachId);
  };

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);


  // ==========================================
  // IMAGE LAB STATE & LOGIC
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState('');
  const [imgAspectRatio, setImgAspectRatio] = useState('1:1');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [generatedImgBase64, setGeneratedImgBase64] = useState<string | null>(null);
  
  // Image Editing parameters
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImg, setIsEditingImg] = useState(false);
  const [editorSourceImg, setEditorSourceImg] = useState<string | null>(null);

  const handleSourceImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditorSourceImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageGeneration = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImg(true);
    setGeneratedImgUrl(null);
    try {
      const res = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: imgAspectRatio })
      });
      const data = await res.json();
      if (data.success && data.url) {
        setGeneratedImgUrl(data.url);
        setGeneratedImgBase64(data.base64);
        setImagePrompt('');
        if (triggerToast) triggerToast('Image Generated', 'Your AI creative model photo has been generated successfully!', 'success');
      } else {
        if (triggerToast) {
          triggerToast('Generation Failed', data.error || 'Failed to generate image.', 'error');
        } else {
          alert(data.error || 'Failed to generate image.');
        }
      }
    } catch (e) {
      console.error(e);
      if (triggerToast) {
        triggerToast('Generation Error', 'Network error while creating image.', 'error');
      } else {
        alert('Network error while creating image.');
      }
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const triggerImageEdit = async () => {
    if (!editPrompt.trim() || !editorSourceImg) return;
    setIsEditingImg(true);
    try {
      const res = await fetch('/api/ai/image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: editPrompt, 
          base64Image: editorSourceImg 
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        setGeneratedImgUrl(data.url);
        setGeneratedImgBase64(data.base64);
        setEditorSourceImg(null); // convert to output container
        setEditPrompt('');
        if (triggerToast) triggerToast('Image Edited', 'Your AI model edit has been completed successfully!', 'success');
      } else {
        if (triggerToast) {
          triggerToast('Editing Failed', data.error || 'Failed to edit image.', 'error');
        } else {
          alert(data.error || 'Failed to edit image.');
        }
      }
    } catch (e) {
      console.error(e);
      if (triggerToast) {
        triggerToast('Editing Error', 'Error editing picture.', 'error');
      } else {
        alert('Error editing picture.');
      }
    } finally {
      setIsEditingImg(false);
    }
  };


  // ==========================================
  // VIDEO LAB STATE & LOGIC (VEO GENERATE)
  // ==========================================
  const [videoPrompt, setVideoPrompt] = useState('');
  const [vidAspectRatio, setVidAspectRatio] = useState('16:9');
  const [videoSourceImg, setVideoSourceImg] = useState<string | null>(null);
  const [videoOperationId, setVideoOperationId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'starting' | 'polling' | 'downloading' | 'completed' | 'failed'>('idle');
  const [pollingCountdown, setPollingCountdown] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const handleVideoSourceImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoSourceImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVideoGeneration = async () => {
    if (!videoPrompt.trim()) return;
    setVideoStatus('starting');
    setGeneratedVideoUrl(null);
    setVideoOperationId(null);
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: videoPrompt, 
          base64Image: videoSourceImg,
          aspectRatio: vidAspectRatio 
        })
      });
      const data = await res.json();
      if (data.success && data.operationName) {
        setVideoOperationId(data.operationName);
        setVideoStatus('polling');
        if (triggerToast) triggerToast('Video Initiated', 'Veo video compilation started in the background.', 'info');
        startPollingVideo(data.operationName);
      } else {
        setVideoStatus('failed');
        if (triggerToast) {
          triggerToast('Video Failed', data.error || 'Veo service initiation failed.', 'error');
        } else {
          alert(data.error || 'Veo service initiation failed.');
        }
      }
    } catch (e) {
      console.error(e);
      setVideoStatus('failed');
      if (triggerToast) triggerToast('Error', 'Failed to initiate video generation.', 'error');
    }
  };

  const startPollingVideo = (opName: string) => {
    let attempt = 0;
    const interval = setInterval(async () => {
      attempt++;
      setPollingCountdown(60 - (attempt % 60));
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName })
        });
        const data = await res.json();
        if (data.success && data.done) {
          clearInterval(interval);
          downloadAndServeVideo(opName);
        }
      } catch (err) {
        console.error('Polling operations error:', err);
      }
    }, 5000);
  };

  const downloadAndServeVideo = async (opName: string) => {
    setVideoStatus('downloading');
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName })
      });
      if (res.ok) {
        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        setGeneratedVideoUrl(localUrl);
        setVideoStatus('completed');
      } else {
        setVideoStatus('failed');
      }
    } catch (e) {
      console.error(e);
      setVideoStatus('failed');
    }
  };


  // ==========================================
  // GOOGLE MAPS & SEARCH GROUNDING STATE & LOGIC
  // ==========================================
  const [intelligencePrompt, setIntelligencePrompt] = useState('');
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [intelligenceResult, setIntelligenceResult] = useState<string | null>(null);
  const [isQueryingIntel, setIsQueryingIntel] = useState(false);

  const performGroundingQuery = async () => {
    if (!intelligencePrompt.trim()) return;
    setIsQueryingIntel(true);
    setIntelligenceResult(null);
    try {
      const endpoint = groundingMode === 'maps' ? '/api/ai/maps-grounding' : '/api/ai/search-grounding';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: intelligencePrompt })
      });
      const data = await res.json();
      if (data.success && data.response) {
        setIntelligenceResult(data.response);
      } else {
        if (triggerToast) {
          triggerToast('Query Failed', data.error || 'Failed to retrieve real-time grounded intelligence.', 'error');
        } else {
          alert(data.error || 'Failed to retrieve real-time grounded intelligence.');
        }
      }
    } catch (e) {
      console.error(e);
      if (triggerToast) {
        triggerToast('Query Error', 'Error fetching grounded answers.', 'error');
      } else {
        alert('Error fetching grounded answers.');
      }
    } finally {
      setIsQueryingIntel(false);
    }
  };


  // ==========================================
  // CAMPAIGN PLANNING BRIEF & BIO ENHANCER LOGIC
  // ==========================================
  // CampaignPlanner
  const [campaignPrompt, setCampaignPrompt] = useState('');
  const [campaignResult, setCampaignResult] = useState<string | null>(null);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);

  const makeCampaignBrief = async () => {
    if (!campaignPrompt.trim()) return;
    setIsGeneratingCampaign(true);
    setCampaignResult(null);
    try {
      const res = await fetch('/api/ai/campaign-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: campaignPrompt })
      });
      const data = await res.json();
      if (data.success && data.response) {
        setCampaignResult(data.response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  // BioEnhancer
  const [crudeBioText, setCrudeBioText] = useState('');
  const [enhancedBio, setEnhancedBio] = useState<string | null>(null);
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);

  const enhanceBioText = async () => {
    if (!crudeBioText.trim()) return;
    setIsEnhancingBio(true);
    setEnhancedBio(null);
    try {
      const res = await fetch('/api/ai/bio-enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: crudeBioText })
      });
      const data = await res.json();
      if (data.success && data.response) {
        setEnhancedBio(data.response);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancingBio(false);
    }
  };


  return (
    <div id="ai-creative-studio-root" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 select-none transition-colors duration-250">
      
      {/* Visual Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-550/10 to-orange-550/10 border border-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 font-mono tracking-wider uppercase mb-3">
          <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-spin" />
          <span>ModelVerse AI Creative Lab</span>
        </div>
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none mb-3">
          Omni-Modality Casting Intelligence
        </h1>
        <p className="font-sans text-sm text-neutral-500 dark:text-zinc-400 font-medium">
          Leverage pristine model layers to create luxury composite cards, practice vocal castings with Live AI coaches, locate production studios, and plan high-fashion campaign briefs.
        </p>
      </div>

      {/* Grid Layout navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Control Panel Tabs */}
        <div className="col-span-1 flex flex-col space-y-2.5">
          <div className="bg-white dark:bg-[#121212] rounded-2xl border border-neutral-100 dark:border-white/5 p-4 shadow-sm transition-colors">
            <h3 className="text-xs font-black font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3 px-1.5">
              AI MODALITIES
            </h3>
            
            <button
              onClick={() => setActiveSubTab('voice')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition ${
                activeSubTab === 'voice' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>1. Live Voice Auditions</span>
            </button>

            <button
              onClick={() => setActiveSubTab('image')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition mt-1 ${
                activeSubTab === 'image' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>2. Portfolio Photo Lab</span>
            </button>

            <button
              onClick={() => setActiveSubTab('video')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition mt-1 ${
                activeSubTab === 'video' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <Film className="h-4 w-4" />
              <span>3. Veo Portrait Animator</span>
            </button>

            <button
              onClick={() => setActiveSubTab('grounding')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition mt-1 ${
                activeSubTab === 'grounding' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>4. Maps & Search Grounding</span>
            </button>

            <button
              onClick={() => setActiveSubTab('brief')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition mt-1 ${
                activeSubTab === 'brief' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>5. Campaign Brief Creator</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bio')}
              className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition mt-1 ${
                activeSubTab === 'bio' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-250' 
                  : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-55/60 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>6. High-Fashion Bio Enhancer</span>
            </button>
          </div>

          {/* Prompt presets help widget */}
          <div className="bg-[#FAF5F2] dark:bg-neutral-900 border border-[#EBE3DC] dark:border-white/5 rounded-2xl p-4 text-[11px] text-neutral-600 dark:text-zinc-400">
            <span className="font-bold text-[#8A7968] dark:text-[#D4AF37] block mb-1 uppercase font-mono tracking-wider flex items-center space-x-1">
              <HelpCircle className="h-3 w-3" />
              <span>Casting Presets Suggestions</span>
            </span>
            <ul className="space-y-1.5 font-sans font-medium">
              <li className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => {
                if (activeSubTab === 'image') setImagePrompt('A majestic cinematic portrait photo of an elegant female Indian model styled in luxurious golden lehenga garment, soft backlit studio setup, 8k');
                if (activeSubTab === 'grounding') setIntelligencePrompt('Locate modeling and catalog photo studios near Bandra West Mumbai with active reviews');
                if (activeSubTab === 'brief') setCampaignPrompt('Organic summer resort-wear linen brand seeking 1-day shoot in Goa beaches, aiming for standard organic lifestyle aesthetics.');
                if (activeSubTab === 'bio') setCrudeBioText('i am Priya from delhi. i do 2 years of modeling. i walked for Lakme. i like casual shoot and clothing brands.');
              }}>
                ✦ "Luxe Ethnic Studio lehenga look"
              </li>
              <li className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => {
                if (activeSubTab === 'image') setImagePrompt('A muscular Indian male model wearing futuristic white active athletic clothing, running on neon urban rooftop, night aesthetic, action snapshot');
                if (activeSubTab === 'grounding') {
                  setIntelligencePrompt('Lakme Fashion Week 2026 scheduling dates and model registration criteria details');
                  setGroundingMode('search');
                }
              }}>
                ✦ "Athletic neon urban sportswear catalog"
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Main Interaction Screen */}
        <div className="col-span-1 lg:col-span-3 bg-white dark:bg-[#121212] rounded-3xl border border-neutral-100 dark:border-white/5 p-6 shadow-sm min-h-[500px] flex flex-col justify-between transition-colors">
          
          <AnimatePresence mode="wait">
            
            {/* SUB-TAB 1: LIVE VOICE AUDITION */}
            {activeSubTab === 'voice' && (
              <motion.div
                key="tab-voice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-white/10 pb-3">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <Mic className="h-5 w-5 text-purple-600" />
                        <span>{COACHES[selectedCoachId].name}: {COACHES[selectedCoachId].title}</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium">
                        Real-time low-latency interactive audio guidance built with Gemini 3.1 Live API ({COACHES[selectedCoachId].vibe}).
                      </p>
                    </div>
                    
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVoiceActive ? 'bg-emerald-400' : 'bg-neutral-300'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isVoiceActive ? 'bg-emerald-500' : 'bg-neutral-300'}`}></span>
                    </span>
                  </div>

                  {/* Coach Selector Grid */}
                  <div className="mb-6">
                    <span className="text-[10px] font-black font-mono tracking-wider text-neutral-400 uppercase block mb-2.5">
                      Select Audition Vocal Coach / Runway Mentor
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(Object.keys(COACHES) as Array<'riya' | 'aarav' | 'zack' | 'diya'>).map((id) => {
                        const coach = COACHES[id];
                        const isSelected = selectedCoachId === id;
                        return (
                          <button
                            key={id}
                            onClick={() => selectCoach(id)}
                            className={`p-3 rounded-2xl border text-left transition duration-200 cursor-pointer flex flex-col justify-between h-full relative ${
                              isSelected 
                                ? 'bg-[#18181B] dark:bg-neutral-950 border-neutral-900 dark:border-purple-500 text-white shadow-md' 
                                : 'bg-neutral-50/50 dark:bg-neutral-900/60 border-neutral-200/60 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-purple-500 rounded-full animate-ping" />
                            )}
                            <div>
                              <span className={`block text-xs font-black ${isSelected ? 'text-purple-400' : 'text-neutral-900 dark:text-white'}`}>
                                {coach.name}
                              </span>
                              <span className="block text-[9px] font-bold font-mono text-neutral-400 mt-0.5 leading-tight">
                                {coach.voiceName} ({coach.gender})
                              </span>
                              <p className="text-[10px] text-neutral-500 mt-2 font-medium leading-normal line-clamp-2">
                                {coach.description}
                              </p>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-neutral-100/10 flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                                {coach.vibe.split(',')[0]}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-bold uppercase text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono">
                                  Active
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {isVoiceActive && (
                      <p className="text-[9px] text-purple-500 font-bold mt-1.5 leading-tight">
                        ● Changing your coach now will end the active live voice feed and connect to the new coach.
                      </p>
                    )}
                  </div>

                  {/* Audio visualization sphere */}
                  <div className="flex flex-col items-center justify-center bg-radial-gradient py-12 px-6 rounded-2xl bg-neutral-950 text-white relative overflow-hidden mb-6 min-h-[220px]">
                    <div className="absolute inset-x-0 bottom-0 top-0 opacity-15">
                      <div className="grid grid-cols-12 gap-0.5 items-end h-full px-4 pt-12">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div 
                            key={i} 
                            style={{ height: `${Math.max(10, audioLevel * (Math.sin(i / 3) * 60 + 50))}px` }}
                            className="bg-purple-400 w-full transition-all duration-75 rounded-t"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Concentric ambient pulsating circles */}
                    <div className="relative z-10 flex flex-col items-center">
                      <motion.div 
                        style={{ scale: isVoiceActive ? 1 + audioLevel * 0.4 : 1 }}
                        className={`h-28 w-28 rounded-full flex items-center justify-center transition-shadow shadow-lg ${
                          isVoiceActive 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-550/30 ring-8 ring-purple-550/10' 
                            : 'bg-neutral-800 border border-neutral-700 shadow-black/40'
                        }`}
                      >
                        <Mic className={`h-8 w-8 text-white ${isVoiceActive ? 'animate-bounce' : ''}`} />
                      </motion.div>
                      <span className="mt-4 text-xs font-bold font-mono tracking-widest uppercase text-neutral-400">
                        {isVoiceActive ? 'Voice Feed Active • Speak' : 'Voice Coach Idle'}
                      </span>
                    </div>
                  </div>

                  {/* Message Transcript Screen */}
                  <div className="max-h-[160px] overflow-y-auto space-y-2 border border-neutral-100 dark:border-white/10 bg-[#FAF9F8] dark:bg-neutral-950 rounded-xl p-3 text-xs mb-4 transition-colors">
                    {voiceMessages.map((msg, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${
                          msg.sender === 'ai' ? 'text-purple-600 dark:text-purple-400' : msg.sender === 'user' ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'
                        }`}>
                          {msg.sender === 'ai' ? COACHES[selectedCoachId].name : msg.sender === 'user' ? 'You' : 'System Terminal'}
                        </span>
                        <p className="text-neutral-800 dark:text-neutral-200 mt-0.5 font-sans leading-relaxed font-semibold">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session controls */}
                <div className="flex items-center space-x-3 pt-3 border-t border-neutral-100 dark:border-white/10">
                  {!isVoiceActive ? (
                    <button
                      onClick={startVoiceSession}
                      className="flex-1 flex items-center justify-center space-x-2 rounded-full bg-black dark:bg-[#1A1A1E] border dark:border-white/10 py-4 px-6 text-sm font-bold text-white shadow-lg hover:bg-neutral-900 dark:hover:bg-neutral-800 transition cursor-pointer"
                    >
                      <Mic className="h-4.5 w-4.5 text-white" />
                      <span>Start Voice Audition & Coaching</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceSession}
                      className="flex-1 flex items-center justify-center space-x-2 rounded-full bg-red-600 py-4 px-6 text-sm font-bold text-white shadow-lg hover:bg-red-500 transition cursor-pointer"
                    >
                      <MicOff className="h-4.5 w-4.5 text-white" />
                      <span>Stop Voice Session</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 2: PORTFOLIO PHOTO LAB (IMAGENE 3 / GEMINI 3.1) */}
            {activeSubTab === 'image' && (
              <motion.div
                key="tab-image"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3 mb-4">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <ImageIcon className="h-5 w-5 text-purple-600" />
                        <span>AI Portfolio Image Stylist (Imagen 3)</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium font-sans">
                        Generate breathtaking model avatars or edit physical details with prompt masks instantly.
                      </p>
                    </div>
                  </div>

                  {/* Dual Mode Panel: Generator vs Editor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Left Column Controls */}
                    <div className="space-y-4">
                      
                      {/* Generative styling fields */}
                      <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                        <span className="text-[10px] font-black font-mono tracking-wider text-neutral-400 block uppercase mb-1.5">
                          Mode A: Fresh Portfolio Generation
                        </span>
                        
                        <textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="A luxury high-profile outdoor catalog shot of an elegant Indian male model..."
                          className="w-full text-xs font-semibold p-3 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
                          rows={3}
                        />

                        {/* Aspect ratios selector */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500">Aspect Ratio:</span>
                          <select
                            value={imgAspectRatio}
                            onChange={(e) => setImgAspectRatio(e.target.value)}
                            className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-white/10 rounded-lg p-1.5 font-bold focus:outline-none"
                          >
                            <option value="1:1" className="bg-white dark:bg-neutral-900">1:1 Square</option>
                            <option value="3:4" className="bg-white dark:bg-neutral-900">3:4 Portrait</option>
                            <option value="4:3" className="bg-white dark:bg-neutral-900">4:3 Landscape</option>
                            <option value="9:16" className="bg-white dark:bg-neutral-900">9:16 Cinema Portrait</option>
                            <option value="16:9" className="bg-white dark:bg-neutral-900">16:9 Cinema Landscape</option>
                          </select>
                        </div>

                        <button
                          onClick={triggerImageGeneration}
                          disabled={isGeneratingImg || !imagePrompt.trim()}
                          className="w-full flex items-center justify-center space-x-1.5 mt-4 text-xs font-bold font-sans bg-black dark:bg-[#1A1A1E] border dark:border-white/10 hover:bg-neutral-800 dark:hover:bg-neutral-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-850 text-white rounded-xl py-3 shadow transition cursor-pointer"
                        >
                          {isGeneratingImg ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 text-white animate-spin" />
                              <span>Styling Model Canvas...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
                              <span>Generate High-Fashion Portrait</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Editing fields */}
                      <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                        <span className="text-[10px] font-black font-mono tracking-wider text-neutral-400 block uppercase mb-1.5">
                          Mode B: Edit Existing Image With Text
                        </span>

                        <div className="flex items-center space-x-3 mb-2">
                          <label className="flex-1 flex flex-col justify-center items-center h-25 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center p-2">
                            <Upload className="h-4.5 w-4.5 text-neutral-400 mb-1" />
                            <span className="text-[10px] font-extrabold text-neutral-600 dark:text-neutral-300 block">Upload Portrait</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleSourceImgUpload} 
                              className="hidden" 
                            />
                          </label>
                          
                          {editorSourceImg && (
                            <div className="relative h-25 w-25 rounded-xl overflow-hidden shadow-sm border border-neutral-200 dark:border-white/10 bg-neutral-200">
                              <img src={editorSourceImg} className="h-full w-full object-cover" />
                              <button 
                                onClick={() => setEditorSourceImg(null)}
                                className="absolute top-1 right-1 bg-black/60 rounded-full h-4 w-4 flex items-center justify-center text-white text-[8px] font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder="e.g.: 'Add a sleek black leather fashion designer jacket to the model'"
                          disabled={!editorSourceImg}
                          className="w-full text-xs font-semibold p-3 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none disabled:bg-neutral-100 dark:disabled:bg-neutral-950"
                          rows={2}
                        />

                        <button
                          onClick={triggerImageEdit}
                          disabled={isEditingImg || !editPrompt.trim() || !editorSourceImg}
                          className="w-full flex items-center justify-center space-x-1.5 mt-3 text-xs font-bold font-sans bg-purple-600 hover:bg-purple-750 disabled:bg-neutral-200 dark:disabled:bg-neutral-850 text-white rounded-xl py-3 shadow transition cursor-pointer"
                        >
                          {isEditingImg ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 text-white animate-spin" />
                              <span>Applying Prompt Brush...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4.5 w-4.5 text-pink-400" />
                              <span>Apply AI Editing Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Visual Result Canvas */}
                    <div className="flex flex-col items-center justify-center border border-neutral-100 rounded-3xl bg-neutral-950 p-4 h-full min-h-[350px] relative overflow-hidden">
                      {generatedImgUrl ? (
                        <div className="w-full h-full flex flex-col justify-between items-center text-white relative z-10 space-y-4">
                          <div className="rounded-2xl overflow-hidden shadow-xl border border-neutral-800 max-h-[280px]">
                            <img 
                              referrerPolicy="no-referrer"
                              src={generatedImgUrl} 
                              className="max-h-[280px] w-auto mx-auto object-contain" 
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <a 
                              href={generatedImgUrl} 
                              download="modelverse_ai_portrait.png"
                              className="flex items-center space-x-1 border border-neutral-800 bg-neutral-900 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-neutral-800"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PNG</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-neutral-500 max-w-sm px-4">
                          <ImageIcon className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-1">
                            Aesthetic Output Frame
                          </h4>
                          <p className="text-[11px] font-semibold text-neutral-600 leading-relaxed">
                            Once generated or edited, your premium portrait illustration will load right here with direct download links.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 3: VEO PORTRAIT ANIMATOR */}
            {activeSubTab === 'video' && (
              <motion.div
                key="tab-video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3 mb-4">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <Film className="h-5 w-5 text-purple-600" />
                        <span>Veo Video Generator & Animator</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium">
                        Transform model portraits into breathtaking high-concept videos using veo-3.1-fast-generate-preview.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Input selectors */}
                    <div className="space-y-4">
                      
                      <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5 space-y-4">
                        
                        <div>
                          <label className="text-[10px] font-black font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                            Step 1: Upload Source Model Photo (Optional)
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="flex-1 flex flex-col justify-center items-center h-22 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center p-2">
                              <Upload className="h-4.5 w-4.5 text-neutral-400 mb-0.5" />
                              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">Select Image</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleVideoSourceImgUpload} 
                                className="hidden" 
                              />
                            </label>

                            {videoSourceImg && (
                              <div className="relative h-22 w-22 rounded-xl overflow-hidden shadow-sm border border-neutral-200 dark:border-white/10">
                                <img src={videoSourceImg} className="h-full w-full object-cover" />
                                <button 
                                  onClick={() => setVideoSourceImg(null)}
                                  className="absolute top-1 right-1 bg-black/60 rounded-full h-4 w-4 flex items-center justify-center text-white text-[8px] font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                            Step 2: Enter Animation Motion Prompt
                          </label>
                          <textarea
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                            placeholder="e.g. 'A close-up cinematic shot of the female model turning her head towards the camera, smiling with dramatic key lighting. 4k resolution'"
                            className="w-full text-xs font-semibold p-3 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-bold text-neutral-500">Video Aspect Ratio:</span>
                          <select
                            value={vidAspectRatio}
                            onChange={(e) => setVidAspectRatio(e.target.value)}
                            className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-xs border border-neutral-200 dark:border-white/10 rounded-lg p-1.5 font-bold focus:outline-none"
                          >
                            <option value="16:9" className="bg-white dark:bg-neutral-900">16:9 Landscape</option>
                            <option value="9:16" className="bg-white dark:bg-neutral-900">9:16 Portrait Cinema</option>
                          </select>
                        </div>

                        <button
                          onClick={triggerVideoGeneration}
                          disabled={videoStatus === 'starting' || videoStatus === 'polling' || videoStatus === 'downloading' || !videoPrompt.trim()}
                          className="w-full flex items-center justify-center space-x-1.5 text-xs font-extrabold bg-black dark:bg-[#1A1A1E] border dark:border-white/10 hover:bg-neutral-800 dark:hover:bg-neutral-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-850 text-white rounded-xl py-3.5 shadow transition cursor-pointer"
                        >
                          {videoStatus === 'starting' && <span>Spawning Rendering Feed...</span>}
                          {videoStatus === 'polling' && <span>Veo Rendering (Polling... {pollingCountdown}s)</span>}
                          {videoStatus === 'downloading' && <span>Assembling Video Bytes...</span>}
                          {videoStatus === 'idle' && (
                            <>
                              <Play className="h-4 w-4 text-orange-400 fill-orange-400" />
                              <span>Generate & Render Veo Video</span>
                            </>
                          )}
                          {videoStatus === 'completed' && <span>Re-Generate Veo Video</span>}
                          {videoStatus === 'failed' && <span>Failed. Retry Veo Render</span>}
                        </button>

                      </div>

                    </div>

                    {/* Rendering video player */}
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-neutral-950 p-4 border border-neutral-100 dark:border-white/10 min-h-[300px] relative overflow-hidden">
                      {videoStatus === 'polling' || videoStatus === 'starting' || videoStatus === 'downloading' ? (
                        <div className="text-center text-white space-y-4 max-w-xs">
                          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                          <div>
                            <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-orange-500">
                              {videoStatus === 'downloading' ? 'DOWNLOADING MP4 FEED' : 'ACTIVE VEO PIPELINE'}
                            </h4>
                            <p className="text-[10px] text-neutral-400 font-semibold mt-1 leading-normal">
                              Veo video generation consumes keyframes on server-authoritative models. This polling takes roughly 25-45 seconds. Keep this screen open!
                            </p>
                          </div>
                        </div>
                      ) : generatedVideoUrl ? (
                        <div className="w-full h-full flex flex-col justify-between items-center text-white space-y-4">
                          <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-xl max-h-[220px]">
                            <video 
                              src={generatedVideoUrl} 
                              controls 
                              autoPlay 
                              loop 
                              className="max-h-[220px] w-auto mx-auto object-contain" 
                            />
                          </div>
                          
                          <a 
                            href={generatedVideoUrl} 
                            download="model_runway_animation.mp4"
                            className="flex items-center space-x-1 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download MP4</span>
                          </a>
                        </div>
                      ) : (
                        <div className="text-center text-neutral-500 max-w-sm px-4">
                          <Film className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
                          <h4 className="text-xs font-black uppercase font-mono tracking-wider text-neutral-400 mb-1">
                            Cinematic Stream Preview
                          </h4>
                          <p className="text-[11px] font-semibold text-neutral-600 leading-normal">
                            Once Veo has completely processed your motion prompt, the finished MP4 video loops will render in high-definition here.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 4: GOOGLE MAPS AND SEARCH GROUNDING */}
            {activeSubTab === 'grounding' && (
              <motion.div
                key="tab-grounding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3 mb-4">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <Compass className="h-5 w-5 text-purple-600" />
                        <span>Live Location & Casting Web Grounding</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium">
                        Retrieve live verified information across Google Search and Google Maps platforms. Use raw data.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Query Block */}
                    <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                      
                      <div className="flex space-x-2 mb-3">
                        <button
                          onClick={() => setGroundingMode('search')}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                            groundingMode === 'search' 
                              ? 'bg-black dark:bg-[#1A1A1E] text-white border dark:border-white/10' 
                              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-zinc-400 border border-neutral-200 dark:border-white/10'
                          }`}
                        >
                          Google Search Grounding (gemini-3.5-flash)
                        </button>
                        <button
                          onClick={() => setGroundingMode('maps')}
                          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                            groundingMode === 'maps' 
                              ? 'bg-black dark:bg-[#1A1A1E] text-white border dark:border-white/10' 
                              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-zinc-400 border border-neutral-200 dark:border-white/10'
                          }`}
                        >
                          Google Maps Grounding (gemini-3.5-flash)
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            value={intelligencePrompt}
                            onChange={(e) => setIntelligencePrompt(e.target.value)}
                            placeholder={
                              groundingMode === 'maps' 
                                ? 'e.g. "Find high-fashion studios and casting addresses near Bandra West Mumbai"' 
                                : 'e.g. "Get latest open modeling castings, events, and styling trends in India for 2026"'
                            }
                            className="w-full text-xs font-semibold pl-10 pr-4 py-3.5 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={performGroundingQuery}
                          disabled={isQueryingIntel || !intelligencePrompt.trim()}
                          className="rounded-xl bg-purple-600 hover:bg-purple-750 disabled:bg-neutral-300 px-5 py-3.5 text-xs font-extrabold text-white shadow transition cursor-pointer"
                        >
                          {isQueryingIntel ? 'Searching...' : 'Search'}
                        </button>
                      </div>

                    </div>

                    {/* Result Container */}
                    <div className="bg-[#FAF9F8] dark:bg-neutral-950 border border-neutral-100 dark:border-white/5 rounded-2xl p-5 min-h-[220px]">
                      {isQueryingIntel ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 text-purple-600 animate-spin mb-2" />
                          <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                            Querying Live Web Elements...
                          </span>
                        </div>
                      ) : intelligenceResult ? (
                        <div className="prose prose-sm text-neutral-800 dark:text-neutral-200 space-y-3">
                          <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/10 dark:border-emerald-500/20 text-[10px] font-mono font-bold tracking-wider uppercase inline-block mb-2">
                            <Check className="h-3.5 w-3.5" />
                            <span>System Grounded & Verified Response</span>
                          </div>
                          
                          <p className="font-sans text-xs leading-relaxed font-semibold whitespace-pre-wrap">
                            {intelligenceResult}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-neutral-400 max-w-sm mx-auto">
                          <Compass className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold leading-relaxed">
                            Type an audition query or local area address pinpoint query above to utilize real-time search or maps data feeds.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 5: CAMPAIGN PLANNING CREATIVE BRIEF */}
            {activeSubTab === 'brief' && (
              <motion.div
                key="tab-brief"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3 mb-4">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span>Campaign Photoshoot Brief Creator</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium">
                        Utilize gemini-3.1-pro-preview for complex tasks: Create highly custom luxury casting guidelines.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    
                    <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                      <label className="text-[10px] font-black font-mono tracking-wider text-slate-400 block uppercase mb-1.5">
                        Describe Brand Identity, Location mood, and Casting requirements:
                      </label>
                      <div className="flex space-x-2">
                        <textarea
                          value={campaignPrompt}
                          onChange={(e) => setCampaignPrompt(e.target.value)}
                          placeholder="e.g. 'A sustainable hand-loomed apparel model campaign. Shooting in old houses of Jaipur at dawn. Budget INR 80,000, looking for authentic, soulful Indian female model.'"
                          className="flex-1 text-xs font-semibold p-3 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
                          rows={3}
                        />

                        <button
                          onClick={makeCampaignBrief}
                          disabled={isGeneratingCampaign || !campaignPrompt.trim()}
                          className="bg-black dark:bg-[#1A1A1E] border dark:border-white/10 hover:bg-neutral-800 dark:hover:bg-neutral-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-850 rounded-xl text-white px-5 text-xs font-extrabold flex flex-col items-center justify-center transition cursor-pointer leading-tight"
                        >
                          {isGeneratingCampaign ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 animate-spin mb-1 text-white" />
                              <span>Planning...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4.5 w-4.5 text-yellow-400 mb-1" />
                              <span>Generate Brief</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#FAF9F8] dark:bg-neutral-950 border border-neutral-100 dark:border-white/5 rounded-2xl p-5 min-h-[220px] max-h-[300px] overflow-y-auto">
                      {isGeneratingCampaign ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 text-purple-600 animate-spin mb-2" />
                          <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                            Co-Pilot Structuring Creative Brief...
                          </span>
                        </div>
                      ) : campaignResult ? (
                        <div className="prose prose-sm text-neutral-800 dark:text-neutral-200 space-y-2">
                          <h4 className="text-xs font-bold font-mono tracking-wider text-purple-700 dark:text-purple-400 uppercase mb-2">
                            CURATED PHOTO-SHOOT CAMPAIGN BRIEF
                          </h4>
                          <p className="font-sans text-xs leading-relaxed font-semibold whitespace-pre-wrap">
                            {campaignResult}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-14 text-neutral-400 max-w-sm mx-auto">
                          <FileText className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold leading-relaxed">
                            Provide campaign descriptions above to generate standard, high-fashion casting directives.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 6: HIGH FASHION BIOGRAPHY ENHANCER */}
            {activeSubTab === 'bio' && (
              <motion.div
                key="tab-bio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/10 pb-3 mb-4">
                    <div>
                      <h2 className="font-sans text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-1.5">
                        <User className="h-5 w-5 text-purple-600" />
                        <span>High-Fashion Model Bio Enhancer (Lite AI Task)</span>
                      </h2>
                      <p className="text-xs text-neutral-400 font-medium">
                        Instant, lightweight biography copy generator built with gemini-3.1-flash-lite for rapid performance.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Crude input */}
                    <div className="space-y-4">
                      
                      <div className="bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                        <label className="text-[10px] font-black font-mono tracking-wider text-neutral-400 block uppercase mb-1.5">
                          Rough or informal biographical outline:
                        </label>
                        <textarea
                          value={crudeBioText}
                          onChange={(e) => setCrudeBioText(e.target.value)}
                          placeholder="e.g. 'i am Rohan Malhotra, based in Bangalore. i model since 3 years, walk show, open for brands shoot and travel too.'"
                          className="w-full text-xs font-semibold p-3 border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
                          rows={6}
                        />

                        <button
                          onClick={enhanceBioText}
                          disabled={isEnhancingBio || !crudeBioText.trim()}
                          className="w-full flex items-center justify-center space-x-1.5 mt-4 text-xs font-bold bg-purple-600 hover:bg-purple-750 disabled:bg-neutral-300 dark:disabled:bg-neutral-850 text-white rounded-xl py-3.5 shadow transition cursor-pointer"
                        >
                          {isEnhancingBio ? (
                            <>
                              <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                              <span>Polishing Copy...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
                              <span>Enhance & Polish Instantly</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Right Enhanced outcome Box */}
                    <div className="bg-slate-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-white/5 rounded-3xl p-5 min-h-[220px] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono tracking-wider text-[#D4AF37] block uppercase mb-3">
                          🏆 POLISHED AGENCY BIOGRAPHY COPY
                        </span>
                        
                        {enhancedBio ? (
                          <p className="text-neutral-800 dark:text-neutral-200 font-sans text-xs italic font-semibold leading-relaxed bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 py-3.5 px-4 rounded-xl shadow-sm">
                            "{enhancedBio}"
                          </p>
                        ) : (
                          <div className="text-center py-10 text-neutral-400">
                            <User className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                            <p className="text-[11px] font-semibold leading-relaxed">
                              Polished output will appear here. Copy and paste it right into your registration details form!
                            </p>
                          </div>
                        )}
                      </div>

                      {enhancedBio && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(enhancedBio);
                            if (triggerToast) {
                              triggerToast('Copied', 'Polished biography copied to clipboard!', 'success');
                            } else {
                              alert('Copied to clipboard!');
                            }
                          }}
                          className="flex items-center justify-center space-x-1 text-xs font-extrabold bg-black dark:bg-[#1A1A1E] border dark:border-white/10 text-white hover:bg-neutral-800 dark:hover:bg-neutral-800 rounded-xl py-2 mt-4 px-3"
                        >
                          <span>Copy Biographic Copy</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Luxury visual footer signifier */}
          <div className="mt-6 border-t border-neutral-50 pt-3 text-[10px] font-mono tracking-wider text-neutral-400 flex justify-between items-center">
            <span>MODELVERSE AI ENGINE VER. 2026.06.A</span>
            <span>SECURE ESCROW RUNWAY INFRASTRUCTURE</span>
          </div>

        </div>

      </div>

    </div>
  );
}
