"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  CreditCard,
  Ticket,
  Trophy,
  BarChart3,
  ChevronDown,
  LogOut,
  User,
  Pin,
  PinOff,
  Shield,
} from "lucide-react";
import LogoutModal from "./LogoutModal";
import Image from "next/image";

interface SidebarProps {
  userRole?: string;
  user?: { name?: string; email?: string } | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  children?: {
    label: string;
    href: string;
  }[];
}

export default function Sidebar({ userRole, user }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Get display name and email with fallbacks
  const displayName = userData?.name || user?.name || "User";
  const displayEmail = userData?.email || user?.email || "user@example.com";
  const displayRole = userRole || userData?.role || "Admin";

  const handleLogout = () => {
    router.push("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isExpanded = isHovered || isPinned;

  const filteredMenu: MenuItem[] = [
    { label: "Dashboard", icon: LayoutGrid, href: "/admin/dashboard" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Draws", icon: Trophy, href: "/admin/draws" },
    { label: "Payments", icon: CreditCard, href: "/admin/payments" },
    { label: "Tickets", icon: Ticket, href: "/admin/tickets" },
    { label: "Reports", icon: BarChart3, href: "/admin/reports" },
  ];

  return (
    <>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!showProfileMenu) {
            setIsHovered(false);
          }
        }}
        className="h-screen bg-white border-r border-gray-100 sticky top-0 flex flex-col z-40 select-none shadow-sm transition-all duration-300 ease-out"
        style={{
          width: isExpanded ? "280px" : "88px",
        }}
      >
        {/* Header */}
        <div className="h-24 flex items-center px-4 border-b border-gray-50 overflow-hidden">
          <div className="flex items-center gap-3 w-full">
<div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
  <Image
    src="/logo.png" // your logo path in /public
    alt="Sawariya Lucky Draw"
    width={48}
    height={48}
    className="object-contain"
    priority
  />
</div>
            <div
              className="flex-1 min-w-0 transition-all duration-300"
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? "translateX(0)" : "translateX(-16px)",
                pointerEvents: isExpanded ? "auto" : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Sawariya
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Luckey Draw
                  </p>
                </div>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                  title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                >
                  {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = item.children
              ? item.children.some((child) => pathname === child.href)
              : pathname === item.href;
            const hasChildren = item.children && item.children.length > 0;
            const isItemExpanded = expandedItems.includes(item.label);

            return (
              <div key={item.label} className="space-y-1">
                <div
                  onClick={() => hasChildren && toggleExpanded(item.label)}
                  className="relative"
                >
                  {hasChildren ? (
                    <div
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 group ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={`flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <div
                        className="flex flex-1 items-center justify-between min-w-0 transition-all duration-300"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          pointerEvents: isExpanded ? "auto" : "none",
                        }}
                      >
                        <span className="text-[15px] font-bold truncate">
                          {item.label}
                        </span>
                        <ChevronDown
                          size={16}
                          className="opacity-50 transition-transform duration-200"
                          style={{
                            transform: isItemExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href || "#"} className="block">
                      <div
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 group ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          size={22}
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span
                          className="text-[15px] font-bold truncate transition-all duration-300"
                          style={{
                            opacity: isExpanded ? 1 : 0,
                            pointerEvents: isExpanded ? "auto" : "none",
                          }}
                        >
                          {item.label}
                        </span>
                        {isActive && !isExpanded && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-900 rounded-l-full" />
                        )}
                      </div>
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {isExpanded && hasChildren && (
                  <div
                    className="overflow-hidden pl-11 space-y-1 transition-all duration-300"
                    style={{
                      maxHeight: isItemExpanded ? "384px" : "0",
                      opacity: isItemExpanded ? 1 : 0,
                    }}
                  >
                    {item.children!.map((child) => (
                      <Link key={child.label} href={child.href}>
                        <div
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            pathname === child.href
                              ? "text-slate-900 bg-slate-50"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                          }`}
                        >
                          {child.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-150"
              style={{
                transform: "scale(1)",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-200 hover:ring-gray-300 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div
                className="text-left min-w-0 flex-1 transition-all duration-300"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? "translateX(0)" : "translateX(-16px)",
                  pointerEvents: isExpanded ? "auto" : "none",
                }}
              >
                <div className="text-sm font-bold text-gray-900 truncate">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-gray-400 transition-all duration-300"
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: showProfileMenu
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>

            {/* Profile Popup Menu */}
            {showProfileMenu && isExpanded && (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setShowProfileMenu(false);
                }}
                className="absolute bottom-0 left-full ml-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden z-50"
                style={{
                  boxShadow:
                    "0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 10px 20px -10px rgba(0, 0, 0, 0.2)",
                  animation: "slide-up 0.3s ease-out",
                }}
              >
                {/* Enhanced User Info Header */}
                <div className="relative px-5 pt-6 pb-5 bg-gradient-to-br from-slate-50 to-gray-50 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-4 ring-white shadow-lg">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="text-base font-bold text-gray-900 truncate mb-0.5">
                        {displayName}
                      </div>
                      <div className="text-sm text-gray-600 truncate mb-2">
                        {displayEmail}
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-xs font-bold text-slate-700 shadow-sm">
                        <Shield size={12} className="text-slate-500" />
                        <span>{displayRole}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-3 px-2">
                  {/* Profile Link */}
                  <Link
                    href="/admin/profile"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all text-gray-700 cursor-pointer hover:bg-slate-50 hover:translate-x-1 group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <User size={20} className="text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">View Profile</div>
                        <div className="text-xs text-gray-500">
                          Manage your account
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="my-2 mx-4 border-t border-gray-200" />

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all hover:bg-red-50 hover:translate-x-1 group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 transition-colors">
                      <LogOut size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-sm text-red-600">
                        Log Out
                      </div>
                      <div className="text-xs text-red-500">
                        Sign out of your account
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
