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
      `Rp ${(d.totalDebt ?? 0).toLocaleString('id-ID')}`,
      `Rp ${(d.paidAmount ?? 0).toLocaleString('id-ID')}`,
      `Rp ${(d.remainingBalance ?? 0).toLocaleString('id-ID')}`,
      d.status === 'LUNAS' ? 'LUNAS' : 'SISA UTANG'
    ]);
    const totalDebt = debts.reduce((sum, d) => sum + d.totalDebt, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalRemaining = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
    const summaries = [
      { label: 'Total Transaksi Utang', value: `${debts.length} Pihak` },
      { label: 'Total Utang Kumulatif', value: `Rp ${(totalDebt ?? 0).toLocaleString('id-ID')}` },
      { label: 'Total Rekening Terbayar', value: `Rp ${(totalPaid ?? 0).toLocaleString('id-ID')}` },
      { label: 'Sisa Saldo Terutang', value: `Rp ${(totalRemaining ?? 0).toLocaleString('id-ID')}` }
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
      f.type === 'DEBIT' ? `Rp ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-',
      f.type === 'KREDIT' ? `Rp ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-'
    ]);
    const totalDebit = finances.filter(f => f.type === 'DEBIT').reduce((sum, f) => sum + f.amount, 0);
    const totalKredit = finances.filter(f => f.type === 'KREDIT').reduce((sum, f) => sum + f.amount, 0);
    const summaries = [
      { label: 'Total Transaksi Mutasi', value: `${finances.length} Alur` },
      { label: 'Total Dana Masuk (Debit)', value: `Rp ${(totalDebit ?? 0).toLocaleString('id-ID')}` },
      { label: 'Total Dana Keluar (Kredit)', value: `Rp ${(totalKredit ?? 0).toLocaleString('id-ID')}` },
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
      message: `Apakah Anda yakin ingin menambahkan transaksi mutasi ${finType === 'DEBIT' ? 'Pemasukan (Debit)' : 'Pengeluaran (Kredit)'} sebesar Rp ${(finAmount ?? 0).toLocaleString('id-ID')} untuk '${finDesc}'?`,
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
        : `Apakah Anda yakin ingin mencatatkan kewajiban utang baru kepada supplier ${supplierName.toUpperCase()} sebesar Rp ${(debtAmount ?? 0).toLocaleString('id-ID')}?`,
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
        : `Apakah Anda yakin ingin menambahkan transaksi mutasi ${finType === 'DEBIT' ? 'Pemasukan (Debit)' : 'Pengeluaran (Kredit)'} sebesar Rp ${(finAmount ?? 0).toLocaleString('id-ID')} untuk '${finDesc}'?`,
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
      (window as any).__showToast?.(`Komisi Makelar ${activeBroker.name} sebesar Rp ${(calculatedCommission ?? 0).toLocaleString('id-ID')} berhasil dicatat dalam Buku Mutasi!`, "success");
    };

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Bayar Komisi Makelar",
      message: `Apakah Anda yakin ingin membayar komisi makelar untuk ${activeBroker.name} sebesar Rp ${(calculatedCommission ?? 0).toLocaleString('id-ID')}?`,
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
      message: `Apakah Anda yakin ingin melakukan pembayaran cicilan utang kepada ${supplier} sebesar Rp ${(payAmount ?? 0).toLocaleString('id-ID')}?`,
      type: 'PAY',
      onConfirm: () => {
        executePayDebt();
        closeConfirm();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* FINANCIAL SUB NAVIGATION MATCHING FOLDERS */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveSubTab('UTANG')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer uppercase ${
            activeSubTab === 'UTANG' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 {t.financeTitle.split('&')[0].trim()}
        </button>
        <button
          onClick={() => setActiveSubTab('MAKELAR')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer uppercase ${
            activeSubTab === 'MAKELAR' 
              ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📂 {t.brokerEmployees || 'BURUH & MAKELAR'}
        </button>
        <button
          onClick={() => setActiveSubTab('MUTASI')}
          className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer uppercase ${
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
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 uppercase">
                <CreditCard className="text-emerald-600 w-4.5 h-4.5" />
                {t.debtsArchivesTitle}
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase">
                {t.debtsSubTitle}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportDebtExcel}
                title={t.exportExcel}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer uppercase"
              >
                <Download className="w-3 h-3" /> EXPORT EXCEL
              </button>
              <button
                onClick={handlePrintDebtPDF}
                title={t.printReportsPDF}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer uppercase"
              >
                <Printer className="w-3 h-3" /> PRINT PDF
              </button>
              <button
                onClick={() => setShowDebtForm(!showDebtForm)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer shadow uppercase"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showDebtForm ? 'TUTUP FORM' : 'CATAT UTANG BARU'}
              </button>
            </div>
          </div>

          {/* Form write debt */}
          {showDebtForm && (
            <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5">
              <h4 className="font-black text-neutral-800 text-xs mb-3 uppercase tracking-tight">FORMULIR CATATAN UTANG SUPPLIER BARU</h4>
              <form onSubmit={handleSaveDebt} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px]">
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold uppercase">NAMA PETANI / SUPPLIER</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value.toUpperCase())}
                    placeholder="CONTOH: H. WAWAN - SIDRAP"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold uppercase">URAIAN / PERINCIAN TRANSAKSI</label>
                  <input
                    type="text"
                    value={debtDesc}
                    onChange={(e) => setDebtDesc(e.target.value.toUpperCase())}
                    placeholder="CONTOH: UTANG JAGUNG PIPIL KA 16.8% (TIKET 021230)"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none font-bold uppercase"
                  />
                </div>
                <div>
                  <SmartNumberInput
                    value={debtAmount}
                    onChange={setDebtAmount}
                    label="JUMLAH TOTAL NILAI UTANG"
                    mode="currency"
                    unit="RP"
                    presets={[1000000, 5000000, 10000000, 25000000]}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-lg cursor-pointer uppercase transition-all shadow-md"
                  >
                    {editingDebtId ? 'SIMPAN PERUBAHAN UTANG' : 'SIMPAN BUKU UTANG BARU'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table display debts */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-neutral-600 min-w-[900px]">
                <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">TANGGAL TERBIT</th>
                    <th className="py-2.5 px-3">SUPPLIER PEMILIK</th>
                    <th className="py-2.5 px-3">RINCIAN TRANSAKSI</th>
                    <th className="text-right py-2.5 px-3">TOTAL UTANG (RP)</th>
                    <th className="text-right py-2.5 px-3">JUMLAH DIBAYAR (RP)</th>
                    <th className="text-right py-2.5 px-3 font-black">SISA SALDO (RP)</th>
                    <th className="text-center py-2.5 px-3 font-semibold">STATUS</th>
                    <th className="text-right py-2.5 px-4">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 uppercase">
                  {debts.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {d.date}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-black text-neutral-900">{d.supplierName}</td>
                      <td className="py-2.5 px-3 text-neutral-600 font-medium">{d.description}</td>
                      <td className="text-right py-2.5 px-3 font-bold font-mono">{(d.totalDebt ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 text-emerald-600 font-bold font-mono">{(d.paidAmount ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-right py-2.5 px-3 font-black font-mono text-red-600">{(d.remainingBalance ?? 0).toLocaleString('id-ID')}</td>
                      <td className="text-center py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${
                          d.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                        }`}>
                          {d.status === 'LUNAS' ? 'LUNAS ✅' : 'BELUM LUNAS'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          {d.status === 'BELUM_LUNAS' && (
                            payingDebtId === d.id ? (
                              <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={formatNumberInput(payAmount)}
                                  onChange={(e) => setPayAmount(parseNumberInput(e.target.value))}
                                  className="bg-neutral-50 border border-neutral-300 text-red-600 font-black p-1 rounded font-mono text-xs w-28 text-right outline-none ring-1 ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => triggerDebtPaymentSubmit(d.id)}
                                  className="bg-blue-600 text-white font-black px-2 py-1.5 rounded hover:bg-blue-500 text-[10px] uppercase"
                                >
                                  OK
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setPayingDebtId(d.id); setPayAmount(d.remainingBalance); }}
                                className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-black px-3 py-1 rounded transition uppercase shadow-sm"
                              >
                                BAYAR CICILAN
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
                            className="text-neutral-400 hover:text-blue-600 transition p-1 cursor-pointer bg-neutral-100 rounded"
                            title="UBAH DATA"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "KONFIRMASI HAPUS DATA UTANG",
                                message: `APAKAH ANDA YAKIN INGIN MENGHAPUS CATATAN UTANG BERJALAN KEPADA ${d.supplierName.toUpperCase()}?`,
                                type: 'DELETE',
                                onConfirm: () => {
                                  onDeleteDebt(d.id);
                                  closeConfirm();
                                }
                              });
                            }}
                            className="text-neutral-400 hover:text-red-600 transition p-1 cursor-pointer bg-neutral-100 rounded"
                            title="HAPUS DATA"
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

      {/* TAB 2: BURUH & MAKELAR */}
      {activeSubTab === 'MAKELAR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel: Commission Calculator */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-md">
            <h3 className="font-black text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2 mb-3 uppercase tracking-tight">
              <Users className="text-emerald-600 w-4.5 h-4.5" />
              KALKULATOR KOMISI MAKELAR & BURUH PANGGUL
            </h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase mb-4 leading-relaxed">
              OTOMATISASI PERHITUNGAN FEE AGEN MAKELAR BERDASARKAN TOTAL BERAT NETTO CARGO GUDANG DIKALI TARIF OPERASIONAL STANDAR US BILIBILI.
            </p>

            <div className="flex flex-col gap-4 text-xs font-bold uppercase">
              <div>
                <label className="block text-neutral-500 mb-1 text-[10px]">PILIH MAKELAR / AGEN REKANAN AKTIF</label>
                <select
                  value={selectedBrokerId}
                  onChange={(e) => setSelectedBrokerId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded p-2 focus:bg-white focus:outline-none font-black text-neutral-800"
                >
                  {employees.filter(e => e.role === 'MAKELAR').map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name.toUpperCase()} (TARIF RP {e.ratePerKg}/KG)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <SmartNumberInput
                  value={brokerCargoWeight}
                  onChange={setBrokerCargoWeight}
                  label="TOTAL VOLUME BERAT CARGO NETTO (KG)"
                  mode="weight"
                  unit="KG"
                  presets={[5000, 10000, 15000, 20000]}
                />
              </div>

              {/* Math outcome display */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 font-mono text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="text-neutral-500">NAMA MAKELAR:</span>
                  <span className="font-black text-neutral-900">{activeBroker?.name.toUpperCase() || 'BELUM TERPILIH'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="text-neutral-500">VOLUME CARGO NETTO:</span>
                  <span className="font-black">{(brokerCargoWeight ?? 0).toLocaleString('id-ID')} KG</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="text-neutral-500">TARIF F FEE (NETTO):</span>
                  <span className="font-black text-neutral-600">RP {(brokerRate ?? 0)} / KG</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-sm font-black bg-emerald-50 border border-emerald-100 p-3 text-emerald-950 rounded-lg shadow-inner">
                  <span className="tracking-tighter">TOTAL KOMISI TERHUTANG:</span>
                  <span className="text-emerald-700 text-lg font-black tracking-tighter">RP {(calculatedCommission ?? 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={handlePayBrokerCommission}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black py-3 rounded-lg text-[11px] cursor-pointer shadow-lg text-center uppercase tracking-widest transition-all active:scale-95"
              >
                KONFIRMASI BAYAR & CATAT BUKU KAS
              </button>
            </div>
          </div>

          {/* Right Panel: Employee List registry */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-md">
            <h3 className="font-black text-neutral-900 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2 mb-3 uppercase tracking-tight">
              <Users className="text-indigo-600 w-4.5 h-4.5" />
              DATABASE PETUGAS GUDANG & MAKELAR REKANAN
            </h3>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[10px] min-w-[500px]">
                <thead className="bg-neutral-50 text-neutral-500 font-black border-b border-neutral-200 uppercase tracking-tighter">
                  <tr>
                    <th className="py-2 px-3">NAMA LENGKAP</th>
                    <th className="py-2 px-3">DIVISI / JABATAN</th>
                    <th className="py-2 px-3">KONTAK / HP</th>
                    <th className="text-right py-2 px-3">TARIF KOMISI (RP/KG)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-600 font-bold uppercase transition-all">
                  {employees.map(e => (
                    <tr key={e.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-black text-neutral-900">{e.name.toUpperCase()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter ${
                          e.role === 'MAKELAR' ? 'bg-amber-100 text-amber-800' :
                          e.role === 'BURUH' ? 'bg-orange-100 text-orange-800' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">{e.phone || '--'}</td>
                      <td className="text-right py-2.5 px-3 font-mono font-black text-emerald-600">
                        {e.ratePerKg ? `${e.ratePerKg.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[9px] text-neutral-400 font-bold italic text-center mt-5 bg-neutral-50 border border-neutral-100 p-2.5 rounded-lg uppercase tracking-tight leading-relaxed">
              SISTEM US BILIBILI 162 : UPAH BURUH BONGKAR MUAT DIHITUNG PER TRUK MASUK & KELUAR, GAJI STAFF TETAP DIBAYARKAN PER MINGGU MELALUI KEUANGAN PUSAT.
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: MUTASI KAS REKENING */}
      {activeSubTab === 'MUTASI' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="font-black text-neutral-900 text-sm flex items-center gap-2 uppercase tracking-tight">
                <Landmark className="text-emerald-700 w-5 h-5" />
                BUKU MUTASI KAS & SALURAN REKENING TERPADU
              </h3>
              <p className="text-[10px] text-neutral-500 font-bold mt-0.5 uppercase">
                REKAMAN ALUR KAS MASUK (DEBIT) DAN KAS KELUAR (KREDIT) REAL-TIME MELALUI BERBAGAI SALURAN REKENING PERUSAHAAN.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportFinanceExcel}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer uppercase shadow-sm"
              >
                <Download className="w-3 h-3" /> EXPORT EXCEL
              </button>
              <button
                onClick={handlePrintFinancePDF}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer uppercase shadow-sm"
              >
                <Printer className="w-3 h-3" /> PRINT PDF
              </button>
              <button
                onClick={() => setShowFinForm(!showFinForm)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer shadow-lg uppercase tracking-wider"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showFinForm ? 'TUTUP FORM' : 'CATAT MUTASI BARU'}
              </button>
            </div>
          </div>

          {/* Form input mutasi */}
          {showFinForm && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-lg">
              <h4 className="font-black text-neutral-900 text-xs mb-3 uppercase border-b border-neutral-100 pb-2">FORMULIR INPUT TRANSAKSI MUTASI FINANSIAL</h4>
              <form onSubmit={handleSaveFinance} className="grid grid-cols-1 md:grid-cols-5 gap-4 text-[11px] font-bold">
                
                <div>
                  <label className="block text-neutral-500 mb-1 uppercase">ARAH ALIRAN KAS</label>
                  <select
                    value={finType}
                    onChange={(e) => setFinType(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none font-black"
                  >
                    <option value="DEBIT">MASUK / DEBIT (+)💰</option>
                    <option value="KREDIT">PENGELUARAN / KREDIT (-)💸</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1 uppercase">GOLONGAN KATEGORI</label>
                  <select
                    value={finCategory}
                    onChange={(e) => setFinCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {categories.filter(c => c.type === finType || c.type === 'BOTH').map(c => (
                      <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="OPERASIONAL">OPERASIONAL GUDANG</option>
                        <option value="GAJI_KARYAWAN">GAJI & STAFF</option>
                        <option value="BURUH">UPAH BURUH PANGGUL</option>
                        <option value="MAKELAR">KOMISI MAKELAR</option>
                        <option value="TIMBANGAN">JASA TIMBANGAN</option>
                        <option value="POLES_KIPAS">JASA POLES & KIPAS</option>
                        <option value="LAINNYA">LAIN-LAIN / TAK TERDUGA</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-neutral-500 mb-1 uppercase">DESKRIPSI / RINCIAN MUTASI</label>
                  <input
                    type="text"
                    value={finDesc}
                    onChange={(e) => setFinDesc(e.target.value.toUpperCase())}
                    placeholder="CONTOH: BAYAR TAGIHAN LISTRIK GUDANG BLN MEI"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white outline-none font-black uppercase"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1 uppercase">SUMBER DANA / REKENING</label>
                  <select
                    value={finBank}
                    onChange={(e) => setFinBank(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-1.5 focus:bg-white font-black"
                  >
                    {banks.map(b => (
                      <option key={b.id} value={b.accountName}>{b.accountName.toUpperCase()} ({b.bankName.toUpperCase()})</option>
                    ))}
                    {banks.length === 0 && (
                      <>
                        <option value="KAS GUDANG TUNAI">KAS GUDANG TUNAI (CASH)</option>
                        <option value="MANDIRI BILIBILI 162">MANDIRI BILIBILI 162</option>
                        <option value="BRI REKENING USAHA">BRI REKENING USAHA</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <SmartNumberInput
                    value={finAmount}
                    onChange={setFinAmount}
                    label="JUMLAH TOTAL NILAI TRANSAKSI (RP)"
                    mode="currency"
                    unit="RP"
                    presets={[50000, 100000, 500000, 1000000, 5000000]}
                  />
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black py-2.5 rounded-lg transition-all cursor-pointer text-xs uppercase tracking-widest shadow-lg active:scale-95"
                  >
                    {editingFinId ? 'SIMPAN UBAH MUTASI' : 'SIMPAN TRANSAKSI KE BUKU KAS'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Ledger display table */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] text-neutral-600 min-w-[900px] uppercase">
                <thead className="bg-neutral-50 text-neutral-400 font-black uppercase tracking-tighter border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-3">TANGGAL</th>
                    <th className="py-3 px-3">KATEGORI</th>
                    <th className="py-3 px-3">URAIAN TRANSAKSI</th>
                    <th className="py-3 px-3">SUMBER DANA</th>
                    <th className="text-right py-3 px-3">DEBIT (+)</th>
                    <th className="text-right py-3 px-3 font-black">KREDIT (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-bold">
                  {finances.map((f) => {
                    const isDebit = f.type === 'DEBIT';
                    return (
                      <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 text-neutral-400 font-mono text-[10px] whitespace-nowrap">{f.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border border-neutral-200/50">
                            {f.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-900 font-black">{f.description}</td>
                        <td className="py-2.5 px-3 text-neutral-500 font-black uppercase tracking-tight">{f.bankAccount}</td>
                        
                        <td className="text-right py-2.5 px-3 font-mono font-black text-emerald-600">
                          {isDebit ? `+ ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-mono font-black text-red-600">
                          {!isDebit ? `- ${(f.amount ?? 0).toLocaleString('id-ID')}` : '-'}
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
