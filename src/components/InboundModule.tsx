/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InboundRecord, WeighbridgeTicket } from '../types';
import { mockCornMoistureRefaksi } from '../data';
import { ArrowDownCircle, PlusCircle, Search, Calendar, Scale, Hammer, Percent, Archive } from 'lucide-react';

interface InboundModuleProps {
  records: InboundRecord[];
  tickets: WeighbridgeTicket[];
  onAddRecord: (record: InboundRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function InboundModule({
  records,
  tickets,
  onAddRecord,
  onDeleteRecord
}: InboundModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      alert("Harap lengkapi semua isian wajib!");
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

    const newRecord: InboundRecord = {
      id: `inbound-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ticketNo: tkNo,
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
      driverName
    };

    onAddRecord(newRecord);
    setShowAddForm(false);
    resetForm();
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
    setDriverName("");
  };

  // Filter
  const filteredRecords = records.filter(r => 
    r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.ticketNo && r.ticketNo.includes(searchQuery))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <ArrowDownCircle className="text-emerald-600 w-6 h-6" />
            Penerimaan Barang Masuk (1. BARANG MASUK 2026)
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
          {showAddForm ? 'Tutup Formulir' : 'Catat Barang Masuk'}
        </button>
      </div>

      {/* FORM BARANG MASUK */}
      {showAddForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 border-b border-neutral-100 pb-2">
            Formulir Catat Barang Masuk Baru
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
                      Tiket {t.ticketNo} ({t.policeNo}) - Net {t.netWeight.toLocaleString()} Kg
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
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Nama Driver/Sopir</label>
                <input
                  type="text"
                  placeholder="Contoh: Daeng Naba"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                />
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
                  <label className="block text-neutral-600 mb-1">Nama Suplier / Pemilik</label>
                  <input
                    type="text"
                    placeholder="Contoh: H. Mustamin"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Berat Bruto (Kg)</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Berat Tara (Kg)</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Potongan Karung (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bagDeductionPercent}
                    onChange={(e) => setBagDeductionPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Kadar Air (KA %)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
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
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-1 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer"
                >
                  Simpan Transaksi Masuk
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-neutral-800 text-sm">Pencarian Arsip Barang Masuk</span>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari Suplier, No. Polisi, atau Jenis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
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
                      <div>{r.grossWeight.toLocaleString()} kg G</div>
                      <div className="text-[10px]">{r.tareWeight.toLocaleString()} kg T</div>
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
                      {r.netWeight.toLocaleString()} kg
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        {r.warehouseSection}
                      </div>
                    </td>
                    <td className="text-right py-2.5 px-3 font-mono text-neutral-700">
                      Rp {r.laborCost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="text-red-400 hover:text-red-600 transition p-1 font-bold"
                        title="Hapus Catatan"
                      >
                        ✕
                      </button>
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

    </div>
  );
}
