'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api-client';
import BentoInput from '../LandingUI/BentoInput';
import GradientButton from '../LandingUI/GradientButton';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Added generic type to match API response
      const res = await api.post<{ id: string }>('/auth/register', formData);
      
      if (res.success) {
        router.push('/signin?registered=true');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <BentoInput
        icon={User}
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <BentoInput
        icon={Phone}
        label="Mobile Number"
        type="tel"
        placeholder="9876543210"
        value={formData.mobile}
        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        required
      />

      <BentoInput
        icon={Mail}
        label="Email (Optional)"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <BentoInput
        icon={Lock}
        label="Password"
        type="password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <GradientButton type="submit" loading={loading}>
        Create Account
      </GradientButton>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/signin" className="font-bold text-gray-900 dark:text-white hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}