import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Printer, Download, Search, PlusSquare, Wind, Check, Trash2, Edit3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { exportToCSV, printPDFReport } from '../utils/exportHelper';

export interface DryerRecord {
  id: string;
  date: string;
  batchNo: string;
  operator: string;
  customerName: string;
  wetWeight: number;    // Berat Basah (Masuk)
  dryWeight: number;    // Berat Kering (Keluar)
  moistureIn: number;   // KA Masuk
  moistureOut: number;  // KA Keluar
  dryingCostPerKg: number;
  laborCost: number;
  totalCost: number;
  status: 'PROSES' | 'SELESAI';
  notes?: string;
}

interface DryerModuleProps {
  records: DryerRecord[];
  onAddRecord: (record: DryerRecord) => void;
  onUpdateRecord: (record: DryerRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function DryerModule({ records, onAddRecord, onUpdateRecord, onDeleteRecord }: DryerModuleProps) {
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().substring(0,10));
  const [batchNo, setBatchNo] = useState(`DRY-${Date.now().toString().slice(-6)}`);
  const [operator, setOperator] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [wetWeight, setWetWeight] = useState(0);
  const [dryWeight, setDryWeight] = useState(0);
  const [moistureIn, setMoistureIn] = useState(20.0);
  const [moistureOut, setMoistureOut] = useState(14.0);
  const [dryingCostPerKg, setDryingCostPerKg] = useState(250);
  const [laborCost, setLaborCost] = useState(0);
  const [status, setStatus] = useState<'PROSES' | 'SELESAI'>('PROSES');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(new Date().toISOString().substring(0,10));
    setBatchNo(`DRY-${Date.now().toString().slice(-6)}`);
    setOperator('');
    setCustomerName('');
    setWetWeight(0);
    setDryWeight(0);
    setMoistureIn(20.0);
    setMoistureOut(14.0);
    setDryingCostPerKg(250);
    setLaborCost(0);
    setStatus('PROSES');
    setNotes('');
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = (dryWeight * dryingCostPerKg) + laborCost;

    const newRecord: DryerRecord = {
      id: editingId || `dryer-${Date.now()}`,
      date,
      batchNo,
      operator,
      customerName,
      wetWeight,
      dryWeight,
      moistureIn,
      moistureOut,
      dryingCostPerKg,
      laborCost,
      totalCost,
      status,
      notes
    };

    if (editingId) {
      onUpdateRecord(newRecord);
    } else {
      onAddRecord(newRecord);
    }
    
    setShowAddForm(false);
    resetForm();
  };

  const handleEdit = (r: DryerRecord) => {
    setEditingId(r.id);
    setDate(r.date);
    setBatchNo(r.batchNo);
    setOperator(r.operator);
    setCustomerName(r.customerName);
    setWetWeight(r.wetWeight);
    setDryWeight(r.dryWeight);
    setMoistureIn(r.moistureIn);
    setMoistureOut(r.moistureOut);
    setDryingCostPerKg(r.dryingCostPerKg);
    setLaborCost(r.laborCost);
    setStatus(r.status);
    setNotes(r.notes || '');
    setShowAddForm(true);
  };

  const filteredRecords = records.filter(r => 
    r.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const headers = ['Tanggal', 'No. Batch', 'Pelanggan', 'Operator', 'Basah (Kg)', 'Kering (Kg)', 'Susut (Kg)', 'KA Masuk (%)', 'KA Keluar (%)', 'Biaya Dryer (Rp)', 'Upah Buruh (Rp)', 'Total Biaya (Rp)', 'Status'];
    const rows = filteredRecords.map(r => [
      r.date, r.batchNo, r.customerName, r.operator, 
      r.wetWeight.toString(), r.dryWeight.toString(), (r.wetWeight - r.dryWeight).toString(),
      r.moistureIn.toString(), r.moistureOut.toString(), 
      (r.dryWeight * r.dryingCostPerKg).toString(), r.laborCost.toString(), r.totalCost.toString(),
      r.status
    ]);
    exportToCSV(headers, rows, 'Laporan_Rekapan_Dryer_Jagung');
  };

