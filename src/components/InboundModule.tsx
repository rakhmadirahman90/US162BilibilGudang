/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InboundRecord, WeighbridgeTicket, VehicleRecord, SupplierRecord, EmployeeRecord } from '../types';
import { mockCornMoistureRefaksi } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';
import { ArrowDownCircle, PlusCircle, Search, Calendar, Scale, Hammer, Percent, Archive, Download, Printer, Edit2, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV, printPDFReport, printCombinedSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildInboundWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';

interface InboundModuleProps {
  records: InboundRecord[];
  tickets: WeighbridgeTicket[];
  onAddRecord: (record: InboundRecord) => void;
  onUpdateRecord: (record: InboundRecord) => void;
  onDeleteRecord: (id: string) => void;
  vehicles?: VehicleRecord[];
  suppliers?: SupplierRecord[];
  employees?: EmployeeRecord[];
}

export default function InboundModule({
  records,
  tickets,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  vehicles = [],
  suppliers = [],
  employees = []
}: InboundModuleProps) {
  const { t, language } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<InboundRecord | null>(null);
  
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

  // WhatsApp Modal State
  const [waModalConfig, setWaModalConfig] = useState<{
    isOpen: boolean;
    defaultText: string;
    record: InboundRecord | null;
    pdfHtml?: string;
    pdfFileName?: string;
  }>({
    isOpen: false,
    defaultText: '',
    record: null
  });

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Form states
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [commodity, setCommodity] = useState<'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA'>('JAGUNG');
  const [grossWeight, setGrossWeight] = useState(12000);
  const [tareWeight, setTareWeight] = useState(4000);
  const [bagDeductionPercent, setBagDeductionPercent] = useState(1.00);
  const [moistureContent, setMoistureContent] = useState(14.0);
  const [warehouseSection, setWarehouseSection] = useState("Gudang Jagung Tengah");
  const [laborCost, setLaborCost] = useState(350000);
  const [price, setPrice] = useState(0);
  const [driverName, setDriverName] = useState("");

  // When a weighing ticket is chosen, automatically fill details!
  const handleTicketChange = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const tk = tickets.find(t => t.id === ticketId);
    if (tk) {
      setVehicleNo(tk.policeNo);
      setSupplier(tk.agency); // assume agent represents supplier/origin
      setCommodity(tk.goodsName === 'BERAS' ? 'BERAS' : tk.goodsName === 'GABAH' ? 'GABAH' : 'JAGUNG');
      setGrossWeight(tk.timbang1Weight);
      setTareWeight(tk.timbang2Weight);
      setBagDeductionPercent(tk.bagDeductionPercent);
      setMoistureContent(tk.refaksiPercent > 0 ? 15.0 : 14.0); // default guess or mock
    }
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo.trim() || !supplier.trim()) {
      (window as any).__showToast?.("Harap lengkapi semua isian wajib seperti nomor kendaraan dan nama suplier!", "error");
      return;
    }

    // Determine refaksi KA
    const refaksiPercentage = commodity === 'JAGUNG' 
      ? mockCornMoistureRefaksi(moistureContent).refaksiPercent
      : 0;

    // Calculate netto
    const rawNet = grossWeight - tareWeight;
    const bagDeduction = rawNet * (bagDeductionPercent / 100);
    const refaksiDeduction = rawNet * (refaksiPercentage / 100);
    const fNet = Math.round(rawNet - bagDeduction - refaksiDeduction);

    const tkNo = tickets.find(t => t.id === selectedTicketId)?.ticketNo;
    const existing = records.find(r => r.id === editingId);

    const newRecord: InboundRecord = {
      id: editingId || `inbound-${Date.now()}`,
      date: existing ? existing.date : new Date().toISOString().split('T')[0],
      ticketNo: tkNo || (existing ? existing.ticketNo : undefined),
      vehicleNo: vehicleNo.toUpperCase(),
      supplier: supplier.toUpperCase(),
      commodity,
      grossWeight,
      tareWeight,
      refaksiKaPercent: refaksiPercentage,
      bagDeductionPercent,
      netWeight: fNet,
      moistureContent,
      warehouseSection,
      laborCost,
      price,
      totalPrice: fNet * price,
      driverName
    };

    const executeSave = () => {
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
      title: editingId ? "Konfirmasi Ubah Barang Masuk" : "Konfirmasi Tambah Barang Masuk",
      message: editingId
        ? `Apakah Anda yakin ingin memperbarui catatan penerimaan ${commodity} dari ${supplier.toUpperCase()}?`
        : `Apakah Anda yakin ingin mendaftarkan penerimaan komoditas ${commodity} dari ${supplier.toUpperCase()} dengan berat bersih ${(fNet ?? 0).toLocaleString('id-ID')} Kg?`,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const resetForm = () => {
    setSelectedTicketId("");
    setVehicleNo("");
    setSupplier("");
    setCommodity("JAGUNG");
    setGrossWeight(12000);
    setTareWeight(4000);
    setBagDeductionPercent(1.00);
    setMoistureContent(14.0);
    setWarehouseSection("Gudang Jagung Tengah");
    setLaborCost(350000);
    setPrice(0);
    setDriverName("");
    setEditingId(null);
  };

  // Filter
  const filteredRecords = records.filter(r => 
    r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.ticketNo && r.ticketNo.includes(searchQuery))
  );

  // --- EXPORT & PRINT HANDLERS ---
  const handleExportExcel = () => {
    const headers = [
      'No. Tiket', 'Tanggal', 'No. Polisi', 'Sopir', 'Supplier', 
      'Komoditas', 'Gross (Kg)', 'Tare (Kg)', 'Netto (Kg)', 
      'Kadar Air (%)', 'Refaksi (%)', 'Deduction Karung (%)', 'Sektor Gudang', 'Upah Buruh'
    ];
    const rows = filteredRecords.map(r => [
      r.ticketNo || '',
      r.date,
      r.vehicleNo,
      r.driverName || '',
      r.supplier,
      r.commodity,
      r.grossWeight.toString(),
      r.tareWeight.toString(),
      r.netWeight.toString(),
      r.moistureContent.toString(),
      r.refaksiKaPercent.toString(),
      r.bagDeductionPercent.toString(),
      r.warehouseSection || '',
      r.laborCost.toString()
    ]);
    exportToCSV(headers, rows, 'Laporan_Barang_Masuk');
  };

  const handlePrintPDF = () => {
    const headers = [
      'Tanggal', 'No. Tiket', 'No. Polisi', 'Supplier', 'Komoditas', 'Sektor Gudang', 'Netto'
    ];
    const rows = filteredRecords.map(r => [
      r.date,
      r.ticketNo || '-',
      r.vehicleNo,
      r.supplier,
      r.commodity,
      r.warehouseSection || '-',
      `${(r.netWeight ?? 0).toLocaleString('id-ID')} Kg`
    ]);
    const totalNetWeight = filteredRecords.reduce((sum, r) => sum + r.netWeight, 0);
    const totalLabor = filteredRecords.reduce((sum, r) => sum + r.laborCost, 0);
    const summaries = [
      { label: 'Total Penerimaan', value: `${filteredRecords.length} Transaksi` },
      { label: 'Total Tonase Bersih (Netto)', value: `${totalNetWeight.toLocaleString('id-ID')} Kg` },
      { label: 'Total Ongkos Buruh Panggul', value: `Rp ${totalLabor.toLocaleString('id-ID')}` }
    ];
    printPDFReport('Laporan Penerimaan Barang Masuk', headers, rows, summaries);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <ArrowDownCircle className="text-emerald-600 w-6 h-6" />
            {t.inboundTitle}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Mengelola penerimaan komoditas jagung, beras, atau gabah dari suplier luar dan petani.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? t.close : t.recordNew}
        </button>
      </div>

      {/* FORM BARANG MASUK */}
      {showAddForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 border-b border-neutral-100 pb-2">
            {editingId ? 'Formulir Ubah Transaksi Barang Masuk' : 'Formulir Catat Barang Masuk Baru'}
          </h3>
          <form onSubmit={handleCreateRecord} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Sec 1: Ticket Links / Plate */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">1. REFERENSI TIMBANGAN</span>
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 flex flex-col gap-2">
                <label className="block text-neutral-600">Pilih Tiket Jembatan Timbang (Opsional)</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => handleTicketChange(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-amber-600"
                >
                  <option value="">-- Manual Tanpa Tiket Timbang --</option>
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      Tiket {t.ticketNo} ({t.policeNo}) - Net {(t.netWeight ?? 0).toLocaleString()} Kg
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-700 italic">
                  💡 Memilih tiket timbang akan mengimpor data Berat Bruto, Tara, Nomor Polisi, dan Potongan Karung secara otomatis.
                </p>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">No. Kendaraan (Wajib)</label>
                <input
                  type="text"
                  placeholder="Contoh: DD 8214 KK"
                  value={vehicleNo}
                  onChange={(e) => {
                    const uppercaseVal = e.target.value.toUpperCase();
                    setVehicleNo(uppercaseVal);
                    const matched = vehicles.find(v => v.policeNo === uppercaseVal);
                    if (matched) {
                      if (matched.driverName && !driverName) {
                        setDriverName(matched.driverName);
                      }
                      if (matched.tareWeight && !tareWeight) {
                        setTareWeight(matched.tareWeight);
                      }
                    }
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 uppercase"
                  list="inbound-vehicles"
                />
                <datalist id="inbound-vehicles">
                  {vehicles.map(v => (
                    <option key={v.id} value={v.policeNo}>{v.driverName} &bull; {v.vehicleType} (Tara: {v.tareWeight}kg)</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Nama Driver/Sopir</label>
                <input
                  type="text"
                  placeholder="Contoh: Daeng Naba"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  list="inbound-drivers"
                />
                <datalist id="inbound-drivers">
                  {vehicles.map(v => (
                    <option key={v.id} value={v.driverName}>{v.policeNo}</option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Sec 2: Product & Weights */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">2. DETIL KOMODITAS & BERAT</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Jenis Komoditas</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    <option value="JAGUNG">JAGUNG PIPIL 🌽</option>
                    <option value="BERAS">BERAS MOLEK 🌾</option>
                    <option value="GABAH">GABAH KERING 🍚</option>
                    <option value="LAINNYA">LAIN-LAIN 📦</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#475569] font-semibold mb-1">Nama Suplier / Pemilik</label>
                  <input
                    type="text"
                    placeholder="Contoh: H. Mustamin"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 font-bold"
                    list="inbound-suppliers"
                  />
                  <datalist id="inbound-suppliers">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.address} &bull; {s.phone}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Berat Bruto (Kg)</label>
                  <input
                    type="text"
                    value={formatNumberInput(grossWeight)}
                    onChange={(e) => setGrossWeight(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Berat Tara (Kg)</label>
                  <input
                    type="text"
                    value={formatNumberInput(tareWeight)}
                    onChange={(e) => setTareWeight(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Potongan Karung (%)</label>
                  <input
                    type="text"
                    value={formatNumberInput(bagDeductionPercent)}
                    onChange={(e) => setBagDeductionPercent(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Kadar Air (KA %)</label>
                  <input
                    type="text"
                    value={formatNumberInput(moistureContent)}
                    onChange={(e) => setMoistureContent(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Sec 3: Offloading and placement */}
            <div className="flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-3">
                <span className="font-bold text-neutral-500">3. ALOKASI OPERASIONAL</span>
                <div>
                  <label className="block text-neutral-600 mb-1">Sektor Letak Gudang</label>
                  <input
                    type="text"
                    value={warehouseSection}
                    onChange={(e) => setWarehouseSection(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                    placeholder="Misal: Gudang Utara, Silo Jagung B"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1">Biaya Buruh Panggul Bongkar (Rp)</label>
                  <input
                    type="text"
                    value={formatNumberInput(laborCost)}
                    onChange={(e) => setLaborCost(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Harga Satuan (Rp/Kg)</label>
                  <input
                    type="text"
                    value={formatNumberInput(price)}
                    onChange={(e) => setPrice(parseNumberInput(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-1 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan Transaksi' : 'Simpan Transaksi Masuk'}
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

      {/* FILTER SEARCH FIELD */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="font-bold text-neutral-800 text-sm shrink-0">{t.archives} {t.inboundTitle} ({filteredRecords.length})</span>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
            <button
              onClick={handleExportExcel}
              title="Unduh seluruh daftar rekap penerimaan barang masuk ke format Microsoft Excel"
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
                placeholder="Cari Suplier, No. Polisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-emerald-600 focus:bg-white font-semibold text-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* DATA ARCHIVE TABLE */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Tiket Timbang</th>
                <th className="py-2.5 px-3">No. Polisi</th>
                <th className="py-2.5 px-3">Suplier / Pemilik</th>
                <th className="py-2.5 px-3">Komoditas</th>
                <th className="text-right py-2.5 px-3">Carg (Bruto/Tara)</th>
                <th className="text-center py-2.5 px-3">KA % (Refaksi)</th>
                <th className="text-right py-2.5 px-3">Netto Bersih</th>
                <th className="py-2.5 px-3">Sektor Gudang</th>
                <th className="text-right py-2.5 px-3">Ongkos Buruh</th>
                <th className="text-center py-2.5 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map((r) => {
                const isJagung = r.commodity === 'JAGUNG';
                return (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {r.date}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold font-mono text-[#a04010]">
                      {r.ticketNo ? (
                        <span className="flex items-center gap-1">
                          <Scale className="w-3 h-3 text-neutral-400" />
                          {r.ticketNo}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Tanpa Tiket</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{r.vehicleNo}</td>
                    <td className="py-2.5 px-3 text-neutral-800 uppercase font-medium">{r.supplier}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        r.commodity === 'JAGUNG' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        r.commodity === 'BERAS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {r.commodity}
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-3 font-mono text-neutral-500">
                      <div>{(r.grossWeight ?? 0).toLocaleString()} kg G</div>
                      <div className="text-[10px]">{(r.tareWeight ?? 0).toLocaleString()} kg T</div>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <div className="font-semibold text-indigo-700">{r.moistureContent.toFixed(1)}%</div>
                      {r.refaksiKaPercent > 0 && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1 rounded font-bold">
                          -{r.refaksiKaPercent}% Pot
                        </span>
                      )}
                    </td>
                    <td className="text-right py-2.5 px-3 font-extrabold font-mono text-emerald-600">
                      {(r.netWeight ?? 0).toLocaleString()} kg
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        {r.warehouseSection}
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-3 font-mono text-neutral-700">
                      Rp {(r.laborCost ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => setPreviewRecord(r)}
                          className="text-neutral-400 hover:text-emerald-600 transition p-1 cursor-pointer"
                          title="Cetak Resi Terpadu"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const tk = tickets.find(t => t.ticketNo === r.ticketNo);
                            setWaModalConfig({ 
                              isOpen: true, 
                              defaultText: buildInboundWAText(r, tk), 
                              record: r,
                              pdfHtml: getHTMLForPDF(printCombinedSlip, r, tk, staffName),
                              pdfFileName: `Resi_Penerimaan_${r.ticketNo || r.id.substring(0,8)}.pdf`
                            });
                          }}
                          className="text-neutral-400 hover:text-emerald-600 transition p-1 cursor-pointer"
                          title="Kirim ke WA"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setSelectedTicketId(tickets.find(t => t.ticketNo === r.ticketNo)?.id || "");
                            setVehicleNo(r.vehicleNo);
                            setSupplier(r.supplier);
                            setCommodity(r.commodity);
                            setGrossWeight(r.grossWeight);
                            setTareWeight(r.tareWeight);
                            setBagDeductionPercent(r.bagDeductionPercent);
                            setMoistureContent(r.moistureContent);
                            setWarehouseSection(r.warehouseSection);
                            setLaborCost(r.laborCost);
                            setDriverName(r.driverName || "");
                            setShowAddForm(true);
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
                              title: "Konfirmasi Hapus Penerimaan",
                              message: `Apakah Anda yakin ingin menghapus catatan penerimaan barang masuk dari ${r.supplier} (${(r.netWeight ?? 0).toLocaleString('id-ID')} Kg) secara permanen?`,
                              type: 'DELETE',
                              onConfirm: () => {
                                onDeleteRecord(r.id);
                                closeConfirm();
                              }
                            });
                          }}
                          className="text-neutral-400 hover:text-red-650 text-red-600 transition p-1 font-bold cursor-pointer"
                          title="Hapus Catatan"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-neutral-400 italic">
                    Belum ada rekapan barang masuk terdaftar.
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
                  <Printer className="text-emerald-600 w-4 h-4" />
                  Pratinjau Resi Penerimaan
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
                    <span className="text-neutral-500">No. Tiket/Ref :</span>
                    <span className="font-bold">{previewRecord.ticketNo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. Polisi :</span>
                    <span className="font-bold">{previewRecord.vehicleNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Suplier :</span>
                    <span className="font-bold">{previewRecord.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Komoditas :</span>
                    <span className="font-bold">{previewRecord.commodity}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>BERAT BRUTO :</span>
                    <span className="font-bold">{(previewRecord.grossWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BERAT TARA :</span>
                    <span className="font-bold">{(previewRecord.tareWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Pot. Karung ({previewRecord.bagDeductionPercent}%) :</span>
                    <span>-{( ( (previewRecord.grossWeight ?? 0) - (previewRecord.tareWeight ?? 0) ) * (previewRecord.bagDeductionPercent/100) ).toFixed(0)} Kg</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Refaksi KA ({previewRecord.refaksiKaPercent}%) :</span>
                    <span>-{( ( (previewRecord.grossWeight ?? 0) - (previewRecord.tareWeight ?? 0) ) * (previewRecord.refaksiKaPercent/100) ).toFixed(0)} Kg</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-700 text-[11px] border-t border-neutral-200 mt-1 pt-1">
                    <span>BERAT NETTO :</span>
                    <span>{(previewRecord.netWeight ?? 0).toLocaleString('id-ID')} KG</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center text-[9px]">
                  <div>
                    <p className="mb-2">Staff 162</p>
                    <input
                      list="inbound-staff-list"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full text-center bg-white border border-neutral-200 rounded py-1 px-1 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <datalist id="inbound-staff-list">
                      {employees.filter(e => e.role === 'PETUGAS' || e.role === 'KARYAWAN').map(e => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <p className="mb-8">Sopir / Pembawa</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                  </div>
                </div>

                <div className="text-center mt-4 opacity-50 italic text-[7px]">
                  * Terimakasih atas kerjasamanya *<br/>
                  Aplikasi Timbangan GSC GST-9700 v2.0
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    const tk = tickets.find(t => t.ticketNo === previewRecord.ticketNo);
                    printCombinedSlip(previewRecord, tk, staffName);
                    setPreviewRecord(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> CETAK SLIP
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
