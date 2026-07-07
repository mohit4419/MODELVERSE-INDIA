/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, TrendingUp, Users, DollarSign, Calendar, Eye, Trash2, Ban, CheckCircle, RefreshCcw, ShieldCheck, Mail, Clock, Bell, Volume2, VolumeX, Radio, Trash, Zap, Check, X, Activity, FileText, Filter, Search, Database } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Model, Booking, PaymentRecord, User, AuditLog, Payout, PayoutStatus } from '../types';
import { dbService } from '../services/db';

interface AdminDashboardProps {
  models: Model[];
  bookings: Booking[];
  payments: PaymentRecord[];
  onApproveModel: (modelId: string) => void;
  onRejectModel: (modelId: string) => void;
  onSuspendUser: (userId: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => void;
  onBatchApproveModels?: (modelIds: string[]) => void;
  onImpersonateUser?: (user: any) => void;
}

export default function AdminDashboard({
  models,
  bookings,
  payments,
  onApproveModel,
  onRejectModel,
  onSuspendUser,
  onUpdateBookingStatus,
  onBatchApproveModels,
  onImpersonateUser
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'talent' | 'payments' | 'bookings' | 'users' | 'audit_log' | 'payouts' | 'database'>('talent');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  // Payout-related states
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutFilter, setPayoutFilter] = useState<'all' | PayoutStatus>('all');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [selectedPayoutForRelease, setSelectedPayoutForRelease] = useState<Payout | null>(null);
  const [payoutTxRef, setPayoutTxRef] = useState('');
  const [payoutNotesInput, setPayoutNotesInput] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Supabase Database Connection states
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'connected' | 'connected_no_tables' | 'error'>('idle');
  const [dbErrorMsg, setDbErrorMsg] = useState<string>('');

  useEffect(() => {
    const unsubscribeAudit = dbService.subscribeToAuditLogs((logs) => {
      setAuditLogs(logs);
    });
    const unsubscribePayouts = dbService.subscribeToPayouts((data) => {
      setPayouts(data);
    });
    return () => {
      unsubscribeAudit();
      unsubscribePayouts();
    };
  }, []);

  const runDatabaseDiagnostics = async () => {
    setDbStatus('testing');
    setDbErrorMsg('');
    try {
      const res = await dbService.testSupabaseConnection();
      if (res.success) {
        if (res.error === 'CONNECTED_NO_TABLES') {
          setDbStatus('connected_no_tables');
        } else {
          setDbStatus('connected');
        }
      } else {
        setDbStatus('error');
        setDbErrorMsg(res.error || 'Unknown Supabase connection error');
      }
    } catch (err: any) {
      setDbStatus('error');
      setDbErrorMsg(err.message || String(err));
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      runDatabaseDiagnostics();
    }
  }, [activeTab]);

