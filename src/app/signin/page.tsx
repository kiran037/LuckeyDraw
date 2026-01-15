"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Eye, EyeOff, ArrowLeft, Crown, Phone, Lock, User, Mail, 
  AlertCircle, CheckCircle, LucideIcon 
} from "lucide-react";
import { api } from "@/lib/api-client";

// --- Types ---
type AuthMode = "login" | "register" | "forgot-password";

interface LoginResponse {
  user: {
    id: string;
    role: string;
  };
  redirectUrl: string;
}

// --- Components ---

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label: string;
  error?: string;
}

const CustomInput = ({ icon: Icon, label, error, className, ...props }: CustomInputProps) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-white transition-colors">
        {Icon && <Icon size={18} />}
      </div>
      <input
        {...props}
        className={`
          w-full bg-[#0B0E14] border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 outline-none
          focus:ring-1 focus:bg-[#151925] transition-all duration-300 disabled:opacity-50 text-sm font-medium
          ${error 
            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" 
            : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50"}
          ${className || ""}
        `}
      />
    </div>
    {error && <p className="text-[10px] text-red-400 ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

const PrimaryButton = ({ children, loading, className, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
  <button
    disabled={loading || disabled}
    className={`relative w-full overflow-hidden rounded-xl group disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 p-[1px] ${className || ""}`}
    {...props}
  >
    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-[#0B0E14] hover:bg-transparent transition-colors rounded-[11px] px-6 py-3.5 flex items-center justify-center gap-2">
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="text-sm font-bold text-white group-hover:text-white tracking-wide uppercase">{children}</span>
      )}
    </div>
  </button>
);

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#0B0E14]">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px]" />
  </div>
);

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const redirectPath = searchParams.get("redirect");

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback States
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form Data
  const [loginData, setLoginData] = useState({ mobile: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({ name: "", mobile: "", email: "", password: "", agreedToTerms: false });
  const [forgotData, setForgotData] = useState({ mobile: "", oldPassword: "", newPassword: "" });

  // --- Helpers ---
  
  // FIX: Centralized mode switching to prevent cascading render loops
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFormError("");
    setSuccess("");
    setFieldErrors({});
    
    // Update URL without full reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("mode", newMode);
    window.history.replaceState({}, "", newUrl.toString());
  };

  const validateMobile = (mobile: string) => /^\d{10}$/.test(mobile) ? "" : "Must be a valid 10-digit number";
  const validatePass = (pass: string) => pass.length >= 6 ? "" : "Must be at least 6 characters";

  // --- Handlers ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFieldErrors({});
    
    const mobileErr = validateMobile(loginData.mobile);
    if (mobileErr) { setFieldErrors({ mobile: mobileErr }); return; }

    setLoading(true);
    const res = await api.post<LoginResponse>("/auth/login", { mobile: loginData.mobile, password: loginData.password });
    setLoading(false);

  if (!res.success) {
      setFormError(res.error || (res as { message?: string }).message || "Invalid credentials.");
      return;
    }
    
    const finalRedirect = redirectPath || res.data?.redirectUrl || "/";
    router.replace(finalRedirect);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFieldErrors({});

    const mobileErr = validateMobile(registerData.mobile);
    const passErr = validatePass(registerData.password);
    if (mobileErr || passErr) { 
      setFieldErrors({ mobile: mobileErr, password: passErr }); 
      return; 
    }
    if (!registerData.agreedToTerms) { 
      setFormError("You must agree to the Terms & Conditions."); 
      return; 
    }

    setLoading(true);
    const res = await api.post("/auth/register", {
      name: registerData.name,
      mobile: registerData.mobile,
      email: registerData.email || undefined,
      password: registerData.password,
    });
    setLoading(false);

   if (!res.success) {
      setFormError(res.error || (res as { message?: string }).message || "Registration failed.");
      return;
    }

    setSuccess("Account created! Redirecting to login...");
    setTimeout(() => {
        switchMode("login"); // Use new helper
        setLoginData(prev => ({ ...prev, mobile: registerData.mobile }));
    }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFieldErrors({});

    const mobileErr = validateMobile(forgotData.mobile);
    const passErr = validatePass(forgotData.newPassword);
    
    if (mobileErr || passErr) {
        setFieldErrors({ mobile: mobileErr, newPassword: passErr });
        return;
    }

    setLoading(true);
    const res = await api.post("/auth/forgot-password", { 
        mobile: forgotData.mobile, 
        oldPassword: forgotData.oldPassword, 
        newPassword: forgotData.newPassword 
    });
    setLoading(false);

   if (!res.success) {
      setFormError(res.error || (res as { message?: string }).message || "Reset failed.");
      return;
    }

    setSuccess("Password changed successfully!");
    setTimeout(() => {
        switchMode("login"); // Use new helper
        setLoginData(prev => ({ ...prev, mobile: forgotData.mobile }));
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-x-hidden">
      <BackgroundGlow />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
               <Crown size={32} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Elite' : 'Change Password'}
            </h1>
            <p className="text-gray-400 text-sm">
                {mode === 'login' ? 'Sign in to continue your streak' : mode === 'register' ? 'Create an account & start winning' : 'Update your credentials'}
            </p>
          </div>

          {/* Global Messages */}
          {formError && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 mb-6 text-sm">
               <AlertCircle size={18} className="shrink-0 text-red-400" />
               <span>{formError}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-200 mb-6 text-sm">
               <CheckCircle size={18} className="shrink-0 text-green-400" />
               <span>{success}</span>
            </div>
          )}

          <div className="bg-[#151925]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            {/* ============== LOGIN FORM ============== */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="9876543210"
                  type="tel"
                  maxLength={10}
                  value={loginData.mobile}
                  onChange={(e) => setLoginData({ ...loginData, mobile: e.target.value.replace(/\D/g, '') })}
                  error={fieldErrors.mobile}
                />

                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${loginData.rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}>
                        {loginData.rememberMe && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={loginData.rememberMe} onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})} className="hidden" />
                    <span className="text-xs text-gray-400">Remember me</span>
                  </label>
                  <button type="button" onClick={() => switchMode("forgot-password")} className="text-xs font-bold text-purple-400 hover:text-purple-300">
                    Forgot/Change Password?
                  </button>
                </div>

                <PrimaryButton type="submit" loading={loading}>Sign In</PrimaryButton>
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    New here? <button type="button" onClick={() => switchMode("register")} className="text-purple-400 font-bold ml-1 hover:underline">Create Account</button>
                  </p>
                </div>
              </form>
            )}

            {/* ============== REGISTER FORM ============== */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
                <CustomInput
                  icon={User}
                  label="Full Name"
                  placeholder="John Doe"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                />
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="9876543210"
                  maxLength={10}
                  value={registerData.mobile}
                  onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value.replace(/\D/g, '') })}
                  error={fieldErrors.mobile}
                />
                <CustomInput
                  icon={Mail}
                  label="Email (Optional)"
                  placeholder="john@example.com"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        error={fieldErrors.password}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mt-2">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${registerData.agreedToTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}>
                        {registerData.agreedToTerms && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={registerData.agreedToTerms} onChange={(e) => setRegisterData({...registerData, agreedToTerms: e.target.checked})} className="hidden" />
                    <span className="text-xs text-gray-500">I agree to the Terms & Privacy Policy</span>
                </label>

                <PrimaryButton type="submit" loading={loading}>Create Account</PrimaryButton>
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    Already a member? <button type="button" onClick={() => switchMode("login")} className="text-purple-400 font-bold ml-1 hover:underline">Sign In</button>
                  </p>
                </div>
              </form>
            )}

            {/* ============== FORGOT/CHANGE PASSWORD FORM ============== */}
            {mode === "forgot-password" && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="9876543210"
                  maxLength={10}
                  value={forgotData.mobile}
                  onChange={(e) => setForgotData({ ...forgotData, mobile: e.target.value.replace(/\D/g, '') })}
                  error={fieldErrors.mobile}
                />

                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="Old Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Current password"
                        value={forgotData.oldPassword}
                        onChange={(e) => setForgotData({ ...forgotData, oldPassword: e.target.value })}
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={forgotData.newPassword}
                        onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                        error={fieldErrors.newPassword}
                    />
                </div>

                <PrimaryButton type="submit" loading={loading}>Update Password</PrimaryButton>
                <div className="text-center mt-4">
                    <button type="button" onClick={() => switchMode("login")} className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={12} /> Back to Login
                    </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="text-center mt-8 space-y-2 opacity-50">
            <p className="text-[10px] text-gray-500">© 2025 DrawWinner. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}