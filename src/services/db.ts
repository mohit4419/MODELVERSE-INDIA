/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../supabaseClient';
import { Model, Booking, PaymentRecord, Message, Review, User, BlogItem, UserRole, AuditLog, Payout, PayoutStatus, Post } from '../types';

let isSupabaseAvailable = true;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface DatabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object') {
    errorMessage = (error as any).message || (error as any).details || JSON.stringify(error);
  } else {
    errorMessage = String(error);
  }

  const errInfo: DatabaseErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: null,
      email: null
    },
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function removeUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)) as any;
  }
  
  const cleanObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleanObj[key] = removeUndefined(val);
      }
    }
  }
  return cleanObj;
}


const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    action: 'Registration Approval',
    performedBy: 'admin@modelverse.in',
    details: 'Approved model Priya Sharma portfolio after verification of identity card.',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    entityId: 'u_p_sharma',
    entityType: 'model'
  },
  {
    id: 'log_2',
    action: 'Booking Status Change',
    performedBy: 'admin@modelverse.in',
    details: 'Sabyasachi Couture campaign status updated from pending to accepted.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    entityId: 'b_test_1',
    entityType: 'booking'
  },
  {
    id: 'log_3',
    action: 'User Suspension Change',
    performedBy: 'admin@modelverse.in',
    details: 'User accounts checked and synchronized for security guidelines.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    entityType: 'user'
  }
];

const SEED_USERS: User[] = [
  {
    id: 'c_test',
    role: 'client',
    name: 'Demo Client',
    email: 'client@modelverse.in',
    phone: '+91 98765 43210',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm1',
    role: 'model',
    name: 'Pooja Hegde',
    email: 'model@modelverse.in',
    phone: '+91 91111 22222',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a_admin',
    role: 'admin',
    name: 'Super Admin',
    email: 'admin@modelverse.in',
    phone: '+91 99999 88888',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date().toISOString(),
  }
];


// PREMIUM UNSPLASH PORTRAIT IMAGES
const MODEL_IMAGES = {
  priya: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', // Priya
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
  ],
  kabir: [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop', // Kabir
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop',
  ],
  anjali: [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop', // Anjali
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  ],
  vikram: [
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop', // Vikram
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=600&auto=format&fit=crop',
  ],
  rhea: [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop', // Rhea
    'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop',
  ],
  divya: [
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600&auto=format&fit=crop', // Divya
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  ],
};

// Seed initial data
const SEED_MODELS: Model[] = [
  {
    id: 'm1',
    userId: 'u_p_sharma',
    name: 'Priya Sharma',
    gender: 'female',
    age: 24,
    height: '5\'10"',
    city: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Hindi', 'Marathi'],
    experience: '5+ years',
    category: 'Fashion Models',
    portfolio: MODEL_IMAGES.priya,
    portfolioCaptions: [
      'Lakme Fashion Week Runway Mainstage',
      'Editorial look for Vogue India Magazine',
      'Designer Couture shoot in Udaipur Palace',
      'Luxury Diamond Jewelry Campaign'
    ],
    portfolioCategories: ['Runway', 'Editorial', 'Couture', 'Commercial'],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    availabilityStatus: 'Available',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_priya.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Priya_Sharma_Couture_Comp_Card.pdf',
    startingPrice: 35000,
    rating: 4.9,
    reviewsCount: 48,
    biography: 'Lakme Fashion Week regular, worked with Sabyasachi, Manish Malhotra, and numerous editor campaigns for Vogue India and Harper\'s Bazaar. Specialized in couture runway, designer editorials, and luxury jewelry launches.',
    measurements: {
      bust: '34"',
      waist: '25"',
      hips: '36"'
    },
    agencyInfo: {
      name: 'Inega Model Management',
      contactName: 'Rohan Kapoor'
    }
  },
  {
    id: 'm2',
    userId: 'u_k_mehra',
    name: 'Kabir Mehra',
    gender: 'male',
    age: 26,
    height: '6\'2"',
    city: 'Delhi',
    state: 'NCR',
    languages: ['English', 'Hindi', 'Punjabi'],
    experience: '2-5 years',
    category: 'Fitness Models',
    portfolio: MODEL_IMAGES.kabir,
    portfolioCaptions: [
      'Nike Athletic Athleisure Outdoor Campaign',
      'Cult.fit Brand Ambassador Profile',
      'Men\'s Health India Cover Shoot',
      'Aesthetic Fitness Studio Portrait'
    ],
    portfolioCategories: ['Sports', 'Branding', 'Editorial', 'Studio'],
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    availabilityStatus: 'Booked',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_kabir.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Kabir_Mehra_Athletic_Fitness_Specs.pdf',
    startingPrice: 28000,
    rating: 4.8,
    reviewsCount: 32,
    biography: 'Professional athletic model, fitness influencer, and print commercial face. Worked with major sports brands including Nike India, Cult.fit, and MuscleBlaze. Passionate about strength training and premium athleisure wear.',
    measurements: {
      bust: '41"',
      waist: '31"',
      hips: '40"'
    },
    agencyInfo: {
      name: 'Anima Creative Management',
      contactName: 'Gunjan Sen'
    }
  },
  {
    id: 'm3',
    userId: 'u_a_rao',
    name: 'Anjali Rao',
    gender: 'female',
    age: 22,
    height: '5\'7"',
    city: 'Bangalore',
    state: 'Karnataka',
    languages: ['English', 'Kannada', 'Hindi', 'Tamil'],
    experience: '2-5 years',
    category: 'UGC Creators',
    portfolio: MODEL_IMAGES.anjali,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    availabilityStatus: 'Available',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_anjali.jpg',
    startingPrice: 15000,
    rating: 4.7,
    reviewsCount: 21,
    biography: 'Full-time UGC creator, digital storyteller, and lifestyle influencer with over 150K followers on social media. Excellent scriptwriter, videographer, and editor. She creates high-engagement beauty, skin, and tech review content.',
    measurements: {
      bust: '32"',
      waist: '26"',
      hips: '35"'
    },
    agencyInfo: {
      name: 'Independent',
      contactName: 'Self Managed'
    }
  },
  {
    id: 'm4',
    userId: 'u_v_singh',
    name: 'Vikram Singh',
    gender: 'male',
    age: 28,
    height: '6\'0"',
    city: 'Mumbai',
    state: 'Maharashtra',
    languages: ['English', 'Hindi', 'Gujarati'],
    experience: '5+ years',
    category: 'Actors',
    portfolio: MODEL_IMAGES.vikram,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    availabilityStatus: 'Available',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_vikram.jpg',
    startingPrice: 45000,
    rating: 4.9,
    reviewsCount: 54,
    biography: 'Screen actor seen in popular OTT series, national television advertisements, and dynamic commercial theater. Highly expressive, skilled in voice acting and improvisation. Perfect for corporate storytelling and brand commercials.',
    measurements: {
      bust: '40"',
      waist: '32"',
      hips: '39"'
    },
    agencyInfo: {
      name: 'Toabh Creative',
      contactName: 'Sanjay Dutt'
    }
  },
  {
    id: 'm5',
    userId: 'u_r_kapoor',
    name: 'Rhea Kapoor',
    gender: 'female',
    age: 25,
    height: '5\'8"',
    city: 'Delhi',
    state: 'NCR',
    languages: ['English', 'Hindi'],
    experience: '2-5 years',
    category: 'Commercial Models',
    portfolio: MODEL_IMAGES.rhea,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    availabilityStatus: 'On-Leave',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_rhea.jpg',
    startingPrice: 22000,
    rating: 4.6,
    reviewsCount: 15,
    biography: 'Commercial print model specializing in skincare, e-commerce fashion catalogues, and FMCG digital campaigns. Worked for Myntra, Nykaa, and Pantaloons. Known for an elegant, relatable Indian-ethnic look.',
    measurements: {
      bust: '34"',
      waist: '27"',
      hips: '37"'
    },
    agencyInfo: {
      name: 'Elite Models India',
      contactName: 'Aishwarya Roy'
    }
  },
  {
    id: 'm6',
    userId: 'u_d_nair',
    name: 'Divya Nair',
    gender: 'female',
    age: 23,
    height: '5\'6"',
    city: 'Chennai',
    state: 'Tamil Nadu',
    languages: ['English', 'Tamil', 'Malayalam', 'Telugu'],
    experience: 'Fresh Face',
    category: 'Event Hosts',
    portfolio: MODEL_IMAGES.divya,
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    availabilityStatus: 'Available',
    selfieVerified: true,
    approved: true,
    govIdUrl: 'id_front_divya.jpg',
    startingPrice: 12000,
    rating: 4.5,
    reviewsCount: 9,
    biography: 'Energetic corporate emcee, luxury car launch host, and multi-lingual event presenter. Highly professional, eloquent speaker, and skilled planner of interactive stage activities for major auto expos in South India.',
    measurements: {
      bust: '33"',
      waist: '26"',
      hips: '36"'
    },
    agencyInfo: {
      name: 'Independent',
      contactName: 'Self Managed'
    }
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: 'r1',
    clientId: 'c1',
    clientName: 'Manish Kumar (Sabyasachi)',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
    modelId: 'm1',
    rating: 5,
    review: 'Priya brought outstanding poise and grace to our Royal Heritage collection photoshoot. Highly cooperative, professional, and effortless in adapting to high-stress ramp adjustments.',
    date: 'Jun 12, 2026'
  },
  {
    id: 'r2',
    clientId: 'c2',
    clientName: 'Aman Deep (Cult.fit)',
    clientAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150',
    modelId: 'm2',
    rating: 5,
    review: 'Kabir exceeded our campaign expectations. Excellent physical condition, endless stamina during an outdoor athletic and sports-performance shoot in heavy heat.',
    date: 'Jun 15, 2026'
  },
  {
    id: 'r3',
    clientId: 'c3',
    clientName: 'Kriti Sen (Nykaa Creative)',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    modelId: 'm5',
    rating: 4.5,
    review: 'Rhea is a wonderful face for digital cosmetics. Extremely expressive, understands lighting well, and saved us hours of post-production with her high-precision skin radiance.',
    date: 'Jun 08, 2026'
  }
];

