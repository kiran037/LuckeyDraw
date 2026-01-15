'use client';

import { DrawProduct } from '@/lib/types';
import { Trophy, Star } from 'lucide-react';

interface FeaturedPrizeProps {
  product: DrawProduct;
  drawTitle: string;
}

export default function FeaturedPrize({ product, drawTitle }: FeaturedPrizeProps) {
  return (
    <div className="group bg-white rounded-[1.5rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-50">
      <div className="relative h-40 rounded-[1.2rem] overflow-hidden bg-gray-100 mb-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
            <Trophy size={40} className="text-amber-500/50" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-yellow-950 flex items-center gap-1 shadow-sm">
          <Star size={10} fill="currentColor" /> Featured
        </div>
      </div>

      <div className="px-2 pb-2">
        <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1 opacity-80 truncate">
          {drawTitle}
        </p>
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-3 bg-gray-50 rounded-xl p-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Winners</span>
            <span className="text-sm font-bold text-gray-800">{product.quantity}</span>
          </div>
          <button className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
            <span className="text-lg leading-none mb-0.5">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}