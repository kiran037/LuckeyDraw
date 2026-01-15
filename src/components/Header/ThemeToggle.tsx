'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect runs after the browser paints, avoiding the error
  useEffect(() => {
    setMounted(true);
  }, []);

  // During server-side rendering (SSR), we cannot know the theme yet.
  // To avoid hydration mismatch, we render a "skeleton" or empty button of the exact same size.
  if (!mounted) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent" />
    );
  }

  // Use resolvedTheme to handle 'system' preference correctly
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="relative group w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white hover:shadow-md dark:hover:bg-white/10 border border-transparent dark:border-white/5 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {/* Sun Icon (Visible in Light Mode) */}
      <Sun 
        size={18} 
        className={`absolute transition-all duration-300 ${
          currentTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`} 
      />
      
      {/* Moon Icon (Visible in Dark Mode) */}
      <Moon 
        size={18} 
        className={`absolute transition-all duration-300 ${
          currentTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`} 
      />
    </button>
  );
}