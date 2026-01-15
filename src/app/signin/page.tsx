// // src/app/signin/page.tsx
// "use client";

// import { useState, useEffect, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Eye, EyeOff, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert } from "@/components/ui/alert";
// import { api } from "@/lib/api-client";

// type AuthMode = "login" | "register" | "forgot-password";

// interface LoginResponse {
//   user: {
//     id: string;
//     name: string;
//     email: string | null;
//     mobile: string;
//     role: string;
//     avatar: string | null;
//     wallet: number;
//     createdAt: Date;
//   };
//   redirectUrl: string;
// }

// function SignInContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Get mode from URL or default to login
//   const initialMode = (searchParams.get("mode") as AuthMode) || "login";
//   const redirectPath = searchParams.get("redirect") || null;

//   const [mode, setMode] = useState<AuthMode>(initialMode);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Form data
//   const [loginData, setLoginData] = useState({
//     mobile: "",
//     password: "",
//     rememberMe: false,
//   });

//   const [registerData, setRegisterData] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     password: "",
//     agreedToTerms: false,
//   });

//   const [forgotPasswordData, setForgotPasswordData] = useState({
//     mobile: "",
//     newPassword: "",
//   });

//   // Update URL when mode changes
//   useEffect(() => {
//     const newUrl = new URL(window.location.href);
//     newUrl.searchParams.set("mode", mode);
//     window.history.replaceState({}, "", newUrl);
//   }, [mode]);

