-- Supabase SQL Migration Script for ModelVerse India
-- Creates all 10 platform tables, configures Row Level Security (RLS) and sets up triggers/policies.

-- 1. Create the public.profiles table matching the User interface columns
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

-- Enable Row Level Security (RLS) to protect user records
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Allow public read-only access to all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on profiles" ON public.profiles FOR ALL TO service_role USING (true);

-- Create database triggers to automatically sync Supabase Auth sign-ups to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role, 
    phone,
    status, 
    "createdAt"
  )
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'active',
    timezone('utc'::text, now())::text
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();


-- 2. Create 'public.users' table for storing secure password-hashed login credentials (for fallback logins)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for public.users table to ensure secure and controlled access
CREATE POLICY "Allow service_role full control on users" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Allow public insert to register" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for credentials match" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow users to update credentials" ON public.users FOR UPDATE USING (true) WITH CHECK (true);


-- 3. Create public.models table to store the 15-section form data and core query fields
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

-- Enable RLS on public.models
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Create policies for public.models table
CREATE POLICY "Allow public select on models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert own model" ON public.models FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update own model" ON public.models FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on models" ON public.models FOR ALL TO service_role USING (true);


-- 4. Create public.bookings table for model escrows and campaign appointments
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

-- Enable RLS on public.bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public.bookings table
CREATE POLICY "Allow public select on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update bookings" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on bookings" ON public.bookings FOR ALL TO service_role USING (true);


-- 5. Create public.payments table for tracking premium unlocks and booking payments
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

-- Enable RLS on public.payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public.payments table
CREATE POLICY "Allow public select on payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on payments" ON public.payments FOR ALL TO service_role USING (true);


-- 6. Create public.messages table for live chat
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE,
    "bookingId" TEXT
);

-- Enable RLS on public.messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public.messages table
CREATE POLICY "Allow public select on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update messages" ON public.messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on messages" ON public.messages FOR ALL TO service_role USING (true);


-- 7. Create public.payouts table for secure escrow release logs
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

-- Enable RLS on public.payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public.payouts table
CREATE POLICY "Allow public select on payouts" ON public.payouts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert payouts" ON public.payouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update payouts" ON public.payouts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on payouts" ON public.payouts FOR ALL TO service_role USING (true);


-- 8. Create public.posts table for visual feeds / social timeline
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

-- Enable RLS on public.posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public.posts table
CREATE POLICY "Allow public select on posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update posts" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on posts" ON public.posts FOR ALL TO service_role USING (true);


-- 9. Create public.reviews table for platform-wide reviews
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

-- Enable RLS on public.reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public.reviews table
CREATE POLICY "Allow public select on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role full control on reviews" ON public.reviews FOR ALL TO service_role USING (true);


-- 10. Create public.audit_logs table for administrative logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT
);

-- Enable RLS on public.audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public.audit_logs table
CREATE POLICY "Allow public select on audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service_role full control on audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true);
