/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from './utils/toast';
import { 
  WeighbridgeTicket, 
  InboundRecord, 
  OutboundRecord, 
  ServiceRecord, 
  DebtRecord, 
  FinancialRecord,
  EmployeeRecord,
  VehicleRecord,
  SupplierRecord,
  BuyerRecord,
  CommodityRecord,
  RiceStockRecord,
  BankRecord,
  BrokerRecord,
  LocationRecord
} from './types';
import { 
  initialWeighbridgeTickets, 
  initialInboundRecords, 
  initialOutboundRecords, 
  initialServiceRecords, 
  initialDebtRecords, 
  initialFinancialRecords,
  initialEmployeeRecords,
  initialVehicles,
  initialSuppliers,
  initialBuyers,
  initialCommodities,
  initialRiceStockRecords,
  initialBankAccounts,
  initialBrokers,
  initialStorageLocations
} from './data';

// Import our modular subcomponents
import WeighbridgeModule from './components/WeighbridgeModule';
import InboundModule from './components/InboundModule';
import OutboundModule from './components/OutboundModule';
import ServicesModule from './components/ServicesModule';
import MoistureRefaksiModule from './components/MoistureRefaksiModule';
import FinanceModule from './components/FinanceModule';
import ReportsModule from './components/ReportsModule';
import DatabaseMasterModule from './components/DatabaseMasterModule';
import RiceStockModule from './components/RiceStockModule';
import { useLanguage } from './i18n/LanguageContext';

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
  ChevronRight,
  Database,
  Settings as SettingsIcon,
} from 'lucide-react';

