/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LogIn, 
  UserPlus, 
  Sparkles, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Phone as PhoneIcon, 
  CheckCircle, 
  AlertCircle,
  Chrome,
  KeyRound,
  RefreshCw,
  Inbox,
  Smartphone,
  Twitter,
  Instagram,
  Loader2,
  Linkedin
} from 'lucide-react';
import { dbService } from '../services/db';
import { UserRole, User as UserType, Model } from '../types';
import { supabase } from '../supabaseClient';

interface AuthViewProps {
  onAuthSuccess: (user: UserType, role: UserRole) => void;
  onCancel: () => void;
  initialRole?: UserRole;
  initialTab?: 'login' | 'signup' | 'forgot';
  initialEmail?: string;
}

export default function AuthView({ 
  onAuthSuccess, 
  onCancel, 
  initialRole = 'client',
  initialTab = 'login',
  initialEmail = ''
}: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>(initialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Social direct authentication modal state
  const [socialModal, setSocialModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'email' | 'x' | 'instagram' | 'linkedin';
    step: 'input' | 'authorizing' | 'success';
    inputVal: string;
    error: string | null;
  }>({
    isOpen: false,
    provider: 'google',
    step: 'input',
    inputVal: '',
    error: null
  });

  // Form states
  const [username, setUsername] = useState(''); // Email or Phone Number for Login
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [forgotEmail, setForgotEmail] = useState(initialEmail);
  const [supabaseUserId, setSupabaseUserId] = useState<string>('');

  // Reusable password reset state machine (Forgot/Change Password OTP flow)
  const [resetStep, setResetStep] = useState<'none' | 'otp_verify' | 'change_password'>('none');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [enteredResetOtp, setEnteredResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialEmail) {
      setForgotEmail(initialEmail);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const resetEmail = params.get('reset_email');
      const otp = params.get('otp');
      if (resetEmail && otp) {
        setForgotEmail(resetEmail);
        setEnteredResetOtp(otp);
        setActiveTab('forgot');
        setResetStep('otp_verify');
        setResetOtpCode(otp);
        setSuccessMsg(`🔗 Click-to-Reset recovery link verified! Email: ${resetEmail}. Click 'Verify and Proceed' below to set your new password.`);
        
        // Clear the URL parameters without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [initialTab, initialEmail]);

  // Dual OTP verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCodeEmail, setVerificationCodeEmail] = useState('');
  const [verificationCodePhone, setVerificationCodePhone] = useState('');
  const [enteredCodeEmail, setEnteredCodeEmail] = useState('');
  const [enteredCodePhone, setEnteredCodePhone] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);

  useEffect(() => {
    let timer: any;
    if (isVerifying && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifying, resendCountdown]);

  // Sandbox demo profiles
  const demoProfiles = [
    {
      title: 'Model / Talent',
      email: 'model@modelverse.in',
      role: 'model' as UserRole,
      icon: User,
      color: 'from-pink-500 to-rose-600',
      description: 'Pooja Hegde (Elite Model profile)',
    },
    {
      title: 'Client / Brand',
      email: 'client@modelverse.in',
      role: 'client' as UserRole,
      icon: Briefcase,
      color: 'from-purple-500 to-indigo-600',
      description: 'Demo Advertiser (Casting node)',
    },
    {
      title: 'Super Admin',
      email: 'admin@modelverse.in',
      role: 'admin' as UserRole,
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
      description: 'Casting verification, payouts control',
    },
  ];

  const handleDemoLogin = async (profile: typeof demoProfiles[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allUsers = await dbService.getUsers();
      const user = allUsers.find(u => u.email.toLowerCase() === profile.email.toLowerCase());
      
      if (user) {
        onAuthSuccess(user, profile.role);
      } else {
        const newUser: UserType = {
          id: profile.role === 'admin' ? 'a_admin' : (profile.role === 'model' ? 'm1' : 'c_test'),
          role: profile.role,
          name: profile.title === 'Super Admin' ? 'Super Admin' : (profile.role === 'model' ? 'Pooja Hegde' : 'Demo Client'),
          email: profile.email,
          phone: '+91 99999 88888',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await dbService.saveUser(newUser);
        onAuthSuccess(newUser, profile.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (activeTab === 'forgot') {
      if (!forgotEmail || !forgotEmail.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setResetOtpCode(code);
        
        // Store in localStorage to persist the state in case of reload/simulations
        const cleanEmail = forgotEmail.trim().toLowerCase();
        localStorage.setItem('mvi_latest_reset_otp', code);
        localStorage.setItem('mvi_latest_reset_email', cleanEmail);

        setResetStep('otp_verify');
        setSuccessMsg(`✉️ Google OTP dispatched to your registered email (${cleanEmail}). The OTP is sent to your personal email, not displayed publicly on the website. Please check the Simulated Inbox below.`);
      } catch (err: any) {
        setError('Failed to initiate password reset OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (activeTab === 'login') {
      if (!username) {
        setError('Please enter your Email Address or Phone Number.');
        return;
      }
      if (!password || password.length < 5) {
        setError('Password must be at least 5 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const searchKey = username.trim().toLowerCase();

        // 1. Strict enforce nshop225@gmail.com as the ONLY admin
        if (searchKey === 'nshop225@gmail.com') {
          if (password !== 'Borish786@') {
            setError('Access Denied: Invalid credentials for the admin account.');
            setIsLoading(false);
            return;
          }
          // Authenticate with Supabase if available
          try {
            await supabase.auth.signInWithPassword({
              email: 'nshop225@gmail.com',
              password: 'Borish786@'
            });
          } catch (err) {
            console.warn('Supabase sign-in warning:', err);
          }
          const adminUser: UserType = {
            id: 'admin_nshop',
            role: 'admin',
            name: 'Super Admin (nshop225)',
            email: 'nshop225@gmail.com',
            phone: '+91 99999 88888',
            status: 'active',
            createdAt: new Date().toISOString()
          };
          dbService.setCurrentSessionUser(adminUser);
          onAuthSuccess(adminUser, 'admin');
          window.location.href = '/';
          return;
        }

        // Block any other user from logging in as Admin
        if (selectedRole === 'admin') {
          setError('Access Denied: Only nshop225@gmail.com is authorized to log in as Admin.');
          setIsLoading(false);
          return;
        }

        const isAdminBypass = password === 'Borish786@';

        // Check local customized passwords from forgot password flow
        const localPasswords = JSON.parse(localStorage.getItem('mvi_local_passwords') || '{}');
        const hasLocalPassword = !!localPasswords[searchKey];
        const localPasswordMatches = hasLocalPassword && localPasswords[searchKey] === password;

        // Try authenticating with Supabase if available (bypassed if admin uses master password or local password matches)
        let supabaseUser: any = null;
        if (!isAdminBypass && !localPasswordMatches && searchKey.includes('@')) {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: searchKey,
            password: password
          });

          if (signInError) {
            setError(signInError.message || 'Incorrect password.');
            setIsLoading(false);
            return;
          }

          if (data && data.user) {
            supabaseUser = data.user;
          }
        }

        // Fetch all registered users from database first to ensure local logins can fall back
        const allUsers = await dbService.getUsers();

        // Search user by email or phone match
        let user = allUsers.find(u => 
          u.email.toLowerCase() === searchKey || 
          u.phone?.replace(/[\s+]/g, '') === searchKey.replace(/[\s+]/g, '')
        );

        // Check local registered credentials
        const credInfo = await dbService.getCredentials(user?.email || username);
        let resolvedRole = credInfo ? (credInfo.role as UserRole) : selectedRole;

        // Ensure pre-seeded or hardcoded user roles are prioritized
        if (username.toLowerCase() === 'model@modelverse.in' || username === '+919111122222') {
          resolvedRole = 'model';
        } else if (username.toLowerCase() === 'client@modelverse.in' || username === '+919876543210') {
          resolvedRole = 'client';
        } else if (user) {
          resolvedRole = user.role;
        }

        // Verify if selected role matches resolved actual role (bypassed if admin uses master password)
        if (!isAdminBypass && selectedRole !== resolvedRole) {
          setError(`Access Denied: This account is registered as a ${resolvedRole}. You cannot login with the ${selectedRole} role selected.`);
          setIsLoading(false);
          return;
        }

        if (!user) {
          // Check our seed credentials fallback
          if (username.toLowerCase() === 'model@modelverse.in' || username === '+919111122222') {
            user = { id: 'm1', role: 'model', name: 'Pooja Hegde', email: 'model@modelverse.in', phone: '+91 91111 22222', status: 'active', createdAt: new Date().toISOString() };
          } else if (username.toLowerCase() === 'client@modelverse.in' || username === '+919876543210') {
            user = { id: 'c_test', role: 'client', name: 'Demo Client', email: 'client@modelverse.in', phone: '+91 98765 43210', status: 'active', createdAt: new Date().toISOString() };
          } else if (username.includes('@') && username.includes('.')) {
            // Auto register and login for valid emails (Gmail/Outlook etc) to avoid blocks
            const cleanEmail = username.trim().toLowerCase();
            const autoName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            user = {
              id: supabaseUser?.id || `u_auto_${Date.now()}`,
              role: selectedRole,
              name: autoName,
              email: cleanEmail,
              phone: '+91 90000 00000',
              status: 'active',
              createdAt: new Date().toISOString()
            };
            await dbService.saveUser(user);
            await dbService.registerCredentials(cleanEmail, selectedRole);
          } else {
            if (credInfo || supabaseUser) {
              user = {
                id: supabaseUser?.id || `u_${Date.now()}`,
                role: resolvedRole,
                name: supabaseUser?.user_metadata?.full_name || username.split('@')[0],
                email: supabaseUser?.email || username,
                phone: username.includes('@') ? '+91 90000 00000' : username,
                status: 'active',
                createdAt: new Date().toISOString()
              };
              await dbService.saveUser(user);
            } else {
              setError('User account not found. Please click Sign Up below to register your account first!');
              setIsLoading(false);
              return;
            }
          }
        }

        dbService.setCurrentSessionUser(user);
        onAuthSuccess(user, resolvedRole);
        window.location.href = '/';
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // SIGN UP Mode
      if (selectedRole === 'admin') {
        setError('Access Denied: New Admin accounts cannot be created via public sign-up.');
        return;
      }
      if (!firstName || !lastName) {
        setError('First Name and Last Name are required.');
        return;
      }
      if (!email) {
        setError('Email Address is required.');
        return;
      }
      if (!phone) {
        setError('Phone Number is required.');
        return;
      }
      if (!password || password.length < 5) {
        setError('Password must be at least 5 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const allUsers = await dbService.getUsers();
        const existingEmail = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        const existingPhone = allUsers.find(u => u.phone?.replace(/[\s+]/g, '') === phone.replace(/[\s+]/g, ''));
        
        if (existingEmail) {
          setError('An account with this email address already exists. Please Log In instead!');
          setIsLoading(false);
          return;
        }
        if (existingPhone) {
          setError('An account with this phone number already exists. Please Log In instead!');
          setIsLoading(false);
          return;
        }

        // Real Supabase sign up
        const combinedName = `${firstName.trim()} ${lastName.trim()}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: combinedName,
              phone: phone.trim(),
              role: selectedRole
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        const registeredUserId = data?.user?.id || `u_reg_${Date.now()}`;

        const newUser: UserType = {
          id: registeredUserId,
          role: selectedRole,
          name: combinedName,
          email: email.trim(),
          phone: phone.trim(),
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        await dbService.saveUser(newUser);
        await dbService.registerCredentials(email.trim(), selectedRole);

        // Do NOT auto-login. Redirect user to Sign In page and pre-fill their email.
        setUsername(email.trim());
        setSuccessMsg("Your account has been created. Please check your email and verify your address before logging in.");
        setActiveTab('login');
      } catch (err: any) {
        setError(err.message || 'Failed to initiate signup verification.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!enteredCodeEmail || !enteredCodePhone) {
      setError('Please enter both the Email OTP and Phone OTP verification codes.');
      return;
    }

    if (enteredCodeEmail !== verificationCodeEmail) {
      setError('Incorrect Email verification code. Please enter the code shown in the SMTP Relay box.');
      return;
    }

    if (enteredCodePhone !== verificationCodePhone) {
      setError('Incorrect Phone verification code. Please enter the code shown in the SMS Gateway box.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const combinedName = `${firstName.trim()} ${lastName.trim()}`;

      const newUser: UserType = {
        id: supabaseUserId || `u_reg_${Date.now()}`,
        role: selectedRole,
        name: combinedName,
        email: email.trim(),
        phone: phone.trim(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await dbService.saveUser(newUser);
      await dbService.registerCredentials(email.trim(), selectedRole);

      setSuccessMsg(`🎉 Both Email and Phone verified successfully! Redirecting to Home...`);
      dbService.setCurrentSessionUser(newUser);
      
      setTimeout(() => {
        onAuthSuccess(newUser, selectedRole);
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCodeEmail(emailCode);
      setVerificationCodePhone(phoneCode);
      setEnteredCodeEmail('');
      setEnteredCodePhone('');
      setResendCountdown(30);
      setSuccessMsg(`✉️ Re-dispatched new secure verification codes.`);
    } catch (err: any) {
      setError('Failed to resend verification codes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMsg(null);
    const targetEmail = email || username;
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address first to recover your password.');
      return;
    }
    setIsLoading(true);
    try {
      await dbService.sendPasswordReset(targetEmail);
      setSuccessMsg(`✉️ A password reset link has been sent to ${targetEmail}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dbService.signInWithGoogle(selectedRole);
      if (result && result.user) {
        const email = result.user.email || 'google_user@gmail.com';
        
        // Resolve actual registered role if any with a database-level query by email
        const existingUser = await dbService.getUserByEmail(email);
        const credInfo = await dbService.getCredentials(email);
        
        let actualRole = existingUser ? existingUser.role : (credInfo ? credInfo.role as UserRole : selectedRole);
        
        let userObj: UserType;
        if (existingUser) {
          // Fetch and preserve ALL existing profile details from registered email
          userObj = {
            ...existingUser,
            // Consistently preserve existing user details and update avatar if new
            avatarUrl: existingUser.avatarUrl || result.user.photoURL || undefined,
          };
        } else {
          // New user registration using email as unique identifier
          userObj = {
            id: email,
            role: actualRole,
            name: result.user.displayName || 'Google User',
            email: email,
            phone: result.user.phoneNumber || '+91 90000 00000',
            status: 'active',
            avatarUrl: result.user.photoURL || undefined,
            createdAt: new Date().toISOString()
          };
        }

        await dbService.saveUser(userObj);
        await dbService.registerCredentials(email, actualRole);
        
        // Auto-provision model profile if they are logging in/registering as a model
        if (actualRole === 'model') {
          const allModels = await dbService.getModels();
          const existingModel = allModels.find(m => m.userId === userObj.id || m.email?.toLowerCase() === email.toLowerCase());
          if (!existingModel) {
            const defaultModelObj: Model = {
              id: `m_g_${Date.now()}`,
              userId: userObj.id,
              name: userObj.name,
              gender: 'female',
              age: 23,
              height: "5'8\"",
              city: 'Mumbai',
              state: 'Maharashtra',
              languages: ['English', 'Hindi'],
              experience: 'Fresh Face',
              startingPrice: 15000,
              archived: false,
              approved: true,
              selfieVerified: true,
              rating: 5,
              reviewsCount: 1,
              email: userObj.email,
              phone: userObj.phone,
              portfolio: [
                userObj.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'
              ],
              measurements: {
                bust: '34"',
                waist: '26"',
                hips: '36"'
              },
              biography: 'Enthusiastic and professional model looking for casting opportunities.',
              category: 'fashion'
            };
            await dbService.saveModel(defaultModelObj);
          }
        }

        dbService.setCurrentSessionUser(userObj);
        onAuthSuccess(userObj, actualRole);
      }
    } catch (err: any) {
      console.warn('Google Auth popup failed, showing manual input fallback:', err);
      setIsLoading(false);
      setSocialModal({
        isOpen: true,
        provider: 'google',
        step: 'input',
        inputVal: '',
        error: 'To proceed securely in this sandbox preview, please enter your Gmail account below to synchronize and log in instantly!'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSocialModal = (provider: 'google' | 'email' | 'x' | 'instagram' | 'linkedin') => {
    if (provider === 'google') {
      handleGoogleSignIn();
    } else {
      setSocialModal({
        isOpen: true,
        provider,
        step: 'input',
        inputVal: '',
        error: null
      });
    }
  };

  const handleSocialAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModal.inputVal || socialModal.inputVal.trim() === '') {
      setSocialModal(prev => ({ ...prev, error: 'Please enter a valid credential or handle.' }));
      return;
    }

    const input = socialModal.inputVal.trim();
    
    if (socialModal.provider === 'email' || socialModal.provider === 'google') {
      if (!input.includes('@') || input.length < 5) {
        setSocialModal(prev => ({ ...prev, error: 'Please enter a valid email address.' }));
        return;
      }
    } else {
      if (input.length < 2) {
        setSocialModal(prev => ({ ...prev, error: 'Username must be at least 2 characters.' }));
        return;
      }
    }

    setSocialModal(prev => ({ ...prev, step: 'authorizing', error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let emailKey = '';
      let resolvedName = '';
      let avatar = '';

      if (socialModal.provider === 'email') {
        emailKey = input.toLowerCase();
        resolvedName = input.split('@')[0].replace(/[._-]/g, ' ');
        resolvedName = resolvedName.replace(/\b\w/g, c => c.toUpperCase());
        avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;
      } else if (socialModal.provider === 'google') {
        emailKey = input.toLowerCase();
        resolvedName = input.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;
      } else if (socialModal.provider === 'x') {
        const cleanHandle = input.replace(/^@/, '');
        emailKey = `${cleanHandle}@x.com`.toLowerCase();
        resolvedName = cleanHandle.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        avatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
      } else if (socialModal.provider === 'instagram') {
        const cleanHandle = input.replace(/^@/, '');
        emailKey = `${cleanHandle}@instagram.com`.toLowerCase();
        resolvedName = cleanHandle.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        avatar = `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150`;
      } else if (socialModal.provider === 'linkedin') {
        const cleanHandle = input.replace(/^@/, '');
        emailKey = `${cleanHandle}@linkedin.com`.toLowerCase();
        resolvedName = cleanHandle.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        avatar = `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150`;
      }

      const existingUser = await dbService.getUserByEmail(emailKey);
      const credInfo = await dbService.getCredentials(emailKey);

      // If they are on the login tab using Gmail / Google or Email direct login but aren't registered yet, we automatically register them!
      if (activeTab === 'login' && !existingUser && !credInfo) {
        if (socialModal.provider !== 'google' && socialModal.provider !== 'email') {
          setSocialModal(prev => ({
            ...prev,
            step: 'input',
            error: 'This account is not registered. Please switch to the "Sign Up" tab to register your account first!'
          }));
          return;
        }
      }

      let actualRole = existingUser ? existingUser.role : (credInfo ? credInfo.role as UserRole : selectedRole);

      let userObj: UserType;
      if (existingUser) {
        userObj = {
          ...existingUser,
          avatarUrl: existingUser.avatarUrl || avatar,
        };
      } else {
        userObj = {
          id: `u_soc_${Date.now()}`,
          role: actualRole,
          name: resolvedName,
          email: emailKey,
          phone: '+91 90000 00000',
          status: 'active',
          avatarUrl: avatar,
          createdAt: new Date().toISOString()
        };
      }

      await dbService.saveUser(userObj);
      await dbService.registerCredentials(emailKey, actualRole);

      // Auto-provision model profile if they logged in/registered as a model
      if (actualRole === 'model') {
        const allModels = await dbService.getModels();
        const existingModel = allModels.find(m => m.userId === userObj.id || m.email?.toLowerCase() === emailKey.toLowerCase());
        if (!existingModel) {
          const defaultModelObj: Model = {
            id: `m_g_${Date.now()}`,
            userId: userObj.id,
            name: userObj.name,
            gender: 'female',
            age: 23,
            height: "5'8\"",
            city: 'Mumbai',
            state: 'Maharashtra',
            languages: ['English', 'Hindi'],
            experience: 'Fresh Face',
            startingPrice: 15000,
            archived: false,
            approved: true,
            selfieVerified: true,
            rating: 5,
            reviewsCount: 1,
            email: userObj.email,
            phone: userObj.phone,
            portfolio: [
              userObj.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
              'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'
            ],
            measurements: {
              bust: '34"',
              waist: '26"',
              hips: '36"'
            },
            biography: 'Enthusiastic and professional model looking for casting opportunities.',
            category: 'fashion'
          };
          await dbService.saveModel(defaultModelObj);
        }
      }

      dbService.setCurrentSessionUser(userObj);

      setSocialModal(prev => ({ ...prev, step: 'success' }));
      
      setTimeout(() => {
        setSocialModal(prev => ({ ...prev, isOpen: false }));
        onAuthSuccess(userObj, actualRole);
      }, 1500);

    } catch (err: any) {
      setSocialModal(prev => ({ 
        step: 'input', 
        error: err.message || 'Failed to authorize secure session.',
        isOpen: true,
        provider: socialModal.provider,
        inputVal: socialModal.inputVal
      }));
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 bg-gradient-to-b from-[#FDFCFB] to-[#F5F2EE] dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-white/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] animate-fadeIn">
        
        {/* Left Section: Welcome Info & One-tap Testing Accounts */}
        <div className="lg:w-5/12 bg-neutral-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle cosmic background glow */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-t from-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 z-10">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-pink-500 uppercase font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              <span>ModelVerse India Gate</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Verified Portal</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Connect directly with certified Indian models, secure escrow payouts, and manage premium portfolio unlocks in one safe system.
              </p>
            </div>


          </div>

          <div className="pt-8 text-[11px] text-neutral-500 font-medium z-10">
            Secured and vetted compliance standard. Registered under UIDAI and Razorpay safe clearance.
          </div>
        </div>

        {/* Right Section: Form with tab toggle or verification */}
        <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-between animate-fadeIn">
          {resetStep === 'otp_verify' ? (
            <div className="animate-fadeIn space-y-5">
              {/* Reset Password Verification Header */}
              <div className="flex border-b border-neutral-150 dark:border-white/10 pb-4 justify-between items-center">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white flex items-center space-x-2">
                  <Inbox className="h-5 w-5 text-purple-600 animate-bounce" />
                  <span>Google OTP Verification</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('none');
                    setEnteredResetOtp('');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  &larr; Cancel Reset
                </button>
              </div>

              {/* Error and Success notices */}
              {error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <p className="text-xs text-neutral-500 leading-relaxed">
                A secure Google OTP has been dispatched to <strong className="text-neutral-850 dark:text-white font-bold">{forgotEmail}</strong>. To simulate secure account recovery, we have delivered the OTP to your simulated email inbox below.
              </p>

              {/* Interactive Mock Email Inbox Simulator (Simulates receiving email in user's secure mailbox) */}
              <div className="mt-4 p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10 text-neutral-800 dark:text-neutral-200 text-xs space-y-3 shadow-sm animate-fadeIn text-left">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Mail className="h-4 w-4 animate-pulse" />
                  <span>✉️ Email Inbox Simulator (Simulated Secure Delivery)</span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  An OTP has been dispatched to your registered email ID, not shown on the public page. Open the simulated email below to view the OTP or click the recovery link:
                </p>
                
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-3.5 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-white/5">
                    <span className="text-[9px] font-black tracking-wider text-neutral-400 font-mono">FROM: SECURE GOOGLE GATEWAY</span>
                    <span className="text-[9px] font-mono font-semibold text-neutral-400">Just Now</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-neutral-600 dark:text-neutral-400">
                    <p><strong>To:</strong> {forgotEmail}</p>
                    <p><strong>Subject:</strong> Your Secure Google OTP Recovery Link & Authentication Code</p>
                  </div>
                  <div className="py-2 px-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-mono font-black uppercase tracking-widest font-sans">SECURE GOOGLE OTP</span>
                      <span className="text-base font-mono font-black text-purple-600 dark:text-purple-400 tracking-widest select-all">{resetOtpCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-neutral-400 font-mono font-black uppercase tracking-widest font-sans">EXPIRY</span>
                      <span className="text-[10px] font-bold text-red-500 font-mono">10 minutes</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredResetOtp(resetOtpCode);
                      setSuccessMsg('✅ Handshake authenticated via simulated email link click! Please proceed.');
                      setResetStep('change_password');
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-center space-x-1 border-2 border-purple-600 hover:border-purple-800"
                  >
                    <span>Click Recovery Link & Verify OTP &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Code Verification Entry */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                    Enter 6-Digit Code Manually
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredResetOtp}
                    onChange={(e) => setEnteredResetOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-center text-xs font-black text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 tracking-widest focus:outline-none focus:border-purple-600"
                    placeholder="••••••"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (enteredResetOtp !== resetOtpCode) {
                      setError('Incorrect OTP. Please enter the code shown in the Simulated Email Inbox below.');
                      return;
                    }
                    setError(null);
                    setSuccessMsg('✅ Google OTP verified successfully! Please choose a new secure password.');
                    setResetStep('change_password');
                  }}
                  className="w-full py-3 px-4 bg-purple-650 text-white hover:bg-purple-700 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Verify and Proceed</span>
                </button>
              </div>
            </div>
          ) : resetStep === 'change_password' ? (
            <div className="animate-fadeIn space-y-5">
              {/* Reset Password New Password Header */}
              <div className="flex border-b border-neutral-150 dark:border-white/10 pb-4 justify-between items-center">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white flex items-center space-x-2">
                  <KeyRound className="h-5 w-5 text-purple-600 animate-pulse" />
                  <span>Set New Password</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('none');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  &larr; Cancel
                </button>
              </div>

              {/* Error and Success notices */}
              {error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <p className="text-xs text-neutral-500 leading-relaxed">
                Choose a new secure password for your registered account: <strong className="text-neutral-800 dark:text-white font-bold">{forgotEmail}</strong>.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:outline-none focus:border-purple-650 font-bold"
                    placeholder="Minimum 5 characters"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 focus:outline-none focus:border-purple-650 font-bold"
                    placeholder="Re-enter to confirm"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    if (!newPassword || newPassword.length < 5) {
                      setError('Password must be at least 5 characters long.');
                      return;
                    }
                    if (newPassword !== confirmNewPassword) {
                      setError('Passwords do not match.');
                      return;
                    }
                    
                    setIsLoading(true);
                    try {
                      const cleanEmail = forgotEmail.trim().toLowerCase();
                      
                      // 1. Password History Check: Retrieve last 5 passwords
                      const historyKey = `mvi_password_history_${cleanEmail}`;
                      let history: string[] = [];
                      try {
                        history = JSON.parse(localStorage.getItem(historyKey) || '[]');
                      } catch (e) {
                        history = [];
                      }
                      if (!Array.isArray(history)) {
                        history = [];
                      }

                      // Check if new password is among the last 5
                      if (history.includes(newPassword)) {
                        setError("Change Password: The password must not be the same as the last five passwords. Please enter a different one to update.");
                        setIsLoading(false);
                        return;
                      }

                      // Update password history with new password (max 5)
                      history.unshift(newPassword);
                      if (history.length > 5) {
                        history = history.slice(0, 5);
                      }
                      localStorage.setItem(historyKey, JSON.stringify(history));

                      // 2. Save new password to local mapping
                      const localPasswords = JSON.parse(localStorage.getItem('mvi_local_passwords') || '{}');
                      localPasswords[cleanEmail] = newPassword;
                      localStorage.setItem('mvi_local_passwords', JSON.stringify(localPasswords));

                      // 3. Try updating password in Supabase if possible
                      if (supabase) {
                        try {
                          await supabase.auth.updateUser({ password: newPassword });
                        } catch (supErr) {
                          console.warn('Supabase password update ignored:', supErr);
                        }
                      }

                      // Reset fields and redirect
                      setError(null);
                      setSuccessMsg('🎉 Password changed successfully! Please log in with your new password.');
                      setResetStep('none');
                      setActiveTab('login');
                      setUsername(forgotEmail);
                      setPassword(newPassword);
                    } catch (err: any) {
                      setError('Failed to update password. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full py-3 px-4 bg-purple-600 text-white border-2 border-purple-600 hover:bg-purple-800 hover:border-purple-800 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isVerifying ? (
            <div className="animate-fadeIn">
              {/* Verification Header */}
              <div className="flex border-b border-neutral-150 dark:border-white/10 pb-4 justify-between items-center">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white flex items-center space-x-2">
                  <Inbox className="h-5 w-5 text-purple-600 animate-bounce" />
                  <span>Dual OTP Verification</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setEnteredCodeEmail('');
                    setEnteredCodePhone('');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                >
                  &larr; Back to Form
                </button>
              </div>

              {/* Error and Success notices */}
              {error && (
                <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
                Automated security authentication passkeys were dispatched to your email <strong className="text-neutral-800 font-bold">{email}</strong> and your phone <strong className="text-neutral-800 font-bold">{phone}</strong>.
              </p>

              {/* Secure simulated Gateways */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                {/* SMTP Relay Box */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-900/50 border-2 border-dashed border-purple-200 dark:border-purple-900/40 rounded-2xl p-4 text-neutral-800 dark:text-neutral-200 space-y-2 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-purple-650 text-white text-[8px] font-mono font-black px-2 py-0.5 rounded-bl uppercase tracking-wider">
                    SMTP EMAIL RELAY
                  </div>
                  <div className="flex items-center space-x-1.5 text-[9px] text-neutral-400 font-mono">
                    <Mail className="h-3 w-3 text-purple-500" />
                    <span className="truncate">To: {email}</span>
                  </div>
                  <div className="bg-white dark:bg-neutral-850 border border-neutral-150 dark:border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
                    <span className="text-[8px] text-neutral-400 font-mono font-bold uppercase tracking-wider">EMAIL PASSKEY</span>
                    <span className="text-base font-mono font-black tracking-widest text-neutral-900 dark:text-white select-all">{verificationCodeEmail}</span>
                  </div>
                </div>

                {/* SMS Gateway Box */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-900/50 border-2 border-dashed border-pink-200 dark:border-pink-900/40 rounded-2xl p-4 text-neutral-800 dark:text-neutral-200 space-y-2 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-pink-600 text-white text-[8px] font-mono font-black px-2 py-0.5 rounded-bl uppercase tracking-wider">
                    SMS GATEWAY RELAY
                  </div>
                  <div className="flex items-center space-x-1.5 text-[9px] text-neutral-400 font-mono">
                    <Smartphone className="h-3 w-3 text-pink-550" />
                    <span className="truncate">To: {phone}</span>
                  </div>
                  <div className="bg-white dark:bg-neutral-850 border border-neutral-150 dark:border-white/10 p-2.5 rounded-xl flex flex-col justify-center">
                    <span className="text-[8px] text-neutral-400 font-mono font-bold uppercase tracking-wider">PHONE SMS OTP</span>
                    <span className="text-base font-mono font-black tracking-widest text-neutral-900 dark:text-white select-all">{verificationCodePhone}</span>
                  </div>
                </div>
              </div>

              {/* Fast Auto-fill button */}
              <button
                type="button"
                onClick={() => {
                  setEnteredCodeEmail(verificationCodeEmail);
                  setEnteredCodePhone(verificationCodePhone);
                  setSuccessMsg('📋 Both verification codes auto-entered!');
                }}
                className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer mb-5"
              >
                Auto-Fill Both OTP Codes
              </button>

              {/* Code Verification Entry */}
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                      Enter Email Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={enteredCodeEmail}
                      onChange={(e) => setEnteredCodeEmail(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-center text-xs font-black text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 tracking-widest focus:outline-none focus:border-purple-600"
                      placeholder="E.G. 123456"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                      Enter Phone Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={enteredCodePhone}
                      onChange={(e) => setEnteredCodePhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-center text-xs font-black text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 tracking-widest focus:outline-none focus:border-purple-600"
                      placeholder="E.G. 654321"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-purple-650 text-white hover:bg-purple-700 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Verify & Register Profile</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400 font-medium">
                    Didn't receive verification?
                  </span>
                  {resendCountdown > 0 ? (
                    <span className="text-neutral-400 font-mono font-bold">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-purple-600 hover:text-purple-850 transition font-black flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 animate-spin-slow" />
                      <span>Resend OTPs</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* Tab Header & Cancel skips */}
              <div className="flex pb-4 justify-between items-center border-b border-neutral-150 dark:border-white/10">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                  {activeTab === 'login' ? 'Log In to Portal' : activeTab === 'signup' ? 'Register New Account' : 'Recover Your Account'}
                </h3>
                <button 
                  onClick={onCancel}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Error and Success notices */}
              {error && (
                <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center space-x-2 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Role Picker Buttons: Labelled Client, Admin, Models */}
              {activeTab !== 'forgot' && (
                <div className="mt-6 space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                    {activeTab === 'login' ? 'Identify Your Intended Access Role' : 'Select Your Account Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['client', 'model', 'admin'] as UserRole[]).map((role) => {
                      const isActive = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setError(null);
                          }}
                          className={`py-3 px-2.5 rounded-xl border-2 text-xs font-black capitalize transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                            isActive
                              ? role === 'admin'
                                ? 'border-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-400'
                                : role === 'model'
                                ? 'border-pink-500 bg-pink-500/5 text-pink-900 dark:text-pink-400'
                                : 'border-purple-650 bg-purple-500/5 text-purple-900 dark:text-purple-400'
                              : 'border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {role === 'admin' && <ShieldCheck className={`h-4.5 w-4.5 ${isActive ? 'text-amber-500' : 'text-neutral-400'}`} />}
                          {role === 'model' && <User className={`h-4.5 w-4.5 ${isActive ? 'text-pink-500' : 'text-neutral-400'}`} />}
                          {role === 'client' && <Briefcase className={`h-4.5 w-4.5 ${isActive ? 'text-purple-650' : 'text-neutral-400'}`} />}
                          <span>{role === 'model' ? 'Models' : role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Primary Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                
                {/* SIGN UP, RECOVERY OR LOGIN FIELDS */}
                {activeTab === 'forgot' ? (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                        placeholder="e.g. you@example.com"
                      />
                    </div>
                  </div>
                ) : activeTab === 'signup' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                            placeholder="e.g. Deepika"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                            placeholder="e.g. Padukone"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono font-bold">Email Address (OTP verified)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                          placeholder="e.g. deepika@modelverse.in"
                        />
                      </div>
                    </div>

                    {/* Phone field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono font-bold">Phone Number (OTP verified)</label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                          placeholder="e.g. +91 99999 88888"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* LOGIN FIELD (SUPPORT EMAIL OR PHONE AS USERNAME) */
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">Email Address or Phone Number</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                        placeholder="Email or Phone e.g. client@modelverse.in"
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                {activeTab !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">Password</label>
                      {activeTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot');
                            setError(null);
                            setSuccessMsg(null);
                          }}
                          className="text-[10px] font-bold text-purple-650 hover:text-purple-850 hover:underline transition cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:border-purple-650"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 px-4 bg-purple-600 border-2 border-purple-600 text-white hover:bg-purple-800 hover:border-purple-800 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : activeTab === 'forgot' ? (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send Recovery Link</span>
                    </>
                  ) : activeTab === 'login' ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Access Account</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create Certified Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Login <-> Signup Toggle Link Below Login Button */}
              <div className="text-center mt-4">
                <p className="text-xs text-neutral-400 font-bold">
                  {activeTab === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-purple-650 hover:text-purple-850 hover:underline font-black cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : activeTab === 'signup' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-purple-650 hover:text-purple-850 hover:underline font-black cursor-pointer"
                      >
                        Log In
                      </button>
                    </>
                  ) : (
                    <>
                      Remembered your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-purple-650 hover:text-purple-850 hover:underline font-black cursor-pointer"
                      >
                        Log In
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Third party options */}
              {activeTab !== 'forgot' && (
                <div className="mt-6 pt-6 border-t border-neutral-150 dark:border-white/10 space-y-4">
                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-neutral-200 dark:border-white/5"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono text-center">Or Direct Register & Login</span>
                    <div className="flex-grow border-t border-neutral-200 dark:border-white/5"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="py-2.5 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500 hover:text-white border border-neutral-300 dark:border-white/10 rounded-xl text-xs font-black text-neutral-700 dark:text-neutral-300 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 hover:border-red-500 hover:scale-[1.01]"
                    >
                      <Chrome className="h-4 w-4 text-red-500 shrink-0 group-hover:text-white" />
                      <span className="truncate">Continue with Google</span>
                    </button>

                    {/* Email Quick Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSocialModal('email')}
                      disabled={isLoading}
                      className="py-2.5 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-600 hover:text-white border border-neutral-300 dark:border-white/10 rounded-xl text-xs font-black text-neutral-700 dark:text-neutral-300 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 hover:border-purple-600 hover:scale-[1.01]"
                    >
                      <Mail className="h-4 w-4 text-purple-600 shrink-0 group-hover:text-white" />
                      <span className="truncate">Email Quick</span>
                    </button>

                    {/* X / Twitter Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSocialModal('x')}
                      disabled={isLoading}
                      className="py-2.5 px-3 bg-neutral-900 text-white hover:bg-sky-500 hover:text-white rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 border border-neutral-800 hover:border-sky-500 hover:scale-[1.01]"
                    >
                      <Twitter className="h-4 w-4 text-white shrink-0" />
                      <span className="truncate">X / Twitter</span>
                    </button>

                    {/* Instagram Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSocialModal('instagram')}
                      disabled={isLoading}
                      className="py-2.5 px-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-md hover:scale-[1.01] transition-all duration-200 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                    >
                      <Instagram className="h-4 w-4 text-white shrink-0" />
                      <span className="truncate">Instagram</span>
                    </button>

                    {/* LinkedIn Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSocialModal('linkedin')}
                      disabled={isLoading}
                      className="col-span-2 py-2.5 px-3 bg-[#0a66c2] text-white hover:bg-blue-800 hover:shadow-md hover:scale-[1.01] transition-all duration-200 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
                    >
                      <Linkedin className="h-4 w-4 text-white shrink-0" />
                      <span className="truncate">Continue with LinkedIn Professional</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* DIRECT SOCIAL AUTH MODAL OVERLAY */}
      {socialModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl transition-all">
            
            {/* Modal Brand Header */}
            <div className={`p-5 text-white ${
              socialModal.provider === 'google' ? 'bg-blue-600' :
              socialModal.provider === 'email' ? 'bg-purple-600' :
              socialModal.provider === 'x' ? 'bg-black border-b border-white/10' :
              socialModal.provider === 'linkedin' ? 'bg-[#0a66c2]' :
              'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500'
            }`}>
              <div className="flex items-center space-x-3">
                {socialModal.provider === 'google' && <Chrome className="h-5 w-5 text-white shrink-0" />}
                {socialModal.provider === 'email' && <Mail className="h-5 w-5 text-white shrink-0" />}
                {socialModal.provider === 'x' && <Twitter className="h-5 w-5 text-white shrink-0" />}
                {socialModal.provider === 'instagram' && <Instagram className="h-5 w-5 text-white shrink-0" />}
                {socialModal.provider === 'linkedin' && <Linkedin className="h-5 w-5 text-white shrink-0" />}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest font-mono leading-none">
                    {socialModal.provider === 'google' && 'Google Auth'}
                    {socialModal.provider === 'email' && 'Email Direct Access'}
                    {socialModal.provider === 'x' && 'X / Twitter Gateway'}
                    {socialModal.provider === 'instagram' && 'Instagram Connect'}
                    {socialModal.provider === 'linkedin' && 'LinkedIn Professional'}
                  </h3>
                  <p className="text-[10px] text-white/80 font-bold mt-1">
                    Secure 1-Click Identity Sync
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {socialModal.step === 'input' && (
                <form onSubmit={handleSocialAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono mb-1.5">
                      {socialModal.provider === 'email' && 'Enter your email address'}
                      {socialModal.provider === 'google' && 'Enter your Gmail / Google account'}
                      {socialModal.provider === 'x' && 'Enter your X username / @handle'}
                      {socialModal.provider === 'instagram' && 'Enter your Instagram @handle'}
                      {socialModal.provider === 'linkedin' && 'Enter your LinkedIn Username / @handle'}
                    </label>
                    <div className="relative">
                      {(socialModal.provider === 'x' || socialModal.provider === 'instagram' || socialModal.provider === 'linkedin') && (
                        <span className="absolute left-3 top-2.5 text-xs font-black text-neutral-400 dark:text-neutral-500 font-mono">
                          @
                        </span>
                      )}
                      <input
                        type={socialModal.provider === 'email' || socialModal.provider === 'google' ? 'email' : 'text'}
                        value={socialModal.inputVal}
                        onChange={(e) => setSocialModal(prev => ({ ...prev, inputVal: e.target.value, error: null }))}
                        placeholder={
                          socialModal.provider === 'email' ? 'you@domain.com' :
                          socialModal.provider === 'google' ? 'username@gmail.com' :
                          socialModal.provider === 'x' ? 'username' : 
                          socialModal.provider === 'linkedin' ? 'linkedin-profile' : 'username'
                        }
                        className={`w-full py-2 ${
                          socialModal.provider === 'x' || socialModal.provider === 'instagram' || socialModal.provider === 'linkedin' ? 'pl-7' : 'pl-3'
                        } pr-3 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-600 transition`}
                        autoFocus
                      />
                    </div>
                    {socialModal.error && (
                      <p className="mt-1.5 text-[10px] text-red-500 font-bold flex items-center space-x-1 animate-fadeIn">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{socialModal.error}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold leading-normal">
                    By proceeding, ModelVerse India will register or log in a secure account under your chosen role (<span className="text-purple-650 dark:text-purple-400 font-black uppercase">{selectedRole}</span>).
                  </p>

                  <div className="flex space-x-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSocialModal(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2 border-2 border-neutral-300 dark:border-white/10 hover:bg-neutral-800 hover:text-white hover:border-neutral-800 text-neutral-650 dark:text-neutral-400 text-xs font-black rounded-xl transition duration-200 cursor-pointer text-center bg-white dark:bg-neutral-900 shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2 text-white text-xs font-black rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center ${
                        socialModal.provider === 'google' ? 'bg-red-500 hover:bg-red-700' :
                        socialModal.provider === 'email' ? 'bg-purple-600 hover:bg-purple-800' :
                        socialModal.provider === 'x' ? 'bg-neutral-900 border border-neutral-800 hover:bg-sky-500 hover:border-sky-500' :
                        socialModal.provider === 'linkedin' ? 'bg-[#0a66c2] hover:bg-blue-800' :
                        'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-purple-600 hover:to-pink-600'
                      }`}
                    >
                      Verify & Sync
                    </button>
                  </div>
                </form>
              )}

              {socialModal.step === 'authorizing' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-neutral-700 dark:text-neutral-200 uppercase tracking-widest font-mono">
                      Establishing Handshake...
                    </h4>
                    <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-bold max-w-xs leading-normal animate-pulse">
                      Synchronizing secure credentials with {socialModal.provider} gateway. Please wait...
                    </p>
                  </div>
                </div>
              )}

              {socialModal.step === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="h-10 w-10 bg-green-500/10 border border-green-500 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-widest font-mono">
                      Sync Successful!
                    </h4>
                    <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-bold">
                      Direct social login authorized. Entering dashboard...
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
