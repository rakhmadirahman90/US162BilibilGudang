/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InboundRecord, WeighbridgeTicket, VehicleRecord, SupplierRecord, EmployeeRecord, LaborRateRecord, CornMoistureRule } from '../types';
import { getRefaksiByRule, initialCornMoistureRules } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';
import { ArrowDownCircle, PlusCircle, Search, Calendar, Scale, Hammer, Percent, Archive, Download, Printer, Edit2, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToCSV, printPDFReport, printCombinedSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildInboundWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import SmartNumberInput from './SmartNumberInput';

interface InboundModuleProps {
  records: InboundRecord[];
  tickets: WeighbridgeTicket[];
  onAddRecord: (record: InboundRecord) => void;
  onUpdateRecord: (record: InboundRecord) => void;
  onDeleteRecord: (id: string) => void;
  vehicles?: VehicleRecord[];
  suppliers?: SupplierRecord[];
  employees?: EmployeeRecord[];
  laborRates?: LaborRateRecord[];
  cornMoistureRules?: CornMoistureRule[];
}

export default function InboundModule({
  records,
  tickets,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  vehicles = [],
  suppliers = [],
  employees = [],
  laborRates = [],
  cornMoistureRules = []
}: InboundModuleProps) {
  const { t, language } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<InboundRecord | null>(null);
  const [showMoistureModal, setShowMoistureModal] = useState(false);
  
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
  const [refaksiType, setRefaksiType] = useState<'LOKAL' | 'LUAR_DAERAH'>('LOKAL');
  const [warehouseSection, setWarehouseSection] = useState("Gudang Jagung Tengah");
  const [selectedLaborId, setSelectedLaborId] = useState("");
  const [laborCost, setLaborCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [driverName, setDriverName] = useState("");

  // Automatically update laborCost when grossWeight, tareWeight, or selectedLaborId changes
  React.useEffect(() => {
    if (selectedLaborId) {
      const labor = laborRates.find(l => l.id === selectedLaborId);
      if (labor) {
        if (labor.rateType === 'FLAT') {
          setLaborCost(labor.rate);
        } else {
          // Formula: Bruto kargo (grossWeight - tareWeight) * upah buruh (labor.rate)
          const cargoWeight = Math.max(0, grossWeight - tareWeight);
          setLaborCost(Math.round(cargoWeight * labor.rate));
        }
      }
    }
  }, [selectedLaborId, grossWeight, tareWeight, laborRates]);

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
      ? getRefaksiByRule(moistureContent, cornMoistureRules, refaksiType).refaksiPercent
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
      totalPrice: (fNet * price) - laborCost,
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
    setRefaksiType('LOKAL');
    setWarehouseSection("Gudang Jagung Tengah");
    setSelectedLaborId("");
    setLaborCost(0);
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
            {editingId ? 'Formulir Ubah Catatan Penerimaan Barang Masuk' : 'Formulir Catat Barang Masuk Baru'}
          </h3>
          <form onSubmit={handleCreateRecord} className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            
            {/* Column 1: Jembatan Timbang & No Kendaraan */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">1. REFERENSI LOGISTIK</span>
              
              <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/60 flex flex-col gap-1.5 animate-fade-in text-[10px]">
                <label className="block text-neutral-600 font-bold">PILIH TIKET TIMBANG (OPSIONAL)</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => handleTicketChange(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                >
                  <option value="">-- INPUT MANUAL / TANPA TIKET --</option>
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      TIKET {t.ticketNo} ({t.policeNo}) - NET {(t.netWeight ?? 0).toLocaleString('id-ID')} KG
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-bold">NOMOR KENDARAAN (WAJIB)</label>
                <input
                  type="text"
                  placeholder="CONTOH: DD 8214 KK"
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
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 uppercase transition font-bold"
                  list="inbound-vehicles"
                />
                <datalist id="inbound-vehicles">
                  {vehicles.map(v => (
                    <option key={v.id} value={v.policeNo}>{v.driverName.toUpperCase()} &bull; {v.vehicleType.toUpperCase()} (TARA: {v.tareWeight}KG)</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-bold">NAMA DRIVER/SOPIR</label>
                <input
                  type="text"
                  placeholder="CONTOH: DAENG NABA"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 font-bold uppercase transition"
                  list="inbound-drivers"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 font-bold">LOKASI SEKTOR PENERIMAAN GUDANG</label>
                <input
                  type="text"
                  value={warehouseSection}
                  onChange={(e) => setWarehouseSection(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 transition font-bold uppercase"
                  placeholder="MISAL: GUDANG UTARA, SILO B"
                />
              </div>
            </div>

            {/* Column 2: Commodity & Weights */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">2. DETIL KOMODITAS & MASUK</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold">JENIS KOMODITAS</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 transition cursor-pointer font-bold"
                  >
                    <option value="JAGUNG">JAGUNG PIPIL 🌽</option>
                    <option value="BERAS">BERAS MOLEK 🌾</option>
                    <option value="GABAH">GABAH KERING 🍚</option>
                    <option value="LAINNYA">LAIN-LAIN 📦</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold">NAMA SUPLIER / PEMILIK</label>
                  <input
                    type="text"
                    placeholder="CONTOH: H. MUSTAMIN"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 font-bold uppercase transition"
                    list="inbound-suppliers"
                  />
                  <datalist id="inbound-suppliers">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name.toUpperCase()}>{s.address.toUpperCase()} &bull; {s.phone}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                <SmartNumberInput
                  value={grossWeight}
                  onChange={setGrossWeight}
                  label="BERAT BRUTO (GROSS)"
                  mode="weight"
                  unit="KG"
                  presets={[3000, 5000, 8000, 12000]}
                />
                <SmartNumberInput
                  value={tareWeight}
                  onChange={setTareWeight}
                  label="BERAT TARA (EMPTY)"
                  mode="weight"
                  unit="KG"
                  presets={[1000, 2000, 3500, 4200]}
                />
              </div>

              <div>
                <SmartNumberInput
                  value={bagDeductionPercent}
                  onChange={setBagDeductionPercent}
                  label="POTONGAN KARUNG (%)"
                  mode="percent"
                  unit="%"
                  presets={[1.0, 1.25, 1.5, 2.0]}
                />
              </div>
            </div>

            {/* Column 3: Moisture rate & Prices */}
            <div className="flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-3">
                <span className="font-bold text-neutral-500">3. KADAR AIR & OPERASIONAL HARGA</span>
                
                <div className="flex flex-col gap-1 w-full font-sans">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[11px] font-bold text-neutral-600 uppercase">KADAR AIR (KA) JAGUNG</span>
                    {commodity === 'JAGUNG' && (
                      <button
                        type="button"
                        onClick={() => setShowMoistureModal(true)}
                        className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold underline cursor-pointer flex items-center gap-0.5 uppercase"
                      >
                        ATURAN POTONGAN KA ℹ️
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <SmartNumberInput
                        value={moistureContent}
                        onChange={setMoistureContent}
                        mode="percent"
                        unit="%"
                        presets={[14, 15, 17, 20]}
                      />
                    </div>
                    {commodity === 'JAGUNG' && (
                      <select
                        value={refaksiType}
                        onChange={(e) => setRefaksiType(e.target.value as 'LOKAL' | 'LUAR_DAERAH')}
                        className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-2.5 rounded-xl font-bold text-xs h-[42px] outline-none transition cursor-pointer uppercase"
                      >
                        <option value="LOKAL">LOKAL</option>
                        <option value="LUAR_DAERAH">LUAR</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <label className="block text-neutral-600 mb-1 font-bold uppercase">PELAKSANA BURUH PANGGUL</label>
                    <select
                      value={selectedLaborId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedLaborId(id);
                        if (id) {
                          const labor = laborRates.find(l => l.id === id);
                          if (labor) {
                            if (labor.rateType === 'FLAT') {
                              setLaborCost(labor.rate);
                            } else {
                              // Formula requested: Bruto Kargo (grossWeight - tareWeight) * Upah Buruh Rate
                              const cargoWeight = Math.max(0, grossWeight - tareWeight);
                              setLaborCost(Math.round(cargoWeight * labor.rate));
                            }
                          }
                        } else {
                          setLaborCost(0);
                        }
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600 transition cursor-pointer h-[38px] truncate font-bold uppercase"
                    >
                      <option value="">-- PILIH JENIS KEGIATAN BURUH --</option>
                      {laborRates.map(l => (
                        <option key={l.id} value={l.id}>{l.activityName.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <SmartNumberInput
                      value={laborCost}
                      onChange={setLaborCost}
                      label="UPAH BURUH"
                      mode="currency"
                      unit="RP"
                      presets={[100000, 200000]}
                    />
                  </div>
                  <div>
                    <SmartNumberInput
                      value={price}
                      onChange={setPrice}
                      label="HARGA PEMBELIAN"
                      mode="currency"
                      unit="RP/KG"
                      presets={[4500, 5000, 5200, 5500, 6000]}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-3 py-2 rounded-lg transition uppercase"
                >
                  RESET
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer transition uppercase"
                >
                  {editingId ? 'SIMPAN PERUBAHAN' : 'SIMPAN TRANSAKSI MASUK'}
                </button>
              </div>
            </div>

            {/* HORIZONTAL COMPUTATION PREVIEW BOARD */}
            <div className="lg:col-span-3 bg-neutral-900 text-white rounded-xl p-3.5 shadow-inner border border-neutral-800 mt-2 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
              {(() => {
                const rNet = grossWeight - tareWeight;
                const bagDed = rNet * (bagDeductionPercent / 100);
                const activeRefaksiRule = commodity === 'JAGUNG'
                  ? getRefaksiByRule(moistureContent, cornMoistureRules.length > 0 ? cornMoistureRules : initialCornMoistureRules, refaksiType)
                  : { refaksiPercent: 0, description: 'Bukan Jagung' };
                const refPercentage = activeRefaksiRule.refaksiPercent;
                const refDed = rNet * (refPercentage / 100);
                const computedNet = Math.max(0, Math.round(rNet - bagDed - refDed));
                const purchaseTotal = computedNet * price;
                const subTotalFinal = purchaseTotal - laborCost;

                return (
                  <>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-300 w-full lg:w-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Netto Kotor</span>
                        <span className="font-mono font-bold text-white text-xs">{rNet.toLocaleString('id-ID')} Kg</span>
                      </div>

                      <div className="w-px h-6 bg-neutral-800 hidden lg:block" />

                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Karung ({bagDeductionPercent}%)</span>
                        <span className="font-mono text-red-400">-{Math.round(bagDed).toLocaleString('id-ID')} Kg</span>
                      </div>

                      {commodity === 'JAGUNG' && (
                        <>
                          <div className="w-px h-6 bg-neutral-800 hidden lg:block" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Potongan KA ({refPercentage}%)</span>
                            <span className="font-mono text-red-400">-{Math.round(refDed).toLocaleString('id-ID')} Kg</span>
                          </div>
                        </>
                      )}

                      <div className="w-px h-6 bg-neutral-800 hidden lg:block" />

                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Netto Bersih Akhir</span>
                        <span className="font-mono text-emerald-400 font-extrabold text-sm">{computedNet.toLocaleString('id-ID')} Kg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t border-neutral-800 pt-2 lg:border-0 lg:pt-0 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-450 uppercase tracking-wider">Total Pembelian</span>
                        <span className="font-mono text-white">Rp {purchaseTotal.toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="w-px h-6 bg-neutral-800 hidden lg:block" />

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-450 uppercase tracking-wider">Pembayaran Bersih Sopir</span>
                        <span className="font-mono text-sm font-black text-amber-300">Rp {subTotalFinal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
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
        <div className="mt-4 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-neutral-600 min-w-[1000px]">
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
                      <div>{(r.grossWeight ?? 0).toLocaleString('id-ID')} kg G</div>
                      <div className="text-[10px]">{(r.tareWeight ?? 0).toLocaleString('id-ID')} kg T</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-bold text-neutral-800 text-xs bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {r.moistureContent ? `${r.moistureContent.toFixed(1)}%` : '0.0%'}
                        </span>
                        {r.refaksiKaPercent > 0 ? (
                          <span className="text-[9px] text-red-600 font-extrabold mt-1 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                            Pot: -{r.refaksiKaPercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-600 font-bold mt-1 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            Aman (0%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-3 font-extrabold font-mono text-emerald-600">
                      {(r.netWeight ?? 0).toLocaleString('id-ID')} kg
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
                            setPrice(r.price || 0);
                            setDriverName(r.driverName || "");

                            // Find matching labor rate to set selectedLaborId
                            const cargoWeight = r.grossWeight - r.tareWeight;
                            const matchedLabor = (laborRates || []).find(l => {
                              if (l.rateType === 'FLAT' && l.rate === r.laborCost) return true;
                              if (l.rateType === 'PER_KG' && Math.round(cargoWeight * l.rate) === r.laborCost) return true;
                              return false;
                            });
                            setSelectedLaborId(matchedLabor ? matchedLabor.id : "");

                            // Guess refaksiType based on rule
                            const checkRuleLuar = getRefaksiByRule(r.moistureContent, cornMoistureRules || [], 'LUAR_DAERAH');
                            setRefaksiType(checkRuleLuar.refaksiPercent === r.refaksiKaPercent ? 'LUAR_DAERAH' : 'LOKAL');

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
              className="bg-white border border-neutral-300 rounded-xl p-4 w-full max-w-sm shadow-2xl relative"
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

              <div className="bg-neutral-50 p-3 border border-dashed border-neutral-300 rounded font-mono text-[10px] text-neutral-800 leading-tight shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-1 mb-2">
                  <div className="font-bold text-xs tracking-widest text-emerald-950">CV. BILIBILI 162</div>
                  <div className="text-[8px] opacity-70">Jalan Poros Pinrang-Polman KM. 12</div>
                  <div className="text-[8px] opacity-70">Desa Bilibili, Kec. Suppa, Kab. Pinrang</div>
                </div>

                <div className="space-y-0.5 mb-2">
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

                <div className="border-t border-neutral-200 pt-1.5 space-y-0.5">
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

                <div className="border-t border-neutral-250 pt-1.5 space-y-0.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>HARGA BELI :</span>
                    <span className="font-bold">Rp {(previewRecord.price ?? 0).toLocaleString('id-ID')}/Kg</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>HARGA BRUTO :</span>
                    <span>Rp {((previewRecord.netWeight ?? 0) * (previewRecord.price ?? 0)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>BIAYA BURUH PANGGUL :</span>
                    <span>-Rp {(previewRecord.laborCost ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-amber-800 text-[11px] border-t border-dashed border-neutral-300 mt-1 pt-1 bg-amber-50 px-1.5 py-1 rounded">
                    <span>TOTAL HARUS DIBAYAR :</span>
                    <span>Rp {(previewRecord.totalPrice ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-center text-[9px]">
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

                <div className="text-center mt-2 opacity-50 italic text-[7px]">
                  * Terimakasih atas kerjasamanya *<br/>
                  Aplikasi Timbangan GSC GST-9700 v2.0
                </div>
              </div>

              <div className="mt-3 flex gap-2">
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

      {/* MODAL ACUAN REFAKSI KADAR AIR */}
      <AnimatePresence>
        {showMoistureModal && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xl max-w-sm w-full font-sans text-xs"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-3">
                <h3 className="font-extrabold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>Aturan Potongan KA ({refaksiType})</span>
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowMoistureModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 rounded transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed mb-3">
                Tabel acuan potongan untuk Jagung Pipil ({refaksiType}). Baris dengan latar belakang <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">hijau</span> adalah rule acuan potongan aktif berdasarkan kadar air saat ini <span className="font-bold text-slate-800 font-mono">({moistureContent}%)</span>.
              </p>

              <div className="max-h-[220px] overflow-y-auto border border-neutral-200/80 rounded-lg bg-white shadow-inner">
                <table className="w-full text-[11px] text-left border-collapse select-none">
                  <thead className="bg-neutral-50 text-neutral-600 font-bold sticky top-0 border-b border-neutral-200 uppercase text-[9px]">
                    <tr>
                      <th className="py-2 px-3">Kadar Air (Min - Max)</th>
                      <th className="py-2.5 px-3 text-center">Refaksi (%)</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-sans">
                    {(() => {
                      const rulesSource = cornMoistureRules.length > 0 ? cornMoistureRules : initialCornMoistureRules;
                      const activeRules = rulesSource.filter(r => r.type === refaksiType);
                      
                      if (activeRules.length === 0) {
                        return (
                          <tr>
                            <td colSpan={3} className="text-center py-4 text-neutral-400 italic">Tidak ada data aturan refaksi.</td>
                          </tr>
                        );
                      }
                      return activeRules.map(rule => {
                        const isSelected = moistureContent >= rule.moistureMin && moistureContent <= rule.moistureMax;
                        return (
                          <tr 
                            key={rule.id} 
                            className={`transition-all duration-150 ${
                              isSelected 
                                ? 'bg-emerald-50 text-emerald-900 font-black border-y border-emerald-250' 
                                : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono">
                              {rule.moistureMin.toFixed(2)}% - {rule.moistureMax.toFixed(2)}%
                            </td>
                            <td className={`py-2 px-3 text-center font-mono font-extrabold ${isSelected ? 'text-emerald-700' : 'text-slate-850'}`}>
                              {rule.refaksiPercent.toFixed(2)}%
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                                  AKTIF
                                </span>
                              ) : (
                                <span className="text-[9px] text-neutral-400 font-medium">Sesuai</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-2.5 border-t border-gradient flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowMoistureModal(false)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold px-5 py-1.5 rounded-lg transition cursor-pointer uppercase tracking-wider"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
