'use client';

import { useEffect, useState } from 'react';
import { CAROUSEL_IMAGES, AUTO_SLIDE_INTERVAL } from '@/lib/carousel-config';
import { ArrowRight } from 'lucide-react';

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden group shadow-sm bg-white dark:bg-[#151925] aspect-[2/1] sm:aspect-[2.4/1] md:h-[400px]">
      
      {/* Images */}
      <div 
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {CAROUSEL_IMAGES.map((image, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={image}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = `https://placehold.co/1200x600/f3f4f6/000000?text=Event+${index + 1}`; }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 right-6 z-30 flex gap-2">
        {CAROUSEL_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}