//   // Handle login
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const res = await api.post<LoginResponse>("/auth/login", {
//       mobile: loginData.mobile,
//       password: loginData.password,
//     });

//     setLoading(false);

//     if (!res.success) {
//       setError(res.error || "Login failed");
//       return;
//     }

//     // Redirect based on role
//     const finalRedirect = redirectPath || res.data?.redirectUrl || "/";
//     router.replace(finalRedirect);
//   };

//   // Handle register
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!registerData.agreedToTerms) {
//       setError("Please agree to the Terms of Service and Privacy Policy");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");

//     const res = await api.post("/auth/register", {
//       name: registerData.name,
//       mobile: registerData.mobile,
//       email: registerData.email || undefined,
//       password: registerData.password,
//     });

//     setLoading(false);

//     if (!res.success) {
//       setError(res.error || "Registration failed");
//       return;
//     }

//     setSuccess(res.message || "Registration successful!");
//     setTimeout(() => {
//       setMode("login");
//       setLoginData({
//         ...loginData,
//         mobile: registerData.mobile,
//       });
//     }, 1500);
//   };

//   // Handle forgot password
//   const handleForgotPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     const res = await api.post("/auth/forgot-password", {
//       mobile: forgotPasswordData.mobile,
//       newPassword: forgotPasswordData.newPassword,
//     });

//     setLoading(false);

//     if (!res.success) {
//       setError(res.error || "Password reset failed");
//       return;
//     }

//     setSuccess(res.message || "Password reset successful!");
//     setTimeout(() => {
//       setMode("login");
//       setLoginData({
//         ...loginData,
//         mobile: forgotPasswordData.mobile,
//       });
//     }, 1500);
//   };

//   // Password strength
//   const getPasswordStrength = (pass: string) => {
//     if (pass.length === 0) return { label: "", strength: 0, color: "" };
//     if (pass.length < 6)
//       return { label: "Weak", strength: 1, color: "bg-red-500" };
//     if (pass.length < 10)
//       return { label: "Fair", strength: 2, color: "bg-amber-500" };
//     return { label: "Strong", strength: 3, color: "bg-green-500" };
//   };

//   const registerPasswordStrength = getPasswordStrength(registerData.password);
//   const forgotPasswordStrength = getPasswordStrength(
//     forgotPasswordData.newPassword
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
//       <div className="flex-1 flex items-center justify-center p-6 md:p-8">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-10">
//             {mode === "login" && (
//               <>
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
//                   Welcome back
//                 </h1>
//                 <p className="text-base text-gray-600">
//                   Don&apos;t have an account?{" "}
//                   <button
//                     onClick={() => setMode("register")}
//                     className="font-semibold text-gray-900 hover:text-gray-700 underline underline-offset-4"
//                   >
//                     Sign up for free
//                   </button>
//                 </p>
//               </>
//             )}

//             {mode === "register" && (
//               <>
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
//                   Create your account
//                 </h1>
//                 <p className="text-base text-gray-600">
//                   Already have an account?{" "}
//                   <button
//                     onClick={() => setMode("login")}
//                     className="font-semibold text-gray-900 hover:text-gray-700 underline underline-offset-4"
//                   >
//                     Sign in
//                   </button>
//                 </p>
//               </>
//             )}

//             {mode === "forgot-password" && (
//               <>
//                 <button
//                   onClick={() => setMode("login")}
//                   className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
//                 >
//                   <ArrowLeft size={18} />
//                   Back to login
//                 </button>
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
//                   Reset password
//                 </h1>
//                 <p className="text-base text-gray-600">
//                   Enter your mobile number and new password
//                 </p>
//               </>
//             )}
//           </div>

//           {/* Alerts */}
//           {error && (
//             <div className="mb-6">
//               <Alert variant="danger" onClose={() => setError("")}>
//                 {error}
//               </Alert>
//             </div>
//           )}

//           {success && (
//             <div className="mb-6">
//               <Alert variant="success" onClose={() => setSuccess("")}>
//                 {success}
//               </Alert>
//             </div>
//           )}

//           {/* Forms */}
//           <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
//             {/* LOGIN FORM */}
//             {mode === "login" && (
//               <form onSubmit={handleLogin} className="space-y-5">
//                 <Input
//                   type="tel"
//                   label="Mobile number"
//                   placeholder="Enter your mobile number"
//                   value={loginData.mobile}
//                   onChange={(e) =>
//                     setLoginData({ ...loginData, mobile: e.target.value })
//                   }
//                   required
//                   disabled={loading}
//                   autoComplete="tel"
//                 />

//                 <div className="relative">
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     label="Password"
//                     placeholder="Enter your password"
//                     value={loginData.password}
//                     onChange={(e) =>
//                       setLoginData({ ...loginData, password: e.target.value })
//                     }
//                     required
//                     disabled={loading}
//                     autoComplete="current-password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     disabled={loading}
//                     className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-between pt-1">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={loginData.rememberMe}
//                       onChange={(e) =>
//                         setLoginData({
//                           ...loginData,
//                           rememberMe: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 rounded border-gray-300"
//                     />
//                     <span className="text-sm text-gray-700">Remember me</span>
//                   </label>

//                   <button
//                     type="button"
//                     onClick={() => setMode("forgot-password")}
//                     className="text-sm font-medium text-gray-700 hover:text-gray-900"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>

//                 <Button
//                   type="submit"
//                   variant="primary"
//                   size="lg"
//                   loading={loading}
//                   className="mt-6 w-full !bg-gray-900 !text-white hover:!bg-gray-800"
//                 >
//                   Sign in
//                 </Button>
//               </form>
//             )}

//             {/* REGISTER FORM */}
//             {mode === "register" && (
//               <form onSubmit={handleRegister} className="space-y-5">
//                 <Input
//                   type="text"
//                   label="Full name"
//                   placeholder="Enter your full name"
//                   value={registerData.name}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, name: e.target.value })
//                   }
//                   required
//                   disabled={loading}
//                   autoComplete="name"
//                 />

//                 <Input
//                   type="tel"
//                   label="Mobile number"
//                   placeholder="Enter your mobile number"
//                   value={registerData.mobile}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, mobile: e.target.value })
//                   }
//                   required
//                   disabled={loading}
//                   autoComplete="tel"
//                 />

//                 <Input
//                   type="email"
//                   label="Email address (optional)"
//                   placeholder="Enter your email"
//                   value={registerData.email}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, email: e.target.value })
//                   }
//                   disabled={loading}
//                   autoComplete="email"
//                   helperText="We'll use this for account recovery"
//                 />

//                 <div className="space-y-2">
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       label="Password"
//                       placeholder="Create a strong password"
//                       value={registerData.password}
//                       onChange={(e) =>
//                         setRegisterData({
//                           ...registerData,
//                           password: e.target.value,
//                         })
//                       }
//                       required
//                       disabled={loading}
//                       autoComplete="new-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       disabled={loading}
//                       className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
//                       aria-label={
//                         showPassword ? "Hide password" : "Show password"
//                       }
//                     >
//                       {showPassword ? (
//                         <EyeOff size={18} />
//                       ) : (
//                         <Eye size={18} />
//                       )}
//                     </button>
//                   </div>

//                   {registerData.password && (
//                     <div className="space-y-1.5">
//                       <div className="flex items-center gap-1.5">
//                         <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full transition-all duration-300 ${registerPasswordStrength.color}`}
//                             style={{
//                               width: `${
//                                 (registerPasswordStrength.strength / 3) * 100
//                               }%`,
//                             }}
//                           />
//                         </div>
//                         <span className="text-xs font-medium text-gray-600 min-w-[45px]">
//                           {registerPasswordStrength.label}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="pt-2">
//                   <label className="flex items-start gap-3 cursor-pointer group">
//                     <input
//                       type="checkbox"
//                       checked={registerData.agreedToTerms}
//                       onChange={(e) =>
//                         setRegisterData({
//                           ...registerData,
//                           agreedToTerms: e.target.checked,
//                         })
//                       }
//                       className="mt-0.5 w-4 h-4 rounded border-gray-300"
//                       required
//                     />
//                     <span className="text-sm text-gray-600 group-hover:text-gray-900 leading-relaxed">
//                       I agree to DrawHubs{" "}
//                       <a
//                         href="#"
//                         className="font-medium text-gray-900 underline"
//                       >
//                         Terms of Service
//                       </a>{" "}
//                       and{" "}
//                       <a
//                         href="#"
//                         className="font-medium text-gray-900 underline"
//                       >
//                         Privacy Policy
//                       </a>
//                     </span>
//                   </label>
//                 </div>

//                 <Button
//                   type="submit"
//                   variant="primary"
//                   size="lg"
//                   loading={loading}
//                   className="mt-6 w-full !bg-gray-900 !text-white hover:!bg-gray-800"
//                 >
//                   Create account
//                 </Button>
//               </form>
//             )}

//             {/* FORGOT PASSWORD FORM */}
//             {mode === "forgot-password" && (
//               <form onSubmit={handleForgotPassword} className="space-y-5">
//                 <Input
//                   type="tel"
//                   label="Mobile number"
//                   placeholder="Enter your mobile number"
//                   value={forgotPasswordData.mobile}
//                   onChange={(e) =>
//                     setForgotPasswordData({
//                       ...forgotPasswordData,
//                       mobile: e.target.value,
//                     })
//                   }
//                   required
//                   disabled={loading}
//                   autoComplete="tel"
//                 />

//                 <div className="space-y-2">
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       label="New password"
//                       placeholder="Enter your new password"
//                       value={forgotPasswordData.newPassword}
//                       onChange={(e) =>
//                         setForgotPasswordData({
//                           ...forgotPasswordData,
//                           newPassword: e.target.value,
//                         })
//                       }
//                       required
//                       disabled={loading}
//                       autoComplete="new-password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       disabled={loading}
//                       className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
//                       aria-label={
//                         showPassword ? "Hide password" : "Show password"
//                       }
//                     >
//                       {showPassword ? (
//                         <EyeOff size={18} />
//                       ) : (
//                         <Eye size={18} />
//                       )}
//                     </button>
//                   </div>

//                   {forgotPasswordData.newPassword && (
//                     <div className="space-y-1.5">
//                       <div className="flex items-center gap-1.5">
//                         <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full transition-all duration-300 ${forgotPasswordStrength.color}`}
//                             style={{
//                               width: `${
//                                 (forgotPasswordStrength.strength / 3) * 100
//                               }%`,
//                             }}
//                           />
//                         </div>
//                         <span className="text-xs font-medium text-gray-600 min-w-[45px]">
//                           {forgotPasswordStrength.label}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <Button
//                   type="submit"
//                   variant="primary"
//                   size="lg"
//                   loading={loading}
//                   className="mt-6 w-full !bg-gray-900 !text-white hover:!bg-gray-800"
//                 >
//                   Reset password
//                 </Button>
//               </form>
//             )}
//           </div>

//           {/* Footer */}
//           <p className="mt-8 text-center text-xs text-gray-500">
//             By continuing, you agree to DrawHubs{" "}
//             <a href="#" className="text-gray-700 underline">
//               Terms of Service
//             </a>{" "}
//             and{" "}
//             <a href="#" className="text-gray-700 underline">
//               Privacy Policy
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function SignInPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <SignInContent />
//     </Suspense>
//   );
// }

// src/app/signin/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
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
    name: string;
    email: string | null;
    mobile: string;
    role: string;
    avatar: string | null;
    wallet: number;
    createdAt: Date;
  };
  redirectUrl: string;
}

