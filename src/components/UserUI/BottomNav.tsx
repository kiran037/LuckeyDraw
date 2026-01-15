// // src/components/Navigation/ResponsiveNav.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Home, Ticket, Trophy, User, LayoutGrid } from 'lucide-react';

// export default function ResponsiveNav() {
//   const pathname = usePathname();

//   const navItems = [
//     { icon: Home, label: 'Home', href: '/' },
//     { icon: LayoutGrid, label: 'Draws', href: '/user/draws' },
//     { icon: Ticket, label: 'Tickets', href: '/user/tickets' },
//     { icon: Trophy, label: 'Winners', href: '/user/winners' },
//     { icon: User, label: 'Profile', href: '/user/profile' },
//   ];

//   return (
//     <>
   
//       <div className="
//         fixed z-50 
//         bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md
//         md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:w-auto md:max-w-none
//       ">
        
//         {/* The Glassy Dock/Pill */}
//         <nav className="
//           relative 
//           bg-[#151925]/80 backdrop-blur-2xl 
//           border border-white/10 border-t-white/20
//           shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
//           rounded-3xl
//           p-2
//           flex md:flex-col items-center justify-between md:justify-center md:gap-6
//         ">
          
//           {/* Inner Glow Mesh (Subtle Background) */}
//           <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />

//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             const Icon = item.icon;

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="group relative flex flex-col items-center justify-center p-2 w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-300"
//               >
//                 {/* 1. Active Background "Spotlight" */}
//                 <div className={`
//                   absolute inset-0 rounded-2xl transition-all duration-500
//                   ${isActive 
//                     ? 'bg-gradient-to-tr from-purple-600/20 to-blue-600/20 opacity-100 scale-100 border border-white/5' 
//                     : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-95 group-hover:bg-white/5'}
//                 `} />

//                 {/* 2. Active Glow Orb (Behind Icon) */}
//                 {isActive && (
//                   <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
//                 )}

//                 {/* 3. Icon Container */}
//                 <div className={`
//                   relative z-10 transition-transform duration-300
//                   ${isActive ? 'md:translate-y-0 translate-y-[-2px]' : 'group-hover:scale-110'}
//                 `}>
//                   <Icon 
//                     size={24} 
//                     className={`
//                       transition-all duration-300
//                       ${isActive 
//                         ? 'text-white stroke-[2.5px] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
//                         : 'text-gray-500 group-hover:text-gray-300'}
//                     `} 
//                   />
//                 </div>
                
//                 {/* 4. Desktop Tooltip (Left Hover) */}
//                 <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-[#151925] border border-white/10 rounded-lg text-xs font-bold text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl z-50">
//                   {item.label}
//                   {/* Tooltip Arrow */}
//                   <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-[4px] border-b-[4px] border-r-[4px] border-t-transparent border-b-transparent border-r-[#151925]" />
//                 </div>

//                 {/* 5. Mobile Indicator Dot (Bottom) */}
//                 <span className={`
//                   md:hidden absolute bottom-2 w-1 h-1 rounded-full transition-all duration-300
//                   ${isActive ? 'bg-purple-400 shadow-[0_0_8px_currentColor] scale-100' : 'bg-transparent scale-0'}
//                 `} />

//               </Link>
//             );
//           })}
//         </nav>
//       </div>
//     </>
//   );
// }

// src/components/Navigation/ResponsiveNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Trophy, User, LayoutGrid } from 'lucide-react';

export default function ResponsiveNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutGrid, label: 'Draws', href: '/user/draws' },
    { icon: Ticket, label: 'Tickets', href: '/user/tickets' },
    { icon: Trophy, label: 'Winners', href: '/user/winners' },
    { icon: User, label: 'Profile', href: '/user/profile' },
  ];

  return (
    <>
      <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md md:bottom-auto md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:w-auto md:max-w-none">
        
        {/* The Glassy Dock/Pill */}
        <nav className="relative bg-[#151925]/80 backdrop-blur-2xl border border-white/10 border-t-white/20 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] rounded-3xl p-2 flex md:flex-col items-center justify-between md:justify-center md:gap-6">
          
          {/* Inner Glow Mesh (Subtle Background) */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center justify-center p-2 w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-300"
              >
                {/* 1. Active Background "Spotlight" */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${isActive ? 'bg-gradient-to-tr from-purple-600/20 to-blue-600/20 opacity-100 scale-100 border border-white/5' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-95 group-hover:bg-white/5'}`} />

                {/* 2. Active Glow Orb (Behind Icon) */}
                {isActive && (
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                )}

                {/* 3. Icon Container */}
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'md:translate-y-0 translate-y-[-2px]' : 'group-hover:scale-110'}`}>
                  <Icon 
                    size={24} 
                    className={`transition-all duration-300 ${isActive ? 'text-white stroke-[2.5px] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`} 
                  />
                </div>
                
                {/* 4. Desktop Tooltip (Left Hover) */}
                <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-[#151925] border border-white/10 rounded-lg text-xs font-bold text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-xl z-50">
                  {item.label}
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-[4px] border-b-[4px] border-r-[4px] border-t-transparent border-b-transparent border-r-[#151925]" />
                </div>

                {/* 5. Mobile Indicator Dot (Bottom) */}
                <span className={`md:hidden absolute bottom-2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-purple-400 shadow-[0_0_8px_currentColor] scale-100' : 'bg-transparent scale-0'}`} />

              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}