const SEED_BLOGS: BlogItem[] = [
  {
    id: 'b1',
    title: 'How to Build a High-Converting Modeling Portfolio in India',
    category: 'Industry Tips',
    summary: 'Essential guidelines for Indian modeling talent to draft a visual portfolio that grabs the immediate attention of major casting agencies and couture directors.',
    content: `Building a modeling portfolio is your first calling card. In the Indian fashion industry—ranging from high-fashion couture in Delhi or Mumbai to heavy commercial and catalog work—agencies look for versatility and canvas quality.

### 1. The Power of "Polaroids"
First thing first, casting directors want to see your natural face. These are called casting digitals or polaroids. Avoid thick makeup, wear basic, close-fitting clothing (like a black tank top and blue jeans), and shoot in crisp, natural window daylight. Include:
- A headshot (front)
- Profile headshots (left and right)
- Full-length body shot
- Three-quarter length body shot

### 2. Diversify Your Looks
Your portfolio shouldn't just contain one aesthetic. Showcase:
- **Traditional Indian Wear:** Highly demanded for Indian weddings and festive seasons.
- **Western Casuals:** Perfect for e-commerce catalog auditions.
- **High Fashion/Avant-Garde:** Demonstrates your editorial expression of lines and shadows.

### 3. Work with Professional Photographers
While beginner models do "TFP" (Time for Print) tests, investing in a reputable fashion photographer who understands agency standards makes a dramatic difference. Ensure your photos tell a story and stay updated with your latest hairstyle and body measurements!`,
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
    author: 'Karan Mehra (Inega Director)',
    publishedDate: 'Jun 14, 2026'
  },
  {
    id: 'b2',
    title: 'The Rise of UGC Creators and Influencers in Commercial Modeling',
    category: 'Casting Guides',
    summary: 'Why modern lifestyle brands across Bangalore, Mumbai, and Gurgaon are shifting budget shares towards authentic, self-managed user-generated content creators.',
    content: `The marketing landscape in 2026 has witnessed a massive decentralization of media. Traditional models are expanding their skillset into speaking, script-building, and self-publishing, while authentic UGC creators are gaining runway recognition.

### Why Brands Prefer UGC
Unlike high-glamour billboard models who are silent ambassadors, UGC creators speak directly to the smartphone camera, making product benefits feel like a recommendation from a reliable close friend. This authentic presentation triggers a 4x higher purchase conversion rate for social media campaigns.

### Key Skills for Modern UGC Models:
- **Flawless lighting setup:** Mastering small ring lights, softboxes, and natural ambient lighting in a bedroom background.
- **Dynamic copywriting:** Writing a 15-second TikTok/Reel hook that retains the consumer in the first 2 seconds.
- **Clean voice-overs:** Clear, energetic pronunciation of brand names in multiple languages (English, Hindi, regional).

Brand campaigns now seek creators who can deliver both beautiful visuals and rich performance. ModelVerse India bridges this gap by labeling creators clearly for high-intent agencies!`,
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    author: 'Nisha Sundaram (E-com Casting lead)',
    publishedDate: 'Jun 18, 2026'
  }
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'bk_1',
    clientId: 'c1',
    clientName: 'Manish Kumar (Sabyasachi)',
    modelId: 'm1',
    modelName: 'Priya Sharma',
    modelImage: MODEL_IMAGES.priya[0],
    projectDetails: {
      brandName: 'Sabyasachi Couture',
      companyName: 'Sabyasachi India Private Limited',
      campaignType: 'High Fashion Editorial',
      shootType: 'Outdoor Runway & Heritage Fort Shoot',
      location: 'Jaipur, Rajasthan',
      date: '2026-07-10',
      duration: '3 Days',
      budgetRange: '₹1,00,000 - ₹1,50,000',
      notes: 'Heritage collection jewelry shoot. Accommodation, travel, and meals will be covered by the company.'
    },
    status: 'completed',
    createdAt: '2026-06-11T12:00:00Z',
    priceAmount: 105000
  },
  {
    id: 'bk_2',
    clientId: 'c2',
    clientName: 'Aman Deep (Cult.fit)',
    modelId: 'm2',
    modelName: 'Kabir Mehra',
    modelImage: MODEL_IMAGES.kabir[0],
    projectDetails: {
      brandName: 'Cult.Sport Athleisure',
      companyName: 'Cult.sport India',
      campaignType: 'Commercial Catalog',
      shootType: 'Indoor Studio & Fitness Zone',
      location: 'Bangalore, Karnataka',
      date: '2026-07-22',
      duration: '1 Day',
      budgetRange: '₹25,000 - ₹35,000',
      notes: 'Showcasing the winter compression pants and hoodies range.'
    },
    status: 'accepted',
    createdAt: '2026-06-14T15:30:00Z',
    priceAmount: 28000
  },
  {
    id: 'bk_3',
    clientId: 'c_test',
    clientName: 'Premium Agency (Test Client)',
    modelId: 'm1',
    modelName: 'Priya Sharma',
    modelImage: MODEL_IMAGES.priya[0],
    projectDetails: {
      brandName: 'Vogue India Cover Shoot',
      companyName: 'Condé Nast India',
      campaignType: 'Magazine Cover',
      shootType: 'Studio Fashion Editorial',
      location: 'Mumbai, Maharashtra',
      date: '2026-06-30',
      duration: '2 Days',
      budgetRange: '₹70,000 - ₹90,000',
      notes: 'Theme is "Modern Indian Monochromes". Styling provided by Vogue stylists.'
    },
    status: 'pending',
    createdAt: '2026-06-20T08:00:00Z',
    priceAmount: 70000
  }
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'p_1',
    userId: 'c1',
    userName: 'Manish Kumar (Sabyasachi)',
    amount: 105000,
    paymentGateway: 'Razorpay',
    status: 'success',
    description: 'Campaign Booking for Priya Sharma (3 Days)',
    createdAt: '2026-06-11T12:15:00Z',
    invoiceId: 'MVI-2026-1039'
  },
  {
    id: 'p_2',
    userId: 'c2',
    userName: 'Aman Deep (Cult.fit)',
    amount: 28000,
    paymentGateway: 'Razorpay',
    status: 'success',
    description: 'Commercial Booking for Kabir Mehra (1 Day)',
    createdAt: '2026-06-14T15:45:00Z',
    invoiceId: 'MVI-2026-1040'
  },
  {
    id: 'p_3',
    userId: 'c_test',
    userName: 'Premium Agency (Test Client)',
    amount: 199,
    paymentGateway: 'Razorpay',
    status: 'success',
    description: 'Premium Profile Unlock for Priya Sharma',
    createdAt: '2026-06-20T08:05:00Z',
    invoiceId: 'MVI-PRE-1002'
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'c1',
    receiverId: 'u_p_sharma',
    content: 'Hi Priya, we loved your portfolio slides. Are you available for a heritage shoot in Jaipur around July 10th?',
    timestamp: '2026-06-11T11:00:00Z',
    isRead: true,
    bookingId: 'bk_1'
  },
  {
    id: 'msg_2',
    senderId: 'u_p_sharma',
    receiverId: 'c1',
    content: 'Hi Manish! Thank you so much. Yes, July 10th to 13th is currently free in my calendar. I would be thrilled to work on this!',
    timestamp: '2026-06-11T11:15:00Z',
    isRead: true,
    bookingId: 'bk_1'
  },
  {
    id: 'msg_3',
    senderId: 'c1',
    receiverId: 'u_p_sharma',
    content: 'Excellent, I will submit the official booking request and initiate the escrow deposit now!',
    timestamp: '2026-06-11T11:30:00Z',
    isRead: true,
    bookingId: 'bk_1'
  },
  {
    id: 'msg_4',
    senderId: 'c2',
    receiverId: 'u_k_mehra',
    content: 'Hi Kabir, doing a Cult.Sport winter compression wear campaign in Bangalore. Single day shoot.',
    timestamp: '2026-06-14T14:40:00Z',
    isRead: true,
    bookingId: 'bk_2'
  },
  {
    id: 'msg_5',
    senderId: 'u_k_mehra',
    receiverId: 'c2',
    content: 'Awesome! That sounds perfect. I am fully fit and ready to fly down to Bangalore. Let\'s do it.',
    timestamp: '2026-06-14T15:00:00Z',
    isRead: true,
    bookingId: 'bk_2'
  }
];

