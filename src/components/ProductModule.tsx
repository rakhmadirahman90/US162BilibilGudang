import React, { useState } from 'react';
import { 
  Package, 
  Trash2, 
  Check, 
  X, 
  TrendingUp, 
  Coins, 
  FileText, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductRecord } from '../types';

interface Props {
  sessionUser: { username: string; role: 'admin' | 'operator' | 'karyawan' | 'pimpinan' } | null;
  products: ProductRecord[];
}

export default function ProductModule({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  // Helper helper to calculate total estimated value of the stock
  const calculateTotalValue = (p: ProductRecord) => {
    return (p.pricePerKg ?? 0) * (p.stockAvailable ?? 0);
  };

  // Helper to determine stock status pill and color
  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return { 
        text: 'Habis / Sold Out', 
        bg: 'bg-rose-50 text-rose-700 border-rose-200', 
        color: 'text-rose-600',
        progressColor: 'bg-rose-500', 
        percentage: 0 
      };
    }
    if (stock < 5000) {
      return { 
        text: 'Stok Kritis / Perlu Kulakan', 
        bg: 'bg-amber-50 text-amber-700 border-amber-200', 
        color: 'text-amber-600',
        progressColor: 'bg-amber-500', 
        percentage: Math.max(15, (stock / 25000) * 100) 
      };
    }
    if (stock < 15000) {
      return { 
        text: 'Stok Sedang / Normal', 
        bg: 'bg-blue-50 text-blue-700 border-blue-200', 
        color: 'text-blue-600',
        progressColor: 'bg-blue-500', 
        percentage: (stock / 25000) * 100 
      };
    }
    return { 
      text: 'Stok Melimpah / Sangat Aman', 
      bg: 'bg-blue-50 text-blue-700 border-blue-200', 
      color: 'text-blue-600',
      progressColor: 'bg-blue-500', 
      percentage: Math.min(100, (stock / 25000) * 100) 
    };
  };

  return (
    <div className="bg-[#fafafa]/50 rounded-xl p-1 sm:p-2">
      {/* Header Section - Extremely Compact */}
      <div className="mb-2 flex flex-row items-center justify-between gap-2 border-b border-neutral-100 pb-1 px-1">
        <div className="flex flex-row items-center gap-1.5">
          <Package className="w-4 h-4 text-blue-600 animate-pulse" />
          <h2 className="text-sm font-black text-neutral-900 tracking-tight uppercase">
            {products.length} KATALOG PRODUK AKTIF
          </h2>
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[8px] font-black border border-blue-100 flex items-center gap-1 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          REAL-TIME READY
        </div>
      </div>

      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2 px-1">
        💡 Klik pada kartu produk mana saja untuk membuka jendela visualisasi detail, spesifikasi, dan estimasi nilai aset gudang.
      </p>

      {/* Grid Layout - Extremely Dense and fluid to fit the screen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5 overflow-y-auto max-h-[80vh] custom-scrollbar p-1">
        {products.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProduct(p)}
            className="group bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden h-fit max-w-[140px] mx-auto w-full cursor-pointer hover:border-blue-500 hover:scale-[1.02] transformduration-300"
          >
            {/* Image Preview - smaller and tighter */}
            <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden relative">
              {p.imageUrl ? (
                <img 
                  src={p.imageUrl} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
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
              <div className={`image-fallback ${p.imageUrl ? 'hidden' : ''} text-neutral-350 text-center flex flex-col items-center gap-1`}>
                <Package className="w-5 h-5 opacity-20 text-neutral-500" />
                <span className="font-bold uppercase tracking-widest text-[5px] opacity-40">NO IMAGE</span>
              </div>
              
              {p.stockAvailable <= 0 && (
                <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                  <div className="bg-rose-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tight">
                    SOLD OUT
                  </div>
                </div>
              )}

              {/* Category tag badge overlay */}
              <div className="absolute bottom-1 right-1 opacity-75 group-hover:opacity-100 duration-200">
                <span className={`text-[6px] font-black px-1 py-0.5 rounded uppercase ${
                  p.category === 'BERAS' ? 'bg-amber-100 text-amber-800' :
                  p.category === 'JAGUNG' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-150 text-neutral-800'
                }`}>
                  {p.category}
                </span>
              </div>
            </div>

            <div className="p-1.5 flex-1 flex flex-col gap-1 bg-white">
              <h3 className="font-black text-[9px] text-neutral-900 leading-[1.1] line-clamp-2 uppercase tracking-tighter h-[20px] group-hover:text-blue-700 transition-colors">
                {p.name}
              </h3>
              
              <div className="flex flex-col gap-0.5 mt-auto">
                <div className="flex justify-between items-center border-b border-neutral-50 pb-0.5">
                  <span className="text-[5px] font-black text-neutral-400 uppercase">RP/KG</span>
                  <span className="font-black text-blue-700 text-[9px] tabular-nums tracking-tighter">
                    {(p.pricePerKg ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[5px] font-black text-neutral-400 uppercase">STOK</span>
                  <p className="text-neutral-800 font-extrabold text-[9px] tabular-nums tracking-tighter leading-none">
                    {(p.stockAvailable ?? 0).toLocaleString('id-ID')} <span className="text-[6px] text-neutral-400 uppercase">KG</span>
                  </p>
                </div>
              </div>
              <div className="text-[6px] font-black uppercase text-blue-600 text-right mt-1 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Lihat Detail &rarr;
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL DRAWER - INTERACTIVE & HIGH-FIDELITY */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-md"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
              className="bg-white rounded-2xl border border-neutral-200 shadow-2xl relative overflow-hidden w-full max-w-xl flex flex-col text-left font-sans text-neutral-800 z-10"
            >
              {/* Colored Category Bar */}
              <div className={`h-1.5 w-full ${
                selectedProduct.category === 'BERAS' ? 'bg-amber-500' :
                selectedProduct.category === 'JAGUNG' ? 'bg-blue-600' : 'bg-neutral-500'
              }`} />

              {/* Close Button Trigger */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition z-20 cursor-pointer border border-neutral-100 bg-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Contents Scroll Area */}
              <div className="p-5 md:p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-5 items-start mb-6">
                  {/* Aspect-controlled Product Image Frame */}
                  <div className="w-full md:w-44 h-32 md:h-32 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 flex items-center justify-center relative flex-shrink-0">
                    {selectedProduct.imageUrl ? (
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.modal-image-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div className={`modal-image-fallback ${selectedProduct.imageUrl ? 'hidden' : ''} text-neutral-400 flex flex-col items-center gap-1.5`}>
                      <Package className="w-8 h-8 text-neutral-300 animate-pulse" />
                      <span className="text-[7px] font-black tracking-widest text-neutral-400 uppercase">PRODUK TANPA FOTO</span>
                    </div>

                    <div className={`absolute top-2 left-2 rounded-md font-bold px-2 py-0.5 text-[8px] border text-white ${
                      selectedProduct.category === 'BERAS' ? 'bg-amber-600 border-amber-500' :
                      selectedProduct.category === 'JAGUNG' ? 'bg-blue-700 border-blue-600' : 'bg-neutral-700 border-neutral-600'
                    }`}>
                      {selectedProduct.category}
                    </div>
                  </div>

                  {/* Core Meta Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1 text-[9px] font-black text-blue-700 uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 text-blue-500 animate-spin-slow" /> Kode Produk: #{selectedProduct.id}
                    </div>
                    <h1 className="text-md md:text-xl font-black text-neutral-900 uppercase leading-tight tracking-tight">
                      {selectedProduct.name}
                    </h1>
                    <p className="text-xs text-neutral-500 leading-relaxed italic font-medium">
                      "{selectedProduct.description || 'Pemberian deskripsi belum dikonfigurasi untuk komoditas ini. Menggunakan standar operasional pergudangan Bilibili Suppa Pinrang.'}"
                    </p>
                  </div>
                </div>

                {/* Key Metrics Dashboard & Valuations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                  {/* Metric Card 1: Harga per Kg */}
                  <div className="bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 rounded-xl p-3 flex flex-col justify-between transition duration-200">
                    <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Harga Satuan Gudang</span>
                    <div>
                      <span className="text-neutral-400 text-xs font-semibold mr-0.5">Rp</span>
                      <span className="text-md font-black text-neutral-900 tabular-nums">
                        {(selectedProduct.pricePerKg ?? 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase ml-1">/ KG</span>
                    </div>
                    <span className="text-[7px] text-neutral-400 font-extrabold mt-1 uppercase flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5 text-blue-600" /> Tarif Tetap Transaksi
                    </span>
                  </div>

                  {/* Metric Card 2: Total Stok */}
                  <div className="bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-200 rounded-xl p-3 flex flex-col justify-between transition duration-200">
                    <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Persediaan Tersedia</span>
                    <div>
                      <span className="text-md font-black text-neutral-900 tabular-nums">
                        {(selectedProduct.stockAvailable ?? 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase ml-1">KG</span>
                    </div>
                    <span className="text-[7px] text-neutral-400 font-extrabold mt-1 uppercase flex items-center gap-1">
                      <Scale className="w-2.5 h-2.5 text-indigo-500" /> Timbangan Netto Aktif
                    </span>
                  </div>

                  {/* Metric Card 3: Estimasi Nilai Aset */}
                  <div className="bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col justify-between transition duration-200">
                    <span className="text-[7px] font-black text-blue-800 uppercase tracking-widest block mb-1">Total Estimasi Aset</span>
                    <div>
                      <span className="text-blue-700 text-xs font-extrabold mr-0.5">Rp</span>
                      <span className="text-md font-black text-neutral-950 tabular-nums">
                        {calculateTotalValue(selectedProduct).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-[7px] text-blue-700 font-extrabold mt-1 uppercase flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 text-blue-600 animate-bounce" /> Nilai Valuasi Gudang
                    </span>
                  </div>
                </div>

                {/* Stock Level Warning Panel */}
                <div className="border border-neutral-200 rounded-xl p-3.5 mb-6 space-y-2.5 bg-neutral-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-neutral-700 uppercase tracking-wider">Akurasi & Status Sektor Stok</span>
                    <span className={`text-[10px] font-black border uppercase px-2 py-0.5 rounded-full ${getStockStatus(selectedProduct.stockAvailable).bg}`}>
                      {getStockStatus(selectedProduct.stockAvailable).text}
                    </span>
                  </div>
                  
                  {/* Warehousing simulated safety target bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${getStockStatus(selectedProduct.stockAvailable).progressColor} rounded-full transition-all duration-700`}
                        style={{ width: `${getStockStatus(selectedProduct.stockAvailable).percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[7px] font-bold text-neutral-400 uppercase tracking-wider">
                      <span>0 KG</span>
                      <span>Target Ideal 25,000 KG</span>
                    </div>
                  </div>
                </div>

                {/* Product Characteristics Specifications */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-[10px] font-black text-neutral-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3.5px]" /> Karakteristik & Kualitas Spek
                  </h4>
                  
                  {selectedProduct.characteristics && selectedProduct.characteristics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.characteristics.map((char, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors uppercase"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {char}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 text-center p-4 rounded-xl text-xs text-neutral-400 font-bold">
                      🚫 Belum ada spesifikasi khusus (karakteristik) yang diinputkan untuk produk ini.
                    </div>
                  )}
                </div>

                {/* Footnote Warehouse info */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-[9px] text-amber-900 leading-snug mt-4 flex items-start gap-1.5 font-sans">
                  <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase">CATATAN INFORMASI GUDANG US BILIBILI 162 : </span>
                    Ubah data ataupun harga produk ini dapat dilakukan melalui tab <span className="font-extrabold uppercase text-amber-950">DATABASE MASTER &rarr; KATALOG PRODUK</span> oleh akun dengan level otorisasi ADMINISTRATOR. Fluktuasi harga akan terekam secara otomatis dalam log aktivitas sistem.
                  </div>
                </div>

              </div>

              {/* Modal Action Footer */}
              <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex justify-end">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs px-6 py-2 rounded-xl transition duration-150 uppercase shadow-md-flat"
                >
                  Selesai & Tutup
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
