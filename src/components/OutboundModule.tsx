/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OutboundRecord, WeighbridgeTicket } from '../types';
import { ArrowUpCircle, PlusCircle, Search, Calendar, FileText, Scale, Landmark, UserCheck } from 'lucide-react';

interface OutboundModuleProps {
  records: OutboundRecord[];
  tickets: WeighbridgeTicket[];
  onAddRecord: (record: OutboundRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function OutboundModule({
  records,
  tickets,
  onAddRecord,
  onDeleteRecord
}: OutboundModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [buyer, setBuyer] = useState("");
  const [commodity, setCommodity] = useState<'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA'>('BERAS');
  const [totalWeight, setTotalWeight] = useState(10000);
  const [loadingLaborCost, setLoadingLaborCost] = useState(400000);
  const [destination, setDestination] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState<'LOADING' | 'SHIPPED'>('SHIPPED');

  const handleTicketChange = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    const tk = tickets.find(t => t.id === ticketId);
    if (tk) {
      setVehicleNo(tk.policeNo);
      setBuyer(tk.agency); // assume buyer agency
      setCommodity(tk.goodsName === 'JAGUNG' ? 'JAGUNG' : tk.goodsName === 'GABAH' ? 'GABAH' : 'BERAS');
      setTotalWeight(tk.netWeight);
    }
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo.trim() || !buyer.trim() || !invoiceNo.trim()) {
      alert("Harap lengkapi No. Kendaraan, Pembeli, dan No. Invoice!");
      return;
    }

    const newRecord: OutboundRecord = {
      id: `outbound-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ticketNo: tickets.find(t => t.id === selectedTicketId)?.ticketNo,
      vehicleNo: vehicleNo.toUpperCase(),
      buyer: buyer.toUpperCase(),
      commodity,
      totalWeight,
      loadingLaborCost,
      destination,
      invoiceNo: invoiceNo.toUpperCase(),
      status
    };

    onAddRecord(newRecord);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTicketId("");
    setVehicleNo("");
    setBuyer("");
    setCommodity("BERAS");
    setTotalWeight(10000);
    setLoadingLaborCost(450000);
    setDestination("");
    setInvoiceNo("");
    setStatus("SHIPPED");
  };

  const filteredRecords = records.filter(r =>
    r.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <ArrowUpCircle className="text-blue-600 w-6 h-6" />
            Pengiriman Barang Keluar (12. BARANG KELUAR)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Mengelola logistik pengiriman komoditas keluar, pencatatan invoice penjualan beras/jagung, dan biaya upah buruh muat.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? 'Tutup Formulir' : 'Catat Barang Keluar'}
        </button>
      </div>

      {/* ADD COMPONENT LOGS */}
      {showAddForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 border-b border-neutral-100 pb-2">
            Formulir Catat Pengiriman Barang Baru
          </h3>
          <form onSubmit={handleCreateRecord} className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            
            {/* Column 1: Ticket + Vehicle */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">1. REFERENSI LOGISTIK</span>
              
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex flex-col gap-2">
                <label className="block text-neutral-600">Ambil dari Jembatan Timbang (Opsional)</label>
                <select
                  value={selectedTicketId}
                  onChange={(e) => handleTicketChange(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Input Manual --</option>
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>
                      Tiket {t.ticketNo} ({t.policeNo}) - Net {t.netWeight.toLocaleString()} Kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">No. Kendaraan Tronton / Truk</label>
                <input
                  type="text"
                  placeholder="Misal: DD 8021 KK"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">No. Invoice Penjualan</label>
                <input
                  type="text"
                  placeholder="Contoh: INV-162/2026-042"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Column 2: Commodity & Weights */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-neutral-500">2. DETIL MUATAN</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Komoditas</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="BERAS">BERAS MOLEK 🌾</option>
                    <option value="JAGUNG">JAGUNG PIPIL 🌽</option>
                    <option value="GABAH">GABAH SELEB 🍚</option>
                    <option value="LAINNYA">LAIN-LAIN 📦</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Nama Pembeli (Buyer)</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Sinar Indah"
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Total Berat Cargo Muat (Kg)</label>
                <input
                  type="number"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Lokasi Tujuan / Pelabuhan</label>
                <input
                  type="text"
                  placeholder="Contoh: KIMA Makassar atau Pelabuhan Luwu"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Column 3: Status & Expense */}
            <div className="flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-3">
                <span className="font-bold text-neutral-500">3. BIAYA OPERASIONAL & STATUS</span>
                
                <div>
                  <label className="block text-neutral-600 mb-1">Upah Buruh Pemuat (Muat Karung) (Rp)</label>
                  <input
                    type="number"
                    value={loadingLaborCost}
                    onChange={(e) => setLoadingLaborCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1">Status Keberangkatan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  >
                    <option value="SHIPPED">SUDAH BRANGKAT (SHIPPED) 🚚</option>
                    <option value="LOADING">SEDANG DIMUAT (LOADING) ⏳</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-1 border-t border-neutral-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg cursor-pointer animate-pulse"
                >
                  Simpan Transaksi Keluar
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* FILTER SEARCH OR VIEW TABLE */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <span className="font-bold text-neutral-800 text-sm">Pencarian Arsip Barang Keluar</span>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari Pembeli, No. Invoice, atau Kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">No. Invoice / SJ</th>
                <th className="py-2.5 px-3">Sopir / No Polisi</th>
                <th className="py-2.5 px-3">Pembeli (Buyer)</th>
                <th className="py-2.5 px-3">Komoditas</th>
                <th className="text-right py-2.5 px-3">Berat Bersih (Netto)</th>
                <th className="py-2.5 px-3">Tujuan Pengiriman</th>
                <th className="text-right py-2.5 px-3">Upah Buruh Muat</th>
                <th className="text-center py-2.5 px-3">Status</th>
                <th className="text-center py-2.5 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 text-neutral-500 font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {r.date}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 font-bold text-neutral-800 font-mono">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {r.invoiceNo}
                    </div>
                    {r.ticketNo && (
                      <div className="text-[10px] text-neutral-400">Timbangan: #{r.ticketNo}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-800">{r.vehicleNo}</td>
                  <td className="py-2.5 px-3 uppercase font-medium text-neutral-800">{r.buyer}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.commodity === 'BERAS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      r.commodity === 'JAGUNG' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-blue-100 text-blue-800 font-bold'
                    }`}>
                      {r.commodity}
                    </span>
                  </td>
                  <td className="text-right py-2.5 px-3 font-bold font-mono text-emerald-600">
                    {r.totalWeight.toLocaleString()} kg
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 italic">
                    <div className="flex items-center gap-1">
                      <Landmark className="w-3 h-3 text-neutral-400" />
                      {r.destination}
                    </div>
                  </td>
                  <td className="text-right py-2.5 px-3 font-mono text-neutral-700">
                    Rp {r.loadingLaborCost.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'SHIPPED' ? 'bg-green-100 text-green-700' : 'bg-[#e0efff] text-blue-700'
                    }`}>
                      {r.status === 'SHIPPED' ? 'SHIPPED 🚚' : 'LOADING ⏳'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="text-red-400 hover:text-red-600 transition font-bold"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-neutral-400 italic">
                    Belum ada rekapan barang keluar.
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
