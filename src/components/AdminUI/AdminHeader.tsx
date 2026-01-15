"use client";

import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Bell, Search } from "lucide-react";
import Image from "next/image";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string | null;
    avatar: string | null;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full flex items-center justify-between">
      {/* Left: Mobile Toggle (Placeholder) / Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* You can add a Mobile Menu Trigger here later */}
        <div className="hidden md:flex items-center text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
          <Search className="w-4 h-4 mr-2 opacity-50" />
          <span>Search dashboard...</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-primary"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden relative">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                alt={user.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}