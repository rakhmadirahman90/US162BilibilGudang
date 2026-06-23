import React, { useState } from 'react';
import { InboundRecord, OutboundRecord, ServiceRecord, FinancialRecord, DebtRecord } from '../types';
import { DryerRecord } from './DryerModule';
import { TrendingUp, TrendingDown, Calendar, Printer, Filter, DollarSign, ArrowUpRight, Scale, Activity, ArrowDownRight, Briefcase } from 'lucide-react';

interface ProfitLossTabProps {
  inboundRecords: InboundRecord[];
  outboundRecords: OutboundRecord[];
  serviceRecords: ServiceRecord[];
  dryerRecords: DryerRecord[];
  finances: FinancialRecord[];
  debts: DebtRecord[];
}

export default function ProfitLossTab({
  inboundRecords = [],
  outboundRecords = [],
  serviceRecords = [],
  dryerRecords = [],
  finances = [],
  debts = []
}: ProfitLossTabProps) {
  const [preset, setPreset] = useState<'ALL' | 'BULAN_INI' | 'MINGGU_INI' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Date Filtering function
  const isIncluded = (dateStr: string) => {
    if (!dateStr) return false;
    const itemDate = dateStr.split('T')[0];
    
    if (preset === 'ALL') return true;
    if (preset === 'MINGGU_INI') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const limit = d.toISOString().split('T')[0];
      return itemDate >= limit;
    }
    if (preset === 'BULAN_INI') {
      const d = new Date();
      d.setDate(1); // 1st of current month
      const limit = d.toISOString().split('T')[0];
      return itemDate >= limit;
    }
    return itemDate >= startDate && itemDate <= endDate;
  };

  // --- REVENUE CALCULATION ---
  // Outbound logistics treated as sales (using typical selling prices per kg)
  const SALES_PRICES = {
    BERAS: 15500,
    JAGUNG: 6800,
    GABAH: 5500,
    LAINNYA: 4500
  };

  const outboundSales = outboundRecords
    .filter(r => isIncluded(r.date))
    .reduce((acc, r) => {
      const price = SALES_PRICES[r.commodity] || SALES_PRICES.LAINNYA;
      return acc + (r.totalWeight * price);
    }, 0);

  // Polishing service revenue
  const polishRevenue = serviceRecords
    .filter(r => isIncluded(r.date))
    .reduce((acc, r) => acc + (r.totalFee || 0), 0);

  // Dryer revenue (Jasa Dryer)
  const dryerRecordsInPeriod = dryerRecords.filter(r => r.status === 'SELESAI' && isIncluded(r.date));
  const totalDryerTonnage = dryerRecordsInPeriod.reduce((sum, r) => sum + r.dryWeight, 0);
  const totalDryerRevenue = dryerRecordsInPeriod.reduce((sum, r) => sum + (r.dryWeight * r.dryingCostPerKg), 0);
  
  // Expenses for Dryer (Custom logic to pull from FinancialRecord/etc)
  const laborBuruhTimbang = finances.filter(f => isIncluded(f.date) && f.category === 'BURUH_TIMBANG_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const laborBuruhMuat = finances.filter(f => isIncluded(f.date) && f.category === 'BURUH_MUAT_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const biayaListrikDrying = finances.filter(f => isIncluded(f.date) && f.category === 'LISTRIK_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const gajiOperatorDrying = finances.filter(f => isIncluded(f.date) && f.category === 'GAJI_OPERATOR_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const biayaCangkang = finances.filter(f => isIncluded(f.date) && f.category === 'CANGKANG_KEMIRI').reduce((sum, f) => sum + f.amount, 0);
  const biayaTambahanDrying = finances.filter(f => isIncluded(f.date) && f.category === 'LAINNYA_DRYER').reduce((sum, f) => sum + f.amount, 0);
  
  const totalDryerExpenses = laborBuruhTimbang + laborBuruhMuat + biayaListrikDrying + gajiOperatorDrying + biayaCangkang + biayaTambahanDrying;
  const dryerProfit = totalDryerRevenue - totalDryerExpenses;

  // Cumulative Dryer Data (Accumulated Balance)
  const allCompletedDryerRecords = dryerRecords.filter(r => r.status === 'SELESAI');
  const allDryerRevenue = allCompletedDryerRecords.reduce((sum, r) => sum + (r.dryWeight * r.dryingCostPerKg), 0);
  
  const allLaborBuruhTimbang = finances.filter(f => f.category === 'BURUH_TIMBANG_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const allLaborBuruhMuat = finances.filter(f => f.category === 'BURUH_MUAT_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const allBiayaListrikDrying = finances.filter(f => f.category === 'LISTRIK_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const allGajiOperatorDrying = finances.filter(f => f.category === 'GAJI_OPERATOR_DRYER').reduce((sum, f) => sum + f.amount, 0);
  const allBiayaCangkang = finances.filter(f => f.category === 'CANGKANG_KEMIRI').reduce((sum, f) => sum + f.amount, 0);
  const allBiayaTambahanDrying = finances.filter(f => f.category === 'LAINNYA_DRYER').reduce((sum, f) => sum + f.amount, 0);
  
  const allDryerExpenses = allLaborBuruhTimbang + allLaborBuruhMuat + allBiayaListrikDrying + allGajiOperatorDrying + allBiayaCangkang + allBiayaTambahanDrying;
  const cumulativeDryerProfit = allDryerRevenue - allDryerExpenses;

  // Manual debit entries in Cash Ledger (excluding ones classified as REVENUE from above if they're double-tracked)
  const otherFinancialCredits = finances
    .filter(f => f.type === 'DEBIT' && isIncluded(f.date) && f.category !== 'POLES_KIPAS' && f.category !== 'TIMBANGAN' && f.category !== 'DRYER')
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  const totalRevenue = outboundSales + polishRevenue + totalDryerRevenue + otherFinancialCredits;


  // --- COST OF GOODS SOLD (HPP) ---
  // Raw material inbound purchase transactions paid to farmers/suppliers e.g. TONO
  const inboundPurchases = inboundRecords
    .filter(r => isIncluded(r.date))
    .reduce((acc, r) => acc + (r.totalPrice || 0), 0);

  // Makelar/Brokers fees
  const brokerCommissions = finances
    .filter(f => f.type === 'KREDIT' && f.category === 'MAKELAR' && isIncluded(f.date))
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  const totalHPP = inboundPurchases + brokerCommissions;
  const grossProfit = Math.max(0, totalRevenue - totalHPP);


  // --- OPERATIONAL EXPENSES (OPEX) ---
  // Inbound offload labor cost
  const inboundLaborCost = inboundRecords
    .filter(r => isIncluded(r.date))
    .reduce((acc, r) => acc + (r.laborCost || 0), 0);

  // Outbound loading labor cost
  const outboundLaborCost = outboundRecords
    .filter(r => isIncluded(r.date))
    .reduce((acc, r) => acc + (r.loadingLaborCost || 0), 0);

  // Completed dryer drying process labor costs
  const dryerLaborCost = dryerRecords
    .filter(r => r.status === 'SELESAI' && isIncluded(r.date))
    .reduce((acc, r) => acc + (r.laborCost || 0), 0);

  // Gaji staff admin/operasional
  const salaryCost = finances
    .filter(f => f.type === 'KREDIT' && f.category === 'GAJI_KARYAWAN' && isIncluded(f.date))
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  // BBM, Gas Dryer, Listrik gudang
  const utilitiesCost = finances
    .filter(f => f.type === 'KREDIT' && (f.category === 'LISTRIK_BBM' || f.category === 'OPERASIONAL') && isIncluded(f.date))
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  // Other operasional cash debits (any other credits not covered above)
  const otherExpenses = finances
    .filter(f => f.type === 'KREDIT' && f.category !== 'MAKELAR' && f.category !== 'GAJI_KARYAWAN' && f.category !== 'LISTRIK_BBM' && f.category !== 'OPERASIONAL' && isIncluded(f.date))
    .reduce((acc, f) => acc + (f.amount || 0), 0);

  const totalOpex = inboundLaborCost + outboundLaborCost + dryerLaborCost + salaryCost + utilitiesCost + otherExpenses;

  // --- FINAL METRIC ---
  const netProfit = totalRevenue - totalHPP - totalOpex;
  const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Outstanding accounts payable (AP) liabilities
  const totalOutstandingAP = debts
    .reduce((acc, d) => acc + (d.remainingBalance || 0), 0);

  const handlePrintPL = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker aktif. Gagal mencetak laporan.");
      return;
    }

    const netColor = netProfit >= 0 ? '#16a34a' : '#dc2626';
    const netWord = netProfit >= 0 ? 'LABA BERSIH (NET PROFIT)' : 'RUGI BERSIH (NET LOSS)';

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Laba Rugi Komprehensif - Gudang Bilibili</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #111827; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #e5e7eb; padding-bottom: 20px; }
            .header h1 { font-size: 22px; margin: 0; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; }
            .header h2 { font-size: 14px; margin: 5px 0 0 0; color: #4b5563; text-transform: uppercase; font-weight: normal; }
            .header p { font-family: monospace; font-size: 11px; color: #9ca3af; margin: 10px 0 0 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; background-color: #f3f4f6; padding: 6px 10px; margin-bottom: 10px; border-bottom: 2px solid #374151; letter-spacing: 0.05em; }
            .row { display: flex; justify-content: space-between; padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
            .row.subtotal { font-weight: bold; border-top: 1px solid #9ca3af; border-bottom: 2px solid #111827; background-color: #f9fafb; font-size: 11.5px; padding: 8px 10px; }
            .row.total { font-weight: 950; font-size: 13px; background-color: #111827; color: #ffffff; border-radius: 4px; padding: 10px; border: none; margin-top: 10px; }
            .indent { padding-left: 25px; color: #4b5563; }
            .right { text-align: right; font-family: monospace; font-size: 11px; font-weight: bold; }
            .right-total { text-align: right; font-family: monospace; font-size: 13px; font-weight: 950; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; }
            .sign { text-align: center; width: 180px; }
            .sign-line { border-bottom: 1px solid #111827; height: 50px; margin-bottom: 8px; }
            .desc { font-style: italic; color: #6b7280; font-size: 10px; margin-top: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GUDANG BILIBILI (KANTOR 162)</h1>
            <h2>Laporan Laba Rugi Komprehensif (Profit & Loss Statement)</h2>
            <p>PERIODE PRESET: ${preset.toUpperCase()} • TANGGAL CETAK: ${new Date().toLocaleDateString('id-ID')} • JAM: ${new Date().toLocaleTimeString('id-ID')}</p>
          </div>

          <!-- 1. REVENUE -->
          <div class="section">
            <div class="section-title">I. PENDAPATAN USAHA (OPERATING REVENUE)</div>
            <div class="row">
              <span class="indent">Penjualan Komoditi Jagung & Beras (Arus Outbound)</span>
              <span class="right">Rp ${outboundSales.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Pendapatan Jasa Poles & Gilingan Beras</span>
              <span class="right">Rp ${polishRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Pendapatan Jasa Pengeringan Jagung (Gas Dryer)</span>
              <span class="right">Rp ${totalDryerRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Pemasukan Kas & Jasa Timbangan Lainnya</span>
              <span class="right">Rp ${otherFinancialCredits.toLocaleString('id-ID')}</span>
            </div>
            <div class="row subtotal">
              <span>TOTAL PENDAPATAN KAS</span>
              <span class="right">Rp ${totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- RINCIAN LABA DRYER -->
          <div class="section">
            <div class="section-title">RINCIAN LABA DRYER JAGUNG</div>
            <div class="row">
              <span class="indent">Jasa Dryer (${totalDryerTonnage.toLocaleString('id-ID')} Kg)</span>
              <span class="right">Rp ${totalDryerRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Upah Buruh Timbang</span>
              <span class="right">Rp ${laborBuruhTimbang.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Upah Buruh Muat</span>
              <span class="right">Rp ${laborBuruhMuat.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Listrik Dryer</span>
              <span class="right">Rp ${biayaListrikDrying.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Gaji Operator Dryer</span>
              <span class="right">Rp ${gajiOperatorDrying.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Cangkang Kemiri</span>
              <span class="right">Rp ${biayaCangkang.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Pengeluaran Tambahan (Lainnya)</span>
              <span class="right">Rp ${biayaTambahanDrying.toLocaleString('id-ID')}</span>
            </div>
            <div class="row subtotal" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;">
              <span>JASA DRYER (LABA/RUGI)</span>
              <span class="right">Rp ${dryerProfit.toLocaleString('id-ID')}</span>
            </div>
            <div class="row" style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; margin-top: 5px;">
              <span>SALDO AKUMULASI JASA DRYER</span>
              <span class="right">Rp ${cumulativeDryerProfit.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- 2. COGS / HPP -->
          <div class="section">
            <div class="section-title">II. HARGA POKOK PENJUALAN (HPP / COST OF GOODS SOLD)</div>
            <div class="row">
              <span class="indent">Pembelian Gabah & Jagung Basah Timbangan (Arus Inbound)</span>
              <span class="right">Rp ${inboundPurchases.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Biaya Komisi Makelar (Brokerage Fees)</span>
              <span class="right">Rp ${brokerCommissions.toLocaleString('id-ID')}</span>
            </div>
            <div class="row subtotal">
              <span>TOTAL HARGA POKOK PENJUALAN</span>
              <span class="right">Rp ${totalHPP.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- GROSS PROFIT -->
          <div class="section">
            <div class="row subtotal" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;">
              <span>LABA KOTOR (GROSS MARGIN)</span>
              <span class="right">Rp ${grossProfit.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- 3. EXPENSES -->
          <div class="section">
            <div class="section-title">III. BEBAN OPERASIONAL (OPERATING EXPENSES)</div>
            <div class="row">
              <span class="indent">Beban Gaji Staff Administrasi & Operator</span>
              <span class="right">Rp ${salaryCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Beban Bahan Bakar (BBM solar, listrik, gas dryer)</span>
              <span class="right">Rp ${utilitiesCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Upah Buruh Bongkar Panggul (Arus Masuk)</span>
              <span class="right">Rp ${inboundLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Upah Buruh Muat Panggul (Arus Keluar)</span>
              <span class="right">Rp ${outboundLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Upah Buruh Dryer Panggul</span>
              <span class="right">Rp ${dryerLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span class="indent">Pengeluaran Kas Operasional Lainnya</span>
              <span class="right">Rp ${otherExpenses.toLocaleString('id-ID')}</span>
            </div>
            <div class="row subtotal">
              <span>TOTAL BEBAN OPERASIONAL (OPEX)</span>
              <span class="right">Rp ${totalOpex.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <!-- NET INCOME -->
          <div class="section" style="margin-top: 30px;">
            <div class="row total" style="background-color: ${netColor};">
              <span>${netWord}</span>
              <span class="right-total">Rp ${netProfit.toLocaleString('id-ID')}</span>
            </div>
            <div class="desc">* Margin laba bersih operasional berjalan: ${netMarginPercent.toFixed(2)}%</div>
          </div>

          <!-- LIABILITIES -->
          <div class="section" style="margin-top: 20px;">
            <div class="row" style="background-color: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 10px; font-weight: bold; border-radius: 4px;">
              <span>SISA KEWAJIBAN UTANG KE SUPPLIER JALAN (ACCOUNTS PAYABLE LIABILITIES)</span>
              <span class="right">Rp ${totalOutstandingAP.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div class="footer">
            <div class="sign">
              <p>Menerbitkan,</p>
              <div class="sign-line"></div>
              <p><b>Kepala Bagian Keuangan</b></p>
            </div>
            <div class="sign">
              <p>Mengetahui & Menyetujui,</p>
              <div class="sign-line"></div>
              <p><b>Pemilik Gudang Bilibili</b></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6" id="profit-loss-financial-cockpit">
      
      {/* 1. FILTER ENGINE */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h3 className="font-black text-neutral-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
            <Filter className="text-emerald-700 w-4 h-4 sm:w-5 sm:h-5" />
            Rentang Laporan Keuangan
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5 uppercase">
            Data dikalkulasi secara realtime dari seluruh faksi transaksi
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold w-full md:w-auto">
          
          {/* Presets */}
          <div className="flex bg-neutral-100 rounded-lg p-1 border border-neutral-200">
            <button
              onClick={() => setPreset('ALL')}
              className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-md transition cursor-pointer ${
                preset === 'ALL' ? 'bg-white text-emerald-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Semua Periode
            </button>
            <button
              onClick={() => setPreset('BULAN_INI')}
              className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-md transition cursor-pointer ${
                preset === 'BULAN_INI' ? 'bg-white text-emerald-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Bulan ini
            </button>
            <button
              onClick={() => setPreset('MINGGU_INI')}
              className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-md transition cursor-pointer ${
                preset === 'MINGGU_INI' ? 'bg-white text-emerald-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Minggu ini
            </button>
            <button
              onClick={() => setPreset('CUSTOM')}
              className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-md transition cursor-pointer ${
                preset === 'CUSTOM' ? 'bg-white text-emerald-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Kustom
            </button>
          </div>

          {/* Custom Date Picker inputs */}
          {preset === 'CUSTOM' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded p-1.5 focus:bg-white text-[10px]"
              />
              <span className="text-neutral-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded p-1.5 focus:bg-white text-[10px]"
              />
            </div>
          )}

          {/* Printer button */}
          <button
            onClick={handlePrintPL}
            className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-[10.5px] px-3.5 py-2.5 rounded-lg border border-indigo-700 transition cursor-pointer uppercase shadow-md active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" /> CETAK PRINT PDF
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC SCORECARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* REVENUE CARD */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">TOTAL OUTBOUND REVENUE</span>
            <span className="text-lg font-black text-emerald-700 font-mono mt-1 block">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            <span className="text-[9px] text-neutral-500 block uppercase mt-0.5">Penjualan bervariasi komoditi</span>
          </div>
        </div>

        {/* COGS (HPP) CARD */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 text-orange-650 p-3 rounded-full">
            <Scale className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">TOTAL COGS / HPP BELI</span>
            <span className="text-lg font-black text-[#c2410c] font-mono mt-1 block">Rp {totalHPP.toLocaleString('id-ID')}</span>
            <span className="text-[9px] text-neutral-500 block uppercase mt-0.5">Pembelian panen & makelar</span>
          </div>
        </div>

        {/* OPEX CARD */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">BEBAN OPEX GUDANG</span>
            <span className="text-lg font-black text-indigo-700 font-mono mt-1 block">Rp {totalOpex.toLocaleString('id-ID')}</span>
            <span className="text-[9px] text-neutral-500 block uppercase mt-0.5">Operasional & buruh panggul</span>
          </div>
        </div>

        {/* NET PROFIT/LOSS CARD */}
        <div className={`rounded-xl p-4 shadow-sm flex items-center gap-4 border ${
          netProfit >= 0 ? 'bg-emerald-50/50 border-emerald-250' : 'bg-red-50/50 border-red-250'
        }`}>
          <div className={`p-3 rounded-full ${
            netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {netProfit >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">
              {netProfit >= 0 ? 'BERSIH / NET INCOME' : 'NET DEFICIT / RUGI'}
            </span>
            <span className={`text-lg font-black font-mono mt-1 block ${
              netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}>
              Rp {netProfit.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] text-neutral-500 block uppercase mt-0.5">
              Net Profit Margin: {netMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC PROGRESS COMPARISON CHART */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
          <Activity className="text-emerald-600 w-4.5 h-4.5" />
          Perbandingan Arus kas & Laba Operasional Berjalan
        </h4>

        {(() => {
          const maxAmount = Math.max(totalRevenue, totalHPP + totalOpex, 10000000);
          const revPercent = (totalRevenue / maxAmount) * 100;
          const hppPercent = (totalHPP / maxAmount) * 105;
          const opexPercent = (totalOpex / maxAmount) * 115;
          const profitPercent = (Math.max(0, netProfit) / maxAmount) * 100;

          return (
            <div className="flex flex-col gap-4.5 text-[11px] font-bold">
              {/* Row 1: Pendapatan */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-600 uppercase">📈 TOTAL PENDAPATAN (REVENUE) - 100%</span>
                  <span className="text-emerald-800 font-mono">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-neutral-100 h-4 rounded-lg overflow-hidden border border-neutral-200">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-lg transition-all duration-700 shadow-inner"
                    style={{ width: `${revPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Row 2: HPP */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-600 uppercase">🌾 BIYAYA PANEN / HPP (CROP PURCHASES & MAKELA)</span>
                  <span className="text-orange-700 font-mono">Rp {totalHPP.toLocaleString('id-ID')} ({totalRevenue > 0 ? ((totalHPP / totalRevenue) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-neutral-100 h-4 rounded-lg overflow-hidden border border-neutral-200">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-650 h-full rounded-lg transition-all duration-700"
                    style={{ width: `${(totalHPP / maxAmount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Row 3: OPEX */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-600 uppercase">⚙️ BEBAN OPERASIONIL GUDANG & BURUH PANGGUL</span>
                  <span className="text-indigo-700 font-mono">Rp {totalOpex.toLocaleString('id-ID')} ({totalRevenue > 0 ? ((totalOpex / totalRevenue) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div className="w-full bg-neutral-100 h-4 rounded-lg overflow-hidden border border-neutral-200">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-lg transition-all duration-700"
                    style={{ width: `${(totalOpex / maxAmount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Row 4: Net Profit */}
              {netProfit > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-emerald-700 uppercase">🏆 LABA BERSIH (NET INCOME SURPLUS)</span>
                    <span className="text-emerald-700 font-mono">Rp {netProfit.toLocaleString('id-ID')} ({netMarginPercent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-4 rounded-lg overflow-hidden border border-neutral-200">
                    <div 
                      className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-lg transition-all duration-700"
                      style={{ width: `${profitPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 5. RINCIAN LABA DRYER JAGUNG */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">
           RINCIAN LABA DRYER JAGUNG
        </h4>
        <div className="text-[11px] font-bold">
           <div className="flex justify-between border-b pb-1 mb-2"><span>Jasa Dryer (${totalDryerTonnage.toLocaleString('id-ID')} Kg)</span><span>Rp ${totalDryerRevenue.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between"><span>Upah Buruh Timbang</span><span>Rp ${laborBuruhTimbang.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between"><span>Upah Buruh Muat</span><span>Rp ${laborBuruhMuat.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between"><span>Listrik Dryer</span><span>Rp ${biayaListrikDrying.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between"><span>Gaji Operator Dryer</span><span>Rp ${gajiOperatorDrying.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between"><span>Cangkang Kemiri</span><span>Rp ${biayaCangkang.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between border-b pb-1 mb-2"><span>Pengeluaran Tambahan</span><span>Rp ${biayaTambahanDrying.toLocaleString('id-ID')}</span></div>
           <div className="flex justify-between text-emerald-800 font-black">
              <span>JASA DRYER (LABA/RUGI)</span>
              <span>Rp ${dryerProfit.toLocaleString('id-ID')}</span>
           </div>
           <div className="flex justify-between text-blue-800 font-black mt-2 pt-2 border-t border-neutral-200">
              <span>SALDO AKUMULASI JASA DRYER</span>
              <span>Rp ${cumulativeDryerProfit.toLocaleString('id-ID')}</span>
           </div>
        </div>
      </div>
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-neutral-550 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wide">
            Detailed Ledger Statement (Rincian Buku Laba Rugi Akuntansi)
          </h4>
        </div>

        <div className="flex flex-col text-[11px] font-bold">
          
          {/* I. PART PENDAPATAN */}
          <div className="border-b border-neutral-200/60">
            <div className="bg-neutral-50/50 px-4 py-2 text-[10.5px] text-neutral-500 uppercase tracking-tight">I. PENDAPATAN OPERASIONAL (OPERATIONAL REVENUE)</div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition">
              <span className="text-neutral-600 uppercase font-normal">Penjualan Komoditi Jagung & Beras (Volume Outbound)</span>
              <span className="font-mono text-neutral-800">Rp {outboundSales.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Pendapatan Jasa Poles & Gilingan Beras</span>
              <span className="font-mono text-neutral-800">Rp {polishRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Pendapatan Jasa Pengeringan Jagung (Gas Dryer)</span>
              <span className="font-mono text-neutral-800">Rp {totalDryerRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Jasa Mutasi Kas & Timbangan Lain-lain</span>
              <span className="font-mono text-neutral-800">Rp {otherFinancialCredits.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-emerald-50/20 px-6 py-2.5 flex justify-between font-black border-t border-neutral-200/85">
              <span className="text-emerald-800 uppercase text-[11.5px]">TOTAL REVENUE</span>
              <span className="font-mono text-emerald-800 text-[11.5px]">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* II. PART COST OF GOODS SOLD */}
          <div className="border-b border-neutral-200/60">
            <div className="bg-neutral-50/50 px-4 py-2 text-[10.5px] text-neutral-500 uppercase tracking-tight">II. BIAYA POKOK PENJUALAN (HPP / COST OF GOODS SOLD)</div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition">
              <span className="text-neutral-600 uppercase font-normal">Pembelian Panen Jagung & Gabah Petani (Arus Masuk / Inbound)</span>
              <span className="font-mono text-neutral-800">Rp {inboundPurchases.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Beban Komisi Makelar (Brokerage Fees)</span>
              <span className="font-mono text-neutral-800">Rp {brokerCommissions.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-orange-50/20 px-6 py-2.5 flex justify-between font-black border-t border-neutral-200/85">
              <span className="text-[#9a3412] uppercase text-[11.5px]">TOTAL HPP/BELI</span>
              <span className="font-mono text-[#9a3412] text-[11.5px]">Rp {totalHPP.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* GROSS MARGIN ROW */}
          <div className="bg-emerald-50/60 border-b border-neutral-200/60 px-4 py-3 flex justify-between font-black">
            <span className="text-emerald-800 uppercase text-[12px] tracking-tight">III. LABA KOTOR (GROSS profit MARGIN)</span>
            <span className="font-mono text-emerald-900 text-[12px]">Rp {grossProfit.toLocaleString('id-ID')}</span>
          </div>

          {/* IV. OPERATIONAL EXPENSES */}
          <div className="border-b border-neutral-200/60">
            <div className="bg-neutral-50/50 px-4 py-2 text-[10.5px] text-neutral-500 uppercase tracking-tight">IV. BEBAN OPERASIONIL & ADMINISTRASI (OPEX)</div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition">
              <span className="text-neutral-600 uppercase font-normal">Gaji Tenaga Kerja Tetap & Operator Gudang</span>
              <span className="font-mono text-neutral-800">Rp {salaryCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">BBM Solar, Listrik Kantor, Listrik Gilingan & Gas Dryer</span>
              <span className="font-mono text-neutral-800">Rp {utilitiesCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Upah Buruh Bongkar Panggul (Arus Inbound)</span>
              <span className="font-mono text-neutral-800">Rp {inboundLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Upah Buruh Muat Panggul (Arus Outbound)</span>
              <span className="font-mono text-neutral-800">Rp {outboundLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Upah Buruh Pengeringan Dryer Panggul</span>
              <span className="font-mono text-neutral-800">Rp {dryerLaborCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="px-6 py-2.5 flex justify-between hover:bg-neutral-50 transition border-t border-neutral-100">
              <span className="text-neutral-600 uppercase font-normal">Pengeluaran Lainnya (Buku Kas Umum)</span>
              <span className="font-mono text-neutral-800">Rp {otherExpenses.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-indigo-50/20 px-6 py-2.5 flex justify-between font-black border-t border-neutral-200/85">
              <span className="text-indigo-800 uppercase text-[11.5px]">TOTAL BEBAN OPERASIONIL</span>
              <span className="font-mono text-indigo-800 text-[11.5px]">Rp {totalOpex.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* NET SURPLUS SUMMARY */}
          <div className={`px-4 py-3.5 flex justify-between font-black border-t-2 border-neutral-450 ${
            netProfit >= 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white' : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
          }`}>
            <span className="uppercase text-[12px] tracking-wider">🌟 {netProfit >= 0 ? 'SURPLUS BERSIH PERIODE BERJALAN (NET PROFIT)' : 'DEFISIT BERSIH PERIODE BERJALAN (NET LOSS)'}</span>
            <span className="font-mono text-[13px]">Rp {netProfit.toLocaleString('id-ID')}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
