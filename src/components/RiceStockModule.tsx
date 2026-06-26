import React, { useState } from 'react';
import { RiceStockRecord, EmployeeRecord, InboundRecord, OutboundRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';
import { exportToCSV, printPDFReport, printRiceStockSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildRiceStockWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import SmartNumberInput from './SmartNumberInput';
import { Package, PlusCircle, Search, Calendar, Download, Printer, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, X, MessageCircle, FileText } from 'lucide-react';

interface RiceStockModuleProps {
  records: RiceStockRecord[];
  inboundRecords: InboundRecord[];
  outboundRecords: OutboundRecord[];
  employees?: EmployeeRecord[];
  onAddRecord: (record: RiceStockRecord) => void;
  onUpdateRecord: (record: RiceStockRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function RiceStockModule({ records, inboundRecords, outboundRecords, employees = [], onAddRecord, onUpdateRecord, onDeleteRecord }: RiceStockModuleProps) {
  const { t, language } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<RiceStockRecord | null>(null);

  // Sub-tabs for separating commodities completely
  const [commodityTab, setCommodityTab] = useState<string>('BERAS');

  const COMMODITIES = [
    'BERAS', 'BROKEN', 'RIJEK', 'BENIR', 'DEDAK', 
    'JAGUNG READY', 'JAGUNG ASALAN', 'KACANG IJO', 'KACANG TANAH', 
    'CANGKANG KEMIRI', 'CANGKANG SAWIT', 'GULA MERAH AREN', 'GULA MERAH KLPA', 
    'GABAH', 'PASIR', 'RUMPUT LAUT', 'BESI TUA', 'LAINNYA'
  ];

  // Sorting order: NEWEST first (default for feed) or OLDEST first (traditional accounting log style like Excel)
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  // WhatsApp Modal State
  const [waModalConfig, setWaModalConfig] = useState<{
    isOpen: boolean;
    defaultText: string;
    record: RiceStockRecord | null;
    pdfHtml?: string;
    pdfFileName?: string;
  }>({
    isOpen: false,
    defaultText: '',
    record: null
  });

  const [staffName, setStaffName] = useState<string>(() => {
    return localStorage.getItem('bilibili_staff_name') || "Asma";
  });

  React.useEffect(() => {
    localStorage.setItem('bilibili_staff_name', staffName);
  }, [staffName]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'EDIT' | 'DELETE';
    onConfirm: () => void;
  } | null>(null);
  const closeConfirm = () => setConfirmModal(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [policeNo, setPoliceNo] = useState("");
  const [description, setDescription] = useState("");
  const [itemName, setItemName] = useState("BERAS");
  const [price, setPrice] = useState(0);
  const [colly, setColly] = useState(0);
  const [inWeight, setInWeight] = useState(0);
  const [outWeight, setOutWeight] = useState(0);

  // Auto-default form's itemName based on currently active book tab
  React.useEffect(() => {
    if (!editingId) {
      setItemName(commodityTab);
    }
  }, [commodityTab, editingId]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setPoliceNo("");
    setDescription("");
    setItemName(commodityTab);
    setPrice(0);
    setColly(0);
    setInWeight(0);
    setOutWeight(0);
    setEditingId(null);
  };

  const handleEdit = (r: RiceStockRecord) => {
    setEditingId(r.id);
    setDate(r.date);
    setPoliceNo(r.policeNo);
    setDescription(r.description);
    setItemName(r.itemName);
    setPrice(r.price);
    setColly(r.colly);
    setInWeight(r.inWeight);
    setOutWeight(r.outWeight);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, description: string) => {
    setConfirmModal({
      isOpen: true,
      title: t.confirmDeleteStock,
      message: t.confirmDeleteStockMsg.replace('{description}', description),
      type: 'DELETE',
      onConfirm: () => {
        onDeleteRecord(id);
        closeConfirm();
      }
    });
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !policeNo || !itemName) {
      (window as any).__showToast?.(t.errorIncompleteStock, "error");
      return;
    }
    
    const newRecord: RiceStockRecord = {
      id: editingId || `rice-${Date.now()}`,
      date,
      policeNo: policeNo.toUpperCase(),
      description,
      itemName: itemName.toUpperCase(),
      commodity: commodityTab,
      price,
      colly,
      inWeight,
      outWeight
    };

    const action = () => {
      if (editingId) {
        onUpdateRecord(newRecord);
      } else {
        onAddRecord(newRecord);
      }
      setShowAddForm(false);
      resetForm();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? t.confirmEditStock : t.confirmSaveStock,
      message: editingId ? t.confirmEditStockMsg : t.confirmSaveStockMsg,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        action();
        closeConfirm();
      }
    });
  };

  const unifiedRecords: RiceStockRecord[] = [...records];
  
  // Integrate Inbound Records
  inboundRecords.forEach(r => {
    unifiedRecords.push({
      id: r.id,
      date: r.date,
      policeNo: r.vehicleNo,
      description: `TERIMA DARI: ${r.supplier}`,
      itemName: r.itemName || '',
      commodity: r.commodity,
      price: r.price || 0,
      colly: 0,
      inWeight: r.netWeight,
      outWeight: 0,
      isSystem: true
    });
  });

  // Integrate Outbound Records
  outboundRecords.forEach(r => {
    unifiedRecords.push({
      id: r.id,
      date: r.date,
      policeNo: r.vehicleNo,
      description: `KIRIM KE: ${r.buyer}`,
      itemName: r.itemName || '',
      commodity: r.commodity,
      price: 0,
      colly: 0,
      inWeight: 0,
      outWeight: r.totalWeight,
      isSystem: true
    });
  });

  // 1. CHRONOLOGICAL SORTING FOR ACCURATE CUMULATIVE RUNNING BALANCES
  // Oldest records go first on cumulative balance stack to prevent negative arithmetic errors.
  const chronologicallySorted = [...unifiedRecords]
    .filter(r => (r.commodity === commodityTab) || (!r.commodity && r.itemName?.toUpperCase() === commodityTab))
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Parse timestamp from id, assuming format "prefix-timestamp"
      const tsA = parseInt(a.id.split('-').pop() || '0');
      const tsB = parseInt(b.id.split('-').pop() || '0');
      if (!isNaN(tsA) && !isNaN(tsB) && tsA !== tsB) {
        return tsA - tsB;
      }
      return a.id.localeCompare(b.id);
    });

  // 2. ACCUMULATE RUNNING STOCKS SEQUENTIALLY
  let accumulatedStock = 0;
  const recordsWithTotals = chronologicallySorted.map(r => {
    accumulatedStock += (r.inWeight - r.outWeight);
    const totalTransaksi = (r.inWeight + r.outWeight) * r.price;
    return { ...r, runningTotal: accumulatedStock, totalTransaksi };
  });

  // Calculate high-level statistics for selected commodity
  const totalInWeight = chronologicallySorted.reduce((sum, r) => sum + (r.inWeight ?? 0), 0);
  const totalOutWeight = chronologicallySorted.reduce((sum, r) => sum + (r.outWeight ?? 0), 0);
  const currentStockBalance = accumulatedStock;

  // Helpers for Ton Conversion
  const formatTonValue = (kg: number) => {
    const tons = kg / 1000;
    return tons.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }) + ' Ton';
  };

  const formatKgValue = (kg: number) => {
    return kg.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') + ' Kg';
  };

  // 3. APPLY SEARCH FILTER AND USER-PREFERED PRESENTATION SORT ORDER
  const filteredAndSortedRecords = [...recordsWithTotals]
    .filter(r => 
      r.policeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (sortOrder === 'NEWEST') {
    filteredAndSortedRecords.reverse(); // Latest at top for operational monitoring
  }

  // Handle Exporting Current Sheet to CSV
  const handleExportCSV = () => {
    const headers = [
      language === 'id' ? 'Tanggal' : 'Date',
      language === 'id' ? 'No. Polisi' : 'Vehicle Plate No',
      language === 'id' ? 'Uraian' : 'Description',
      language === 'id' ? 'Komoditas' : 'Item Name',
      language === 'id' ? 'Harga (Rp)' : 'Price (IDR)',
      language === 'id' ? 'Colly (Sak)' : 'Colly (Bags)',
      language === 'id' ? 'Masuk (Kg)' : 'In Weight (Kg)',
      language === 'id' ? 'Keluar (Kg)' : 'Out Weight (Kg)',
      language === 'id' ? 'Total Transaksi (IDR)' : 'Total Transaction (IDR)',
      language === 'id' ? 'Sisa Stok (Kg)' : 'Running Stock Balance (Kg)'
    ];

    const rows = filteredAndSortedRecords.map(r => [
      r.date,
      r.policeNo,
      r.description,
      r.itemName,
      r.price.toString(),
      r.colly.toString(),
      r.inWeight.toString(),
      r.outWeight.toString(),
      r.totalTransaksi.toString(),
      r.runningTotal.toString()
    ]);

    const titlePrefix = `Buku_Stok_${commodityTab.replace(/\s+/g, '_')}`;
    exportToCSV(headers, rows, `${titlePrefix}_US_Bilibili_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Main Header Control Center */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-neutral-200 shadow-sm rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-850 flex items-center gap-2 uppercase tracking-tight">
            <Package className="text-emerald-600 w-6 h-6 shrink-0" />
            <span>BUKU LOGISTIK {commodityTab}</span>
          </h2>
          <p className="text-[11px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
            Pengelolaan & Perhitungan Saldo Stok Gudang Mandiri US Bilibili 162
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm uppercase tracking-wide cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Formulir' : 'Catat Logistik Baru'}</span>
          </button>
        </div>
      </div>

      {/* 2. Premium Commodity Selector Tabs */}
      <div className="flex bg-neutral-100/80 p-2 rounded-2xl border border-neutral-200 w-full sm:max-w-xl self-start">
        <select
          value={commodityTab}
          onChange={(e) => setCommodityTab(e.target.value)}
          className="w-full bg-white border border-neutral-200 text-neutral-800 text-sm font-black uppercase tracking-wider py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
        >
          {COMMODITIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 3. Aggregate Statistical Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total In */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Total Barang Masuk</span>
            <div className="text-lg font-black text-emerald-600">{formatKgValue(totalInWeight)}</div>
            <div className="text-[11px] text-neutral-500 font-mono font-bold uppercase">{formatTonValue(totalInWeight)}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <ArrowUpCircle className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Total Out */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Total Barang Keluar</span>
            <div className="text-lg font-black text-rose-600">{formatKgValue(totalOutWeight)}</div>
            <div className="text-[11px] text-neutral-500 font-mono font-bold uppercase">{formatTonValue(totalOutWeight)}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <ArrowDownCircle className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Current Stock Balance */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-emerald-950/75 font-black uppercase tracking-wider">Stok Logistik Saat Ini</span>
            <div className="text-lg text-emerald-950 font-black">{formatKgValue(currentStockBalance)}</div>
            <div className="text-[11px] text-emerald-950/80 font-mono font-bold uppercase">{formatTonValue(currentStockBalance)}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-700 w-11 h-11 rounded-xl flex items-center justify-center shadow-inner">
            <Package className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* 4. Manual Entry Form */}
      {showAddForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
          <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-neutral-500" />
            {editingId ? 'Edit Catatan Logistik' : 'Formulir Catatan Logistik Baru'}
          </h3>
          <form onSubmit={handleSaveRecord} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block mb-1 font-bold text-neutral-600 uppercase tracking-wider text-[9px]">{t.dateLabel}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-xl bg-white text-neutral-800 font-medium focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-bold text-neutral-600 uppercase tracking-wider text-[9px]">{t.policeNo}</label>
              <input type="text" placeholder="DP 8600 AL" value={policeNo} onChange={(e) => setPoliceNo(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-xl bg-white text-neutral-800 font-bold uppercase focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-bold text-neutral-600 uppercase tracking-wider text-[9px]">{t.descriptionLabel}</label>
              <input type="text" placeholder="Penerimaan dari Supplier / Pengiriman" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-neutral-200 p-2.5 rounded-xl bg-white text-neutral-800 font-medium focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-bold text-neutral-600 uppercase tracking-wider text-[9px]">Pilihan Komoditas / Item</label>
              <input
                type="text"
                placeholder="Spesifikasi / Jenis Item (Opsional)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full border border-neutral-200 p-2.5 rounded-xl bg-white text-neutral-800 font-bold uppercase focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <SmartNumberInput
                value={price}
                onChange={setPrice}
                label={t.priceLabel}
                mode="currency"
                unit="Rp/Kg"
                presets={[10000, 11000, 12000, 12500, 13000]}
              />
            </div>
            <div>
              <SmartNumberInput
                value={colly}
                onChange={setColly}
                label={t.collyLabel}
                mode="general"
                unit="Sak"
                presets={[50, 100, 200, 300, 500]}
              />
            </div>
            <div>
              <SmartNumberInput
                value={inWeight}
                onChange={setInWeight}
                label={t.inStockLabel}
                mode="weight"
                unit="Kg"
                presets={[1000, 5000, 10000, 15000]}
              />
            </div>
            <div>
              <SmartNumberInput
                value={outWeight}
                onChange={setOutWeight}
                label={t.outStockLabel}
                mode="weight"
                unit="Kg"
                presets={[1000, 5000, 10000, 15000]}
              />
            </div>
            <div className="col-span-1 md:col-span-3 flex justify-end gap-2.5 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-[10px] px-5 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-6 py-2.5 rounded-xl shadow transition cursor-pointer uppercase tracking-wider active:scale-95"
              >
                {t.saveStock}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      {/* 5. Filters, Search and Sorting Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-neutral-200 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari No. Polisi / Uraian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 outline-none text-neutral-700 font-medium"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mr-1">Urutan Baris:</span>
          <button
            onClick={() => setSortOrder('NEWEST')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition duration-150 cursor-pointer ${
              sortOrder === 'NEWEST'
                ? 'bg-emerald-600 text-white border-emerald-650 shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-55'
            }`}
          >
            Terbaru di Atas
          </button>
          <button
            onClick={() => setSortOrder('OLDEST')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition duration-150 cursor-pointer ${
              sortOrder === 'OLDEST'
                ? 'bg-emerald-600 text-white border-emerald-650 shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-55'
            }`}
          >
            Terlama di Atas (Excel)
          </button>
        </div>
      </div>

      {/* 6. Main Stock Table */}
      <div className="bg-white border border-neutral-300 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-neutral-600 min-w-[1000px]">
            <thead className="bg-neutral-50 text-neutral-800 font-bold border-b border-neutral-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t.dateLabel}</th>
                <th className="py-3 px-4">{t.policeNo}</th>
                <th className="py-3 px-4">{t.descriptionLabel}</th>
                <th className="py-3 px-4">{t.itemNameLabel}</th>
                <th className="py-3 px-4 text-right">{t.priceLabel}</th>
                <th className="py-3 px-4 text-right">{t.collyLabel}</th>
                <th className="py-3 px-4 text-right">{t.inStockLabel}</th>
                <th className="py-3 px-4 text-right">{t.outStockLabel}</th>
                <th className="py-3 px-4 text-right">{t.totalTransaction}</th>
                <th className="py-3 px-4 text-right">{t.totalStockBalance}</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 text-xs">
              {filteredAndSortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-neutral-400 font-bold uppercase tracking-wider">
                    Tidak ada catatan logistik ditemukan untuk {commodityTab}.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRecords.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-neutral-600">{r.date}</td>
                    <td className="py-3 px-4 font-black text-neutral-850">{r.policeNo}</td>
                    <td className="py-3 px-4 font-medium text-neutral-750">{r.description}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        (r.commodity || r.itemName?.toUpperCase()) === 'BERAS' ? 'bg-emerald-50 text-emerald-700' : (r.commodity || r.itemName?.toUpperCase()) === 'JAGUNG' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        <span>{(r.commodity || r.itemName?.toUpperCase()) === 'BERAS' ? '🌾' : (r.commodity || r.itemName?.toUpperCase()) === 'JAGUNG' ? '🌽' : '🫘'}</span>
                        <span>{r.itemName}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-neutral-600">Rp {(r.price ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-800">{(r.colly ?? 0).toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 font-black text-emerald-600 text-right">
                      {r.inWeight > 0 ? `+${(r.inWeight ?? 0).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-black text-rose-600 text-right">
                      {r.outWeight > 0 ? `-${(r.outWeight ?? 0).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-medium text-neutral-600">
                      {r.totalTransaksi > 0 ? `Rp ${r.totalTransaksi.toLocaleString('id-ID')}` : 'Rp 0'}
                    </td>
                    <td className={`py-3 px-4 font-black font-mono text-right text-[12px] opacity-95 ${
                      r.runningTotal >= 0 ? 'text-neutral-900' : 'text-rose-600'
                    }`}>
                      {(r.runningTotal ?? 0).toLocaleString('id-ID')} Kg
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2.5 justify-center items-center">
                        <button onClick={() => setPreviewRecord(r)} className="text-neutral-400 hover:text-sky-600 transition cursor-pointer p-1 rounded-md hover:bg-neutral-100" title="Cetak Resi">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setWaModalConfig({ 
                          isOpen: true, 
                          defaultText: buildRiceStockWAText(r), 
                          record: r,
                          pdfHtml: getHTMLForPDF(printRiceStockSlip, r, staffName),
                          pdfFileName: `Resi_Stok_${r.itemName?.replaceAll(" ", "_")}_${r.date}.pdf`
                        })} className="text-neutral-400 hover:text-emerald-600 transition cursor-pointer p-1 rounded-md hover:bg-neutral-100" title="Kirim Resi via WA">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        {!r.isSystem && (
                          <>
                            <button onClick={() => handleEdit(r)} className="text-neutral-400 hover:text-blue-600 transition p-1 rounded-md hover:bg-neutral-100" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(r.id, r.description)} className="text-neutral-400 hover:text-red-600 transition p-1 rounded-md hover:bg-neutral-100" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      <AnimatePresence>
        {previewRecord && (
          <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 uppercase text-[11px] tracking-widest text-neutral-700">
                  <Printer className="text-emerald-600 w-4 h-4" />
                  Pratinjau Bukti Stok
                </span>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-neutral-50 p-3.5 border border-dashed border-neutral-300 rounded-xl font-mono text-[10px] text-neutral-800 leading-tight shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-1 mb-2">
                  <div className="font-bold text-xs tracking-widest text-emerald-950">US Bilibili 162</div>
                  <div className="text-[8px] opacity-70">Jalan Poros Pinrang-Polman KM. 12</div>
                  <div className="text-[8px] opacity-70">Desa Bilibili, Kec. Suppa, Kab. Pinrang</div>
                </div>

                <div className="space-y-0.5 mb-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tanggal :</span>
                    <span className="font-bold">{formatReceiptDate(previewRecord.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. Polisi :</span>
                    <span className="font-bold">{previewRecord.policeNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Keterangan :</span>
                    <span className="font-bold">{previewRecord.description}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-1.5 space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">Nama Item :</span>
                    <span className="font-black text-emerald-800">{previewRecord.itemName}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">Masuk :</span>
                    <span className="font-bold text-emerald-600">{(previewRecord.inWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">Keluar :</span>
                    <span className="font-bold text-red-600">{(previewRecord.outWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-neutral-200 mt-1 pt-1 text-[9px]">
                    <span className="uppercase">Jumlah Colly :</span>
                    <span>{(previewRecord.colly ?? 0).toLocaleString('id-ID')} Sak</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-center text-[9px]">
                  <div>
                    <span className="block mb-2">Staff 162</span>
                    <input
                      list="ricestock-staff-list"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full text-center bg-white border border-neutral-200 rounded py-1 px-1 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <datalist id="ricestock-staff-list">
                      {employees.filter(e => e.role === 'PETUGAS' || e.role === 'KARYAWAN').map(e => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <span className="block mb-6">Penerima / Driver</span>
                    <span className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                  </div>
                </div>

                <div className="text-center mt-3 opacity-50 italic text-[7.5px]">
                  * Terimakasih atas kerjasamanya *<br/>
                  Aplikasi Stok US Bilibili 162
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    printRiceStockSlip(previewRecord, staffName);
                    setPreviewRecord(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> <span>CETAK SLIP</span>
                </button>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-black py-2.5 rounded-xl transition cursor-pointer uppercase"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppModal
        isOpen={waModalConfig.isOpen}
        onClose={() => setWaModalConfig({ ...waModalConfig, isOpen: false })}
        defaultText={waModalConfig.defaultText}
        onSend={(phone, text) => sendWhatsAppMessage(phone, text)}
        pdfHtml={waModalConfig.pdfHtml}
        pdfFileName={waModalConfig.pdfFileName}
      />
    </div>
  );
}