// Define professional industrial & agricultural application themes
export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  headerBg: string;
  headerBorder: string;
  headerBadgeBg: string;
  headerBadgeText: string;
  headerBadgeBorder: string;
  statusBoxBg: string;
  statusBoxBorder: string;
  tabActiveBorder: string;
  tabActiveText: string;
  tabActiveBg: string;
  heroGradient: string;
  heroTextGradient: string;
  heroBtnBg: string;
  heroBtnHover: string;
  heroBtnText: string;
  pageBg: string;
  accentText: string;
  btnPrimaryBg: string;
  btnPrimaryHover: string;
  footerBg: string;
  footerBorder: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'EMERALD',
    name: 'Emerald Harvest',
    emoji: '🌾',
    headerBg: 'bg-emerald-950',
    headerBorder: 'border-emerald-900',
    headerBadgeBg: 'bg-emerald-800',
    headerBadgeText: 'text-yellow-300',
    headerBadgeBorder: 'border-emerald-700',
    statusBoxBg: 'bg-emerald-900/60',
    statusBoxBorder: 'border-emerald-800',
    tabActiveBorder: 'border-emerald-600',
    tabActiveText: 'text-emerald-800',
    tabActiveBg: 'bg-emerald-50/20',
    heroGradient: 'from-emerald-900 via-emerald-950 to-neutral-900',
    heroTextGradient: 'from-yellow-300 via-yellow-105 to-white',
    heroBtnBg: 'bg-yellow-405 hover:bg-yellow-350',
    heroBtnHover: 'hover:bg-yellow-350',
    heroBtnText: 'text-emerald-950',
    pageBg: 'bg-slate-50',
    accentText: 'text-emerald-800',
    btnPrimaryBg: 'bg-emerald-600',
    btnPrimaryHover: 'hover:bg-emerald-500',
    footerBg: 'bg-emerald-950',
    footerBorder: 'border-neutral-700',
  },
  {
    id: 'MIDNIGHT',
    name: 'Midnight Ocean',
    emoji: '⚓',
    headerBg: 'bg-indigo-950',
    headerBorder: 'border-indigo-900',
    headerBadgeBg: 'bg-indigo-800',
    headerBadgeText: 'text-cyan-300',
    headerBadgeBorder: 'border-indigo-700',
    statusBoxBg: 'bg-indigo-900/60',
    statusBoxBorder: 'border-indigo-800',
    tabActiveBorder: 'border-indigo-600',
    tabActiveText: 'text-indigo-800',
    tabActiveBg: 'bg-indigo-50/20',
    heroGradient: 'from-indigo-900 via-indigo-950 to-neutral-900',
    heroTextGradient: 'from-cyan-305 via-cyan-100 to-white',
    heroBtnBg: 'bg-cyan-400 hover:bg-cyan-300',
    heroBtnHover: 'hover:bg-cyan-300',
    heroBtnText: 'text-indigo-950',
    pageBg: 'bg-zinc-50',
    accentText: 'text-indigo-800',
    btnPrimaryBg: 'bg-indigo-600',
    btnPrimaryHover: 'hover:bg-indigo-500',
    footerBg: 'bg-indigo-950',
    footerBorder: 'border-indigo-900',
  },
  {
    id: 'RUST',
    name: 'Charcoal Rust',
    emoji: '🚜',
    headerBg: 'bg-stone-900',
    headerBorder: 'border-stone-800',
    headerBadgeBg: 'bg-stone-800',
    headerBadgeText: 'text-orange-400',
    headerBadgeBorder: 'border-stone-700',
    statusBoxBg: 'bg-stone-950/50',
    statusBoxBorder: 'border-stone-800',
    tabActiveBorder: 'border-orange-600',
    tabActiveText: 'text-orange-850',
    tabActiveBg: 'bg-orange-50/20',
    heroGradient: 'from-stone-900 via-stone-950 to-neutral-900',
    heroTextGradient: 'from-orange-400 via-amber-200 to-white',
    heroBtnBg: 'bg-orange-500 hover:bg-orange-400',
    heroBtnHover: 'hover:bg-orange-400',
    heroBtnText: 'text-stone-950',
    pageBg: 'bg-[#faf8f5]',
    accentText: 'text-orange-800',
    btnPrimaryBg: 'bg-orange-600',
    btnPrimaryHover: 'hover:bg-orange-500',
    footerBg: 'bg-stone-900',
    footerBorder: 'border-stone-900',
  },
  {
    id: 'GOLDEN',
    name: 'Golden Field',
    emoji: '🌾',
    headerBg: 'bg-amber-950',
    headerBorder: 'border-amber-900',
    headerBadgeBg: 'bg-amber-800',
    headerBadgeText: 'text-yellow-200',
    headerBadgeBorder: 'border-amber-700',
    statusBoxBg: 'bg-amber-900/60',
    statusBoxBorder: 'border-amber-800',
    tabActiveBorder: 'border-amber-600',
    tabActiveText: 'text-amber-850',
    tabActiveBg: 'bg-amber-50/20',
    heroGradient: 'from-amber-900 via-amber-950 to-neutral-950',
    heroTextGradient: 'from-yellow-300 via-yellow-105 to-white',
    heroBtnBg: 'bg-yellow-405 hover:bg-yellow-350',
    heroBtnHover: 'hover:bg-yellow-350',
    heroBtnText: 'text-amber-950',
    pageBg: 'bg-[#fffef7]',
    accentText: 'text-amber-800',
    btnPrimaryBg: 'bg-amber-600',
    btnPrimaryHover: 'hover:bg-amber-500',
    footerBg: 'bg-amber-950',
    footerBorder: 'border-amber-900',
  },
  {
    id: 'SILVER',
    name: 'Classic Steel',
    emoji: '🏢',
    headerBg: 'bg-slate-800',
    headerBorder: 'border-slate-700',
    headerBadgeBg: 'bg-slate-700',
    headerBadgeText: 'text-slate-200',
    headerBadgeBorder: 'border-slate-600',
    statusBoxBg: 'bg-slate-900/40',
    statusBoxBorder: 'border-slate-700',
    tabActiveBorder: 'border-slate-700',
    tabActiveText: 'text-slate-800',
    tabActiveBg: 'bg-slate-100/50',
    heroGradient: 'from-slate-800 via-slate-900 to-slate-950',
    heroTextGradient: 'from-slate-200 via-white to-blue-300',
    heroBtnBg: 'bg-white hover:bg-slate-100',
    heroBtnHover: 'hover:bg-slate-100',
    heroBtnText: 'text-slate-950',
    pageBg: 'bg-slate-50',
    accentText: 'text-slate-800',
    btnPrimaryBg: 'bg-slate-700',
    btnPrimaryHover: 'hover:bg-slate-600',
    footerBg: 'bg-slate-800',
    footerBorder: 'border-slate-800',
  }
];

