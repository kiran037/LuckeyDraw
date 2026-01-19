import AuthLayout from '@/components/LandingUI/AuthLayout';
import GlassCard from '@/components/LandingUI/GlassCard';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Join Sawariya"
      subtitle="Start your journey with us today"
    >
      <GlassCard>
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </GlassCard>
    </AuthLayout>
  );
}