/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { Wind, Trash, User, Search, Play, Plus, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServicesModuleProps {
  records: ServiceRecord[];
  onAddRecord: (record: ServiceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function ServicesModule({
  records,
  onAddRecord,
  onDeleteRecord
}: ServicesModuleProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState<'POLES' | 'KIPAS' | 'POLES & KIPAS'>('POLES & KIPAS');
  const [commodity, setCommodity] = useState("Beras Medium B+");
  const [weight, setWeight] = useState(10000);
  const [ratePerKg, setRatePerKg] = useState(150); // standard rate is Rp 150 per kg
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PAID'>('PAID');
  const [operatorName, setOperatorName] = useState("Wahyu & Tim");

  // Dynamically set standard rate when service moves
  const handleServiceTypeChange = (type: 'POLES' | 'KIPAS' | 'POLES & KIPAS') => {
    setServiceType(type);
    if (type === 'POLES & KIPAS') {
      setRatePerKg(150);
    } else if (type === 'POLES') {
      setRatePerKg(100);
    } else {
      setRatePerKg(80); // kipas saja
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !commodity.trim()) {
      alert("Harap masukkan nama pelanggan!");
      return;
    }

    const newRecord: ServiceRecord = {
      id: `service-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.toUpperCase(),
      serviceType,
      commodity,
      weight,
      ratePerKg,
      totalFee: weight * ratePerKg,
      paymentStatus,
      operatorName
    };

    onAddRecord(newRecord);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomerName("");
    setServiceType("POLES & KIPAS");
    setCommodity("Beras Medium B+");
    setWeight(10000);
    setRatePerKg(150);
    setPaymentStatus("PAID");
    setOperatorName("Wahyu & Tim");
  };

  const filteredServices = records.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
            <Wind className="text-blue-500 w-6 h-6 animate-pulse" />
            Layanan Jasa Poles & Kipas (3. JASA POLES & KIPAS 2026)
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
          {showForm ? 'Sembunyikan Form' : 'Catat Jasa Pemrosesan'}
        </button>
      </div>

      {/* SERVICE DRAFT FORM */}
      {showForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 border-b border-neutral-100 pb-2">
            Formulir Jasa Poles & Kipas Baru
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
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-sky-500 font-semibold"
                />
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
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-sky-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 mb-1">Tarif (Rp per Kg)</label>
                  <input
                    type="number"
                    value={ratePerKg}
                    onChange={(e) => setRatePerKg(parseInt(e.target.value) || 0)}
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
                />
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
                  Simpan Jasa Poles
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <span className="font-bold text-neutral-800 text-sm">Pencarian Arsip Poles & Kipas</span>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari Pelanggan, atau Jenis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
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
                  <td className="text-right py-2.5 px-3 font-bold font-mono">{s.weight.toLocaleString('id-ID')} Kg</td>
                  <td className="text-right py-2.5 px-3 font-mono text-neutral-500">Rp {s.ratePerKg}</td>
                  <td className="text-right py-2.5 px-3 font-extrabold font-mono text-blue-600 bg-sky-50/20">
                    Rp {s.totalFee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 italic text-[11px]">{s.operatorName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.paymentStatus === 'PAID' ? 'LUNAS (PAID)' : 'BELUM BAYAR'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onDeleteRecord(s.id)}
                      className="text-neutral-400 hover:text-red-500 transition"
                      title="Hapus"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
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

    </div>
  );
}
