/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DebtRecord, FinancialRecord, EmployeeRecord, BankRecord, FinanceCategoryRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Landmark, PlusCircle, Search, Calendar, ChevronRight, Users, Scale, CreditCard, DollarSign, Download, Printer, Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { exportToCSV, printPDFReport } from '../utils/exportHelper';
import { formatNumberInput, parseNumberInput } from '../utils/format';
import SmartNumberInput from './SmartNumberInput';

interface FinanceModuleProps {
  debts: DebtRecord[];
  finances: FinancialRecord[];
  employees: EmployeeRecord[];
  banks?: BankRecord[];
  categories?: FinanceCategoryRecord[];
  onAddDebt: (record: DebtRecord) => void;
  onUpdateDebt: (record: DebtRecord) => void;
  onDeleteDebt: (id: string) => void;
  onPayDebt: (id: string, amount: number) => void;
  onAddFinance: (record: FinancialRecord) => void;
  onUpdateFinance: (record: FinancialRecord) => void;
  onDeleteFinance: (id: string) => void;
}

export default function FinanceModule({
  debts,
  finances,
  employees,
  banks = [],
  categories = [],
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onPayDebt,
  onAddFinance,
  onUpdateFinance,
  onDeleteFinance
}: FinanceModuleProps) {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'UTANG' | 'MAKELAR' | 'MUTASI'>('UTANG');
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingFinId, setEditingFinId] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'DELETE' | 'EDIT' | 'PAY';
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

  // --- EXPORT & PRINT HANDLERS ---
  const handleExportDebtExcel = () => {
    const headers = [
      'Tanggal Terbit', 'Supplier', 'Rincian Transaksi', 'Total Utang (Rp)', 'Jumlah Dibayar (Rp)', 'Sisa Sisa Saldo (Rp)', 'Status'
    ];
    const rows = debts.map(d => [
      d.date,
      d.supplierName,
      d.description,
      d.totalDebt.toString(),
      d.paidAmount.toString(),
      d.remainingBalance.toString(),
      d.status
    ]);
    exportToCSV(headers, rows, 'Buku_Utang_Supplier_US162');
  };

  const handlePrintDebtPDF = () => {
    const headers = [
      'Tanggal Terbit', 'Nama Supplier', 'Rincian Transaksi', 'Total Utang', 'Total Terbayar', 'Sisa Saldo', 'Status'
    ];
    const rows = debts.map(d => [
      d.date,
      d.supplierName,
      d.description,
      `Rp ${d.totalDebt.toLocaleString('id-ID')}`,
      `Rp ${d.paidAmount.toLocaleString('id-ID')}`,
      `Rp ${d.remainingBalance.toLocaleString('id-ID')}`,
      d.status === 'LUNAS' ? 'LUNAS' : 'SISA UTANG'
    ]);
    const totalDebt = debts.reduce((sum, d) => sum + d.totalDebt, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalRemaining = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
    const summaries = [
      { label: 'Total Transaksi Utang', value: `${debts.length} Pihak` },
      { label: 'Total Utang Kumulatif', value: `Rp ${totalDebt.toLocaleString('id-ID')}` },
      { label: 'Total Rekening Terbayar', value: `Rp ${totalPaid.toLocaleString('id-ID')}` },
      { label: 'Sisa Saldo Terutang', value: `Rp ${totalRemaining.toLocaleString('id-ID')}` }
    ];
    printPDFReport('Laporan Buku Utang Aliansi Tani', headers, rows, summaries);
  };

  const handleExportFinanceExcel = () => {
    const headers = [
      'Tanggal Catat', 'Kategori', 'Uraian Mutasi', 'Pihak Mitra', 'Saluran Rekening', 'Debit (Rp)', 'Kredit (Rp)'
    ];
    const rows = finances.map(f => [
      f.date,
      f.category,
      f.description,
      f.partyName || '',
      f.bankAccount,
      f.type === 'DEBIT' ? f.amount.toString() : '0',
      f.type === 'KREDIT' ? f.amount.toString() : '0'
    ]);
    exportToCSV(headers, rows, 'Laporan_Mutasi_Kas_Gudang');
  };

  const handlePrintFinancePDF = () => {
    const headers = [
      'Tanggal', 'Kategori', 'Uraian Mutasi', 'Saluran Rekening', 'Masuk (Debit)', 'Keluar (Kredit)'
    ];
    const rows = finances.map(f => [
      f.date,
      f.category,
      f.description,
      f.bankAccount,
      f.type === 'DEBIT' ? `Rp ${f.amount.toLocaleString('id-ID')}` : '-',
      f.type === 'KREDIT' ? `Rp ${f.amount.toLocaleString('id-ID')}` : '-'
    ]);
    const totalDebit = finances.filter(f => f.type === 'DEBIT').reduce((sum, f) => sum + f.amount, 0);
    const totalKredit = finances.filter(f => f.type === 'KREDIT').reduce((sum, f) => sum + f.amount, 0);
    const summaries = [
      { label: 'Total Transaksi Mutasi', value: `${finances.length} Alur` },
      { label: 'Total Dana Masuk (Debit)', value: `Rp ${totalDebit.toLocaleString('id-ID')}` },
      { label: 'Total Dana Keluar (Kredit)', value: `Rp ${totalKredit.toLocaleString('id-ID')}` },
      { label: 'Selisih Net Saldo Bersih', value: `Rp ${(totalDebit - totalKredit).toLocaleString('id-ID')}` }
    ];
    printPDFReport('Buku Mutasi Kas & Saluran Rekening', headers, rows, summaries);
  };
  
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
      (window as any).__showToast?.("Gagal: Harap tulis deskripsi mutasi!", "error");
      return;
    }
    const newFin: FinancialRecord = {
      id: `fin-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type: finType,
      category: finCategory,
      description: finDesc,
      partyName: finParty,
      amount: finAmount,
      bankAccount: finBank
    };

    const executeAddFinance = () => {
      onAddFinance(newFin);
      setShowFinForm(false);
      setFinDesc("");
      setFinParty("");
    };

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Tambah Transaksi Mutasi",
      message: `Apakah Anda yakin ingin menambahkan transaksi mutasi ${finType === 'DEBIT' ? 'Pemasukan (Debit)' : 'Pengeluaran (Kredit)'} sebesar Rp ${finAmount.toLocaleString('id-ID')} untuk '${finDesc}'?`,
      type: 'ADD',
      onConfirm: () => {
        executeAddFinance();
        closeConfirm();
      }
    });
  };

  // --- HANDLERS ---
  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !debtDesc.trim()) {
      (window as any).__showToast?.("Gagal: Harap lengkapi nama suplier & perincian utang!", "error");
      return;
    }

    const existing = debts.find(d => d.id === editingDebtId);
    const newDebt: DebtRecord = {
      id: editingDebtId || `debt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: existing ? existing.date : new Date().toISOString().split('T')[0],
      supplierName: supplierName.toUpperCase(),
      description: debtDesc,
      totalDebt: debtAmount,
      paidAmount: existing ? existing.paidAmount : 0,
      remainingBalance: existing ? (debtAmount - existing.paidAmount) : debtAmount,
      status: existing ? (debtAmount - existing.paidAmount <= 0 ? 'LUNAS' : 'BELUM_LUNAS') : 'BELUM_LUNAS'
    };

    const executeSave = () => {
      if (editingDebtId) {
        onUpdateDebt(newDebt);
      } else {
        onAddDebt(newDebt);
      }
      setShowDebtForm(false);
      setSupplierName("");
      setDebtDesc("");
      setEditingDebtId(null);
    };

    setConfirmModal({
      isOpen: true,
      title: editingDebtId ? "Konfirmasi Ubah Utang" : "Konfirmasi Pencatatan Utang",
      message: editingDebtId
        ? `Apakah Anda yakin ingin memperbarui catatan utang kepada ${supplierName.toUpperCase()}?`
        : `Apakah Anda yakin ingin mencatatkan kewajiban utang baru kepada supplier ${supplierName.toUpperCase()} sebesar Rp ${debtAmount.toLocaleString('id-ID')}?`,
      type: editingDebtId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  const handleSaveFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finDesc.trim()) {
      (window as any).__showToast?.("Gagal: Harap tulis deskripsi mutasi!", "error");
      return;
    }
    const newFin: FinancialRecord = {
      id: editingFinId || `fin-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: finances.find(f => f.id === editingFinId)?.date || new Date().toISOString().split('T')[0],
      type: finType,
      category: finCategory,
      description: finDesc,
      partyName: finParty,
      amount: finAmount,
      bankAccount: finBank
    };

    const executeSave = () => {
      if (editingFinId) {
        onUpdateFinance(newFin);
      } else {
        onAddFinance(newFin);
      }
      setShowFinForm(false);
      setFinDesc("");
      setFinParty("");
      setEditingFinId(null);
    };

    setConfirmModal({
      isOpen: true,
      title: editingFinId ? "Konfirmasi Ubah Mutasi" : "Konfirmasi Tambah Transaksi Mutasi",
      message: editingFinId
        ? `Apakah Anda yakin ingin memperbarui catatan mutasi transaksi '${finDesc}'?`
        : `Apakah Anda yakin ingin menambahkan transaksi mutasi ${finType === 'DEBIT' ? 'Pemasukan (Debit)' : 'Pengeluaran (Kredit)'} sebesar Rp ${finAmount.toLocaleString('id-ID')} untuk '${finDesc}'?`,
      type: editingFinId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        executeSave();
        closeConfirm();
      }
    });
  };

  // Handles recording broker payment as expense
  const handlePayBrokerCommission = () => {
    if (!activeBroker) return;
    const desc = `Pembayaran Komisi Makelar ${activeBroker.name} atas berat jagung ${brokerCargoWeight.toLocaleString('id-ID')} Kg (Tarif Rp ${brokerRate}/Kg)`;
    const newFin: FinancialRecord = {
      id: `fin-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'KREDIT',
      category: 'MAKELAR',
      description: desc,
      partyName: activeBroker.name,
      amount: calculatedCommission,
      bankAccount: 'Kas Gudang Tunai'
    };

    const executePayBroker = () => {
      onAddFinance(newFin);
      (window as any).__showToast?.(`Komisi Makelar ${activeBroker.name} sebesar Rp ${calculatedCommission.toLocaleString('id-ID')} berhasil dicatat dalam Buku Mutasi!`, "success");
    };

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Bayar Komisi Makelar",
      message: `Apakah Anda yakin ingin membayar komisi makelar untuk ${activeBroker.name} sebesar Rp ${calculatedCommission.toLocaleString('id-ID')}?`,
      type: 'PAY',
      onConfirm: () => {
        executePayBroker();
        closeConfirm();
      }
    });
  };

  const triggerDebtPaymentSubmit = (debtId: string) => {
    if (payAmount <= 0) return;
    const debtItem = debts.find(d => d.id === debtId);
    const supplier = debtItem ? debtItem.supplierName : '';

    const executePayDebt = () => {
      onPayDebt(debtId, payAmount);
      setPayingDebtId(null);
    };

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Cicilan Utang",
      message: `Apakah Anda yakin ingin melakukan pembayaran cicilan utang kepada ${supplier} sebesar Rp ${payAmount.toLocaleString('id-ID')}?`,
      type: 'PAY',
      onConfirm: () => {
        executePayDebt();
        closeConfirm();
      }
    });
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
          📂 {t.financeTitle.split('&')[0].trim()}
        </button>
        <button
          onClick={() => setActiveSubTab('MAKELAR')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MAKELAR' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 {t.brokerEmployees || 'BURUH & MAKELAR'}
        </button>
        <button
          onClick={() => setActiveSubTab('MUTASI')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MUTASI' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 {t.cashMutation || 'MUTASI KAS'}
        </button>
      </div>

      {/* TAB 1: UTANG */}
      {activeSubTab === 'UTANG' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                <CreditCard className="text-emerald-600 w-4.5 h-4.5" />
                {t.debtsArchivesTitle}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.debtsSubTitle}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportDebtExcel}
                title={t.exportExcel}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> {t.exportExcel}
              </button>
              <button
                onClick={handlePrintDebtPDF}
                title={t.printReportsPDF}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> {t.printReportsPDF}
              </button>
              <button
                onClick={() => setShowDebtForm(!showDebtForm)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showDebtForm ? t.closeFormLabel : t.recordNewDebtLabel}
              </button>
            </div>
          </div>

          {/* Form write debt */}
          {showDebtForm && (
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5">
              <h4 className="font-bold text-neutral-800 text-xs mb-3">Tambah Catatan Utang Baru</h4>
              <form onSubmit={handleSaveDebt} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1">Nama Petani / Suplier</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Contoh: H. Wawan - Sidrap"
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
                  <SmartNumberInput
                    value={debtAmount}
                    onChange={setDebtAmount}
                    label="Jumlah Nilai Utang"
                    mode="currency"
                    unit="Rp"
                    presets={[1000000, 5000000, 10000000, 25000000]}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer"
                  >
                    {editingDebtId ? 'Simpan Perubahan' : 'Simpan Buku Utang'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table display debts */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-neutral-600 min-w-[900px]">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal Terbit</th>
                    <th className="py-2.5 px-3">Suplier Pemilik</th>
                    <th className="py-2.5 px-3">Rincian Transaksi</th>
                    <th className="text-right py-2.5 px-3">Total Utang (Rp)</th>
                    <th className="text-right py-2.5 px-3">Jumlah Dibayar (Rp)</th>
                    <th className="text-right py-2.5 px-3">Sisa Utang (Sald)</th>
                    <th className="text-center py-2.5 px-3 font-semibold">Status</th>
                    <th className="text-center py-2.5 px-3">Cicil Bayar / Aksi</th>
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
                      <td className="text-right py-2.5 px-3 font-bold font-mono">Rp {(d.totalDebt ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 text-emerald-600 font-bold font-mono">Rp {(d.paidAmount ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 font-black font-mono text-red-600">Rp {(d.remainingBalance ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-center py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          d.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                        }`}>
                          {d.status === 'LUNAS' ? 'LUNAS ✅' : 'BELUM LUNAS'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          {d.status === 'BELUM_LUNAS' && (
                            payingDebtId === d.id ? (
                              <div className="flex items-center gap-1.5 justify-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={formatNumberInput(payAmount)}
                                  onChange={(e) => setPayAmount(parseNumberInput(e.target.value))}
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
                                Bayar
                              </button>
                            )
                          )}
                          <button
                            onClick={() => {
                              setEditingDebtId(d.id);
                              setSupplierName(d.supplierName);
                              setDebtDesc(d.description);
                              setDebtAmount(d.totalDebt);
                              setShowDebtForm(true);
                            }}
                            className="text-neutral-400 hover:text-blue-600 transition p-1 cursor-pointer"
                            title="Ubah Utang"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "Konfirmasi Hapus Utang",
                                message: `Apakah Anda yakin ingin menghapus catatan utang kepada ${d.supplierName}?`,
                                type: 'DELETE',
                                onConfirm: () => {
                                  onDeleteDebt(d.id);
                                  closeConfirm();
                                }
                              });
                            }}
                            className="text-neutral-400 hover:text-red-650 text-red-600 transition p-1 font-bold cursor-pointer"
                            title="Hapus Utang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              Kalkulator Komisi Makelar & Buruh Bilibili
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
                <SmartNumberInput
                  value={brokerCargoWeight}
                  onChange={setBrokerCargoWeight}
                  label="Total Hasil Berat Netto Timbangan"
                  mode="weight"
                  unit="Kg"
                  presets={[5000, 10000, 15000, 20000]}
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
                  <span className="font-bold">{brokerCargoWeight.toLocaleString('id-ID')} Kg</span>
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
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[500px]">
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
                        {e.ratePerKg ? `Rp ${e.ratePerKg.toLocaleString('id-ID')} / Kg` : 'Gaji Mingguan Staff'}
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
                {t.financeEntryTitle}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.financeSubTitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportFinanceExcel}
                title={t.exportExcel}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> {t.exportExcel}
              </button>
              <button
                onClick={handlePrintFinancePDF}
                title={t.printReportsPDF}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> {t.printReportsPDF}
              </button>
              <button
                onClick={() => setShowFinForm(!showFinForm)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showFinForm ? t.closeFormLabel : t.recordNewFinanceLabel}
              </button>
            </div>
          </div>

          {/* Form input mutasi */}
          {showFinForm && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-neutral-800 text-xs mb-3">Catat Finansial Mutasi Kas</h4>
              <form onSubmit={handleSaveFinance} className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
                
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
                    onChange={(e) => setFinCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white"
                  >
                    {categories.filter(c => c.type === finType || c.type === 'BOTH').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="OPERASIONAL">OPERASIONAL</option>
                        <option value="GAJI_KARYAWAN">GAJI KARYAWAN</option>
                        <option value="BURUH">UPAH BURUH</option>
                        <option value="MAKELAR">KOMISI MAKELAR</option>
                        <option value="TIMBANGAN">JASA TIMBANGAN</option>
                        <option value="POLES_KIPAS">JASA MILLING</option>
                        <option value="LAINNYA">LAIN-LAIN</option>
                      </>
                    )}
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
                    {banks.map(b => (
                      <option key={b.id} value={b.accountName}>{b.accountName} ({b.bankName})</option>
                    ))}
                    {banks.length === 0 && (
                      <>
                        <option value="Kas Gudang Tunai">Kas Gudang Tunai (Laci Pas)</option>
                        <option value="Mandiri Bilibili 162">Mandiri Bilibili 162 (028-xx)</option>
                        <option value="BRI Rekening Usaha">BRI Kantor Pos Gilingan</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <SmartNumberInput
                    value={finAmount}
                    onChange={setFinAmount}
                    label="Jumlah Nilai"
                    mode="currency"
                    unit="Rp"
                    presets={[50000, 100000, 500000, 1000000, 5000000]}
                  />
                </div>

                <div className="md:col-span-5 flex justify-end mt-2 pt-2 border-t border-neutral-100">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider shadow"
                  >
                    {editingFinId ? 'Simpan Transaksi Kas' : 'Tambah Transaksi Kas'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Ledger display table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-neutral-600 min-w-[900px]">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal Catat</th>
                    <th className="py-2.5 px-3">Golk Kategori</th>
                    <th className="py-2.5 px-3">Uraian Kas Mutasi</th>
                    <th className="py-2.5 px-3">Sasaran Pihak Terlibat</th>
                    <th className="py-2.5 px-3">Rekening Pembayaran</th>
                    <th className="text-right py-2.5 px-3">Pemasukan (+) (De)</th>
                    <th className="text-center py-2.5 px-3">Aksi</th>
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
                          {isDebit ? `+Rp ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-mono font-bold text-red-600">
                          {!isDebit ? `-Rp ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-'}
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

      {/* CONFIRM MODAL OVERLAY */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

    </div>
  );
}
