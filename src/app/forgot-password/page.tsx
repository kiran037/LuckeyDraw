import AuthLayout from '@/components/LandingUI/AuthLayout';
import GlassCard from '@/components/LandingUI/GlassCard';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Securely update your account credentials"
    >
      <GlassCard>
        <ForgotPasswordForm />
      </GlassCard>
    </AuthLayout>
  );
}