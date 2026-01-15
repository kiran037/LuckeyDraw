'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ImageUpload from '@/components/ui/Upload';
import { 
  LogOut, Ticket, Bell, Edit2, 
  X, MapPin, Shield, LucideIcon, 
  User, Smartphone, Mail, Lock, Save, ChevronRight
} from 'lucide-react';

// --- Interfaces ---

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string | null;
    mobile: string;
    role: string;
    avatar: string | null;
    createdAt: string;
  };
  stats: {
    totalTickets: number;
    winningTickets: number;
    unreadNotifications: number;
  };
}

interface UpdateProfilePayload {
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  currentPassword?: string;
  newPassword?: string;
  [key: string]: unknown;
}

interface PageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// --- Props & Components ---

interface ChromeButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  variant?: 'default' | 'danger';
  className?: string;
}

interface BezelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

type StatColor = 'blue' | 'emerald' | 'purple' | 'pink';

interface StatBlockProps {
  label: string;
  value: string | number;
  color: StatColor;
}

// --- Visual Components ---

const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 pointer-events-none select-none bg-[#09090b]">
    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen" />
    <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" />
  </div>
);

const ChromeButton = ({ icon: Icon, onClick, active, variant = 'default', className }: ChromeButtonProps) => (
  <button 
    onClick={onClick}
    type="button"
    className={`
      relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300
      bg-gradient-to-b from-[#2a303c] to-[#151922]
      border-t border-white/10 border-b border-black/50
      shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5),0_4px_6px_-2px_rgba(0,0,0,0.1)]
      active:translate-y-[2px] active:shadow-none
      hover:brightness-110
      ${active ? 'ring-1 ring-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}
      ${variant === 'danger' ? 'hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
      ${className || ''}
    `}
  >
    <Icon 
      size={18} 
      className={`
        relative z-10 transition-colors duration-300
        ${variant === 'danger' 
          ? 'text-red-500 group-hover:text-red-400' 
          : active ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}
      `} 
    />
  </button>
);

const BezelButton = ({ children, onClick, disabled, className, icon: Icon, type = 'button', ...props }: BezelButtonProps) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    type={type}
    {...props}
    className={`relative group/btn ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="absolute inset-0 bg-[#2d1b38] rounded-full blur-[1px] transform scale-105" />
    <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-md group-hover/btn:blur-lg transition-all" />
    <div className="relative bg-[#1a0b2e] p-[2px] rounded-full shadow-inner">
       <div className="
          relative px-6 py-2.5 rounded-full overflow-hidden
          bg-gradient-to-b from-[#e879f9] to-[#9333ea]
          border-t border-white/30
          shadow-[0_4px_10px_rgba(147,51,234,0.4)]
          flex items-center justify-center gap-2
          transition-transform active:scale-95
       ">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-white/20 blur-[3px] rounded-b-full pointer-events-none" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:4px_4px] pointer-events-none" />
          <span className="relative z-10 text-white font-bold text-sm tracking-wide shadow-black drop-shadow-sm">
              {children}
          </span>
          {Icon && <Icon size={16} className="relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />}
       </div>
    </div>
  </button>
);

const InputField = ({ label, icon: Icon, className, ...props }: InputFieldProps) => (
  <div className="space-y-1.5">
    {label && <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input 
        {...props}
        className={`w-full bg-[#0d1017] border border-[#232836] rounded-xl px-4 py-3.5 
        ${Icon ? 'pl-11' : ''} text-sm text-white placeholder-gray-600
        shadow-inner
        focus:outline-none focus:border-purple-500/50 focus:bg-[#11141d] 
        transition-all duration-300 ${className || ''}`}
      />
    </div>
  </div>
);

const statColors: Record<StatColor, { bg: string; line: string }> = {
  blue: { bg: 'bg-blue-500', line: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-500', line: 'bg-emerald-500' },
  purple: { bg: 'bg-purple-500', line: 'bg-purple-500' },
  pink: { bg: 'bg-pink-500', line: 'bg-pink-500' },
};

const StatBlock = ({ label, value, color }: StatBlockProps) => {
  const styles = statColors[color];
  return (
    <div className="flex flex-col items-center justify-center bg-[#13161c] border border-white/5 p-4 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${styles.bg}`} />
      <span className="text-2xl sm:text-3xl font-black text-white mb-1 z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">{value}</span>
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider z-10">{label}</span>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-t-full ${styles.line} shadow-[0_-2px_10px_currentColor]`} />
    </div>
  );
};

const LogoutModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-[#151922] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 ring-1 ring-red-500/30">
            <LogOut size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sign Out?</h3>
          <p className="text-xs text-gray-400 mb-6">Are you sure you want to end your session?</p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={onClose} className="py-2.5 rounded-xl bg-[#0B0E14] text-gray-300 font-bold text-xs border border-white/5 hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={onConfirm} className="py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-900/30 hover:bg-red-500 transition-colors">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    avatar: null as string | null,
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      setLoading(true);
      try {
        // FIX: CHANGED '/api/user/profile' -> '/user/profile' (API client likely adds /api)
        const response = await api.get('/user/profile') as unknown as PageApiResponse<ProfileData>;
        
        if (isMounted) {
          if (response.success && response.data) {
            setProfile(response.data);
            setFormData({
              name: response.data.user.name || '',
              email: response.data.user.email || '',
              mobile: response.data.user.mobile || '',
              avatar: response.data.user.avatar,
              currentPassword: '',
              newPassword: ''
            });
          } else {
             if (response.status === 401 || response.message?.includes('Unauthorized')) {
               router.push('/login');
               return;
             }
             setError(response.message || response.error || "Failed to load profile");
          }
        }
      } catch (e) {
        if (isMounted) setError("Network error occurred");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();

    return () => { isMounted = false; };
  }, [router]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload: UpdateProfilePayload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      avatar: formData.avatar
    };

    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    try {
      // FIX: CHANGED '/api/user/profile' -> '/user/profile'
      const res = await api.patch('/user/profile', payload as Record<string, unknown>) as unknown as PageApiResponse<ProfileData>;
      
      if (res.success && res.data) { 
        setIsEditing(false);
        setProfile(prev => prev ? ({...prev, user: { ...prev.user, ...res.data?.user }}) : null);
        setFormData(prev => ({...prev, currentPassword: '', newPassword: ''}));
        alert("Profile updated successfully!");
      } else { 
        alert(res.message || res.error || "Failed to update profile"); 
      }
    } catch (e) {
      alert("Failed to connect to server");
    }
    setIsSaving(false);
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    }
    router.push('/signin');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><LoadingSpinner /></div>;
  if (!profile) return null;

// FIX: Added ?. to safely access stats
  const winRate = profile.stats?.totalTickets > 0 
    ? ((profile.stats.winningTickets / profile.stats.totalTickets) * 100).toFixed(0) 
    : '0';

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white pb-24 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <BackgroundGlow />
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Profile</h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage your account settings and view stats.</p>
            </div>
            
            <div className="flex gap-3">
                <ChromeButton 
                  icon={isEditing ? X : Edit2} 
                  active={isEditing} 
                  onClick={() => setIsEditing(!isEditing)} 
                />
                <ChromeButton 
                  icon={LogOut} 
                  variant="danger" 
                  onClick={() => setShowLogoutModal(true)} 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#12151d]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"/>
              <div className="relative mb-5 mt-4">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full opacity-30 blur-lg animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#12151d] shadow-2xl bg-[#0B0E14]">
                      <img 
src={profile.user?.avatar || `https://ui-avatars.com/api/?name=${profile.user?.name || 'User'}&background=12151d&color=fff`}
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                  </div>
              </div>
             {/* Update these lines below the image as well */}
<h2 className="text-xl font-bold text-white mb-1">{profile.user?.name}</h2>
<p className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-6 tracking-wide">
  ID: {profile.user?.id?.slice(-6).toUpperCase()}