const SEED_PAYOUTS: Payout[] = [
  {
    id: 'pay_1',
    bookingId: 'bk_1',
    brandName: 'Sabyasachi Couture',
    modelId: 'm1',
    modelName: 'Priya Sharma',
    clientId: 'c1',
    clientName: 'Manish Kumar (Sabyasachi)',
    amount: 105000,
    escrowStatus: 'pending_approval',
    createdAt: '2026-06-11T12:00:00Z',
    payoutNotes: 'Campaign successfully completed. Client has marked booking as completed and verified deliverables.'
  },
  {
    id: 'pay_2',
    bookingId: 'bk_2',
    brandName: 'Cult.Sport Athleisure',
    modelId: 'm2',
    modelName: 'Kabir Mehra',
    clientId: 'c2',
    clientName: 'Aman Deep (Cult.fit)',
    amount: 28000,
    escrowStatus: 'escrowed',
    createdAt: '2026-06-14T15:30:00Z',
    payoutNotes: 'Funds held in escrow. Awaiting campaign completion confirmation.'
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    modelId: 'm1',
    modelName: 'Priya Sharma',
    modelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
    caption: 'Walking the ramp for Lakme Fashion Week was an absolute dream! ✨ So grateful to the incredible team and designers who put this masterpiece together. #LFW #Runway #FashionModel #Couture',
    likesCount: 142,
    commentsCount: 18,
    createdAt: '2026-06-28T14:30:00Z',
    likedByMe: false
  },
  {
    id: 'post_2',
    modelId: 'm2',
    modelName: 'Kabir Mehra',
    modelAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    caption: 'Early morning grind. Sweat today, shine tomorrow. 💪 Partnered up with Nike India for their new summer athleisure line. Stay tuned for the official release! 👟⚡ #FitnessModel #Workouts #Activewear #Athlete',
    likesCount: 98,
    commentsCount: 12,
    createdAt: '2026-06-29T08:15:00Z',
    likedByMe: false
  },
  {
    id: 'post_3',
    modelId: 'm3',
    modelName: 'Anjali Rao',
    modelAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=150',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    caption: 'A cup of coffee and some UGC scripting before the camera rolls! ☕🎬 Creating content that speaks to the heart. What brand should I review next? Let me know! 👇 #UGCCreator #ContentCreation #Lifestyle #Aesthetic',
    likesCount: 74,
    commentsCount: 22,
    createdAt: '2026-06-30T11:45:00Z',
    likedByMe: false
  },
  {
    id: 'post_4',
    modelId: 'm5',
    modelName: 'Rhea Kapoor',
    modelAvatar: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=150',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600',
    caption: 'Flawless skin is always in. Behind the scenes from my skincare commercial campaign for Nykaa. The glow is real! ✨💧 #CommercialModel #Skincare #BeautyCampaign #BehindTheScenes',
    likesCount: 120,
    commentsCount: 15,
    createdAt: '2026-07-01T16:20:00Z',
    likedByMe: false
  },
  {
    id: 'post_5',
    modelId: 'm4',
    modelName: 'Vikram Singh',
    modelAvatar: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=150',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600',
    caption: 'Between takes on set. Acting is not about being someone different. It’s about finding the similarity in what is apparently different, then finding myself in there. 🎬🎭 #ActorLife #ShootDays #BehindTheCamera #OTTSeries',
    likesCount: 112,
    commentsCount: 9,
    createdAt: '2026-07-02T10:00:00Z',
    likedByMe: false
  }
];

