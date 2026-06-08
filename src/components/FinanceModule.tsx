/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DebtRecord, FinancialRecord, EmployeeRecord } from '../types';
import { Landmark, PlusCircle, Search, Calendar, ChevronRight, Users, Scale, CreditCard, DollarSign } from 'lucide-react';

interface FinanceModuleProps {
  debts: DebtRecord[];
  finances: FinancialRecord[];
  employees: EmployeeRecord[];
  onAddDebt: (record: DebtRecord) => void;
  onPayDebt: (id: string, amount: number) => void;
  onAddFinance: (record: FinancialRecord) => void;
}

export default function FinanceModule({
  debts,
  finances,
  employees,
  onAddDebt,
  onPayDebt,
  onAddFinance
}: FinanceModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'UTANG' | 'MAKELAR' | 'MUTASI'>('UTANG');
  
  // Payment dynamic states
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(5000000);

  // Form states - Debt
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [debtDesc, setDebtDesc] = useState("");
  const [debtAmount, setDebtAmount] = useState(15000000);

  // Form states - Finance/Mutasi
  const [showFinForm, setShowFinForm] = useState(false);
  const [finType, setFinType] = useState<'DEBIT' | 'KREDIT'>('KREDIT');
  const [finCategory, setFinCategory] = useState<any>('OPERASIONAL');
  const [finDesc, setFinDesc] = useState("");
  const [finParty, setFinParty] = useState("");
  const [finAmount, setFinAmount] = useState(500000);
  const [finBank, setFinBank] = useState("Kas Gudang Tunai");

  // Broker Commission math states
  const [selectedBrokerId, setSelectedBrokerId] = useState(employees.find(e => e.role === 'MAKELAR')?.id || "");
  const [brokerCargoWeight, setBrokerCargoWeight] = useState(9880);

  const activeBroker = employees.find(e => e.id === selectedBrokerId);
  const brokerRate = activeBroker?.ratePerKg || 50;
  const calculatedCommission = brokerCargoWeight * brokerRate;

  // Handles adding utility expense
  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finDesc.trim()) {
      alert("Harap tulis deskripsi mutasi!");
      return;
    }
    const newFin: FinancialRecord = {
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: finType,
      category: finCategory,
      description: finDesc,
      partyName: finParty,
      amount: finAmount,
      bankAccount: finBank
    };
    onAddFinance(newFin);
    setShowFinForm(false);
    setFinDesc("");
    setFinParty("");
  };

  // Handles recording broker payment as expense
  const handlePayBrokerCommission = () => {
    if (!activeBroker) return;
    const desc = `Pembayaran Komisi Makelar ${activeBroker.name} atas berat jagung ${brokerCargoWeight.toLocaleString()} Kg (Tarif Rp ${brokerRate}/Kg)`;
    const newFin: FinancialRecord = {
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'KREDIT',
      category: 'MAKELAR',
      description: desc,
      partyName: activeBroker.name,
      amount: calculatedCommission,
      bankAccount: 'Kas Gudang Tunai'
    };
    onAddFinance(newFin);
    alert(`Komisi Makelar ${activeBroker.name} sebesar Rp ${calculatedCommission.toLocaleString()} berhasil dicatat dalam Buku Mutasi!`);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !debtDesc.trim()) {
      alert("Harap lengkapi nama suplier & perincian!");
      return;
    }
    const newDebt: DebtRecord = {
      id: `debt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      supplierName: supplierName.toUpperCase(),
      description: debtDesc,
      totalDebt: debtAmount,
      paidAmount: 0,
      remainingBalance: debtAmount,
      status: 'BELUM_LUNAS'
    };
    onAddDebt(newDebt);
    setShowDebtForm(false);
    setSupplierName("");
    setDebtDesc("");
  };

  const triggerDebtPaymentSubmit = (debtId: string) => {
    if (payAmount <= 0) return;
    onPayDebt(debtId, payAmount);
    setPayingDebtId(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Financial sub navigation matching folders */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveSubTab('UTANG')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'UTANG' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 2. UTANG 2026
        </button>
        <button
          onClick={() => setActiveSubTab('MAKELAR')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MAKELAR' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 9. BURUH & MAKELAR
        </button>
        <button
          onClick={() => setActiveSubTab('MUTASI')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MUTASI' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 7. MUTASI REKENING 162
        </button>
      </div>

      {/* TAB 1: UTANG 2026 */}
      {activeSubTab === 'UTANG' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                <CreditCard className="text-emerald-600 w-4.5 h-4.5" />
                Catatan Utang Aliansi Tani (2. UTANG 2026)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Catatan utang US Bilibili kepada suplier luar / petani pengirim biji jagung dan beras yang belum lunas dibayar.
              </p>
            </div>
            
            <button
              onClick={() => setShowDebtForm(!showDebtForm)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showDebtForm ? 'Sembunyikan form' : 'Catat Utang Baru'}
            </button>
          </div>

          {/* Form write debt */}
          {showDebtForm && (
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5">
              <h4 className="font-bold text-neutral-800 text-xs mb-3">Tambah Catatan Utang Baru</h4>
              <form onSubmit={handleCreateDebt} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1">Nama Petani / Suplier</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Contoh: H. Sudirman - Sidrap"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Uraian / Perincian</label>
                  <input
                    type="text"
                    value={debtDesc}
                    onChange={(e) => setDebtDesc(e.target.value)}
                    placeholder="Contoh: Utang Jagung Pipit KA 16.8% (Ticket 021230)"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Jumlah Nilai Utang (Rp)</label>
                  <input
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Simpan Buku Utang
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table display debts */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal Terbit</th>
                    <th className="py-2.5 px-3">Suplier Pemilik</th>
                    <th className="py-2.5 px-3">Rincian Transaksi</th>
                    <th className="text-right py-2.5 px-3">Total Utang (Rp)</th>
                    <th className="text-right py-2.5 px-3">Jumlah Dibayar (Rp)</th>
                    <th className="text-right py-2.5 px-3">Sisa Utang (Sald)</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Status</th>
                    <th className="text-center py-2.5 px-3">Cicil Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {debts.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {d.date}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-neutral-800">{d.supplierName}</td>
                      <td className="py-2.5 px-3 text-neutral-600">{d.description}</td>
                      <td className="text-right py-2.5 px-3 font-bold font-mono">Rp {d.totalDebt.toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 text-emerald-600 font-bold font-mono">Rp {d.paidAmount.toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 font-black font-mono text-red-600">Rp {d.remainingBalance.toLocaleString('id-ID')}</td>
                      <td className="text-center py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          d.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                        }`}>
                          {d.status === 'LUNAS' ? 'LUNAS ✅' : 'BELUM LUNAS'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {d.status === 'BELUM_LUNAS' ? (
                          payingDebtId === d.id ? (
                            <div className="flex items-center gap-1.5 justify-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                value={payAmount}
                                onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                                className="bg-neutral-50 border border-neutral-300 text-red-600 font-bold p-1 rounded font-mono text-xs w-28 text-center"
                              />
                              <button
                                onClick={() => triggerDebtPaymentSubmit(d.id)}
                                className="bg-emerald-600 text-white font-bold p-1 rounded hover:bg-emerald-500 text-[10px]"
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setPayingDebtId(d.id); setPayAmount(d.remainingBalance); }}
                              className="text-xs bg-[#e4f0fd] hover:bg-[#cbe3fd] text-blue-700 font-bold px-2 py-1 rounded transition"
                            >
                              Bayar Cicilan
                            </button>
                          )
                        ) : (
                          <span className="text-green-500 text-xs font-semibold">Tuntas</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BURUH & MAKELAR 2026 */}
      {activeSubTab === 'MAKELAR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel: Commission Calculator */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2 mb-3">
              <Users className="text-emerald-600 w-4.5 h-4.5" />
              Kalkulator Komisi Makelar & Buruh Luwu
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Hitung komisi agen makelar pembawa pasokan tani beralaskan total berat netto timbangan dikali tarif operasional.
            </p>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1">Pilih Makelar / Agen Aktif</label>
                <select
                  value={selectedBrokerId}
                  onChange={(e) => setSelectedBrokerId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 focus:bg-white focus:outline-none"
                >
                  {employees.filter(e => e.role === 'MAKELAR').map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} (Makelar Jagung - Tarif Rp {e.ratePerKg}/Kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1">Total Hasil Berat Netto Timbangan (Kg)</label>
                <input
                  type="number"
                  value={brokerCargoWeight}
                  onChange={(e) => setBrokerCargoWeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 font-mono text-sm font-semibold"
                />
              </div>

              {/* Math outcome display */}
              <div className="bg-neutral-50 border border-neutral-150 rounded-lg p-4 font-mono">
                <div className="flex justify-between items-center py-1">
                  <span>Nama Makelar:</span>
                  <span className="font-bold text-neutral-800">{activeBroker?.name || 'Belum Terpilih'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Volume Jagung Netto:</span>
                  <span className="font-bold">{brokerCargoWeight.toLocaleString()} Kg</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Fee Standard US Bilibili:</span>
                  <span className="font-bold text-neutral-600">Rp {brokerRate} / Kg</span>
                </div>
                <div className="border-t border-neutral-200 my-2 pt-2 flex justify-between items-center text-sm font-bold bg-amber-50 p-2 text-amber-950 rounded">
                  <span>TOTAL KOMISI MAKELAR:</span>
                  <span className="text-emerald-700 text-base font-black">Rp {calculatedCommission.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={handlePayBrokerCommission}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer shadow text-center"
              >
                Bayar & Catat Di Buku Kas Pas (Mutasi)
              </button>
            </div>
          </div>

          {/* Right Panel: Employee List registry */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2 mb-3">
              <Users className="text-indigo-600 w-4.5 h-4.5" />
              Petugas Gudang & Makelar Terdaftar (9. BURUH & KARYAWAN)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">Nama Petugas</th>
                    <th className="py-2 px-3">Golongan / Jabatan</th>
                    <th className="py-2 px-3">Kontak Hubungi</th>
                    <th className="text-right py-2 px-3">Tarif Standard Fee Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-600">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-neutral-50">
                      <td className="py-2 px-3 font-bold text-neutral-800">{e.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          e.role === 'MAKELAR' ? 'bg-amber-100 text-amber-800' :
                          e.role === 'BURUH' ? 'bg-orange-100 text-orange-800' :
                          'bg-indigo-100 text-indigo-805'
                        }`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-neutral-500">{e.phone || '- -'}</td>
                      <td className="text-right py-2 px-3 font-mono font-medium text-emerald-600">
                        {e.ratePerKg ? `Rp ${e.ratePerKg} / Kg` : 'Gaji Mingguan Staff'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-neutral-400 italic text-center mt-5 bg-neutral-50 p-2 rounded">
              💡 Upah buruh bongkar muat dihitung per truk masuk & keluar, sementara gaji tim poles / kipas tuntas per mingguan.
            </p>
          </div>

        </div>
      )}

      {/* TAB 3: MUTASI REKENING 2026 */}
      {activeSubTab === 'MUTASI' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                <Landmark className="text-emerald-605 w-5 h-5" />
                Mutasi Rekening Bank & Kas Tunai (7. MUTASI REKENING 2026)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Aliran dana keluar-masuk kas gudang US Bilibili 162 untuk kelancaran pengerjaan palka biji dan beras.
              </p>
            </div>

            <button
              onClick={() => setShowFinForm(!showFinForm)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showFinForm ? 'Sembunyikan Form' : 'Catat Operasional Operatif'}
            </button>
          </div>

          {/* Form input mutasi */}
          {showFinForm && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-neutral-800 text-xs mb-3">Catat Finansial Mutasi Kas</h4>
              <form onSubmit={handleCreateFinance} className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
                
                <div>
                  <label className="block text-neutral-600 mb-1">Arah Kas</label>
                  <select
                    value={finType}
                    onChange={(e) => setFinType(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white"
                  >
                    <option value="DEBIT">MASUK / DEBIT (+)💰</option>
                    <option value="KREDIT">PENGELUARAN / KREDIT (-)💸</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1">Golongan Kategori</label>
                  <select
                    value={finCategory}
                    onChange={(e) => setFinCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white"
                  >
                    <option value="OPERASIONAL">OPERASIONAL TIAP HARI</option>
                    <option value="GAJI_KARYAWAN">GAJI KARYAWAN TETAP</option>
                    <option value="BURUH">UPAH BURUH PANGGUL</option>
                    <option value="MAKELAR">KOMISI MAKELAR JUAL</option>
                    <option value="TIMBANGAN">ONGKOS JASA TIMBANGAN</option>
                    <option value="POLES_KIPAS">PENERIMAAN JASA MILLING</option>
                    <option value="LAINNYA">PENGELUARAN LAIN-LAIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1">Deskripsi Detail</label>
                  <input
                    type="text"
                    value={finDesc}
                    onChange={(e) => setFinDesc(e.target.value)}
                    placeholder="Contoh: Beli BBM solar diesel mesin blower poles"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Tujuan Rek. Bank / Kas</label>
                  <select
                    value={finBank}
                    onChange={(e) => setFinBank(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white"
                  >
                    <option value="Kas Gudang Tunai">Kas Gudang Tunai (Laci Pas)</option>
                    <option value="Mandiri Bilibili 162">Mandiri Bilibili 162 (028-xx)</option>
                    <option value="BRI Rekening Usaha">BRI Kantor Pos Gilingan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1">Jumlah Nilai (Rp)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={finAmount}
                      onChange={(e) => setFinAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 rounded-lg cursor-pointer"
                    >
                      SIMPAN
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* Ledger display table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal Catat</th>
                    <th className="py-2.5 px-3">Golk Kategori</th>
                    <th className="py-2.5 px-3">Uraian Kas Mutasi</th>
                    <th className="py-2.5 px-3">Sasaran Pihak Terlibat</th>
                    <th className="py-2.5 px-3">Rekening Pembayaran</th>
                    <th className="text-right py-2.5 px-3">Pemasukan (+) (De)</th>
                    <th className="text-right py-2.5 px-3">Pengeluaran (-) (Kr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {finances.map((f) => {
                    const isDebit = f.type === 'DEBIT';
                    return (
                      <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px] whitespace-nowrap">{f.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            {f.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-800">{f.description}</td>
                        <td className="py-2.5 px-3 text-neutral-500 italic">{f.partyName || '-'}</td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-700">{f.bankAccount}</td>
                        
                        <td className="text-right py-2.5 px-3 font-mono font-bold text-green-600">
                          {isDebit ? `+Rp ${f.amount.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-mono font-bold text-red-600">
                          {!isDebit ? `-Rp ${f.amount.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
