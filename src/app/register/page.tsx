'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';

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
  const canSubmit =
    name.trim().length > 1 &&
    email.trim().length > 0 &&
    isPhoneValid &&
    Object.values(passwordChecks).every(Boolean) &&
    doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError('Please create a stronger password that satisfies all requirements.');
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

  const passwordRules = [
    { label: 'At least 8 characters', valid: passwordChecks.minLength },
    { label: 'One uppercase letter', valid: passwordChecks.hasUpper },
    { label: 'One lowercase letter', valid: passwordChecks.hasLower },
    { label: 'One number', valid: passwordChecks.hasNumber },
    { label: 'One special character', valid: passwordChecks.hasSymbol },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-emerald-100 bg-white/95 p-8 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Start your journey with DhanSathi</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeIndianPhone(e.target.value))}
              placeholder="10-digit mobile number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
            <p className={`mt-1 text-xs ${isPhoneValid || phone.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPhoneValid || phone.length === 0 ? 'Format: 10 digits (India).' : 'Phone number must be exactly 10 digits.'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>Password strength</span>
                <span>{passwordScore.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full transition-all duration-300 ${passwordScore.color}`}
                  style={{ width: `${(passwordScore.score / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
              {passwordRules.map((rule) => (
                <div key={rule.label} className={`flex items-center gap-1.5 ${rule.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {rule.valid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`mt-1 text-xs ${doPasswordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {doPasswordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