// Helper to load/save state with localStorage
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('mvi_models')) {
    localStorage.setItem('mvi_models', JSON.stringify(SEED_MODELS));
  }
  if (!localStorage.getItem('mvi_reviews')) {
    localStorage.setItem('mvi_reviews', JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem('mvi_blogs')) {
    localStorage.setItem('mvi_blogs', JSON.stringify(SEED_BLOGS));
  }
  if (!localStorage.getItem('mvi_bookings')) {
    localStorage.setItem('mvi_bookings', JSON.stringify(SEED_BOOKINGS));
  }
  if (!localStorage.getItem('mvi_payments')) {
    localStorage.setItem('mvi_payments', JSON.stringify(SEED_PAYMENTS));
  }
  if (!localStorage.getItem('mvi_messages')) {
    localStorage.setItem('mvi_messages', JSON.stringify(SEED_MESSAGES));
  }
  if (!localStorage.getItem('mvi_unlocked_profiles')) {
    // Stores unlocked profile model IDs format: ['m1', 'm2']
    localStorage.setItem('mvi_unlocked_profiles', JSON.stringify(['m4', 'm6'])); // some are free/purchased
  }
  if (!localStorage.getItem('mvi_payouts')) {
    localStorage.setItem('mvi_payouts', JSON.stringify(SEED_PAYOUTS));
  }
  if (!localStorage.getItem('mvi_posts')) {
    localStorage.setItem('mvi_posts', JSON.stringify(SEED_POSTS));
  }
}

// Global invocation of LocalStorage initialization
initializeLocalStorage();

// Self-healing database helpers to ensure referential integrity before saves
async function ensureUserExistsInDb(userId: string, name?: string, email?: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  try {
    const { data, error } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!error && data) {
      return;
    }
    const local = localStorage.getItem('mvi_users');
    const localUsers: User[] = local ? JSON.parse(local) : SEED_USERS;
    const existing = localUsers.find(u => u.id === userId) || SEED_USERS.find(u => u.id === userId);
    const userToInsert: User = existing || {
      id: userId,
      role: 'client',
      name: name || 'Demo Client',
      email: email || 'client@modelverse.in',
      phone: '+91 98765 43210',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await supabase.from('profiles').upsert(removeUndefined(userToInsert));
  } catch (err) {
    console.warn(`[Self-healing] Failed to ensure user ${userId} exists in Supabase:`, err);
  }
}

async function ensureModelExistsInDb(modelId: string): Promise<void> {
  if (!isSupabaseAvailable || !supabase) return;
  try {
    const { data, error } = await supabase.from('models').select('id').eq('id', modelId).maybeSingle();
    if (!error && data) {
      return;
    }
    const local = localStorage.getItem('mvi_models');
    const localModels: Model[] = local ? JSON.parse(local) : SEED_MODELS;
    const existing = localModels.find(m => m.id === modelId) || SEED_MODELS.find(m => m.id === modelId);
    if (existing) {
      await supabase.from('models').upsert(removeUndefined(existing));
    }
  } catch (err) {
    console.warn(`[Self-healing] Failed to ensure model ${modelId} exists in Supabase:`, err);
  }
}