export default function App() {
  const { language, setLanguage, t } = useLanguage();
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

  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [buyers, setBuyers] = useState<BuyerRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_buyers');
    return saved ? JSON.parse(saved) : initialBuyers;
  });

  const [commodities, setCommodities] = useState<CommodityRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_commodities');
    return saved ? JSON.parse(saved) : initialCommodities;
  });

  const [riceStockRecords, setRiceStockRecords] = useState<RiceStockRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_rice_stock_v2');
    return saved ? JSON.parse(saved) : initialRiceStockRecords;
  });

  const [banks, setBanks] = useState<BankRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_banks');
    return saved ? JSON.parse(saved) : initialBankAccounts;
  });

  const [brokers, setBrokers] = useState<BrokerRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_brokers');
    return saved ? JSON.parse(saved) : initialBrokers;
  });

  const [locations, setLocations] = useState<LocationRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_locations');
    return saved ? JSON.parse(saved) : initialStorageLocations;
  });

  // Active navigational tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TIMBANG' | 'MASUK' | 'KELUAR' | 'SERVICES' | 'REFAKSI' | 'FINANCE' | 'STOK_BERAS' | 'LAPORAN' | 'DATABASE'>('DASHBOARD');

  // --- SETTINGS STATE ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [printerName, setPrinterName] = useState(() => localStorage.getItem('bilibili_printer_name') || 'EPSON LX-310');

  useEffect(() => {
    localStorage.setItem('bilibili_printer_name', printerName);
  }, [printerName]);

  // Premium customizable active theme state with LocalStorage persistence
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('bilibili_theme') || 'EMERALD';
  });

  useEffect(() => {
    localStorage.setItem('bilibili_theme', activeThemeId);
  }, [activeThemeId]);

  const theme = APP_THEMES.find(t => t.id === activeThemeId) || APP_THEMES[0];

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

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LOCAL TOAST NOTIFICATION STATE ---
  interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number }>;
      if (customEvent.detail) {
        const { message, type = 'success', duration = 3500 } = customEvent.detail;
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        
        // Auto remove
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => {
      window.removeEventListener('app-toast', handleToastEvent);
    };
  }, []);

  const handleRemoveToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleThemeChange = (themeId: string) => {
    setActiveThemeId(themeId);
    const selected = APP_THEMES.find(t => t.id === themeId);
    if (selected) {
      showToast(`${t.themeChanged} ${selected.emoji} ${selected.name}`, 'info');
    }
  };

  useEffect(() => {
    localStorage.setItem('bilibili_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('bilibili_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('bilibili_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('bilibili_buyers', JSON.stringify(buyers));
  }, [buyers]);

  useEffect(() => {
    localStorage.setItem('bilibili_commodities', JSON.stringify(commodities));
  }, [commodities]);

  useEffect(() => {
    localStorage.setItem('bilibili_rice_stock_v2', JSON.stringify(riceStockRecords));
  }, [riceStockRecords]);

  useEffect(() => {
    localStorage.setItem('bilibili_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('bilibili_brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('bilibili_locations', JSON.stringify(locations));
  }, [locations]);

  // --- COMPONENT ACTION CALLBACKS ---
  const handleAddTicket = (tk: WeighbridgeTicket) => {
    setTickets(prev => [tk, ...prev]);
    showToast(`${t.saveWeighbridgeSuccess} (#${tk.ticketNo} - ${tk.policeNo})!`, 'success');
  };

  const handleUpdateTicket = (updatedTk: WeighbridgeTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTk.id ? updatedTk : t));
    const isComp = updatedTk.status === 'COMPLETED';
    showToast(
      isComp 
        ? `${t.completedStatus} (#${updatedTk.ticketNo} - ${updatedTk.policeNo}).`
        : `${t.updateWeighbridgeSuccess} (#${updatedTk.ticketNo} - ${updatedTk.policeNo})!`, 
      'success'
    );
  };

  const handleDeleteTicket = (id: string) => {
    const target = tickets.find(t => t.id === id);
    const label = target ? `#${target.ticketNo}` : '';
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast(`${t.deleteWeighbridgeSuccess} ${label}!`, 'success');
  };

  const handleAddInbound = (rec: InboundRecord) => {
    setInboundRecords(prev => [rec, ...prev]);
    
    // Auto-update Rice Stock
    const newStock: RiceStockRecord = {
      id: `stock-${Date.now()}`,
      date: rec.date,
      policeNo: rec.vehicleNo,
      description: `Penerimaan ${rec.commodity} dari ${rec.supplier}`,
      itemName: rec.commodity,
      price: rec.price,
      colly: 0,
      inWeight: rec.netWeight,
      outWeight: 0,
    };
    setRiceStockRecords(prev => [newStock, ...prev]);
    
    showToast(`Sukses menyimpan: Penerimaan ${rec.commodity} dari ${rec.supplier} (${rec.netWeight.toLocaleString('id-ID')} Kg Netto)!`, 'success');
  };

  const handleUpdateInbound = (rec: InboundRecord) => {
    setInboundRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    showToast(`Sukses memperbarui catatan penerimaan ${rec.commodity} dari ${rec.supplier}!`, 'success');
  };

  const handleDeleteInbound = (id: string) => {
    setInboundRecords(prev => prev.filter(r => r.id !== id));
    showToast('Catatan barang masuk berhasil dihapus!', 'success');
  };

  const handleAddOutbound = (rec: OutboundRecord) => {
    setOutboundRecords(prev => [rec, ...prev]);

    // Auto-update Rice Stock
    const newStock: RiceStockRecord = {
      id: `stock-${Date.now()}`,
      date: rec.date,
      policeNo: rec.vehicleNo,
      description: `Pengiriman ${rec.commodity} ke ${rec.buyer}`,
      itemName: rec.commodity,
      price: 0, // Outbound price not stored in outbound record directly, could be inferred
      colly: 0,
      inWeight: 0,
      outWeight: rec.totalWeight,
    };
    setRiceStockRecords(prev => [newStock, ...prev]);

    showToast(`Sukses menyimpan: Pengiriman ${rec.commodity} ke ${rec.buyer} (${rec.totalWeight.toLocaleString('id-ID')} Kg Netto)!`, 'success');
  };

  const handleUpdateOutbound = (rec: OutboundRecord) => {
    setOutboundRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    showToast(`Sukses memperbarui catatan pengiriman ${rec.commodity} ke ${rec.buyer}!`, 'success');
  };

  const handleDeleteOutbound = (id: string) => {
    setOutboundRecords(prev => prev.filter(r => r.id !== id));
    showToast('Catatan barang keluar berhasil dihapus!', 'success');
  };

  const handleAddService = (rec: ServiceRecord) => {
    setServiceRecords(prev => [rec, ...prev]);
    showToast(`Sukses mencatatkan layanan jasa poles/kipas untuk ${rec.customerName}!`, 'success');
  };

  const handleUpdateService = (rec: ServiceRecord) => {
    setServiceRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    showToast(`Sukses memperbarui layanan jasa poles/kipas untuk ${rec.customerName}!`, 'success');
  };

  const handleDeleteService = (id: string) => {
    setServiceRecords(prev => prev.filter(r => r.id !== id));
    showToast('Catatan layanan jasa poles berhasil dihapus!', 'success');
  };

  const handleAddDebt = (debt: DebtRecord) => {
    setDebts(prev => [debt, ...prev]);
    showToast(`Sukses mencatatkan utang kepada ${debt.supplierName} sebesar Rp ${debt.totalDebt.toLocaleString('id-ID')}!`, 'success');
  };

  const handleUpdateDebt = (debt: DebtRecord) => {
    setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
    showToast(`Sukses memperbarui catatan utang kepada ${debt.supplierName}!`, 'success');
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    showToast('Catatan utang berhasil dihapus!', 'success');
  };

  const handlePayDebt = (id: string, amount: number) => {
    const target = debts.find(d => d.id === id);
    const supplier = target ? target.supplierName : 'Supplier';
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
        setFinances(prev => [newFin, ...prev]);

        return { ...d, paidAmount: paid, remainingBalance: remaining, status };
      }
      return d;
    }));
    showToast(`Pembayaran cicilan utang kepada ${supplier} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`, 'success');
  };

  const handleAddFinance = (fin: FinancialRecord) => {
    setFinances(prev => [fin, ...prev]);
    showToast(`Mutasi kas ${fin.type === 'DEBIT' ? 'Pemasukan' : 'Pengeluaran'} Rp ${fin.amount.toLocaleString('id-ID')} berhasil disimpan!`, 'success');
  };

  const handleUpdateFinance = (fin: FinancialRecord) => {
    setFinances(prev => prev.map(f => f.id === fin.id ? fin : f));
    showToast(`Mutasi kas ${fin.description} berhasil diperbarui!`, 'success');
  };

  const handleDeleteFinance = (id: string) => {
    setFinances(prev => prev.filter(f => f.id !== id));
    showToast('Catatan mutasi kas berhasil dihapus!', 'success');
  };

  const handleAddRiceStock = (rec: RiceStockRecord) => {
    setRiceStockRecords(prev => [rec, ...prev]);
    showToast(t.successSaveStock, 'success');
  };

  const handleUpdateRiceStock = (rec: RiceStockRecord) => {
    setRiceStockRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    showToast(t.successUpdateStock, 'success');
  };

  const handleDeleteRiceStock = (id: string) => {
    setRiceStockRecords(prev => prev.filter(r => r.id !== id));
    showToast(t.deleteSuccessGeneral, 'success');
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
    <div className={`h-screen ${theme.pageBg} text-neutral-800 font-sans flex flex-col transition-colors duration-300`}>
      
      {/* GLOBAL WAREHOUSE HEADER BAR */}
      <header className={`text-white shadow-md border-b sticky top-0 z-40 transition-all duration-300 ${theme.headerBg} ${theme.headerBorder}`}>
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
                {t.warehouseHeader}
                <span className={`text-[10px] border rounded px-1.5 py-0.5 font-bold transition-all duration-300 ${theme.headerBadgeBg} ${theme.headerBadgeText} ${theme.headerBadgeBorder}`}>
                  {t.centralWarehouse}
                </span>
              </h1>
              <p className="text-[10px] opacity-80 font-mono">
                {t.systemStatus}
              </p>
            </div>
          </div>

          {/* Time, Active status & Visual Theme Switcher */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs font-sans">
            
            {/* Real-time clock & Date */}
            <div className={`hidden sm:flex px-3 py-1.5 rounded border items-center gap-2 font-mono text-[11px] transition-all duration-300 ${theme.statusBoxBg} ${theme.statusBoxBorder}`}>
              <Clock className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[9px] opacity-70 uppercase tracking-tighter">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="font-bold">{currentTime.toLocaleTimeString('id-US', { hour12: false })} WITA</span>
              </div>
            </div>

            {/* Premium Theme Selector Picker Dropdown */}
            <div className="relative flex items-center gap-1">
              <span className="text-[10px] text-white/70 font-bold font-mono tracking-wider mr-1 hidden lg:inline">{t.theme}:</span>
              <select
                value={activeThemeId}
                onChange={(e) => handleThemeChange(e.target.value)}
                className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer shadow-sm ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:brightness-110`}
              >
                {APP_THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="text-neutral-900 font-bold font-sans">
                    {t.emoji} {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="relative flex items-center gap-1">
              <span className="text-[10px] text-white/70 font-bold font-mono tracking-wider mr-1 hidden lg:inline">LANG:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer shadow-sm ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:brightness-110`}
              >
                <option value="id" className="text-neutral-900 font-bold font-sans">🇮🇩 ID</option>
                <option value="en" className="text-neutral-900 font-bold font-sans">🇺🇸 EN</option>
              </select>
            </div>

            {/* Printer Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-1.5 rounded-lg border transition-all ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:text-yellow-300`}
              title="Setting Printer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Active connection point */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-emerald-250">
              <span className="text-white/60">STATUS:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                {t.online}
              </span>
            </div>

          </div>

        </div>
      </header>

      {/* --- SETTINGS MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" /> {t.printerSettings}
            </h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700">{t.printerNameLabel}</label>
              <input 
                value={printerName} 
                onChange={(e) => setPrinterName(e.target.value)}
                className="w-full border p-2 rounded-lg text-sm"
              />
              <p className="text-[10px] text-neutral-500 italic">
                {t.printerNotice}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                {t.saveAndClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABS SELECTOR RAILS */}
      <div className="bg-white border-b border-neutral-200 shadow-sm sticky top-[69px] z-30 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 flex">
          
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'DASHBOARD' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            1. {t.dashboard}
          </button>
 
          <button
            onClick={() => setActiveTab('TIMBANG')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'TIMBANG' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg} shadow-sm` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-500" />
            2. {t.weighbridge}
          </button>
 
          <button
            onClick={() => setActiveTab('MASUK')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'MASUK' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
            3. {t.inbound}
          </button>
 
          <button
            onClick={() => setActiveTab('KELUAR')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'KELUAR' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-600" />
            4. {t.outbound}
          </button>
 
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'SERVICES' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-500" />
            5. {t.services}
          </button>
 
          <button
            onClick={() => setActiveTab('REFAKSI')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'REFAKSI' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Percent className="w-4 h-4 text-amber-500" />
            6. {t.moisture}
          </button>
 
          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'FINANCE' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            7. {t.finance}
          </button>
 
          <button
            onClick={() => setActiveTab('STOK_BERAS')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'STOK_BERAS' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            8. {t.riceStock}
          </button>
 
          <button
            onClick={() => setActiveTab('LAPORAN')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'LAPORAN' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            9. {t.reports}
          </button>
 
          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`px-5 py-3.5 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'DATABASE' 
                ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` 
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Database className="w-4 h-4 text-rose-500" />
            10. {t.database}
          </button>

        </div>
      </div>

      {/* CORE WORKSPACE PORTALS */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full overflow-y-auto">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="flex flex-col gap-8">
            
            {/* Hero Brand Welcome Banner */}
            <div className={`bg-gradient-to-r ${theme.heroGradient} text-white rounded-2xl p-6 shadow-md border ${theme.headerBorder} flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative transition-all duration-300`}>
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
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
                  <h2 className={`text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.heroTextGradient} tracking-tight transition-all duration-300`}>
                    {t.warehouseHeader} - {t.gudangBilibili}
                  </h2>
                  <p className="text-sm text-white/90 font-medium mt-1">
                    {t.systemStatus}
                  </p>
                  <p className="text-xs text-white/70 font-mono mt-2 flex items-center justify-center md:justify-start gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {t.pinrangLocation}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap justify-center z-10">
                <button
                  onClick={() => setActiveTab('TIMBANG')}
                  className="bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md cursor-pointer hover:bg-emerald-600"
                >
                  {t.newWeighing}
                </button>
                <button
                  onClick={() => setActiveTab('FINANCE')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                >
                  {t.cashMutation}
                </button>
              </div>
            </div>
            
            {/* Realtime stock metric grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Corn Stock */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">{t.cornStock}</span>
                  <span className="text-2xl font-black text-amber-650 font-mono tracking-tight">
                    {cornStockBalance.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} <span className="text-xs text-neutral-400">{t.kgNetto}</span>
                  </span>
                  <span className="text-[9px] text-[#2ebd1d]">In: {totalInboundCorn.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} | Out: {totalOutboundCorn.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</span>
                </div>
                <div className="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                  <Package className="text-amber-500 w-5 h-5" />
                </div>
              </div>

              {/* Rice Stock */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">{t.riceStockLabel}</span>
                  <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
                    {riceStockBalance.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} <span className="text-xs text-neutral-400">{t.kgNetto}</span>
                  </span>
                  <span className="text-[9px] text-neutral-500">In: {totalInboundRice.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} | Out: {totalOutboundRice.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</span>
                </div>
                <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                  <Package className="text-emerald-600 w-5 h-5" />
                </div>
              </div>

              {/* Total Jasa Pipil / Poles */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">{t.totalServiceBilling}</span>
                  <span className="text-xl font-bold text-sky-700 font-mono tracking-tight">
                    Rp {totalServiceFeePaid.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                  </span>
                  <span className="text-[10px] text-red-500 font-bold">{t.unpaid}: Rp {totalServiceFeeUnpaid.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</span>
                </div>
                <div className="w-11 h-11 bg-sky-50 rounded-lg flex items-center justify-center border border-sky-100">
                  <Wind className="text-sky-500 w-5 h-5" />
                </div>
              </div>

              {/* Cash Mutasi Balance */}
              <div className="bg-white border border-neutral-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono">{t.cashBalance}</span>
                  <span className={`text-xl font-black font-mono tracking-tight ${netKasBalance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    Rp {netKasBalance.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                  </span>
                  <span className="text-[10px] text-neutral-500">{t.supplierDebt}: Rp {totalOutstandingDebts.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</span>
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
                    <span className="font-bold text-xs text-[#0a2345] uppercase">{t.weighbridge}</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {t.truckWeighbridgeDesc}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('TIMBANG')}
                  className="mt-6 bg-[#0a2245] hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <Truck className="w-4 h-4" />
                  {t.openWeighbridge}
                </button>
              </div>

              {/* Column 2: Inbound links */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                    <div className="p-1 rounded bg-emerald-50 text-emerald-700">
                      <ArrowDownCircle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-emerald-800 uppercase">1. {t.inbound}</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {t.inboundDesc}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('MASUK')}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  {t.recordInbound}
                </button>
              </div>

              {/* Column 3: Processing link */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-between block">
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-100 pb-2">
                    <div className="p-1 rounded bg-sky-50 text-sky-700">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-sky-800 uppercase">3. {t.services}</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {t.processingDesc}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('SERVICES')}
                  className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <Wind className="w-3.5 h-3.5" />
                  {t.openServices}
                </button>
              </div>

            </div>

            {/* Recent weighing transactions timeline */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-neutral-800 text-sm mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2">
                <Clock className="text-emerald-600 w-5 h-5" />
                {t.weighingQueueTitle} ({new Date().toISOString().split('T')[0]})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-600">
                  <thead className="bg-[#122345] text-[#afcbff] font-mono tracking-wider font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">{t.ticketNo}</th>
                      <th className="py-2.5 px-3">{t.policeNo}</th>
                      <th className="py-2.5 px-3">{t.goods}</th>
                      <th className="py-2.5 px-3">{t.supplierOrMitra}</th>
                      <th className="py-2.5 px-3 text-right">{t.weighing1Gross}</th>
                      <th className="py-2.5 px-3 text-right">{t.weighing2Tare}</th>
                      <th className="py-2.5 px-3 text-right">{t.netWeightDashboard}</th>
                      <th className="py-2.5 px-3 text-center">{t.status}</th>
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
                        <td className="text-right py-2.5 px-3 font-mono">{tk.timbang1Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg</td>
                        <td className="text-right py-2.5 px-3 font-mono text-orange-600 font-semibold">
                          {tk.timbang2Weight > 0 ? `${tk.timbang2Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg` : '- -'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-black text-emerald-600 font-mono">
                          {tk.netWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tk.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'
                          }`}>
                            {tk.status === 'COMPLETED' ? t.completedStatus : t.waitingStatus}
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
                  {t.viewAllArchives} <ChevronRight className="w-4 h-4" />
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
            vehicles={vehicles}
            buyers={buyers}
            suppliers={suppliers}
          />
        )}

        {/* VIEW 3: BARANG MASUK */}
        {activeTab === 'MASUK' && (
          <InboundModule
            records={inboundRecords}
            tickets={tickets}
            onAddRecord={handleAddInbound}
            onUpdateRecord={handleUpdateInbound}
            onDeleteRecord={handleDeleteInbound}
            vehicles={vehicles}
            suppliers={suppliers}
          />
        )}

        {/* VIEW 4: BARANG KELUAR */}
        {activeTab === 'KELUAR' && (
          <OutboundModule
            records={outboundRecords}
            tickets={tickets}
            onAddRecord={handleAddOutbound}
            onUpdateRecord={handleUpdateOutbound}
            onDeleteRecord={handleDeleteOutbound}
            vehicles={vehicles}
            buyers={buyers}
          />
        )}

        {/* VIEW 5: SERVICES LOGS */}
        {activeTab === 'SERVICES' && (
          <ServicesModule
            records={serviceRecords}
            onAddRecord={handleAddService}
            onUpdateRecord={handleUpdateService}
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
            onUpdateDebt={handleUpdateDebt}
            onDeleteDebt={handleDeleteDebt}
            onPayDebt={handlePayDebt}
            onAddFinance={handleAddFinance}
            onUpdateFinance={handleUpdateFinance}
            onDeleteFinance={handleDeleteFinance}
          />
        )}

        {/* VIEW 8: LAPORAN TERPADU */}
        {activeTab === 'LAPORAN' && (
          <ReportsModule
            tickets={tickets}
            inboundRecords={inboundRecords}
            outboundRecords={outboundRecords}
            serviceRecords={serviceRecords}
            debts={debts}
            finances={finances}
          />
        )}

        {/* VIEW 9: DATABASE MASTER */}
        {activeTab === 'DATABASE' && (
          <DatabaseMasterModule
            vehicles={vehicles}
            setVehicles={setVehicles}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            buyers={buyers}
            setBuyers={setBuyers}
            employees={employees}
            setEmployees={setEmployees}
            commodities={commodities}
            setCommodities={setCommodities}
            banks={banks}
            setBanks={setBanks}
            brokers={brokers}
            setBrokers={setBrokers}
            locations={locations}
            setLocations={setLocations}
          />
        )}

        {/* VIEW 10: STOK BERAS */}
        {activeTab === 'STOK_BERAS' && (
          <RiceStockModule
            records={riceStockRecords}
            onAddRecord={handleAddRiceStock}
            onUpdateRecord={handleUpdateRiceStock}
            onDeleteRecord={handleDeleteRiceStock}
          />
        )}

      </main>

      {/* FOOTER METADATA */}
      <footer className={`py-6 border-t text-xs mt-auto transition-colors duration-300 ${theme.footerBg} ${theme.footerBorder} text-neutral-400`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center text-center">
          <p className="font-bold text-neutral-300">Aplikasi Pergudangan Terpadu US Bilibili 162</p>
        </div>
      </footer>

      {/* GLOBAL TOAST NOTIFICATION FLOATING PANEL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none font-sans">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgStyle = "bg-white border-neutral-200 shadow-xl text-neutral-800";
            let iconColor = "text-emerald-500 bg-emerald-50";
            let progressColor = "bg-emerald-500";
            let IconComponent = CheckCircle;

            if (toast.type === 'error') {
              bgStyle = "bg-red-50 border-red-200 shadow-red-100/30 shadow-lg text-red-950";
              iconColor = "text-red-650 bg-red-100/80";
              progressColor = "bg-red-500";
              IconComponent = AlertCircle;
            } else if (toast.type === 'warning') {
              bgStyle = "bg-amber-50 border-amber-200 shadow-amber-100/30 shadow-lg text-amber-950";
              iconColor = "text-amber-650 bg-amber-100/85";
              progressColor = "bg-amber-500";
              IconComponent = AlertCircle;
            } else if (toast.type === 'info') {
              bgStyle = "bg-blue-50 border-blue-200 shadow-blue-100/30 shadow-lg text-blue-950";
              iconColor = "text-blue-650 bg-blue-100/85";
              progressColor = "bg-blue-500";
              IconComponent = Clock;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto flex items-start gap-3 border rounded-xl p-4 relative overflow-hidden transition-all duration-200 ${bgStyle}`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${iconColor}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-extrabold leading-tight tracking-tight uppercase opacity-55 font-mono">
                    {toast.type === 'success' ? t.successToast : toast.type === 'error' ? t.errorToast : toast.type === 'warning' ? t.warningToast : t.infoToast}
                  </p>
                  <p className="text-xs leading-normal mt-1 text-neutral-800 font-bold font-sans break-words whitespace-pre-wrap">
                    {toast.message}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveToast(toast.id)}
                  className="text-neutral-400 hover:text-neutral-600 transition p-1 rounded-md -mr-1.5 -mt-1 hover:bg-neutral-100/50"
                >
                  <span className="text-lg font-bold leading-none select-none block">&times;</span>
                </button>

                {/* Shrinking bottom progress ribbon */}
                <div 
                  className={`absolute bottom-0 left-0 h-1 animate-shrink ${progressColor}`}
                  style={{ animationDuration: `${toast.duration}ms` }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
