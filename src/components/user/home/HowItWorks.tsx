// // src/components/user/home/HowItWorks.tsx
// 'use client';

// import { Search, CreditCard, Clock, Trophy } from 'lucide-react';

// export default function HowItWorks() {
//   const steps = [
//     {
//       icon: Search,
//       title: 'Browse Draws',
//       description: 'Explore exciting draws with amazing prizes',
//       color: 'from-blue-500 to-cyan-500',
//       bgColor: 'bg-blue-50',
//     },
//     {
//       icon: CreditCard,
//       title: 'Buy Ticket',
//       description: 'Purchase your lucky ticket securely',
//       color: 'from-green-500 to-emerald-500',
//       bgColor: 'bg-green-50',
//     },
//     {
//       icon: Clock,
//       title: 'Wait for Draw',
//       description: 'Results announced at scheduled time',
//       color: 'from-orange-500 to-yellow-500',
//       bgColor: 'bg-orange-50',
//     },
//     {
//       icon: Trophy,
//       title: 'Win Prizes',
//       description: 'Claim your prize if you are the winner!',
//       color: 'from-purple-500 to-pink-500',
//       bgColor: 'bg-purple-50',
//     },
//   ];

//   return (
//     <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-6 sm:p-8">
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">How It Works</h2>
//         <p className="text-gray-600 text-sm">Simple steps to win amazing prizes</p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {steps.map((step, index) => {
//           const Icon = step.icon;
//           return (
//             <div key={index} className="relative">
//               {/* Connecting Line (hidden on mobile, shown on larger screens) */}
//               {index < steps.length - 1 && (
//                 <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 z-0" />
//               )}

//               <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative z-10">
//                 {/* Step Number */}
//                 <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
//                   {index + 1}
//                 </div>

//                 {/* Icon */}
//                 <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
//                   <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
//                     <Icon size={24} className="text-white" />
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <h3 className="font-bold text-gray-800 text-center mb-2">
//                   {step.title}
//                 </h3>
//                 <p className="text-xs text-gray-600 text-center leading-relaxed">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// src/components/user/home/HowItWorks.tsx
'use client';

import { Search, CreditCard, Clock, Trophy, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Browse',
      description: 'Pick a Draw',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      shadow: 'shadow-blue-500/20',
      delay: '0ms',
    },
    {
      icon: CreditCard,
      title: 'Buy',
      description: 'Get Ticket',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      shadow: 'shadow-purple-500/20',
      delay: '100ms',
    },
    {
      icon: Clock,
      title: 'Wait',
      description: 'Results',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      shadow: 'shadow-orange-500/20',
      delay: '200ms',
    },
    {
      icon: Trophy,
      title: 'Win',
      description: 'Claim Prize',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      shadow: 'shadow-green-500/20',
      delay: '300ms',
    },
  ];

  return (
    <div className="relative py-8 px-1">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">How to Play</h2>
          <p className="text-xs text-gray-500 mt-1">Start winning in 4 steps</p>
        </div>
        {/* Decorative pulse */}
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500/10" />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        
        {/* Desktop Connecting Line (Subtle) */}
        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={index} 
              className="group relative"
              style={{ 
                animation: `fadeInUp 0.6s ease-out forwards`,
                animationDelay: step.delay,
                opacity: 0 
              }}
            >
              {/* Connector Arrow (Mobile only, except last) */}
              {index % 2 === 0 && (
                <div className="md:hidden absolute top-1/2 -right-3 -translate-y-1/2 text-white/5 z-0">
                  <ArrowRight size={16} />
                </div>
              )}

              <div className="bg-[#151925] hover:bg-[#1A1F2E] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center text-center relative overflow-hidden">
                
                {/* Tiny Step Label */}
                <div className="absolute top-2 right-2 text-[9px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                  0{index + 1}
                </div>

                {/* Icon Container - Clean & Borderless */}
                <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${step.bg} ${step.color} ${step.shadow} shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)]`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-purple-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">
                  {step.description}
                </p>

                {/* Bottom Glow Bar (Active on Hover) */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${step.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}