// --- Component Props Interfaces ---

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label: string;
  helperText?: string;
}

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

interface CustomAlertProps {
  type: 'error' | 'success';
  message: string;
  onClose: () => void;
}

// --- Visual Components ---

// 1. Custom Input Field with Neon Focus
const CustomInput = ({ icon: Icon, label, helperText, className, ...props }: CustomInputProps) => (
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
          w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 outline-none
          focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-[#151925]
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
          ${className || ""}
        `}
      />
    </div>
    {helperText && <p className="text-[10px] text-gray-500 ml-1">{helperText}</p>}
  </div>
);

// 2. Custom Primary Button
const PrimaryButton = ({ children, loading, className, disabled, ...props }: PrimaryButtonProps) => (
  <button
    disabled={loading || disabled}
    className={`
      relative w-full overflow-hidden rounded-xl group disabled:opacity-70 disabled:cursor-not-allowed
      bg-gradient-to-r from-purple-600 to-pink-600 p-[1px]
      ${className || ""}
    `}
    {...props}
  >
    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-[#0B0E14] hover:bg-transparent transition-colors rounded-[11px] px-6 py-3.5 flex items-center justify-center gap-2">
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="text-sm font-bold text-white group-hover:text-white tracking-wide uppercase">
          {children}
        </span>
      )}
    </div>
  </button>
);

// 3. Custom Alert
const CustomAlert = ({ type, message, onClose }: CustomAlertProps) => (
  <div className={`
    flex items-start gap-3 p-4 rounded-xl border mb-6 animate-in fade-in slide-in-from-top-2
    ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'}
  `}>
    {type === 'error' ? <AlertCircle size={18} className="mt-0.5 text-red-400" /> : <CheckCircle size={18} className="mt-0.5 text-green-400" />}
    <div className="flex-1 text-sm">{message}</div>
    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">✕</button>
  </div>
);

// 4. Background Glow
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
  const redirectPath = searchParams.get("redirect") || null;

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({ mobile: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({ name: "", mobile: "", email: "", password: "", agreedToTerms: false });
  const [forgotPasswordData, setForgotPasswordData] = useState({ mobile: "", newPassword: "" });

  useEffect(() => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("mode", mode);
    window.history.replaceState({}, "", newUrl);
  }, [mode]);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await api.post<LoginResponse>("/auth/login", { mobile: loginData.mobile, password: loginData.password });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid credentials. Please try again.");
      return;
    }
    const finalRedirect = redirectPath || res.data?.redirectUrl || "/";
    router.replace(finalRedirect);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.agreedToTerms) { setError("You must agree to the terms."); return; }
    
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await api.post("/auth/register", {
      name: registerData.name,
      mobile: registerData.mobile,
      email: registerData.email || undefined,
      password: registerData.password,
    });
    setLoading(false);

    if (!res.success) { setError(res.error || "Registration failed."); return; }
    setSuccess("Account created successfully! Redirecting...");
    setTimeout(() => { changeMode("login"); setLoginData({ ...loginData, mobile: registerData.mobile }); }, 1500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await api.post("/auth/forgot-password", { mobile: forgotPasswordData.mobile, newPassword: forgotPasswordData.newPassword });
    setLoading(false);

    if (!res.success) { setError(res.error || "Reset failed."); return; }
    setSuccess("Password reset successful!");
    setTimeout(() => { changeMode("login"); setLoginData({ ...loginData, mobile: forgotPasswordData.mobile }); }, 1500);
  };

  const changeMode = (nextMode: AuthMode) => {
  setError("");
  setSuccess("");
  setMode(nextMode);
};

  return (
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-x-hidden">
      <BackgroundGlow />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
               <Crown size={32} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>

            {mode === "login" && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-gray-400 text-sm">Sign in to continue your winning streak</p>
              </>
            )}
            {mode === "register" && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join the Elite</h1>
                <p className="text-gray-400 text-sm">Create an account and start winning today</p>
              </>
            )}
            {mode === "forgot-password" && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Access</h1>
                <p className="text-gray-400 text-sm">Securely recover your account</p>
              </>
            )}
          </div>

          {/* Alert Messages */}
          {error && <CustomAlert type="error" message={error} onClose={() => setError("")} />}
          {success && <CustomAlert type="success" message={success} onClose={() => setSuccess("")} />}

          {/* Main Card */}
          <div className="bg-[#151925]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
             
             {/* Top Glow Line */}
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            {/* ============== LOGIN FORM ============== */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="Ex: 9876543210"
                  value={loginData.mobile}
                  onChange={(e) => setLoginData({ ...loginData, mobile: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                    <div className="relative">
                        <CustomInput
                            icon={Lock}
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${loginData.rememberMe ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}>
                        {loginData.rememberMe && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={loginData.rememberMe} 
                      onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})} 
                      className="hidden" 
                    />
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">Remember me</span>
                  </label>
                  <button type="button" onClick={() => changeMode("forgot-password")} className="text-xs font-bold text-purple-400 hover:text-purple-300">
                    Forgot Password?
                  </button>
                </div>

                <PrimaryButton type="submit" loading={loading}>Sign In</PrimaryButton>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    New here? <button type="button" onClick={() => changeMode("register")} className="text-purple-400 hover:text-white font-bold ml-1 transition-colors">Create Account</button>
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
                  placeholder="Enter your name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
                
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="Ex: 9876543210"
                  value={registerData.mobile}
                  onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
                  required
                />

                <CustomInput
                  icon={Mail}
                  label="Email (Optional)"
                  placeholder="name@example.com"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />

                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create strong password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${registerData.agreedToTerms ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}>
                        {registerData.agreedToTerms && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={registerData.agreedToTerms} onChange={(e) => setRegisterData({...registerData, agreedToTerms: e.target.checked})} className="hidden" required />
                    <span className="text-xs text-gray-500 leading-relaxed">
                      I agree to the <span className="text-gray-300">Terms of Service</span> & <span className="text-gray-300">Privacy Policy</span>
                    </span>
                  </label>
                </div>

                <PrimaryButton type="submit" loading={loading}>Create Account</PrimaryButton>

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">
                    Already a member? <button type="button" onClick={() => setMode("login")} className="text-purple-400 hover:text-white font-bold ml-1 transition-colors">Sign In</button>
                  </p>
                </div>
              </form>
            )}

            {/* ============== FORGOT PASSWORD FORM ============== */}
            {mode === "forgot-password" && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <CustomInput
                  icon={Phone}
                  label="Mobile Number"
                  placeholder="Ex: 9876543210"
                  value={forgotPasswordData.mobile}
                  onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, mobile: e.target.value })}
                  required
                />

                <div className="relative">
                    <CustomInput
                        icon={Lock}
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New secure password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                        required
                    />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[34px] text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <PrimaryButton type="submit" loading={loading}>Reset Password</PrimaryButton>

                <div className="text-center mt-4">
                    <button type="button" onClick={() => setMode("login")} className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={12} /> Back to Login
                    </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8 space-y-2 opacity-50 hover:opacity-100 transition-opacity">
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