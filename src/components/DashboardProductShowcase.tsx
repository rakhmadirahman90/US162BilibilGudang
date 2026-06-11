import React from 'react';
import { initialProducts as products } from '../data';
import { Package, TrendingUp } from 'lucide-react';

export default function DashboardProductShowcase() {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-neutral-900 mb-5 px-1 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        Produk Unggulan Kami
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
        {products.map(p => (
          <div key={p.id} className="min-w-[260px] bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                 <Package className="w-5 h-5" />
               </div>
               <span className="font-extrabold text-sm text-neutral-900 truncate">{p.name}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Harga</p>
                <p className="text-emerald-700 font-bold text-sm">Rp {p.pricePerKg.toLocaleString('id-ID')}/Kg</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Stok</p>
                <p className="text-neutral-800 font-bold text-sm">{p.stockAvailable.toLocaleString('id-ID')} Kg</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
