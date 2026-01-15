import AuthLayout from '@/components/LandingUI/AuthLayout';
import GlassCard from '@/components/LandingUI/GlassCard';
import LoginForm from '@/components/Auth/LoginForm';

export default function SignInPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your credentials to access your account"
    >
      <GlassCard>
        <LoginForm />
      </GlassCard>
    </AuthLayout>
  );
}