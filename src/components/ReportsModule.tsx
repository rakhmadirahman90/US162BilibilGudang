/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  WeighbridgeTicket, 
  InboundRecord, 
  OutboundRecord, 
  ServiceRecord, 
  DebtRecord, 
  FinancialRecord,
  RiceStockRecord
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { DryerRecord } from './DryerModule';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  Scale, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wind, 
  DollarSign, 
  Filter, 
  AlertCircle,
  Briefcase,
  PieChart,
  Repeat,
  CheckCircle,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  FileCheck
} from 'lucide-react';
import { exportToCSV, printPDFReport } from '../utils/exportHelper';

interface ReportsModuleProps {
  tickets: WeighbridgeTicket[];
  inboundRecords: InboundRecord[];
  outboundRecords: OutboundRecord[];
  serviceRecords: ServiceRecord[];
  debts: DebtRecord[];
  finances: FinancialRecord[];
  dryerRecords: DryerRecord[];
  riceStockRecords: RiceStockRecord[];
}

type ReportTabSelection = 'RINGKASAN' | 'TIMBANGAN' | 'INBOUND' | 'OUTBOUND' | 'SERVICES' | 'FINANCE' | 'DRYER' | 'STOK_BERAS' | 'DEBTS';

export default function ReportsModule({
  tickets,
  inboundRecords,
  outboundRecords,
  serviceRecords,
  debts,
  finances,
  dryerRecords,
  riceStockRecords
}: ReportsModuleProps) {
  const { t } = useLanguage();
  // Navigation & Sub-activity Tabs
  const [activeSubTab, setActiveSubTab] = useState<ReportTabSelection>('RINGKASAN');

  // Multi-level Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [commodityFilter, setCommodityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reset Filters Function
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setCommodityFilter('ALL');
    setSearchQuery('');
  };

  // Helper date checker
  const isWithinDateRange = (itemDate: string) => {
    if (!itemDate) return true;
    const dateStr = itemDate.substring(0, 10); // Standard YYYY-MM-DD format
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  // --- FILTERED COMPUTATIONS ---
  
  // 1. Timbangan Filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (!isWithinDateRange(t.timbang1Time)) return false;
      if (commodityFilter !== 'ALL' && t.goodsName !== commodityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = t.ticketNo.toLowerCase().includes(q);
        const matchesPlate = t.policeNo.toLowerCase().includes(q);
        const matchesAgency = t.agency.toLowerCase().includes(q);
        if (!matchesTicket && !matchesPlate && !matchesAgency) return false;
      }
      return true;
    });
  }, [tickets, startDate, endDate, commodityFilter, searchQuery]);

  // 2. Inbound Filter
  const filteredInbound = useMemo(() => {
    return inboundRecords.filter(r => {
      if (!isWithinDateRange(r.date)) return false;
      if (commodityFilter !== 'ALL' && r.commodity !== commodityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSupplier = r.supplier.toLowerCase().includes(q);
        const matchesPlate = r.vehicleNo.toLowerCase().includes(q);
        const matchesTicket = r.ticketNo ? r.ticketNo.toLowerCase().includes(q) : false;
        if (!matchesSupplier && !matchesPlate && !matchesTicket) return false;
      }
      return true;
    });
  }, [inboundRecords, startDate, endDate, commodityFilter, searchQuery]);

  // 3. Outbound Filter
  const filteredOutbound = useMemo(() => {
    return outboundRecords.filter(r => {
      if (!isWithinDateRange(r.date)) return false;
      if (commodityFilter !== 'ALL' && r.commodity !== commodityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesBuyer = r.buyer.toLowerCase().includes(q);
        const matchesPlate = r.vehicleNo.toLowerCase().includes(q);
        const matchesInvoice = r.invoiceNo.toLowerCase().includes(q);
        if (!matchesBuyer && !matchesPlate && !matchesInvoice) return false;
      }
      return true;
    });
  }, [outboundRecords, startDate, endDate, commodityFilter, searchQuery]);

  // 4. Services Filter
  const filteredServices = useMemo(() => {
    return serviceRecords.filter(s => {
      if (!isWithinDateRange(s.date)) return false;
      if (commodityFilter !== 'ALL' && s.commodity !== commodityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = s.customerName.toLowerCase().includes(q);
        const matchesOperator = s.operatorName.toLowerCase().includes(q);
        const matchesType = s.serviceType.toLowerCase().includes(q);
        if (!matchesCustomer && !matchesOperator && !matchesType) return false;
      }
      return true;
    });
  }, [serviceRecords, startDate, endDate, commodityFilter, searchQuery]);

  // 5. Finances Filter
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      if (!isWithinDateRange(f.date)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = f.description.toLowerCase().includes(q);
        const matchesCat = f.category.toLowerCase().includes(q);
        const matchesAcc = f.bankAccount.toLowerCase().includes(q);
        const matchesParty = f.partyName ? f.partyName.toLowerCase().includes(q) : false;
        if (!matchesDesc && !matchesCat && !matchesAcc && !matchesParty) return false;
      }
      return true;
    });
  }, [finances, startDate, endDate, searchQuery]);

  // 6. Dryer Records Filter
  const filteredDryer = useMemo(() => {
    return dryerRecords.filter(r => {
      if (!isWithinDateRange(r.date)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = r.customerName.toLowerCase().includes(q);
        const matchesBatch = r.batchNo.toLowerCase().includes(q);
        const matchesOperator = r.operator.toLowerCase().includes(q);
        if (!matchesCustomer && !matchesBatch && !matchesOperator) return false;
      }
      return true;
    });
  }, [dryerRecords, startDate, endDate, searchQuery]);

  // 7. Rice Stock (Stok Beras) Filter
  const filteredRiceStock = useMemo(() => {
    return (riceStockRecords || []).filter(r => {
      if (!isWithinDateRange(r.date)) return false;
      if (commodityFilter !== 'ALL' && r.itemName !== commodityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesPlate = r.policeNo.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesItem = r.itemName.toLowerCase().includes(q);
        if (!matchesPlate && !matchesDesc && !matchesItem) return false;
      }
      return true;
    });
  }, [riceStockRecords, startDate, endDate, commodityFilter, searchQuery]);

  // 8. Debts (Utang Supplier) Filter
  const filteredDebts = useMemo(() => {
    return (debts || []).filter(d => {
      if (!isWithinDateRange(d.date)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSupplier = d.supplierName.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        if (!matchesSupplier && !matchesDesc) return false;
      }
      return true;
    });
  }, [debts, startDate, endDate, searchQuery]);

  // --- EXCEL & PDF EXPORTERS ---

  // Export 1. Tickets
  const handleExportTicketsExcel = () => {
    const headers = [
      'NO. TIKET', 'TIMBANGAN I', 'TIMBANGAN II', 'NO. POLISI', 'KOMODITAS', 
      'MITRA / AGEN', 'BERAT GROSS (KG)', 'BERAT TARE (KG)', 'POT. KARUNG (%)', 
      'REFAKSI KA (%)', 'BERAT NETTO (KG)', 'STATUS', 'CATATAN'
    ];
    const rows = filteredTickets.map(t => [
      t.ticketNo,
      t.timbang1Time,
      t.timbang2Time || '-',
      t.policeNo,
      t.goodsName,
      t.agency,
      t.timbang1Weight.toString(),
      t.timbang2Weight.toString(),
      t.bagDeductionPercent.toString(),
      t.refaksiPercent.toString(),
      t.netWeight.toString(),
      t.status,
      t.notes || ''
    ]);
    exportToCSV(headers, rows, 'Laporan_Arsip_Timbangan_Bilibili');
  };

  const handlePrintTicketsPDF = () => {
    const headers = [
      'NO. TIKET', 'WAKTU TIMBANG', 'NO. POLISI', 'KOMODITAS', 'AGEN / MITRA', 'GROSS (KG)', 'NETTO (KG)'
    ];
    const rows = filteredTickets.map(t => [
      t.ticketNo,
      t.timbang1Time.split(' ')[0],
      t.policeNo,
      t.goodsName,
      t.agency,
      t.timbang1Weight.toLocaleString('id-ID'),
      t.netWeight.toLocaleString('id-ID')
    ]);
    const totalGross = filteredTickets.reduce((sum, t) => sum + t.timbang1Weight, 0);
    const totalNet = filteredTickets.reduce((sum, t) => sum + t.netWeight, 0);
    const summaries = [
      { label: 'JUMLAH ANTRIAN', value: `${filteredTickets.length} TRUK` },
      { label: 'TOTAL TONASE GROSS', value: `${totalGross.toLocaleString('id-ID')} KG` },
      { label: 'TOTAL TONASE NETTO', value: `${totalNet.toLocaleString('id-ID')} KG` }
    ];
    printPDFReport('LAPORAN REKAPITULASI JEMBATAN TIMBANGAN', headers, rows, summaries);
  };

  // Export 2. Inbound Records
  const handleExportInboundExcel = () => {
    const headers = [
      'TANGGAL', 'NO. TIKET REF', 'NO. POLISI', 'SUPPLIER', 'KOMODITAS', 
      'TONASE GROSS (KG)', 'TONASE TARE (KG)', 'KADAR AIR (%)', 'REFAKSI KA (%)', 
      'POT. KARUNG (%)', 'TONASE NETTO (KG)', 'SEKTOR GUDANG', 'UPAH BURUH (RP)'
    ];
    const rows = filteredInbound.map(r => [
      r.date,
      r.ticketNo || '-',
      r.vehicleNo,
      r.supplier,
      r.commodity,
      r.grossWeight.toString(),
      r.tareWeight.toString(),
      r.moistureContent.toString(),
      r.refaksiKaPercent.toString(),
      r.bagDeductionPercent.toString(),
      r.netWeight.toString(),
      r.warehouseSection,
      r.laborCost.toString()
    ]);
    exportToCSV(headers, rows, 'Laporan_Barang_Masuk_Bilibili');
  };

  const handlePrintInboundPDF = () => {
    const headers = [
      'TANGGAL', 'NO. TIKET', 'NO. POLISI', 'NAMA SUPPLIER', 'KOMODITAS', 'SEKTOR GUDANG', 'NETTO (KG)'
    ];
    const rows = filteredInbound.map(r => [
      r.date,
      r.ticketNo || '-',
      r.vehicleNo,
      r.supplier,
      r.commodity,
      r.warehouseSection,
      r.netWeight.toLocaleString('id-ID')
    ]);
    const totalInboundNet = filteredInbound.reduce((sum, r) => sum + r.netWeight, 0);
    const totalLabor = filteredInbound.reduce((sum, r) => sum + r.laborCost, 0);
    const summaries = [
      { label: 'TOTAL PENERIMAAN', value: `${filteredInbound.length} TRANSAKSI` },
      { label: 'TOTAL TONASE BERSIH', value: `${totalInboundNet.toLocaleString('id-ID')} KG` },
      { label: 'TOTAL ONGKOS BURUH', value: `RP ${totalLabor.toLocaleString('id-ID')}` }
    ];
    printPDFReport('LAPORAN MUTASI PENERIMAAN BARANG MASUK', headers, rows, summaries);
  };

  // Export 3. Outbound Records
  const handleExportOutboundExcel = () => {
    const headers = [
      'TANGGAL', 'NO. INVOICE', 'NO. POLISI', 'PEMBELI (BUYER)', 'KOMODITAS', 
      'TOTAL TONASE NETTO (KG)', 'BURUH MUAT (RP)', 'TUJUAN KOTA', 'STATUS'
    ];
    const rows = filteredOutbound.map(r => [
      r.date,
      r.invoiceNo,
      r.vehicleNo,
      r.buyer,
      r.commodity,
      r.totalWeight.toString(),
      r.loadingLaborCost.toString(),
      r.destination,
      r.status
    ]);
    exportToCSV(headers, rows, 'Laporan_Barang_Keluar_Bilibili');
  };

  const handlePrintOutboundPDF = () => {
    const headers = [
      'TANGGAL', 'NO. INVOICE', 'PEMBELI (BUYER)', 'KOMODITAS', 'TUJUAN KOTA', 'STATUS', 'TONASE (KG)'
    ];
    const rows = filteredOutbound.map(r => [
      r.date,
      r.invoiceNo,
      r.buyer,
      r.commodity,
      r.destination,
      r.status,
      r.totalWeight.toLocaleString('id-ID')
    ]);
    const totalOutboundWeight = filteredOutbound.reduce((sum, r) => sum + r.totalWeight, 0);
    const totalOutboundLabor = filteredOutbound.reduce((sum, r) => sum + r.loadingLaborCost, 0);
    const summaries = [
      { label: 'TOTAL PENGIRIMAN', value: `${filteredOutbound.length} SJ` },
      { label: 'TOTAL TONASE TERKIRIM', value: `${totalOutboundWeight.toLocaleString('id-ID')} KG` },
      { label: 'TOTAL BIAYA PEMUATAN', value: `RP ${totalOutboundLabor.toLocaleString('id-ID')}` }
    ];
    printPDFReport('LAPORAN MUTASI PENGIRIMAN BARANG KELUAR', headers, rows, summaries);
  };

  // Export 4. Services Ledger
  const handleExportServicesExcel = () => {
    const headers = [
      'TANGGAL', 'NAMA PELANGGAN', 'JENIS LAYANAN', 'KETERANGAN BARANG', 
      'TONASE DIPROSES (KG)', 'TARIF/KG', 'TOTAL JASA (RP)', 'STATUS BAYAR', 'OPERATOR'
    ];
    const rows = filteredServices.map(s => [
      s.date,
      s.customerName,
      s.serviceType,
      s.commodity,
      s.weight.toString(),
      s.ratePerKg.toString(),
      s.totalFee.toString(),
      s.paymentStatus,
      s.operatorName
    ]);
    exportToCSV(headers, rows, 'Laporan_Jasa_Poles_Kipas_Bilibili');
  };

  const handlePrintServicesPDF = () => {
    const headers = [
      'TANGGAL', 'NAMA PELANGGAN', 'JENIS JASA', 'TONASE', 'TARIF', 'TOTAL BIAYA', 'PEMBAYARAN'
    ];
    const rows = filteredServices.map(s => [
      s.date,
      s.customerName,
      s.serviceType,
      `${s.weight.toLocaleString('id-ID')} Kg`,
      `Rp ${s.ratePerKg.toLocaleString('id-ID')}`,
      `Rp ${s.totalFee.toLocaleString('id-ID')}`,
      s.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'
    ]);
    const totalProcessingWeight = filteredServices.reduce((sum, s) => sum + s.weight, 0);
    const totalServiceIncome = filteredServices.reduce((sum, s) => sum + s.totalFee, 0);
    const summaries = [
      { label: 'TOTAL ORDER LAYANAN', value: `${filteredServices.length} PESANAN` },
      { label: 'TOTAL BERAT DIPROSES', value: `${totalProcessingWeight.toLocaleString('id-ID')} KG` },
      { label: 'TOTAL PENDAPATAN JASA', value: `RP ${totalServiceIncome.toLocaleString('id-ID')}` }
    ];
    printPDFReport('LAPORAN LAYANAN JASA POLES & KIPAS', headers, rows, summaries);
  };

  // Export 5. General Ledger (Finance Mutasi)
  const handleExportFinancesExcel = () => {
    const headers = [
      'TANGGAL CATAT', 'KATEGORI', 'KETERANGAN TRANSAKSI', 'JENIS ALIRAN', 
      'JUMLAH NOMINA (RP)', 'REKENING / KAS', 'MITRA PIHAK KEDUA'
    ];
    const rows = filteredFinances.map(f => [
      f.date,
      f.category,
      f.description,
      f.type,
      f.amount.toString(),
      f.bankAccount,
      f.partyName || '-'
    ]);
    exportToCSV(headers, rows, 'Laporan_Operasional_Kas_Bilibili');
  };

  const handlePrintFinancesPDF = () => {
    const headers = [
      'TANGGAL', 'KATEGORI', 'KETERANGAN MUTASI', 'KAS / AKUN', 'MASUK (DEBIT)', 'KELUAR (KREDIT)'
    ];
    const rows = filteredFinances.map(f => [
      f.date,
      f.category,
      f.description,
      f.bankAccount,
      f.type === 'DEBIT' ? `Rp ${f.amount.toLocaleString('id-ID')}` : '-',
      f.type === 'KREDIT' ? `Rp ${f.amount.toLocaleString('id-ID')}` : '-'
    ]);
    const totalDebit = filteredFinances.filter(f => f.type === 'DEBIT').reduce((sum, f) => sum + f.amount, 0);
    const totalKredit = filteredFinances.filter(f => f.type === 'KREDIT').reduce((sum, f) => sum + f.amount, 0);
    const summaries = [
      { label: 'BANYAK ALIRAN KAS', value: `${filteredFinances.length} MUTASI` },
      { label: 'TOTAL PEMASUKAN (DEBIT)', value: `RP ${totalDebit.toLocaleString('id-ID')}` },
      { label: 'TOTAL PENGELUARAN (KREDIT)', value: `RP ${totalKredit.toLocaleString('id-ID')}` },
      { label: 'SELISIH LABA BERSIH', value: `RP ${(totalDebit - totalKredit).toLocaleString('id-ID')}` }
    ];
    printPDFReport('LAPORAN BUKU KEUANGAN DAN ALIRAN KAS', headers, rows, summaries);
  };

  // Export 6. Rice Stock (Mutasi Stok Beras & Gilingan)
  const handleExportRiceStockExcel = () => {
    const headers = [
      'TANGGAL', 'NO. POLISI', 'KETERANGAN', 'NAMA KOMODITAS', 'HARGA BELI (RP/KG)', 
      'KARUNG (COLLY)', 'MASUK (KG)', 'KELUAR (KG)'
    ];
    const rows = filteredRiceStock.map(r => [
      r.date,
      r.policeNo,
      r.description,
      r.itemName,
      r.price.toString(),
      r.colly.toString(),
      r.inWeight.toString(),
      r.outWeight.toString()
    ]);
    exportToCSV(headers, rows, 'Laporan_Mutasi_Stok_Bilibili');
  };

  const handlePrintRiceStockPDF = () => {
    const headers = [
      'TANGGAL', 'NO. POLISI', 'KETERANGAN', 'KOMODITAS', 'MASUK (KG)', 'KELUAR (KG)'
    ];
    const rows = filteredRiceStock.map(r => [
      r.date,
      r.policeNo,
      r.description,
      r.itemName,
      r.inWeight.toLocaleString('id-ID'),
      r.outWeight.toLocaleString('id-ID')
    ]);
    const totalIn = filteredRiceStock.reduce((sum, r) => sum + r.inWeight, 0);
    const totalOut = filteredRiceStock.reduce((sum, r) => sum + r.outWeight, 0);
    const netBalance = totalIn - totalOut;
    const summaries = [
      { label: 'BANYAK CATATAN MUTASI', value: `${filteredRiceStock.length} BARIS` },
      { label: 'TOTAL VOLUME MASUK', value: `${totalIn.toLocaleString('id-ID')} KG` },
      { label: 'TOTAL VOLUME KELUAR', value: `${totalOut.toLocaleString('id-ID')} KG` },
      { label: 'SALDO STOK BERSIH', value: `${netBalance.toLocaleString('id-ID')} KG` }
    ];
    printPDFReport('LAPORAN MUTASI BUKU STOK GUDANG', headers, rows, summaries);
  };

  // Export 7. Debts (Utang Supplier)
  const handleExportDebtsExcel = () => {
    const headers = [
      'TANGGAL', 'NAMA SUPPLIER', 'DESKRIPSI/KETERANGAN', 'TOTAL UTANG (RP)', 
      'SUDAH DIBAYAR (RP)', 'SISA UTANG (RP)', 'STATUS'
    ];
    const rows = filteredDebts.map(d => [
      d.date,
      d.supplierName,
      d.description,
      d.totalDebt.toString(),
      d.paidAmount.toString(),
      d.remainingBalance.toString(),
      d.status
    ]);
    exportToCSV(headers, rows, 'Laporan_Buku_Utang_Supplier');
  };

  const handlePrintDebtsPDF = () => {
    const headers = [
      'TANGGAL', 'NAMA PEMASOK', 'KETERANGAN UTANG', 'TOTAL UTANG', 'PAID / DIBAYAR', 'SISA SALDO'
    ];
    const rows = filteredDebts.map(d => [
      d.date,
      d.supplierName,
      d.description,
      `Rp ${d.totalDebt.toLocaleString('id-ID')}`,
      `Rp ${d.paidAmount.toLocaleString('id-ID')}`,
      `Rp ${d.remainingBalance.toLocaleString('id-ID')}`
    ]);
    const totalD = filteredDebts.reduce((sum, d) => sum + d.totalDebt, 0);
    const totalP = filteredDebts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalR = filteredDebts.reduce((sum, d) => sum + d.remainingBalance, 0);
    const summaries = [
      { label: 'BANYAK FAKTUR UTANG', value: `${filteredDebts.length} INVOICE` },
      { label: 'TOTAL PEMBELIAN UTANG', value: `RP ${totalD.toLocaleString('id-ID')}` },
      { label: 'TOTAL ANGSURAN TERBAYAR', value: `RP ${totalP.toLocaleString('id-ID')}` },
      { label: 'SISA SALDO JATUH TEMPO', value: `RP ${totalR.toLocaleString('id-ID')}` }
    ];
    printPDFReport('LAPORAN CATATAN BUKU UTANG SUPPLIER', headers, rows, summaries);
  };

  // --- EXECUTIVE EXECUTIVE CALCULATIONS FOR RINGKASAN VIEW ---
  const consolidatedStats = useMemo(() => {
    const totalInboundNet = inboundRecords.reduce((sum, r) => sum + r.netWeight, 0);
    const totalOutboundWeight = outboundRecords.reduce((sum, r) => sum + r.totalWeight, 0);
    
    // Inbound commodity distribution
    const inboundCorn = inboundRecords.filter(r => r.commodity === 'JAGUNG').reduce((sum, r) => sum + r.netWeight, 0);
    const inboundRice = inboundRecords.filter(r => r.commodity === 'BERAS').reduce((sum, r) => sum + r.netWeight, 0);

    // Services
    const totalServiceIncome = serviceRecords.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + s.totalFee, 0);
    
    // Finance
    const totalDebit = finances.filter(f => f.type === 'DEBIT').reduce((sum, f) => sum + f.amount, 0);
    const totalKredit = finances.filter(f => f.type === 'KREDIT').reduce((sum, f) => sum + f.amount, 0);
    const totalRemainingDebts = debts.filter(d => d.status === 'BELUM_LUNAS').reduce((sum, d) => sum + d.remainingBalance, 0);

    return {
      totalTonaseMasuk: totalInboundNet,
      totalTonaseKeluar: totalOutboundWeight,
      tonaseCorn: inboundCorn,
      tonaseRice: inboundRice,
      totalLayananOrder: serviceRecords.length,
      jasaIncome: totalServiceIncome,
      netKasBalance: totalDebit - totalKredit,
      sisaUtangSupplier: totalRemainingDebts,
      totalDebit,
      totalKredit
    };
  }, [inboundRecords, outboundRecords, serviceRecords, finances, debts]);

  return (
    <div className="flex flex-col gap-6" id="reports-portal-module">
      
      {/* HEADER SECTION WITH TITLE */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-neutral-800 text-base sm:text-lg flex items-center gap-2">
              <SlidersHorizontal className="text-emerald-600 w-5 h-5" />
              {t.reportsTitle}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Pusat audit digital US Bilibili 162. Siapkan rekapitulasi data, saring transaksi per rentang tanggal waktu, export ke file spreadsheet Microsoft Excel (CSV) dan siapkan cetak dokumen fisik atau simpan format PDF.
            </p>
          </div>
          
          <button 
            onClick={handleResetFilters}
            className="self-start md:self-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-3.5 py-1.5 rounded-lg border border-neutral-300 transition cursor-pointer"
          >
            Bersihkan Saringan Filter
          </button>
        </div>

        {/* COMPREHENSIVE FILTER CONSOLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-neutral-100">
          
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Mulai Tanggal
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-neutral-55 border border-neutral-250 rounded-lg text-neutral-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Hingga Tanggal
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-neutral-55 border border-neutral-250 rounded-lg text-neutral-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Filter Commodity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              Saring Komoditas
            </label>
            <select
              value={commodityFilter}
              onChange={e => setCommodityFilter(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-neutral-55 border border-neutral-250 rounded-lg text-neutral-700 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">📦 SEMUA KOMODITAS</option>
              <option value="JAGUNG">🌽 JAGUNG PIPIL</option>
              <option value="BERAS">🌾 BERAS PREMIUM</option>
              <option value="GABAH">🌾 GABAH KERING</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              Kata Kunci Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Cari Agen, No. Polisi, Plat, Mitra..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-neutral-55 border border-neutral-250 rounded-lg text-neutral-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

        </div>
      </div>

      {/* HORIZONTAL REPORTS TAB NAVIGATOR */}
      <div className="flex border-b border-neutral-200 overflow-x-auto gap-1 bg-white p-1 rounded-xl shadow-sm border custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('RINGKASAN')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'RINGKASAN'
              ? 'bg-emerald-950 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Ringkasan Eksekutif
        </button>

        <button
          onClick={() => setActiveSubTab('TIMBANGAN')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'TIMBANGAN'
              ? 'bg-blue-900 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          Timbangan ({filteredTickets.length})
        </button>

        <button
          onClick={() => setActiveSubTab('INBOUND')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'INBOUND'
              ? 'bg-emerald-800 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          BM ({filteredInbound.length})
        </button>

        <button
          onClick={() => setActiveSubTab('OUTBOUND')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'OUTBOUND'
              ? 'bg-indigo-900 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          BK ({filteredOutbound.length})
        </button>

        <button
          onClick={() => setActiveSubTab('DRYER')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'DRYER'
              ? 'bg-orange-600 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <Wind className="w-4 h-4" />
          Dryer ({filteredDryer.length})
        </button>

        <button
          onClick={() => setActiveSubTab('SERVICES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'SERVICES'
              ? 'bg-sky-800 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <Repeat className="w-4 h-4" />
          Jasa Poles ({filteredServices.length})
        </button>

        <button
          onClick={() => setActiveSubTab('FINANCE')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'FINANCE'
              ? 'bg-stone-850 bg-stone-900 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Keuangan ({filteredFinances.length})
        </button>

        <button
          onClick={() => setActiveSubTab('STOK_BERAS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'STOK_BERAS'
              ? 'bg-amber-800 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Stok Beras & Giling ({filteredRiceStock.length})
        </button>

        <button
          onClick={() => setActiveSubTab('DEBTS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'DEBTS'
              ? 'bg-red-800 text-white'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Utang Supplier ({filteredDebts.length})
        </button>
      </div>

      {/* SUB TAB VIEWS */}
      <div className="min-h-[400px]">

        {/* 1. RINGKASAN EKSEKUTIF (EXECUTIVE DIAGRAM PANEL) */}
        {activeSubTab === 'RINGKASAN' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-wider text-neutral-400 block uppercase font-mono">Total Tonase Masuk</span>
                  <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                    {(consolidatedStats.totalTonaseMasuk / 1000).toFixed(2)} <span className="text-xs text-neutral-500">Ton</span>
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1">Total berat netto beras, jagung yang diterima gudang.</p>
                </div>
                <div className="h-1 bg-emerald-100 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-wider text-neutral-400 block uppercase font-mono">Total Tonase Keluar</span>
                  <span className="text-2xl font-black text-blue-800 font-mono mt-1 block">
                    {(consolidatedStats.totalTonaseKeluar / 1000).toFixed(2)} <span className="text-xs text-neutral-500">Ton</span>
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1">Total berat pengeluaran ke pembeli/rekanan.</p>
                </div>
                <div className="h-1 bg-blue-100 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-wider text-neutral-400 block uppercase font-mono">Net Saldo Kas & Bank</span>
                  <span className="text-xl font-bold font-mono mt-1 block text-neutral-800">
                    Rp {consolidatedStats.netKasBalance.toLocaleString('id-ID')}
                  </span>
                  <p className="text-[10px] text-neutral-300 mt-1"><span className="text-emerald-600">Inflows: Rp {consolidatedStats.totalDebit.toLocaleString('id-ID')}</span></p>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-stone-700 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black tracking-wider text-neutral-400 block uppercase font-mono">Utang Dagang Tertunggak</span>
                  <span className="text-xl font-bold font-mono mt-1 block text-red-600">
                    Rp {consolidatedStats.sisaUtangSupplier.toLocaleString('id-ID')}
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1">Kewajiban berjalan buku utang pada mitra.</p>
                </div>
                <div className="h-1 bg-red-105 rounded-full overflow-hidden mt-4 bg-red-100">
                  <div className="h-full bg-red-650 rounded-full bg-red-600" style={{ width: '40%' }}></div>
                </div>
              </div>

            </div>

            {/* Custom Interactive visual bar indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Commodity Ratio */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-neutral-800 text-xs tracking-wider uppercase border-b border-neutral-100 pb-2 mb-4 flex items-center justify-between">
                  <span>Distribusi Logistik Timbangan (Tonase Bersih)</span>
                  <span className="text-neutral-400 font-mono text-[10px]">Perbandingan Beras vs Jagung</span>
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>🌽 Jagung Pipil Basah & Kering</span>
                      <span>{(consolidatedStats.tonaseCorn / 1000).toLocaleString('id-ID')} Ton</span>
                    </div>
                    <div className="h-4 bg-amber-50 rounded border border-amber-200 overflow-hidden flex">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.max(10, Math.min(100, (consolidatedStats.tonaseCorn / (consolidatedStats.totalTonaseMasuk || 1)) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>🌾 Beras Giling GSC</span>
                      <span>{(consolidatedStats.tonaseRice / 1000).toLocaleString('id-ID')} Ton</span>
                    </div>
                    <div className="h-4 bg-emerald-50 rounded border border-emerald-200 overflow-hidden flex">
                      <div className="h-full bg-emerald-600" style={{ width: `${Math.max(10, Math.min(100, (consolidatedStats.tonaseRice / (consolidatedStats.totalTonaseMasuk || 1)) * 100))}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-dashed border-neutral-200 leading-relaxed mt-2">
                    💡 Perbandingan kontribusi berat logistik yang masuk ke jembatan timbang menunjukkan komoditas utama yang sedang terparkir atau diproses di sektor lumbung.
                  </div>
                </div>
              </div>

              {/* Finance Inflows Outflows */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-neutral-800 text-xs tracking-wider uppercase border-b border-neutral-100 pb-2 mb-4 flex items-center justify-between">
                  <span>Kinerja Aliran Dana Keuangan</span>
                  <span className="text-neutral-400 font-mono text-[10px]">Debit vs Kredit Mutasi</span>
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1 font-mono">
                      <span>📉 Total Pengeluaran (Kredit Operasional)</span>
                      <span>Rp {consolidatedStats.totalKredit.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="h-3 bg-red-50 rounded overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${Math.max(10, Math.min(100, (consolidatedStats.totalKredit / ((consolidatedStats.totalDebit + consolidatedStats.totalKredit) || 1)) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1 font-mono">
                      <span>📈 Total Pemasukan (Debit Operasi)</span>
                      <span>Rp {consolidatedStats.totalDebit.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="h-3 bg-green-50 rounded overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: `${Math.max(10, Math.min(100, (consolidatedStats.totalDebit / ((consolidatedStats.totalDebit + consolidatedStats.totalKredit) || 1)) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-dashed border-neutral-200 leading-relaxed mt-2 font-mono flex justify-between items-center">
                    <span>Kas Berjalan Bersih (Net Margin):</span>
                    <strong className={`text-xs ${consolidatedStats.netKasBalance >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      Rp {consolidatedStats.netKasBalance.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick action info banner */}
            <div className="bg-gradient-to-r from-[#032e5c] to-indigo-950 text-indigo-50 border border-indigo-900 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-lg text-yellow-300">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-yellow-400">Siap Cetak Dokumen Resmi</h4>
                  <p className="text-[11px] text-indigo-200 mt-0.5">Ekstrasi laporan terfilter menggunakan Kop Surat US Bilibili 162 Resmi, lengkap dengan tanggal cetak digital dan garis tanda tangan penanggung jawab.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setActiveSubTab('TIMBANGAN')} 
                  className="bg-white text-indigo-950 font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
                >
                  Ekspor Arsip
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. TIMBANGAN REPORTS (WEIGHBRIDGE) */}
        {activeSubTab === 'TIMBANGAN' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Laporan Jembatan Timbang</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredTickets.length} baris data sesuai saringan Anda.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportTicketsExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintTicketsPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2 font-mono">No. Tiket</th>
                    <th className="p-2">Waktu Timbang</th>
                    <th className="p-2">No. Polisi</th>
                    <th className="p-2">Komoditas</th>
                    <th className="p-2">Agen/Mitra</th>
                    <th className="p-2 text-right">Timbang I (Kg)</th>
                    <th className="p-2 text-right">Timbang II (Kg)</th>
                    <th className="p-2 text-right font-black">Netto Bersih</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTickets.map(t => (
                    <tr key={t.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 font-bold text-red-700 font-mono">{t.ticketNo}</td>
                      <td className="p-2 text-neutral-500 text-[10px]">{t.timbang1Time}</td>
                      <td className="p-2 font-semibold text-neutral-800">{t.policeNo}</td>
                      <td className="p-2 font-bold text-neutral-700 text-[10px]">
                        <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.5 rounded uppercase">{t.goodsName}</span>
                      </td>
                      <td className="p-2 text-neutral-800 font-medium">{t.agency}</td>
                      <td className="p-2 text-right font-mono">{t.timbang1Weight.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-mono">{t.timbang2Weight > 0 ? t.timbang2Weight.toLocaleString('id-ID') : '-'}</td>
                      <td className="p-2 text-right font-black text-emerald-600 font-mono">{t.netWeight.toLocaleString('id-ID')} Kg</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-400 italic">Tidak ada transaksi timbangan yang sesuai saringan filter Anda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 3. BARANG MASUK (INBOUND) */}
        {activeSubTab === 'INBOUND' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Laporan Penerimaan Barang Masuk</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredInbound.length} baris log masuk gudang.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportInboundExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintInboundPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2 font-mono">No. Tiket Ref</th>
                    <th className="p-2">No. Polisi</th>
                    <th className="p-2">Nama Supplier</th>
                    <th className="p-2">Komoditas</th>
                    <th className="p-2 text-right">Bruto (Kg)</th>
                    <th className="p-2 text-right">Netto (Kg)</th>
                    <th className="p-2">Letak Sektor</th>
                    <th className="p-2 text-right">Buruh (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredInbound.map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 font-semibold text-neutral-600">{r.date}</td>
                      <td className="p-2 font-mono text-neutral-450">{r.ticketNo || '-'}</td>
                      <td className="p-2 font-semibold text-neutral-800">{r.vehicleNo}</td>
                      <td className="p-2 text-neutral-850 font-medium">{r.supplier}</td>
                      <td className="p-2 text-neutral-700 font-bold text-[10px]">{r.commodity}</td>
                      <td className="p-2 text-right font-mono">{(r.grossWeight ?? 0).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-black text-emerald-800 font-mono">{(r.netWeight ?? 0).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-neutral-550 font-medium text-[10px]">{r.warehouseSection}</td>
                      <td className="p-2 text-right font-mono text-neutral-650">Rp {(r.laborCost ?? 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {filteredInbound.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-400 italic">Tidak ada log barang masuk yang ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 4. BARANG KELUAR (OUTBOUND) */}
        {activeSubTab === 'OUTBOUND' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Laporan Pengiriman Barang Keluar</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredOutbound.length} baris log surat jalan dari gudang.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportOutboundExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintOutboundPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2 font-mono">No. Invoice / SJ</th>
                    <th className="p-2">No. Polisi</th>
                    <th className="p-2">Pembeli</th>
                    <th className="p-2">Komoditas</th>
                    <th className="p-2 text-right">Tonase Bersih (Kg)</th>
                    <th className="p-2">Tujuan Kota</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOutbound.map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500">{r.date}</td>
                      <td className="p-2 font-mono text-indigo-800 font-semibold">{r.invoiceNo}</td>
                      <td className="p-2 font-semibold text-neutral-800">{r.vehicleNo}</td>
                      <td className="p-2 text-neutral-850 font-medium">{r.buyer}</td>
                      <td className="p-2 text-neutral-700 font-bold text-[10px]">{r.commodity}</td>
                      <td className="p-2 text-right font-bold text-neutral-800 font-mono">{r.totalWeight.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-neutral-600 font-medium text-[10px]">{r.destination}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          r.status === 'SHIPPED' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOutbound.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-400 italic">Tidak ada log barang keluar yang sesuai saringan filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 5. DRYER JAGUNG */}
        {activeSubTab === 'DRYER' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Laporan Rekapan Dryer</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredDryer.length} transaksi pengeringan jagung.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const headers = ['Tanggal', 'No. Batch', 'Pelanggan', 'Basah (Kg)', 'Kering (Kg)', 'Susut (Kg)', 'Biaya (Rp)', 'Status'];
                    exportToCSV(headers, filteredDryer.map(r => [r.date, r.batchNo, r.customerName, r.wetWeight.toString(), r.dryWeight.toString(), (r.wetWeight - r.dryWeight).toString(), r.totalCost.toString(), r.status]), 'Laporan_Rekapan_Dryer_Bilibili');
                  }}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={() => {
                    const headers = ['Tanggal', 'Batch', 'Pelanggan', 'Basah (Kg)', 'Kering (Kg)', 'Susut (Kg)', 'Total Biaya'];
                    const rows = filteredDryer.map(r => [r.date, r.batchNo, r.customerName, r.wetWeight.toLocaleString('id-ID'), r.dryWeight.toLocaleString('id-ID'), (r.wetWeight - r.dryWeight).toLocaleString('id-ID'), `Rp ${r.totalCost.toLocaleString('id-ID')}`]);
                    const totW = filteredDryer.reduce((a,b)=>a+b.wetWeight, 0);
                    const totD = filteredDryer.reduce((a,b)=>a+b.dryWeight, 0);
                    printPDFReport('Laporan Rekapan Dryer Jagung', headers, rows, [
                      {label:'Total Basah', value:`${totW.toLocaleString('id-ID')} Kg`},
                      {label:'Total Kering', value:`${totD.toLocaleString('id-ID')} Kg`},
                      {label:'Total Biaya', value:`Rp ${filteredDryer.reduce((a,b)=>a+b.totalCost,0).toLocaleString('id-ID')}`}
                    ]);
                  }}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal / Batch</th>
                    <th className="p-2">Pelanggan</th>
                    <th className="p-2 text-right">Basah (Kg)</th>
                    <th className="p-2 text-right">Kering (Kg)</th>
                    <th className="p-2 text-right">Susut (Kg)</th>
                    <th className="p-2 text-center">Biaya</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredDryer.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500"><div className="font-bold">{s.date}</div><div className="font-mono text-[9px]">{s.batchNo}</div></td>
                      <td className="p-2 font-semibold text-neutral-800">{s.customerName}</td>
                      <td className="p-2 text-right text-emerald-700 font-mono">{(s.wetWeight).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right text-emerald-700 font-mono">{(s.dryWeight).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right text-rose-600 font-mono font-bold">{(s.wetWeight - s.dryWeight).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-center text-neutral-800 font-mono">Rp {s.totalCost.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          s.status === 'SELESAI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDryer.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 italic">Tidak ada rekapan dryer yang cocok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. JASA POLES & KIPAS */}
        {activeSubTab === 'SERVICES' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Order Pemrosesan Jasa Poles Kipas</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredServices.length} baris rekap order jasa.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportServicesExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintServicesPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Nama Pelanggan</th>
                    <th className="p-2">Jenis Layanan</th>
                    <th className="p-2">Komoditas</th>
                    <th className="p-2 text-right">Berat (Kg)</th>
                    <th className="p-2 text-right">Tarif / Kg</th>
                    <th className="p-2 text-right font-bold">Total Nilai</th>
                    <th className="p-2 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredServices.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500">{s.date}</td>
                      <td className="p-2 font-bold text-neutral-800">{s.customerName}</td>
                      <td className="p-2 font-medium text-neutral-700 text-[10px]">{s.serviceType}</td>
                      <td className="p-2 text-neutral-550 font-medium">{s.commodity}</td>
                      <td className="p-2 text-right font-mono">{(s.weight ?? 0).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-mono">Rp {(s.ratePerKg ?? 0).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-bold text-sky-700 font-mono">Rp {(s.totalFee ?? 0).toLocaleString('id-ID')}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {s.paymentStatus === 'PAID' ? 'LUNAS' : 'TUNGGAKAN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral-400 italic">Tidak ada order jasa yang memenuhi saringan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 6. FINANCE MUTASI DAN UTANG */}
        {activeSubTab === 'FINANCE' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Aliran Mutasi Kas Keuangan</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredFinances.length} baris log jurnal operasional kas.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportFinancesExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintFinancesPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Kategori</th>
                    <th className="p-2">Keterangan Deskripsi</th>
                    <th className="p-2">Pihak Mitra</th>
                    <th className="p-2">Sirkuit Akun</th>
                    <th className="p-2 text-right">Debit (Masuk)</th>
                    <th className="p-2 text-right">Kredit (Keluar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredFinances.map(f => (
                    <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500">{f.date}</td>
                      <td className="p-2 font-bold text-neutral-600 text-[10px]">{f.category}</td>
                      <td className="p-2 font-medium text-neutral-800">{f.description}</td>
                      <td className="p-2 text-neutral-550">{f.partyName || '-'}</td>
                      <td className="p-2 font-medium text-[10px] text-neutral-600 font-mono">{f.bankAccount}</td>
                      <td className="p-2 text-right text-emerald-700 font-bold font-mono">
                        {f.type === 'DEBIT' ? `+ Rp ${f.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-2 text-right text-red-650 text-red-600 font-bold font-mono font-medium">
                        {f.type === 'KREDIT' ? `- Rp ${f.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredFinances.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 italic">Aktivitas pembukuan keuangan kosong pada penyaringan berkas ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 7. REKAP BUKU MUTASI STOK BERAS & GILING */}
        {activeSubTab === 'STOK_BERAS' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Mutasi Buku Stok Gudang</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredRiceStock.length} baris log mutasi stok gudang beras & gilingan.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportRiceStockExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintRiceStockPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">No. Polisi</th>
                    <th className="p-2">Keterangan Aktivitas</th>
                    <th className="p-2">Komoditas</th>
                    <th className="p-2 text-right">Harga (Rp)</th>
                    <th className="p-2 text-right text-emerald-700 font-bold">Masuk (Kg)</th>
                    <th className="p-2 text-right text-rose-600 font-bold">Keluar (Kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredRiceStock.map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500">{r.date}</td>
                      <td className="p-2 font-semibold text-neutral-800 uppercase">{r.policeNo}</td>
                      <td className="p-2 font-medium text-neutral-700">{r.description}</td>
                      <td className="p-2"><span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-bold uppercase text-[10px]">{r.itemName}</span></td>
                      <td className="p-2 text-right text-neutral-600 font-mono">Rp {r.price.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-black text-emerald-700 font-mono">{r.inWeight > 0 ? `${r.inWeight.toLocaleString('id-ID')} Kg` : '-'}</td>
                      <td className="p-2 text-right font-black text-rose-600 font-mono">{r.outWeight > 0 ? `${r.outWeight.toLocaleString('id-ID')} Kg` : '-'}</td>
                    </tr>
                  ))}
                  {filteredRiceStock.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 italic">Data mutasi stok beras & gilingan kosong pada penyaringan berkas ini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 8. REKAP CATATAN BUKU UTANG SUPPLIER */}
        {activeSubTab === 'DEBTS' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-neutral-100 pb-3">
              <div>
                <span className="font-extrabold text-neutral-800 text-sm">Pratinjau Catatan Buku Utang Supplier</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Menampilkan {filteredDebts.length} transaksi rincian saldo utang dagang.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDebtsExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
                <button
                  onClick={handlePrintDebtsPDF}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Laporan / PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-250">
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Nama Supplier</th>
                    <th className="p-2">Keterangan / Deskripsi</th>
                    <th className="p-2 text-right">Nilai Utang</th>
                    <th className="p-2 text-right">Sudah Dibayar</th>
                    <th className="p-2 text-right font-bold text-red-600">Sisa Saldo</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredDebts.map(d => (
                    <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-2 text-neutral-500">{d.date}</td>
                      <td className="p-2 font-bold text-neutral-800">{d.supplierName}</td>
                      <td className="p-2 text-neutral-600 font-medium">{d.description}</td>
                      <td className="p-2 text-right font-mono font-medium">Rp {d.totalDebt.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right text-emerald-700 font-mono">Rp {d.paidAmount.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right text-rose-600 font-mono font-bold">Rp {d.remainingBalance.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          d.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-red-105 bg-red-100 text-red-700'
                        }`}>
                          {d.status === 'LUNAS' ? 'LUNAS' : 'BELUM LUNAS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDebts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 italic">Tidak ada catatan utang supplier yang sesuai saringan filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
