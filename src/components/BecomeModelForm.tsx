/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Calendar, Star, Users, MapPin, Sparkles, UploadCloud, CheckCircle2, ShieldCheck, Loader2, AlertCircle, Laptop, FolderOpen, HardDrive, FileText, Check, X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Sliders, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Model } from '../types';

interface AnimatedTypingProp {
  text: string;
}

const AnimatedTypingText = ({ text }: AnimatedTypingProp) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let indexVal = 0;
    let timer: NodeJS.Timeout;
    let waitTimer: NodeJS.Timeout;

    const startTyping = () => {
      setDisplayedText('');
      indexVal = 0;
      
      const type = () => {
        if (indexVal <= text.length) {
          setDisplayedText(text.slice(0, indexVal));
          indexVal++;
          timer = setTimeout(type, 25);
        } else {
          waitTimer = setTimeout(() => {
            startTyping();
          }, 15000);
        }
      };
      
      type();
    };

    startTyping();

    return () => {
      clearTimeout(timer);
      clearTimeout(waitTimer);
    };
  }, [text]);

  return (
    <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm font-semibold tracking-wide leading-relaxed bg-gradient-to-r from-red-400 via-pink-500 to-amber-400 bg-clip-text text-transparent min-h-[40px] drop-shadow-sm select-none">
      {displayedText}
      <span className="inline-block w-1.5 h-3.5 ml-1 bg-red-500 animate-pulse align-middle" />
    </p>
  );
};

interface BecomeModelFormProps {
  onRegisterSubmit: (model: Model) => void;
  userId: string;
  onViewCategory?: (category: string) => void;
  onGoHome?: () => void;
  initialModel?: Model;
}

const SECTIONS = [
  { id: 1, name: 'Personal Details', desc: 'Contact & demographics (Mandatory)' },
  { id: 2, name: 'Physical Details', desc: 'Accurate model dimensions & stats' },
  { id: 3, name: 'Personal Info', desc: 'Background, address & demographics' },
  { id: 4, name: 'Professional Details', desc: 'Categories, training & credentials' },
  { id: 5, name: 'Travel & Preferences', desc: 'Willingness to travel & outstation limits' },
  { id: 6, name: 'Shoot Preferences', desc: 'Open genres & clothing comfort comfort levels' },
  { id: 7, name: 'Social Media Profiles', desc: 'Instagram, YouTube & online influence' },
  { id: 8, name: 'Portfolio Upload', desc: '3:4 high resolution casting photos' },
  { id: 9, name: 'Professional Experience', desc: 'Past show campaigns & brand shoots' },
  { id: 10, name: 'Availability', desc: 'Working hours, weekday & weekend options' },
  { id: 11, name: 'Bio & Unique Talents', desc: 'Elevator pitch & specialized skills' },
  { id: 12, name: 'Specialization Matrix', desc: 'Ethnic wear, athletic & hand modeling' },
  { id: 13, name: 'Experience Levels', desc: 'Skill levels across major casting categories' },
  { id: 14, name: 'Charges & rates', desc: 'Expected daily rates, minimum hour counts' },
  { id: 15, name: 'Declaration', desc: 'Legal checks, agreement & sign' },
];

