'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Lock, KeyRound, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import BentoInput from '../LandingUI/BentoInput';
import GradientButton from '../LandingUI/GradientButton';

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    mobile: '',
    oldPassword: '',
    newPassword: ''
  });

  const validate = () => {
  if (!/^\d{10}$/.test(formData.mobile)) {
    return "Enter a valid registered mobile number";
  }

if (formData.oldPassword.length < 8) {
  return "Old password must be at least 8 characters";
}

if (formData.newPassword.length < 8) {
  return "New password must be at least 8 characters";
}

  if (formData.oldPassword === formData.newPassword) {
    return "New password must be different from old password";
  }

  return null;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationError = validate();
  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);
  setError('');

  try {
    const res = await api.post<void>('/auth/forgot-password', formData);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || 'Update failed');
    }
  } catch {
    setError('Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Your password has been changed successfully.</p>
        <Link href="/signin">
          <GradientButton>Back to Login</GradientButton>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-xl border border-yellow-200 dark:border-yellow-500/20 text-xs text-yellow-800 dark:text-yellow-200">
        <strong>Note:</strong> Currently requires verification of your old password to reset.
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <BentoInput
  icon={Phone}
  label="Mobile Number"
  type="tel"
  inputMode="numeric"
  maxLength={10}
  placeholder="Registered mobile"
  value={formData.mobile}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData({ ...formData, mobile: value });
    }
  }}
  required
/>

      <BentoInput
        icon={KeyRound}
        label="Old Password"
        type="password"
        minLength={8}
        placeholder="Enter current password"
        value={formData.oldPassword}
        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
        required
      />

      <BentoInput
        icon={Lock}
        label="New Password"
        type="password"
        minLength={8}
        placeholder="Minimum 6 characters"
        value={formData.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        required
      />

      <GradientButton type="submit" loading={loading}>
        Reset Password
      </GradientButton>

      <div className="text-center">
        <Link href="/signin" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          Cancel and return to login
        </Link>
      </div>
    </form>
  );
}