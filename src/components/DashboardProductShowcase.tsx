import React from 'react';
import { Package, TrendingUp } from 'lucide-react';
import { ProductRecord } from '../types';

interface Props {
  products: ProductRecord[];
}

export default function DashboardProductShowcase({ products }: Props) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-neutral-900 mb-5 px-1 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        PRODUK UNGGULAN KAMI
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
        {products.map(p => (
          <div key={p.id} className="min-w-[260px] bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
               {/* Thumbnail display */}
               <div className="w-10 h-10 bg-emerald-50 rounded-xl overflow-hidden border border-emerald-100 flex items-center justify-center shrink-0">
                 {p.imageUrl ? (
                   <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                 ) : (
                   <div className="text-emerald-600">
                     <Package className="w-5 h-5" />
                   </div>
                 )}
               </div>
               <span className="font-extrabold text-sm text-neutral-900 truncate">{p.name}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-neutral-500 text-[10px] uppercase font-black tracking-wider mb-0.5">HARGA PER KG</p>
                <p className="text-emerald-700 font-bold text-sm">RP {p.pricePerKg.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 text-[10px] uppercase font-black tracking-wider mb-0.5">LOGISTIK FISIK</p>
                <p className="text-neutral-800 font-bold text-sm">{p.stockAvailable.toLocaleString('id-ID')} KG</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