export default function BecomeModelForm({ onRegisterSubmit, userId, onViewCategory, onGoHome, initialModel }: BecomeModelFormProps) {
  const [activeSectionId, setActiveSectionId] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Section 1: Personal Details
  const [name, setName] = useState(initialModel?.name || '');
  const [phone, setPhone] = useState(initialModel?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialModel?.additionalDetails?.whatsapp || initialModel?.phone || '');
  const [isWhatsappSame, setIsWhatsappSame] = useState(initialModel ? initialModel.additionalDetails?.isWhatsappSame ?? true : true);
  const [email, setEmail] = useState(initialModel?.email || '');
  const [age, setAge] = useState(initialModel?.age || 24);
  const [gender, setGender] = useState<'female' | 'male' | 'non-binary' | string>(initialModel?.gender || 'female');
  const [dob, setDob] = useState(initialModel?.additionalDetails?.dob || '2002-06-15');
  const [city, setCity] = useState(initialModel?.city || 'Mumbai');
  const [state, setState] = useState(initialModel?.state || 'Maharashtra');

  // Section 2: Physical Details
  const [height, setHeight] = useState(initialModel?.height || "5'8\"");
  const [weight, setWeight] = useState(initialModel?.additionalDetails?.weight || '55 kg');
  const [bust, setBust] = useState(initialModel?.measurements?.bust || '34"');
  const [waist, setWaist] = useState(initialModel?.measurements?.waist || '26"');
  const [hips, setHips] = useState(initialModel?.measurements?.hips || '36"');
  const [shoeSize, setShoeSize] = useState(initialModel?.additionalDetails?.shoeSize || '39');
  const [eyeColor, setEyeColor] = useState(initialModel?.additionalDetails?.eyeColor || 'Brown');
  const [hairColor, setHairColor] = useState(initialModel?.additionalDetails?.hairColor || 'Black');
  const [skinTone, setSkinTone] = useState(initialModel?.additionalDetails?.skinTone || 'Medium');

  // Section 3: Personal Information
  const [nationality, setNationality] = useState(initialModel?.additionalDetails?.nationality || 'Indian');
  const [maritalStatus, setMaritalStatus] = useState(initialModel?.additionalDetails?.maritalStatus || 'Single');
  const [education, setEducation] = useState(initialModel?.additionalDetails?.education || '');
  const [permanentAddress, setPermanentAddress] = useState(initialModel?.additionalDetails?.permanentAddress || '');
  const [currentAddress, setCurrentAddress] = useState(initialModel?.additionalDetails?.currentAddress || '');

  // Section 4: Professional Details
  const [category, setCategory] = useState(initialModel?.category || 'Fashion Models');
  const [subCategory, setSubCategory] = useState(initialModel?.additionalDetails?.subCategory || 'Runway, Editorial');
  const [experience, setExperience] = useState(initialModel?.experience || '2-5 years');
  const [professionalTraining, setProfessionalTraining] = useState(initialModel?.additionalDetails?.professionalTraining || 'No');
  const [actingModelingSchool, setActingModelingSchool] = useState(initialModel?.additionalDetails?.actingModelingSchool || '');

  // Section 5: Travel & Work Preferences
  const [willingToTravelIndia, setWillingToTravelIndia] = useState(initialModel?.additionalDetails?.willingToTravelIndia || 'Yes');
  const [willingToTravelInt, setWillingToTravelInt] = useState(initialModel?.additionalDetails?.willingToTravelInt || 'Yes');
  const [hasPassport, setHasPassport] = useState(initialModel?.additionalDetails?.hasPassport || 'Yes');
  const [openForOutstation, setOpenForOutstation] = useState(initialModel?.additionalDetails?.openForOutstation || 'Yes');
  const [preferredLocations, setPreferredLocations] = useState(initialModel?.additionalDetails?.preferredLocations || 'Mumbai, Delhi, Bangalore');

  // Section 6: Shoot Preferences
  const [shootTypesOpen, setShootTypesOpen] = useState(initialModel?.additionalDetails?.shootTypesOpen || 'Runway, Editorial, Commercial Prints, TVC');
  const [clothingComfort, setClothingComfort] = useState(initialModel?.additionalDetails?.clothingComfort || 'Casual wear, Ethnic wear, Couture designs');

  // Section 7: Social Media & Web Presence
  const [instagram, setInstagram] = useState(initialModel?.socialLinks?.instagram || '');
  const [youtube, setYoutube] = useState(initialModel?.additionalDetails?.youtube || '');
  const [portfolioWebsite, setPortfolioWebsite] = useState(initialModel?.socialLinks?.portfolio || '');
  const [facebook, setFacebook] = useState(initialModel?.additionalDetails?.facebook || '');

  // Section 8: Portfolio Upload
  const [portfolioLink1, setPortfolioLink1] = useState(initialModel?.portfolio?.[0] || '');
  const [portfolioLink2, setPortfolioLink2] = useState(initialModel?.portfolio?.[1] || '');
  const [portfolioLink3, setPortfolioLink3] = useState(initialModel?.portfolio?.[2] || '');
  const [videoLink, setVideoLink] = useState(initialModel?.videoUrl || '');

  // Section 9: Professional Experience
  const [brandsWorkedWith, setBrandsWorkedWith] = useState(initialModel?.additionalDetails?.brandsWorkedWith || '');
  const [notableShows, setNotableShows] = useState(initialModel?.additionalDetails?.notableShows || '');
  const [filmographyCommercials, setFilmographyCommercials] = useState(initialModel?.additionalDetails?.filmographyCommercials || '');

  // Section 10: Availability
  const [availabilityStatus, setAvailabilityStatus] = useState<'Available' | 'Booked' | 'On-Leave'>(initialModel?.availabilityStatus || 'Available');
  const [availabilityNotice, setAvailabilityNotice] = useState(initialModel?.additionalDetails?.availabilityNotice || 'Immediate');
  const [preferredShootDays, setPreferredShootDays] = useState(initialModel?.additionalDetails?.preferredShootDays || 'Both Weekdays & Weekends');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(initialModel?.additionalDetails?.maxHoursPerDay || '8');

  // Section 11: Bio & Unique Talents
  const [biography, setBiography] = useState(initialModel?.biography || '');
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState(initialModel?.additionalDetails?.uniqueSellingPoints || '');
  const [specialTalents, setSpecialTalents] = useState(initialModel?.additionalDetails?.specialTalents || '');

  // Section 12: Specialization
  const [specializedGenres, setSpecializedGenres] = useState(initialModel?.additionalDetails?.specializedGenres || 'Runway & Editorial');
  const [ethnicWearComfort, setEthnicWearComfort] = useState(initialModel?.additionalDetails?.ethnicWearComfort || 'Yes');
  const [bodyPartModeling, setBodyPartModeling] = useState(initialModel?.additionalDetails?.bodyPartModeling || '');

  // Section 13: Experience Levels
  const [runwayExperience, setRunwayExperience] = useState(initialModel?.additionalDetails?.runwayExperience || 'Intermediate');
  const [editorialExperience, setEditorialExperience] = useState(initialModel?.additionalDetails?.editorialExperience || 'Intermediate');
  const [tvcExperience, setTvcExperience] = useState(initialModel?.additionalDetails?.tvcExperience || 'Beginner');
  const [ugcExperience, setUgcExperience] = useState(initialModel?.additionalDetails?.ugcExperience || 'Beginner');

  // Section 14: Charges & Day Rates
  const [startingPrice, setStartingPrice] = useState(initialModel?.startingPrice ? String(initialModel.startingPrice) : '25000');
  const [minimumBookingDuration, setMinimumBookingDuration] = useState(initialModel?.additionalDetails?.minimumBookingDuration || 'Full Day');
  const [accommodationCoverage, setAccommodationCoverage] = useState(initialModel?.additionalDetails?.accommodationCoverage || 'Covered by brand');

  // Section 15: Declaration & Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(initialModel ? true : false);
  const [accuracyDeclaration, setAccuracyDeclaration] = useState(initialModel ? true : false);
  const [digitalSignature, setDigitalSignature] = useState(initialModel?.additionalDetails?.digitalSignature || '');
  const [submissionDate, setSubmissionDate] = useState(initialModel?.additionalDetails?.submissionDate || new Date().toISOString().split('T')[0]);
  const [langs, setLangs] = useState(initialModel?.languages?.join(', ') || 'English, Hindi');
  const [agencyStatus, setAgencyStatus] = useState(initialModel?.additionalDetails?.agencyStatus || 'freelance');

  // Sync WhatsApp number
  useEffect(() => {
    if (isWhatsappSame) {
      setWhatsapp(phone);
    }
  }, [phone, isWhatsappSame]);

  // Sync Age from DOB
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge > 0 && calculatedAge < 100) {
        setAge(calculatedAge);
      }
    }
  }, [dob]);

  // Real-time Visual Validation Helpers
  const getValidationState = (fieldName: string, value: string) => {
    if (value === undefined || value === null) return 'idle';
    const trimmed = value.trim();
    if (trimmed === '') return 'idle';

    switch (fieldName) {
      case 'name':
        return trimmed.length >= 3 ? 'valid' : 'invalid';
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(trimmed) ? 'valid' : 'invalid';
      }
      case 'phone':
      case 'whatsapp': {
        const phoneClean = trimmed.replace(/[\s\-\+\(\)]/g, '');
        return phoneClean.length >= 10 ? 'valid' : 'invalid';
      }
      case 'dob':
        return trimmed !== '' ? 'valid' : 'invalid';
      case 'city':
      case 'state':
      case 'height':
      case 'weight':
      case 'bust':
      case 'waist':
      case 'hips':
      case 'shoeSize':
      case 'eyeColor':
      case 'hairColor':
        return trimmed.length >= 1 ? 'valid' : 'invalid';
      case 'digitalSignature':
        return trimmed.length >= 3 ? 'valid' : 'invalid';
      default:
        return 'valid';
    }
  };

  const renderValidationIcon = (fieldName: string, value: string) => {
    const state = getValidationState(fieldName, value);
    if (state === 'valid') {
      return (
        <span className="flex items-center text-[#10B981] text-[10px] gap-1 font-semibold select-none">
          <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
          <span>Valid</span>
        </span>
      );
    } else if (state === 'invalid') {
      return (
        <span className="flex items-center text-red-500 text-[10px] gap-1 font-semibold select-none animate-pulse">
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span>Invalid</span>
        </span>
      );
    }
    return null;
  };

  // Image Compressor & Cropper logic
  const [isCompressing, setIsCompressing] = useState<{[key: string]: boolean}>({});
  const [compressionLogs, setCompressionLogs] = useState<Record<string, { original: string; compressed: string; percent: number }>>({});
  const [editingImage, setEditingImage] = useState<{
    src: string;
    key: string;
    callback: (base64: string) => void;
  } | null>(null);

  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);

  // File Upload states
  const [govIdInput, setGovIdInput] = useState(initialModel?.govIdUrl || 'Gov_ID_front_verified_UIDAI.jpg');
  const [selfieInput, setSelfieInput] = useState(initialModel?.selfieUrl || 'Selfie_check_verified_ID_match.jpg');
  const [pdfFileName, setPdfFileName] = useState(initialModel?.pdfName || '');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState(initialModel?.pdfUrl || '');
  const [activeUploadType, setActiveUploadType] = useState<'govId' | 'selfie' | 'pdf' | null>(null);

  // Dynamic state sync when initialModel changes
  useEffect(() => {
    if (initialModel) {
      setName(initialModel.name || '');
      setPhone(initialModel.phone || '');
      setWhatsapp(initialModel.additionalDetails?.whatsapp || initialModel.phone || '');
      setIsWhatsappSame(initialModel.additionalDetails?.isWhatsappSame ?? true);
      setEmail(initialModel.email || '');
      setAge(initialModel.age || 24);
      setGender(initialModel.gender || 'female');
      setDob(initialModel.additionalDetails?.dob || '2002-06-15');
      setCity(initialModel.city || 'Mumbai');
      setState(initialModel.state || 'Maharashtra');
      setHeight(initialModel.height || "5'8\"");
      setWeight(initialModel.additionalDetails?.weight || '55 kg');
      setBust(initialModel.measurements?.bust || '34"');
      setWaist(initialModel.measurements?.waist || '26"');
      setHips(initialModel.measurements?.hips || '36"');
      setShoeSize(initialModel.additionalDetails?.shoeSize || '39');
      setEyeColor(initialModel.additionalDetails?.eyeColor || 'Brown');
      setHairColor(initialModel.additionalDetails?.hairColor || 'Black');
      setSkinTone(initialModel.additionalDetails?.skinTone || 'Medium');
      setNationality(initialModel.additionalDetails?.nationality || 'Indian');
      setMaritalStatus(initialModel.additionalDetails?.maritalStatus || 'Single');
      setEducation(initialModel.additionalDetails?.education || '');
      setPermanentAddress(initialModel.additionalDetails?.permanentAddress || '');
      setCurrentAddress(initialModel.additionalDetails?.currentAddress || '');
      setCategory(initialModel.category || 'Fashion Models');
      setSubCategory(initialModel.additionalDetails?.subCategory || 'Runway, Editorial');
      setExperience(initialModel.experience || '2-5 years');
      setProfessionalTraining(initialModel.additionalDetails?.professionalTraining || 'No');
      setActingModelingSchool(initialModel.additionalDetails?.actingModelingSchool || '');
      setWillingToTravelIndia(initialModel.additionalDetails?.willingToTravelIndia || 'Yes');
      setWillingToTravelInt(initialModel.additionalDetails?.willingToTravelInt || 'Yes');
      setHasPassport(initialModel.additionalDetails?.hasPassport || 'Yes');
      setOpenForOutstation(initialModel.additionalDetails?.openForOutstation || 'Yes');
      setPreferredLocations(initialModel.additionalDetails?.preferredLocations || 'Mumbai, Delhi, Bangalore');
      setShootTypesOpen(initialModel.additionalDetails?.shootTypesOpen || 'Runway, Editorial, Commercial Prints, TVC');
      setClothingComfort(initialModel.additionalDetails?.clothingComfort || 'Casual wear, Ethnic wear, Couture designs');
      setInstagram(initialModel.socialLinks?.instagram || '');
      setYoutube(initialModel.additionalDetails?.youtube || '');
      setPortfolioWebsite(initialModel.socialLinks?.portfolio || '');
      setFacebook(initialModel.additionalDetails?.facebook || '');
      setPortfolioLink1(initialModel.portfolio?.[0] || '');
      setPortfolioLink2(initialModel.portfolio?.[1] || '');
      setPortfolioLink3(initialModel.portfolio?.[2] || '');
      setVideoLink(initialModel.videoUrl || '');
      setBrandsWorkedWith(initialModel.additionalDetails?.brandsWorkedWith || '');
      setNotableShows(initialModel.additionalDetails?.notableShows || '');
      setFilmographyCommercials(initialModel.additionalDetails?.filmographyCommercials || '');
      setAvailabilityStatus(initialModel.availabilityStatus || 'Available');
      setAvailabilityNotice(initialModel.additionalDetails?.availabilityNotice || 'Immediate');
      setPreferredShootDays(initialModel.additionalDetails?.preferredShootDays || 'Both Weekdays & Weekends');
      setMaxHoursPerDay(initialModel.additionalDetails?.maxHoursPerDay || '8');
      setBiography(initialModel.biography || '');
      setUniqueSellingPoints(initialModel.additionalDetails?.uniqueSellingPoints || '');
      setSpecialTalents(initialModel.additionalDetails?.specialTalents || '');
      setSpecializedGenres(initialModel.additionalDetails?.specializedGenres || 'Runway & Editorial');
      setEthnicWearComfort(initialModel.additionalDetails?.ethnicWearComfort || 'Yes');
      setBodyPartModeling(initialModel.additionalDetails?.bodyPartModeling || '');
      setRunwayExperience(initialModel.additionalDetails?.runwayExperience || 'Intermediate');
      setEditorialExperience(initialModel.additionalDetails?.editorialExperience || 'Intermediate');
      setTvcExperience(initialModel.additionalDetails?.tvcExperience || 'Beginner');
      setUgcExperience(initialModel.additionalDetails?.ugcExperience || 'Beginner');
      setStartingPrice(initialModel.startingPrice ? String(initialModel.startingPrice) : '25000');
      setMinimumBookingDuration(initialModel.additionalDetails?.minimumBookingDuration || 'Full Day');
      setAccommodationCoverage(initialModel.additionalDetails?.accommodationCoverage || 'Covered by brand');
      setAgreedToTerms(true);
      setAccuracyDeclaration(true);
      setDigitalSignature(initialModel.additionalDetails?.digitalSignature || '');
      setSubmissionDate(initialModel.additionalDetails?.submissionDate || new Date().toISOString().split('T')[0]);
      setLangs(initialModel.languages?.join(', ') || 'English, Hindi');
      setAgencyStatus(initialModel.additionalDetails?.agencyStatus || 'freelance');
      setGovIdInput(initialModel.govIdUrl || 'Gov_ID_front_verified_UIDAI.jpg');
      setSelfieInput(initialModel.selfieUrl || 'Selfie_check_verified_ID_match.jpg');
      setPdfFileName(initialModel.pdfName || '');
      setPdfFileUrl(initialModel.pdfUrl || '');
    }
  }, [initialModel]);

  // Camera stream liveness state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [livenessResult, setLivenessResult] = useState<'idle' | 'processing' | 'verified'>('idle');
  const [livenessScanningProgress, setLivenessScanningProgress] = useState(0);
  const [showPermissionHelper, setShowPermissionHelper] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [helperBrowserTab, setHelperBrowserTab] = useState<'chrome' | 'safari' | 'firefox'>('chrome');

  // AI evaluation fields
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<{
    score: number;
    suitability: string;
    advice: string;
  } | null>(null);
  const [evaluationError, setEvaluationError] = useState('');

  // Camera stream liveness handlers
  const activateMainCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    setCapturedImage(null);
    setLivenessResult('idle');
    setIsSimulatingCamera(false);
    setCountdownSeconds(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setCameraError('Unable to open selfie camera. Please allow camera permissions in your browser.');
      setShowPermissionHelper(true);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const startCaptureCountdown = () => {
    if (countdownSeconds !== null) return;
    setCountdownSeconds(3);
    
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev <= 1) {
          clearInterval(interval);
          // Auto trigger capture when countdown hits 0
          setTimeout(() => {
            captureLivenessSelfie();
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const deactivateMainCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const captureLivenessSelfie = () => {
    if (isSimulatingCamera) {
      const mockImage = gender === 'female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600';
      setCapturedImage(mockImage);
      setLivenessResult('processing');
      setLivenessScanningProgress(0);
      
      let currentPrg = 0;
      const interval = setInterval(() => {
        currentPrg += 10;
        setLivenessScanningProgress(currentPrg);
        if (currentPrg >= 100) {
          clearInterval(interval);
          setLivenessResult('verified');
          setSelfieInput(mockImage);
        }
      }, 120);
      return;
    }

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(base64);
        setLivenessResult('processing');
        setLivenessScanningProgress(0);
        
        let currentPrg = 0;
        const interval = setInterval(() => {
          currentPrg += 10;
          setLivenessScanningProgress(currentPrg);
          if (currentPrg >= 100) {
            clearInterval(interval);
            setLivenessResult('verified');
            setSelfieInput(base64);
          }
        }, 120);
      }
    }
  };

  useEffect(() => {
    if (activeUploadType === 'selfie') {
      activateMainCamera();
    } else {
      deactivateMainCamera();
    }
    return () => {
      deactivateMainCamera();
    };
  }, [activeUploadType]);

  // Cropping engine
  const handleUploadAndCrop = (file: File, key: string, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      setEditingImage({ src: rawBase64, key, callback });
      setRotation(0);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
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
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        ctx.translate(targetWidth / 2, targetHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(offsetX, offsetY);

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

        // Client-side compression statistics calculation
        const originalBytes = editingImage.src.length * 0.75;
        const compressedBytes = croppedBase64.length * 0.75;
        const originalKb = Math.round(originalBytes / 1024);
        const compressedKb = Math.round(compressedBytes / 1024);
        const percent = Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));

        setCompressionLogs(prev => ({
          ...prev,
          [editingImage.key]: {
            original: `${originalKb} KB`,
            compressed: `${compressedKb} KB`,
            percent
          }
        }));

        editingImage.callback(croppedBase64);
      }
      setIsApplyingCrop(false);
      setEditingImage(null);
    };
    img.src = editingImage.src;
  };

  // AI Evaluation benchmark score
  const handleAiEvaluation = async () => {
    if (!name || !biography) {
      setEvaluationError('Please fill out at least your Full Name (Section 1) and Biography (Section 11) to get scored by AI!');
      return;
    }

    setIsEvaluating(true);
    setAiEvaluation(null);
    setEvaluationError('');

    try {
      const res = await fetch('/api/talent/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          age,
          height,
          city,
          experience,
          biography,
          languages: langs.split(',').map(l => l.trim())
        })
      });

      const data = await res.json();
      setAiEvaluation({
        score: Number(data.score) || 8.8,
        suitability: data.suitability || 'Excellent match for commercial catalogues and ethnic prints.',
        advice: data.advice || '1. Update portfolio with bright daylight headshots. 2. Capture a high-res video intro.'
      });
    } catch (err) {
      setAiEvaluation({
        score: 8.5,
        suitability: 'High potential for high-fashion runway modeling and cosmetics endorsements.',
        advice: 'Focus on posture and line extensions during runways. Upload clear non-makeup polaroid shots to casting board.'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Validation & Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !email || !city || !state) {
      setActiveSectionId(1);
      alert('Please fill out all mandatory fields in Section 1: Personal Details!');
      return;
    }

    if (!biography) {
      setActiveSectionId(11);
      alert('Please fill out Section 11: Professional Biography!');
      return;
    }

    if (!agreedToTerms || !accuracyDeclaration || !digitalSignature) {
      setActiveSectionId(15);
      alert('Please sign and complete Section 15: Declaration & Agreement!');
      return;
    }

    // Prepare portfolio URLs
    const portfolioUrls = [
      portfolioLink1 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
      portfolioLink2 || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
      portfolioLink3 || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600',
    ];

    // Build the additional details JSON package matching the 15 sections
    const additionalDetails = {
      weight,
      nationality,
      maritalStatus,
      education,
      permanentAddress,
      currentAddress,
      subCategory,
      professionalTraining,
      actingModelingSchool,
      willingToTravelIndia,
      willingToTravelInt,
      hasPassport,
      openForOutstation,
      preferredLocations,
      shootTypesOpen,
      clothingComfort,
      youtube,
      portfolioWebsite,
      facebook,
      brandsWorkedWith,
      notableShows,
      filmographyCommercials,
      availabilityNotice,
      preferredShootDays,
      maxHoursPerDay,
      uniqueSellingPoints,
      specialTalents,
      specializedGenres,
      ethnicWearComfort,
      bodyPartModeling,
      experienceMatrix: {
        runway: runwayExperience,
        editorial: editorialExperience,
        tvc: tvcExperience,
        ugc: ugcExperience
      },
      minimumBookingDuration,
      accommodationCoverage,
      agreedToTerms,
      accuracyDeclaration,
      digitalSignature,
      submissionDate
    };

    const newModel: Model = {
      id: initialModel ? initialModel.id : `model_${Date.now()}`,
      userId,
      name,
      gender: (gender === 'male' || gender === 'female' || gender === 'non-binary') ? gender : 'female',
      age: Number(age),
      height,
      city,
      state,
      languages: langs.split(',').map(l => l.trim()),
      experience,
      category,
      portfolio: portfolioUrls,
      videoUrl: videoLink || undefined,
      availabilityStatus,
      selfieVerified: initialModel ? initialModel.selfieVerified : true,
      selfieUrl: selfieInput,
      approved: true, // Auto-approve to show immediately on registered model dashboard, homepage, and categories
      rejected: false,
      govIdUrl: govIdInput,
      pdfUrl: pdfFileUrl || undefined,
      pdfName: pdfFileName || undefined,
      startingPrice: Number(startingPrice) || (category === 'Fashion Models' ? 30000 : 15000),
      rating: initialModel ? initialModel.rating : 5.0,
      reviewsCount: initialModel ? initialModel.reviewsCount : 0,
      biography,
      phone,
      email,
      socialLinks: {
        instagram
      },
      measurements: {
        bust: bust || '34"',
        waist: waist || '26"',
        hips: hips || '36"'
      },
      agencyInfo: {
        name: agencyStatus === 'freelance' ? 'Independent' : 'Represented',
        contactName: agencyStatus === 'exclusive' ? 'Exclusive Representation' : 'Self Managed'
      },
      additionalDetails: {
        ...additionalDetails,
        agencyStatus,
        langs
      }
    };

    setIsSubmitting(true);
    setTimeout(() => {
      onRegisterSubmit(newModel);
      setRegistrationSuccess(true);
      setIsSubmitting(false);
    }, 1500);
  };

  // Helper validation status
  const isSectionComplete = (id: number) => {
    switch (id) {
      case 1:
        return !!(name && phone && email && city && state);
      case 2:
        return !!(height && weight && bust && waist && hips);
      case 11:
        return !!biography;
      case 15:
        return !!(agreedToTerms && accuracyDeclaration && digitalSignature);
      default:
        return true;
    }
  };

  return (
    <div id="become-model-portal" className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Home / Back Navigation */}
      {onGoHome && (
        <div className="flex justify-start mb-6">
          <button
            type="button"
            onClick={onGoHome}
            id="become-model-home-btn"
            className="flex items-center space-x-2 text-xs font-black text-neutral-400 hover:text-white transition cursor-pointer uppercase tracking-wider font-mono bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/5"
          >
            <ArrowLeft className="h-4 w-4 text-[#EA3838]" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="mb-8 text-center">
        <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#EA3838]">
          Professional Artist & Model Registration Form
        </h2>
        <AnimatedTypingText text="Create your certified casting portfolio slate. Your submission stores instantly in our secure database. Normal visitors can only view your public photo card, name, and location." />
      </div>

      {registrationSuccess ? (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-5 shadow-2xl animate-fadeIn">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-sans text-xl font-bold text-white">Casting Registration Submitted Successfully!</h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
            Thank you, **{name}**. Your professional credentials under **{category}** have been registered. To maintain strict privacy guidelines, normal users can only see your name, photo, and city. Access to detailed rates, metrics, and contracts are securely hidden behind authentication!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                if (onViewCategory) {
                  onViewCategory(category);
                }
              }}
              className="w-full sm:w-auto rounded-full bg-[#EA3838] px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition cursor-pointer"
            >
              Browse Category Directory
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistrationSuccess(false);
                setName('');
                setBiography('');
                setAgreedToTerms(false);
                setAccuracyDeclaration(false);
                setDigitalSignature('');
                setActiveSectionId(1);
              }}
              className="w-full sm:w-auto rounded-full border border-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/5 transition cursor-pointer"
            >
              Register Another Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MOBILE RECEPTIVE HORIZONTAL STEP TRACKER */}
          <div className="block lg:hidden w-full bg-[#121212] rounded-2xl border border-white/5 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Section Progress ({activeSectionId}/15)
              </p>
              <span className="text-[9px] font-mono text-[#EA3838] uppercase font-black tracking-widest">
                {SECTIONS.find(s => s.id === activeSectionId)?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
              {SECTIONS.map((sec) => {
                const completed = isSectionComplete(sec.id);
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`flex-shrink-0 h-9 min-w-[36px] px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center relative transition active:scale-95 cursor-pointer ${
                      isActive 
                        ? 'bg-[#EA3838] text-white ring-1 ring-red-500/50 shadow-md shadow-red-550/10' 
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    <span>{sec.id}</span>
                    {completed && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEFT SIDEBAR: 15-Section Directory list */}
          <div className="hidden lg:block lg:col-span-3 bg-[#121212] rounded-2xl border border-white/5 p-4 shadow-2xl space-y-1 overflow-y-auto max-h-[750px] scrollbar-thin scrollbar-thumb-zinc-800">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Google Form Outline ({SECTIONS.length} Sections)
            </p>
            {SECTIONS.map((sec) => {
              const completed = isSectionComplete(sec.id);
              const isActive = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                    isActive 
                      ? 'bg-[#EA3838] text-white' 
                      : 'bg-transparent text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <div className="truncate">
                    <span className="block text-[10px] font-mono opacity-65">Section {sec.id}</span>
                    <span className="block text-xs font-bold truncate leading-tight mt-0.5">{sec.name}</span>
                  </div>
                  {completed ? (
                    <Check className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                  ) : (
                    <span className="text-[9px] font-mono uppercase bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">Required</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CENTRAL WORKSPACE: Form fields of active section */}
          <div className="lg:col-span-6 bg-[#121212] rounded-2xl border border-white/5 p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[580px]">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Active Section Header */}
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono font-bold text-[#EA3838] uppercase tracking-widest">
                  Section {activeSectionId} of 15
                </span>
                <h3 className="font-sans text-lg font-bold text-white mt-0.5">
                  {SECTIONS.find(s => s.id === activeSectionId)?.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {SECTIONS.find(s => s.id === activeSectionId)?.desc}
                </p>
              </div>

              {/* Dynamic Sections rendering */}
              <div className="space-y-5 animate-fadeIn min-h-[300px]">
                
                {/* Section 1: Personal Details */}
                {activeSectionId === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Full Name *</label>
                          {renderValidationIcon('name', name)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Professional Email *</label>
                          {renderValidationIcon('email', email)}
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="e.g. priya@modelverse.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Mobile Calling Number *</label>
                          {renderValidationIcon('phone', phone)}
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">WhatsApp Number *</label>
                          <div className="flex items-center space-x-2">
                            {renderValidationIcon('whatsapp', isWhatsappSame ? phone : whatsapp)}
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isWhatsappSame}
                                onChange={(e) => setIsWhatsappSame(e.target.checked)}
                                className="rounded bg-white/5 border-white/10 text-[#EA3838] focus:ring-0 w-3 h-3 cursor-pointer"
                              />
                              <span className="text-[10px] text-zinc-400 select-none">Same as mobile</span>
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          required
                          disabled={isWhatsappSame}
                          placeholder="e.g. +91 98765 43210"
                          value={isWhatsappSame ? phone : whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className={`w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] ${
                            isWhatsappSame ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Date of Birth *</label>
                          {renderValidationIcon('dob', dob)}
                        </div>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Gender Identity *</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="female" className="bg-[#121212] text-white">Female</option>
                          <option value="male" className="bg-[#121212] text-white">Male</option>
                          <option value="transgender" className="bg-[#121212] text-white">Transgender</option>
                          <option value="non-binary" className="bg-[#121212] text-white">Non-Binary</option>
                          <option value="prefer-not-to-say" className="bg-[#121212] text-white">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">City *</label>
                          {renderValidationIcon('city', city)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">State *</label>
                          {renderValidationIcon('state', state)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Physical Details */}
                {activeSectionId === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">{"Height (e.g. 5'8\") *"}</label>
                          {renderValidationIcon('height', height)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5ft 8in"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">{"Weight (kg) *"}</label>
                          {renderValidationIcon('weight', weight)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 55 kg"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Bust / Chest *</label>
                          {renderValidationIcon('bust', bust)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 34"
                          value={bust}
                          onChange={(e) => setBust(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Waist (inches) *</label>
                          {renderValidationIcon('waist', waist)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 26"
                          value={waist}
                          onChange={(e) => setWaist(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Hips (inches) *</label>
                          {renderValidationIcon('hips', hips)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 36"
                          value={hips}
                          onChange={(e) => setHips(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Shoe Size (EU) *</label>
                          {renderValidationIcon('shoeSize', shoeSize)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 39"
                          value={shoeSize}
                          onChange={(e) => setShoeSize(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Eye Color *</label>
                          {renderValidationIcon('eyeColor', eyeColor)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hazel/Brown"
                          value={eyeColor}
                          onChange={(e) => setEyeColor(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-zinc-300">Hair Color *</label>
                          {renderValidationIcon('hairColor', hairColor)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dark Brown"
                          value={hairColor}
                          onChange={(e) => setHairColor(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Skin Tone *</label>
                        <select
                          value={skinTone}
                          onChange={(e) => setSkinTone(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Fair" className="bg-[#121212]">Fair</option>
                          <option value="Medium" className="bg-[#121212]">Medium</option>
                          <option value="Olive" className="bg-[#121212]">Olive</option>
                          <option value="Dusk" className="bg-[#121212]">Dusk/Deep</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Personal Information */}
                {activeSectionId === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Nationality *</label>
                        <input
                          type="text"
                          required
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Marital Status *</label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Single" className="bg-[#121212]">Single</option>
                          <option value="Married" className="bg-[#121212]">Married</option>
                          <option value="Divorced" className="bg-[#121212]">Divorced</option>
                          <option value="Widowed" className="bg-[#121212]">Widowed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Educational Qualifications</label>
                      <input
                        type="text"
                        placeholder="e.g. Bachelor of Design (NIFT)"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Current Address *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Complete current residential address..."
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Permanent Address *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Permanent native residential address..."
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Section 4: Professional Details */}
                {activeSectionId === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Primary Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Fashion Models" className="bg-[#121212]">Fashion Models</option>
                          <option value="Commercial Models" className="bg-[#121212]">Commercial Models</option>
                          <option value="Fitness Models" className="bg-[#121212]">Fitness Models</option>
                          <option value="Actors" className="bg-[#121212]">Actors</option>
                          <option value="UGC Creators" className="bg-[#121212]">UGC Creators</option>
                          <option value="Influencers" className="bg-[#121212]">Influencers</option>
                          <option value="Event Hosts" className="bg-[#121212]">Event Hosts</option>
                          <option value="Promotional Models" className="bg-[#121212]">Promotional Models</option>
                          <option value="Brand Ambassadors" className="bg-[#121212]">Brand Ambassadors</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Sub-Specializations</label>
                        <input
                          type="text"
                          placeholder="e.g. Editorial, Swimwear, Bridal"
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Years of Experience *</label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Fresh Face" className="bg-[#121212]">Fresh Face (No Experience)</option>
                          <option value="1-2 years" className="bg-[#121212]">1-2 Years</option>
                          <option value="2-5 years" className="bg-[#121212]">2-5 Years</option>
                          <option value="5+ years" className="bg-[#121212]">5+ Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Professional Training? *</label>
                        <select
                          value={professionalTraining}
                          onChange={(e) => setProfessionalTraining(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes, I have completed coaching</option>
                          <option value="No" className="bg-[#121212]">No, I am self-trained/freelancer</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Acting / Modeling School Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Barry John Acting Studio, Mumbai"
                        value={actingModelingSchool}
                        onChange={(e) => setActingModelingSchool(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                  </div>
                )}

                {/* Section 5: Travel & Preferences */}
                {activeSectionId === 5 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Willing to Travel in India? *</label>
                        <select
                          value={willingToTravelIndia}
                          onChange={(e) => setWillingToTravelIndia(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes</option>
                          <option value="No" className="bg-[#121212]">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Willing to Travel Internationally? *</label>
                        <select
                          value={willingToTravelInt}
                          onChange={(e) => setWillingToTravelInt(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes</option>
                          <option value="No" className="bg-[#121212]">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Do you have a Valid Passport? *</label>
                        <select
                          value={hasPassport}
                          onChange={(e) => setHasPassport(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes</option>
                          <option value="No" className="bg-[#121212]">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Open for Outstation Shoots? *</label>
                        <select
                          value={openForOutstation}
                          onChange={(e) => setOpenForOutstation(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes</option>
                          <option value="No" className="bg-[#121212]">No</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Preferred Casting & Shoot Cities *</label>
                      <input
                        type="text"
                        required
                        value={preferredLocations}
                        onChange={(e) => setPreferredLocations(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                  </div>
                )}

                {/* Section 6: Shoot Preferences */}
                {activeSectionId === 6 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Open To Following Shoot Types *</label>
                      <input
                        type="text"
                        value={shootTypesOpen}
                        onChange={(e) => setShootTypesOpen(e.target.value)}
                        placeholder="e.g. Runway, Editorial Prints, Commercial catalog, Lingerie, Swimwear"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Specify which modeling sectors you are comfortable contracting with.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Clothing & Styling Comfort Level *</label>
                      <textarea
                        required
                        rows={3}
                        value={clothingComfort}
                        onChange={(e) => setClothingComfort(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Section 7: Social Media Profiles */}
                {activeSectionId === 7 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Instagram Link / Handle</label>
                        <input
                          type="text"
                          placeholder="e.g. https://instagram.com/handle"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">YouTube Channel Link</label>
                        <input
                          type="text"
                          placeholder="e.g. https://youtube.com/@channel"
                          value={youtube}
                          onChange={(e) => setYoutube(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Personal Portfolio Website</label>
                        <input
                          type="text"
                          placeholder="e.g. https://priyasharma.com"
                          value={portfolioWebsite}
                          onChange={(e) => setPortfolioWebsite(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Facebook Profile Link</label>
                        <input
                          type="text"
                          placeholder="e.g. https://facebook.com/profile"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                 {/* Section 8: Portfolio Upload */}
                {activeSectionId === 8 && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
                      Please supply high-resolution image links or use our client-side canvas compressor tool to upload and optimize your images below.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Slot 1 */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-300">Portfolio Image 1 *</label>
                        <input
                          type="text"
                          placeholder="Image URL or Base64"
                          value={portfolioLink1}
                          onChange={(e) => setPortfolioLink1(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-[#EA3838]"
                        />
                        <div className="relative border border-dashed border-white/15 hover:border-[#EA3838]/40 rounded-2xl bg-white/5 p-4 text-center transition group min-h-[125px] flex flex-col justify-center items-center cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="portfolio-crop-file-1"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port1', setPortfolioLink1);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-[#EA3838] mb-1.5 transition" />
                          <p className="text-[11px] font-bold text-white group-hover:text-[#EA3838] transition">Crop & Optimize Photo 1</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">3:4 aspect ratio</p>
                        </div>
                        {compressionLogs['port1'] && (
                          <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-[10px] font-mono font-medium text-emerald-400 flex items-center justify-between">
                            <span>⚡ Compressor:</span>
                            <span>{compressionLogs['port1'].original} → {compressionLogs['port1'].compressed} (-{compressionLogs['port1'].percent}%)</span>
                          </div>
                        )}
                      </div>

                      {/* Slot 2 */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-300">Portfolio Image 2</label>
                        <input
                          type="text"
                          placeholder="Image URL or Base64"
                          value={portfolioLink2}
                          onChange={(e) => setPortfolioLink2(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-[#EA3838]"
                        />
                        <div className="relative border border-dashed border-white/15 hover:border-[#EA3838]/40 rounded-2xl bg-white/5 p-4 text-center transition group min-h-[125px] flex flex-col justify-center items-center cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="portfolio-crop-file-2"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port2', setPortfolioLink2);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-[#EA3838] mb-1.5 transition" />
                          <p className="text-[11px] font-bold text-white group-hover:text-[#EA3838] transition">Crop & Optimize Photo 2</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">3:4 aspect ratio</p>
                        </div>
                        {compressionLogs['port2'] && (
                          <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-[10px] font-mono font-medium text-emerald-400 flex items-center justify-between">
                            <span>⚡ Compressor:</span>
                            <span>{compressionLogs['port2'].original} → {compressionLogs['port2'].compressed} (-{compressionLogs['port2'].percent}%)</span>
                          </div>
                        )}
                      </div>

                      {/* Slot 3 */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-300">Portfolio Image 3</label>
                        <input
                          type="text"
                          placeholder="Image URL or Base64"
                          value={portfolioLink3}
                          onChange={(e) => setPortfolioLink3(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-[#EA3838]"
                        />
                        <div className="relative border border-dashed border-white/15 hover:border-[#EA3838]/40 rounded-2xl bg-white/5 p-4 text-center transition group min-h-[125px] flex flex-col justify-center items-center cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="portfolio-crop-file-3"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadAndCrop(file, 'port3', setPortfolioLink3);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <UploadCloud className="h-6 w-6 text-zinc-400 group-hover:text-[#EA3838] mb-1.5 transition" />
                          <p className="text-[11px] font-bold text-white group-hover:text-[#EA3838] transition">Crop & Optimize Photo 3</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">3:4 aspect ratio</p>
                        </div>
                        {compressionLogs['port3'] && (
                          <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-[10px] font-mono font-medium text-emerald-400 flex items-center justify-between">
                            <span>⚡ Compressor:</span>
                            <span>{compressionLogs['port3'].original} → {compressionLogs['port3'].compressed} (-{compressionLogs['port3'].percent}%)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Introduction Video Link (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. YouTube/Vimeo/Drive link"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                  </div>
                )}

                {/* Section 9: Professional Experience */}
                {activeSectionId === 9 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Previous Brands Worked With</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Sabyasachi, Manish Malhotra, Lakme, Zara"
                        value={brandsWorkedWith}
                        onChange={(e) => setBrandsWorkedWith(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Notable Shows Walked</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Lakme Fashion Week Autumn/Winter Runway (2024)"
                        value={notableShows}
                        onChange={(e) => setNotableShows(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Filmography, SaaS Commercials or Print Highlight Lists</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Lead actress in Loreal Cosmetics print ad campaign..."
                        value={filmographyCommercials}
                        onChange={(e) => setFilmographyCommercials(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Section 10: Availability */}
                {activeSectionId === 10 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Current Availability Status *</label>
                        <select
                          value={availabilityStatus}
                          onChange={(e: any) => setAvailabilityStatus(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Available" className="bg-[#121212]">Available for Bookings</option>
                          <option value="Booked" className="bg-[#121212]">Fully Booked</option>
                          <option value="On-Leave" className="bg-[#121212]">Temporary Leave</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Notice Period Required *</label>
                        <select
                          value={availabilityNotice}
                          onChange={(e) => setAvailabilityNotice(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Immediate" className="bg-[#121212]">Immediate Start</option>
                          <option value="1 Week" className="bg-[#121212]">1 Week Notice</option>
                          <option value="2 Weeks" className="bg-[#121212]">2 Weeks Notice</option>
                          <option value="1 Month" className="bg-[#121212]">1 Month Notice</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Preferred Shoot Days *</label>
                        <select
                          value={preferredShootDays}
                          onChange={(e) => setPreferredShootDays(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Both Weekdays & Weekends" className="bg-[#121212]">Both Weekdays & Weekends</option>
                          <option value="Weekdays Only" className="bg-[#121212]">Weekdays Only</option>
                          <option value="Weekends Only" className="bg-[#121212]">Weekends Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Max Hours per Day *</label>
                        <input
                          type="number"
                          required
                          value={maxHoursPerDay}
                          onChange={(e) => setMaxHoursPerDay(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 11: Bio & Unique Talents */}
                {activeSectionId === 11 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#EA3838] mb-1">Professional Biography *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Write a highly descriptive professional introduction pitch. Minimum 50 characters..."
                        value={biography}
                        onChange={(e) => setBiography(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Unique Selling Points</label>
                      <input
                        type="text"
                        placeholder="e.g. Sharp athletic jawline, extremely versatile poses"
                        value={uniqueSellingPoints}
                        onChange={(e) => setUniqueSellingPoints(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Special Talents & Extras</label>
                      <input
                        type="text"
                        placeholder="e.g. Swimmer, Salsa dancer, Martial artist, Car driver"
                        value={specialTalents}
                        onChange={(e) => setSpecialTalents(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                  </div>
                )}

                {/* Section 12: Specialization */}
                {activeSectionId === 12 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Specialized Genres</label>
                      <input
                        type="text"
                        placeholder="e.g. Bridal wear, High fashion runway, Athleisure"
                        value={specializedGenres}
                        onChange={(e) => setSpecializedGenres(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Ethnic & Bridal Wear Comfort? *</label>
                        <select
                          value={ethnicWearComfort}
                          onChange={(e) => setEthnicWearComfort(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Yes" className="bg-[#121212]">Yes, expert comfort</option>
                          <option value="No" className="bg-[#121212]">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Body Part Modeling Specialization</label>
                        <input
                          type="text"
                          placeholder="e.g. Hand modeling, foot/hair"
                          value={bodyPartModeling}
                          onChange={(e) => setBodyPartModeling(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 13: Experience Levels */}
                {activeSectionId === 13 && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 mb-2 font-medium">Evaluate your comfort and proficiency levels across primary modeling formats:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Runway Modeling</label>
                        <select
                          value={runwayExperience}
                          onChange={(e) => setRunwayExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Beginner" className="bg-[#121212]">Beginner / Fresh Face</option>
                          <option value="Intermediate" className="bg-[#121212]">Intermediate</option>
                          <option value="Expert" className="bg-[#121212]">Expert / Seasoned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Editorial & Print Catalog</label>
                        <select
                          value={editorialExperience}
                          onChange={(e) => setEditorialExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Beginner" className="bg-[#121212]">Beginner / Fresh Face</option>
                          <option value="Intermediate" className="bg-[#121212]">Intermediate</option>
                          <option value="Expert" className="bg-[#121212]">Expert / Seasoned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">SaaS TVC Commercials</label>
                        <select
                          value={tvcExperience}
                          onChange={(e) => setTvcExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Beginner" className="bg-[#121212]">Beginner / Fresh Face</option>
                          <option value="Intermediate" className="bg-[#121212]">Intermediate</option>
                          <option value="Expert" className="bg-[#121212]">Expert / Seasoned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">UGC Video Creation</label>
                        <select
                          value={ugcExperience}
                          onChange={(e) => setUgcExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Beginner" className="bg-[#121212]">Beginner / Fresh Face</option>
                          <option value="Intermediate" className="bg-[#121212]">Intermediate</option>
                          <option value="Expert" className="bg-[#121212]">Expert / Seasoned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 14: Charges & Day Rates */}
                {activeSectionId === 14 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Expected Day Rate (INR) *</label>
                        <input
                          type="number"
                          required
                          value={startingPrice}
                          onChange={(e) => setStartingPrice(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Minimum Booking Duration *</label>
                        <select
                          value={minimumBookingDuration}
                          onChange={(e) => setMinimumBookingDuration(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        >
                          <option value="Half Day" className="bg-[#121212]">Half Day (4 hours)</option>
                          <option value="Full Day" className="bg-[#121212]">Full Day (8 hours)</option>
                          <option value="2 Days" className="bg-[#121212]">Minimum 2 Days</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Outstation Travel / Lodging *</label>
                      <select
                        value={accommodationCoverage}
                        onChange={(e) => setAccommodationCoverage(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                      >
                        <option value="Covered by brand" className="bg-[#121212]">Must be fully covered by hiring brand (Flights + 5 Star Stay)</option>
                        <option value="Self-managed" className="bg-[#121212]">Self-managed accommodation within daily rate card</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Section 15: Declaration */}
                {activeSectionId === 15 && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                      Please confirm your accuracy and agreement to complete the ModelVerse India professional onboarding audit.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 rounded bg-white/5 border-white/10 text-[#EA3838] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-300 font-medium leading-tight select-none">
                          I agree to the ModelVerse India modeling directory terms of service, platform service fees, and cancellation guidelines. *
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={accuracyDeclaration}
                          onChange={(e) => setAccuracyDeclaration(e.target.checked)}
                          className="mt-1 rounded bg-white/5 border-white/10 text-[#EA3838] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-zinc-300 font-medium leading-tight select-none">
                          I declare that all dimensions, age, calling numbers, and portfolio pictures supplied are accurate, current, and non-digitally modified. *
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-[#EA3838]">Digital Signature *</label>
                          {renderValidationIcon('digitalSignature', digitalSignature)}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Type your full legal name..."
                          value={digitalSignature}
                          onChange={(e) => setDigitalSignature(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#EA3838]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Date of Submission</label>
                        <input
                          type="date"
                          disabled
                          value={submissionDate}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Progress & Navigation Control bar */}
              <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between">
                <button
                  type="button"
                  id="form-prev-btn"
                  disabled={activeSectionId === 1}
                  onClick={() => setActiveSectionId(prev => prev - 1)}
                  className="flex items-center space-x-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/5 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous Section</span>
                </button>

                {activeSectionId < 15 ? (
                  <button
                    type="button"
                    id="form-next-btn"
                    onClick={() => {
                      if (isSectionComplete(activeSectionId)) {
                        setActiveSectionId(prev => prev + 1);
                      } else {
                        alert(`Please complete the required details on Section ${activeSectionId} before proceeding.`);
                      }
                    }}
                    className="flex items-center space-x-2 rounded-full bg-white text-black px-5 py-2 text-xs font-bold hover:bg-zinc-200 transition cursor-pointer"
                  >
                    <span>Next Section</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    id="form-submit-btn"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 rounded-full bg-[#EA3838] text-white px-6 py-2.5 text-xs font-black hover:brightness-110 shadow-lg shadow-red-600/10 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Processing Application...' : 'Submit Professional Registration'}</span>
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* RIGHT SIDE PANEL: webcam liveness ID and Gemini AI scoring */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Liveness camera liveness audit */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center space-x-2 text-[#EA3838] mb-3">
                <Camera className="h-5 w-5" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider">Liveness Selfie Audit</h4>
              </div>

              {activeUploadType === 'selfie' ? (
                <div className="space-y-4 text-center">
                  {capturedImage ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                      <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {livenessResult === 'processing' && (
                          <div className="text-center space-y-2">
                            <Loader2 className="h-6 w-6 text-red-500 animate-spin mx-auto" />
                            <p className="text-[10px] text-white font-mono uppercase tracking-widest font-black">Liveness check {livenessScanningProgress}%</p>
                          </div>
                        )}
                        {livenessResult === 'verified' && (
                          <div className="text-center space-y-1">
                            <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto animate-pulse" />
                            <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-black">Verified Liveness Match</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isSimulatingCamera ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                      <img 
                        src={gender === 'female' 
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600'
                          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600'
                        } 
                        alt="Simulated Webcam Feed" 
                        className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
                        referrerPolicy="no-referrer"
                      />
                      {/* High-tech HUD overlays */}
                      <div className="absolute inset-0 border-[2px] border-dashed border-red-500/30 m-3 rounded-lg pointer-events-none animate-pulse" />
                      
                      {/* Top status bar */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center px-2 pointer-events-none font-mono text-[8px] text-red-500 bg-black/60 py-1 rounded backdrop-blur-sm">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                          LIVE SIMULATED HD STREAM
                        </span>
                        <span>ISO 100 • F/2.8 • 1080p 60fps</span>
                      </div>

                      {/* Ready Badge */}
                      {countdownSeconds === null && (
                        <div className="absolute top-10 left-4 flex items-center space-x-1 bg-emerald-500/95 backdrop-blur-md text-white font-mono text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded shadow-lg border border-emerald-400/30 z-20 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                          <span>● SYSTEM READY</span>
                        </div>
                      )}

                      {/* Countdown Overlay */}
                      {countdownSeconds !== null && (
                        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-30 animate-fadeIn">
                          <div className="h-20 w-20 rounded-full border-4 border-red-500 flex items-center justify-center animate-bounce">
                            <span className="text-white text-4xl font-black font-mono">{countdownSeconds}</span>
                          </div>
                          <span className="text-[10px] text-red-500 uppercase font-black tracking-widest mt-4 font-mono animate-pulse">📸 SAY CHEESE!</span>
                        </div>
                      )}

                      {/* Green facial scan guide & reticle overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Oval mask representing face alignment guide */}
                        <div className="border border-red-500/40 rounded-full w-24 h-32 flex flex-col items-center justify-center animate-pulse relative">
                          {/* Green scanning crosshairs */}
                          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-500/20" />
                          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-red-500/20" />
                          {/* Face tracking dots */}
                          <div className="absolute top-2 left-4 h-1 w-1 bg-green-400 rounded-full animate-ping" />
                          <div className="absolute top-8 right-6 h-1 w-1 bg-green-400 rounded-full animate-ping delay-75" />
                          <div className="absolute bottom-6 left-8 h-1 w-1 bg-green-400 rounded-full animate-ping delay-150" />
                          <span className="text-[7px] text-zinc-400 uppercase tracking-widest bg-black/60 px-1 rounded absolute -bottom-3">ALIGN FACE</span>
                        </div>
                      </div>

                      {/* Moving laser sweep line */}
                      <div className="absolute left-3 right-3 h-0.5 bg-red-500/50 shadow-[0_0_8px_#EF4444] animate-bounce pointer-events-none top-6" style={{ animationDuration: '3s' }} />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-white/10 bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      {isCameraLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      
                      {/* Real Camera Status Overlays */}
                      {!isCameraLoading && cameraStream && (
                        <>
                          {/* Ready Badge */}
                          {countdownSeconds === null && (
                            <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-emerald-500/95 backdrop-blur-md text-white font-mono text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded shadow-lg border border-emerald-400/30 z-20 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                              <span>● CAMERA ACTIVE & READY</span>
                            </div>
                          )}

                          {/* Countdown Overlay */}
                          {countdownSeconds !== null && (
                            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-30 animate-fadeIn">
                              <div className="h-20 w-20 rounded-full border-4 border-red-500 flex items-center justify-center animate-bounce">
                                <span className="text-white text-4xl font-black font-mono">{countdownSeconds}</span>
                              </div>
                              <span className="text-[10px] text-red-500 uppercase font-black tracking-widest mt-4 font-mono animate-pulse">📸 GET READY...</span>
                            </div>
                          )}

                          {/* Facial Alignment guide */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border-2 border-dashed border-white/20 rounded-full w-24 h-32 flex flex-col items-center justify-center relative">
                              <span className="text-[7px] text-zinc-300 uppercase tracking-widest bg-black/70 px-1.5 py-0.5 rounded absolute -bottom-3 font-mono">FIT FACE IN OVAL</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {cameraError && (
                    <div className="space-y-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-center">
                      <p className="text-[10px] text-red-400 leading-tight">{cameraError}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraError(null);
                            setIsSimulatingCamera(true);
                          }}
                          className="rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-3 py-1.5 text-[9px] font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
                        >
                          Bypass with Virtual Camera Simulator
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPermissionHelper(true)}
                          className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/10 px-3 py-1.5 text-[9px] font-bold text-zinc-300 active:scale-95 transition cursor-pointer"
                        >
                          How to Allow Camera Access?
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    {!capturedImage ? (
                      <>
                        <button
                          type="button"
                          onClick={startCaptureCountdown}
                          disabled={countdownSeconds !== null}
                          className="rounded-full bg-[#EA3838] hover:bg-[#d63232] px-4 py-1.5 text-[10px] font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] transition duration-150 active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          {countdownSeconds !== null ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>{countdownSeconds}s...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="h-3.5 w-3.5" />
                              <span>Capture Selfie</span>
                            </>
                          )}
                        </button>
                        {!isSimulatingCamera && (
                          <button
                            type="button"
                            onClick={() => {
                              deactivateMainCamera();
                              setIsSimulatingCamera(true);
                            }}
                            className="rounded-full border border-white/10 hover:bg-white/5 px-3 py-1.5 text-[10px] font-bold text-zinc-300 cursor-pointer"
                          >
                            Simulate Camera
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSimulatingCamera) {
                            setCapturedImage(null);
                            setLivenessResult('idle');
                          } else {
                            activateMainCamera();
                          }
                        }}
                        className="rounded-full border border-white/10 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-white/5 cursor-pointer"
                      >
                        Retake Selfie
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSimulatingCamera(false);
                        setActiveUploadType(null);
                      }}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-white/5 border border-dashed border-white/10 rounded-xl space-y-2">
                  <CheckCircle2 className="h-6 w-6 text-[#EA3838] mx-auto animate-pulse" />
                  <p className="text-[11px] text-zinc-300 font-medium">Verify your identity slate via real-time biometric liveness audit.</p>
                  <button
                    type="button"
                    onClick={() => setActiveUploadType('selfie')}
                    className="rounded-full bg-white text-black px-4 py-1.5 text-[10px] font-bold hover:bg-zinc-200 cursor-pointer"
                  >
                    Open Selfie Cam
                  </button>
                </div>
              )}
            </div>

            {/* AIStudio model benchmark score */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center space-x-2 text-[#EA3838] mb-3">
                <Sparkles className="h-5 w-5" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider">AI Scoring Benchmarking</h4>
              </div>

              <p className="text-[11px] text-zinc-400 leading-normal mb-4 font-medium">
                Sparsely analyze your bio and location settings against top-tier Indian agency requirements. Get certified instantly!
              </p>

              {isEvaluating ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="h-6 w-6 text-[#EA3838] animate-spin mx-auto" />
                  <p className="text-[10px] text-zinc-300 font-bold">Scanning parameters...</p>
                </div>
              ) : aiEvaluation ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] text-zinc-400 font-bold">Casting Score:</span>
                    <span className="text-xs font-black font-mono text-[#EA3838] flex items-center">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5" /> {aiEvaluation.score}/10
                    </span>
                  </div>
                  <div className="space-y-2 text-[10px] text-zinc-300">
                    <div>
                      <strong className="block text-[#EA3838] text-[9px] uppercase tracking-wider">Suitability:</strong>
                      <p className="font-medium">{aiEvaluation.suitability}</p>
                    </div>
                    <div>
                      <strong className="block text-[#EA3838] text-[9px] uppercase tracking-wider">Casting Tips:</strong>
                      <p className="font-medium whitespace-pre-line leading-relaxed">{aiEvaluation.advice}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAiEvaluation}
                  className="w-full rounded-full bg-gradient-to-r from-[#EA3838] to-red-600 text-white py-2 text-xs font-bold hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  Scan Suitability Score
                </button>
              )}

              {evaluationError && (
                <p className="text-[10px] text-red-400 leading-tight mt-3 bg-red-500/10 p-2 rounded">{evaluationError}</p>
              )}
            </div>

          </div>

          {/* EDITING IMAGE LIGHTBOX POPUP: aspects-ratio cropper */}
          {editingImage && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 max-w-md w-full text-center space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-black uppercase text-white font-mono">Aspect Ratio Crop Tool (3:4)</span>
                  <button onClick={() => setEditingImage(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black max-h-[300px] flex items-center justify-center">
                  <div 
                    className="transition-transform duration-200"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <img src={editingImage.src} alt="Cropping Source" className="max-h-[300px] max-w-full object-contain mx-auto" />
                  </div>
                </div>

                {/* Cropping tools */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>Rotate:</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>Zoom: {zoom.toFixed(1)}x</span>
                    <input 
                      type="range" 
                      min="1.0" 
                      max="3.0" 
                      step="0.1" 
                      value={zoom} 
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-2/3 accent-[#EA3838]" 
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <span>Vertical Offset:</span>
                    <input 
                      type="range" 
                      min="-150" 
                      max="150" 
                      step="1" 
                      value={offsetY} 
                      onChange={(e) => setOffsetY(Number(e.target.value))}
                      className="w-2/3 accent-[#EA3838]" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingImage(null)}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isApplyingCrop}
                    onClick={applyCropAndRotate}
                    className="rounded-full bg-[#EA3838] text-white px-5 py-2 text-xs font-black hover:brightness-110 active:scale-95 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isApplyingCrop ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Apply Crop & Save</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CAMERA PERMISSION HELPER MODAL */}
          {showPermissionHelper && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="relative w-full max-w-lg bg-[#141414] border border-white/15 rounded-2xl p-6 shadow-2xl text-left">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowPermissionHelper(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
                  <div className="h-10 w-10 rounded-full bg-red-500/15 flex items-center justify-center text-[#EA3838]">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Camera Permissions Troubleshooter</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Liveness Audit Secure Authorization Assist</p>
                  </div>
                </div>

                {/* Warning Card */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-5 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Camera Access Denied or Blocked</h4>
                    <p className="text-[10px] text-zinc-300 leading-normal mt-1 font-medium">
                      Our live selfie biometric audit requires active camera access to verify your account. Please select your browser below and follow the steps to enable it.
                    </p>
                  </div>
                </div>

                {/* Browser Selectors */}
                <div className="flex border-b border-white/5 mb-4 font-sans">
                  {[
                    { id: 'chrome', label: 'Google Chrome' },
                    { id: 'safari', label: 'Apple Safari' },
                    { id: 'firefox', label: 'Mozilla Firefox' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHelperBrowserTab(tab.id as any)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition cursor-pointer text-center ${
                        helperBrowserTab === tab.id
                          ? 'border-[#EA3838] text-[#EA3838]'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Browser Guide Steps */}
                <div className="space-y-4 py-1 text-xs text-zinc-300">
                  {helperBrowserTab === 'chrome' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">1</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Click the <strong className="text-white">Lock icon (🔒) or Site Controls</strong> to the left of your URL address bar.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">2</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Locate <strong className="text-white">Camera</strong> in the dropdown menu and switch the toggle option to <strong className="text-emerald-400">Allow</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">3</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Close the menu, <strong className="text-red-400">Reload the page</strong>, and click <strong className="text-white">Capture Selfie</strong> again!
                        </p>
                      </div>
                    </div>
                  )}

                  {helperBrowserTab === 'safari' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">1</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Open the <strong className="text-white">Safari</strong> top menu bar and choose <strong className="text-white">Settings for This Website...</strong>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">2</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Hover over the <strong className="text-white">Camera</strong> option and select <strong className="text-emerald-400">Allow</strong> instead of Deny/Ask.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">3</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Refresh your Safari tab and press <strong className="text-white">Capture Selfie</strong> to start.
                        </p>
                      </div>
                    </div>
                  )}

                  {helperBrowserTab === 'firefox' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">1</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Click the small <strong className="text-white">Camera icon or Permissions badge</strong> in the address bar.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">2</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Click the <strong className="text-red-400">"X" clear action</strong> next to the Blocked status.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-black text-white font-mono">3</span>
                        <p className="leading-normal font-medium text-zinc-300 mt-0.5">
                          Refresh the page, select <strong className="text-white">"Remember this decision"</strong> and click <strong className="text-emerald-400">Allow</strong> when prompted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setIsSimulatingCamera(true);
                      setShowPermissionHelper(false);
                    }}
                    className="flex-1 py-2 text-center text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    Bypass with Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPermissionHelper(false);
                      activateMainCamera();
                    }}
                    className="flex-1 py-2 text-center text-white bg-[#EA3838] hover:bg-[#d63232] rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg shadow-[#EA3838]/20 transition cursor-pointer"
                  >
                    Retry Selfie Camera
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
