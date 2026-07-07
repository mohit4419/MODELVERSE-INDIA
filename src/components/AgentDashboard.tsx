/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Eye, 
  Archive, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  User as UserIcon, 
  MapPin, 
  Activity, 
  FileText, 
  Sparkles, 
  Star, 
  Check,
  ChevronDown,
  ShieldCheck,
  Building,
  Clock,
  ArrowUpRight,
  Sparkle,
  UploadCloud,
  Loader2,
  X,
  Instagram,
  Twitter,
  Globe,
  Youtube,
  Percent,
  Plus,
  Download,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sliders
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Model, Booking, PaymentRecord } from '../types';
import { dbService } from '../services/db';

interface AgentDashboardProps {
  models: Model[];
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => void;
  onUpdateModel: (updatedModel: Model) => void;
  triggerToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  onUpdateBooking?: (updatedBooking: Booking) => void;
}

export default function AgentDashboard({
  models,
  bookings,
  onUpdateBookingStatus,
  onUpdateModel,
  triggerToast,
  onUpdateBooking
}: AgentDashboardProps) {
  // Find registered model or default to first approved model (Priya Sharma is 'm1')
  const currentUser = dbService.getCurrentSessionUser();
  const defaultModel = (currentUser && models.find(m => m.userId === currentUser.id || m.email?.toLowerCase() === currentUser.email?.toLowerCase())) || models.find(m => m.userId === 'u_registered_tester') || models.find(m => m.id === 'm1') || models[0];
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModel?.id || '');

  // Keep selected model in sync with logged-in user if they are a model
  useEffect(() => {
    const user = dbService.getCurrentSessionUser();
    if (user && user.role === 'model') {
      const myModel = models.find(m => m.userId === user.id || m.email?.toLowerCase() === user.email?.toLowerCase());
      if (myModel && myModel.id !== selectedModelId) {
        setSelectedModelId(myModel.id);
      }
    }
  }, [models, selectedModelId]);

  // Track state of active model being viewed
  const activeModel = models.find(m => m.id === selectedModelId);

  // Profile Edit fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [biography, setBiography] = useState('');
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [socialPortfolio, setSocialPortfolio] = useState('');
  const [portfolio1, setPortfolio1] = useState('');
  const [portfolio2, setPortfolio2] = useState('');
  const [portfolio3, setPortfolio3] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState<{[key: string]: boolean}>({});

  // Crop & Rotate state variables
  const [editingImage, setEditingImage] = useState<{
    src: string;
    key: string;
    callback: (base64: string) => void;
  } | null>(null);

  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [zoom, setZoom] = useState(1.0); // 1.0 to 3.0
  const [offsetX, setOffsetX] = useState(0); // -150px to 150px
  const [offsetY, setOffsetY] = useState(0); // -150px to 150px
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  const handleUploadAndCrop = (file: File, key: string, callback: (base64: string) => void) => {
    setIsCompressing(prev => ({ ...prev, [key]: true }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      setEditingImage({ src: rawBase64, key, callback });
      setRotation(0);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setIsCompressing(prev => ({ ...prev, [key]: false }));
    };
    reader.onerror = () => {
      setIsCompressing(prev => ({ ...prev, [key]: false }));
    };
    reader.readAsDataURL(file);
  };

  const applyCropAndRotate = () => {
    if (!editingImage) return;
    setIsApplyingCrop(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 600;
      const targetHeight = 800; // 3:4 aspect ratio
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear background with rich dark palette
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        // Translate to canvas center
        ctx.translate(targetWidth / 2, targetHeight / 2);
        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);
        // Apply zoom scale
        ctx.scale(zoom, zoom);
        // Apply offsets in translated space
        ctx.translate(offsetX, offsetY);

        // Aspect-fill image within 3:4 container
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let drawWidth = targetWidth;
        let drawHeight = targetHeight;

        if (imgRatio > targetRatio) {
          drawHeight = targetHeight;
          drawWidth = targetHeight * imgRatio;
        } else {
          drawWidth = targetWidth;
          drawHeight = targetWidth / imgRatio;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        editingImage.callback(croppedBase64);
      }
      setIsApplyingCrop(false);
      setEditingImage(null);
    };
    img.src = editingImage.src;
  };

  // Image compression utility
  const compressAndSetImage = (file: File, key: string, callback: (base64: string) => void) => {
    setIsCompressing(prev => ({ ...prev, [key]: true }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;
        
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          callback(compressedBase64);
        }
        setIsCompressing(prev => ({ ...prev, [key]: false }));
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsCompressing(prev => ({ ...prev, [key]: false }));
    };
    reader.readAsDataURL(file);
  };

  // Sync profile editing fields when active model changes
  useEffect(() => {
    if (activeModel) {
      setName(activeModel.name);
      setCity(activeModel.city);
      setStartingPrice(activeModel.startingPrice || 15000);
      setBiography(activeModel.biography || '');
      setBust(activeModel.measurements?.bust || '34"');
      setWaist(activeModel.measurements?.waist || '26"');
      setHips(activeModel.measurements?.hips || '36"');
      setPhone(activeModel.phone || '');
      setEmail(activeModel.email || '');
      setVideoUrl(activeModel.videoUrl || '');
      setInstagram(activeModel.socialLinks?.instagram || '');
      setTwitter(activeModel.socialLinks?.twitter || '');
      setSocialPortfolio(activeModel.socialLinks?.portfolio || '');
      setPortfolio1(activeModel.portfolio?.[0] || '');
      setPortfolio2(activeModel.portfolio?.[1] || '');
      setPortfolio3(activeModel.portfolio?.[2] || '');
    }
  }, [selectedModelId, activeModel]);

  if (!activeModel) {
    return (
      <div className="mx-auto max-w-7xl py-16 px-4 text-center text-white font-sans">
        <AlertCircle className="h-12 w-12 text-[#EA3838] mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-black">No Active Model Profile</h3>
        <p className="text-zinc-400 mt-2 text-sm">Please register a model profile or switch your testing role to see stats.</p>
      </div>
    );
  }

  // Model-specific bookings
  const modelBookings = bookings.filter(b => b.modelId === activeModel.id);
  const pendingBookings = modelBookings.filter(b => b.status === 'pending');
  const acceptedBookings = modelBookings.filter(b => b.status === 'accepted');
  const completedBookings = modelBookings.filter(b => b.status === 'completed');

  // Earnings calculations
  const completedEarnings = completedBookings.reduce((sum, b) => sum + (b.priceAmount || activeModel.startingPrice || 15000), 0);
  const pendingEarnings = pendingBookings.reduce((sum, b) => sum + (b.priceAmount || activeModel.startingPrice || 15000), 0);
  const activeEarnings = acceptedBookings.reduce((sum, b) => sum + (b.priceAmount || activeModel.startingPrice || 15000), 0);
  const totalEarnings = completedEarnings + activeEarnings;

  // Simple analytics for model profiles: views and conversion rate
  const totalBookingsCount = modelBookings.length;
  const seedViewsValue = activeModel.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const profileViews = (activeModel.rating * 150) + (totalBookingsCount * 45) + (seedViewsValue % 450) + 215;

  const completedAndAcceptedCount = acceptedBookings.length + completedBookings.length;
  const conversionRate = totalBookingsCount > 0 
    ? ((completedAndAcceptedCount / totalBookingsCount) * 100).toFixed(1) 
    : "85.5";

  // Handle Visibility Toggle (Archive / Activate)
  const handleToggleVisibility = async () => {
    const nextArchived = !activeModel.archived;
    const updated: Model = {
      ...activeModel,
      archived: nextArchived
    };

    try {
      await dbService.saveModel(updated);
      onUpdateModel(updated);
      triggerToast(
        nextArchived ? 'Profile Archived' : 'Profile Activated',
        nextArchived 
          ? `${activeModel.name} has been archived. Profile is now hidden from search directory.` 
          : `${activeModel.name} is now live on the public ModelVerse directory!`,
        'success'
      );
    } catch (err) {
      console.error('Failed to change model visibility:', err);
      triggerToast('Error', 'Failed to update visibility settings.', 'error');
    }
  };

  // Handle saving basic details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const portfolioArray: string[] = [];
    if (portfolio1) portfolioArray.push(portfolio1);
    if (portfolio2) portfolioArray.push(portfolio2);
    if (portfolio3) portfolioArray.push(portfolio3);

    const updated: Model = {
      ...activeModel,
      name,
      city,
      startingPrice: Number(startingPrice),
      biography,
      phone,
      email,
      videoUrl,
      portfolio: portfolioArray,
      measurements: {
        bust,
        waist,
        hips
      },
      socialLinks: {
        instagram,
        twitter,
        portfolio: socialPortfolio
      }
    };

    try {
      await dbService.saveModel(updated);
      onUpdateModel(updated);
      triggerToast(
        'Profile Updated!',
        `Your casting details and measurements have been successfully saved.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to save profile changes:', err);
      triggerToast('Error', 'Failed to update profile details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate and Download Invoice for Completed Bookings
  const handleDownloadInvoice = (bk: Booking) => {
    if (!activeModel) return;

    try {
      const doc = new jsPDF();
      
      // Draw dark header band
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 40, 'F');

      // Title on Header
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CASTED DIRECTORY', 15, 22);

      // Subtitle
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(236, 72, 153);
      doc.text('LUXURY MODELING PORTAL & SECURE ESCROW AGENT', 15, 29);

      // Invoice stamp info on top right of band
      doc.setTextColor(212, 175, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PAYMENT CLEARED', 145, 20);

      const invoiceId = `INV-CST-${bk.id.substring(0, 8).toUpperCase()}`;
      doc.setTextColor(200, 200, 200);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Invoice ID: ${invoiceId}`, 145, 26);
      doc.text(`Cleared: ${bk.projectDetails?.date || new Date().toLocaleDateString()}`, 145, 32);

      // Section: Partner Details
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('TALENT/BENEFICIARY:', 15, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${activeModel.name}`, 15, 61);
      doc.text(`Base City: ${activeModel.city}`, 15, 67);
      doc.text(`Category: ${activeModel.category || 'Fashion & Runway'}`, 15, 73);
      if (activeModel.email || activeModel.phone) {
        doc.text(`Contact: ${activeModel.email || ''} ${activeModel.phone || ''}`, 15, 79);
      }

      doc.setFont('helvetica', 'bold');
      doc.text('CLIENT/PAYER:', 115, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(`Agency/Brand: ${bk.projectDetails?.brandName || bk.clientName}`, 115, 61);
      doc.text(`Representative: ${bk.clientName}`, 115, 67);
      doc.text('Authorized Escrow Account', 115, 73);

      // Line Separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(15, 87, 195, 87);

      // Section: Campaign & Assignment description
      doc.setFont('helvetica', 'bold');
      doc.text('CAMPAIGN & ASSIGNMENT DETAILS', 15, 96);
      
      // Gray box for assignment stats
      doc.setFillColor(245, 245, 245);
      doc.rect(15, 101, 180, 28, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('CAMPAIGN TYPE:', 20, 107);
      doc.text('EVENT LOCATION:', 20, 113);
      doc.text('SHOOT DATE(S):', 20, 119);
      doc.text('DURATION / HOURS:', 20, 125);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(bk.projectDetails?.campaignType || 'Catalog & Editorial Shoot', 65, 107);
      doc.text(bk.projectDetails?.location || 'Studio Location, India', 65, 113);
      doc.text(bk.projectDetails?.date || 'N/A', 65, 119);
      doc.text(bk.projectDetails?.duration || 'Full-Day (8 hours)', 65, 125);

      // Financial Ledger Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(18, 18, 18);
      doc.text('FINANCIAL STATEMENT & DISBURSEMENT', 15, 142);

      // Headers
      doc.setFillColor(18, 18, 18);
      doc.rect(15, 147, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('LINE ITEM DESCRIPTION', 20, 152);
      doc.text('GROSS AMOUNT', 115, 152);
      doc.text('TAX/DEDUCTION', 145, 152);
      doc.text('NET PAYOUT', 170, 152);

      // Table Row 1: Talent Shoot Contract
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      const totalAmt = bk.priceAmount || activeModel.startingPrice || 15000;
      const agencyFee = totalAmt * 0.10;
      const finalPayout = totalAmt * 0.90;

      doc.text(`${bk.projectDetails?.campaignType || "Casting Contract"} - Talent Fee`, 20, 161);
      doc.text(`INR ${totalAmt.toLocaleString('en-IN')}.00`, 115, 161);
      doc.text('0.00 (0%)', 145, 161);
      doc.text(`INR ${totalAmt.toLocaleString('en-IN')}.00`, 170, 161);

      // Table Row 2: Platform Commission
      doc.text('Casted Directory Platform Escrow Fee (10%)', 20, 168);
      doc.text(`INR ${totalAmt.toLocaleString('en-IN')}.00`, 115, 168);
      doc.text(`INR ${agencyFee.toLocaleString('en-IN')}.00`, 145, 168);
      doc.text(`-INR ${agencyFee.toLocaleString('en-IN')}.00`, 170, 168);

      // Draw thin lines below rows
      doc.setDrawColor(240, 240, 240);
      doc.line(15, 164, 195, 164);
      doc.line(15, 171, 195, 171);

      // Total Row
      doc.setFillColor(254, 244, 244);
      doc.rect(15, 175, 180, 10, 'F');
      doc.setTextColor(236, 72, 153);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TOTAL NET DISBURSED IN TALENT ACCOUNT:', 20, 181);
      doc.text(`INR ${finalPayout.toLocaleString('en-IN')}.00`, 165, 181);

      // Security stamp / signatures at bottom
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('DISBURSEMENT SYSTEM VERIFIED:', 15, 205);
      
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'italic');
      doc.text('Verified Securely via Casted Escrow Protocol', 15, 211);
      doc.text('Razorpay API Engine Clearance ID: RP-TXN-SUCCESS-9011', 15, 216);

      // Draw double line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 230, 195, 230);
      doc.line(15, 231, 195, 231);

      // Footer notice
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is an electronically generated statement. No physical signature is required.', 15, 240);
      doc.text('For queries regarding payout, TDS deductions, or casting terms, reach us at accounts@casted.directory', 15, 245);

      // Save file
      doc.save(`Invoice_${invoiceId}.pdf`);

      triggerToast(
        'Invoice Downloaded!',
        `Successfully generated and downloaded PDF statement for ${bk.projectDetails?.brandName || bk.clientName} Shoot.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      triggerToast('Error', 'Could not generate PDF statement.', 'error');
    }
  };

  // Generate PDF Summary for Accepted Booking
  const generateBookingSummaryPdf = (bk: Booking): string => {
    const doc = new jsPDF();
    
    // Header Band (Midnight gold theme)
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 42, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('MODELVERSE INDIA', 15, 20);

    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(212, 175, 55); // Gold color
    doc.text('OFFICIAL BOOKING CONFIRMATION & CONTRACT SUMMARY', 15, 28);

    // Metadata Right Panel
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Booking Ref: MVI-Ref-${bk.id.substring(0, 8).toUpperCase()}`, 135, 18);
    doc.text(`Status: ACCEPTED & SECURED`, 135, 24);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 135, 30);

    // Gold accent separator bar
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 42, 210, 1.5, 'F');

    // Section 1: Parties involved
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('I. PARTIES & REPRESENTATION', 15, 56);

    // Gray panels for Parties
    doc.setFillColor(248, 248, 248);
    doc.rect(15, 61, 85, 35, 'F');
    doc.rect(110, 61, 85, 35, 'F');

    // Left Panel: Talent Details
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TALENT/MODEL:', 18, 67);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9.5);
    doc.text(`Name: ${bk.modelName}`, 18, 73);
    doc.text(`Model ID: ${bk.modelId}`, 18, 79);
    doc.text(`Category: ${activeModel?.category || 'Professional Talent'}`, 18, 85);
    doc.text(`Base City: ${activeModel?.city || 'India'}`, 18, 91);

    // Right Panel: Client Details
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CLIENT/ADVERTISER:', 113, 67);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9.5);
    doc.text(`Brand Name: ${bk.projectDetails?.brandName}`, 113, 73);
    doc.text(`Company: ${bk.projectDetails?.companyName || bk.clientName}`, 113, 79);
    doc.text(`Contact: ${bk.clientName}`, 113, 85);
    doc.text(`Escrow Agent: ModelVerse India`, 113, 91);

    // Section 2: Campaign Specifications
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('II. CAMPAIGN & PROJECT ASSIGNMENT DETAILS', 15, 110);

    doc.setFillColor(248, 248, 248);
    doc.rect(15, 115, 180, 48, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    doc.text('CAMPAIGN TYPE:', 20, 122);
    doc.text('SHOOT TYPE:', 20, 129);
    doc.text('ASSIGNMENT LOCATION:', 20, 136);
    doc.text('SCHEDULED DATE:', 20, 143);
    doc.text('TOTAL DURATION:', 20, 150);
    doc.text('PROJECT NOTES:', 20, 157);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 30, 30);
    doc.text(bk.projectDetails?.campaignType || 'Commercial Shoot', 65, 122);
    doc.text(bk.projectDetails?.shootType || 'Professional Shoot', 65, 129);
    doc.text(bk.projectDetails?.location || 'Studio, India', 65, 136);
    doc.text(bk.projectDetails?.date || 'N/A', 65, 143);
    doc.text(bk.projectDetails?.duration || '1 Day', 65, 150);
    
    const notes = bk.projectDetails?.notes || 'No custom notes provided for this project assignment.';
    const splitNotes = doc.splitTextToSize(notes, 120);
    doc.text(splitNotes, 65, 157);

    // Section 3: Financial & Escrow Agreement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('III. FINANCIAL TERMS & ESCROW VALUATION', 15, 175);

    doc.setFillColor(255, 251, 243); // warm golden light fill
    doc.setDrawColor(212, 175, 55);
    doc.rect(15, 180, 180, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(140, 110, 30);
    doc.text('TOTAL CONTRACT RATE & ESCROW PROTECTION VALUE:', 20, 189);
    
    doc.setFontSize(13);
    doc.setTextColor(180, 140, 20);
    const price = bk.priceAmount || activeModel?.startingPrice || 15000;
    doc.text(`INR ${price.toLocaleString('en-IN')}.00`, 20, 197);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('This amount is secured in full in our secure platform escrow account. Payout is released on complete status verification.', 115, 189, { maxWidth: 75 });

    // Section 4: Rules & Guidelines / Sign-Off
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('IV. RECORD VALIDITY & SIGN-OFF CERTIFICATION', 15, 214);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text('1. Integrity Protection: This is an official, system-generated summary of an accepted campaign booking compiled for professional record-keeping.', 15, 220);
    doc.text('2. Identity Verification: ModelVerse verifies identity databases and selfie portraits of both the client and model to ensure 100% legal compliance.', 15, 225);
    doc.text('3. Client Access: If shared, the client can view, validate, and download this PDF summary from their bookings portal.', 15, 230);

    // Draw bottom signatures area
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 252, 85, 252);
    doc.line(125, 252, 195, 252);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(130, 130, 130);
    doc.text('MODELVERSE COMPLIANCE UNIT', 15, 257);
    doc.text('REPRESENTATIVE SIGN-OFF (DIGITAL)', 125, 257);

    // Verified Stamp Graphic at bottom center
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.rect(92, 243, 26, 12, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', 97, 249);
    doc.setFontSize(6);
    doc.text('CONTRACT', 97, 253);

    // Return as base64 data URL
    return doc.output('datauristring');
  };

  const handleGenerateAndSavePdf = async (bk: Booking) => {
    try {
      const pdfBase64 = generateBookingSummaryPdf(bk);
      await dbService.updateBookingPdfSummary(bk.id, pdfBase64, false);
      
      if (onUpdateBooking) {
        onUpdateBooking({
          ...bk,
          pdfSummaryUrl: pdfBase64,
          pdfGeneratedAt: new Date().toISOString(),
          isSharedWithClient: false
        });
      }

      triggerToast(
        'PDF Record Saved!',
        'The professional booking PDF record has been successfully generated and saved to the backend database.',
        'success'
      );
    } catch (err) {
      console.error('Failed to generate and save PDF summary:', err);
      triggerToast('Generation Failed', 'Could not compile and save PDF summary.', 'error');
    }
  };

  const handleToggleShareWithClient = async (bk: Booking) => {
    if (!bk.pdfSummaryUrl) {
      triggerToast('Generate PDF First', 'You must generate the PDF summary record before sharing it.', 'info');
      return;
    }

    const nextShareState = !bk.isSharedWithClient;
    try {
      await dbService.updateBookingPdfSummary(bk.id, bk.pdfSummaryUrl, nextShareState);
      
      if (onUpdateBooking) {
        onUpdateBooking({
          ...bk,
          isSharedWithClient: nextShareState
        });
      }

      triggerToast(
        nextShareState ? 'Shared with Client' : 'Sharing Disabled',
        nextShareState 
          ? 'The client can now view, validate, and download this contract summary in their portal.'
          : 'The contract summary is now private and hidden from the client portal.',
        'success'
      );
    } catch (err) {
      console.error('Failed to toggle share state:', err);
      triggerToast('Error', 'Failed to update sharing preference.', 'error');
    }
  };

  const handleDownloadSavedPdf = (bk: Booking) => {
    if (!bk.pdfSummaryUrl) return;
    try {
      const link = document.createElement('a');
      link.href = bk.pdfSummaryUrl;
      link.download = `Booking_Summary_Ref_${bk.id.substring(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerToast(
        'PDF Downloaded',
        'Successfully downloaded the verified contract summary.',
        'success'
      );
    } catch (err) {
      console.error('Failed to download saved PDF:', err);
      triggerToast('Error', 'Failed to download saved PDF summary.', 'error');
    }
  };

  // Profile Completion list item helper
  interface CompletionItem {
    id: string;
    label: string;
    description: string;
    points: number;
    completed: boolean;
    actionLabel: string;
    targetId: string;
  }

  const checkBiography = biography && biography.trim().length >= 15;
  const portfolioCount = [portfolio1, portfolio2, portfolio3].filter(url => url && (url.startsWith('http') || url.startsWith('data:'))).length;
  const checkPortfolio = portfolioCount >= 3;
  const checkVideo = videoUrl && videoUrl.trim().length > 0;
  const checkMeasurements = !!(bust && waist && hips);
  const checkSelfie = !!activeModel.selfieVerified;
  const checkContact = !!(email && phone);
  const checkSocials = !!(instagram || twitter || socialPortfolio);

  const suggestions: CompletionItem[] = [
    {
      id: 'bio',
      label: 'Casting Biography (+15%)',
      description: 'Describe your runway achievements, catalog experience, and specialties.',
      points: 15,
      completed: !!checkBiography,
      actionLabel: 'Write Bio',
      targetId: 'input-biography'
    },
    {
      id: 'portfolio',
      label: '3 Portfolio Images (+20%)',
      description: `Add Close-up, Polaroid, and profile shot. Currently ${portfolioCount}/3 uploaded.`,
      points: 20,
      completed: checkPortfolio,
      actionLabel: 'Upload Photos',
      targetId: 'input-portfolio'
    },
    {
      id: 'video',
      label: 'Video Introduction (+15%)',
      description: 'Add a 30-second catwalk or speaking reel. Multiplies casting selection by 3x!',
      points: 15,
      completed: !!checkVideo,
      actionLabel: 'Add Video link',
      targetId: 'input-videourl'
    },
    {
      id: 'socials',
      label: 'Instagram & Social Handles (+15%)',
      description: 'Connect your Instagram account to let scouters inspect your dynamic portfolio.',
      points: 15,
      completed: checkSocials,
      actionLabel: 'Connect Socials',
      targetId: 'input-socials'
    },
    {
      id: 'measurements',
      label: 'Comp Card measurements (+10%)',
      description: 'Enter your precise bust, waist, and hips metrics for designer size alignments.',
      points: 10,
      completed: checkMeasurements,
      actionLabel: 'Set Measurements',
      targetId: 'input-measurements'
    },
    {
      id: 'selfie',
      label: 'Verify Selfie Identity (+15%)',
      description: 'Prove you are the real talent behind this profile to earn the gold verified badge.',
      points: 15,
      completed: checkSelfie,
      actionLabel: 'Verify ID',
      targetId: 'input-verification'
    },
    {
      id: 'contact',
      label: 'Booking Contact Details (+10%)',
      description: 'Add email or phone contacts so recruiters can dispatch casting deals immediately.',
      points: 10,
      completed: checkContact,
      actionLabel: 'Setup Contact',
      targetId: 'input-contact'
    }
  ];

  // Base score is 10% for basic registration (Name, gender, age, city)
  const basePoints = 10;
  const earnedPoints = suggestions.reduce((sum, item) => sum + (item.completed ? item.points : 0), 0);
  const completionPercent = Math.min(100, basePoints + earnedPoints);

  // Status mapping
  let probabilityText = 'Critical Action Required';
  let probabilityColor = 'text-rose-400';
  let probabilityBg = 'bg-rose-500/10 border-rose-500/20';
  let probabilityBadge = 'bg-rose-500 text-black';
  let probabilityDesc = 'Your profile is considered draft/incomplete. It ranks extremely low in discovery searches and has a limited <5% booking chance.';

  if (completionPercent >= 90) {
    probabilityText = 'Elite Status Profile';
    probabilityColor = 'text-amber-400 animate-pulse';
    probabilityBg = 'bg-amber-500/5 border-amber-500/20';
    probabilityBadge = 'bg-amber-500 text-black font-black';
    probabilityDesc = 'Perfect! Your profile meets elite premium standards. You have a maximum 98% booking probability and top placement search rank!';
  } else if (completionPercent >= 70) {
    probabilityText = 'Professional Match Probability';
    probabilityColor = 'text-purple-400';
    probabilityBg = 'bg-purple-500/5 border-purple-500/20';
    probabilityBadge = 'bg-purple-500 text-white';
    probabilityDesc = 'Excellent! Your profile meets professional marketplace guidelines. You have an estimated 75% booking probability.';
  } else if (completionPercent >= 40) {
    probabilityText = 'Emerging Model Match';
    probabilityColor = 'text-orange-400';
    probabilityBg = 'bg-orange-500/5 border-orange-500/20';
    probabilityBadge = 'bg-orange-500 text-black';
    probabilityDesc = 'Almost there! Add a few more portfolio items to boost your booking score to Professional and increase visibility.';
  }

  const handleScrollToTarget = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add visual glow highlight
      el.classList.add('ring-2', 'ring-pink-500', 'border-pink-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-pink-500', 'border-pink-500');
      }, 2000);
    }
  };

  return (
    <div id="model-agent-dashboard" className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-pink-500">
            <Briefcase className="h-5 w-5" />
            <span className="font-mono text-xs font-black uppercase tracking-wider">Talent Management & Agent Portal</span>
          </div>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent mt-1">
            Registered Model Dashboard
          </h2>
        </div>

        {/* Demo Switcher for easy profile switching and presentation */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-2xl w-full md:w-auto shadow-md">
          <div className="text-left shrink-0">
            <p className="text-[9px] text-[#D4AF37] font-mono uppercase font-black tracking-wider">Acting Role Tester</p>
            <p className="text-xs text-zinc-400 font-bold">Switch Profile:</p>
          </div>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="bg-black/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-pink-500 cursor-pointer min-w-[160px] max-w-[220px]"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {(m.userId === 'u_registered_tester' || (currentUser && m.userId === currentUser.id)) ? '⭐ (Your Reg)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Overview Card with Fast Stats */}
      <div className="bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-white/10 rounded-3xl p-6 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-pink-500/10 blur-3xl rounded-full" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
          <div className="flex gap-4 items-center">
            <div className="relative h-20 w-20 rounded-2xl border-2 border-[#D4AF37] overflow-hidden shadow-xl shrink-0">
              <img 
                src={activeModel.portfolio[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600'} 
                alt={activeModel.name} 
                className="h-full w-full object-cover"
              />
              {activeModel.selfieVerified && (
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow border border-black">
                  <ShieldCheck className="h-3 w-3 fill-current" />
                </span>
              )}
            </div>
            
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-white">{activeModel.name}</h3>
                <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  activeModel.archived 
                    ? 'bg-zinc-950 text-zinc-400 border-zinc-800' 
                    : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20'
                }`}>
                  {activeModel.archived ? '● ARCHIVED / HIDDEN' : '● ACTIVE / PUBLIC'}
                </span>

                {/* Application Registry Status Badge */}
                {activeModel.approved ? (
                  <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    APPROVED
                  </span>
                ) : activeModel.rejected ? (
                  <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1.5 shadow-sm shadow-red-500/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    REJECTED
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30 flex items-center gap-1.5 shadow-sm shadow-amber-500/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    PENDING VERIFICATION
                  </span>
                )}
              </div>
              <p className="text-xs text-[#D4AF37] font-mono mt-0.5">{activeModel.category} • Based in {activeModel.city}</p>
              
              <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                  <strong className="text-white">{activeModel.rating || '4.9'}</strong> ({activeModel.reviewsCount || 0} reviews)
                </span>
                <span>•</span>
                <span>Age: <strong>{activeModel.age}</strong></span>
                <span>•</span>
                <span>Height: <strong>{activeModel.height}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Visibility Switcher Card */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left lg:max-w-xs w-full">
            <h4 className="text-[10px] uppercase font-mono font-black text-zinc-400 tracking-wider">Profile Visibility Control</h4>
            <p className="text-[11px] text-zinc-400 mt-1 mb-3">
              {activeModel.archived 
                ? "Your profile is archived. Clients cannot find you in searches or book new campaigns." 
                : "Your profile is active and public! Clients can send booking requests and chat."}
            </p>
            <button
              onClick={handleToggleVisibility}
              className={`w-full py-2 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeModel.archived 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg hover:brightness-110' 
                  : 'bg-[#EA3838]/10 text-[#EA3838] border border-[#EA3838]/30 hover:bg-[#EA3838]/20'
              }`}
            >
              {activeModel.archived ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Go Live / Activate Listing</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span>Archive & Hide Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion and Optimization Progress Widget */}
      <div className="border border-white/10 bg-gradient-to-r from-[#111] to-[#0a0a0a] rounded-3xl p-6 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/5 blur-2xl rounded-full" />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-b border-white/5 pb-5 mb-5">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-pink-500">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider">Casting Matchmaker Audit Engine</span>
            </div>
            <h3 className="font-sans text-xl font-black text-white">Profile Completion Checklist</h3>
            <p className="text-zinc-400 text-xs max-w-xl">
              Complete these professional directory fields to boost search discovery index placement and gain up to <strong className="text-white">₹50,000+ day-rate</strong> luxury shoot contracts.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <div className="text-center">
              <span className="block text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Your Audit Score</span>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{completionPercent}%</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-left max-w-xs">
              <span className={`text-xs font-black uppercase block ${probabilityColor}`}>
                {probabilityText}
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                {probabilityDesc}
              </p>
            </div>
          </div>
        </div>

        {/* The dynamic progress bar */}
        <div className="space-y-1.5 mb-6 text-left">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-zinc-500">Basic Draft Profile (10%)</span>
            <span className="text-pink-500">Professional (70%)</span>
            <span className="text-[#D4AF37]">Elite Tier (100%)</span>
          </div>
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${completionPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/15 animate-pulse" />
            </div>
            {/* Guide markers */}
            <div className="absolute left-[70%] top-0 h-full w-0.5 bg-black/60" title="Professional Standard" />
            <div className="absolute left-[90%] top-0 h-full w-0.5 bg-black/60" title="Elite Standard" />
          </div>
        </div>

        {/* List of items / suggestions */}
        <h4 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-wider mb-3 text-left">Audit Recommendations & Suggestions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {suggestions.map((item) => (
            <div 
              key={item.id} 
              className={`p-3 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                item.completed 
                  ? 'bg-emerald-950/10 border-emerald-500/20 text-zinc-300' 
                  : 'bg-white/2 border-white/5 hover:border-white/10 text-zinc-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black ${item.completed ? 'text-emerald-400' : 'text-zinc-200'}`}>
                    {item.label}
                  </span>
                  {item.completed ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase">
                      +{item.points}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </div>

              {!item.completed && (
                <div className="pt-3 border-t border-white/5 mt-3 flex justify-end">
                  <button
                    onClick={() => handleScrollToTarget(item.targetId)}
                    className="text-[10px] font-mono font-black text-pink-500 hover:text-pink-400 flex items-center gap-1 transition uppercase tracking-wider"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Finance & Booking Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Earnings Card */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/5 blur-xl group-hover:bg-pink-500/10 transition" />
          <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-3 text-white">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">My Total Revenue</span>
            <strong className="text-3xl font-black text-white tracking-tight">₹{totalEarnings.toLocaleString('en-IN')}</strong>
            <span className="block text-[9px] text-emerald-400 mt-1.5 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> ₹{completedEarnings.toLocaleString('en-IN')} paid in account
            </span>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="rounded-xl bg-white/5 p-3 text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Pending Bookings GMV</span>
            <strong className="text-3xl font-black text-white tracking-tight">₹{pendingEarnings.toLocaleString('en-IN')}</strong>
            <span className="block text-[9px] text-zinc-500 mt-1.5">{pendingBookings.length} requests in queue</span>
          </div>
        </div>

        {/* Successful Campaigns */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="rounded-xl bg-white/5 p-3 text-pink-500">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Casting Bookings</span>
            <strong className="text-3xl font-black text-white tracking-tight">{modelBookings.length}</strong>
            <span className="block text-[9px] text-zinc-500 mt-1.5">{completedBookings.length} shoots finalized successfully</span>
          </div>
        </div>

        {/* Market Rating */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-3 text-black">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Market Rating</span>
            <strong className="text-3xl font-black text-white tracking-tight">{activeModel.rating || '4.9'}</strong>
            <span className="block text-[9px] text-[#D4AF37] font-semibold mt-1.5">Based on client review feedback</span>
          </div>
        </div>

      </div>

      {/* Performance Analytics & Platform Insights Section */}
      <div className="mb-10 text-left">
        <div className="flex items-center space-x-2 text-pink-500 mb-4 border-b border-white/5 pb-2">
          <Activity className="h-4 w-4" />
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-wider font-mono">Performance Analytics & Platform Insights</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Views Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition" />
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Eye className="h-6 w-6" />
            </div>
            <div className="text-left flex-1">
              <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Profile Views</span>
              <strong className="text-3xl font-black text-white tracking-tight">
                {profileViews.toLocaleString()}
              </strong>
              <div className="flex items-center gap-1 mt-1.5 text-[9px] text-zinc-500">
                <span className="text-emerald-400 font-bold font-mono">↑ 12.4%</span>
                <span>vs previous 30 days</span>
              </div>
            </div>
          </div>

          {/* Booking Requests Received Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/5 blur-xl group-hover:bg-pink-500/10 transition" />
            <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="text-left flex-1">
              <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Booking Requests Received</span>
              <strong className="text-3xl font-black text-white tracking-tight">
                {modelBookings.length}
              </strong>
              <div className="flex items-center gap-1 mt-1.5 text-[9px] text-zinc-500">
                <span className="text-pink-400 font-bold font-mono">{pendingBookings.length} pending</span>
                <span>requires action</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-2xl flex items-center space-x-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-[#D4AF37]/5 blur-xl group-hover:bg-[#D4AF37]/10 transition" />
            <div className="rounded-xl bg-[#D4AF37]/10 p-3 text-[#D4AF37]">
              <Percent className="h-6 w-6" />
            </div>
            <div className="text-left flex-1">
              <span className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider">Conversion Rate</span>
              <strong className="text-3xl font-black text-white tracking-tight">
                {conversionRate}%
              </strong>
              <div className="flex items-center gap-1 mt-1.5 text-[9px] text-zinc-500">
                <span className="text-emerald-400 font-bold font-mono">High standard</span>
                <span>industry match rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Side: Campaign Request List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-white/5 bg-[#121212] rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-500" />
                <h3 className="font-sans text-lg font-black text-white">Campaign & Shoot Requests</h3>
              </div>
              <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-full font-mono border border-pink-500/20">
                {pendingBookings.length} Pending
              </span>
            </div>

            {modelBookings.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Briefcase className="h-10 w-10 mx-auto text-zinc-700" />
                <p className="text-xs font-bold">No campaign offers yet</p>
                <p className="text-[11px] text-zinc-600 max-w-sm mx-auto">Share your profile link on Instagram! Clients will book secure escrow campaigns here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modelBookings.map((bk) => {
                  const estBudget = bk.priceAmount || activeModel.startingPrice || 15000;
                  return (
                    <div 
                      key={bk.id} 
                      className={`border p-4 rounded-2xl transition duration-200 ${
                        bk.status === 'pending' 
                          ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10' 
                          : bk.status === 'accepted' 
                            ? 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
                            : bk.status === 'completed'
                              ? 'border-emerald-500/20 bg-emerald-950/10'
                              : 'border-white/5 bg-white/2 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                        <div>
                          <span className="text-[9px] font-mono font-extrabold text-[#D4AF37] uppercase tracking-wider block">Campaign Offer</span>
                          <h4 className="text-sm font-black text-white">{bk.projectDetails?.brandName}</h4>
                          <p className="text-[10px] text-zinc-400 font-medium">By {bk.clientName}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            bk.status === 'pending' 
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/20' 
                              : bk.status === 'accepted'
                                ? 'bg-purple-950/80 text-purple-400 border border-purple-500/20 animate-pulse'
                                : bk.status === 'completed'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-900 text-zinc-500'
                          }`}>
                            {bk.status.toUpperCase()}
                          </span>
                          <p className="text-xs font-black text-[#D4AF37] mt-1 font-mono">₹{estBudget.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Detailed project list */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-zinc-400 bg-black/40 p-3 rounded-xl mb-4 font-mono">
                        <div>Campaign: <strong className="text-white">{bk.projectDetails?.campaignType || "Catalog Shoot"}</strong></div>
                        <div>Date: <strong className="text-white">{bk.projectDetails?.date}</strong></div>
                        <div>Location: <strong className="text-white">{bk.projectDetails?.location}</strong></div>
                        <div>Duration: <strong className="text-white">{bk.projectDetails?.duration}</strong></div>
                        {bk.projectDetails?.notes && (
                          <div className="col-span-2 pt-1 border-t border-white/5 mt-1 text-zinc-500 font-sans italic text-[10px]">
                            "{bk.projectDetails.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons matching current status */}
                      {bk.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateBookingStatus(bk.id, 'accepted')}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Accept Campaign
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(bk.id, 'rejected')}
                            className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-red-400 text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition border border-white/10"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </button>
                        </div>
                      )}

                      {bk.status === 'accepted' && (
                        <div className="space-y-3 pt-2">
                          {/* Main Campaign Completion Button */}
                          <button
                            onClick={() => onUpdateBookingStatus(bk.id, 'completed')}
                            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition hover:shadow-md hover:brightness-105 active:scale-[0.98]"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Complete Campaign & Release Funds
                          </button>

                          {/* PDF Summary & Sharing Area */}
                          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black tracking-wider text-zinc-400 uppercase font-mono flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-[#D4AF37]" /> Contract & Records
                              </span>
                              {bk.pdfSummaryUrl ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono">
                                  <Check className="h-2.5 w-2.5" /> SAVED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-amber-950/40 border border-amber-500/20 text-amber-400 font-mono animate-pulse">
                                  PENDING GEN
                                </span>
                              )}
                            </div>

                            {!bk.pdfSummaryUrl ? (
                              <div className="space-y-2">
                                <p className="text-[10px] text-zinc-400 leading-normal">
                                  Generate a secure, official PDF summary of this accepted booking containing project specifications, pricing, and escrow verification to store on the backend.
                                </p>
                                <button
                                  onClick={() => handleGenerateAndSavePdf(bk)}
                                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                                >
                                  <Sparkles className="h-3 w-3 text-[#D4AF37]" /> Generate & Save PDF Summary
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Official PDF contract summary is compiled, validated, and safely stored in backend node. You can now download or share this with the client.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleDownloadSavedPdf(bk)}
                                    className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition"
                                  >
                                    <Download className="h-3 w-3 text-purple-400" /> Download PDF
                                  </button>
                                  <button
                                    onClick={() => handleToggleShareWithClient(bk)}
                                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                                      bk.isSharedWithClient 
                                        ? 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-transparent'
                                    }`}
                                  >
                                    {bk.isSharedWithClient ? (
                                      <>
                                        <Globe className="h-3 w-3 text-emerald-400" /> Shared (Hide)
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 text-zinc-400" /> Share with Client
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="pt-1.5 flex items-center justify-between border-t border-white/5">
                                  <span className="text-[8px] text-zinc-500 font-mono">
                                    Generated: {bk.pdfGeneratedAt ? new Date(bk.pdfGeneratedAt).toLocaleDateString() : 'Recent'}
                                  </span>
                                  <button
                                    onClick={() => handleGenerateAndSavePdf(bk)}
                                    className="text-[9px] text-zinc-400 hover:text-white font-medium flex items-center gap-0.5 cursor-pointer"
                                  >
                                    Re-Generate PDF
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {bk.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/20 py-1.5 px-2 rounded-lg border border-emerald-500/10">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Payout successfully cleared and transferred.</span>
                          </div>
                          <button
                            onClick={() => handleDownloadInvoice(bk)}
                            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition border border-white/10"
                          >
                            <Download className="h-3.5 w-3.5 text-pink-500" />
                            <span>Download Invoice Statement</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Earnings ledger/transactions list */}
          <div className="border border-white/5 bg-[#121212] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="font-sans text-md font-extrabold text-white">Escrow Payment History</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Secured by Razorpay India</span>
            </div>
 
            {completedBookings.length === 0 ? (
              <p className="text-[11px] text-zinc-500 py-4 text-center">No payouts have been cleared yet. Accept and complete campaigns to start earning.</p>
            ) : (
              <div className="space-y-2.5">
                {completedBookings.map((bk) => {
                  const amt = bk.priceAmount || activeModel.startingPrice || 15000;
                  return (
                    <div key={bk.id} className="flex justify-between items-center p-3 rounded-xl bg-white/2 border border-white/5">
                      <div className="text-left">
                        <span className="text-[9px] font-mono text-zinc-500 block">ID: PAY_ESC_{bk.id}</span>
                        <h4 className="text-xs font-black text-white">{bk.projectDetails?.brandName} Shoot</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-emerald-400">Payout Released</span>
                          <span className="text-zinc-600 font-mono text-[9px]">•</span>
                          <button
                            onClick={() => handleDownloadInvoice(bk)}
                            className="text-[10px] font-mono font-bold text-pink-500 hover:text-pink-400 flex items-center gap-0.5 transition cursor-pointer"
                            title="Download Invoice PDF"
                          >
                            <Download className="h-3 w-3" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#D4AF37] font-mono">+₹{amt.toLocaleString('en-IN')}</span>
                        <span className="block text-[9px] text-zinc-500 mt-0.5">{bk.projectDetails?.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Profile Details & Physical Stats form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-white/5 bg-[#121212] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
              <Settings className="h-5 w-5 text-pink-500" />
              <h3 className="font-sans text-lg font-black text-white">Casting Details & Stats</h3>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              
              <div>
                <label className="block text-[10px] uppercase font-mono font-black text-zinc-400 tracking-wider mb-1.5">Model Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-black text-zinc-400 tracking-wider mb-1.5">Base City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono font-black text-zinc-400 tracking-wider mb-1.5">Starting Day Rate (INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div id="input-biography">
                <label className="block text-[10px] uppercase font-mono font-black text-zinc-400 tracking-wider mb-1.5">Casting Biography</label>
                <textarea
                  rows={4}
                  required
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-pink-500 leading-normal"
                />
              </div>

              {/* Physical measurements */}
              <div id="input-measurements">
                <span className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider mb-3">Comp Card Measurements</span>
                <div className="grid grid-cols-3 gap-3 bg-black/20 p-3.5 rounded-2xl border border-white/5">
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 text-center">Bust</label>
                    <input
                      type="text"
                      value={bust}
                      onChange={(e) => setBust(e.target.value)}
                      className="w-full text-center rounded-lg border border-white/10 bg-black px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 text-center">Waist</label>
                    <input
                      type="text"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full text-center rounded-lg border border-white/10 bg-black px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 text-center">Hips</label>
                    <input
                      type="text"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      className="w-full text-center rounded-lg border border-white/10 bg-black px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Contact Info */}
              <div id="input-contact" className="pt-4 border-t border-white/5 space-y-3">
                <span className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider">Booking Contact Info</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="model@universe.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Connections */}
              <div id="input-socials" className="pt-4 border-t border-white/5 space-y-3">
                <span className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider">Social Media Handles</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 flex items-center gap-1">
                      <Instagram className="h-3 w-3 text-pink-500" /> Instagram Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@instagram_handle"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 flex items-center gap-1">
                        <Twitter className="h-3 w-3 text-blue-400" /> Twitter Handle
                      </label>
                      <input
                        type="text"
                        placeholder="@twitter_handle"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400 mb-1 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-[#D4AF37]" /> Portfolio Website
                      </label>
                      <input
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={socialPortfolio}
                        onChange={(e) => setSocialPortfolio(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Introduction Video */}
              <div id="input-videourl" className="pt-4 border-t border-white/5 space-y-3">
                <label className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider">Introduction Video URL</label>
                <div className="relative">
                  <Youtube className="absolute left-3.5 top-3.5 h-4 w-4 text-rose-500" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight">Paste a link to your runway walkthrough reel or talking introduction video.</p>
              </div>

              {/* Selfie Identity Verification */}
              <div id="input-verification" className="pt-4 border-t border-white/5 space-y-3">
                <span className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider">Selfie Identity Verification</span>
                <div className={`p-4 rounded-2xl border ${
                  activeModel.selfieVerified 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}>
                  <div className="flex gap-3 items-center">
                    <div className={`p-2 rounded-xl ${activeModel.selfieVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-white">
                        {activeModel.selfieVerified ? 'Casted & Selfie Verified' : 'Unverified Identity Status'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        {activeModel.selfieVerified 
                          ? 'Your selfie and government ID have been successfully matched. Golden verified shield is active.' 
                          : 'Verify your ID and face landmarks to protect models against deepfakes and gain trust.'}
                      </p>
                    </div>
                  </div>
                  
                  {!activeModel.selfieVerified && (
                    <button
                      type="button"
                      onClick={async () => {
                        const verifiedModel = { ...activeModel, selfieVerified: true };
                        await dbService.saveModel(verifiedModel);
                        onUpdateModel(verifiedModel);
                        triggerToast(
                          'Selfie Verified!',
                          'Congratulations! Your live facial features match your government credentials.',
                          'success'
                        );
                      }}
                      className="mt-3 w-full py-2 px-4 bg-emerald-500 hover:bg-[#34D399]/90 text-black text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Complete Instant AI Selfie Verification</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Portfolio Image Upload Slots */}
              <div id="input-portfolio" className="pt-4 border-t border-white/5 space-y-3">
                <span className="block text-[10px] uppercase font-mono font-black text-pink-500 tracking-wider">Portfolio Polaroids & Photos</span>
                <p className="text-[10px] text-zinc-400">Provide direct image links or upload compressed polaroids directly from your device.</p>
                
                <div className="space-y-4">
                  {/* Image 1 */}
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400">Slot 1: Primary Close-up</label>
                      {portfolio1 && <span className="text-[9px] text-emerald-400 font-bold uppercase">● Configured</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {portfolio1 ? (
                        <div className="relative h-12 w-12 rounded-lg border border-white/10 overflow-hidden shrink-0">
                          <img src={portfolio1} alt="Slot 1" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPortfolio1('')}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 hover:text-red-300 opacity-0 hover:opacity-100 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-zinc-500 shrink-0">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Or paste direct image URL..."
                          value={portfolio1}
                          onChange={(e) => setPortfolio1(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-pink-500"
                        />
                        <label className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition border border-white/10 text-white">
                          <UploadCloud className="h-3 w-3" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port1', setPortfolio1);
                              }
                            }}
                          />
                        </label>
                        {isCompressing['port1'] && <span className="text-[9px] text-pink-500 ml-2 animate-pulse">Compressing...</span>}
                      </div>
                    </div>
                  </div>

                  {/* Image 2 */}
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400">Slot 2: Full Body Shot</label>
                      {portfolio2 && <span className="text-[9px] text-emerald-400 font-bold uppercase">● Configured</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {portfolio2 ? (
                        <div className="relative h-12 w-12 rounded-lg border border-white/10 overflow-hidden shrink-0">
                          <img src={portfolio2} alt="Slot 2" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPortfolio2('')}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 hover:text-red-300 opacity-0 hover:opacity-100 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-zinc-500 shrink-0">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Or paste direct image URL..."
                          value={portfolio2}
                          onChange={(e) => setPortfolio2(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-pink-500"
                        />
                        <label className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition border border-white/10 text-white">
                          <UploadCloud className="h-3 w-3" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port2', setPortfolio2);
                              }
                            }}
                          />
                        </label>
                        {isCompressing['port2'] && <span className="text-[9px] text-pink-500 ml-2 animate-pulse">Compressing...</span>}
                      </div>
                    </div>
                  </div>

                  {/* Image 3 */}
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase font-mono font-bold text-zinc-400">Slot 3: Side Profile</label>
                      {portfolio3 && <span className="text-[9px] text-emerald-400 font-bold uppercase">● Configured</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {portfolio3 ? (
                        <div className="relative h-12 w-12 rounded-lg border border-white/10 overflow-hidden shrink-0">
                          <img src={portfolio3} alt="Slot 3" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPortfolio3('')}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 hover:text-red-300 opacity-0 hover:opacity-100 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-zinc-500 shrink-0">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Or paste direct image URL..."
                          value={portfolio3}
                          onChange={(e) => setPortfolio3(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-pink-500"
                        />
                        <label className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition border border-white/10 text-white">
                          <UploadCloud className="h-3 w-3" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port3', setPortfolio3);
                              }
                            }}
                          />
                        </label>
                        {isCompressing['port3'] && <span className="text-[9px] text-pink-500 ml-2 animate-pulse">Compressing...</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 mt-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-xs font-black shadow-lg hover:brightness-110 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Saving Updates...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Portfolio Details</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Dynamic Portfolio Image Crop & Rotate Editor Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden text-center text-white">
            {/* Background glowing effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Modal Header */}
            <div className="mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-center gap-2">
                <Sliders className="h-4 w-4 text-pink-500" />
                <span>Crop & Rotate Image</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold mt-1">
                Customize framing and orientation for the directory card's 3:4 aspect ratio.
              </p>
            </div>

            {/* Premium 3:4 Crop Frame Container */}
            <div className="relative aspect-[3/4] max-h-[260px] md:max-h-[300px] w-auto mx-auto rounded-2xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center shadow-inner mb-5">
              {/* Reference Gridlines overlay to help user frame the photo */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 border border-white/10">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div className="" />
              </div>

              {/* The active transforming image */}
              <img
                src={editingImage.src}
                alt="Framing preview"
                className="absolute w-full h-full object-cover select-none pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                }}
              />
              
              {/* Corner framing brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-pink-500 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-pink-500 pointer-events-none z-10" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-pink-500 pointer-events-none z-10" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-pink-500 pointer-events-none z-10" />
            </div>

            {/* Slider & Orientation Controls */}
            <div className="space-y-4 text-left mb-6">
              {/* Rotation buttons */}
              <div>
                <label className="block text-[10px] font-black tracking-wider uppercase text-zinc-400 mb-1.5 font-mono">
                  Orientation: <span className="text-white font-bold">{rotation}°</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev - 90) % 360)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-extrabold text-white flex items-center justify-center gap-1.5 transition active:scale-97 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3 text-pink-500" />
                    <span>Rotate CCW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-extrabold text-white flex items-center justify-center gap-1.5 transition active:scale-97 cursor-pointer"
                  >
                    <RotateCw className="h-3 w-3 text-pink-500" />
                    <span>Rotate CW</span>
                  </button>
                </div>
              </div>

              {/* Zoom Slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-black tracking-wider uppercase text-zinc-400 font-mono">
                  <span>Zoom Scale</span>
                  <span className="text-white font-bold">{zoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-pink-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <ZoomIn className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                </div>
              </div>

              {/* Shift Horizontal Slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-black tracking-wider uppercase text-zinc-400 font-mono">
                  <span>Pan Horizontal (X-Axis)</span>
                  <span className="text-white font-bold">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-pink-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Shift Vertical Slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-black tracking-wider uppercase text-zinc-400 font-mono">
                  <span>Pan Vertical (Y-Axis)</span>
                  <span className="text-white font-bold">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-pink-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="flex-1 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-black border border-white/5 transition active:scale-97 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCropAndRotate}
                disabled={isApplyingCrop}
                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-97 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplyingCrop ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Save & Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
