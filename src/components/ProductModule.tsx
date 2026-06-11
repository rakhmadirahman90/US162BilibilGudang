import React from 'react';
import { Package, Star } from 'lucide-react';
import { ProductRecord } from '../types';

interface Props {
  sessionUser: { username: string; role: 'admin' | 'operator' } | null;
  products: ProductRecord[];
}

export default function ProductModule({ products }: Props) {
  return (
    <div className="bg-[#fafafa]/50 rounded-2xl p-1 sm:p-2">
      {/* Header Section - Ultra Compact */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 px-2">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Produk Tersedia
          </h2>
          <p className="text-neutral-400 font-medium text-[10px]">Katalog komoditas pertanian US Bilibili 162</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-black border border-neutral-200 flex items-center gap-2 shadow-sm self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {products.length} VARIAN
        </div>
      </div>

      {/* Grid Layout - Efficient Tiling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4">
        {products.map(p => (
          <div key={p.id} className="group bg-white rounded-xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full">
            {/* Image Preview - Fixed shorter aspect ratio */}
            <div className="aspect-[16/10] bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden relative">
              {p.imageUrl ? (
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.image-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`image-fallback ${p.imageUrl ? 'hidden' : ''} text-neutral-300 text-center flex flex-col items-center gap-1`}>
                <Package className="w-8 h-8 opacity-10" />
                <span className="font-bold uppercase tracking-widest text-[7px] opacity-30">No Image</span>
              </div>
              
              {p.stockAvailable <= 0 && (
                <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="bg-rose-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider">
                    Sold Out
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 flex-1 flex flex-col gap-2">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-[13px] text-neutral-900 leading-tight line-clamp-1">{p.name}</h3>
                <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed h-[30px]">{p.description}</p>
              </div>

              {/* Characteristics Bar */}
              <div className="flex flex-wrap gap-1 mt-1">
                {p.characteristics.slice(0, 2).map((c, i) => (
                  <span key={i} className="text-[8px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold uppercase tracking-tighter">
                    {c}
                  </span>
                ))}
              </div>

              {/* Pricing & Stock - Dense Footer */}
              <div className="mt-auto pt-2 border-t border-neutral-50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[7px] font-black text-neutral-400 capitalize block leading-none mb-0.5">Harga</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-black text-emerald-800 text-xs tabular-nums tracking-tighter">
                      Rp {p.pricePerKg.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-bold">/Kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-black text-neutral-400 capitalize block leading-none mb-0.5">Logistik</span>
                  <p className="text-neutral-900 font-black text-[11px] tabular-nums tracking-tighter">
                    {p.stockAvailable.toLocaleString('id-ID')} <span className="text-[8px] text-neutral-400">Kg</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