  const handlePrintPDF = () => {
    const headers = ['Tanggal', 'Batch', 'Pelanggan', 'Basah', 'Kering', 'Susut', 'Status', 'Total Biaya'];
    const rows = filteredRecords.map(r => [
      r.date, r.batchNo, r.customerName, 
      `${r.wetWeight.toLocaleString('id-ID')} Kg`, 
      `${r.dryWeight.toLocaleString('id-ID')} Kg`,
      `${(r.wetWeight - r.dryWeight).toLocaleString('id-ID')} Kg`,
      r.status,
      `Rp ${r.totalCost.toLocaleString('id-ID')}`
    ]);
    const totalWet = filteredRecords.reduce((sum, r) => sum + r.wetWeight, 0);
    const totalDry = filteredRecords.reduce((sum, r) => sum + r.dryWeight, 0);
    const totalShrinkage = totalWet - totalDry;
    
    printPDFReport('Laporan Rekapan Pengeringan / Dryer Jagung', headers, rows, [
      { label: 'Total Tonase Basah', value: `${totalWet.toLocaleString('id-ID')} Kg` },
      { label: 'Total Tonase Kering', value: `${totalDry.toLocaleString('id-ID')} Kg` },
      { label: 'Total Penyusutan (Air)', value: `${totalShrinkage.toLocaleString('id-ID')} Kg` },
      { label: 'Total Biaya Pengeringan', value: `Rp ${filteredRecords.reduce((sum, r) => sum + r.totalCost, 0).toLocaleString('id-ID')}` }
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <Wind className="text-orange-500 w-6 h-6" />
            Laporan Rekapan Dryer Jagung
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Kelola pencatatan basah-kering jagung PIPIL, biaya pengeringan mesin dryer, dan persentase susut kadar air.</p>
        </div>
        <div className="flex items-center gap-2">
          {!showAddForm && (
            <button
              onClick={() => { resetForm(); setShowAddForm(true); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <PlusSquare className="w-4 h-4" /> Tambah Transaksi Dryer
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 animate-fadeIn relative">
          <h3 className="font-bold text-indigo-950 mb-4 border-b border-neutral-100 pb-2">
            {editingId ? 'Edit Rekapan Dryer Jagung' : 'Catat Rekap Dryer Jagung Baru'}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Tanggal</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs focus:border-emerald-600 outline-none" />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">No. Batch</label>
                <input type="text" required value={batchNo} onChange={e => setBatchNo(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs font-mono focus:border-emerald-600 outline-none uppercase" />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Pihak / Pemilik / Customer</label>
                <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs focus:border-emerald-600 outline-none uppercase" placeholder="Nama Petani / Pemilik" />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Operator Batch</label>
                <input type="text" value={operator} onChange={e => setOperator(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs focus:border-emerald-600 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-emerald-700 mb-1 text-xs font-bold"><ArrowDownCircle className="w-3 h-3 inline"/> Basah Masuk (Kg)</label>
                  <input type="number" required value={wetWeight || ''} onChange={e => setWetWeight(Number(e.target.value))} className="w-full bg-emerald-50 border border-emerald-200 rounded p-2 text-xs font-mono focus:border-emerald-600 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-indigo-700 mb-1 text-xs font-bold">KA Awal Masuk (%)</label>
                  <input type="number" step="0.1" required value={moistureIn || ''} onChange={e => setMoistureIn(Number(e.target.value))} className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-xs font-mono focus:border-indigo-600 outline-none" placeholder="20.0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-emerald-700 mb-1 text-xs font-bold"><ArrowUpCircle className="w-3 h-3 inline"/> Kering Keluar (Kg)</label>
                  <input type="number" required value={dryWeight || ''} onChange={e => setDryWeight(Number(e.target.value))} className="w-full bg-emerald-50 border border-emerald-200 rounded p-2 text-xs font-mono focus:border-emerald-600 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-indigo-700 mb-1 text-xs font-bold">KA Akhir Keluar (%)</label>
                  <input type="number" step="0.1" required value={moistureOut || ''} onChange={e => setMoistureOut(Number(e.target.value))} className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-xs font-mono focus:border-indigo-600 outline-none" placeholder="14.0" />
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs">
                <div className="flex justify-between font-bold text-amber-900 mb-1"><span>Total Susut (Selisih Air):</span> <span>{(wetWeight - dryWeight).toLocaleString('id-ID')} Kg</span></div>
                <div className="flex justify-between text-amber-800"><span>Selisih KA (Kering):</span> <span>{(moistureIn - moistureOut).toFixed(1)} %</span></div>
                <div className="flex justify-between text-amber-800"><span>Persentase Susut Berat:</span> <span>{wetWeight > 0 ? ((wetWeight - dryWeight)/wetWeight * 100).toFixed(2) : 0} %</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Tarif Biaya Pengeringan per Kg Kering (Rp)</label>
                <input type="number" required value={dryingCostPerKg || ''} onChange={e => setDryingCostPerKg(Number(e.target.value))} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs font-mono focus:border-emerald-600 outline-none" placeholder="Contoh: 250" />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Upah Buruh Panggul & Muat (Rp)</label>
                <input type="number" required value={laborCost || ''} onChange={e => setLaborCost(Number(e.target.value))} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs font-mono focus:border-emerald-600 outline-none" placeholder="(Opsional: cth: 350000)" />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-bold">Status Penyelesaian</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 text-xs font-bold focus:border-emerald-600 outline-none">
                  <option value="PROSES">SEDANG PROSES DRYER</option>
                  <option value="SELESAI">SELESAI (Kering)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 mt-2 border-t border-neutral-100">
                <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="px-4 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer">
                  <Check className="w-4 h-4" /> Simpan Dryer
                </button>
              </div>
            </div>
            
          </form>
        </div>
      )}

      {/* TOOLS & DATA TABLE */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Cari Pelanggan, Batch..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-emerald-600 focus:bg-white font-semibold text-neutral-700" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
            <button onClick={handlePrintPDF} className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer">
              <Printer className="w-3.5 h-3.5" /> Cetak Rekapan Laporan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-neutral-600 min-w-[1000px]">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal / Batch</th>
                <th className="py-2.5 px-3">Petani / Customer</th>
                <th className="py-2.5 px-3 text-right">Basah (In)</th>
                <th className="py-2.5 px-3 text-right">Kering (Out)</th>
                <th className="py-2.5 px-3 text-right">Kadar Air</th>
                <th className="py-2.5 px-3 text-right">Susut Kg</th>
                <th className="py-2.5 px-3 text-right">Biaya/Rp</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-neutral-800">{r.date}</div>
                    <div className="font-mono text-[9px] text-neutral-400">{r.batchNo}</div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-800 uppercase">{r.customerName}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-700 bg-amber-50">{(r.wetWeight).toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 bg-emerald-50">{(r.dryWeight).toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[10px]">IN: <span className="text-red-500 font-bold">{r.moistureIn.toFixed(1)}%</span><br/>OUT: <span className="text-green-600 font-bold">{r.moistureOut.toFixed(1)}%</span></td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 border-l border-r border-neutral-100 bg-neutral-50">{(r.wetWeight - r.dryWeight).toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">{(r.totalCost).toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => handleEdit(r)} className="text-neutral-400 hover:text-blue-600 p-1 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => { if(confirm('Hapus rekapan dryer ini?')) onDeleteRecord(r.id); }} className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-neutral-400">Belum ada rekapan dryer jagung yang tersimpan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
