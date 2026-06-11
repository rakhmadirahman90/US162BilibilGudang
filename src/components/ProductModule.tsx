import React from 'react';
import { Package, Star } from 'lucide-react';
import { ProductRecord } from '../types';

interface Props {
  sessionUser: { username: string; role: 'admin' | 'operator' } | null;
  products: ProductRecord[];
}

export default function ProductModule({ products }: Props) {
  return (
    <div className="bg-[#fafafa]/50 rounded-xl p-1 sm:p-2">
      {/* Header Section - Extremely Compact */}
      <div className="mb-2 flex flex-row items-center justify-between gap-2 border-b border-neutral-100 pb-1 px-1">
        <div className="flex flex-row items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black text-neutral-900 tracking-tight uppercase">
            {products.length} KATALOG PRODUK AKTIF
          </h2>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black border border-emerald-100 flex items-center gap-1 uppercase">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
          REAL-TIME READY
        </div>
      </div>

      {/* Grid Layout - Extremely Dense to fit the screen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1.5">
        {products.map(p => (
          <div key={p.id} className="group bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden h-fit">
            {/* Image Preview - Smaller aspect for compactness */}
            <div className="aspect-square bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden relative">
              {p.imageUrl ? (
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
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
                <Package className="w-5 h-5 opacity-10" />
                <span className="font-bold uppercase tracking-widest text-[5px] opacity-30">NO IMG</span>
              </div>
              
              {p.stockAvailable <= 0 && (
                <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                  <div className="bg-rose-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tight">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>

            <div className="p-1.5 flex-1 flex flex-col gap-1 bg-white">
              <h3 className="font-black text-[9px] text-neutral-900 leading-[1.1] line-clamp-2 uppercase tracking-tighter h-[20px]">{p.name}</h3>
              
              <div className="flex flex-col gap-0.5 mt-auto">
                <div className="flex justify-between items-center border-b border-neutral-50 pb-0.5">
                  <span className="text-[5px] font-black text-neutral-400 uppercase">RP/KG</span>
                  <span className="font-black text-emerald-700 text-[9px] tabular-nums tracking-tighter">
                    {p.pricePerKg.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[5px] font-black text-neutral-400 uppercase">STOK</span>
                  <p className="text-neutral-800 font-extrabold text-[9px] tabular-nums tracking-tighter leading-none">
                    {p.stockAvailable.toLocaleString('id-ID')} <span className="text-[6px] text-neutral-400 uppercase">KG</span>
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