</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                 <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B0E14] border border-white/5 text-[10px] font-bold text-gray-300">
                    <Shield size={14} className="text-emerald-400" />
                    VERIFIED
                 </div>
                 <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B0E14] border border-white/5 text-[10px] font-bold text-gray-300">
                    <MapPin size={14} className="text-blue-400" />
                    INDIA
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="bg-[#12151d]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                      <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Edit2 size={20} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-white">Edit Details</h3>
                          <p className="text-xs text-gray-400">Make changes to your personal information.</p>
                      </div>
                  </div>
                  <div className="flex justify-center mb-8">
                      <ImageUpload value={formData.avatar} onChange={(b64: string | null) => setFormData({...formData, avatar: b64})} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <InputField 
                        label="Full Name" 
                        icon={User}
                        value={formData.name} 
                        onChange={(e) => handleInputChange(e, 'name')} 
                      />
                      <InputField 
                        label="Mobile Number" 
                        icon={Smartphone}
                        value={formData.mobile} 
                        onChange={(e) => handleInputChange(e, 'mobile')} 
                      />
                  </div>
                  <div className="mb-8">
                      <InputField 
                        label="Email Address" 
                        icon={Mail}
                        value={formData.email} 
                        onChange={(e) => handleInputChange(e, 'email')} 
                      />
                  </div>
                  <div className="bg-[#0f1218] p-5 rounded-2xl border border-white/5 mb-8">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield size={12} className="text-orange-400"/> Security (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField 
                          type="password" 
                          label="New Password"
                          icon={Lock}
                          placeholder="••••••••" 
                          value={formData.newPassword} 
                          onChange={(e) => handleInputChange(e, 'newPassword')} 
                        />
                        <div className={`${!formData.newPassword ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                            <InputField 
                              type="password" 
                              label="Current Password"
                              icon={Lock}
                              placeholder="Required to save" 
                              value={formData.currentPassword} 
                              onChange={(e) => handleInputChange(e, 'currentPassword')} 
                            />
                        </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <BezelButton type="submit" disabled={isSaving} icon={Save} className="w-full sm:w-auto">
                          {isSaving ? 'Saving...' : 'Save Changes'}
                      </BezelButton>
                  </div>
              </form>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-3 gap-3">
<StatBlock label="Tickets" value={profile.stats?.totalTickets ?? 0} color="blue" />
<StatBlock label="Wins" value={profile.stats?.winningTickets ?? 0} color="emerald" />

                      <StatBlock label="Win Rate" value={`${winRate}%`} color="purple" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        onClick={() => router.push('/user/tickets')}
                        className="group relative cursor-pointer h-36 rounded-2xl bg-[#12151d] border border-white/5 p-5 flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-lg"
                      >
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/10 blur-[50px] group-hover:bg-purple-600/20 transition-colors" />
                          <div className="w-10 h-10 rounded-lg bg-[#1a1f29] border border-white/5 flex items-center justify-center text-purple-400 shadow-sm group-hover:scale-110 transition-transform">
                              <Ticket size={20} />
                          </div>
                          <div>
                              <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">My Tickets</h3>
                                  <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1">View active draws & history</p>
                          </div>
                      </div>
                      <div 
                        onClick={() => router.push('/user/notifications')}
                        className="group relative cursor-pointer h-36 rounded-2xl bg-[#12151d] border border-white/5 p-5 flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg"
                      >
                           <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/10 blur-[50px] group-hover:bg-blue-600/20 transition-colors" />
                          <div className="w-10 h-10 rounded-lg bg-[#1a1f29] border border-white/5 flex items-center justify-center text-blue-400 shadow-sm group-hover:scale-110 transition-transform relative">
                              <Bell size={20} />
{(profile.stats?.unreadNotifications ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1a1f29]" />
                              )}
                          </div>
                          <div>
                              <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Notifications</h3>
{(profile.stats?.unreadNotifications ?? 0) > 0 && (
                                    <span className="bg-red-500/10 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
{profile.stats?.unreadNotifications ?? 0} NEW
                                    </span>
                                  )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1">Updates on your wins</p>
                          </div>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}