/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  WeighbridgeTicket, 
  InboundRecord, 
  OutboundRecord, 
  ServiceRecord, 
  DebtRecord, 
  FinancialRecord,
  EmployeeRecord
} from './types';
import { 
  initialWeighbridgeTickets, 
  initialInboundRecords, 
  initialOutboundRecords, 
  initialServiceRecords, 
  initialDebtRecords, 
  initialFinancialRecords,
  initialEmployeeRecords 
} from './data';

// Import our modular subcomponents
import WeighbridgeModule from './components/WeighbridgeModule';
import InboundModule from './components/InboundModule';
import OutboundModule from './components/OutboundModule';
import ServicesModule from './components/ServicesModule';
import MoistureRefaksiModule from './components/MoistureRefaksiModule';
import FinanceModule from './components/FinanceModule';

// Brand Assets
import bilibiliLogo from './assets/images/bilibili_logo_1780925186692.png';

// Lucide icons
import { 
  Scale, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wind, 
  Percent, 
  DollarSign, 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  PlusSquare,
  AlertCircle,
  Truck,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // --- STATE WITH LOCALSTORAGE PERSISTENCE ---
  const [tickets, setTickets] = useState<WeighbridgeTicket[]>(() => {
    const saved = localStorage.getItem('bilibili_tickets');
    return saved ? JSON.parse(saved) : initialWeighbridgeTickets;
  });

  const [inboundRecords, setInboundRecords] = useState<InboundRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_inbound');
    return saved ? JSON.parse(saved) : initialInboundRecords;
  });

  const [outboundRecords, setOutboundRecords] = useState<OutboundRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_outbound');
    return saved ? JSON.parse(saved) : initialOutboundRecords;
  });

  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_services');
    return saved ? JSON.parse(saved) : initialServiceRecords;
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_debts');
    return saved ? JSON.parse(saved) : initialDebtRecords;
  });

  const [finances, setFinances] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_finances');
    return saved ? JSON.parse(saved) : initialFinancialRecords;
  });

  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_employees');
    return saved ? JSON.parse(saved) : initialEmployeeRecords;
  });

  // Active navigational tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TIMBANG' | 'MASUK' | 'KELUAR' | 'SERVICES' | 'REFAKSI' | 'FINANCE'>('DASHBOARD');

  // Trigger LocalStorage save whenever records alter
  useEffect(() => {
    localStorage.setItem('bilibili_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('bilibili_inbound', JSON.stringify(inboundRecords));
  }, [inboundRecords]);

  useEffect(() => {
    localStorage.setItem('bilibili_outbound', JSON.stringify(outboundRecords));
  }, [outboundRecords]);

  useEffect(() => {
    localStorage.setItem('bilibili_services', JSON.stringify(serviceRecords));
  }, [serviceRecords]);

  useEffect(() => {
    localStorage.setItem('bilibili_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('bilibili_finances', JSON.stringify(finances));
  }, [finances]);

  useEffect(() => {
    localStorage.setItem('bilibili_employees', JSON.stringify(employees));
  }, [employees]);

  // --- COMPONENT ACTION CALLBACKS ---
  const handleAddTicket = (tk: WeighbridgeTicket) => {
    setTickets(prev => [tk, ...prev]);
  };

  const handleUpdateTicket = (updatedTk: WeighbridgeTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTk.id ? updatedTk : t));
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tiket jembatan timbang ini?")) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddInbound = (rec: InboundRecord) => {
    setInboundRecords(prev => [rec, ...prev]);
  };

  const handleDeleteInbound = (id: string) => {
    if (confirm("Hapus catatan penerimaan ini?")) {
      setInboundRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddOutbound = (rec: OutboundRecord) => {
    setOutboundRecords(prev => [rec, ...prev]);
  };

  const handleDeleteOutbound = (id: string) => {
    if (confirm("Hapus catatan pengiriman ini?")) {
      setOutboundRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddService = (rec: ServiceRecord) => {
    setServiceRecords(prev => [rec, ...prev]);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Hapus catatan jasa milling?")) {
      setServiceRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddDebt = (debt: DebtRecord) => {
    setDebts(prev => [debt, ...prev]);
  };

  const handlePayDebt = (id: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const paid = d.paidAmount + amount;
        const remaining = Math.max(0, d.totalDebt - paid);
        const status = remaining === 0 ? 'LUNAS' : 'BELUM_LUNAS';
        
        // Log in finances
        const newFin: FinancialRecord = {
          id: `fin-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'KREDIT',
          category: 'OPERASIONAL',
          description: `Pembayaran cicilan utang kepada ${d.supplierName}`,
          partyName: d.supplierName,
          amount: amount,
          bankAccount: 'Kas Gudang Tunai'
        };
        handleAddFinance(newFin);

        return { ...d, paidAmount: paid, remainingBalance: remaining, status };
      }
      return d;
    }));
  };

  const handleAddFinance = (fin: FinancialRecord) => {
    setFinances(prev => [fin, ...prev]);
  };

  // --- INTEGRATED METRICS CALCULATOR FOR COVER DASHBOARD ---
  // A. Stocks inside Silos & Warehouses
  const totalInboundCorn = inboundRecords.filter(r => r.commodity === 'JAGUNG').reduce((acc, r) => acc + r.netWeight, 0);
  const totalOutboundCorn = outboundRecords.filter(r => r.commodity === 'JAGUNG').reduce((acc, r) => acc + r.totalWeight, 0);
  const cornStockBalance = Math.max(0, totalInboundCorn - totalOutboundCorn);

  const totalInboundRice = inboundRecords.filter(r => r.commodity === 'BERAS').reduce((acc, r) => acc + r.netWeight, 0);
  const totalOutboundRice = outboundRecords.filter(r => r.commodity === 'BERAS').reduce((acc, r) => acc + r.totalWeight, 0);
  const riceStockBalance = Math.max(0, totalInboundRice - totalOutboundRice);

  // B. Services income tally
  const totalServiceFeeUnpaid = serviceRecords.filter(s => s.paymentStatus === 'UNPAID').reduce((acc, s) => acc + s.totalFee, 0);
  const totalServiceFeePaid = serviceRecords.filter(s => s.paymentStatus === 'PAID').reduce((acc, s) => acc + s.totalFee, 0);

  // C. Finances
  const totalCashIncome = finances.filter(f => f.type === 'DEBIT').reduce((acc, f) => acc + f.amount, 0);
  const totalCashExpense = finances.filter(f => f.type === 'KREDIT').reduce((acc, f) => acc + f.amount, 0);
  const netKasBalance = totalCashIncome - totalCashExpense;

  const totalOutstandingDebts = debts.filter(d => d.status === 'BELUM_LUNAS').reduce((acc, d) => acc + d.remainingBalance, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-800 font-sans flex flex-col">
      
      {/* GLOBAL WAREHOUSE HEADER BAR */}
      <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            {/* Visual Logo */}
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 bg-white shadow-md shrink-0 flex items-center justify-center">
              <img 
                src={bilibiliLogo} 
                alt="US Bilibili 162 Logo" 
                className="w-full h-full object-cover scale-[1.12] block"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 font-sans">
                US BILIBILI 162
                <span className="text-[10px] bg-emerald-800 text-yellow-405 border border-emerald-700 rounded px-1.5 py-0.5 font-semibold">
                  GUDANG PUSAT 🌽
                </span>
              </h1>
              <p className="text-[10px] opacity-80 font-mono">
                Sistem Informasi Pergudangan & Jembatan Timbang GSC GST-9700
              </p>
            </div>
          </div>

          {/* Time & Quick Stats Bar */}
          <div className="flex items-center gap-4 text-xs font-mono text-emerald-200">
            <div className="bg-emerald-900/60 px-3 py-1 rounded border border-emerald-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>{new Date().toLocaleTimeString('id-US', { hour12: false })} WITA</span>
            </div>
            <div className="hidden md:block">
              <span className="text-neutral-300">Sistem Active: </span>
              <span className="text-green-400 font-bold">● ONLINE</span>
            </div>
          </div>

        </div>
      </header>

      {/* TABS SELECTOR RAILS */}
      <div className="bg-white border-b border-neutral-200 shadow-sm sticky top-[69px] z-30 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 flex">
          
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'DASHBOARD' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            PANEL UTAMA (DASHBOARD)
          </button>

          <button
            onClick={() => setActiveTab('TIMBANG')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'TIMBANG' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20 shadow-sm' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-500" />
            JEMBATAN TIMBANG
          </button>

          <button
            onClick={() => setActiveTab('MASUK')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'MASUK' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
            1. BARANG MASUK
          </button>

          <button
            onClick={() => setActiveTab('KELUAR')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'KELUAR' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-600" />
            12. BARANG KELUAR
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'SERVICES' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-500" />
            3. JASA POLES & KIPAS
          </button>

          <button
            onClick={() => setActiveTab('REFAKSI')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'REFAKSI' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Percent className="w-4 h-4 text-amber-500" />
            REFAKSI KA JAGUNG
          </button>

          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'FINANCE' 
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            2. UTANG & 7. MUTASI KAS
          </button>

        </div>
      </div>

      {/* CORE WORKSPACE PORTALS */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="flex flex-col gap-8">
            
            {/* Hero Brand Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-neutral-900 text-white rounded-2xl p-6 shadow-md border border-emerald-850 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-800/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left z-10">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-yellow-400 bg-white shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src={bilibiliLogo}
                    alt="Logo US Bilibili 162"
                    className="w-full h-full object-cover scale-[1.12] block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-105 to-white tracking-tight">
                    US BILIBILI 162 - GUDANG BILIBILI
                  </h2>
                  <p className="text-sm text-emerald-200 font-medium mt-1">
                    Sistem Manajemen Pergudangan Terpadu & Jembatan Timbang Digital
                  </p>
                  <p className="text-xs text-emerald-350 font-mono mt-2 flex items-center justify-center md:justify-start gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Terminal Timbang GSC GST-9700 &bull; Luwu, Sulawesi Selatan
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap justify-center z-10">
                <button
                  onClick={() => setActiveTab('TIMBANG')}
                  className="bg-yellow-405 hover:bg-yellow-350 text-emerald-950 font-extrabold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow cursor-pointer"
                >
                  🚚 Timbang Truk Masuk
                </button>
                <button
                  onClick={() => setActiveTab('FINANCE')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  📊 Mutasi Kas Rekening
                </button>
              </div>
            </div>
            
            {/* Realtime stock metric grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Corn Stock */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">STOCK JAGUNG GUDANG 🌽</span>
                  <span className="text-2xl font-black text-amber-650 font-mono tracking-tight">
                    {cornStockBalance.toLocaleString('id-ID')} <span className="text-xs text-neutral-400">Kg Netto</span>
                  </span>
                  <span className="text-[9px] text-[#2ebd1d]">In: {totalInboundCorn.toLocaleString()} | Out: {totalOutboundCorn.toLocaleString()}</span>
                </div>
                <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                  <Package className="text-amber-500 w-5 h-5" />
                </div>
              </div>

              {/* Rice Stock */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">STOCK BERAS MASUK 🌾</span>
                  <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
                    {riceStockBalance.toLocaleString('id-ID')} <span className="text-xs text-neutral-400">Kg Netto</span>
                  </span>
                  <span className="text-[9px] text-neutral-500">In: {totalInboundRice.toLocaleString()} | Out: {totalOutboundRice.toLocaleString()}</span>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                  <Package className="text-emerald-600 w-5 h-5" />
                </div>
              </div>

              {/* Total Jasa Pipil / Poles */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">TOTAL BILLING JASA POLES 🌪️</span>
                  <span className="text-xl font-bold text-sky-700 font-mono tracking-tight">
                    Rp {totalServiceFeePaid.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-red-500 font-bold">Unpaid: Rp {totalServiceFeeUnpaid.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-11 h-11 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
                  <Wind className="text-sky-500 w-5 h-5" />
                </div>
              </div>

              {/* Cash Mutasi Balance */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">SALDO KAS & MANDIRI 💳</span>
                  <span className={`text-xl font-black font-mono tracking-tight ${netKasBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    Rp {netKasBalance.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-neutral-500">Utang Supplier: Rp {totalOutstandingDebts.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                  <DollarSign className="text-emerald-605 w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Quick action grid cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Column 1: Jembatan Timbang CRT Link */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                    <div className="p-1 rounded bg-[#e4f0fd] text-blue-700">
                      <Scale className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#0a2345]">JEMBATAN TIMBANG TRUK</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Masuk ke modulator simulator jembatan timbang GSC GST-9700 untuk menimbang truk berat, kosong, penuangan susut potongan karung, persenan refaksi KA, serta cetak print thermal slip kasir.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('TIMBANG')}
                  className="mt-6 bg-[#0a2245] hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <Truck className="w-4 h-4" />
                  Buka Aplikasi Timbangan
                </button>
              </div>

              {/* Column 2: Inbound links */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                    <div className="p-1 rounded bg-emerald-50 text-emerald-700">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-emerald-800">1. BARANG MASUK 2026</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Catat incoming jagung pipil basah untuk tangki pengeringan, timbang truk masuk petani, potong kadar air, hitung refaksi, upah buruh panggul harian dan letak penyimpanan sektor gudang.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('MASUK')}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Catat Barang Masuk
                </button>
              </div>

              {/* Column 3: Processing link */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between block">
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-700">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-sky-800">3. JASA POLES & KIPAS</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Pengolahan beras poles yang kotor/berdebu dengan peniup kipas angin (blower) untuk mendapatkan beras bersih kualitas super, ampas dedak, dan rekapan jasa palka.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('SERVICES')}
                  className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <Wind className="w-3.5 h-3.5" />
                  Buka Jasa Poles Kipas
                </button>
              </div>

            </div>

            {/* Recent weighing transactions timeline */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-neutral-800 text-sm mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2">
                <Clock className="text-emerald-600 w-5 h-5" />
                Antrian Timbangan Terbaru Hari Ini ({new Date().toISOString().split('T')[0]})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-600">
                  <thead className="bg-[#122345] text-[#afcbff] font-mono tracking-wider font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">No. Tiket</th>
                      <th className="py-2.5 px-3">No. Polisi</th>
                      <th className="py-2.5 px-3">Barang</th>
                      <th className="py-2.5 px-3">Suplier / Tujuan Mitra</th>
                      <th className="py-2.5 px-3 text-right">Timbang I (Gross)</th>
                      <th className="py-2.5 px-3 text-right">Timbang II (Tare)</th>
                      <th className="py-2.5 px-3 text-right">Berat Netto</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {tickets.slice(0, 3).map(tk => (
                      <tr key={tk.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold font-mono text-[#a03010]">{tk.ticketNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-800">{tk.policeNo}</td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">
                            {tk.goodsName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-800 font-medium">{tk.agency}</td>
                        <td className="text-right py-2.5 px-3 font-mono">{tk.timbang1Weight.toLocaleString('id-ID')} Kg</td>
                        <td className="text-right py-2.5 px-3 font-mono text-orange-600 font-semibold">
                          {tk.timbang2Weight > 0 ? `${tk.timbang2Weight.toLocaleString('id-ID')} Kg` : '- -'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-black text-emerald-600 font-mono">
                          {tk.netWeight.toLocaleString('id-ID')} Kg
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tk.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'
                          }`}>
                            {tk.status === 'COMPLETED' ? 'SELESAI TIMBANG' : 'MENUNGGU II'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-3 pt-3 border-t border-neutral-100">
                <button
                  onClick={() => setActiveTab('TIMBANG')}
                  className="text-xs text-blue-600 hover:text-blue-500 font-bold transition flex items-center justify-center gap-1 mx-auto"
                >
                  Lihat Seluruh Arsip Timbangan <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick instruction guide about user photos */}
            <div className="bg-emerald-950 text-emerald-100 p-5 rounded-xl border border-emerald-900 shadow flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-400 bg-white shadow-md shrink-0 flex items-center justify-center">
                  <img
                    src={bilibiliLogo}
                    alt="US Bilibili 162 Logo"
                    className="w-full h-full object-cover scale-[1.12] block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-yellow-350">Informasi Alur Jembatan Timbang & Refaksi C.V Bilibili 162</h4>
                  <p className="text-xs text-emerald-200 mt-0.5 max-w-2xl leading-relaxed">
                    Sistem dikonfigurasi penuh dengan emulator digital sensor beban GST-9700. Gunakan simulator berat fisik di dalam Tab Timbangan untuk mencocokkan Truk Tronton pengantar. Susut berat akibat jamur / air diolah otomatis berdasar tabel potongan kadar air.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('REFAKSI')}
                className="bg-yellow-450 text-emerald-950 font-bold text-xs hover:bg-[#dfe40c] bg-[#cfef33] font-bold px-4 py-2 rounded-lg whitespace-nowrap transition cursor-pointer"
              >
                Lihat Panduan Refaksi KA
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: TIMBANG (WEIGHBRIDGE) */}
        {activeTab === 'TIMBANG' && (
          <WeighbridgeModule
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
            onDeleteTicket={handleDeleteTicket}
          />
        )}

        {/* VIEW 3: BARANG MASUK */}
        {activeTab === 'MASUK' && (
          <InboundModule
            records={inboundRecords}
            tickets={tickets}
            onAddRecord={handleAddInbound}
            onDeleteRecord={handleDeleteInbound}
          />
        )}

        {/* VIEW 4: BARANG KELUAR */}
        {activeTab === 'KELUAR' && (
          <OutboundModule
            records={outboundRecords}
            tickets={tickets}
            onAddRecord={handleAddOutbound}
            onDeleteRecord={handleDeleteOutbound}
          />
        )}

        {/* VIEW 5: SERVICES LOGS */}
        {activeTab === 'SERVICES' && (
          <ServicesModule
            records={serviceRecords}
            onAddRecord={handleAddService}
            onDeleteRecord={handleDeleteService}
          />
        )}

        {/* VIEW 6: REFAKSI CALCULATOR */}
        {activeTab === 'REFAKSI' && (
          <MoistureRefaksiModule />
        )}

        {/* VIEW 7: FINANCE, UTANG, MUTASI */}
        {activeTab === 'FINANCE' && (
          <FinanceModule
            debts={debts}
            finances={finances}
            employees={employees}
            onAddDebt={handleAddDebt}
            onPayDebt={handlePayDebt}
            onAddFinance={handleAddFinance}
          />
        )}

      </main>

      {/* FOOTER METADATA */}
      <footer className="bg-neutral-800 text-neutral-400 py-6 border-t border-neutral-700 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div>
            <p className="font-bold text-neutral-300">Aplikasi Pergudangan Terpadu US Bilibili 162</p>
            <p className="text-[10px] text-neutral-500 mt-1">US Bilibili 162 Indonesia &bull; Luwu &bull; Sulawesi Selatan &bull; Version 2.0</p>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            Sistem Digitalisasi Industri Beras - Jagung &bull; Build Date: 2026-06-08
          </div>
        </div>
      </footer>

    </div>
  );
}
