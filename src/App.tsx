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
  LocationRecord,
  CustomerRecord,
  FinanceCategoryRecord,
  LaborRateRecord,
  CornMoistureRule,
  ProductRecord,
  UserAccount,
  ActivityLog,
  LaborKasbonRecord
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
  initialStorageLocations,
  initialCustomers,
  initialFinanceCategories,
  initialLaborRates,
  initialCornMoistureRules,
  initialProducts,
  initialDryerRecords,
  initialKasbonRecords
} from './data';

// Import our modular subcomponents
import WeighbridgeModule from './components/WeighbridgeModule';
import InboundModule from './components/InboundModule';
import OutboundModule from './components/OutboundModule';
import ServicesModule from './components/ServicesModule';
import MoistureRefaksiModule from './components/MoistureRefaksiModule';
import DryerModule, { DryerRecord } from './components/DryerModule';
import FinanceModule from './components/FinanceModule';
import ReportsModule from './components/ReportsModule';
import ProductModule from './components/ProductModule';
import DashboardProductShowcase from './components/DashboardProductShowcase';
import DatabaseMasterModule from './components/DatabaseMasterModule';
import RiceStockModule from './components/RiceStockModule';
import { useLanguage } from './i18n/LanguageContext';

// Custom Firebase Live Dynamic Sync Helpers
import { useSyncCollection, saveOnline, deleteOnline } from './utils/firebaseSync';
import { auth, signInWithGoogle } from './utils/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

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
  Lock,
  Shield,
  Key,
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
  Calendar,
  Activity,
  TrendingDown,
  Cloud,
  CloudOff,
  RefreshCw,
  Layout,
  Printer,
  Palette,
  X,
  ChevronLeft,
  Menu,
  LogOut,
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
    const parsed: DebtRecord[] = saved ? JSON.parse(saved) : initialDebtRecords;
    const seen = new Set();
    return parsed.filter(d => {
      if (!d || !d.id || seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  });

  const [finances, setFinances] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_finances');
    const parsed: FinancialRecord[] = saved ? JSON.parse(saved) : initialFinancialRecords;
    const seen = new Set();
    return parsed.filter(f => {
      if (!f || !f.id || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
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

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [financeCategories, setFinanceCategories] = useState<FinanceCategoryRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_finance_categories');
    return saved ? JSON.parse(saved) : initialFinanceCategories;
  });

  const [laborRates, setLaborRates] = useState<LaborRateRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_labor_rates');
    return saved ? JSON.parse(saved) : initialLaborRates;
  });

  const [cornMoistureRules, setCornMoistureRules] = useState<CornMoistureRule[]>(() => {
    const saved = localStorage.getItem('bilibili_corn_rules');
    return saved ? JSON.parse(saved) : initialCornMoistureRules;
  });

  const [products, setProducts] = useState<ProductRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });


  const [dryerRecords, setDryerRecords] = useState<DryerRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_dryer_records');
    return saved ? JSON.parse(saved) : initialDryerRecords;
  });

  const [kasbons, setKasbons] = useState<LaborKasbonRecord[]>(() => {
    const saved = localStorage.getItem('bilibili_kasbons');
    const parsed: LaborKasbonRecord[] = saved ? JSON.parse(saved) : initialKasbonRecords;
    const seen = new Set();
    return parsed.filter(kb => {
      if (!kb || !kb.id || seen.has(kb.id)) return false;
      seen.add(kb.id);
      return true;
    });
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('bilibili_users');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'u1', username: 'admin', role: 'admin', fullName: 'Administrator Utama', isActive: true },
      { id: 'u2', username: 'pimpinan', role: 'pimpinan', fullName: 'Direktur Utama', isActive: true },
      { id: 'u3', username: 'operator', role: 'operator', fullName: 'Operator Timbangan', isActive: true },
      { id: 'u4', username: 'karyawan', role: 'karyawan', fullName: 'Staf Administrasi', isActive: true },
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('bilibili_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // --- GOOGLE AUTHENTICATION STATE & EVENTS ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'saving' | 'synced' | 'error'>('synced');

  useEffect(() => {
    const handleSyncStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<'saving' | 'synced' | 'error'>;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('firebase-sync-state', handleSyncStateChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('firebase-sync-state', handleSyncStateChange);
      }
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      showToast("Sukses Login Google! Sinkronisasi siap.", "success");
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') {
        showToast("Login Google dibatalkan.", "info");
      } else {
        showToast("Gagal Login Google", "error");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Berhasil Logout Session", "success");
    } catch (e) {
      showToast("Gagal Logout", "error");
    }
  };

  // --- REAL-TIME DATA SYNCHRONIZATION VIA FIREBASE STREAMS ---
  useSyncCollection('tickets', tickets, setTickets, initialWeighbridgeTickets);
  useSyncCollection('inboundRecords', inboundRecords, setInboundRecords, initialInboundRecords);
  useSyncCollection('outboundRecords', outboundRecords, setOutboundRecords, initialOutboundRecords);
  useSyncCollection('serviceRecords', serviceRecords, setServiceRecords, initialServiceRecords);
  useSyncCollection('debts', debts, setDebts, initialDebtRecords);
  useSyncCollection('finances', finances, setFinances, initialFinancialRecords);
  useSyncCollection('employees', employees, setEmployees, initialEmployeeRecords);
  useSyncCollection('vehicles', vehicles, setVehicles, initialVehicles);
  useSyncCollection('suppliers', suppliers, setSuppliers, initialSuppliers);
  useSyncCollection('buyers', buyers, setBuyers, initialBuyers);
  useSyncCollection('commodities', commodities, setCommodities, initialCommodities);
  useSyncCollection('riceStockRecords', riceStockRecords, setRiceStockRecords, initialRiceStockRecords);
  useSyncCollection('banks', banks, setBanks, initialBankAccounts);
  useSyncCollection('brokers', brokers, setBrokers, initialBrokers);
  useSyncCollection('locations', locations, setLocations, initialStorageLocations);
  useSyncCollection('customers', customers, setCustomers, initialCustomers);
  useSyncCollection('financeCategories', financeCategories, setFinanceCategories, initialFinanceCategories);
  useSyncCollection('laborRates', laborRates, setLaborRates, initialLaborRates);
  useSyncCollection('cornMoistureRules', cornMoistureRules, setCornMoistureRules, initialCornMoistureRules);
  useSyncCollection('products', products, setProducts, initialProducts);
  useSyncCollection('dryerRecords', dryerRecords, setDryerRecords, initialDryerRecords);
  useSyncCollection('kasbons', kasbons, setKasbons, initialKasbonRecords);

  // --- AUTOMATIC TONO SEEDING EFFECT FOR DATABASE SIMULATION ---
  React.useEffect(() => {
    // Only proceed once collections have finished their initial local loading
    if (inboundRecords.length > 0) {
      const hasTono = inboundRecords.some(r => r.id === 'inbound-tono-1');
      if (!hasTono) {
        const tRecord = {
          id: "inbound-tono-1",
          date: "2026-06-10",
          ticketNo: "021234",
          vehicleNo: "DP 8242 RZ",
          supplier: "TONO",
          commodity: "JAGUNG",
          grossWeight: 2860,
          tareWeight: 1050,
          refaksiKaPercent: 16.5,
          bagDeductionPercent: 0.00,
          netWeight: 1511,
          moistureContent: 28.4,
          warehouseSection: "Gudang Jagung Tengah",
          laborCost: 54300,
          driverName: "TONO",
          price: 5500,
          totalPrice: 8256200
        };
        setInboundRecords(prev => {
          if (prev.some(r => r.id === tRecord.id)) return prev;
          return [tRecord, ...prev];
        });
        saveOnline('inboundRecords', tRecord);
      }
    }

    if (tickets.length > 0) {
      const hasTonoTicket = tickets.some(t => t.id === 'ticket-tono-1');
      if (!hasTonoTicket) {
        const tTicket = {
          id: "ticket-tono-1",
          ticketNo: "021234",
          policeNo: "DP 8242 RZ",
          goodsName: "JAGUNG",
          agency: "TONO",
          timbang1Time: "10-06-2026 15:07:00",
          timbang1Weight: 2860,
          timbang2Time: "10-06-2026 15:07:00",
          timbang2Weight: 1050,
          grossWeight: 2860,
          tareWeight: 1050,
          bagDeductionPercent: 0.00,
          refaksiPercent: 16.50,
          netWeight: 1511,
          status: "COMPLETED",
          notes: "Jagung Pipil KA 28.4%"
        };
        setTickets(prev => {
          if (prev.some(t => t.id === tTicket.id)) return prev;
          return [tTicket, ...prev];
        });
        saveOnline('tickets', tTicket);
      }
    }
  }, [inboundRecords.length, tickets.length]);

  // --- AUTOMATIC FIRESTORE DATABASE DEDUPLICATION & INTEGRITY CLEANER ---
  const hasDeduplicated = React.useRef(false);

  React.useEffect(() => {
    // Only run if collections have finished initial loading
    if (hasDeduplicated.current) return;
    if (inboundRecords.length === 0 && outboundRecords.length === 0 && riceStockRecords.length === 0) return;

    hasDeduplicated.current = true;

    const performDeduplication = async () => {
      console.log("[DataIntegrity] Initiating automatic data deduplication and sync check...");

      // 1. Clean up "stock-" prefixed riceStockRecords because they are now dynamically generated in the UI
      const legacyStockRecords = riceStockRecords.filter(r => r.id.startsWith('stock-'));
      if (legacyStockRecords.length > 0) {
        console.log(`[DataIntegrity] Found ${legacyStockRecords.length} legacy auto-generated stock records. Removing to prevent duplication...`);
        for (const r of legacyStockRecords) {
          try {
            await deleteOnline('riceStockRecords', r.id);
          } catch (e) {
            console.error(`[DataIntegrity] Failed to delete legacy stock record ${r.id}:`, e);
          }
        }
        setRiceStockRecords(prev => prev.filter(r => !r.id.startsWith('stock-')));
      }

      // 2. Deduplicate inboundRecords
      const uniqueInbounds: typeof inboundRecords = [];
      const inboundDuplicatesToRemove: string[] = [];

      inboundRecords.forEach(rec => {
        // Skip seeds/presets or incomplete
        if (!rec.id || !rec.date || !rec.vehicleNo) return;

        const isDup = uniqueInbounds.some(u => 
          u.date === rec.date &&
          u.vehicleNo.trim().toUpperCase() === rec.vehicleNo.trim().toUpperCase() &&
          (u.supplier || '').trim().toUpperCase() === (rec.supplier || '').trim().toUpperCase() &&
          u.commodity === rec.commodity &&
          u.netWeight === rec.netWeight &&
          u.grossWeight === rec.grossWeight
        );

        if (isDup) {
          inboundDuplicatesToRemove.push(rec.id);
        } else {
          uniqueInbounds.push(rec);
        }
      });

      if (inboundDuplicatesToRemove.length > 0) {
        console.log(`[DataIntegrity] Found ${inboundDuplicatesToRemove.length} duplicate inbound records. Removing from Firestore...`);
        for (const id of inboundDuplicatesToRemove) {
          try {
            await deleteOnline('inboundRecords', id);
          } catch (e) {
            console.error(`[DataIntegrity] Failed to delete duplicate inbound ${id}:`, e);
          }
        }
        setInboundRecords(prev => prev.filter(r => !inboundDuplicatesToRemove.includes(r.id)));
      }

      // 3. Deduplicate outboundRecords
      const uniqueOutbounds: typeof outboundRecords = [];
      const outboundDuplicatesToRemove: string[] = [];

      outboundRecords.forEach(rec => {
        if (!rec.id || !rec.date || !rec.vehicleNo) return;

        const isDup = uniqueOutbounds.some(u => 
          u.date === rec.date &&
          u.vehicleNo.trim().toUpperCase() === rec.vehicleNo.trim().toUpperCase() &&
          (u.buyer || '').trim().toUpperCase() === (rec.buyer || '').trim().toUpperCase() &&
          u.commodity === rec.commodity &&
          u.totalWeight === rec.totalWeight
        );

        if (isDup) {
          outboundDuplicatesToRemove.push(rec.id);
        } else {
          uniqueOutbounds.push(rec);
        }
      });

      if (outboundDuplicatesToRemove.length > 0) {
        console.log(`[DataIntegrity] Found ${outboundDuplicatesToRemove.length} duplicate outbound records. Removing from Firestore...`);
        for (const id of outboundDuplicatesToRemove) {
          try {
            await deleteOnline('outboundRecords', id);
          } catch (e) {
            console.error(`[DataIntegrity] Failed to delete duplicate outbound ${id}:`, e);
          }
        }
        setOutboundRecords(prev => prev.filter(r => !outboundDuplicatesToRemove.includes(r.id)));
      }

      // 4. Deduplicate manual riceStockRecords (non-legacy)
      const uniqueStocks: typeof riceStockRecords = [];
      const stockDuplicatesToRemove: string[] = [];

      riceStockRecords.forEach(rec => {
        if (rec.id.startsWith('stock-')) return; // already handled
        if (!rec.id || !rec.date) return;

        // Rule A: Check if it is a duplicate of another manual stock record
        const isDupOfManual = uniqueStocks.some(u => 
          u.date === rec.date &&
          (u.policeNo || '').trim().toUpperCase() === (rec.policeNo || '').trim().toUpperCase() &&
          (u.description || '').trim().toUpperCase() === (rec.description || '').trim().toUpperCase() &&
          (u.itemName || u.commodity) === (rec.itemName || rec.commodity) &&
          u.inWeight === rec.inWeight &&
          u.outWeight === rec.outWeight
        );

        // Rule B: Check if it is a duplicate of an existing system Inbound record (same date, same plate, same net weight)
        const isDupOfSystemInbound = (inboundRecords || []).some(inb => 
          inb.date === rec.date &&
          (inb.vehicleNo || '').trim().toUpperCase() === (rec.policeNo || '').trim().toUpperCase() &&
          inb.netWeight === rec.inWeight &&
          rec.inWeight > 0
        );

        // Rule C: Check if it is a duplicate of an existing system Outbound record (same date, same plate, same total weight)
        const isDupOfSystemOutbound = (outboundRecords || []).some(outb => 
          outb.date === rec.date &&
          (outb.vehicleNo || '').trim().toUpperCase() === (rec.policeNo || '').trim().toUpperCase() &&
          outb.totalWeight === rec.outWeight &&
          rec.outWeight > 0
        );

        if (isDupOfManual || isDupOfSystemInbound || isDupOfSystemOutbound) {
          stockDuplicatesToRemove.push(rec.id);
        } else {
          uniqueStocks.push(rec);
        }
      });

      if (stockDuplicatesToRemove.length > 0) {
        console.log(`[DataIntegrity] Found ${stockDuplicatesToRemove.length} duplicate/redundant manual stock records. Removing from Firestore...`);
        for (const id of stockDuplicatesToRemove) {
          try {
            await deleteOnline('riceStockRecords', id);
          } catch (e) {
            console.error(`[DataIntegrity] Failed to delete duplicate stock record ${id}:`, e);
          }
        }
        setRiceStockRecords(prev => prev.filter(r => !stockDuplicatesToRemove.includes(r.id)));
      }

      // 5. Deduplicate weighbridge tickets
      const uniqueTickets: typeof tickets = [];
      const ticketDuplicatesToRemove: string[] = [];

      tickets.forEach(rec => {
        if (!rec.id || !rec.ticketNo) return;

        const isDup = uniqueTickets.some(u => 
          u.ticketNo === rec.ticketNo &&
          (u.policeNo || '').trim().toUpperCase() === (rec.policeNo || '').trim().toUpperCase() &&
          u.netWeight === rec.netWeight &&
          u.goodsName === rec.goodsName
        );

        if (isDup) {
          ticketDuplicatesToRemove.push(rec.id);
        } else {
          uniqueTickets.push(rec);
        }
      });

      if (ticketDuplicatesToRemove.length > 0) {
        console.log(`[DataIntegrity] Found ${ticketDuplicatesToRemove.length} duplicate weighbridge tickets. Removing from Firestore...`);
        for (const id of ticketDuplicatesToRemove) {
          try {
            await deleteOnline('tickets', id);
          } catch (e) {
            console.error(`[DataIntegrity] Failed to delete duplicate ticket ${id}:`, e);
          }
        }
        setTickets(prev => prev.filter(r => !ticketDuplicatesToRemove.includes(r.id)));
      }
    };

    performDeduplication();
  }, [inboundRecords, outboundRecords, riceStockRecords, tickets]);

  // --- SYNCHRONIZED MASTER SETTERS WRAPPER ---
  const createSyncedSetter = <T extends { id: string }>(
    collectionName: string,
    setLocal: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return (update: T[] | ((prev: T[]) => T[])) => {
      setLocal((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        
        // 0. Persist to localStorage for offline reliability
        localStorage.setItem(`bilibili_${collectionName}`, JSON.stringify(next));

        // 1. Save new or edited docs
        next.forEach(newItem => {
          const oldItem = prev.find(p => p.id === newItem.id);
          if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            saveOnline(collectionName, newItem);
          }
        });
        
        // 2. Remove deleted docs
        prev.forEach(oldItem => {
          const exists = next.some(n => n.id === oldItem.id);
          if (!exists) {
            deleteOnline(collectionName, oldItem.id);
          }
        });

        return next;
      });
    };
  };

  const syncedSetVehicles = createSyncedSetter('vehicles', setVehicles);
  const syncedSetProducts = createSyncedSetter('products', setProducts);
  const syncedSetSuppliers = createSyncedSetter('suppliers', setSuppliers);
  const syncedSetBuyers = createSyncedSetter('buyers', setBuyers);
  const syncedSetEmployees = createSyncedSetter('employees', setEmployees);
  const syncedSetCommodities = createSyncedSetter('commodities', setCommodities);
  const syncedSetBanks = createSyncedSetter('banks', setBanks);
  const syncedSetBrokers = createSyncedSetter('brokers', setBrokers);
  const syncedSetLocations = createSyncedSetter('locations', setLocations);
  const syncedSetCustomers = createSyncedSetter('customers', setCustomers);
  const syncedSetFinanceCategories = createSyncedSetter('financeCategories', setFinanceCategories);
  const syncedSetLaborRates = createSyncedSetter('laborRates', setLaborRates);
  const syncedSetCornMoistureRules = createSyncedSetter('cornMoistureRules', setCornMoistureRules);
  const syncedSetDryerRecords = createSyncedSetter('dryerRecords', setDryerRecords);
  const syncedSetKasbons = createSyncedSetter('kasbons', setKasbons);
  const syncedSetUsers = createSyncedSetter('users', setUsers);
  const syncedSetLogs = createSyncedSetter('activityLogs', setActivityLogs);

  // Synchronize/Add missing default employees dynamically (hands-free propagation)
  const laborMigrationChecked = React.useRef(false);
  React.useEffect(() => {
    if (employees.length > 0 && !laborMigrationChecked.current) {
      const missing = initialEmployeeRecords.filter(
        init => !employees.some(e => e.name.toLowerCase() === init.name.toLowerCase())
      );
      if (missing.length > 0) {
        laborMigrationChecked.current = true;
        console.log(`[Sync] Automatically adding ${missing.length} default employees...`);
        syncedSetEmployees(prev => {
          const next = [...prev];
          missing.forEach(item => {
            if (!next.some(n => n.id === item.id)) {
              next.push(item);
            } else {
              next.push({ ...item, id: `emp-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}` });
            }
          });
          return next;
        });
      } else {
        laborMigrationChecked.current = true;
      }
    }
  }, [employees]);

  // Synchronize/Add missing default brokers dynamically (BABA, DOYO, ANDI)
  const brokerMigrationChecked = React.useRef(false);
  React.useEffect(() => {
    if (brokers.length > 0 && !brokerMigrationChecked.current) {
      const missing = initialBrokers.filter(
        init => !brokers.some(b => b.name.toLowerCase() === init.name.toLowerCase())
      );
      if (missing.length > 0) {
        brokerMigrationChecked.current = true;
        console.log(`[Sync] Automatically adding ${missing.length} default brokers...`);
        syncedSetBrokers(prev => {
          const next = [...prev];
          missing.forEach(item => {
            if (!next.some(n => n.id === item.id)) {
              next.push(item);
            } else {
              next.push({ ...item, id: `bro-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}` });
            }
          });
          return next;
        });
      } else {
        brokerMigrationChecked.current = true;
      }
    }
  }, [brokers]);

  // --- CREDENTIALS AUTHENTICATION STATE & LOGIC ---
  interface SessionUser {
    id?: string;
    username: string;
    role: 'admin' | 'operator' | 'karyawan' | 'pimpinan';
    allowedTabs?: string[];
  }

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem('bilibili_session_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Automatically update the logged-in session user if their allowed tabs, roles, or status are changed in master database
  React.useEffect(() => {
    if (sessionUser) {
      const myUser = users.find(u => u.id === sessionUser.id);
      if (myUser) {
        const hasTabsChanged = JSON.stringify(myUser.allowedTabs || []) !== JSON.stringify(sessionUser.allowedTabs || []);
        const hasRoleChanged = myUser.role !== sessionUser.role;
        const hasIsActiveChanged = !myUser.isActive;
        
        if (hasIsActiveChanged) {
          handleSessionLogout();
          showToast("Sesi akun Anda telah dinonaktifkan oleh administrator.", "warning");
        } else if (hasTabsChanged || hasRoleChanged) {
          const updated: SessionUser = {
            ...sessionUser,
            role: myUser.role,
            allowedTabs: myUser.allowedTabs
          };
          localStorage.setItem('bilibili_session_user', JSON.stringify(updated));
          setSessionUser(updated);
          showToast("Akses menu navigasi Anda telah diperbarui oleh administrator.", "info");
        }
      }
    }
  }, [users, sessionUser]);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSessionLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const uInput = loginUsername.trim().toLowerCase();
    const pInput = loginPassword;

    // Check against DB users
    const matchedUser = users.find(u => u.username === uInput);

    if (matchedUser) {
      // Basic password check - in real app, use hashing
      // For this app, we'll allow standard passwords if not set in DB user yet
      const expectedPass = matchedUser.password || 
        (matchedUser.username === 'admin' ? 'admin123' : 
         matchedUser.username === 'pimpinan' ? 'pimpinan123' : 
         matchedUser.username === 'operator' ? 'operator123' : 
         matchedUser.username === 'karyawan' ? 'karyawan123' : '12345');

      if (pInput === expectedPass) {
        if (!matchedUser.isActive) {
          setLoginError("Akun Anda telah dinonaktifkan!");
          return;
        }

        const sessUser: SessionUser = { 
          id: matchedUser.id,
          username: matchedUser.username, 
          role: matchedUser.role,
          allowedTabs: matchedUser.allowedTabs
        };
        localStorage.setItem('bilibili_session_user', JSON.stringify(sessUser));
        setSessionUser(sessUser);
        
        // Update last login
        setUsers(prev => prev.map(u => u.id === matchedUser.id ? { ...u, lastLogin: new Date().toISOString() } : u));
        
        setLoginUsername('');
        setLoginPassword('');
        showToast(`Selamat datang ${matchedUser.fullName}! Login sukses.`, "success");
        
        logAction('AUTH', 'LOGIN', `User ${matchedUser.username} login ke sistem`);
      } else {
        setLoginError("Password salah!");
      }
    } else {
      setLoginError("Username tidak ditemukan!");
    }
  };

  const handleSessionLogout = () => {
    if (sessionUser) {
      logAction('AUTH', 'LOGOUT', `User ${sessionUser.username} logout`);
    }
    localStorage.removeItem('bilibili_session_user');
    setSessionUser(null);
    showToast("Berhasil Logout dari akun gudang.", "success");
  };

  const logAction = (module: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: sessionUser?.id || 'system',
      username: sessionUser?.username || 'GUEST',
      role: sessionUser?.role || 'NONE',
      action,
      module,
      details
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 5000)); // Keep last 5000 logs
  };

  // Active navigational tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TIMBANG' | 'MASUK' | 'KELUAR' | 'SERVICES' | 'REFAKSI' | 'FINANCE' | 'STOK_BERAS' | 'LAPORAN' | 'DATABASE' | 'DRYER' | 'PRODUK'>('DASHBOARD');
  
  // Guard against direct tab loading by unauthorised roles
  useEffect(() => {
    if (sessionUser) {
      if (sessionUser.role === 'operator') {
        if (['FINANCE', 'LAPORAN', 'DATABASE'].includes(activeTab)) {
          setActiveTab('DASHBOARD');
          showToast("Akses Ditolak: Hanya Admin yang dapat mengakses menu Keuangan, Laporan, atau Database Master!", "warning");
        }
      } else if (sessionUser.role === 'karyawan') {
        if (['SERVICES', 'REFAKSI', 'FINANCE', 'LAPORAN', 'DATABASE', 'DRYER'].includes(activeTab)) {
          setActiveTab('DASHBOARD');
          showToast("Akses Ditolak: Karyawan hanya memiliki akses ke Timbangan, Logistik, dan Stok Beras!", "warning");
        }
      } else if (sessionUser.role === 'pimpinan') {
        if (['TIMBANG', 'MASUK', 'KELUAR', 'SERVICES', 'REFAKSI', 'DATABASE', 'DRYER'].includes(activeTab)) {
          setActiveTab('DASHBOARD');
          showToast("Akses Ditolak: Pimpinan hanya dapat mengakses Ringkasan Dashboard, Laporan, dan Manajemen Keuangan!", "warning");
        }
      }
    }
  }, [activeTab, sessionUser]);
  
  // Dashboard tab feed selections
  const [dashFeedTab, setDashFeedTab] = useState<'WEIGH' | 'INBOUND' | 'OUTBOUND' | 'SERVICES' | 'FINANCE'>('WEIGH');

  // --- SETTINGS STATE ---
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [printerName, setPrinterName] = useState(() => localStorage.getItem('bilibili_printer_name') || 'EPSON LX-310');

  // Custom Minimum Stock Threshold limits for alert system
  const [cornThresholdLimit, setCornThresholdLimit] = useState<number>(() => {
    const saved = localStorage.getItem('bilibili_threshold_corn');
    return saved ? parseInt(saved, 10) : 10000;
  });
  const [riceThresholdLimit, setRiceThresholdLimit] = useState<number>(() => {
    const saved = localStorage.getItem('bilibili_threshold_rice');
    return saved ? parseInt(saved, 10) : 5000;
  });
  const [productThresholdLimit, setProductThresholdLimit] = useState<number>(() => {
    const saved = localStorage.getItem('bilibili_threshold_product');
    return saved ? parseInt(saved, 10) : 3000;
  });

  useEffect(() => {
    localStorage.setItem('bilibili_printer_name', printerName);
  }, [printerName]);

  useEffect(() => {
    localStorage.setItem('bilibili_threshold_corn', cornThresholdLimit.toString());
  }, [cornThresholdLimit]);

  useEffect(() => {
    localStorage.setItem('bilibili_threshold_rice', riceThresholdLimit.toString());
  }, [riceThresholdLimit]);

  useEffect(() => {
    localStorage.setItem('bilibili_threshold_product', productThresholdLimit.toString());
  }, [productThresholdLimit]);

  // Premium customizable active theme state with LocalStorage persistence
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('bilibili_theme') || 'EMERALD';
  });

  const [navLayout, setNavLayout] = useState<'TOP' | 'SIDEBAR'>(() => {
    return (localStorage.getItem('bilibili_nav_layout') as 'TOP' | 'SIDEBAR') || 'TOP';
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('bilibili_theme', activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem('bilibili_nav_layout', navLayout);
  }, [navLayout]);

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
    localStorage.setItem('bilibili_kasbons', JSON.stringify(kasbons));
  }, [kasbons]);

  useEffect(() => {
    localStorage.setItem('bilibili_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('bilibili_brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('bilibili_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('bilibili_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('bilibili_finance_categories', JSON.stringify(financeCategories));
  }, [financeCategories]);

  useEffect(() => {
    localStorage.setItem('bilibili_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bilibili_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // --- COMPONENT ACTION CALLBACKS WITH REALTIME ONLINE MUTATORS ---
  const handleAddTicket = (tk: WeighbridgeTicket) => {
    setTickets(prev => [tk, ...prev]);
    saveOnline('tickets', tk);
    showToast(`${t.saveWeighbridgeSuccess} (#${tk.ticketNo} - ${tk.policeNo})!`, 'success');
  };

  const handleUpdateTicket = (updatedTk: WeighbridgeTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTk.id ? updatedTk : t));
    saveOnline('tickets', updatedTk);
    const isComp = updatedTk.status === 'COMPLETED';
    showToast(
      isComp 
        ? `${t.completedStatus} (#${updatedTk.ticketNo} - ${updatedTk.policeNo}).`
        : `${t.updateWeighbridgeSuccess} (#${updatedTk.ticketNo} - ${updatedTk.policeNo})!`, 
      'success'
    );
  };

  const handleDeleteTicket = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus tiket timbang!", "error");
      return;
    }
    const target = tickets.find(t => t.id === id);
    const label = target ? `#${target.ticketNo}` : '';
    setTickets(prev => prev.filter(t => t.id !== id));
    deleteOnline('tickets', id);
    showToast(`${t.deleteWeighbridgeSuccess} ${label}!`, 'success');
  };

  const handleAddInbound = (rec: InboundRecord) => {
    setInboundRecords(prev => [rec, ...prev]);
    saveOnline('inboundRecords', rec);
    
    showToast(`Sukses menyimpan: Penerimaan ${rec.commodity} dari ${rec.supplier} (${rec.netWeight.toLocaleString('id-ID')} Kg Netto)!`, 'success');
  };

  const handleUpdateInbound = (rec: InboundRecord) => {
    setInboundRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    saveOnline('inboundRecords', rec);
    showToast(`Sukses memperbarui catatan penerimaan ${rec.commodity} dari ${rec.supplier}!`, 'success');
  };

  const handleDeleteInbound = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus catatan barang masuk!", "error");
      return;
    }
    setInboundRecords(prev => prev.filter(r => r.id !== id));
    deleteOnline('inboundRecords', id);
    showToast('Catatan barang masuk berhasil dihapus!', 'success');
  };

  const handleAddOutbound = (rec: OutboundRecord) => {
    setOutboundRecords(prev => [rec, ...prev]);
    saveOnline('outboundRecords', rec);

    showToast(`Sukses menyimpan: Pengiriman ${rec.commodity} ke ${rec.buyer} (${rec.totalWeight.toLocaleString('id-ID')} Kg Netto)!`, 'success');
  };

  const handleUpdateOutbound = (rec: OutboundRecord) => {
    setOutboundRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    saveOnline('outboundRecords', rec);
    showToast(`Sukses memperbarui catatan pengiriman ${rec.commodity} ke ${rec.buyer}!`, 'success');
  };

  const handleDeleteOutbound = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus catatan barang keluar!", "error");
      return;
    }
    setOutboundRecords(prev => prev.filter(r => r.id !== id));
    deleteOnline('outboundRecords', id);
    showToast('Catatan barang keluar berhasil dihapus!', 'success');
  };

  const handleAddService = (rec: ServiceRecord) => {
    setServiceRecords(prev => [rec, ...prev]);
    saveOnline('serviceRecords', rec);
    showToast(`Sukses mencatatkan layanan jasa poles/kipas untuk ${rec.customerName}!`, 'success');
  };

  const handleUpdateService = (rec: ServiceRecord) => {
    setServiceRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    saveOnline('serviceRecords', rec);
    showToast(`Sukses memperbarui layanan jasa poles/kipas untuk ${rec.customerName}!`, 'success');
  };

  const handleDeleteService = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus catatan layanan jasa!", "error");
      return;
    }
    setServiceRecords(prev => prev.filter(r => r.id !== id));
    deleteOnline('serviceRecords', id);
    showToast('Catatan layanan jasa poles berhasil dihapus!', 'success');
  };

  const handleAddDebt = (debt: DebtRecord) => {
    setDebts(prev => [debt, ...prev]);
    saveOnline('debts', debt);
    showToast(`Sukses mencatatkan utang kepada ${debt.supplierName} sebesar Rp ${(debt.totalDebt ?? 0).toLocaleString('id-ID')}!`, 'success');
  };

  const handleUpdateDebt = (debt: DebtRecord) => {
    setDebts(prev => prev.map(d => d.id === debt.id ? debt : d));
    saveOnline('debts', debt);
    showToast(`Sukses memperbarui catatan utang kepada ${debt.supplierName}!`, 'success');
  };

  const handleDeleteDebt = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus catatan utang!", "error");
      return;
    }
    setDebts(prev => prev.filter(d => d.id !== id));
    deleteOnline('debts', id);
    showToast('Catatan utang berhasil dihapus!', 'success');
  };

  const handlePayDebt = (id: string, amount: number) => {
    const target = debts.find(d => d.id === id);
    if (!target) return;

    const supplier = target.supplierName;
    const paid = target.paidAmount + amount;
    const remaining = Math.max(0, target.totalDebt - paid);
    const status = remaining === 0 ? 'LUNAS' : 'BELUM_LUNAS';

    // Generate a thoroughly unique ID by appending a timestamp and a random integer
    const uniqueFinId = `fin-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Log in finances
    const newFin: FinancialRecord = {
      id: uniqueFinId,
      date: new Date().toISOString().split('T')[0],
      type: 'KREDIT',
      category: 'OPERASIONAL',
      description: `Pembayaran cicilan utang kepada ${target.supplierName}`,
      partyName: target.supplierName,
      amount: amount,
      bankAccount: 'Kas Gudang Tunai'
    };

    const updatedDebt = { ...target, paidAmount: paid, remainingBalance: remaining, status };

    // Update both states safely outside of individual updater blocks
    setDebts(prev => prev.map(d => d.id === id ? updatedDebt : d));
    setFinances(prev => {
      // De-duplicate just in case to be absolutely safe
      if (prev.some(f => f.id === uniqueFinId)) return prev;
      return [newFin, ...prev];
    });

    // Save online outside of any state mapping
    saveOnline('debts', updatedDebt);
    saveOnline('finances', newFin);

    showToast(`Pembayaran cicilan utang kepada ${supplier} sebesar Rp ${(amount ?? 0).toLocaleString('id-ID')} berhasil dicatat!`, 'success');
  };

  const handleAddFinance = (fin: FinancialRecord) => {
    setFinances(prev => [fin, ...prev]);
    saveOnline('finances', fin);
    showToast(`Mutasi kas ${fin.type === 'DEBIT' ? 'Pemasukan' : 'Pengeluaran'} Rp ${(fin.amount ?? 0).toLocaleString('id-ID')} berhasil disimpan!`, 'success');
  };

  const handleUpdateFinance = (fin: FinancialRecord) => {
    setFinances(prev => prev.map(f => f.id === fin.id ? fin : f));
    saveOnline('finances', fin);
    showToast(`Mutasi kas ${fin.description} berhasil diperbarui!`, 'success');
  };

  const handleDeleteFinance = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus transaksi keuangan!", "error");
      return;
    }
    setFinances(prev => prev.filter(f => f.id !== id));
    deleteOnline('finances', id);
    showToast('Catatan mutasi kas berhasil dihapus!', 'success');
  };

  const handleAddRiceStock = (rec: RiceStockRecord) => {
    setRiceStockRecords(prev => [rec, ...prev]);
    saveOnline('riceStockRecords', rec);
    showToast(t.successSaveStock, 'success');
  };

  const handleUpdateRiceStock = (rec: RiceStockRecord) => {
    setRiceStockRecords(prev => prev.map(r => r.id === rec.id ? rec : r));
    saveOnline('riceStockRecords', rec);
    showToast(t.successUpdateStock, 'success');
  };

  const handleDeleteRiceStock = (id: string) => {
    if (!['admin', 'pimpinan'].includes(sessionUser?.role || '')) {
      showToast("Gagal: Hanya Admin atau Pimpinan yang diperbolehkan menghapus catatan stok beras!", "error");
      return;
    }
    setRiceStockRecords(prev => prev.filter(r => r.id !== id));
    deleteOnline('riceStockRecords', id);
    showToast(t.deleteSuccessGeneral, 'success');
  };

  // --- INTEGRATED METRICS CALCULATOR FOR COVER DASHBOARD ---
  // A. Stocks inside Silos & Warehouses
  const totalInboundCorn = inboundRecords.filter(r => r.commodity?.includes('JAGUNG')).reduce((acc, r) => acc + r.netWeight, 0);
  const totalOutboundCorn = outboundRecords.filter(r => r.commodity?.includes('JAGUNG')).reduce((acc, r) => acc + r.totalWeight, 0);
  const manualCornIn = riceStockRecords.filter(r => (r.commodity === 'JAGUNG READY' || r.commodity === 'JAGUNG ASALAN' || r.itemName?.toUpperCase().includes('JAGUNG'))).reduce((acc, r) => acc + r.inWeight, 0);
  const manualCornOut = riceStockRecords.filter(r => (r.commodity === 'JAGUNG READY' || r.commodity === 'JAGUNG ASALAN' || r.itemName?.toUpperCase().includes('JAGUNG'))).reduce((acc, r) => acc + r.outWeight, 0);
  const cornStockBalance = Math.max(0, (totalInboundCorn + manualCornIn) - (totalOutboundCorn + manualCornOut));

  const totalInboundRice = inboundRecords.filter(r => r.commodity?.includes('BERAS') || r.commodity === 'BROKEN' || r.commodity === 'BENIR' || r.commodity === 'RIJEK' || r.commodity === 'DEDAK').reduce((acc, r) => acc + r.netWeight, 0);
  const totalOutboundRice = outboundRecords.filter(r => r.commodity?.includes('BERAS') || r.commodity === 'BROKEN' || r.commodity === 'BENIR' || r.commodity === 'RIJEK' || r.commodity === 'DEDAK').reduce((acc, r) => acc + r.totalWeight, 0);
  const manualRiceIn = riceStockRecords.filter(r => r.commodity?.includes('BERAS') || r.commodity === 'BROKEN' || r.commodity === 'BENIR' || r.commodity === 'RIJEK' || r.commodity === 'DEDAK').reduce((acc, r) => acc + r.inWeight, 0);
  const manualRiceOut = riceStockRecords.filter(r => r.commodity?.includes('BERAS') || r.commodity === 'BROKEN' || r.commodity === 'BENIR' || r.commodity === 'RIJEK' || r.commodity === 'DEDAK').reduce((acc, r) => acc + r.outWeight, 0);
  const riceStockBalance = Math.max(0, (totalInboundRice + manualRiceIn) - (totalOutboundRice + manualRiceOut));

  // B. Services income tally
  const totalServiceFeeUnpaid = serviceRecords.filter(s => s.paymentStatus === 'UNPAID').reduce((acc, s) => acc + s.totalFee, 0);
  const totalServiceFeePaid = serviceRecords.filter(s => s.paymentStatus === 'PAID').reduce((acc, s) => acc + s.totalFee, 0);

  // C. Finances
  const totalCashIncome = finances.filter(f => f.type === 'DEBIT').reduce((acc, f) => acc + f.amount, 0);
  const totalCashExpense = finances.filter(f => f.type === 'KREDIT').reduce((acc, f) => acc + f.amount, 0);
  const netKasBalance = totalCashIncome - totalCashExpense;

  const totalOutstandingDebts = debts.filter(d => d.status === 'BELUM_LUNAS').reduce((acc, d) => acc + d.remainingBalance, 0);

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden" id="login-screen-portal">
        {/* Modern high-quality background design elements */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -ml-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] -mr-40 -mb-40 pointer-events-none"></div>
        
        {/* Abstract subtle grid overlay for professional industrial/tech aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md p-8 sm:p-10 relative z-10 font-sans"
        >
          {/* Header section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative group mb-4">
              {/* Outer soft breathing glow matching the log */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
              
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-600 bg-white shadow-xl flex items-center justify-center p-0.5">
                <img 
                  src={bilibiliLogo} 
                  alt="US Bilibili 162 Logo" 
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              US Bilibili 162
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">
              {language === 'id' ? 'Sistem Manajemen Gudang & Kas' : 'Integrated Warehouse & Finance'}
            </p>

            {/* Encrypted network badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/55 border border-slate-600/60 rounded-full text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Sesi Terbuka & Terenkripsi' : 'Active Secured Session'}</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSessionLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5 pl-1">
                Username
              </label>
              <div className="relative group/input">
                <input 
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan username...' : 'Enter username...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-transparent transition-all pl-11 font-medium shadow-inner"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5 pl-1">
                Password
              </label>
              <div className="relative group/input">
                <input 
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan password...' : 'Enter password...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-transparent transition-all pl-11 font-medium shadow-inner"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 text-red-400 text-xs py-2.5 px-3 rounded-xl font-bold flex items-center gap-2 border border-red-900/60"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{language === 'id' ? 'Username atau password salah!' : 'Incorrect username or password!'}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full mt-2 relative overflow-hidden group/btn bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2 tracking-wide"
            >
              <Key className="w-4 h-4 transition-transform group-hover/btn:rotate-12 duration-200" />
              <span>{language === 'id' ? 'Masuk ke Sistem' : 'Authenticate Security'}</span>
            </button>
          </form>

          {/* Bottom styling and language utilities */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col items-center gap-4">
            {/* Quick Language Toggle on Login Screen */}
            <div className="flex justify-center gap-3 text-[11px] text-slate-400 font-medium font-sans">
              <button 
                type="button"
                onClick={() => setLanguage('id')} 
                className={`transition-colors py-1 px-1.5 rounded hover:text-white ${language === 'id' ? 'text-emerald-400 font-bold bg-slate-700/40' : ''}`}
              >
                🇮🇩 Indonesia
              </button>
              <span className="text-slate-600 self-center">•</span>
              <button 
                type="button" 
                onClick={() => setLanguage('en')}
                className={`transition-colors py-1 px-1.5 rounded hover:text-white ${language === 'en' ? 'text-emerald-400 font-bold bg-slate-700/40' : ''}`}
              >
                🇺🇸 English
              </button>
            </div>

            {/* Subtle disclaimer */}
            <p className="text-[10px] text-slate-500 font-medium text-center">
              © US Bilibili 162. {language === 'id' ? 'Hanya diizinkan untuk personel terotorisasi.' : 'Authorized personnel only.'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // RENDER NAVIGATION TABS HELPER
  const renderNavTabs = (isSidebar = false) => {
    const tabs = [
      { id: 'DASHBOARD', name: 'RINGKASAN DASHBOARD', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['admin', 'operator', 'karyawan', 'pimpinan'] },
      { id: 'TIMBANG', name: 'JEMBATAN TIMBANGAN', icon: <Scale className="w-4 h-4 text-blue-500" />, roles: ['admin', 'operator', 'karyawan', 'pimpinan'] },
      { id: 'MASUK', name: 'PENERIMAAN BARANG MASUK', icon: <ArrowDownCircle className="w-4 h-4 text-emerald-600" />, roles: ['admin', 'operator', 'karyawan', 'pimpinan'] },
      { id: 'KELUAR', name: 'PENGIRIMAN BARANG KELUAR', icon: <ArrowUpCircle className="w-4 h-4 text-blue-600" />, roles: ['admin', 'operator', 'karyawan', 'pimpinan'] },
      { id: 'SERVICES', name: 'JASA POLES & KIPAS', icon: <Wind className="w-4 h-4 text-sky-500" />, roles: ['admin', 'operator', 'pimpinan'] },
      { id: 'REFAKSI', name: 'POTONGAN REFAKSI', icon: <Percent className="w-4 h-4 text-amber-500" />, roles: ['admin', 'operator', 'pimpinan'] },
      { id: 'DRYER', name: 'DRYER JAGUNG', icon: <Wind className="w-4 h-4 text-orange-500" />, roles: ['admin', 'operator', 'pimpinan'] },
      { id: 'STOK_BERAS', name: 'BUKU STOK LOGISTIK', icon: <Package className="w-4 h-4 text-emerald-600" />, roles: ['admin', 'operator', 'karyawan', 'pimpinan'] },
      { id: 'LAPORAN', name: 'ANALISA & LAPORAN', icon: <FileSpreadsheet className="w-4 h-4 text-purple-500" />, roles: ['admin', 'pimpinan'] },
      { id: 'FINANCE', name: 'MANAJEMEN KEUANGAN', icon: <DollarSign className="w-4 h-4 text-emerald-500" />, roles: ['admin', 'pimpinan'] },
      { id: 'PRODUK', name: 'KATALOG PRODUK', icon: <Package className="w-4 h-4 text-amber-600" />, roles: ['admin', 'operator', 'karyawan'] },
      { id: 'DATABASE', name: 'DATABASE MASTER', icon: <Database className="w-4 h-4 text-neutral-500" />, roles: ['admin'] },
    ];

    return tabs.map((t) => {
      // If user has custom allowed navigation tabs configured, check against them. Otherwise, default to role permissions.
      const hasCustomPermissions = sessionUser?.allowedTabs && sessionUser.allowedTabs.length > 0;
      if (hasCustomPermissions) {
        if (!sessionUser.allowedTabs?.includes(t.id)) return null;
      } else {
        if (!t.roles.includes(sessionUser?.role || '')) return null;
      }

      return (
        <button
          key={t.id}
          id={`nav-tab-${t.id}`}
          onClick={() => {
            setActiveTab(t.id as any);
            if (isSidebar && window.innerWidth < 1024) setSidebarOpen(false);
          }}
          className={`
            flex items-center gap-3 transition-all duration-300 font-bold uppercase
            ${isSidebar 
              ? `w-full px-4 py-3.5 rounded-xl mb-1 text-[11px] ${activeTab === t.id ? `${theme.btnPrimaryBg} text-white shadow-lg scale-[1.02]` : 'text-neutral-500 hover:bg-neutral-100 hover:pl-5'}`
              : `px-4 py-1 text-[11px] border-b-2 h-[42px] ${activeTab === t.id ? `${theme.tabActiveBorder} ${theme.tabActiveText} ${theme.tabActiveBg}` : 'border-transparent text-neutral-500 hover:text-neutral-800'}`
            }
          `}
        >
          <span className={`${activeTab === t.id && !isSidebar ? 'scale-110' : ''}`}>{t.icon}</span>
          <span className="truncate">{t.name}</span>
        </button>
      );
    });
  };

  return (
    <div className={`h-screen ${theme.pageBg} text-neutral-800 font-sans flex flex-col lg:flex-row transition-colors duration-300 overflow-hidden w-full max-w-full`}>
      
      {/* --- SETTINGS MODAL --- */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className={`p-5 ${theme.headerBg} text-white flex justify-between items-center`}>
                <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-tight">
                  <SettingsIcon className="w-5 h-5 text-yellow-400" /> {t.printerSettings || 'Pengaturan Sistem'} & Kustomisasi
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Printer Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest leading-none">Konfigurasi Printer Tiket</label>
                  </div>
                  <input 
                    value={printerName} 
                    onChange={(e) => setPrinterName(e.target.value)}
                    className="w-full border-2 border-neutral-100 p-3 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-inner"
                    placeholder="e.g., EPSON LX-310"
                  />
                </div>

                {/* Layout Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Layout className="w-4 h-4 text-emerald-600" />
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest leading-none">Model Navigasi (Layout System)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setNavLayout('TOP')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group cursor-pointer ${navLayout === 'TOP' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 hover:border-neutral-300'}`}
                    >
                      <div className="w-full h-8 bg-neutral-100 rounded-md border border-neutral-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
                        <div className="absolute top-2.5 left-1 right-1 h-1.5 bg-neutral-300 rounded-full"></div>
                      </div>
                      <span className={`text-[10px] font-black uppercase ${navLayout === 'TOP' ? 'text-emerald-800' : 'text-neutral-500'}`}>Top Navigation</span>
                    </button>
                    <button 
                      onClick={() => setNavLayout('SIDEBAR')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group cursor-pointer ${navLayout === 'SIDEBAR' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 hover:border-neutral-300'}`}
                    >
                      <div className="w-full h-8 bg-neutral-100 rounded-md border border-neutral-200 overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-emerald-600"></div>
                        <div className="absolute top-1 left-3.5 right-1 h-1.5 bg-neutral-300 rounded-full"></div>
                        <div className="absolute top-3.5 left-3.5 right-2 h-1.5 bg-neutral-300 rounded-full"></div>
                      </div>
                      <span className={`text-[10px] font-black uppercase ${navLayout === 'SIDEBAR' ? 'text-emerald-800' : 'text-neutral-500'}`}>Sidebar Layout</span>
                    </button>
                  </div>
                </div>

                {/* Theme Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest leading-none">Pilihan Tema Visual</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {APP_THEMES.map((th) => (
                      <button 
                        key={th.id}
                        onClick={() => handleThemeChange(th.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${activeThemeId === th.id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-neutral-100 hover:bg-neutral-50'}`}
                      >
                        <span className="text-base">{th.emoji}</span>
                        <span className={`text-[10px] font-black uppercase truncate ${activeThemeId === th.id ? 'text-emerald-800' : 'text-neutral-600'}`}>{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Warning Threshold Section */}
                <div className="space-y-4 pt-3 border-t border-neutral-150">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest leading-none">Ambang Batas Minimum Stok (Visual Alert)</label>
                  </div>
                  <div className="space-y-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-neutral-700">🌽 Batas Minim Jagung:</span>
                        <span className="text-[11px] font-black text-amber-700 font-mono">{(cornThresholdLimit ?? 0).toLocaleString('id-ID')} Kg</span>
                      </div>
                      <input 
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={cornThresholdLimit}
                        onChange={(e) => setCornThresholdLimit(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-neutral-700">🌾 Batas Minim Beras:</span>
                        <span className="text-[11px] font-black text-emerald-700 font-mono">{(riceThresholdLimit ?? 0).toLocaleString('id-ID')} Kg</span>
                      </div>
                      <input 
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={riceThresholdLimit}
                        onChange={(e) => setRiceThresholdLimit(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-neutral-700">📦 Batas Minim Produk Katalog:</span>
                        <span className="text-[11px] font-black text-indigo-700 font-mono">{(productThresholdLimit ?? 0).toLocaleString('id-ID')} Kg</span>
                      </div>
                      <input 
                        type="range"
                        min="500"
                        max="15000"
                        step="500"
                        value={productThresholdLimit}
                        onChange={(e) => setProductThresholdLimit(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="p-4 bg-neutral-50 border-t flex justify-end">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Terapkan & Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR LAYOUT (Desktop & Mobile Panel) */}
      {navLayout === 'SIDEBAR' && (
        <>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-[49] lg:hidden backdrop-blur-sm"
              />
            )}
          </AnimatePresence>

          <motion.aside 
            initial={false}
            animate={{ 
              width: sidebarOpen ? 280 : 0,
              x: sidebarOpen ? 0 : -280,
              opacity: sidebarOpen ? 1 : 0
            }}
            className={`
              fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full overflow-hidden transition-all duration-300 border-r shadow-2xl lg:shadow-none
              ${theme.headerBg} ${theme.headerBorder}
            `}
          >
            <div className={`p-4 border-b ${theme.headerBorder} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 bg-white shadow-md shrink-0 flex items-center justify-center">
                  <img src={bilibiliLogo} alt="Logo" className="w-full h-full object-cover scale-110" referrerPolicy="no-referrer" />
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-black text-xs text-white truncate uppercase tracking-tight">US Bilibili 162</h1>
                  <p className="text-[9px] text-white/60 font-medium truncate uppercase tracking-widest leading-none">{t.centralWarehouse}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {renderNavTabs(true)}
            </div>
            <div className={`p-4 border-t ${theme.headerBorder} bg-black/10`}>
              {sessionUser && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-xs">
                      {sessionUser.username[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-white truncate tracking-tight">{sessionUser.username}</p>
                      <p className="text-[9px] font-bold text-white/50 uppercase leading-none">{sessionUser.role}</p>
                    </div>
                  </div>
                  <button onClick={handleSessionLogout} className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Logout</button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER BAR (ADAPTIVE) */}
        <header className={`text-white shadow-md border-b sticky top-0 z-40 transition-all duration-300 ${theme.headerBg} ${theme.headerBorder}`}>
          <div className="w-full px-4 py-2 flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {navLayout === 'SIDEBAR' ? (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shrink-0">
                    {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <div className="flex flex-col min-w-0">
                    <h1 className="font-black tracking-tight text-xs sm:text-base font-sans uppercase truncate leading-tight">
                      {t.warehouseHeader || 'US BILIBILI 162'}
                    </h1>
                    <p className="text-[8px] sm:text-[10px] opacity-85 font-sans uppercase tracking-tight leading-none text-yellow-350 truncate">
                      {t.thermalSlipAddress || t.pinrangLocation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-yellow-400 bg-white shadow-md shrink-0 flex items-center justify-center">
                    <img src={bilibiliLogo} alt="Logo" className="w-full h-full object-cover scale-[1.12]" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h1 className="font-black tracking-tight text-xs sm:text-base font-sans uppercase truncate leading-tight">
                      {t.warehouseHeader || 'US BILIBILI 162'}
                    </h1>
                    <p className="text-[8px] sm:text-[10px] opacity-85 font-sans uppercase tracking-tight leading-none text-yellow-350 truncate">
                      {t.thermalSlipAddress || t.pinrangLocation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              {/* Calendar & Clock Widget (Desktop & Tablet) */}
              <div className={`hidden sm:flex px-2.5 py-1.5 rounded-xl border items-center gap-2 font-mono text-[10px] transition-all duration-300 ${theme.statusBoxBg} ${theme.statusBoxBorder}`}>
                <Calendar className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-bold uppercase">
                  {currentTime.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-white/20 font-light">|</span>
                <Clock className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-bold">{currentTime.toLocaleTimeString('id-US', { hour12: false })}</span>
              </div>

              {/* Theme Picker (Always visible) */}
              <div className="hidden lg:flex items-center gap-1">
                <select value={activeThemeId} onChange={(e) => handleThemeChange(e.target.value)} className={`text-[11px] font-black px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer shadow-sm ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:brightness-110 uppercase`}>
                  {APP_THEMES.map((th) => <option key={th.id} value={th.id} className="text-neutral-900">{th.emoji} {th.name}</option>)}
                </select>
              </div>

              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className={`text-[11px] font-black px-2.5 py-1.5 rounded-xl border focus:outline-none transition-all cursor-pointer shadow-sm ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:brightness-110 uppercase`}>
                <option value="id" className="text-neutral-900">🇮🇩 ID</option>
                <option value="en" className="text-neutral-900">🇺🇸 EN</option>
              </select>

              <button onClick={() => setShowSettingsModal(true)} className={`p-2 rounded-xl border transition-all ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:bg-white/20 shadow-lg`} title="Settings">
                <SettingsIcon className="w-4.5 h-4.5" />
              </button>

              {sessionUser && (
                <div className="relative border-l border-white/20 pl-2 sm:pl-3.5 ml-1 sm:ml-2">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)} 
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm text-xs font-bold active:scale-95 ${theme.statusBoxBg} ${theme.statusBoxBorder} text-white hover:brightness-110`}
                  >
                    <div className="w-5 h-5 rounded-full bg-yellow-450 border border-yellow-300 text-neutral-900 font-extrabold text-[10px] flex items-center justify-center uppercase shadow-inner shrink-0">
                      {sessionUser.username[0]}
                    </div>
                    <span className="max-w-[70px] sm:max-w-[120px] truncate font-mono text-[10px] sm:text-[11px] font-black uppercase text-yellow-300 leading-none">
                      {sessionUser.username}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 z-50 text-neutral-800"
                        >
                          <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center uppercase shrink-0">
                              {sessionUser.username[0]}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-extrabold text-neutral-900 text-xs uppercase truncate leading-none mb-1">{sessionUser.username}</h4>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                sessionUser.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                sessionUser.role === 'pimpinan' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-indigo-100 text-indigo-700'
                              }`}>
                                {sessionUser.role}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[9px] text-neutral-400 font-bold uppercase tracking-wide mb-3">
                            <div className="flex justify-between items-center">
                              <span>Aktivitas Sesi:</span>
                              <span className="text-emerald-700 font-mono">Aktif</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Instansi Gudang:</span>
                              <span className="text-neutral-700 truncate max-w-[100px]">US Bilibili 162</span>
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleSessionLogout();
                            }}
                            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
                          >
                            <LogOut className="w-3 h-3 text-white" />
                            <span>Logout Sesi</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </header>

        {navLayout === 'TOP' && (
          <div className="bg-white border-b border-neutral-200 shadow-sm z-30 overflow-x-auto whitespace-nowrap custom-scrollbar shrink-0">
            <div className="max-w-7xl mx-auto px-4 flex h-[42px]">
              {renderNavTabs(false)}
            </div>
          </div>
        )}

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-slate-50/50">
          <div className={`${navLayout === 'TOP' ? 'max-w-7xl mx-auto' : 'w-full'} p-4 sm:p-6 pb-24`}>
            
            {/* Real-time Firebase Cloud Sync Status Notifier Bar */}
            <motion.div 
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          id="firebase-cloud-sync-banner"
          className={`mb-6 flex flex-col md:flex-row items-center justify-between gap-3 px-4.5 py-3 rounded-xl border shadow-sm transition-all duration-300 ${
            syncStatus === 'saving' 
              ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100/30' 
              : syncStatus === 'error' 
              ? 'bg-red-50 border-red-200 text-red-900 shadow-red-100/30' 
              : 'bg-emerald-50/50 border-emerald-100/80 text-emerald-950 shadow-emerald-100/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="shrink-0 flex items-center justify-center">
              {syncStatus === 'saving' ? (
                <div className="w-7 h-7 bg-amber-550 text-white rounded-lg flex items-center justify-center shadow-xs animate-spin-slow">
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                </div>
              ) : syncStatus === 'error' ? (
                <div className="w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-xs">
                  <CloudOff className="w-4 h-4 text-white animate-bounce" />
                </div>
              ) : (
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-xs">
                  <Cloud className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 leading-none">
                <span className="text-[10px] font-extrabold font-sans uppercase tracking-wider text-neutral-500">
                  SINKRONISASI CLOUD FIREBASE:
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono uppercase tracking-tight shadow-xs ${
                  syncStatus === 'saving' 
                    ? 'bg-amber-400 text-neutral-900 font-bold animate-pulse' 
                    : syncStatus === 'error' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-emerald-600 text-white'
                }`}>
                  {syncStatus === 'saving' ? '🟢 MENYIMPAN...' : syncStatus === 'error' ? '🔺 GAGAL SINKRON' : '⚡ TERSINKRONISASI'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 font-sans uppercase">
                {syncStatus === 'saving' 
                  ? 'PERUBAHAN SEDANG DITULIS KE CLOUD FIRESTORE DATABASE SECARA OTOMATIS.' 
                  : syncStatus === 'error' 
                  ? 'TERJADI INTERUPSI JARINGAN. SILAKAN PERIKSA KONEKSI ANDA - DATA LOKAL TETAP AMAN.' 
                  : 'SEMUA PERUBAHAN BERHASIL DICADANGKAN DAN DISELARASKAN SECARA REAL-TIME KE WEB SERVER.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 font-mono text-[10px] text-neutral-500/80 border-t md:border-t-0 border-neutral-100 pt-2 md:pt-0 w-full md:w-auto justify-center md:justify-end">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></span>
              Active Firestore Instance
            </span>
            <span>•</span>
            <span className="italic">US Bilibili 162</span>
          </div>
        </motion.div>
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="flex flex-col gap-6" id="dashboard-console-panel">
            {/* Hero Brand Welcome Banner */}
            <div id="dash-hero-container" className={`bg-gradient-to-r ${theme.heroGradient} text-white rounded-2xl p-5 sm:p-6 shadow-md border ${theme.headerBorder} flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative transition-all duration-300`}>
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left z-10 font-sans">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-yellow-400 bg-white shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src={bilibiliLogo}
                    alt="Logo US Bilibili 162"
                    className="w-full h-full object-cover scale-[1.12] block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.heroTextGradient} tracking-tight transition-all duration-300`}>
                    {t.warehouseHeader} - {t.gudangBilibili || 'US Bilibili 162'}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 justify-center md:justify-start">
                    <p className="text-xs sm:text-sm text-white/90 font-medium">
                      {t.systemStatus || 'Sistem Informasi Pergudangan Terpadu'}
                    </p>
                    <span className="hidden sm:inline text-white/30">•</span>
                    <p className="text-[11px] sm:text-xs text-yellow-350 font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-yellow-300" />
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-xs text-white/70 font-mono mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    {t.pinrangLocation || 'Kabupaten Pinrang, Sulawesi Selatan'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center z-10 w-full md:w-auto">
                <button
                  id="btn-shortcut-timbang"
                  onClick={() => setActiveTab('TIMBANG')}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow hover:bg-emerald-500 cursor-pointer flex-1 sm:flex-initial text-center justify-center flex items-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  {t.newWeighing || 'Timbang Baru'}
                </button>
                <button
                  id="btn-shortcut-inbound"
                  onClick={() => setActiveTab('MASUK')}
                  className="bg-yellow-450 hover:bg-yellow-400 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer flex-1 sm:flex-initial text-center justify-center flex items-center gap-1 uppercase"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  {t.recordInbound || 'BARANG MASUK'}
                </button>
              </div>
            </div>   

            {/* Unified Visual Stock Alert System */}
            {(() => {
              const lowStockProducts = (products || []).filter(p => (p.stockAvailable ?? 0) <= productThresholdLimit);
              const isCornAlert = cornStockBalance <= cornThresholdLimit;
              const isRiceAlert = riceStockBalance <= riceThresholdLimit;
              const hasAlerts = isCornAlert || isRiceAlert || lowStockProducts.length > 0;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-5 ${
                    hasAlerts 
                      ? 'bg-gradient-to-br from-amber-50 to-red-50/20 border-amber-300 shadow-md' 
                      : 'bg-gradient-to-br from-emerald-50/30 to-teal-50/10 border-emerald-250 shadow-sm'
                  } transition-all duration-300`}
                  id="dash-visual-alerts-panel"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${hasAlerts ? 'bg-amber-100 border border-amber-200 animate-pulse' : 'bg-emerald-100 border border-emerald-200'}`}>
                        <AlertCircle className={`w-4 h-4 ${hasAlerts ? 'text-amber-800 animate-bounce' : 'text-emerald-700'}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 font-sans flex items-center gap-1.5">
                          {hasAlerts ? 'Sistem Peringatan Dinamis Logistik Stok' : 'Status Inventaris Keamanan Level Hijau'}
                          {hasAlerts && <span className="inline-block w-2-h-2 rounded-full bg-red-500 animate-ping"></span>}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-medium font-sans">
                          {hasAlerts 
                            ? 'Beberapa persediaan komoditas telah mendekati atau menyentuh ambang kuantitas minimum.'
                            : 'Volume seluruh komoditas dan persediaan gudang saat ini berada pada batas aman operasional.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <span className="text-[9px] font-black uppercase text-neutral-400">STATUS RE-ORDER:</span>
                      <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full uppercase tracking-wider shadow-inner ${
                        hasAlerts 
                          ? 'bg-amber-150 text-amber-800 border border-amber-250 animate-pulse' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {hasAlerts ? '🚨 PERLU TINDAKAN' : '✅ AMAN (SAFE)'}
                      </span>
                    </div>
                  </div>

                  {hasAlerts ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Left Side: Commodities Warning */}
                        <div className="bg-white/80 p-4 rounded-xl border border-neutral-100 space-y-3.5">
                          <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                            <span>🌾</span> PEMANTAUAN KOMODITAS BULK (UTAMA)
                          </h5>
                          
                          <div className="space-y-3">
                            {/* Corn Warning */}
                            <div className={`p-3 rounded-lg border transition-all ${isCornAlert ? 'bg-red-50/40 border-red-150' : 'bg-neutral-50/50 border-neutral-150'}`}>
                              <div className="flex justify-between items-start mb-1.5">
                                <div>
                                  <span className="text-xs font-bold text-neutral-800">🌽 Jagung Pipilan Kasar</span>
                                  <p className="text-[9px] text-neutral-500">Ambang Batas Minim: {cornThresholdLimit.toLocaleString('id-ID')} Kg</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isCornAlert ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {isCornAlert ? '🚨 RE-ORDER' : 'OK'}
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isCornAlert ? 'bg-red-500' : 'bg-emerald-550'}`}
                                  style={{ width: `${Math.min(100, Math.max(5, (cornStockBalance / (cornThresholdLimit || 1)) * 100))}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-bold mt-1.5">
                                <span className={isCornAlert ? 'text-red-650' : 'text-neutral-500'}>
                                  Stok: {cornStockBalance.toLocaleString('id-ID')} Kg
                                </span>
                                <span className="text-neutral-400">
                                  {Math.round((cornStockBalance / (cornThresholdLimit || 1)) * 100)}% dari batas
                                </span>
                              </div>
                              {isCornAlert && (
                                <div className="mt-2 pt-2 border-t border-red-50/50 text-[9px] font-bold text-red-800 leading-relaxed font-sans bg-red-100/30 p-1.5 rounded">
                                  👉 <strong>REKOMENDASI PEMBELIAN:</strong> Hubungi supplier jagung terdaftar untuk PO baru. Pengiriman outbound jagung harus dibatasi guna menjaga deposit minimum!
                                </div>
                              )}
                            </div>

                            {/* Rice Warning */}
                            <div className={`p-3 rounded-lg border transition-all ${isRiceAlert ? 'bg-red-50/40 border-red-150' : 'bg-neutral-50/50 border-neutral-150'}`}>
                              <div className="flex justify-between items-start mb-1.5">
                                <div>
                                  <span className="text-xs font-bold text-neutral-800">🌾 Beras Giling Premium</span>
                                  <p className="text-[9px] text-neutral-500">Ambang Batas Minim: {riceThresholdLimit.toLocaleString('id-ID')} Kg</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isRiceAlert ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {isRiceAlert ? '🚨 RE-ORDER' : 'OK'}
                                </span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isRiceAlert ? 'bg-red-500' : 'bg-emerald-550'}`}
                                  style={{ width: `${Math.min(100, Math.max(5, (riceStockBalance / (riceThresholdLimit || 1)) * 100))}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-bold mt-1.5">
                                <span className={isRiceAlert ? 'text-red-650' : 'text-neutral-500'}>
                                  Stok: {riceStockBalance.toLocaleString('id-ID')} Kg
                                </span>
                                <span className="text-neutral-400">
                                  {Math.round((riceStockBalance / (riceThresholdLimit || 1)) * 100)}% dari batas
                                </span>
                              </div>
                              {isRiceAlert && (
                                <div className="mt-2 pt-2 border-t border-red-50/50 text-[9px] font-bold text-red-800 leading-relaxed font-sans bg-red-100/30 p-1.5 rounded">
                                  👉 <strong>REKOMENDASI PEMBELIAN:</strong> Segera lakukan pengisian ulang (purchase restock). Pertimbangkan menolak pengiriman skala besar jika sisa cadangan kurang dari batas aman!
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Catalog Products Warning */}
                        <div className="bg-white/80 p-4 rounded-xl border border-neutral-100 flex flex-col justify-between space-y-3.5">
                          <div>
                            <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                              <span>📦</span> DAFTAR PRODUK KATALOG MENIPIS
                            </h5>
                            {lowStockProducts.length > 0 ? (
                              <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
                                {lowStockProducts.map(prod => (
                                  <div key={prod.id} className="flex justify-between items-center bg-amber-550/5 border border-amber-100 p-2 rounded-lg text-xs">
                                    <div className="font-sans">
                                      <span className="font-bold text-neutral-800 block">{prod.name}</span>
                                      <span className="text-[9px] text-neutral-500 font-medium font-mono">Batas: {productThresholdLimit.toLocaleString('id-ID')} Kg • Sisa: <strong className="text-red-600">{(prod.stockAvailable ?? 0).toLocaleString('id-ID')} Kg</strong></span>
                                    </div>
                                    <div className="text-right">
                                      <span className="inline-block text-[9px] font-black text-red-750 bg-red-50 px-2 py-1 rounded border border-red-100 shadow-3xs uppercase tracking-wider">
                                        Perlu Restock
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 bg-emerald-50/30 border border-emerald-100 text-center rounded-xl my-auto">
                                <p className="text-neutral-600 text-xs font-medium font-sans">Seluruh produk siap jual di dalam katalog terisi dengan volume tinggi dan aman.</p>
                              </div>
                            )}
                          </div>

                          {lowStockProducts.length > 0 && (
                            <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-[10px] text-indigo-900 leading-relaxed font-sans mt-auto">
                              💡 <strong>PETUNJUK PENGIRIMAN:</strong> Prioritaskan pengiriman produk katalog yang memiliki sisa stok mencukupi. Segera koordinasi dengan Bagian Logistik Produk untuk mempercepat proses penggilingan & pengepakan barang!
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-white/75 p-3 rounded-xl border border-emerald-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                      <p className="text-[11px] text-emerald-800 font-sans font-semibold">
                        Gudang US Bilibili 162 mendeteksi seluruh bahan baku utama dan produk jadi berada di atas zonasi alarm. Operasional rantai pasok berjalan normal dan optimal.
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Realtime Core KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dash-kpi-metrics-grid">
              
              {/* Corn Stock Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                id="card-metric-corn" 
                className={`bg-white border ${cornStockBalance <= cornThresholdLimit ? 'border-red-300 bg-red-50/10' : 'border-neutral-200'} p-4.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-between group`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">{t.cornStock || 'STOK JAGUNG GUDANG'}</span>
                  {cornStockBalance <= cornThresholdLimit && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                </div>
                <span className={`text-xl sm:text-2xl font-black ${cornStockBalance <= cornThresholdLimit ? 'text-red-650' : 'text-amber-650'} font-mono tracking-tight`}>
                  {(cornStockBalance ?? 0).toLocaleString('id-ID')} <span className="text-xs text-neutral-400 font-normal">{t.kgNetto || 'Kg'}</span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 uppercase font-black">
                  <span className="text-[#10b981] font-semibold">MSK: {(totalInboundCorn + manualCornIn).toLocaleString('id-ID')}</span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-red-500 font-semibold font-mono">KLR: {(totalOutboundCorn + manualCornOut).toLocaleString('id-ID')}</span>
                </div>
                </div>
                <div className={`w-10 h-10 ${cornStockBalance <= cornThresholdLimit ? 'bg-red-50' : 'bg-amber-50'} rounded-lg flex items-center justify-center border ${cornStockBalance <= cornThresholdLimit ? 'border-red-100' : 'border-amber-100'} group-hover:scale-110 transition duration-300 shrink-0`}>
                  <Package className={`${cornStockBalance <= cornThresholdLimit ? 'text-red-500' : 'text-amber-500'} w-5 h-5`} />
                </div>
              </motion.div>

              {/* Rice Stock Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
                id="card-metric-rice" 
                className={`bg-white border ${riceStockBalance <= riceThresholdLimit ? 'border-red-300 bg-red-50/10' : 'border-neutral-200'} p-4.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-between group`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">{t.riceStockLabel || 'STOK BERAS GUDANG'}</span>
                  {riceStockBalance <= riceThresholdLimit && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                </div>
                <span className={`text-xl sm:text-2xl font-black ${riceStockBalance <= riceThresholdLimit ? 'text-red-650' : 'text-emerald-800'} font-mono tracking-tight`}>
                  {(riceStockBalance ?? 0).toLocaleString('id-ID')} <span className="text-xs text-neutral-400 font-normal">{t.kgNetto || 'Kg'}</span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 uppercase font-black">
                  <span className="text-[#10b981] font-semibold font-mono">MSK: {(totalInboundRice + manualRiceIn).toLocaleString('id-ID')}</span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-red-500 font-semibold font-mono">KLR: {(totalOutboundRice + manualRiceOut).toLocaleString('id-ID')}</span>
                </div>
                </div>
                <div className={`w-10 h-10 ${riceStockBalance <= riceThresholdLimit ? 'bg-red-50' : 'bg-emerald-50'} rounded-lg flex items-center justify-center border ${riceStockBalance <= riceThresholdLimit ? 'border-red-100' : 'border-emerald-100'} group-hover:scale-110 transition duration-300 shrink-0`}>
                  <Package className={`${riceStockBalance <= riceThresholdLimit ? 'text-red-500' : 'text-emerald-650'} w-5 h-5`} />
                </div>
              </motion.div>

              {/* Active Weighbridge Queue Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.19, ease: "easeOut" }}
                id="card-metric-weighbridge" 
                onClick={() => setActiveTab('TIMBANG')}
                className="bg-white border border-neutral-200 p-4.5 rounded-xl shadow-sm hover:shadow hover:border-blue-300 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">ANTREAN JEMBATAN TIMBANGAN</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-800 font-mono tracking-tight flex items-center gap-1.5">
                    {tickets.filter(t => t.status === 'PENDING').length} <span className="text-[9px] text-[#2563eb] font-bold bg-blue-50 px-1.5 py-0.5 rounded leading-none">Truk</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1">
                    <span className="text-emerald-600 font-bold uppercase">SELESAI: {tickets.filter(t => t.status === 'COMPLETED').length}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-blue-600 font-black uppercase">BUKA UNIT TIMBANG</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 group-hover:scale-110 transition duration-300 shrink-0">
                  <Scale className="text-blue-600 w-5 h-5 animate-pulse" />
                </div>
              </motion.div>

              {/* Financial & Net Kas Card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.26, ease: "easeOut" }}
                id="card-metric-cash" 
                className="bg-white border border-neutral-200 p-4.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-between group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">{t.cashBalance || 'Kas & Keuangan Tunai'}</span>
                  {['admin', 'pimpinan'].includes(sessionUser?.role || '') ? (
                    <>
                      <span className={`text-base sm:text-[17px] font-black font-mono tracking-tight ${netKasBalance >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                        Rp {(netKasBalance ?? 0).toLocaleString('id-ID')}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1">
                        <span className="font-bold font-mono text-[9px] text-red-500">{t.supplierDebt || 'Hutang AP'}: Rp {(totalOutstandingDebts ?? 0).toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-base sm:text-[17px] font-black font-mono tracking-tight text-neutral-430 select-none">
                        Rp ••••••••
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-semibold mt-1 font-mono">
                        <span>🔒 {language === 'id' ? 'Khusus Pimpinan' : 'Management Only'}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border group-hover:scale-110 transition duration-300 shrink-0 ${['admin', 'pimpinan'].includes(sessionUser?.role || '') && netKasBalance < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <DollarSign className={`w-5 h-5 ${['admin', 'pimpinan'].includes(sessionUser?.role || '') && netKasBalance < 0 ? 'text-red-500' : 'text-emerald-600'}`} />
                </div>
              </motion.div>

            </div>

            {/* Middle Section: Double Column Operations Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-operational-details">
              
              {/* Column 1: Capacity Gauges & Logistic Flows Chart (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Physical Silo & Storage Capacities */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm" id="storage-utilization-panel">
                  <h3 className="font-bold text-neutral-800 text-xs sm:text-sm mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2 font-sans">
                    <Database className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5" />
                    Kapasitas Fisik Fasilitas & Silo Silase
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Silo 1 - Corn */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                        <span className="flex items-center gap-1 font-sans text-neutral-700">🌽 Silo Jagung Utama (Maks. 55.000 Kg)</span>
                        <span className="font-mono text-neutral-800">{(cornStockBalance ?? 0).toLocaleString('id-ID')} Kg ({Math.min(100, Math.round((cornStockBalance / 55000) * 100)) || 0}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                        <div 
                          className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.round((cornStockBalance / 55000) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Warehouse B - Rice */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                        <span className="flex items-center gap-1 font-sans text-neutral-700">🌾 Gudang Beras Utama (Maks. 110.000 Kg)</span>
                        <span className="font-mono text-neutral-800">{(riceStockBalance ?? 0).toLocaleString('id-ID')} Kg ({Math.min(100, Math.round((riceStockBalance / 110000) * 100)) || 0}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.round((riceStockBalance / 110000) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                <DashboardProductShowcase products={products} />

                    {/* Poles, Kipasan, & Gas Dryer Lane */}
                    <div>
                      {(() => {
                        const activeProcessingKg = serviceRecords.reduce((acc, s) => acc + s.weight, 0);
                        const percent = Math.min(100, Math.round((activeProcessingKg / 40000) * 100)) || 0;
                        return (
                          <>
                            <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1">
                              <span className="flex items-center gap-1 font-sans text-neutral-700">⚙️ Unit Poles & Dryer Gas (Beban Kumulatif)</span>
                              <span className="font-mono text-neutral-800">{(activeProcessingKg ?? 0).toLocaleString('id-ID')} Kg ({percent}%)</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                              <div 
                                className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-700"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Logistic Flow Trends - Custom SVG Chart */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm" id="cargo-volume-trends">
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-2">
                    <h3 className="font-bold text-neutral-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                      <Activity className="text-emerald-600 w-4 h-4 sm:w-5 sm:h-5" />
                      Arus Aktivitas Muatan Barang (5 Hari Terakhir)
                    </h3>
                    <div className="flex gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded"></span> Inbound
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <span className="inline-block w-2.5 h-2.5 bg-sky-500 rounded"></span> Outbound
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const getCargoFlowData = () => {
                      const list = [];
                      for (let i = 4; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const key = d.toISOString().split('T')[0];
                        
                        const inSum = inboundRecords.filter(r => r.date === key).reduce((acc, r) => acc + r.netWeight, 0);
                        const outSum = outboundRecords.filter(r => r.date === key).reduce((acc, r) => acc + r.totalWeight, 0);
                        
                        const labelParts = key.split('-');
                        const label = labelParts.length === 3 ? `${labelParts[2]}/${labelParts[1]}` : key;
                        list.push({ date: key, label, inbound: inSum, outbound: outSum });
                      }
                      return list;
                    };
                    const chartData = getCargoFlowData();
                    const maxVal = Math.max(...chartData.map(d => Math.max(d.inbound, d.outbound)), 4000);

                    return (
                      <div className="relative pt-4">
                        <div className="w-full h-44 sm:h-52 flex items-end justify-between px-2 sm:px-6 relative border-b border-neutral-200">
                          <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between pointer-events-none text-[8px] sm:text-[9px] font-mono text-neutral-400">
                            <div className="border-t border-dashed border-neutral-200 w-full pt-1">{(maxVal ?? 0).toLocaleString('id-ID')} Kg</div>
                            <div className="border-t border-dashed border-neutral-200 w-full pt-1">{(maxVal * 0.75).toLocaleString('id-ID')} Kg</div>
                            <div className="border-t border-dashed border-neutral-200 w-full pt-1">{(maxVal * 0.5).toLocaleString('id-ID')} Kg</div>
                            <div className="border-t border-dashed border-neutral-200 w-full pt-1">{(maxVal * 0.25).toLocaleString('id-ID')} Kg</div>
                          </div>

                          {chartData.map((d, index) => {
                            const inPct = maxVal > 0 ? (d.inbound / maxVal) * 90 : 0;
                            const outPct = maxVal > 0 ? (d.outbound / maxVal) * 90 : 0;
                            return (
                              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end z-10 px-1 sm:px-4">
                                <div className="flex items-end gap-1.5 w-full justify-center h-full pb-1">
                                  <div className="group/bar relative flex flex-col items-center justify-end w-4 sm:w-6 transition-all">
                                    <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 bg-[#122345] text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow z-40 whitespace-nowrap transition duration-200 leading-none">
                                      {(d.inbound ?? 0).toLocaleString('id-ID')} Kg
                                    </div>
                                    <div 
                                      className="bg-gradient-to-t from-emerald-600 to-emerald-400 hover:opacity-90 w-full rounded-t transition-all shadow-sm duration-500"
                                      style={{ height: `${Math.max(3, inPct)}%` }}
                                    ></div>
                                  </div>

                                  <div className="group/bar relative flex flex-col items-center justify-end w-4 sm:w-6 transition-all">
                                    <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 bg-[#122345] text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow z-40 whitespace-nowrap transition duration-200 leading-none">
                                      {(d.outbound ?? 0).toLocaleString('id-ID')} Kg
                                    </div>
                                    <div 
                                      className="bg-gradient-to-t from-sky-600 to-sky-400 hover:opacity-90 w-full rounded-t transition-all shadow-sm duration-500"
                                      style={{ height: `${Math.max(3, outPct)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-[10px] mt-1.5 font-bold font-mono text-neutral-500 leading-none">{d.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Column 2: System Warnings & Pending Invoices (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6" id="dashboard-critical-alerts">
                
                {/* Pending Services Fees & Receivables */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm" id="receives-logs-alert">
                  <h3 className="font-bold text-red-700 text-xs sm:text-sm mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2 font-sans">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-650 animate-pulse" />
                    Penagihan & Kewajiban Finansial Aktif
                  </h3>

                  <div className="flex flex-col gap-3.5">
                    <div>
                      <p className="text-[10px] uppercase font-mono font-bold text-orange-600 mb-1.5 flex justify-between">
                        <span>⚠️ Kewajiban Utang Pembelian (Supplier AP)</span>
                        <span className="underline hover:text-orange-700 cursor-pointer text-[10px]" onClick={() => setActiveTab('FINANCE')}>Kelola Keuangan</span>
                      </p>

                      {debts.filter(d => d.remainingBalance > 0).length === 0 ? (
                        <p className="text-neutral-400 text-xs italic bg-neutral-50 p-2 rounded">Semua Utang Supplier Sudah Lunas.</p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {debts.filter(d => d.remainingBalance > 0).slice(0, 2).map(d => (
                            <div key={d.id} className="bg-orange-50 border border-orange-100 rounded-lg p-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[#b45309]">{d.supplierName}</span>
                                <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{d.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-black text-red-700">Rp {(d.remainingBalance ?? 0).toLocaleString('id-ID')}</span>
                                <p className="text-[9px] text-neutral-500 leading-none">Sisa Tagihan</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-mono font-bold text-blue-700 mb-1.5 flex justify-between">
                        <span>💰 Piutang Jasa Poles/Kipas Belum Diambil</span>
                        <span className="underline hover:text-blue-800 cursor-pointer text-[10px]" onClick={() => setActiveTab('SERVICES')}>Kelola Jasa</span>
                      </p>

                      {serviceRecords.filter(s => s.paymentStatus === 'UNPAID').length === 0 ? (
                        <p className="text-neutral-400 text-xs italic bg-neutral-50 p-2 rounded">Semua Tagihan Jasa Poles Lunas.</p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {serviceRecords.filter(s => s.paymentStatus === 'UNPAID').slice(0, 2).map(s => (
                            <div key={s.id} className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-sky-950">{s.customerName}</span>
                                <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">{s.serviceType} | {s.weight.toLocaleString('id-ID')} Kg</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-black text-sky-850">Rp {s.totalFee.toLocaleString('id-ID')}</span>
                                <p className="text-[9px] text-[#cc6114] font-medium leading-none">Belum Bayar</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calibration checklist & system control status block */}
                <div className="bg-emerald-950 text-emerald-100 rounded-xl p-5 border border-emerald-900 shadow">
                  <h4 className="font-black text-xs text-yellow-350 tracking-wider uppercase mb-2 font-mono">Pemeriksaan Jembatan Timbang</h4>
                  <ul className="text-xs text-emerald-200 flex flex-col gap-2 mt-1">
                    <li className="flex items-start gap-1.5 leading-snug">
                      <span className="text-yellow-400 font-bold">✔</span>
                      <span><strong>Load Cell GST-9700</strong>: Terkoneksi (Kalibrasi sensor nol-beban aktif)</span>
                    </li>
                    <li className="flex items-start gap-1.5 leading-snug">
                      <span className="text-yellow-400 font-bold">✔</span>
                      <span><strong>Printer Kertas LX-310</strong>: Siap cetak (Fungsionalitas cetak tiket 3-rangkap aktif)</span>
                    </li>
                    <li className="flex items-start gap-1.5 leading-snug">
                      <span className="text-yellow-300 font-bold">✔</span>
                      <span><strong>Integrasi Kadar Air</strong>: Potongan refaksi basah jagung otomatis terpasang</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setActiveTab('REFAKSI')}
                    className="mt-4 w-full bg-[#bfef30] text-emerald-950 font-black text-xs hover:bg-[#dfe40c] px-4 py-2 rounded-lg transition"
                  >
                    Buka Panduan Potongan Refaksi KA
                  </button>
                </div>

              </div>

            </div>

            {/* LOWER SECTION: Integrated Database Live Activity Portals (5 Tabs list) */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm" id="integrated-records-pushed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="text-emerald-700 w-5 h-5 shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-black text-neutral-800 text-sm sm:text-base leading-tight">Portal Aktivitas Gudang & Timbangan Terpadu</h3>
                    <p className="text-[10px] text-neutral-500 font-mono">Arsip data diperbarui otomatis seiring perubahan transaksi di lapangan</p>
                  </div>
                </div>
                
                {/* Horizontal custom scrollable tab filter list inside feed */}
                <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1.5 sm:pb-0">
                  <button 
                    id="dash-feed-tab-weigh"
                    onClick={() => setDashFeedTab('WEIGH')}
                    className={`px-3 py-1.5 text-xs rounded-full font-bold cursor-pointer transition ${dashFeedTab === 'WEIGH' ? 'bg-[#0a2245] text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    Jembatan Timbang
                  </button>
                  <button 
                    id="dash-feed-tab-inbound"
                    onClick={() => setDashFeedTab('INBOUND')}
                    className={`px-3 py-1.5 text-xs rounded-full font-bold cursor-pointer transition ${dashFeedTab === 'INBOUND' ? 'bg-[#10b981] text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    Inbound (Barang Masuk)
                  </button>
                  <button 
                    id="dash-feed-tab-outbound"
                    onClick={() => setDashFeedTab('OUTBOUND')}
                    className={`px-3 py-1.5 text-xs rounded-full font-bold cursor-pointer transition ${dashFeedTab === 'OUTBOUND' ? 'bg-[#3b82f6] text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    Outbound (Barang Keluar)
                  </button>
                  <button 
                    id="dash-feed-tab-services"
                    onClick={() => setDashFeedTab('SERVICES')}
                    className={`px-3 py-1.5 text-xs rounded-full font-bold cursor-pointer transition ${dashFeedTab === 'SERVICES' ? 'bg-[#0ea5e9] text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                  >
                    Layanan Jasa Poles
                  </button>
                  {['admin', 'pimpinan'].includes(sessionUser?.role || '') && (
                    <button 
                      id="dash-feed-tab-finance"
                      onClick={() => setDashFeedTab('FINANCE')}
                      className={`px-3 py-1.5 text-xs rounded-full font-bold cursor-pointer transition ${dashFeedTab === 'FINANCE' ? 'bg-amber-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                    >
                      Arus Kas & Buku Besar
                    </button>
                  )}
                </div>
              </div>

              {/* Data tables container with responsive scrolls, styled beautifully */}
              <div className="overflow-x-auto custom-scrollbar border border-neutral-100 rounded-lg">
                
                {/* A. WEIGHBRIDGE SUB GRID */}
                {dashFeedTab === 'WEIGH' && (
                  <table className="w-full text-left text-xs text-neutral-600 min-w-[750px] font-sans">
                    <thead className="bg-[#122345] text-[#afcbff] font-mono tracking-wider font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">No. Tiket</th>
                        <th className="py-2.5 px-3">No. Polisi</th>
                        <th className="py-2.5 px-3">Komoditas / Muatan</th>
                        <th className="py-2.5 px-3">Supplier / Agen</th>
                        <th className="py-2.5 px-3 text-right">Berat Timbang 1 (Gross)</th>
                        <th className="py-2.5 px-3 text-right">Berat Timbang 2 (Tare)</th>
                        <th className="py-2.5 px-3 text-right">Netto Bersih</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {tickets.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6 text-neutral-400 italic">Belum ada catatan timbangan.</td></tr>
                      ) : (
                        tickets.slice(0, 5).map(tk => (
                          <tr key={tk.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-3 font-bold font-mono text-[#a03010]">{tk.ticketNo}</td>
                            <td className="py-2.5 px-3 font-semibold text-neutral-800">{tk.policeNo}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {tk.goodsName}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-neutral-800 font-medium">{tk.agency}</td>
                            <td className="text-right py-2.5 px-3 font-mono">{(tk.timbang1Weight ?? 0).toLocaleString('id-ID')} Kg</td>
                            <td className="text-right py-2.5 px-3 font-mono text-orange-600 font-semibold">
                              {(tk.timbang2Weight ?? 0) > 0 ? `${(tk.timbang2Weight ?? 0).toLocaleString('id-ID')} Kg` : '- -'}
                            </td>
                            <td className="text-right py-2.5 px-3 font-black text-emerald-600 font-mono">
                              {(tk.netWeight ?? 0).toLocaleString('id-ID')} Kg
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tk.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-750 animate-pulse border border-yellow-250'
                              }`}>
                                {tk.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* B. INBOUND SUB GRID */}
                {dashFeedTab === 'INBOUND' && (
                  <table className="w-full text-left text-xs text-neutral-600 min-w-[750px] font-sans">
                    <thead className="bg-[#0f766e] text-teal-100 font-mono tracking-wider font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal Datang</th>
                        <th className="py-2.5 px-3">No. Tiket</th>
                        <th className="py-2.5 px-3">No. Polisi</th>
                        <th className="py-2.5 px-3">Pemasok / Supplier</th>
                        <th className="py-2.5 px-3 text-right">Netto</th>
                        <th className="py-2.5 px-3 text-center">Kadar Air (KA)</th>
                        <th className="py-2.5 px-3">Sektor Gudang</th>
                        <th className="py-2.5 px-3 text-right">Nilai Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {inboundRecords.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6 text-neutral-400 italic">Belum ada catatan barang masuk.</td></tr>
                      ) : (
                        inboundRecords.slice(0, 5).map(r => (
                          <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono">{r.date}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-neutral-700">{r.ticketNo || '-'}</td>
                            <td className="py-2.5 px-3 font-bold text-neutral-800">{r.vehicleNo}</td>
                            <td className="py-2.5 px-3 text-neutral-800 font-semibold">{r.supplier}</td>
                            <td className="p-2 text-right font-black text-emerald-700 font-mono">{(r.netWeight ?? 0).toLocaleString('id-ID')} Kg</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.moistureContent > 16.0 ? 'bg-red-100 text-red-650 font-bold' : 'bg-green-50 text-green-700 font-bold border border-green-200 px-1 py-0.5'}`}>
                                {r.moistureContent}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-neutral-500 font-medium">{r.warehouseSection}</td>
                            <td className="text-right py-2.5 px-3 font-black font-mono text-neutral-800">Rp {(r.totalPrice ?? 0).toLocaleString('id-ID')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* C. OUTBOUND SUB GRID */}
                {dashFeedTab === 'OUTBOUND' && (
                  <table className="w-full text-left text-xs text-neutral-600 min-w-[750px] font-sans">
                    <thead className="bg-[#1d4ed8] text-blue-100 font-mono tracking-wider font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal Kirim</th>
                        <th className="py-2.5 px-3">No. Invoice</th>
                        <th className="py-2.5 px-3">No. Polisi</th>
                        <th className="py-2.5 px-3">Pelanggan / Buyer</th>
                        <th className="py-2.5 px-3">Komoditas</th>
                        <th className="py-2.5 px-3 text-right">Berat Kirim (Netto)</th>
                        <th className="py-2.5 px-3">Tujuan Pengiriman</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {outboundRecords.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6 text-neutral-400 italic">Belum ada catatan barang keluar.</td></tr>
                      ) : (
                        outboundRecords.slice(0, 5).map(r => (
                          <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono">{r.date}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-neutral-700">{r.invoiceNo}</td>
                            <td className="py-2.5 px-3 text-neutral-800 font-semibold">{r.vehicleNo}</td>
                            <td className="py-2.5 px-3 text-neutral-800 font-bold">{r.buyer}</td>
                            <td className="py-2.5 px-3 font-semibold text-neutral-700">{r.commodity}</td>
                            <td className="text-right py-2.5 px-3 font-black text-blue-750 font-mono">{(r.totalWeight ?? 0).toLocaleString('id-ID')} Kg</td>
                            <td className="py-2.5 px-3 text-neutral-500 font-medium">{r.destination}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* D. SERVICES SUB GRID */}
                {dashFeedTab === 'SERVICES' && (
                  <table className="w-full text-left text-xs text-neutral-600 min-w-[750px] font-sans">
                    <thead className="bg-[#0369a1] text-sky-100 font-mono tracking-wider font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal Proses</th>
                        <th className="py-2.5 px-3">Nama Petani / Customer</th>
                        <th className="py-2.5 px-3">Jenis Layanan</th>
                        <th className="py-2.5 px-3">Bahan Komoditas</th>
                        <th className="py-2.5 px-3 text-right">Berat Basah (Kg)</th>
                        <th className="py-2.5 px-3 text-right">Tarif / Kg</th>
                        <th className="py-2.5 px-3 text-right">Biaya Total</th>
                        <th className="py-2.5 px-3 text-center">Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {serviceRecords.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6 text-neutral-400 italic">Belum ada layanan jasa poles/dryer dicatatkan.</td></tr>
                      ) : (
                        serviceRecords.slice(0, 5).map(s => (
                          <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono">{s.date}</td>
                            <td className="py-2.5 px-3 text-neutral-800 font-bold">{s.customerName}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{s.serviceType}</span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-neutral-600">{s.commodity}</td>
                            <td className="text-right py-2.5 px-3 font-mono">{(s.weight ?? 0).toLocaleString('id-ID')} Kg</td>
                            <td className="text-right py-2.5 px-3 font-mono">Rp {s.ratePerKg}</td>
                            <td className="text-right py-2.5 px-3 font-black text-sky-800 font-mono">Rp {(s.totalFee ?? 0).toLocaleString('id-ID')}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-650'}`}>
                                {s.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* E. FINANCIAL MUTATIONS LEDGER SUB GRID */}
                {dashFeedTab === 'FINANCE' && (
                  <table className="w-full text-left text-xs text-neutral-600 min-w-[750px] font-sans">
                    <thead className="bg-[#9a3412] text-orange-100 font-mono tracking-wider font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal Catat</th>
                        <th className="py-2.5 px-3">Jenis Arus</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Keterangan Transaksi</th>
                        <th className="py-2.5 px-3">Pihak Terkait</th>
                        <th className="py-2.5 px-3 text-right">Nilai Mutasi</th>
                        <th className="py-2.5 px-3">Akun Buku Kas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {finances.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-6 text-neutral-400 italic">Belum ada mutasi keuangan dicatatkan.</td></tr>
                      ) : (
                        finances.slice(0, 5).map(f => (
                          <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono">{f.date}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                f.type === 'DEBIT' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {f.type === 'DEBIT' ? '📥 DEBIT' : '📤 KREDIT'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-neutral-700 text-[10px]">{f.category}</td>
                            <td className="py-2.5 px-3 text-neutral-800 font-medium">{f.description}</td>
                            <td className="py-2.5 px-3 text-neutral-600 font-semibold">{f.partyName || '-'}</td>
                            <td className={`text-right py-2.5 px-3 font-black font-mono ${f.type === 'DEBIT' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              Rp {(f.amount ?? 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-neutral-500">{f.bankAccount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

              </div>

              {/* View entire archives link */}
              <div className="text-center mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium font-mono text-[11px]">Memperlihatkan hingga 5 transaksi terbaru per kelompok kategori</span>
                <button
                  onClick={() => {
                    if (dashFeedTab === 'WEIGH') setActiveTab('TIMBANG');
                    else if (dashFeedTab === 'INBOUND') setActiveTab('MASUK');
                    else if (dashFeedTab === 'OUTBOUND') setActiveTab('KELUAR');
                    else if (dashFeedTab === 'SERVICES') setActiveTab('SERVICES');
                    else if (dashFeedTab === 'FINANCE') setActiveTab('FINANCE');
                  }}
                  className="text-[#0a2245] hover:text-[#0f386c] font-black transition flex items-center justify-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg border border-neutral-200 text-xs"
                >
                  Buka Portal Lengkap Arus Utama <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Storage Calibration Banner */}
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
                  <h4 className="font-bold text-sm text-yellow-350">Informasi Alur Jembatan Timbang & Refaksi US Bilibili 162</h4>
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
            employees={employees}
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
            employees={employees}
            laborRates={laborRates}
            cornMoistureRules={cornMoistureRules}
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
            employees={employees}
          />
        )}

        {/* VIEW 5: SERVICES LOGS */}
        {activeTab === 'SERVICES' && (
          <ServicesModule
            records={serviceRecords}
            employees={employees}
            customers={customers}
            onAddRecord={handleAddService}
            onUpdateRecord={handleUpdateService}
            onDeleteRecord={handleDeleteService}
          />
        )}

        {/* VIEW 6: REFAKSI CALCULATOR */}
        {activeTab === 'REFAKSI' && (
          <MoistureRefaksiModule rules={cornMoistureRules} />
        )}

        {/* VIEW 7: DRYER JAGUNG */}
        {activeTab === 'DRYER' && (
          <DryerModule 
            records={dryerRecords}
            onAddRecord={(r) => syncedSetDryerRecords(prev => [r, ...prev])}
            onUpdateRecord={(r) => syncedSetDryerRecords(prev => prev.map(old => old.id === r.id ? r : old))}
            onDeleteRecord={(id) => syncedSetDryerRecords(prev => prev.filter(old => old.id !== id))}
          />
        )}

        {/* VIEW 8: FINANCE, UTANG, MUTASI */}
        {activeTab === 'FINANCE' && (
          <FinanceModule
            debts={debts}
            finances={finances}
            employees={employees}
            banks={banks}
            categories={financeCategories}
            kasbons={kasbons}
            onAddKasbon={(r) => syncedSetKasbons(prev => [r, ...prev])}
            onDeleteKasbon={(id) => syncedSetKasbons(prev => prev.filter(x => x.id !== id))}
            inboundRecords={inboundRecords}
            outboundRecords={outboundRecords}
            serviceRecords={serviceRecords}
            dryerRecords={dryerRecords}
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
            dryerRecords={dryerRecords}
            riceStockRecords={riceStockRecords}
          />
        )}

        {/* VIEW 9: DATABASE MASTER */}
        {activeTab === 'DATABASE' && (
          <DatabaseMasterModule
            vehicles={vehicles}
            setVehicles={syncedSetVehicles}
            suppliers={suppliers}
            setSuppliers={syncedSetSuppliers}
            buyers={buyers}
            setBuyers={syncedSetBuyers}
            employees={employees}
            setEmployees={syncedSetEmployees}
            commodities={commodities}
            setCommodities={syncedSetCommodities}
            banks={banks}
            setBanks={syncedSetBanks}
            brokers={brokers}
            setBrokers={syncedSetBrokers}
            locations={locations}
            setLocations={syncedSetLocations}
            customers={customers}
            setCustomers={syncedSetCustomers}
            financeCategories={financeCategories}
            setFinanceCategories={syncedSetFinanceCategories}
            laborRates={laborRates}
            setLaborRates={syncedSetLaborRates}
            cornMoistureRules={cornMoistureRules}
            setCornMoistureRules={syncedSetCornMoistureRules}
            products={products}
            setProducts={syncedSetProducts}
            users={users}
            setUsers={syncedSetUsers}
            activityLogs={activityLogs}
            logAction={logAction}
          />
        )}

        {/* VIEW 10: STOK BERAS */}
        {activeTab === 'STOK_BERAS' && (
          <RiceStockModule
            records={riceStockRecords}
            inboundRecords={inboundRecords}
            outboundRecords={outboundRecords}
            employees={employees}
            onAddRecord={handleAddRiceStock}
            onUpdateRecord={handleUpdateRiceStock}
            onDeleteRecord={handleDeleteRiceStock}
          />
        )}

        {/* VIEW 11: PRODUK */}
        {activeTab === 'PRODUK' && <ProductModule sessionUser={sessionUser} products={products} />}

        {/* VIEW 12: KACANG IJO MODULE REMOVED AS IT IS INCLUDED IN STOK_BERAS (LOGISTIK) */}

          </div>
        </main>

        {/* FOOTER METADATA */}
        <footer className={`h-[42px] flex items-center border-t text-[11px] mt-auto transition-colors duration-300 ${theme.footerBg} ${theme.footerBorder} text-neutral-400`}>
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-center items-center text-center">
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
    </div>
  );
}
