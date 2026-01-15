// // src/components/user/home/HeroCarousel.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { CAROUSEL_IMAGES, AUTO_SLIDE_INTERVAL } from '@/lib/carousel-config';

// export default function HeroCarousel() {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);

//   useEffect(() => {
//     if (!isAutoPlaying) return;

//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
//     }, AUTO_SLIDE_INTERVAL);

//     return () => clearInterval(interval);
//   }, [isAutoPlaying]);

//   const goToPrevious = () => {
//     setCurrentIndex((prev) => 
//       prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1
//     );
//     setIsAutoPlaying(false);
//   };

//   const goToNext = () => {
//     setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
//     setIsAutoPlaying(false);
//   };

//   const goToSlide = (index: number) => {
//     setCurrentIndex(index);
//     setIsAutoPlaying(false);
//   };

//   return (
//     <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] rounded-2xl overflow-hidden shadow-xl bg-gray-200 group">
//       {/* Images */}
//       <div 
//         className="flex transition-transform duration-500 ease-out h-full"
//         style={{ transform: `translateX(-${currentIndex * 100}%)` }}
//       >
//         {CAROUSEL_IMAGES.map((image, index) => (
//           <div key={index} className="min-w-full h-full relative">
//             <img
//               src={image}
//               alt={`Banner ${index + 1}`}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 // Fallback for missing images
//                 e.currentTarget.src = `https://placehold.co/1200x400/6366f1/ffffff?text=Banner+${index + 1}`;
//               }}
//             />
//             {/* Gradient Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
//           </div>
//         ))}
//       </div>

//       {/* Navigation Arrows */}
//       <button
//         onClick={goToPrevious}
//         className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
//         aria-label="Previous slide"
//       >
//         <ChevronLeft size={20} className="text-gray-800" />
//       </button>

//       <button
//         onClick={goToNext}
//         className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
//         aria-label="Next slide"
//       >
//         <ChevronRight size={20} className="text-gray-800" />
//       </button>

//       {/* Dots Indicator */}
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//         {CAROUSEL_IMAGES.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className={`transition-all ${
//               index === currentIndex
//                 ? 'w-8 h-2 bg-white'
//                 : 'w-2 h-2 bg-white/50 hover:bg-white/75'
//             } rounded-full`}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// src/components/user/home/HeroCarousel.tsx
'use client';

import { useEffect, useState } from 'react';
import { CAROUSEL_IMAGES, AUTO_SLIDE_INTERVAL } from '@/lib/carousel-config';

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden group shadow-2xl shadow-purple-900/10">
      
      {/* Outer Glow/Border */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-white/10 pointer-events-none z-30" />
      
      {/* Aspect Ratio Container - Prevents layout shift */}
      <div className="relative aspect-[2/1] sm:aspect-[2.4/1] md:h-[320px] lg:h-[380px] bg-[#151925]">
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {CAROUSEL_IMAGES.map((image, index) => (
            <div key={index} className="min-w-full h-full relative">
              <img
                src={image}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/1200x600/1e1e2e/ffffff?text=Event+${index + 1}`; }}
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/20 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/80 via-transparent to-transparent opacity-60" />
              
              {/* Featured Badge */}
              <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-8 z-20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] sm:text-xs font-bold text-white border border-white/10 mb-2 shadow-lg">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    FEATURED EVENT
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Dots Indicator */}
      <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 z-30 flex gap-1.5">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentIndex
                ? 'w-6 h-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}