export const dbService = {
  auth: {
    onAuthStateChanged(callback: (user: any) => void) {
      if (isSupabaseAvailable && supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
          if (session && session.user) {
            const user = session.user;
            callback({
              email: user.email,
              displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'Google User',
              photoURL: user.user_metadata?.avatar_url || undefined,
              phoneNumber: user.phone || undefined
            });
          } else {
            callback(null);
          }
        });
        return () => {
          subscription.unsubscribe();
        };
      }
      return () => {};
    }
  },
  getCurrentSessionUser(): User | null {
    try {
      const stored = localStorage.getItem('mvi_session_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse current session user', e);
      return null;
    }
  },
  setCurrentSessionUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem('mvi_session_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('mvi_session_user');
      }
    } catch (e) {
      console.error('Failed to set current session user', e);
    }
  },
  async sendPasswordReset(email: string) {
    if (isSupabaseAvailable && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return;
    }
    console.log('Local/mock fallback password reset email triggered for:', email);
  },
  async getUserByEmail(email: string): Promise<User | null> {
    const emailKey = email.toLowerCase().trim();
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', emailKey)
          .maybeSingle();
        if (!error && data) {
          return { ...data, id: data.id || emailKey } as User;
        }
      } catch (e) {
        console.error('Supabase query user by email failed', e);
      }
    }
    // Fallback to local storage or seed data
    const local = localStorage.getItem('mvi_users');
    const localUsers: User[] = local ? JSON.parse(local) : SEED_USERS;
    return localUsers.find(u => u.email.toLowerCase() === emailKey) || null;
  },
  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: any; error?: any }> {
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return { user: null, error };
        return { user: data.user };
      } catch (err) {
        return { user: null, error: err };
      }
    }
    return { user: null };
  },
  async signUpWithEmailAndPassword(email: string, password: string, name: string, role: string, phone?: string): Promise<{ user: any; error?: any }> {
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name,
              role,
              phone: phone || ''
            }
          }
        });
        if (error) return { user: null, error };
        return { user: data.user };
      } catch (err) {
        return { user: null, error: err };
      }
    }
    return { user: null };
  },
  async signInWithGoogle(selectedRole: UserRole = 'client'): Promise<{ user: any }> {
    if (isSupabaseAvailable && supabase) {
      const redirectTo = `${window.location.origin}/oauth-callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data?.url) {
        throw new Error('Could not retrieve Google OAuth authorization URL.');
      }

      // Open OAuth URL in popup
      const popup = window.open(data.url, 'google_login', 'width=600,height=650,scrollbars=yes');
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site to sign in with Google.');
      }

      // Wait for postMessage or fallback completion
      return new Promise<{ user: any }>((resolve, reject) => {
        let isResolved = false;
        
        const handleMessage = async (event: MessageEvent) => {
          const origin = event.origin;
          if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
            return;
          }

          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            const hash = event.data.hash || '';
            const params = new URLSearchParams(hash.replace('#', '?'));
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token) {
              try {
                const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                  access_token,
                  refresh_token: refresh_token || '',
                });

                if (sessionErr) throw sessionErr;
                const user = sessionData.user;
                if (user) {
                  isResolved = true;
                  window.removeEventListener('message', handleMessage);
                  resolve({
                    user: {
                      email: user.email,
                      displayName: user.user_metadata?.full_name || user.user_metadata?.name || 'Google User',
                      photoURL: user.user_metadata?.avatar_url || undefined,
                      phoneNumber: user.phone || undefined
                    }
                  });
                }
              } catch (err) {
                console.error('Failed to set Supabase session from OAuth callback:', err);
                reject(err);
              }
            }
          }
        };

        window.addEventListener('message', handleMessage);

        // Polling check to detect if user manually closed the popup
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            setTimeout(() => {
              if (!isResolved) {
                window.removeEventListener('message', handleMessage);
                reject(new Error('Sign-in popup was closed before completion.'));
              }
            }, 1000);
          }
        }, 1000);
      });
    }

    const email = selectedRole === 'admin' ? 'admin@modelverse.in' : (selectedRole === 'model' ? 'model@modelverse.in' : 'client@modelverse.in');
    return {
      user: {
        email,
        displayName: selectedRole === 'admin' ? 'Super Admin' : (selectedRole === 'model' ? 'Pooja Hegde' : 'Demo Client'),
        photoURL: selectedRole === 'admin' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' : undefined,
        phoneNumber: '+91 98765 43210'
      }
    };
  },
  async logOut() {
    this.setCurrentSessionUser(null);
    if (isSupabaseAvailable && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },

  // REAL-TIME COLLECTIONS SUBSCRIPTIONS
  subscribeToModels(callback: (models: Model[]) => void): () => void {
    if (isSupabaseAvailable && supabase) {
      const channel = supabase
        .channel('schema-db-changes-models')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'models' },
          async () => {
            const fresh = await this.getModels();
            callback(fresh);
          }
        )
        .subscribe();

      this.getModels().then(callback);

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      this.getModels().then(callback);
      return () => {};
    }
  },

  subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
    if (isSupabaseAvailable && supabase) {
      const channel = supabase
        .channel('schema-db-changes-bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          async () => {
            const fresh = await this.getBookings();
            callback(fresh);
          }
        )
        .subscribe();

      this.getBookings().then(callback);

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      this.getBookings().then(callback);
      return () => {};
    }
  },

  // GET MODELS
  async getModels(): Promise<Model[]> {
    let dbModels: Model[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('models').select('*');
        if (!error && data) {
          dbModels = data as Model[];
        }
      } catch (e) {
        console.error('Supabase models fetch failed, using fallback', e);
      }
    }
    const local = localStorage.getItem('mvi_models');
    const localModels: Model[] = local ? JSON.parse(local) : SEED_MODELS;

    const mergedMap = new Map<string, Model>();
    SEED_MODELS.forEach(m => mergedMap.set(m.id, m));
    localModels.forEach(m => mergedMap.set(m.id, m));
    dbModels.forEach(m => mergedMap.set(m.id, m));

    return Array.from(mergedMap.values()).map(m => ({
      ...m,
      available: m.available !== undefined ? m.available : (m.availabilityStatus === 'Available')
    }));
  },

  // ADD OR UPDATE MODEL
  async saveModel(model: Model): Promise<void> {
    try {
      const models = await this.getModels();
      const idx = models.findIndex(m => m.id === model.id);
      if (idx >= 0) {
        models[idx] = model;
      } else {
        models.push(model);
      }
      localStorage.setItem('mvi_models', JSON.stringify(models));
    } catch (localErr) {
      console.error('Local storage saveModel failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('models')
          .upsert(removeUndefined(model));
        if (error) throw error;
        console.log(`Successfully upserted model details for ${model.id} in Supabase`);
      } catch (e) {
        console.warn('Supabase saveModel failed, falling back to local storage and memory:', e);
      }
    }
  },

  // BOOKINGS
  async getBookings(): Promise<Booking[]> {
    let dbBookings: Booking[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*');
        if (!error && data) {
          dbBookings = data as Booking[];
        }
      } catch (e) {
        console.error('Supabase bookings fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_bookings');
    const localBookings: Booking[] = local ? JSON.parse(local) : SEED_BOOKINGS;

    const mergedMap = new Map<string, Booking>();
    SEED_BOOKINGS.forEach(b => mergedMap.set(b.id, b));
    localBookings.forEach(b => mergedMap.set(b.id, b));
    dbBookings.forEach(b => mergedMap.set(b.id, b));

    return Array.from(mergedMap.values());
  },

  async addBooking(booking: Booking): Promise<void> {
    try {
      const bookings = await this.getBookings();
      bookings.push(booking);
      localStorage.setItem('mvi_bookings', JSON.stringify(bookings));
    } catch (localErr) {
      console.error('Local storage addBooking failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        await ensureUserExistsInDb(booking.clientId, booking.clientName);
        await ensureModelExistsInDb(booking.modelId);
        const { error } = await supabase
          .from('bookings')
          .insert(removeUndefined(booking));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase bookings save failed (falling back to local):', e);
      }
    }

    const introMsg: Message = {
      id: `msg_auto_${Date.now()}_1`,
      senderId: booking.clientId,
      receiverId: booking.modelId,
      content: `📦 NEW BOOKING REQUEST:\n\nBrand: ${booking.projectDetails.brandName}\nShoot: ${booking.projectDetails.shootType}\nDate: ${booking.projectDetails.date}\nDuration: ${booking.projectDetails.duration}\nBudget: ${booking.projectDetails.budgetRange}\nNotes: ${booking.projectDetails.notes || 'None'}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      bookingId: booking.id
    };
    await this.addMessage(introMsg);
  },

  async updateBookingStatus(bookingId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed'): Promise<void> {
    try {
      const bookings = await this.getBookings();
      const idx = bookings.findIndex(b => b.id === bookingId);
      if (idx >= 0) {
        bookings[idx].status = status;
        localStorage.setItem('mvi_bookings', JSON.stringify(bookings));

        const clientMsg: Message = {
          id: `msg_sys_${Date.now()}`,
          senderId: 'system',
          receiverId: bookings[idx].clientId,
          content: `🔔 Status update: Priya Sharma has updated booking of ${bookings[idx].projectDetails.brandName} to "${status.toUpperCase()}".`,
          timestamp: new Date().toISOString(),
          isRead: false,
          bookingId: bookingId
        };
        await this.addMessage(clientMsg);
      }
    } catch (localErr) {
      console.error('Local storage updateBookingStatus failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', bookingId);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase bookings update status failed (falling back to local):', e);
      }
    }
  },

  async updateBookingPdfSummary(bookingId: string, pdfSummaryUrl: string, isSharedWithClient: boolean): Promise<void> {
    try {
      const bookings = await this.getBookings();
      const idx = bookings.findIndex(b => b.id === bookingId);
      if (idx >= 0) {
        bookings[idx].pdfSummaryUrl = pdfSummaryUrl;
        bookings[idx].pdfGeneratedAt = new Date().toISOString();
        bookings[idx].isSharedWithClient = isSharedWithClient;
        localStorage.setItem('mvi_bookings', JSON.stringify(bookings));
      }
    } catch (localErr) {
      console.error('Local storage updateBookingPdfSummary failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ 
            pdfSummaryUrl, 
            pdfGeneratedAt: new Date().toISOString(), 
            isSharedWithClient 
          })
          .eq('id', bookingId);
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase bookings update PDF summary failed (falling back to local):', e);
      }
    }
  },

  // PAYMENTS
  async getPayments(): Promise<PaymentRecord[]> {
    let dbPayments: PaymentRecord[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*');
        if (!error && data) {
          dbPayments = data as PaymentRecord[];
        }
      } catch (e) {
        console.error('Supabase payments fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_payments');
    const localPayments: PaymentRecord[] = local ? JSON.parse(local) : SEED_PAYMENTS;

    const mergedMap = new Map<string, PaymentRecord>();
    SEED_PAYMENTS.forEach(p => mergedMap.set(p.id, p));
    localPayments.forEach(p => mergedMap.set(p.id, p));
    dbPayments.forEach(p => mergedMap.set(p.id, p));

    return Array.from(mergedMap.values());
  },

  async addPayment(payment: PaymentRecord): Promise<void> {
    try {
      const payments = await this.getPayments();
      payments.push(payment);
      localStorage.setItem('mvi_payments', JSON.stringify(payments));
    } catch (localErr) {
      console.error('Local storage addPayment failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        await ensureUserExistsInDb(payment.userId, payment.userName, payment.userEmail);
        if (payment.modelId) {
          await ensureModelExistsInDb(payment.modelId);
        }
        const { error } = await supabase
          .from('payments')
          .insert(removeUndefined(payment));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase payments add failed (falling back to local):', e);
      }
    }
  },

  // PREMIUM ACCESSIBILITY LIST
  getUnlockedProfiles(): string[] {
    const local = localStorage.getItem('mvi_unlocked_profiles');
    return local ? JSON.parse(local) : ['m4', 'm6'];
  },

  unlockProfile(modelId: string): void {
    const unlocked = this.getUnlockedProfiles();
    if (!unlocked.includes(modelId)) {
      unlocked.push(modelId);
      localStorage.setItem('mvi_unlocked_profiles', JSON.stringify(unlocked));
    }
  },

  // USER FAVORITES SYNCHRONIZATION
  async getUserFavorites(userId: string): Promise<string[] | null> {
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('favorites')
          .eq('id', userId)
          .maybeSingle();
        if (!error && data) {
          return data.favorites || [];
        }
      } catch (e) {
        console.error('Supabase fetch favorites failed:', e);
      }
    }
    return null;
  },

  async saveUserFavorites(userId: string, favorites: string[]): Promise<void> {
    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            favorites,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      } catch (e) {
        console.error('Supabase save favorites failed:', e);
      }
    }
  },

  // MESSAGES
  async getMessages(): Promise<Message[]> {
    let dbMessages: Message[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('messages').select('*');
        if (!error && data) {
          dbMessages = data as Message[];
        }
      } catch (e) {
        console.error('Supabase messages fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_messages');
    const localMessages: Message[] = local ? JSON.parse(local) : SEED_MESSAGES;

    const mergedMap = new Map<string, Message>();
    SEED_MESSAGES.forEach(m => mergedMap.set(m.id, m));
    localMessages.forEach(m => mergedMap.set(m.id, m));
    dbMessages.forEach(m => mergedMap.set(m.id, m));

    return Array.from(mergedMap.values());
  },

  async addMessage(msg: Message): Promise<void> {
    try {
      const msgs = await this.getMessages();
      msgs.push(msg);
      localStorage.setItem('mvi_messages', JSON.stringify(msgs));
    } catch (localErr) {
      console.error('Local storage addMessage failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        if (msg.senderId && msg.senderId !== 'system') {
          if (msg.senderId.startsWith('m')) {
            await ensureModelExistsInDb(msg.senderId);
          } else {
            await ensureUserExistsInDb(msg.senderId);
          }
        }
        if (msg.receiverId && msg.receiverId !== 'system') {
          if (msg.receiverId.startsWith('m')) {
            await ensureModelExistsInDb(msg.receiverId);
          } else {
            await ensureUserExistsInDb(msg.receiverId);
          }
        }
        const { error } = await supabase
          .from('messages')
          .insert(removeUndefined(msg));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase messaging save failed (falling back to local):', e);
      }
    }
  },

  // REVIEWS
  async getReviews(modelId: string): Promise<Review[]> {
    let dbReviews: Review[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('modelId', modelId);
        if (!error && data) {
          dbReviews = data as Review[];
        }
      } catch (e) {
        console.error('Supabase review query failed', e);
      }
    }
    const local = localStorage.getItem('mvi_reviews');
    const localReviews: Review[] = local ? JSON.parse(local) : SEED_REVIEWS;

    const mergedMap = new Map<string, Review>();
    SEED_REVIEWS.forEach(r => mergedMap.set(r.id, r));
    localReviews.forEach(r => mergedMap.set(r.id, r));
    dbReviews.forEach(r => mergedMap.set(r.id, r));

    const all = Array.from(mergedMap.values());
    return all.filter(r => r.modelId === modelId);
  },

  async addReview(review: Review): Promise<void> {
    try {
      const local = localStorage.getItem('mvi_reviews');
      const reviews: Review[] = local ? JSON.parse(local) : SEED_REVIEWS;
      reviews.push(review);
      localStorage.setItem('mvi_reviews', JSON.stringify(reviews));

      const models = await this.getModels();
      const mIdx = models.findIndex(m => m.id === review.modelId);
      if (mIdx >= 0) {
        const currentModelReviews = reviews.filter(r => r.modelId === review.modelId);
        const totalRating = currentModelReviews.reduce((sum, r) => sum + r.rating, 0);
        models[mIdx].rating = Number((totalRating / currentModelReviews.length).toFixed(1));
        models[mIdx].reviewsCount = currentModelReviews.length;
        await this.saveModel(models[mIdx]);
      }
    } catch (localErr) {
      console.error('Local storage addReview failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        await ensureUserExistsInDb(review.clientId, review.clientName);
        await ensureModelExistsInDb(review.modelId);
        const { error } = await supabase
          .from('reviews')
          .insert(removeUndefined(review));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase review save failed (falling back to local):', e);
      }
    }
  },

  // SOCIAL FEED POSTS
  async getPosts(): Promise<Post[]> {
    let dbPosts: Post[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('posts').select('*');
        if (!error && data) {
          dbPosts = data.map((p: any) => ({
            id: p.id,
            modelId: p.model_id || p.modelId,
            modelName: p.model_name || p.modelName,
            modelAvatar: p.model_avatar || p.modelAvatar,
            imageUrl: p.image_url || p.imageUrl,
            caption: p.caption,
            likesCount: p.likes_count || p.likesCount || 0,
            commentsCount: p.comments_count || p.commentsCount || 0,
            createdAt: p.created_at || p.createdAt,
            likedByMe: p.likedByMe || false
          }));
        }
      } catch (e) {
        console.error('Supabase posts fetch failed, using fallback', e);
      }
    }
    const local = localStorage.getItem('mvi_posts');
    const localPosts: Post[] = local ? JSON.parse(local) : SEED_POSTS;
    
    const mergedMap = new Map<string, Post>();
    localPosts.forEach(p => mergedMap.set(p.id, p));
    dbPosts.forEach(p => mergedMap.set(p.id, p));
    
    return Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async savePost(post: Post): Promise<void> {
    try {
      const posts = await this.getPosts();
      const idx = posts.findIndex(p => p.id === post.id);
      if (idx >= 0) {
        posts[idx] = post;
      } else {
        posts.unshift(post);
      }
      localStorage.setItem('mvi_posts', JSON.stringify(posts));
    } catch (localErr) {
      console.error('Local storage savePost failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        if (post.modelId) {
          await ensureModelExistsInDb(post.modelId);
        }
        const { error } = await supabase
          .from('posts')
          .upsert({
            id: post.id,
            model_id: post.modelId,
            model_name: post.modelName,
            model_avatar: post.modelAvatar,
            image_url: post.imageUrl,
            caption: post.caption,
            likes_count: post.likesCount,
            comments_count: post.commentsCount,
            created_at: post.createdAt
          });
        if (error) console.error('Supabase savePost failed', error);
      } catch (e) {
        console.error('Supabase savePost error', e);
      }
    }
  },

  async toggleLikePost(postId: string): Promise<void> {
    try {
      const posts = await this.getPosts();
      const idx = posts.findIndex(p => p.id === postId);
      if (idx >= 0) {
        const post = posts[idx];
        const liked = !post.likedByMe;
        post.likedByMe = liked;
        post.likesCount = liked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
        posts[idx] = post;
        localStorage.setItem('mvi_posts', JSON.stringify(posts));
        
        if (isSupabaseAvailable && supabase) {
          await supabase
            .from('posts')
            .update({
              likes_count: post.likesCount
            })
            .eq('id', postId);
        }
      }
    } catch (e) {
      console.error('Failed to toggle like on post', e);
    }
  },

  // BLOG ITEMS
  async getBlogs(): Promise<BlogItem[]> {
    const local = localStorage.getItem('mvi_blogs');
    return local ? JSON.parse(local) : SEED_BLOGS;
  },

  // USERS
  async getUsers(): Promise<User[]> {
    let dbUsers: User[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
          dbUsers = data as User[];
        }
      } catch (e) {
        console.error('Supabase users fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_users');
    const localUsers: User[] = local ? JSON.parse(local) : SEED_USERS;

    const mergedMap = new Map<string, User>();
    SEED_USERS.forEach(u => mergedMap.set(u.id, u));
    localUsers.forEach(u => mergedMap.set(u.id, u));
    dbUsers.forEach(u => mergedMap.set(u.id, u));

    return Array.from(mergedMap.values());
  },

  async saveUser(user: User): Promise<void> {
    try {
      const users = await this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem('mvi_users', JSON.stringify(users));
    } catch (localErr) {
      console.error('Local storage saveUser failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(removeUndefined(user));
        if (error) throw error;
        console.log(`Successfully saved user profile for ${user.id} in Supabase`);
      } catch (e: any) {
        console.warn('Supabase user save failed, falling back to local storage:', e);
      }
    }
  },

  async getUser(userId: string): Promise<User | null> {
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          return data as User;
        }
      } catch (e: any) {
        console.warn(`Failed to fetch user ${userId} directly from Supabase, falling back to compiled memory:`, e);
      }
    }
    const users = await this.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  async registerCredentials(email: string, role: string): Promise<void> {
    const emailKey = email.toLowerCase().trim();
    const creds = JSON.parse(localStorage.getItem('mvi_credentials') || '{}');
    creds[emailKey] = { role };
    localStorage.setItem('mvi_credentials', JSON.stringify(creds));

    if (isSupabaseAvailable && supabase) {
      try {
        const existing = await this.getUserByEmail(emailKey);
        if (existing) {
          if (existing.role !== role) {
            existing.role = role as any;
            await this.saveUser(existing);
          }
        } else {
          const stubUser: User = {
            id: `u_stub_${Date.now()}`,
            email: emailKey,
            role: role as any,
            name: emailKey.split('@')[0],
            phone: '+91 90000 00000',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          await this.saveUser(stubUser);
        }
      } catch (err) {
        console.error('Failed to register credential to Supabase:', err);
      }
    }
  },

  async getCredentials(email: string): Promise<{ role: string } | null> {
    const emailKey = email.toLowerCase().trim();
    const creds = JSON.parse(localStorage.getItem('mvi_credentials') || '{}');
    if (creds[emailKey]) {
      return creds[emailKey];
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const user = await this.getUserByEmail(emailKey);
        if (user) {
          return { role: user.role };
        }
      } catch (err) {
        console.error('Failed to get credential from Supabase:', err);
      }
    }
    return null;
  },

  async verifyPaymentRecordBySessionId(sessionId: string): Promise<PaymentRecord | null> {
    if (!sessionId) return null;

    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('sessionId', sessionId)
          .maybeSingle();
        if (!error && data) {
          return data as PaymentRecord;
        }
      } catch (e) {
        console.error('Supabase verifyPaymentRecordBySessionId query failed', e);
      }
    }

    try {
      const allPayments = await this.getPayments();
      const match = allPayments.find(p => p.sessionId === sessionId);
      return match || null;
    } catch (err) {
      console.error('Local fallback for verifying payment record failed:', err);
      return null;
    }
  },

  async verifySessionAndUnlockProfile(modelId: string, sessionId: string): Promise<boolean> {
    if (!sessionId || !modelId) return false;

    const paymentRecord = await this.verifyPaymentRecordBySessionId(sessionId);

    if (paymentRecord && paymentRecord.status === 'success' && paymentRecord.modelId === modelId) {
      this.unlockProfile(modelId);
      return true;
    }

    return false;
  },

  // AUDIT LOGS
  subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): () => void {
    if (isSupabaseAvailable && supabase) {
      const channel = supabase
        .channel('schema-db-changes-audit-logs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'audit_logs' },
          async () => {
            const fresh = await this.getAuditLogs();
            callback(fresh);
          }
        )
        .subscribe();

      this.getAuditLogs().then(callback);

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      this.getAuditLogs().then(callback);
      return () => {};
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    let dbLogs: AuditLog[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*');
        if (!error && data) {
          dbLogs = data as AuditLog[];
        }
      } catch (e) {
        console.error('Supabase audit logs fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_audit_logs');
    const localLogs: AuditLog[] = local ? JSON.parse(local) : SEED_AUDIT_LOGS;

    const mergedMap = new Map<string, AuditLog>();
    SEED_AUDIT_LOGS.forEach(l => mergedMap.set(l.id, l));
    localLogs.forEach(l => mergedMap.set(l.id, l));
    dbLogs.forEach(l => mergedMap.set(l.id, l));

    return Array.from(mergedMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<void> {
    const fullLog: AuditLog = {
      id: log.id || `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      action: log.action,
      performedBy: log.performedBy || 'System Admin',
      details: log.details,
      entityId: log.entityId,
      entityType: log.entityType
    };

    try {
      const logs = await this.getAuditLogs();
      logs.unshift(fullLog);
      localStorage.setItem('mvi_audit_logs', JSON.stringify(logs));
    } catch (localErr) {
      console.error('Local storage addAuditLog failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        const { error } = await supabase
          .from('audit_logs')
          .insert(removeUndefined(fullLog));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase auditLogs add failed (falling back to local):', e);
      }
    }
  },

  // PAYOUTS METHODS
  subscribeToPayouts(callback: (payouts: Payout[]) => void): () => void {
    if (isSupabaseAvailable && supabase) {
      const channel = supabase
        .channel('schema-db-changes-payouts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'payouts' },
          async () => {
            const fresh = await this.getPayouts();
            callback(fresh);
          }
        )
        .subscribe();

      this.getPayouts().then(callback);

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      this.getPayouts().then(callback);
      return () => {};
    }
  },

  async getPayouts(): Promise<Payout[]> {
    let dbPayouts: Payout[] = [];
    if (isSupabaseAvailable && supabase) {
      try {
        const { data, error } = await supabase.from('payouts').select('*');
        if (!error && data) {
          dbPayouts = data as Payout[];
        }
      } catch (e) {
        console.error('Supabase payouts fetch failed', e);
      }
    }
    const local = localStorage.getItem('mvi_payouts');
    const localPayouts: Payout[] = local ? JSON.parse(local) : SEED_PAYOUTS;

    const mergedMap = new Map<string, Payout>();
    SEED_PAYOUTS.forEach(p => mergedMap.set(p.id, p));
    localPayouts.forEach(p => mergedMap.set(p.id, p));
    dbPayouts.forEach(p => mergedMap.set(p.id, p));

    return Array.from(mergedMap.values());
  },

  async savePayout(payout: Payout): Promise<void> {
    try {
      const payouts = await this.getPayouts();
      const idx = payouts.findIndex(p => p.id === payout.id);
      if (idx >= 0) {
        payouts[idx] = payout;
      } else {
        payouts.push(payout);
      }
      localStorage.setItem('mvi_payouts', JSON.stringify(payouts));
    } catch (localErr) {
      console.error('Local storage savePayout failed:', localErr);
    }

    if (isSupabaseAvailable && supabase) {
      try {
        await ensureUserExistsInDb(payout.clientId, payout.clientName);
        await ensureModelExistsInDb(payout.modelId);
        const { error } = await supabase
          .from('payouts')
          .upsert(removeUndefined(payout));
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase payouts save failed (falling back to local):', e);
      }
    }
  },

  async updatePayoutStatus(payoutId: string, status: PayoutStatus, reference?: string, notes?: string): Promise<void> {
    const payouts = await this.getPayouts();
    const match = payouts.find(p => p.id === payoutId);
    if (match) {
      match.escrowStatus = status;
      if (status === 'released') {
        match.releasedAt = new Date().toISOString();
        if (reference) match.transactionReference = reference;
      }
      if (notes) match.payoutNotes = notes;

      await this.savePayout(match);

      await this.addAuditLog({
        action: `Payout Status: ${status.toUpperCase()}`,
        details: `Payout of ₹${match.amount.toLocaleString('en-IN')} for campaign "${match.brandName}" to model ${match.modelName} was updated to ${status}.${reference ? ` Tx Ref: ${reference}` : ''}`,
        entityId: payoutId,
        entityType: 'payout'
      });
    }
  },

  async testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseAvailable || !supabase) {
      return { success: false, error: 'Supabase JS client is not initialized in the web browser.' };
    }
    try {
      const { error } = await supabase.from('models').select('id').limit(1);
      if (error) {
        // If table doesn't exist, it's still a successful connection but schema needs setup
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          return { success: true, error: 'CONNECTED_NO_TABLES' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }
};

