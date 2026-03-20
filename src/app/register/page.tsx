'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, TrendingUp, User, Mail, Lock, Phone } from 'lucide-react';

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordScore(password: string) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;

  if (password.length === 0) {
    return { score: 0, label: 'Not set', color: 'bg-gray-300' };
  }
  if (score <= 2) {
    return { score, label: 'Weak', color: 'bg-red-500' };
  }
  if (score <= 4) {
    return { score, label: 'Medium', color: 'bg-amber-500' };
  }
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

function normalizeIndianPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    return digits.slice(2).slice(0, 10);
  }

  return digits.slice(0, 10);
}


export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const passwordChecks = getPasswordChecks(password);
  const passwordScore = getPasswordScore(password);
  const doPasswordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const phoneDigits = normalizeIndianPhone(phone);
  const isPhoneValid = phoneDigits.length === 10;
  const isPasswordValid = password.length >= 6;
  const canSubmit =
    name.trim().length > 1 &&
    email.trim().length > 0 &&
    isPhoneValid &&
    isPasswordValid &&
    doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register(email.trim(), password, name.trim(), phoneDigits);
      router.push('/dashboard'); // Redirect to dashboard on successful registration
    } catch (err: any) {
      // --- THIS IS THE NEW, IMPROVED ERROR HANDLING ---
      let errorMessage = 'Something went wrong. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email address is already in use. Please try another.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. It should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        default:
          errorMessage = err.message;
          break;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-lg backdrop-blur-sm md:p-7">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-lg text-muted-foreground">Start your journey with DhanSathi</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl border-border/60 bg-background pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border/60 bg-background pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(normalizeIndianPhone(e.target.value))}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                className="h-11 rounded-xl border-border/60 bg-background pl-10"
                required
              />
            </div>
            <p className={`mt-1 text-xs ${isPhoneValid || phone.length === 0 ? 'text-muted-foreground' : 'text-red-500'}`}>
              {isPhoneValid || phone.length === 0 ? 'Format: 10 digits (India).' : 'Phone number must be exactly 10 digits.'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 rounded-xl border-border/60 bg-background pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Password strength</span>
                <span>{passwordScore.label}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${passwordScore.color}`}
                  style={{ width: `${(passwordScore.score / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="h-11 rounded-xl border-border/60 bg-background pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`mt-1 text-xs ${doPasswordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                {doPasswordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full rounded-xl bg-emerald-500 text-white hover:bg-emerald-600" disabled={!canSubmit || submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
