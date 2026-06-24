import React, { useState } from 'react';
import { KacangIjoRekapRecord, KacangIjoStockRecord } from '../types';
import { Package, PlusCircle, Download, FileText, Banknote, List, ArrowDown, ArrowUp } from 'lucide-react';
import { exportToCSV } from '../utils/exportHelper';
import SmartNumberInput from './SmartNumberInput';

interface KacangIjoModuleProps {
  rekapRecords: KacangIjoRekapRecord[];
  stockRecords: KacangIjoStockRecord[];
  onAddRekap: (record: KacangIjoRekapRecord) => void;
  onDeleteRekap: (id: string) => void;
  onAddStock: (record: KacangIjoStockRecord) => void;
  onDeleteStock: (id: string) => void;
}

export default function KacangIjoModule({
  rekapRecords,
  stockRecords,
  onAddRekap,
  onDeleteRekap,
  onAddStock,
  onDeleteStock
}: KacangIjoModuleProps) {
  const [activeTab, setActiveTab] = useState<'REKAP' | 'STOK'>('REKAP');
  
  // States for REKAP form
  const [showRekapForm, setShowRekapForm] = useState(false);
  const [rDate, setRDate] = useState(new Date().toISOString().split('T')[0]);
  const [rSupplier, setRSupplier] = useState('AMBO ASSE');
  const [rPoliceNo, setRPoliceNo] = useState('');
  const [rColly, setRColly] = useState(0);
  const [rWeight, setRWeight] = useState(0);
  const [rPrice, setRPrice] = useState(0);
  const [rBt, setRBt] = useState(0);
  const [rPanjar, setRPanjar] = useState(0);
  const [rDesc, setRDesc] = useState('');

  // States for STOK form
  const [showStockForm, setShowStockForm] = useState(false);
  const [sDate, setSDate] = useState(new Date().toISOString().split('T')[0]);
  const [sSupplier, setSSupplier] = useState('');
  const [sItemName, setSItemName] = useState('NILON');
  const [sColly, setSColly] = useState(0);
  const [sInWeight, setSInWeight] = useState(0);
  const [sOutWeight, setSOutWeight] = useState(0);
  const [sDesc, setSDesc] = useState('');
  const [sPaymentDate, setSPaymentDate] = useState('');

  // Filter supplier
  const [filterSupplier, setFilterSupplier] = useState('AMBO ASSE');

  const handleSaveRekap = (e: React.FormEvent) => {
    e.preventDefault();
    const rec: KacangIjoRekapRecord = {
      id: `kirekap-${Date.now()}`,
      date: rDate,
      supplier: rSupplier.toUpperCase(),
      policeNo: rPoliceNo.toUpperCase(),
      colly: rColly,
      weight: rWeight,
      price: rPrice,
      bt: rBt,
      panjar: rPanjar,
      description: rDesc
    };
    onAddRekap(rec);
    setShowRekapForm(false);
    setRPoliceNo('');
    setRColly(0);
    setRWeight(0);
    setRPrice(0);
    setRBt(0);
    setRPanjar(0);
    setRDesc('');
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const rec: KacangIjoStockRecord = {
      id: `kistock-${Date.now()}`,
      date: sDate,
      supplier: sSupplier.toUpperCase(),
      itemName: sItemName.toUpperCase(),
      colly: sColly,
      inWeight: sInWeight,
      outWeight: sOutWeight,
      description: sDesc,
      paymentDate: sPaymentDate
    };
    onAddStock(rec);
    setShowStockForm(false);
    setSSupplier('');
    setSColly(0);
    setSInWeight(0);
    setSOutWeight(0);
    setSDesc('');
    setSPaymentDate('');
  };

  // REKAP Logic
  const filteredRekap = rekapRecords
    .filter(r => r.supplier.includes(filterSupplier.toUpperCase()))
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningSaldo = 0;
  const rekapWithSaldo = filteredRekap.map(r => {
    const jumlah = r.weight * r.price;
    const total = jumlah - r.bt;
    runningSaldo += total - r.panjar;
    return { ...r, jumlah, total, saldo: runningSaldo };
  });

  // STOCK Logic
  const filteredStock = stockRecords
    .filter(r => r.supplier.includes(filterSupplier.toUpperCase()))
    .sort((a, b) => a.date.localeCompare(b.date));

  let runningStock = 0;
  const stockWithTotal = filteredStock.map(r => {
    runningStock += r.inWeight - r.outWeight;
    return { ...r, totalStock: runningStock };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-neutral-200 shadow-sm rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-850 flex items-center gap-2 uppercase tracking-tight">
            <Package className="text-purple-600 w-6 h-6 shrink-0" />
            <span>BUKU LOGISTIK KACANG IJO</span>
          </h2>
          <p className="text-[11px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
            Manajemen Rekapitulasi & Stok Khusus Kacang Ijo
          </p>
        </div>
      </div>

      <div className="flex bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200 w-full sm:max-w-md self-start">
        <button
          onClick={() => setActiveTab('REKAP')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'REKAP' ? 'bg-purple-600 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Banknote className="w-4 h-4" /> REKAP MASUK
        </button>
        <button
          onClick={() => setActiveTab('STOK')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'STOK' ? 'bg-purple-600 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <List className="w-4 h-4" /> RINCIAN STOK
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-2">Filter Pemasok (Supplier)</label>
        <input 
          type="text" 
          value={filterSupplier} 
          onChange={(e) => setFilterSupplier(e.target.value)}
          placeholder="Contoh: AMBO ASSE"
          className="w-full md:w-1/3 border border-neutral-200 p-2.5 rounded-xl text-sm font-bold focus:ring-1 focus:ring-purple-500 outline-none uppercase"
        />
      </div>

      {activeTab === 'REKAP' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRekapForm(!showRekapForm)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm uppercase"
            >
              <PlusCircle className="w-4 h-4" /> {showRekapForm ? 'Tutup Formulir' : 'Catat Transaksi'}
            </button>
          </div>

          {showRekapForm && (
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
              <form onSubmit={handleSaveRekap} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Tanggal</label>
                  <input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Keterangan / Supplier</label>
                  <input type="text" value={rDesc} onChange={(e) => setRDesc(e.target.value)} placeholder="Contoh: TRANSFER PANJAR" className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">No Polisi</label>
                  <input type="text" value={rPoliceNo} onChange={(e) => setRPoliceNo(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div>
                  <SmartNumberInput value={rColly} onChange={setRColly} label="Jumlah Karung" />
                </div>
                <div>
                  <SmartNumberInput value={rWeight} onChange={setRWeight} label="Berat (Kg)" mode="weight" />
                </div>
                <div>
                  <SmartNumberInput value={rPrice} onChange={setRPrice} label="Harga (Rp)" mode="currency" />
                </div>
                <div>
                  <SmartNumberInput value={rBt} onChange={setRBt} label="BT (Buruh) Rp" mode="currency" />
                </div>
                <div>
                  <SmartNumberInput value={rPanjar} onChange={setRPanjar} label="Panjar / Pembayaran Rp" mode="currency" />
                </div>
                <div className="col-span-1 md:col-span-4 flex justify-end">
                  <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase">Simpan Rekap</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-black text-[9px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">No Polisi</th>
                  <th className="py-3 px-4 text-right">Jml Karung</th>
                  <th className="py-3 px-4 text-right">Berat (Kg)</th>
                  <th className="py-3 px-4 text-right">Harga (Rp)</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4 text-right">BT</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right text-rose-600">Panjar (Rp)</th>
                  <th className="py-3 px-4 text-right text-emerald-600">Saldo</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {rekapWithSaldo.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-4">{r.date}</td>
                    <td className="py-2.5 px-4 font-bold">{r.policeNo}</td>
                    <td className="py-2.5 px-4 text-right">{r.colly > 0 ? r.colly : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{r.weight > 0 ? r.weight.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{r.price > 0 ? r.price.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{r.jumlah > 0 ? r.jumlah.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{r.bt > 0 ? r.bt.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">{r.total > 0 ? r.total.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-bold">{r.panjar > 0 ? r.panjar.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-600 font-black">{r.saldo !== 0 ? r.saldo.toLocaleString('id-ID') : '0'}</td>
                    <td className="py-2.5 px-4">{r.description}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => onDeleteRekap(r.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold">HAPUS</button>
                    </td>
                  </tr>
                ))}
                {rekapWithSaldo.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-neutral-400">Belum ada data rekap untuk {filterSupplier}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STOK' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowStockForm(!showStockForm)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm uppercase"
            >
              <PlusCircle className="w-4 h-4" /> {showStockForm ? 'Tutup Formulir' : 'Catat Stok'}
            </button>
          </div>

          {showStockForm && (
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
              <form onSubmit={handleSaveStock} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Tanggal</label>
                  <input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Uraian (Supplier)</label>
                  <input type="text" value={sSupplier} onChange={(e) => setSSupplier(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Nama Barang</label>
                  <input type="text" value={sItemName} onChange={(e) => setSItemName(e.target.value)} placeholder="NILON / KABUR" className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div>
                  <SmartNumberInput value={sColly} onChange={setSColly} label="Colly" />
                </div>
                <div>
                  <SmartNumberInput value={sInWeight} onChange={setSInWeight} label="Stok Masuk (Kg)" mode="weight" />
                </div>
                <div>
                  <SmartNumberInput value={sOutWeight} onChange={setSOutWeight} label="Stok Keluar (Kg)" mode="weight" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Tgl Bayar</label>
                  <input type="text" value={sPaymentDate} onChange={(e) => setSPaymentDate(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Keterangan</label>
                  <input type="text" value={sDesc} onChange={(e) => setSDesc(e.target.value)} className="w-full p-2 rounded-xl border border-purple-200 uppercase" />
                </div>
                <div className="col-span-1 md:col-span-4 flex justify-end">
                  <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase">Simpan Stok</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-black text-[9px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Uraian</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4 text-right">Colly</th>
                  <th className="py-3 px-4 text-right text-emerald-600">Stok Masuk</th>
                  <th className="py-3 px-4 text-right text-rose-600">Stok Keluar</th>
                  <th className="py-3 px-4 text-right font-black">Total Gudang</th>
                  <th className="py-3 px-4">Tgl Bayar</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {stockWithTotal.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-4">{r.date}</td>
                    <td className="py-2.5 px-4 font-bold">{r.supplier}</td>
                    <td className="py-2.5 px-4 text-purple-700 font-bold">{r.itemName}</td>
                    <td className="py-2.5 px-4 text-right">{r.colly > 0 ? r.colly : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-600">{r.inWeight > 0 ? r.inWeight.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-rose-600">{r.outWeight > 0 ? r.outWeight.toLocaleString('id-ID') : '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-black">{r.totalStock.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-4">{r.paymentDate}</td>
                    <td className="py-2.5 px-4">{r.description}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => onDeleteStock(r.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold">HAPUS</button>
                    </td>
                  </tr>
                ))}
                {stockWithTotal.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-neutral-400">Belum ada rincian stok untuk {filterSupplier}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
