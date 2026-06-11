import React from 'react';
import { Package, Star } from 'lucide-react';
import { ProductRecord } from '../types';

interface Props {
  sessionUser: { username: string; role: 'admin' | 'operator' } | null;
  products: ProductRecord[];
}

export default function ProductModule({ products }: Props) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-8 text-neutral-900 border-b pb-4">Produk Unggulan US Bilibili 162</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-5">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-neutral-900">{p.name}</h3>
            </div>
            
            {/* Image display */}
            <div className="mb-4 aspect-video bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200 overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-neutral-400 text-xs text-center p-2">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Belum ada gambar
                </div>
              )}
            </div>
            
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed bg-neutral-50 p-3 rounded-lg min-h-[80px]">{p.description}</p>
            <div className="mb-6">
              <h4 className="font-bold text-xs text-neutral-500 uppercase tracking-widest mb-3">Karakteristik</h4>
              <div className="flex flex-wrap gap-2">
                {p.characteristics.map((c, i) => (
                  <span key={i} className="flex items-center gap-2 text-[10px] text-neutral-700 bg-neutral-100 py-1 px-3 rounded-full font-bold">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-5 border-neutral-100 mt-auto">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Harga</span>
                <span className="font-black text-emerald-700 text-xl tracking-tighter">Rp {p.pricePerKg.toLocaleString('id-ID')} <span className="text-xs">/ Kg</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Stok</span>
                <span className="text-neutral-800 font-bold">{p.stockAvailable.toLocaleString('id-ID')} Kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