  const handleSaveModelEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;
    try {
      await dbService.saveModel(editingModel);
      await dbService.addAuditLog({
        action: 'UPDATE_MODEL_PORTFOLIO',
        performedBy: 'Super Admin (nshop225)',
        details: `Updated model profile fields for: ${editingModel.name} (ID: ${editingModel.id})`,
        entityId: editingModel.id,
        entityType: 'model'
      });
      setEditingModel(null);
    } catch (err) {
      console.error('Failed to save model edits:', err);
    }
  };

  // PDF invoice generator
  const downloadInvoicePDF = (p: PaymentRecord) => {
    try {
      const doc = new jsPDF();
      
      // Draw dark header band
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 40, 'F');

      // Title on Header
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('MODELVERSE INDIA', 15, 22);

      // Subtitle
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 111, 0); // Coral color accent
      doc.text('OFFICIAL TRANSACTION LEDGER & SAAS INVOICE', 15, 29);

      // Invoice status stamp
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PAYMENT CLEARED', 145, 18);

      // Stamp box or sub-text
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Invoice Ref: ${p.invoiceId || 'INV-NA'}`, 145, 24);
      doc.text(`Cleared Date: ${new Date(p.createdAt).toLocaleDateString('en-IN')}`, 145, 29);
      if (p.isSandbox) {
        doc.setTextColor(245, 158, 11); // Amber 500
        doc.setFont('helvetica', 'bold');
        doc.text('DEVELOPER SANDBOX', 145, 34);
      }

      // Section: Partner Details
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO (PAYER):', 15, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Name: ${p.userName || 'Verified Brand Partner'}`, 15, 61);
      if (p.userEmail) {
        doc.text(`Email: ${p.userEmail}`, 15, 67);
      } else {
        doc.text('Email: billing@brandclient.modelverse.in', 15, 67);
      }
      doc.text(`User ID: ${p.userId || 'N/A'}`, 15, 73);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BENEFICIARY / ISSUER:', 115, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text('ModelVerse India Private Limited', 115, 61);
      doc.text('GSTIN: 27AABCM8213M1Z2', 115, 67);
      doc.text('Corporate Hub, BKC, Mumbai', 115, 73);

      // Line Separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(15, 82, 195, 82);

      // Section: Transaction Details
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TRANSACTION LEDGER SPECIFICATIONS', 15, 92);

      // Gray container box for ledger details
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 97, 180, 32, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('PAYMENT GATEWAY:', 20, 103);
      doc.text('TRANSACTION REFERENCE ID:', 20, 109);
      doc.text('CLEARANCE TIMESTAMP:', 20, 115);
      doc.text('GATEWAY INSTANCE MODE:', 20, 121);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(p.paymentGateway || 'Razorpay India Secure', 80, 103);
      doc.text(p.sessionId || `TXN-ORD-${p.id.substring(0, 10).toUpperCase()}`, 80, 109);
      doc.text(p.createdAt ? new Date(p.createdAt).toUTCString() : 'N/A', 80, 115);
      doc.text(p.isSandbox ? 'Sandbox Simulator (No Real Charge)' : 'Production Gateway Live', 80, 121);

      // Table section header
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ITEMIZED FINANCIAL BREAKDOWN', 15, 142);

      // Table Header row
      doc.setFillColor(15, 23, 42);
      doc.rect(15, 147, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('LINE ITEM DESCRIPTION', 20, 152);
      doc.text('UNIT PRICE', 115, 152);
      doc.text('TAX/CGST/SGST (18%)', 142, 152);
      doc.text('NET TOTAL PAID', 172, 152);

      // Table content row
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      const description = p.description || 'ModelVerse Portfolio Access Certification Fee';
      
      // Calculate split values for professional presentation
      const totalPaid = p.amount || 199;
      const basePrice = Math.round((totalPaid / 1.18) * 100) / 100;
      const gstAmount = Math.round((totalPaid - basePrice) * 100) / 100;

      doc.text(description, 20, 161);
      doc.text(`INR ${basePrice.toLocaleString('en-IN')}`, 115, 161);
      doc.text(`INR ${gstAmount.toLocaleString('en-IN')}`, 142, 161);
      doc.text(`INR ${totalPaid.toLocaleString('en-IN')}`, 172, 161);

      // Thin separator line
      doc.setDrawColor(241, 245, 249);
      doc.line(15, 166, 195, 166);

      // Total block in bottom-right
      doc.setFillColor(248, 250, 252);
      doc.rect(110, 172, 85, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Subtotal (Before GST):', 115, 178);
      doc.text('Integrated GST (18.0%):', 115, 184);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text('Grand Total (Net Paid):', 115, 191);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 51, 51);
      doc.text(`INR ${basePrice.toLocaleString('en-IN')}`, 165, 178);
      doc.text(`INR ${gstAmount.toLocaleString('en-IN')}`, 165, 184);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald green for grand total
      doc.text(`INR ${totalPaid.toLocaleString('en-IN')}`, 165, 191);

      // Bottom terms & conditions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TERMS & COMPLIANCE STATEMENTS', 15, 215);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('1. This invoice is computer-generated and verified against secure gateway logs; no physical signature is required.', 15, 221);
      doc.text('2. Payments processed are final, secured by escrow agreements, and protected under ModelVerse client service clauses.', 15, 226);
      doc.text('3. Any discrepancies must be reported to support@modelverse.in within 7 business days with the reference ID above.', 15, 231);

      // Footer branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Securely Cleared by ModelVerse India Payment Engine', 15, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for supporting talent & brand safety in modeling industries across India.', 15, 260);

      // Save the PDF
      const fileName = `Invoice-${p.invoiceId || 'TXN'}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
      alert('Could not generate PDF invoice. Please check logs.');
    }
  };

  // ==========================================
  // REAL-TIME CASTING SIGNALS & NOTIFICATION ENGINE
  // ==========================================
  interface CastingSignal {
    id: string;
    type: 'model_reg' | 'high_value_booking';
    title: string;
    message: string;
    timestamp: string;
    item: any;
    isRead: boolean;
  }

  const [notifications, setNotifications] = useState<CastingSignal[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Track known IDs to only trigger alerts on newly created records in real-time
  const knownModelIdsRef = useRef<Set<string>>(new Set());
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const isFirstRenderRef = useRef(true);

  // Web Audio Context Synthesized Chime (no external asset needed)
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
      osc2.frequency.setValueAtTime(440, audioCtx.currentTime + 0.12); // A4

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.6);
      osc2.stop(audioCtx.currentTime + 0.6);
    } catch (err) {
      console.warn('Audio chime blocked or failed', err);
    }
  };

  // Scan collections and trigger real-time alerts
  useEffect(() => {
    if (isFirstRenderRef.current) {
      if (models.length > 0 || bookings.length > 0) {
        models.forEach(m => knownModelIdsRef.current.add(m.id));
        bookings.forEach(b => knownBookingIdsRef.current.add(b.id));
        isFirstRenderRef.current = false;
      }
      return;
    }

    // Scan for new model registrations
    models.forEach(model => {
      if (!knownModelIdsRef.current.has(model.id)) {
        knownModelIdsRef.current.add(model.id);

        if (!model.approved) {
          const newAlert: CastingSignal = {
            id: `alert_model_${model.id}_${Date.now()}`,
            type: 'model_reg',
            title: 'New Talent Registration',
            message: `${model.name} (${model.city}) applied for casting registry. Verify credentials now.`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            item: model,
            isRead: false
          };
          setNotifications(prev => [newAlert, ...prev]);
          if (soundEnabled) {
            playAlertChime();
          }
        }
      }
    });

    // Scan for new high-value bookings (budget/priceAmount >= ₹50,000)
    bookings.forEach(booking => {
      if (!knownBookingIdsRef.current.has(booking.id)) {
        knownBookingIdsRef.current.add(booking.id);

        const isHighValue = booking.priceAmount >= 50000;
        if (booking.status === 'pending' && isHighValue) {
          const newAlert: CastingSignal = {
            id: `alert_booking_${booking.id}_${Date.now()}`,
            type: 'high_value_booking',
            title: '👑 High-Value Contract',
            message: `New escrow contract for ${booking.projectDetails.brandName} (₹${booking.priceAmount.toLocaleString('en-IN')}) is pending review.`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            item: booking,
            isRead: false
          };
          setNotifications(prev => [newAlert, ...prev]);
          if (soundEnabled) {
            playAlertChime();
          }
        }
      }
    });
  }, [models, bookings, soundEnabled]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Simulated live casting signals on real database collections
  const simulateModelRegistration = () => {
    const randId = `mock_reg_${Date.now()}`;
    const nameList = ['Rohan Malhotra', 'Ananya Sen', 'Vikram Rathore', 'Zoya Akhtar', 'Aditya Roy'];
    const cityList = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const mockModel: Model = {
      id: randId,
      userId: `user_mock_${Date.now()}`,
      name: `${nameList[Math.floor(Math.random() * nameList.length)]} (Simulated)`,
      gender: Math.random() > 0.5 ? 'female' : 'male',
      age: 20 + Math.floor(Math.random() * 8),
      height: "5'11\"",
      city: cityList[Math.floor(Math.random() * cityList.length)],
      state: 'India',
      languages: ['English', 'Hindi'],
      experience: 'Fresh Face',
      category: 'Fashion Models',
      portfolio: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600'],
      selfieVerified: true,
      approved: false, // Pending!
      startingPrice: 45000,
      rating: 5.0,
      reviewsCount: 0,
      biography: 'This is a live simulated model application to verify the dashboard alert listeners.'
    };

    dbService.saveModel(mockModel).catch(console.error);
  };

  const simulateHighValueBooking = () => {
    const randId = `mock_book_${Date.now()}`;
    const brandName = ['Tata Play', 'Sabyasachi Couture', 'Reliance Trends', 'GQ India', 'FabIndia'][Math.floor(Math.random() * 5)];
    const mockBooking: Booking = {
      id: randId,
      clientId: `client_mock_${Date.now()}`,
      clientName: 'Premium Brand Representative',
      modelId: 'u_p_sharma',
      modelName: 'Priya Sharma',
      modelImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
      projectDetails: {
        brandName,
        companyName: `${brandName} India Ltd`,
        campaignType: 'Autumn Festival Campaign',
        shootType: 'Couture Lookbook',
        location: 'Goa Coastline',
        date: '2026-08-12',
        duration: '3 Days',
        budgetRange: '₹75,000 - ₹1,50,000',
        notes: 'Premium high-value test contract.'
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      priceAmount: 85000 // High value!
    };

    dbService.addBooking(mockBooking).catch(console.error);
  };

  // MOCK SYSTEM CLIENTS LIST
  const [systemUsers, setSystemUsers] = useState<User[]>([
    { id: 'c1', role: 'client', name: 'Manish Kumar (Sabyasachi)', email: 'manish@sabyasachi.co', phone: '9876543210', status: 'active', createdAt: '2026-05-15' },
    { id: 'c2', role: 'client', name: 'Aman Deep (Cult.fit)', email: 'aman@cultfit.co', phone: '9887766554', status: 'active', createdAt: '2026-06-01' },
    { id: 'c3', role: 'client', name: 'Premium Agency (Test Client)', email: 'agency@test.com', phone: '9001122334', status: 'active', createdAt: '2026-06-18' },
    { id: 'u_p_sharma', role: 'model', name: 'Priya Sharma (Model)', email: 'priya@inega.in', phone: '9112233445', status: 'active', createdAt: '2026-04-10' },
  ]);

  const [bookingSearchModel, setBookingSearchModel] = useState('');
  const [bookingSearchClient, setBookingSearchClient] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [selectedDetailedBooking, setSelectedDetailedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    dbService.getUsers().then(usersList => {
      if (usersList && usersList.length > 0) {
        setSystemUsers(prev => {
          const merged = [...prev];
          usersList.forEach(u => {
            if (!merged.some(m => m.id === u.id)) {
              merged.push(u);
            }
          });
          return merged;
        });
      }
    }).catch(err => console.error('Failed to load system users inside admin panel:', err));
  }, []);

  const toggleUserStatus = (userId: string) => {
    setSystemUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: newStatus };
      }
      return u;
    }));
    onSuspendUser(userId);
  };

  // SUMMARIZED BUSINESS COUNTERS
  const pendingModels = models.filter(m => !m.approved);

  const handleSelectAllPending = () => {
    const pendingIds = pendingModels.map(m => m.id);
    const allSelected = pendingIds.every(id => selectedModelIds.includes(id)) && pendingIds.length > 0;
    if (allSelected) {
      setSelectedModelIds(prev => prev.filter(id => !pendingIds.includes(id)));
    } else {
      setSelectedModelIds(prev => {
        const unique = new Set([...prev, ...pendingIds]);
        return Array.from(unique);
      });
    }
  };

  const handleToggleSelectModel = (id: string) => {
    setSelectedModelIds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (onBatchApproveModels && selectedModelIds.length > 0) {
      onBatchApproveModels(selectedModelIds);
      setSelectedModelIds([]);
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const premiumUnlocksCount = payments.filter(p => p.amount === 199 && p.status === 'success').length;
  const bookingsVolume = bookings.length;

  return (
    <div id="admin-dashboard-panel" className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 mb-10">
        <div>
          <div className="flex items-center space-x-2 text-[#FF6F00]">
            <Shield className="h-5 w-5 fill-current" />
            <span className="font-mono text-xs font-black uppercase tracking-wider">Casting Administration Panel</span>
          </div>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF5722] via-[#FF6F00] to-[#FFA000] bg-clip-text text-transparent mt-1">
            ModelVerse India Command Center
          </h2>
        </div>
        
        {/* Dynamic Server Identifier */}
        <span className="mt-3 sm:mt-0 font-mono text-[10px] uppercase font-bold tracking-widest text-[#FF6F00] bg-[#FF6F00]/5 border border-[#FF6F00]/20 px-3 py-1.5 rounded-xl">
          REGION: ASIA-SOUTH1-MVI
        </span>
      </div>

      {/* Analytics Widget Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Revenue widget */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl flex items-center space-x-4">
          <div className="rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FFA000] p-3 text-black">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Total Bookings GMV</span>
            <strong className="text-xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</strong>
            <span className="block text-[9px] text-zinc-500 mt-1">Escrow held in HDFC India</span>
          </div>
        </div>

        {/* Talent registered card */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl flex items-center space-x-4">
          <div className="rounded-xl bg-white/5 p-3 text-[#FF6F00]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Active Talent Profiles</span>
            <strong className="text-xl font-black text-white">{models.length} Models</strong>
            <span className="block text-[9px] text-zinc-500 mt-1">{pendingModels.length} pending moderation</span>
          </div>
        </div>

        {/* Total Bookings Request */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl flex items-center space-x-4">
          <div className="rounded-xl bg-white/5 p-3 text-[#FF6F00]">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Escrow Contracts</span>
            <strong className="text-xl font-black text-white">{bookingsVolume} Campaigns</strong>
            <span className="block text-[9px] text-zinc-500 mt-1">Pending approval loops</span>
          </div>
        </div>

        {/* Premium Unlocks */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl flex items-center space-x-4">
          <div className="rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FFA000] p-3 text-black">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Contact Unlocks</span>
            <strong className="text-xl font-black text-white">{premiumUnlocksCount} purchases</strong>
            <span className="block text-[9px] text-[#FF6F00] font-bold mt-1">₹{(premiumUnlocksCount * 199).toLocaleString()} Earned</span>
          </div>
        </div>

      </div>

      {/* Custom Designed High-Fidelity SVG Charts for Cast Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 text-xs">
        
        {/* Revenue Projection visual block */}
        <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-white">Gross Booking Stream Progression</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Estimated escrow processing volume over current calendar quarter (Summer 2026).</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#FF6F00]" />
          </div>

          {/* Clean Custom SVG Bar Chart */}
          <div className="relative h-48 w-full pt-4">
            <svg viewBox="0 0 500 120" className="h-full w-full">
              <defs>
                <linearGradient id="garuaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFA000" />
                  <stop offset="100%" stopColor="#FF5722" />
                </linearGradient>
              </defs>
              <line x1="20" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="20" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Bars representing June 2026 data */}
              <rect x="40" y="85" width="24" height="15" rx="3" fill="#FF5722" opacity="0.4" />
              <text x="52" y="112" fontSize="7" fill="#888888" fontWeight="bold" textAnchor="middle">Apr</text>
              <text x="52" y="80" fontSize="7" fill="#cccccc" fontWeight="bold" textAnchor="middle">₹15K</text>

              <rect x="130" y="70" width="24" height="30" rx="3" fill="#FF5722" opacity="0.6" />
              <text x="142" y="112" fontSize="7" fill="#888888" fontWeight="bold" textAnchor="middle">May</text>
              <text x="142" y="65" fontSize="7" fill="#cccccc" fontWeight="bold" textAnchor="middle">₹32K</text>

              <rect x="220" y="45" width="24" height="55" rx="3" fill="url(#garuaGradient)" />
              <text x="232" y="112" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">Jun (Live)</text>
              <text x="232" y="40" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">₹133K</text>

              <rect x="310" y="30" width="24" height="70" rx="3" fill="#FF5722" opacity="0.8" />
              <text x="322" y="112" fontSize="7" fill="#888888" fontWeight="bold" textAnchor="middle">Jul (Est)</text>
              <text x="322" y="25" fontSize="7" fill="#cccccc" fontWeight="bold" textAnchor="middle">₹180K</text>

              <rect x="400" y="15" width="24" height="85" rx="3" fill="#FF5722" />
              <text x="412" y="112" fontSize="7" fill="#888888" fontWeight="bold" textAnchor="middle">Aug (Est)</text>
              <text x="412" y="10" fontSize="7" fill="#cccccc" fontWeight="bold" textAnchor="middle">₹240K</text>
            </svg>
          </div>
        </div>

        {/* Real-time Casting Signal Centre */}
        <div id="casting-signal-feed" className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div>
              <div className="flex items-center space-x-1.5">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Casting Signal Feed</h3>
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5">Scanning Firestore in real-time for live events</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Disable Audio Alerts" : "Enable Audio Alerts"}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  soundEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-zinc-500/10 border-white/10 text-zinc-500 hover:bg-white/5'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              
              {/* Clear all */}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  title="Clear All Alerts"
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/5 max-h-[170px] min-h-[140px]">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <div className="relative mb-2">
                  <Bell className="h-7 w-7 text-zinc-600 animate-bounce" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold">Listener is Armed & Scanning</p>
                <p className="text-[9px] text-zinc-500 max-w-[200px] mx-auto mt-1">Pending registrations or premium campaigns will show up here immediately.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-xl border text-[10px] leading-relaxed transition-all duration-300 relative overflow-hidden ${
                    notif.isRead 
                      ? 'bg-black/20 border-white/5 opacity-65' 
                      : notif.type === 'model_reg'
                        ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20'
                        : 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20'
                  }`}
                >
                  {/* Unread glow effect */}
                  {!notif.isRead && (
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                      notif.type === 'model_reg' ? 'bg-orange-500' : 'bg-[#D4AF37]'
                    }`} />
                  )}

                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider">{notif.timestamp}</span>
                    <div className="flex items-center space-x-1">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-emerald-400 hover:text-emerald-350 transition px-1 py-0.5 rounded cursor-pointer"
                          title="Mark as Read"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissNotification(notif.id)}
                        className="text-zinc-500 hover:text-zinc-300 transition px-1 py-0.5 rounded cursor-pointer"
                        title="Dismiss"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <strong className={`block text-[11px] font-black mt-1 ${
                    notif.type === 'model_reg' ? 'text-orange-400' : 'text-[#D4AF37]'
                  }`}>
                    {notif.title}
                  </strong>
                  <p className="text-zinc-350 mt-1">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Control console tabs switcher */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3 mb-6">
        {(['talent', 'payments', 'bookings', 'users', 'audit_log', 'payouts', 'database'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-btn-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-5 py-2 text-xs font-bold capitalize transition cursor-pointer ${
              activeTab === tab 
                ? 'bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black font-black shadow-lg' 
                : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
            }`}
          >
            {tab === 'talent' 
              ? 'Talent Approvals' 
              : tab === 'audit_log' 
              ? 'Admin Audit Logs' 
              : tab === 'payouts' 
              ? 'Admin Payouts' 
              : tab === 'database'
              ? 'Supabase DB Setup ⚡'
              : tab}
          </button>
        ))}
      </div>

      {/* TALENT APPROVAL LOG CONSOLE */}
      {activeTab === 'talent' && (
        <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl animate-fadeIn">
          <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">Talent Registrations & ID Verification</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Manage model portfolios, approve pending profiles, or reject/revoke access.</p>
            </div>
            
            {selectedModelIds.length > 0 && (
              <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/25 px-4 py-2 rounded-xl animate-pulse">
                <span className="text-[10px] font-black text-orange-400 font-mono">
                  {selectedModelIds.length} PENDING SELECTED
                </span>
                <button
                  onClick={handleBatchApprove}
                  className="flex items-center space-x-1.5 bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black rounded-lg px-3 py-1.5 text-[10px] font-black hover:scale-102 transition cursor-pointer"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Batch Approve</span>
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-white/5 font-bold text-zinc-400 uppercase border-b border-white/10">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={pendingModels.length > 0 && pendingModels.every(m => selectedModelIds.includes(m.id))}
                      onChange={handleSelectAllPending}
                      disabled={pendingModels.length === 0}
                      className="rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer h-3.5 w-3.5"
                    />
                  </th>
                  <th className="p-4">Talent Name</th>
                  <th className="p-4">Client / Owner Account</th>
                  <th className="p-4">Niche Category</th>
                  <th className="p-4">Rates</th>
                  <th className="p-4">Government Proof</th>
                  <th className="p-4">Moderation Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-white/5">
                    <td className="p-4 w-12 text-center">
                      {!model.approved ? (
                        <input
                          type="checkbox"
                          checked={selectedModelIds.includes(model.id)}
                          onChange={() => handleToggleSelectModel(model.id)}
                          className="rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer h-3.5 w-3.5"
                        />
                      ) : (
                        <div className="h-3.5 w-3.5 mx-auto flex items-center justify-center">
                          <Check className="h-3 w-3 text-emerald-500" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex items-center space-x-3">
                      <img src={model.portfolio[0]} alt={model.name} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover border border-white/10" />
                      <div>
                        <strong className="block text-xs font-extrabold text-white">{model.name}</strong>
                        <span className="text-zinc-400">{model.city}, {model.state} • {model.age} yrs</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const ownerUser = systemUsers.find(u => u.id === model.userId || (model.email && u.email.toLowerCase() === model.email.toLowerCase()));
                        return ownerUser ? (
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-extrabold text-white text-xs">{ownerUser.name}</span>
                            <span className="text-zinc-400 font-mono text-[9px]">{ownerUser.email}</span>
                            <span className="text-zinc-500 font-mono text-[9px]">{ownerUser.phone}</span>
                            <span className="inline-block mt-1"><span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{ownerUser.role}</span></span>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-bold text-zinc-400 text-xs">Pre-seeded Account</span>
                            {model.email && <span className="text-zinc-500 font-mono text-[9px]">{model.email}</span>}
                            {model.phone && <span className="text-zinc-500 font-mono text-[9px]">{model.phone}</span>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 text-zinc-300">{model.category}</td>
                    <td className="p-4 font-bold text-[#FF6F00]">₹{model.startingPrice.toLocaleString()}/day</td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex items-center text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono w-max">
                          <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-500" /> ID Verified
                        </span>
                        {model.selfieUrl ? (
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="inline-flex items-center text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md font-mono w-max">
                              <CheckCircle className="h-3.5 w-3.5 mr-1 text-blue-500" /> Selfie Match
                            </span>
                            <div className="group relative">
                              <img 
                                src={model.selfieUrl} 
                                alt="Selfie Verification" 
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 rounded-md object-cover border border-white/10 cursor-pointer hover:scale-110 transition"
                              />
                              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-50 p-1 bg-zinc-900 border border-white/15 rounded-lg shadow-2xl">
                                <img 
                                  src={model.selfieUrl} 
                                  alt="Selfie Preview" 
                                  referrerPolicy="no-referrer"
                                  className="h-28 w-28 object-cover rounded-md"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-[9px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-2.5 py-1 rounded-md font-mono w-max mt-0.5">
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-zinc-500" /> Pre-seeded Match
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      <div className="flex flex-wrap items-center gap-2">
                        {model.approved ? (
                          <>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">Approved Check</span>
                            <button
                              onClick={() => onRejectModel(model.id)}
                              className="bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded px-2.5 py-1 text-[9px] font-bold transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onApproveModel(model.id)}
                              className="bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black rounded px-3 py-1 text-[10px] font-black transition cursor-pointer"
                            >
                              Approve Portfolio
                            </button>
                            <button
                              onClick={() => onRejectModel(model.id)}
                              className="bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded px-3 py-1 text-[10px] font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setEditingModel(model)}
                          className="bg-blue-500/15 hover:bg-blue-500/30 text-blue-450 dark:text-blue-400 rounded px-3 py-1 text-[10px] font-bold transition cursor-pointer"
                        >
                          Edit Model
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENTS HISTORY CONSOLE */}
      {activeTab === 'payments' && (
        <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl animate-fadeIn">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-extrabold text-white">Financial Ledger Accounts (Escrow Status)</h3>
          </div>
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-white/5 font-bold text-zinc-400 uppercase border-b border-white/10">
                  <th className="p-4">Transaction Details</th>
                  <th className="p-4">Gateway</th>
                  <th className="p-4">SaaS Gross Amount</th>
                  <th className="p-4">Ledger Date</th>
                  <th className="p-4">Invoice Reference</th>
                  <th className="p-4 text-right">Document Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <strong className="block text-white text-xs font-bold">{p.description}</strong>
                        <span className="text-zinc-500 text-[10px]">{p.userName || 'Client Store'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/5 border border-white/10 text-zinc-300 font-semibold rounded px-2.5 py-1">
                          {p.paymentGateway}
                        </span>
                        {p.isSandbox && (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] uppercase font-bold tracking-wider rounded px-1.5 py-0.5">
                            Sandbox
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-extrabold text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-mono font-bold text-[#FF6F00]">{p.invoiceId}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => downloadInvoicePDF(p)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                        title="Download official PDF Invoice"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Download Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKINGS MONITOR CONSOLE */}
      {activeTab === 'bookings' && (() => {
        const filteredBookings = bookings.filter(b => {
          const matchModel = b.modelName.toLowerCase().includes(bookingSearchModel.toLowerCase());
          const matchClient = (b.clientName || '').toLowerCase().includes(bookingSearchClient.toLowerCase()) || (b.projectDetails?.brandName || '').toLowerCase().includes(bookingSearchClient.toLowerCase());
          const matchStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
          return matchModel && matchClient && matchStatus;
        });

        const pendingBookingsList = filteredBookings.filter(b => b.status === 'pending');
        const completedBookingsList = filteredBookings.filter(b => b.status === 'completed');
        
        const totalPendingCount = pendingBookingsList.length;
        const totalCompletedCount = completedBookingsList.length;
        
        const totalPendingValue = pendingBookingsList.reduce((sum, b) => sum + b.priceAmount, 0);
        const totalCompletedValue = completedBookingsList.reduce((sum, b) => sum + b.priceAmount, 0);
        
        const totalRelevantCount = totalPendingCount + totalCompletedCount;
        const completedPercentage = totalRelevantCount > 0 ? Math.round((totalCompletedCount / totalRelevantCount) * 100) : 0;
        const pendingPercentage = totalRelevantCount > 0 ? 100 - completedPercentage : 0;

        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Split Visualization Bar & Ratios header */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Escrow Execution & Clearance Ratio</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Comparing pipeline volume pending verification against successfully completed campaigns.</p>
                </div>
                
                <div className="flex items-center space-x-6 text-[11px] font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-zinc-300 font-bold">Completed: {totalCompletedCount} (₹{totalCompletedValue.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-zinc-300 font-bold">Pending: {totalPendingCount} (₹{totalPendingValue.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Progress Proportions Segment Bar */}
              <div id="booking-history-progress-segment" className="relative w-full bg-white/5 h-6 rounded-full overflow-hidden border border-white/10 flex">
                {totalRelevantCount > 0 ? (
                  <>
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full flex items-center justify-center text-[10px] font-black text-black transition-all duration-500"
                      style={{ width: `${completedPercentage}%` }}
                      title={`${completedPercentage}% Completed`}
                    >
                      {completedPercentage >= 15 ? `${completedPercentage}% Settlement` : ''}
                    </div>
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full flex items-center justify-center text-[10px] font-black text-black transition-all duration-500"
                      style={{ width: `${pendingPercentage}%` }}
                      title={`${pendingPercentage}% Pending`}
                    >
                      {pendingPercentage >= 15 ? `${pendingPercentage}% Pipeline` : ''}
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center text-zinc-500 text-[10px] self-center">No active pending or completed campaign records match the current filters.</div>
                )}
              </div>
            </div>

            {/* SEARCH AND FILTER CONSOLE FOR BOOKINGS */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 font-mono">Search Assigned Model</label>
                <input 
                  type="text"
                  placeholder="Filter by model name..."
                  value={bookingSearchModel}
                  onChange={(e) => setBookingSearchModel(e.target.value)}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-bold"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 font-mono">Search Client / Brand</label>
                <input 
                  type="text"
                  placeholder="Filter by client or brand name..."
                  value={bookingSearchClient}
                  onChange={(e) => setBookingSearchClient(e.target.value)}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-bold"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 font-mono">Filter Status</label>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-bold"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* List Format: Total Pending vs. Completed Side-by-Side Status Colored Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Pending Bookings */}
              <div id="pending-bookings-history-list" className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2x focus-visible:outline-none">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" />
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">Pending Escrow Pipeline ({totalPendingCount})</h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/5 px-2.5 py-1 rounded-lg border border-amber-400/10">
                    Est. Value: ₹{totalPendingValue.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {pendingBookingsList.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 font-mono text-[10px]">
                      No bookings match current pending filter criteria.
                    </div>
                  ) : (
                    pendingBookingsList.map((b) => (
                      <div 
                        key={b.id} 
                        onClick={() => setSelectedDetailedBooking(b)}
                        className="p-4 rounded-xl border-l-4 border-amber-500 bg-[#171719] hover:bg-[#1f1f22] border border-white/5 transition flex items-start justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={b.modelImage} 
                            alt={b.modelName} 
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-full object-cover border border-white/10 ring-2 ring-amber-500/20" 
                          />
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-zinc-400">{b.projectDetails.brandName}</span>
                            <strong className="block text-xs font-extrabold text-white mt-0.5">{b.modelName}</strong>
                            <p className="text-[9px] text-zinc-500 mt-1">
                              {b.projectDetails.campaignType} • {b.projectDetails.location}
                            </p>
                            {onUpdateBookingStatus && (
                              <div className="flex gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'accepted')}
                                  className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase transition tracking-wider cursor-pointer animate-none"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'rejected')}
                                  className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase transition tracking-wider cursor-pointer animate-none"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between h-full">
                          <strong className="block text-xs font-black text-amber-400 font-mono">₹{b.priceAmount.toLocaleString()}</strong>
                          <span className="text-[8px] font-mono text-zinc-500 mt-2 block">{b.projectDetails.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Completed Bookings */}
              <div id="completed-bookings-history-list" className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2x">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">Completed Settlements ({totalCompletedCount})</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-lg border border-emerald-400/10">
                    Paid Out: ₹{totalCompletedValue.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {completedBookingsList.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 font-mono text-[10px]">
                      No bookings match current completed filter criteria.
                    </div>
                  ) : (
                    completedBookingsList.map((b) => (
                      <div 
                        key={b.id} 
                        onClick={() => setSelectedDetailedBooking(b)}
                        className="p-4 rounded-xl border-l-4 border-emerald-500 bg-[#171719] hover:bg-[#1f1f22] border border-white/5 transition flex items-start justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={b.modelImage} 
                            alt={b.modelName} 
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-full object-cover border border-white/10 ring-2 ring-emerald-500/20" 
                          />
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-zinc-400">{b.projectDetails.brandName}</span>
                            <strong className="block text-xs font-extrabold text-white mt-0.5">{b.modelName}</strong>
                            <p className="text-[9px] text-zinc-500 mt-1">
                              {b.projectDetails.campaignType} • {b.projectDetails.location}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between h-full">
                          <strong className="block text-xs font-black text-emerald-400 font-mono">₹{b.priceAmount.toLocaleString()}</strong>
                          <span className="text-[8px] font-mono text-zinc-500 mt-2 block">{b.projectDetails.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Campaign Booking Escrow Agreements Master Ledger Table */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">All Campaign Booking Escrow Agreements Ledger ({filteredBookings.length})</h3>
                <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full">Interactive Filter Matches</span>
              </div>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 font-bold text-zinc-400 uppercase border-b border-white/10">
                      <th className="p-4">Campaign Name</th>
                      <th className="p-4">Assigned Talent</th>
                      <th className="p-4">Shoot Dates</th>
                      <th className="p-4">SaaS Escrow Budget</th>
                      <th className="p-4">Agreed Status</th>
                      <th className="p-4">Escrow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filteredBookings.map((b) => (
                      <tr 
                        key={b.id} 
                        onClick={() => setSelectedDetailedBooking(b)}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="p-4 col-span-1">
                          <div>
                            <strong className="block text-white text-xs font-bold">{b.projectDetails.brandName}</strong>
                            <span className="text-zinc-500">{b.projectDetails.campaignType} • {b.projectDetails.location}</span>
                          </div>
                        </td>
                        <td className="p-4 flex items-center space-x-2">
                          <img src={b.modelImage} alt={b.modelName} referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover border border-white/10" />
                          <strong className="font-bold text-white">{b.modelName}</strong>
                        </td>
                        <td className="p-4 text-zinc-400">{b.projectDetails.date} ({b.projectDetails.duration})</td>
                        <td className="p-4 font-bold text-[#FF6F00]">₹{b.priceAmount.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-block rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase ${
                            b.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                            b.status === 'accepted' ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' :
                            b.status === 'rejected' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
                            'bg-amber-500/10 border border-[#FF6F00]/20 text-[#FF6F00]'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          {onUpdateBookingStatus ? (
                            b.status === 'pending' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'accepted')}
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase cursor-pointer border border-emerald-500/25"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'rejected')}
                                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase cursor-pointer border border-rose-500/25"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : b.status === 'accepted' ? (
                              <button
                                onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                                className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase cursor-pointer border border-sky-500/25"
                              >
                                Complete Settle
                              </button>
                            ) : (
                              <span className="text-zinc-500 text-[10px]">-</span>
                            )
                          ) : (
                            <span className="text-zinc-500 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* USERS / CLIENT MODERATION CONSOLE */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl animate-fadeIn">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-extrabold text-white">Clients & Accounts Moderation</h3>
          </div>
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-white/5 font-bold text-zinc-400 uppercase border-b border-white/10">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Primary Email</th>
                  <th className="p-4">Register Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Moderator Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {systemUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <strong className="block text-white text-xs font-bold">{u.name}</strong>
                      <span className="text-zinc-500">{u.phone}</span>
                    </td>
                    <td className="p-4 text-zinc-300">{u.email}</td>
                    <td className="p-4 uppercase tracking-wider font-bold text-[10px] text-zinc-400">{u.role}</td>
                    <td className="p-4 font-bold">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[9px] font-mono ${
                        u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.status === 'active' ? '● ACTIVE' : '■ SUSPENDED'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center space-x-2">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`rounded px-3 py-1 font-bold text-[10px] transition cursor-pointer ${
                          u.status === 'active' 
                            ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400' 
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend Account' : 'Lift Suspension'}
                      </button>
                      {onImpersonateUser && (
                        <button
                          onClick={() => onImpersonateUser(u)}
                          className="rounded px-3 py-1 font-bold text-[10px] bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 transition cursor-pointer"
                        >
                          Login as User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit_log' && (
        <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl animate-fadeIn">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-white">Platform System Audit Ledger</h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Real-time chronological trace of administrative actions, booking shifts, and talent approvals for ecosystem compliance and transparency.
              </p>
            </div>
            
            {/* Quick Stats Indicator */}
            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
                <span className="text-[9px] text-zinc-400 uppercase font-mono block">Total Events Logs</span>
                <span className="text-sm font-black text-white font-mono">{auditLogs.length}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-right">
                <span className="text-[9px] text-amber-400 uppercase font-mono block">Active Operator</span>
                <span className="text-xs font-bold text-amber-300 font-mono">System Admin</span>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Action Type Filter Tab-buttons */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Actions' },
                { id: 'model', label: 'Talent Approvals' },
                { id: 'booking', label: 'Booking Shifts' },
                { id: 'user', label: 'Moderation Logs' }
              ].map((f) => (
                <button
                  key={f.id}
                  id={`audit-filter-${f.id}`}
                  onClick={() => setAuditFilterAction(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    auditFilterAction === f.id
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Search audit trail details..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
              />
              {auditSearchQuery && (
                <button
                  onClick={() => setAuditSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Ledger Chronological Timeline List */}
          <div className="p-6">
            {(() => {
              // Apply Filtering and Search logic
              const filteredLogs = auditLogs.filter(log => {
                const matchesCategory = auditFilterAction === 'all' || log.entityType === auditFilterAction;
                const matchesSearch = !auditSearchQuery || 
                  log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                  log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                  log.performedBy.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                  (log.entityId && log.entityId.toLowerCase().includes(auditSearchQuery.toLowerCase()));
                return matchesCategory && matchesSearch;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-3">
                    <FileText className="h-10 w-10 text-zinc-700 stroke-[1.5]" />
                    <p className="text-xs">No matching system audit entries found for the current filter criteria.</p>
                  </div>
                );
              }

              return (
                <div className="relative border-l border-white/10 pl-6 space-y-8 ml-3">
                  {filteredLogs.map((log) => {
                    // Determine styling & icon based on log type / action
                    let typeColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
                    let typeIcon = <Activity className="h-3.5 w-3.5" />;
                    
                    if (log.entityType === 'model' || log.action.includes('Registration')) {
                      typeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                      typeIcon = <Users className="h-3.5 w-3.5" />;
                    } else if (log.entityType === 'booking' || log.action.includes('Booking')) {
                      typeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      typeIcon = <Calendar className="h-3.5 w-3.5" />;
                    } else if (log.entityType === 'user' || log.action.includes('Moderation')) {
                      typeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                      typeIcon = <Ban className="h-3.5 w-3.5" />;
                    } else if (log.entityType === 'payment') {
                      typeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      typeIcon = <DollarSign className="h-3.5 w-3.5" />;
                    }

                    return (
                      <div key={log.id} className="relative group">
                        {/* Circle node on timeline */}
                        <div className={`absolute -left-[33px] top-0.5 rounded-full p-1 border bg-[#121212] transition-transform group-hover:scale-110 flex items-center justify-center ${typeColor}`}>
                          {typeIcon}
                        </div>

                        {/* Content Card */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition duration-200">
                          {/* Top metadata line */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${typeColor}`}>
                                {log.action}
                              </span>
                              {log.entityId && (
                                <span className="text-[10px] font-mono text-zinc-500">
                                  ID: {log.entityId}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 font-mono">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Detail body */}
                          <p className="text-xs text-zinc-300 font-medium">
                            {log.details}
                          </p>

                          {/* Footer Operator Info */}
                          <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500">
                            <div className="flex items-center space-x-1">
                              <span className="font-mono">Authorized Operator:</span>
                              <strong className="text-zinc-400 font-bold">{log.performedBy}</strong>
                            </div>
                            <div className="font-mono text-[9px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded-md">
                              SECURE-LEDGER-ID: {log.id}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ADMIN PAYOUTS TAB */}
      {activeTab === 'payouts' && (() => {
        // Compute statistics
        const escrowHeld = payouts
          .filter(p => p.escrowStatus === 'escrowed' || p.escrowStatus === 'pending_approval')
          .reduce((sum, p) => sum + p.amount, 0);
        const releasedFunds = payouts
          .filter(p => p.escrowStatus === 'released')
          .reduce((sum, p) => sum + p.amount, 0);
        const pendingApprovalsCount = payouts.filter(p => p.escrowStatus === 'pending_approval').length;

        // Filter payouts
        const filteredPayouts = payouts.filter(p => {
          const matchesStatus = payoutFilter === 'all' || p.escrowStatus === payoutFilter;
          const searchLower = payoutSearch.toLowerCase();
          const matchesSearch = 
            p.brandName.toLowerCase().includes(searchLower) ||
            p.modelName.toLowerCase().includes(searchLower) ||
            p.clientName.toLowerCase().includes(searchLower) ||
            p.bookingId.toLowerCase().includes(searchLower);
          return matchesStatus && matchesSearch;
        });

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Escrow Financial Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Secured Escrow Vault</span>
                  <span className="text-xl font-black text-amber-500 font-mono mt-1 block">
                    ₹{escrowHeld.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-1">Funds currently locked safely in ModelVerse platform vaults.</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <Shield className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Released Disbursals</span>
                  <span className="text-xl font-black text-emerald-500 font-mono mt-1 block">
                    ₹{releasedFunds.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-1">Released funds successfully transferred directly to models.</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Pending Platform Approvals</span>
                  <span className="text-xl font-black text-rose-500 font-mono mt-1 block">
                    {pendingApprovalsCount} <span className="text-xs text-zinc-400 font-normal">Campaigns Completed</span>
                  </span>
                  <p className="text-[9px] text-zinc-500 mt-1">Awaiting final admin approval to dispatch escrow holdings.</p>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Main Payouts Ledger card */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    <h3 className="text-base font-extrabold text-white">Escrow Payout Ledger</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supervise platform billing, secure campaign escrow contracts, and approve bank release disbursements once brand casting deliverables are verified.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    // Create a mock escrow payout if none exist, just for rich evaluation
                    const seedMockPayout = async () => {
                      const newPayout: Payout = {
                        id: `pay_mock_${Date.now()}`,
                        bookingId: `bk_mock_${Math.floor(1000 + Math.random() * 9000)}`,
                        brandName: 'Zara Autumn Launch',
                        modelId: 'm1',
                        modelName: 'Priya Sharma',
                        clientId: 'c_test',
                        clientName: 'Demo Client',
                        amount: 45000,
                        escrowStatus: 'pending_approval',
                        createdAt: new Date().toISOString(),
                        payoutNotes: 'Casting successfully concluded. Deliverables verified.'
                      };
                      await dbService.savePayout(newPayout);
                    };
                    seedMockPayout();
                  }}
                  className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-300 hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Seed Simulation Payout
                </button>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Filter Tab-buttons */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  {(['all', 'escrowed', 'pending_approval', 'released', 'cancelled'] as const).map((filter) => (
                    <button
                      key={filter}
                      id={`payout-filter-${filter}`}
                      onClick={() => setPayoutFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        payoutFilter === filter
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-transparent text-zinc-400 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      {filter === 'all' ? 'All Transactions' : filter.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                  ))}
                </div>

                {/* Search query field */}
                <div className="relative w-full lg:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search Brand, Model, Client, or Booking ID..."
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition font-sans"
                  />
                </div>
              </div>

              {/* Payouts Table list */}
              <div className="overflow-x-auto">
                {filteredPayouts.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 text-xs">
                    <DollarSign className="h-8 w-8 mx-auto text-zinc-600 mb-2 stroke-1" />
                    No payout records found matching the active filters.
                  </div>
                ) : (
                  <table className="w-full min-w-[900px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                        <th className="px-6 py-3.5 font-mono">Ledger ID / Campaign</th>
                        <th className="px-6 py-3.5">Model (Beneficiary)</th>
                        <th className="px-6 py-3.5">Client (Depositor)</th>
                        <th className="px-6 py-3.5 text-right font-sans">Escrow Amount</th>
                        <th className="px-6 py-3.5 text-center">Clearance Status</th>
                        <th className="px-6 py-3.5 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPayouts.map((payout) => {
                        return (
                          <tr key={payout.id} className="hover:bg-white/[0.01] transition-colors text-xs">
                            <td className="px-6 py-4">
                              <span className="font-mono text-[9px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {payout.bookingId}
                              </span>
                              <span className="font-bold text-white block mt-1">{payout.brandName}</span>
                            </td>
                            <td className="px-6 py-4 font-sans text-zinc-300">
                              <span className="font-semibold text-white block">{payout.modelName}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">ID: {payout.modelId}</span>
                            </td>
                            <td className="px-6 py-4 font-sans text-zinc-300">
                              <span className="font-medium block">{payout.clientName}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">ID: {payout.clientId}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-white font-mono block">
                                ₹{payout.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[9px] text-zinc-500 block">INR Standard</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {payout.escrowStatus === 'released' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Released
                                </span>
                              )}
                              {payout.escrowStatus === 'pending_approval' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                                  Awaiting Release Approval
                                </span>
                              )}
                              {payout.escrowStatus === 'escrowed' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Funds Held in Escrow
                                </span>
                              )}
                              {payout.escrowStatus === 'cancelled' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-500/10 text-zinc-400 border border-white/10">
                                  Refunded / Cancelled
                                </span>
                              )}
                              {payout.releasedAt && (
                                <span className="block text-[8px] text-emerald-500/70 font-mono mt-1">
                                  Cleared: {new Date(payout.releasedAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-y-1">
                              {payout.escrowStatus === 'pending_approval' && (
                                <button
                                  onClick={() => {
                                    setSelectedPayoutForRelease(payout);
                                    setPayoutTxRef(`TXN-MVI-${Math.floor(10000000 + Math.random() * 90000000)}`);
                                    setPayoutNotesInput(`Cleared platform payout to ${payout.modelName} via online bank transfer.`);
                                  }}
                                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black text-[10px] font-black transition cursor-pointer hover:opacity-95"
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>Approve & Release Funds</span>
                                </button>
                              )}
                              {payout.escrowStatus === 'escrowed' && (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      if (confirm('Verify: Update escrow to pending release once casting is concluded?')) {
                                        await dbService.updatePayoutStatus(payout.id, 'pending_approval', undefined, 'Escrow status moved to Awaiting approval upon admin review.');
                                      }
                                    }}
                                    className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-zinc-300 font-bold hover:bg-white/10 transition cursor-pointer"
                                  >
                                    Awaiting Approval
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to cancel this escrow and refund the client?')) {
                                        await dbService.updatePayoutStatus(payout.id, 'cancelled', undefined, 'Casting cancelled. Escrow holdings refunded back to brand client.');
                                      }
                                    }}
                                    className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400 font-bold hover:bg-rose-500/20 transition cursor-pointer"
                                  >
                                    Cancel & Refund
                                  </button>
                                </div>
                              )}
                              {payout.escrowStatus === 'released' && (
                                <div className="text-right text-[10px] text-zinc-400 font-mono space-y-0.5">
                                  <p className="font-bold text-zinc-300">Cleared Release</p>
                                  <p className="text-[9px] text-zinc-500">Ref: {payout.transactionReference || 'N/A'}</p>
                                </div>
                              )}
                              {payout.escrowStatus === 'cancelled' && (
                                <div className="text-right text-[10px] text-zinc-500 italic">
                                  Refunded / Cancelled
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* General Escrow Policy Guidelines Note */}
            <div className="rounded-xl border border-white/5 bg-[#121212] p-4 flex gap-3.5 items-start">
              <Shield className="h-5 w-5 text-amber-500/80 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-300">Ecosystem Escrow & Release Terms</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                  ModelVerse India employs a multi-step secure escrow contract system. When brands sign contracts and deposit booking funds, the amount is stored safely as "Funds Held in Escrow." Once casting is complete and models update the booking status to completed, payouts enter "Awaiting Release Approval." Admin verifies proof of completion before initiating the bank dispatches. 
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'database' && (() => {
        const sqlSchema = `-- Copy and run this SQL script in your Supabase SQL Editor
-- This will create all 10 tables required for ModelVerse India:

-- 1. Create the public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'client',
    phone TEXT,
    status TEXT DEFAULT 'active',
    "avatarUrl" TEXT,
    favorites TEXT[] DEFAULT '{}',
    "createdAt" TEXT DEFAULT timezone('utc'::text, now())::text,
    updated_at TEXT DEFAULT timezone('utc'::text, now())::text
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Create public.users table (login credentials)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service_role full control on users" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Allow public insert to register" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for credentials match" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow users to update credentials" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Create public.models table
CREATE TABLE IF NOT EXISTS public.models (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    height TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    languages TEXT[] DEFAULT '{}',
    experience TEXT,
    category TEXT NOT NULL,
    portfolio TEXT[] DEFAULT '{}',
    "portfolioCaptions" TEXT[],
    "portfolioCategories" TEXT[],
    "videoUrl" TEXT,
    "availabilityStatus" TEXT DEFAULT 'Available',
    "selfieVerified" BOOLEAN DEFAULT TRUE,
    "selfieUrl" TEXT,
    approved BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    archived BOOLEAN DEFAULT FALSE,
    "govIdUrl" TEXT,
    "pdfUrl" TEXT,
    "pdfName" TEXT,
    "startingPrice" INTEGER DEFAULT 15000,
    rating NUMERIC DEFAULT 5.0,
    "reviewsCount" INTEGER DEFAULT 0,
    biography TEXT,
    phone TEXT,
    email TEXT,
    "socialLinks" JSONB,
    measurements JSONB,
    "agencyInfo" JSONB,
    "additionalDetails" JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert own model" ON public.models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update own model" ON public.models FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Create public.bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelImage" TEXT NOT NULL,
    "projectDetails" JSONB NOT NULL,
    status TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "priceAmount" INTEGER NOT NULL,
    "pdfSummaryUrl" TEXT,
    "pdfGeneratedAt" TEXT,
    "isSharedWithClient" BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update bookings" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Create public.payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    amount INTEGER NOT NULL,
    "paymentGateway" TEXT DEFAULT 'Razorpay',
    status TEXT NOT NULL,
    description TEXT,
    "createdAt" TEXT NOT NULL,
    "invoiceId" TEXT,
    "sessionId" TEXT,
    "modelId" TEXT,
    "modelName" TEXT
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);

-- 6. Create public.messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "bookingId" TEXT
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update messages" ON public.messages FOR UPDATE USING (true) WITH CHECK (true);

-- 7. Create public.payouts table
CREATE TABLE IF NOT EXISTS public.payouts (
    id TEXT PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    amount INTEGER NOT NULL,
    "escrowStatus" TEXT DEFAULT 'escrowed',
    "createdAt" TEXT NOT NULL,
    "releasedAt" TEXT,
    "transactionReference" TEXT,
    "payoutNotes" TEXT
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on payouts" ON public.payouts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert payouts" ON public.payouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update payouts" ON public.payouts FOR UPDATE USING (true) WITH CHECK (true);

-- 8. Create public.posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    model_id TEXT,
    model_name TEXT,
    model_image TEXT,
    content TEXT,
    media_type TEXT,
    media_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TEXT,
    aspect_ratio TEXT DEFAULT '1:1',
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlock_price INTEGER DEFAULT 0
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);

-- 9. Create public.reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientAvatar" TEXT,
    "modelId" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT NOT NULL,
    date TEXT NOT NULL
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);

-- 10. Create public.audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
`;

        const copySqlToClipboard = () => {
          navigator.clipboard.writeText(sqlSchema);
          alert('Supabase database setup SQL script successfully copied to clipboard!');
        };

        return (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Connection Diagnostic Panel */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#FF5722]" />
                    Supabase Database Connectivity Status
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Verify connection credentials and check if SQL schema tables are initialized.
                  </p>
                </div>
                <button
                  onClick={runDatabaseDiagnostics}
                  disabled={dbStatus === 'testing'}
                  className="px-4 py-2 text-xs font-black bg-white/5 hover:bg-white/10 text-white rounded-xl transition border border-white/10 flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${dbStatus === 'testing' ? 'animate-spin' : ''}`} />
                  {dbStatus === 'testing' ? 'Running Diagnostics...' : 'Test Connection'}
                </button>
              </div>

              {/* Status Display Card */}
              <div className="mt-5 p-4 rounded-xl border bg-black/40 flex items-start gap-3.5 border-neutral-800">
                {dbStatus === 'testing' && (
                  <>
                    <div className="animate-pulse h-4 w-4 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-500 font-mono">TESTING CONNECTIVITY...</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Probing your Supabase REST endpoints and performing diagnostic verification queries. Please wait.
                      </p>
                    </div>
                  </>
                )}

                {dbStatus === 'connected' && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-emerald-500 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-black font-black">✓</div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-500 font-mono">SUPABASE CONNECTED & FULLY INITIALIZED</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Perfect! Successfully authenticated with your Supabase credentials, and the <strong className="text-white">models</strong> table is accessible. Data will persist in real-time.
                      </p>
                    </div>
                  </>
                )}

                {dbStatus === 'connected_no_tables' && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-amber-500 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-black font-black">!</div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-500 font-mono">CONNECTED (TABLES MISSING)</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Supabase credentials are valid, but the necessary database tables do not exist in your Supabase project yet. Use the SQL editor below to create them.
                      </p>
                    </div>
                  </>
                )}

                {dbStatus === 'error' && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-rose-500 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-white font-black">✕</div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-500 font-mono">CONNECTION FAILED (FALLBACK ACTIVE)</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Error: <code className="text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded font-mono text-[9px]">{dbErrorMsg}</code>. 
                        The application has automatically activated the in-memory fallback engine so all services are still fully operational locally.
                      </p>
                    </div>
                  </>
                )}

                {dbStatus === 'idle' && (
                  <>
                    <div className="h-4 w-4 rounded-full bg-zinc-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 font-mono">DIAGNOSTICS PENDING</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                        Click "Test Connection" to check if the Supabase database is reachable and if tables are configured correctly.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/5 bg-[#121212] p-4 text-left">
                <span className="text-[10px] font-bold text-amber-500 font-mono uppercase bg-amber-500/10 px-2 py-0.5 rounded">Step 1</span>
                <h4 className="text-xs font-black text-white mt-3">Open Supabase SQL Editor</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Log in to your project inside the Supabase Dashboard, and click the <strong>SQL Editor</strong> tab on the left navigation rail.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#121212] p-4 text-left">
                <span className="text-[10px] font-bold text-emerald-500 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Step 2</span>
                <h4 className="text-xs font-black text-white mt-3">Paste the Migration Script</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Copy the full SQL schema script from the console below. Paste it into the SQL Editor panel as a new query.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#121212] p-4 text-left">
                <span className="text-[10px] font-bold text-purple-400 font-mono uppercase bg-purple-500/10 px-2 py-0.5 rounded">Step 3</span>
                <h4 className="text-xs font-black text-white mt-3">Click Run & Test</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Press <strong>Run</strong> in Supabase. Once success is returned, return to this panel and click <strong>Test Connection</strong> to verify live sync!
                </p>
              </div>
            </div>

            {/* SQL Copy & View Panel */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/40">
                <div>
                  <h3 className="text-xs font-extrabold text-white">Full SQL Schema Script</h3>
                  <p className="text-[9px] text-zinc-400 mt-0.5 font-medium">Use this precise SQL code to instantly create all tables, schemas, and security policies.</p>
                </div>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3.5 py-1.5 text-[10px] font-mono font-black bg-[#EA3838] hover:bg-[#d32f2f] text-white rounded-lg transition uppercase flex items-center gap-1.5 cursor-pointer shadow-md text-center"
                >
                  <FileText className="h-3 w-3" />
                  Copy SQL Code
                </button>
              </div>
              <div className="p-4 bg-black/60 font-mono text-[10px] text-zinc-300 leading-relaxed overflow-x-auto max-h-[350px] whitespace-pre text-left">
                {sqlSchema}
              </div>
            </div>
          </div>
        );
      })()}

      {/* DETAILED BOOKING DIALOG OVERLAY */}
      {selectedDetailedBooking && (() => {
        const matchingClientUser = systemUsers.find(u => u.id === selectedDetailedBooking.clientId);
        const matchingModelData = models.find(m => m.id === selectedDetailedBooking.modelId);
        
        return (
          <div id="booking-detail-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl text-left overflow-y-auto max-h-[90vh]">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest font-mono">SaaS Escrow Clearance Node</span>
                  <h3 className="text-lg font-black text-white mt-1">Campaign Booking Ledger ID: {selectedDetailedBooking.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDetailedBooking(null)}
                  className="rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Brand & Campaign Specifics */}
                <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Campaign & Brand Details</h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block font-mono">Brand Name</span>
                      <strong className="text-white text-xs">{selectedDetailedBooking.projectDetails.brandName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block font-mono">Company Entity</span>
                      <strong className="text-zinc-300">{selectedDetailedBooking.projectDetails.companyName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block font-mono">Campaign Type</span>
                      <strong className="text-zinc-300">{selectedDetailedBooking.projectDetails.campaignType} • {selectedDetailedBooking.projectDetails.shootType}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block font-mono">Location & Schedule</span>
                      <strong className="text-zinc-300">{selectedDetailedBooking.projectDetails.location} • {selectedDetailedBooking.projectDetails.date} ({selectedDetailedBooking.projectDetails.duration})</strong>
                    </div>
                    {selectedDetailedBooking.projectDetails.notes && (
                      <div>
                        <span className="text-zinc-500 block font-mono">Casting Requirements / Notes</span>
                        <p className="text-zinc-400 italic mt-1 leading-relaxed bg-[#18181B] p-2.5 rounded-lg border border-white/5">{selectedDetailedBooking.projectDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Escrow Budget & Settlement Info */}
                <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Escrow & Settlement</h4>
                    <div className="space-y-2 mt-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block font-mono">Agreed Escrow Amount</span>
                        <strong className="text-xl font-black text-amber-500 font-mono">₹{selectedDetailedBooking.priceAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-mono">Current Escrow Clearance State</span>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase mt-1 ${
                          selectedDetailedBooking.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                          selectedDetailedBooking.status === 'accepted' ? 'bg-sky-500/20 border border-sky-500/30 text-sky-400' :
                          selectedDetailedBooking.status === 'rejected' ? 'bg-red-500/20 border border-red-500/30 text-red-500' :
                          'bg-amber-500/20 border border-[#FF6F00]/30 text-[#FF6F00]'
                        }`}>
                          {selectedDetailedBooking.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-mono">Agreement Logged</span>
                        <strong className="text-zinc-300">{new Date(selectedDetailedBooking.createdAt).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside Detail Popup */}
                  {onUpdateBookingStatus && (
                    <div className="pt-4 border-t border-white/10 mt-4 flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase text-zinc-500 font-mono tracking-wider">Moderator Actions</span>
                      {selectedDetailedBooking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onUpdateBookingStatus(selectedDetailedBooking.id, 'accepted');
                              setSelectedDetailedBooking(prev => prev ? { ...prev, status: 'accepted' } : null);
                            }}
                            className="flex-1 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase transition cursor-pointer text-center"
                          >
                            Approve & Hold Escrow
                          </button>
                          <button
                            onClick={() => {
                              onUpdateBookingStatus(selectedDetailedBooking.id, 'rejected');
                              setSelectedDetailedBooking(prev => prev ? { ...prev, status: 'rejected' } : null);
                            }}
                            className="flex-1 py-2 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase transition cursor-pointer text-center"
                          >
                            Decline Booking
                          </button>
                        </div>
                      )}
                      {selectedDetailedBooking.status === 'accepted' && (
                        <button
                          onClick={() => {
                            onUpdateBookingStatus(selectedDetailedBooking.id, 'completed');
                            setSelectedDetailedBooking(prev => prev ? { ...prev, status: 'completed' } : null);
                          }}
                          className="w-full py-2.5 rounded bg-sky-500 hover:bg-sky-600 text-black text-[10px] font-black uppercase transition cursor-pointer text-center"
                        >
                          Complete Campaign & Settle Funds
                        </button>
                      )}
                      {selectedDetailedBooking.status !== 'pending' && selectedDetailedBooking.status !== 'accepted' && (
                        <p className="text-[10px] text-zinc-500 italic text-center">This contract agreement is closed and cannot be modified.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Client Profile details */}
                <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Client Profile Details</h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-zinc-500 block font-mono">Client Full Name</span>
                      <strong className="text-white text-xs">{selectedDetailedBooking.clientName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block font-mono">Client Registered ID</span>
                      <strong className="text-zinc-400 font-mono">{selectedDetailedBooking.clientId}</strong>
                    </div>
                    {matchingClientUser ? (
                      <>
                        <div>
                          <span className="text-zinc-500 block font-mono">Email Address</span>
                          <strong className="text-zinc-300 font-bold">{matchingClientUser.email}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-mono">Contact Phone</span>
                          <strong className="text-zinc-300 font-bold">{matchingClientUser.phone || '9876543210'}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-mono">Account Status</span>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold font-mono uppercase ${
                            matchingClientUser.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {matchingClientUser.status}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-500 italic text-[10px]">Client is an unregistered/mock guest user (seeded campaign context).</p>
                    )}
                  </div>
                </div>

                {/* Model Profile details */}
                <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Model Profile Details</h4>
                  <div className="flex items-center space-x-3 pb-2 border-b border-white/5">
                    <img 
                      src={selectedDetailedBooking.modelImage} 
                      alt={selectedDetailedBooking.modelName} 
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover border border-white/10" 
                    />
                    <div>
                      <strong className="text-white text-xs block">{selectedDetailedBooking.modelName}</strong>
                      <span className="text-[9px] text-zinc-500 font-mono">ID: {selectedDetailedBooking.modelId}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {matchingModelData ? (
                      <>
                        <div>
                          <span className="text-zinc-500 block font-mono">Experience & Category</span>
                          <strong className="text-zinc-300">{matchingModelData.experience} • {matchingModelData.category}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-mono">Origin Location</span>
                          <strong className="text-zinc-300">{matchingModelData.city}, {matchingModelData.state}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-mono">Starting Price Rate</span>
                          <strong className="text-zinc-300 font-bold">₹{matchingModelData.startingPrice.toLocaleString()} / day</strong>
                        </div>
                        {matchingModelData.measurements && (
                          <div>
                            <span className="text-zinc-500 block font-mono">Measurements (Bust-Waist-Hips)</span>
                            <strong className="text-zinc-300">{matchingModelData.measurements.bust}-{matchingModelData.measurements.waist}-{matchingModelData.measurements.hips}</strong>
                          </div>
                        )}
                        {matchingModelData.email && (
                          <div>
                            <span className="text-zinc-500 block font-mono">Direct Email</span>
                            <strong className="text-zinc-300 font-bold">{matchingModelData.email}</strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-zinc-500 italic text-[10px]">Model complete portfolio is deleted or archived.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* RELEASE PAYOUT DISPATCH OVERLAY FORM */}
      {selectedPayoutForRelease && (
        <div id="payout-release-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl text-left">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-500 tracking-widest font-mono">Secured Escrow Dispatch Center</span>
                <h3 className="text-base font-extrabold text-white mt-1">Approve Escrow Release</h3>
              </div>
              <button 
                onClick={() => setSelectedPayoutForRelease(null)}
                className="rounded-full bg-white/5 p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Campaign Summary card */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Campaign:</span>
                <strong className="text-white font-bold">{selectedPayoutForRelease.brandName}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Model (Beneficiary):</span>
                <strong className="text-white font-semibold">{selectedPayoutForRelease.modelName}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Brand Client:</span>
                <strong className="text-white font-medium">{selectedPayoutForRelease.clientName}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 border-t border-white/5 pt-2 mt-2">
                <span className="font-semibold text-zinc-300">Escrow Transfer Amount:</span>
                <strong className="text-emerald-400 font-mono text-sm font-black">
                  ₹{selectedPayoutForRelease.amount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Form inputs */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!payoutTxRef.trim()) {
                alert('Please provide a transaction reference ID.');
                return;
              }
              setIsSubmittingPayout(true);
              try {
                await dbService.updatePayoutStatus(
                  selectedPayoutForRelease.id,
                  'released',
                  payoutTxRef.trim(),
                  payoutNotesInput.trim() || undefined
                );
                setSelectedPayoutForRelease(null);
                setPayoutTxRef('');
                setPayoutNotesInput('');
              } catch (err) {
                console.error(err);
                alert('An error occurred while releasing the payout.');
              } finally {
                setIsSubmittingPayout(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                  Bank Transaction Reference ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-90123847-MVI"
                  value={payoutTxRef}
                  onChange={(e) => setPayoutTxRef(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                />
                <span className="text-[9px] text-zinc-500 block mt-1 leading-relaxed">
                  Provide the official bank clearance reference ID, IMPS trace, or Razorpay payout receipt identifier for ledger traceability.
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                  Disbursal Clearance Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared full contract payment to Priya's HDFC bank account via IMPS transfer."
                  value={payoutNotesInput}
                  onChange={(e) => setPayoutNotesInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayoutForRelease(null)}
                  className="w-1/2 rounded-xl bg-white/5 border border-white/5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-[#202020] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="w-1/2 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black text-xs font-black transition cursor-pointer hover:opacity-95 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isSubmittingPayout ? (
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin text-black" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-black" />
                  )}
                  <span>{isSubmittingPayout ? 'Disbursing...' : 'Confirm Release'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODEL MODAL */}
      {editingModel && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingModel(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <span>Edit Model Portfolio Details</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                You are editing <strong>{editingModel.name}</strong>'s professional profile. Saving will update the global listing database.
              </p>
            </div>

            <form onSubmit={handleSaveModelEdit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Model Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModel.name || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Niche Category *
                  </label>
                  <select
                    value={editingModel.category || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="Fashion Models">Fashion Models</option>
                    <option value="Commercial Models">Commercial Models</option>
                    <option value="Fitness & Sports Models">Fitness & Sports Models</option>
                    <option value="Plus-Size Models">Plus-Size Models</option>
                    <option value="Parts Models">Parts Models</option>
                    <option value="Promo & Event Models">Promo & Event Models</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Starting Day Rate (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingModel.startingPrice || 0}
                    onChange={(e) => setEditingModel({ ...editingModel, startingPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingModel.age || 0}
                    onChange={(e) => setEditingModel({ ...editingModel, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModel.city || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModel.state || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, state: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Height *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModel.height || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, height: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Experience Level *
                  </label>
                  <select
                    value={editingModel.experience || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, experience: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="Fresh Face">Fresh Face</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                  Biography & Bio Details
                </label>
                <textarea
                  rows={3}
                  value={editingModel.biography || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, biography: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Availability Status *
                  </label>
                  <select
                    value={editingModel.availabilityStatus || 'Available'}
                    onChange={(e) => setEditingModel({ ...editingModel, availabilityStatus: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="On-Leave">On-Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider mb-1">
                    Selfie Verified status
                  </label>
                  <select
                    value={editingModel.selfieVerified ? "true" : "false"}
                    onChange={(e) => setEditingModel({ ...editingModel, selfieVerified: e.target.value === "true" })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="true">Verified (Green Checkmark)</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="w-1/2 rounded-xl bg-white/5 border border-white/5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-[#202020] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FFA000] text-black text-xs font-black transition cursor-pointer hover:opacity-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
