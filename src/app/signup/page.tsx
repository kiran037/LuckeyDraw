import AuthLayout from '@/components/LandingUI/AuthLayout';
import GlassCard from '@/components/LandingUI/GlassCard';
import RegisterForm from '@/components/Auth/RegisterForm';

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Join Sawariya" 
      subtitle="Start your journey with us today"
    >
      <GlassCard>
        <RegisterForm />
      </GlassCard>
    </AuthLayout>
  );
}