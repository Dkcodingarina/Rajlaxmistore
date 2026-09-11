import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import authService from '../../services/authService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
  Inbox,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function AuthView() {
  const { login, navigateTo, showToast, currentParams, storeSettings } = useStore();

  // 'login', 'register', 'forgot-password', 'reset-link-sent', 'reset-password', 'email-sent', 'verified-success'
  const [mode, setMode] = useState(currentParams?.mode || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: currentParams?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    resetCode: ''
  });

  const [registeredEmail, setRegisteredEmail] = useState(currentParams?.email || '');
  const [resetEmail, setResetEmail] = useState(currentParams?.email || '');
  const [unverifiedEmailNotice, setUnverifiedEmailNotice] = useState(null);

  const targetView = currentParams?.redirectAfter || 'home';

  // Listen for Supabase password recovery events from Gmail / email link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('mode=reset-password') || currentParams?.mode === 'reset-password') {
        setMode('reset-password');
        showToast('Password recovery link verified! You can now set your new password.', 'info');
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMode('reset-password');
          if (session?.user?.email) {
            setResetEmail(session.user.email);
            setFormData(prev => ({ ...prev, email: session.user.email }));
          }
          showToast('Password recovery verified. Please enter your new password.', 'info');
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [currentParams]);

  // Helper to clear inline notices
  const clearNotices = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setUnverifiedEmailNotice(null);
  };

  // Switch mode helper
  const handleSwitchMode = (newMode) => {
    clearNotices();
    setMode(newMode);
  };

  // 1. Handle Login with Password
  const handleLogin = async (e) => {
    e.preventDefault();
    clearNotices();

    if (!formData.email.trim() || !formData.password) {
      const err = 'Please enter both your email address and password.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.login(formData.email.trim(), formData.password);
    setIsSubmitting(false);

    if (!res?.success) {
      if (res?.isUnverified) {
        setUnverifiedEmailNotice(formData.email.trim());
        const msg = 'Your email address is not verified yet. Please check your inbox for the activation link.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        const errorDetail = res?.message || 'Incorrect email or password. Please verify your credentials or use Forgot Password.';
        setErrorMessage(errorDetail);
        showToast(errorDetail, 'error');
      }
      return;
    }

    login(res.user);
    showToast(`Welcome back, ${res.user.name || 'Customer'}!`, 'success');
    if (res.user.role === 'super_admin' || res.user.role === 'admin') {
      navigateTo('admin');
    } else {
      navigateTo(targetView);
    }
  };

  // 2. Handle User Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    clearNotices();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      const err = 'Please fill all mandatory fields (Name, Email, Mobile Phone).';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      const err = 'Password must be at least 6 characters long.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.register(
      formData.name.trim(),
      formData.email.trim(),
      formData.phone.trim(),
      formData.password,
      formData.address.trim()
    );
    setIsSubmitting(false);

    if (!res?.success) {
      const err = res?.message || 'Registration failed. Please try with another email.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (res?.user) {
      login(res.user);
      showToast(`Welcome, ${res.user.name}! Your account has been registered and activated.`, 'success');
      navigateTo(targetView);
      return;
    }
  };

  // 3. Handle Forgot Password Request -> Dispatches Supabase Email Link to Gmail
  const handleForgotPasswordRequest = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearNotices();

    const emailToReset = (resetEmail || formData.email || '').toLowerCase().trim();
    if (!emailToReset || !emailToReset.includes('@')) {
      const err = 'Please enter a valid registered email address.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.requestPasswordReset(emailToReset);
    setIsSubmitting(false);

    if (!res?.success) {
      const err = res?.message || 'Failed to send password reset link.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setResetEmail(emailToReset);
    setSuccessMessage(`Password reset link dispatched to ${emailToReset}. Please check your Gmail/Inbox.`);
    showToast(`Password reset link sent to ${emailToReset}!`, 'success');
    setMode('reset-link-sent');
  };

  // 4. Handle Reset Password Submission (Enter New Password)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    clearNotices();

    const targetMail = (resetEmail || formData.email || '').toLowerCase().trim();

    if (!formData.password || formData.password.length < 6) {
      const err = 'New password must be at least 6 characters long.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const err = 'Passwords do not match. Please re-enter identical passwords.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.resetPassword(targetMail, formData.resetCode || null, formData.password);
    setIsSubmitting(false);

    if (!res?.success) {
      const err = res?.message || 'Password reset failed. Please request a fresh reset link.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    showToast('Your password has been successfully updated! Please sign in with your new credentials.', 'success');
    setFormData(prev => ({ ...prev, email: targetMail, password: '', confirmPassword: '', resetCode: '' }));
    setSuccessMessage('Password updated successfully! You can now log in.');
    setMode('login');
  };

  // Resend Verification Email Link
  const handleResendVerification = async (emailToResend) => {
    const targetEmail = emailToResend || registeredEmail || formData.email;
    if (!targetEmail) {
      showToast('Please provide your email first.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.resendVerificationEmail(targetEmail);
    setIsSubmitting(false);

    if (res?.success) {
      showToast(`Fresh activation link sent to ${targetEmail}!`, 'success');
      setSuccessMessage(`Fresh activation link dispatched to ${targetEmail}.`);
    } else {
      showToast(res?.message || 'Could not resend verification email.', 'error');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-neutral-200/90 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-900 via-rose-950 to-rose-700 flex items-center justify-center font-serif font-black text-white text-2xl mx-auto shadow-lg border border-rose-400/20">
            R
          </div>
          <div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-neutral-900">
              {mode === 'login' && 'Sign In to Store'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot-password' && 'Reset Your Password'}
              {mode === 'reset-link-sent' && 'Reset Link Dispatched'}
              {mode === 'reset-password' && 'Create New Password'}
              {mode === 'email-sent' && 'Verify Your Email'}
              {mode === 'verified-success' && 'Account Activated!'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {mode === 'login' && 'Access order tracking, doorstep delivery details, and exclusive store benefits.'}
              {mode === 'register' && `Join ${storeSettings?.storeName || 'the store'} for exclusive deals on cosmetics, stationery & festive hampers.`}
              {mode === 'forgot-password' && "Enter your registered email address to receive a direct password reset link in your Gmail."}
              {mode === 'reset-link-sent' && 'Check your Gmail inbox and click the secure link to set your new password.'}
              {mode === 'reset-password' && 'Enter your new secure password below to regain access to your account.'}
              {mode === 'email-sent' && 'Click the verification link dispatched to your inbox to activate your account.'}
              {mode === 'verified-success' && 'Your email address is verified. You can now log in.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Visible during login / register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'login' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'register' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>New Registration</span>
            </button>
          </div>
        )}

        {/* Global Error Notice Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-3 text-xs text-rose-950 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-black text-rose-900">Authentication Alert</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Global Success Notice Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-black text-emerald-900">Success</p>
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Unverified Email Alert Notice */}
        {unverifiedEmailNotice && mode === 'login' && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-black">Email Verification Required</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  We dispatched an activation link to <strong>{unverifiedEmailNotice}</strong>. Please check your inbox (or spam) to activate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleResendVerification(unverifiedEmailNotice)}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Activation Email to Inbox</span>
            </button>
          </div>
        )}

        {/* ================= 1. LOGIN FORM ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-3 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-neutral-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(formData.email || '');
                    handleSwitchMode('forgot-password');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Password?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-rose-600 text-white font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= 2. REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sonal Patel"
                  value={formData.name || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="sonal@example.com"
                  value={formData.email || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, email: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Mobile Phone *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, phone: e.target.value });
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Create Password * (Min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Create a strong password"
                  value={formData.password || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Delivery Address (Optional)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  placeholder="House/flat no, street, locality, city, pincode"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register & Activate Account</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= 3. FORGOT PASSWORD (REQUEST LINK TO GMAIL) ================= */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50/80 border border-rose-200/90 rounded-2xl flex items-start space-x-3 text-rose-900">
              <Mail className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-950">Direct Password Reset Link</p>
                <p className="text-[11px] text-rose-900/90 leading-relaxed">
                  Enter your registered email address below. We'll send a secure password reset link directly to your Gmail inbox via Supabase.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1.5">Registered Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.registered.email@example.com"
                  value={resetEmail || formData.email || ''}
                  onChange={(e) => {
                    clearNotices();
                    setResetEmail(e.target.value);
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                  }}
                  className="w-full pl-10 pr-3 py-3 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link to Gmail...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link to Email</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode('reset-password')}
                className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Already have a reset link or token?
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= 4. RESET LINK SENT CONFIRMATION ================= */}
        {mode === 'reset-link-sent' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-sm animate-pulse">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-xl text-neutral-900">
                Password Reset Link Dispatched!
              </h3>
              <p className="text-xs text-neutral-500">
                We've sent a secure recovery link to:
              </p>
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl font-mono font-black text-neutral-900 text-xs break-all">
                {resetEmail || formData.email}
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-left space-y-2 text-xs text-neutral-600">
              <p className="font-bold text-neutral-800 flex items-center space-x-1.5">
                <Inbox className="w-4 h-4 text-rose-600" />
                <span>Next Steps in Gmail:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Open your Gmail / email inbox (check Spam or Promotions if not in Primary).</li>
                <li>Click the <strong>"Reset Password"</strong> button inside the email.</li>
                <li>You'll be redirected here to set your new secure password.</li>
              </ol>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <span>Open Gmail Inbox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleForgotPasswordRequest(new Event('submit'))}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('reset-password')}
                  className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-900 font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                  <span>Set New Password</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="w-full py-2 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. SET NEW PASSWORD FORM ================= */}
        {mode === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-start space-x-2.5 text-rose-900">
              <KeyRound className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Enter your new password below for <strong>{resetEmail || formData.email || 'your account'}</strong>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">New Password * (Min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={formData.password || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword || ''}
                  onChange={(e) => {
                    clearNotices();
                    setFormData({ ...formData, confirmPassword: e.target.value });
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save New Password & Sign In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode('forgot-password')}
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Email Link</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel & Return
              </button>
            </div>
          </form>
        )}

        {/* ================= 5. EMAIL SENT NOTICE ================= */}
        {mode === 'email-sent' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-sm animate-bounce">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-xl text-neutral-900">
                Activation Link Dispatched!
              </h3>
              <p className="text-xs text-neutral-500">
                We've sent an account activation link to:
              </p>
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl font-mono font-black text-neutral-900 text-xs break-all">
                {registeredEmail || formData.email}
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-left space-y-2 text-xs text-neutral-600">
              <p className="font-bold text-neutral-800 flex items-center space-x-1.5">
                <Inbox className="w-4 h-4 text-rose-600" />
                <span>Next Steps to Activate:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Open your email inbox (check spam folder if needed).</li>
                <li>Click the verification link to activate your account.</li>
                <li>Return here to sign in with your email & password.</li>
              </ol>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResendVerification(registeredEmail || formData.email)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
