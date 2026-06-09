/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import { ServiceRecord, EmployeeRecord, CustomerRecord } from '../types';
import { Wind, Trash, User, Search, Play, Plus, DollarSign, CheckCircle2, AlertCircle, Download, Printer, Edit2, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';
import { exportToCSV, printPDFReport, printServiceSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildServiceWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';

interface ServicesModuleProps {
  records: ServiceRecord[];
  employees?: EmployeeRecord[];
  customers?: CustomerRecord[];
  onAddRecord: (record: ServiceRecord) => void;
  onUpdateRecord: (record: ServiceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function ServicesModule({
  records,
  employees = [],
  customers = [],
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord
}: ServicesModuleProps) {
  const { t, language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<ServiceRecord | null>(null);

  // WhatsApp Modal State
  const [waModalConfig, setWaModalConfig] = useState<{
    isOpen: boolean;
    defaultText: string;
    record: ServiceRecord | null;
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

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'DELETE' | 'EDIT';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'ADD',
    onConfirm: () => {}
  });

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState<'POLES' | 'KIPAS' | 'POLES & KIPAS' | 'DRYER'>('POLES & KIPAS');
  const [commodity, setCommodity] = useState("Beras Medium B+");
  const [weight, setWeight] = useState(10000);
  const [ratePerKg, setRatePerKg] = useState(150); // standard rate is Rp 150 per kg
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PAID'>('PAID');
  const [operatorName, setOperatorName] = useState("Asma");

  // Dynamically set standard rate when service moves
  const handleServiceTypeChange = (type: 'POLES' | 'KIPAS' | 'POLES & KIPAS' | 'DRYER') => {
    setServiceType(type);
    if (type === 'POLES & KIPAS') {
      setRatePerKg(150);
    } else if (type === 'POLES') {
      setRatePerKg(100);
    } else if (type === 'KIPAS') {
      setRatePerKg(80); // kipas saja
    } else {
      setRatePerKg(120); // dryer saja
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !commodity.trim()) {
      (window as any).__showToast?.("Harap masukkan nama pelanggan dan jenis komoditas!", "error");
      return;
    }

    const existing = records.find(r => r.id === editingId);

    const newRecord: ServiceRecord = {
      id: editingId || `service-${Date.now()}`,
      date: existing ? existing.date : new Date().toISOString().split('T')[0],
      customerName: customerName.toUpperCase(),
      serviceType,
      commodity,
      weight,
      ratePerKg,
      totalFee: weight * ratePerKg,
      paymentStatus,
      operatorName
    };

    const executeSave = () => {
      if (editingId) {
        onUpdateRecord(newRecord);
      } else {
        onAddRecord(newRecord);
      }
      setShowForm(false);
      resetForm();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? "Konfirmasi Ubah Layanan Jasa" : "Konfirmasi Tambah Layanan Jasa",
      message: editingId
        ? `Apakah Anda yakin ingin memperbarui catatan layanan jasa ${serviceType} untuk pelanggan ${customerName.toUpperCase()}?`
        : `Apakah Anda yakin mendaftarkan jasa ${serviceType} untuk pelanggan ${customerName.toUpperCase()} dengan total biaya Rp ${(weight * ratePerKg).toLocaleString('id-ID')}?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const resetForm = () => {
    setCustomerName("");
    setServiceType("POLES & KIPAS");
    setCommodity("Beras Medium B+");
    setWeight(10000);
    setRatePerKg(150);
    setPaymentStatus("PAID");
    setOperatorName("Asma");
    setEditingId(null);
  };

  const filteredServices = records.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- EXPORT & PRINT HANDLERS ---
  const handleExportExcel = () => {
    const headers = [
      'Tanggal', 'Pelanggan', 'Jenis Layanan', 'Keterangan Barang', 
      'Berat (Kg)', 'Tarif / Kg (Rp)', 'Total Biaya Jasa (Rp)', 'Operator', 'Status Bayar'
    ];
    const rows = filteredServices.map(s => [
      s.date,
      s.customerName,
      s.serviceType,
      s.commodity,
      s.weight.toString(),
      s.ratePerKg.toString(),
      s.totalFee.toString(),
      s.operatorName,
      s.paymentStatus
    ]);
    exportToCSV(headers, rows, 'Laporan_Jasa_Poles_Kipas');
  };

  const handlePrintPDF = () => {
    const headers = [
      'Tanggal', 'Pelanggan', 'Layanan', 'Komoditas', 'Beban', 'Tarif / Kg', 'Total Jasa'
    ];
    const rows = filteredServices.map(s => [
      s.date,
      s.customerName,
      s.serviceType,
      s.commodity,
      `${s.weight.toLocaleString('id-ID')} Kg`,
      `Rp ${s.ratePerKg.toLocaleString('id-ID')}`,
      `Rp ${s.totalFee.toLocaleString('id-ID')}`
    ]);
    const totalWeight = filteredServices.reduce((sum, s) => sum + s.weight, 0);
    const totalCost = filteredServices.reduce((sum, s) => sum + s.totalFee, 0);
    const summaries = [
      { label: 'Total Pesanan Jasa', value: `${filteredServices.length} Order` },
      { label: 'Total Tonase Diproses', value: `${totalWeight.toLocaleString('id-ID')} Kg` },
      { label: 'Total Pendapatan Jasa', value: `Rp ${totalCost.toLocaleString('id-ID')}` }
    ];
    printPDFReport('Laporan Layanan Jasa Poles & Kipas', headers, rows, summaries);
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <Wind className="text-blue-500 w-6 h-6 animate-pulse" />
            {t.servicesTitle}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Mencatat pendapatan pemrosesan poles beras, pembersihan blower kipas jagung pipil, dan cetak invoice jasa panggilingan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showForm ? t.close : t.recordNew}
        </button>
      </div>

      {/* SERVICE DRAFT FORM */}
      {showForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 border-b border-neutral-100 pb-2">
            {editingId ? 'Formulir Ubah Transaksi Jasa Poles & Kipas' : 'Formulir Jasa Poles & Kipas Baru'}
          </h3>
          <form onSubmit={handleCreateService} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Customer & Type */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-neutral-600 mb-1">Nama Pelanggan (Customer)</label>
                <input
                  type="text"
                  placeholder="Contoh: Agen UCU POLES, IDA, dll"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-sky-500 font-semibold"
                  list="master-customers"
                />
                <datalist id="master-customers">
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.phone || c.address}</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Jenis Layanan</label>
                <select
                  value={serviceType}
                  onChange={(e) => handleServiceTypeChange(e.target.value as any)}
                  className="w-full bg-slate-50 border border-neutral-200 rounded p-2 cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="POLES & KIPAS">POLES & KIPAS (Blower + Polish) 🌾🌪️</option>
                  <option value="POLES">POLES (Pembersihan Saja) 🌾</option>
                  <option value="KIPAS">KIPAS (Pemisah Serpihan) 🌪️</option>
                  <option value="DRYER">DRYER (Pengeringan Jagung) 🔥🌽</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Keterangan Barang / Mutu</label>
                <input
                  type="text"
                  placeholder="Contoh: Beras Medium B+ Kepala Basah"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Calculations & Weights */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-neutral-600 mb-1">Total Berat Barang Diproses (Kg)</label>
                <input
                  type="text"
                  value={formatNumberInput(weight)}
                  onChange={(e) => setWeight(parseNumberInput(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-sky-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Tarif (Rp per Kg)</label>
                  <input
                    type="text"
                    value={formatNumberInput(ratePerKg)}
                    onChange={(e) => setRatePerKg(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Total Biaya (Terhitung)</label>
                  <div className="p-2 border border-neutral-100 bg-neutral-50 font-bold block rounded font-mono text-sky-700 text-sm">
                    Rp {(weight * ratePerKg).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#474747] mb-1">Operator Penanggungjawab</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  list="master-operators"
                />
                <datalist id="master-operators">
                  <option value="Asma" />
                  {employees.filter(e => e.role === 'KARYAWAN' || e.role === 'PETUGAS').map(e => (
                    <option key={e.id} value={e.name}>{e.role}</option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Payment & Submit */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-neutral-600 mb-2">Status Pembayaran</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment_status" 
                      checked={paymentStatus === 'PAID'}
                      onChange={() => setPaymentStatus('PAID')}
                    />
                    <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">LUNAS / PAID</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment_status" 
                      checked={paymentStatus === 'UNPAID'}
                      onChange={() => setPaymentStatus('UNPAID')}
                    />
                    <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">BELUM LUNAS</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-1 border-t border-neutral-105">
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan Jasa' : 'Simpan Jasa Poles'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* FILTER SEARCH OR VIEW TABLE */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <span className="font-bold text-neutral-800 text-sm shrink-0">Arsip Poles & Kipas ({filteredServices.length})</span>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
            <button
              onClick={handleExportExcel}
              title="Unduh seluruh rekap jasa poles kipas ke Microsoft Excel"
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
            <button
              onClick={handlePrintPDF}
              title="Cetak Laporan atau simpan sebagai dokumen PDF"
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
            </button>

            <div className="relative w-full sm:w-48 shrink-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari Pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-sky-600 focus:bg-white font-semibold text-neutral-700"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Pelanggan</th>
                <th className="py-2.5 px-3">Layanan</th>
                <th className="py-2.5 px-3">Keterangan Barang</th>
                <th className="text-right py-2.5 px-3">Beban (Kg)</th>
                <th className="text-right py-2.5 px-3">Tarif / Kg</th>
                <th className="text-right py-2.5 px-3">Total Jasa (Rp)</th>
                <th className="py-2.5 px-3">Tim Operator</th>
                <th className="text-center py-2.5 px-3">Pembayaran</th>
                <th className="text-center py-2.5 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-500 font-mono">{s.date}</td>
                  <td className="py-2.5 px-3 font-bold text-neutral-800">{s.customerName}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      {s.serviceType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 font-medium">{s.commodity}</td>
                  <td className="text-right py-2.5 px-3 font-bold font-mono">{s.weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg</td>
                  <td className="text-right py-2.5 px-3 font-mono text-neutral-500">Rp {s.ratePerKg.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="text-right py-2.5 px-3 font-extrabold font-mono text-blue-600 bg-sky-50/20">
                    Rp {s.totalFee.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 italic text-[11px]">{s.operatorName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.paymentStatus === 'PAID' ? t.paidStatus : t.unpaidStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => setPreviewRecord(s)}
                        className="text-neutral-400 hover:text-sky-600 transition p-1 cursor-pointer"
                        title="Cetak Resi"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setWaModalConfig({ 
                            isOpen: true, 
                            defaultText: buildServiceWAText(s), 
                            record: s,
                            pdfHtml: getHTMLForPDF(printServiceSlip, s, staffName),
                            pdfFileName: `Resi_Jasa_${s.id.substring(0,8)}.pdf`
                          });
                        }}
                        className="text-neutral-400 hover:text-emerald-600 transition p-1 cursor-pointer"
                        title="Kirim Nota via WA"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(s.id);
                          setCustomerName(s.customerName);
                          setServiceType(s.serviceType);
                          setCommodity(s.commodity);
                          setWeight(s.weight);
                          setRatePerKg(s.ratePerKg);
                          setPaymentStatus(s.paymentStatus);
                          setOperatorName(s.operatorName);
                          setShowForm(true);
                        }}
                        className="text-neutral-400 hover:text-blue-600 transition p-1 cursor-pointer"
                        title="Ubah Catatan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Konfirmasi Hapus Layanan Jasa",
                            message: `Apakah Anda yakin ingin menghapus catatan layanan jasa ${s.serviceType} untuk ${s.customerName} secara permanen?`,
                            type: 'DELETE',
                            onConfirm: () => {
                              onDeleteRecord(s.id);
                              closeConfirm();
                            }
                          });
                        }}
                        className="text-neutral-400 hover:text-red-500 transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-neutral-400 italic">
                    Belum ada pemrosesan jasa poles terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM MODAL OVERLAY */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* RECEIPT PREVIEW MODAL */}
      <AnimatePresence>
        {previewRecord && (
          <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 uppercase text-xs tracking-widest">
                  <Printer className="text-blue-500 w-4 h-4" />
                  Pratinjau Resi Layanan Jasa
                </span>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-neutral-50 p-4 border border-dashed border-neutral-300 rounded font-mono text-[10px] text-neutral-800 leading-relaxed shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-2 mb-3">
                  <div className="font-bold text-xs tracking-widest text-emerald-950">CV. BILIBILI 162</div>
                  <div className="text-[8px] opacity-70">Jalan Poros Pinrang-Polman KM. 12</div>
                  <div className="text-[8px] opacity-70">Desa Bilibili, Kec. Suppa, Kab. Pinrang</div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tanggal :</span>
                    <span className="font-bold">{formatReceiptDate(previewRecord.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pelanggan :</span>
                    <span className="font-bold">{previewRecord.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Komoditas :</span>
                    <span className="font-bold">{previewRecord.commodity}</span>
                  </div>
                </div>

                <div className="border-y border-neutral-200 py-3 my-2 bg-white/50 px-2 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-neutral-500">JENIS LAYANAN :</span>
                    <span className="font-black text-neutral-800">{previewRecord.serviceType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-500">BERAT BARANG :</span>
                    <span className="font-black text-neutral-800">{previewRecord.weight.toLocaleString('id-ID')} KG</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                    <span className="font-bold text-neutral-500">TARIF / KG :</span>
                    <span className="font-bold">Rp {previewRecord.ratePerKg.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-neutral-500 text-[11px]">TOTAL TAGIHAN :</span>
                    <span className="font-black text-blue-600 text-[12px]">Rp {previewRecord.totalFee.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex justify-center mt-3">
                   <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest ${
                     previewRecord.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {previewRecord.paymentStatus === 'PAID' ? 'LUNAS / PAID' : 'BELUM LUNAS'}
                   </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center text-[9px]">
                  <div>
                    <p className="mb-8">Staff 162</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">{staffName}</p>
                  </div>
                  <div>
                    <p className="mb-8">Pelanggan</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                  </div>
                </div>

                <div className="text-center mt-4 opacity-50 italic text-[7px]">
                  * Terimakasih atas kerjasamanya *<br/>
                  Aplikasi Jasa Poles Bilibili v1.0
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    printServiceSlip(previewRecord, staffName);
                    setPreviewRecord(null);
                  }}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> CETAK RESI
                </button>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2 rounded-lg"
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
