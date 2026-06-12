import React, { useState } from 'react';
import { EmployeeRecord, LaborKasbonRecord } from '../types';
import { PlusCircle, Search, Calendar, ChevronRight, Users, CreditCard, DollarSign, Download, Printer, Trash2, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import SmartNumberInput from './SmartNumberInput';

interface LaborKasbonTabProps {
  employees: EmployeeRecord[];
  kasbons: LaborKasbonRecord[];
  onAddKasbon: (record: LaborKasbonRecord) => void;
  onDeleteKasbon: (id: string) => void;
}

export default function LaborKasbonTab({
  employees,
  kasbons,
  onAddKasbon,
  onDeleteKasbon
}: LaborKasbonTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<'PINJAM' | 'BAYAR'>('PINJAM');
  const [amount, setAmount] = useState(150000);
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'ALL' | 'PINJAM' | 'BAYAR'>('ALL');

  // Filter only labor/worker or administrative staff for cash advance
  const eligibleEmployees = employees.filter(e => e.role === 'BURUH' || e.role === 'KARYAWAN');

  // Auto set initial worker
  React.useEffect(() => {
    if (!employeeId && eligibleEmployees.length > 0) {
      setEmployeeId(eligibleEmployees[0].id);
    }
  }, [eligibleEmployees, employeeId]);

  // Compute stats
  const totalLent = kasbons
    .filter(k => k.type === 'PINJAM')
    .reduce((acc, k) => acc + k.amount, 0);

  const totalRepaid = kasbons
    .filter(k => k.type === 'BAYAR')
    .reduce((acc, k) => acc + k.amount, 0);

  const totalOutstanding = Math.max(0, totalLent - totalRepaid);

  // Group by employee to find individual outstanding cash advances
  const employeeKasbonSummary = eligibleEmployees.map(emp => {
    const lent = kasbons
      .filter(k => k.employeeId === emp.id && k.type === 'PINJAM')
      .reduce((acc, k) => acc + k.amount, 0);
    const repaid = kasbons
      .filter(k => k.employeeId === emp.id && k.type === 'BAYAR')
      .reduce((acc, k) => acc + k.amount, 0);
    const outstanding = Math.max(0, lent - repaid);
    return {
      ...emp,
      lent,
      repaid,
      outstanding
    };
  }).filter(e => e.outstanding > 0 || kasbons.some(k => k.employeeId === e.id));

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      (window as any).__showToast?.("Gagal: Silakan pilih buruh terlebih dahulu!", "error");
      return;
    }
    if (amount <= 0) {
      (window as any).__showToast?.("Gagal: Nilai nominal kasbon harus lebih besar dari Rp 0!", "error");
      return;
    }
    if (!description.trim()) {
      (window as any).__showToast?.("Gagal: Harap tulis rincian/alasan kasbon!", "error");
      return;
    }

    const selectedEmp = employees.find(emp => emp.id === employeeId);
    if (!selectedEmp) return;

    // Repayment validation (cannot pay more than current outstanding)
    if (type === 'BAYAR') {
      const summary = employeeKasbonSummary.find(s => s.id === employeeId);
      const currentDebt = summary ? summary.outstanding : 0;
      if (amount > currentDebt && currentDebt > 0) {
        // Show warning but let them proceed if they explicitly click confirmation
        if (!window.confirm(`⚠️ Nominal pengembalian (Rp ${amount.toLocaleString('id-ID')}) melebihi sisa kasbon buruh ini (Rp ${currentDebt.toLocaleString('id-ID')}). Tetap lanjutkan pendaftaran?`)) {
          return;
        }
      }
    }

    const newKasbon: LaborKasbonRecord = {
      id: `kb-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      employeeId,
      employeeName: selectedEmp.name.toUpperCase(),
      type,
      amount,
      description: description.toUpperCase()
    };

    onAddKasbon(newKasbon);
    setDescription("");
    _triggerSuccessToast(newKasbon);
  };

  const _triggerSuccessToast = (kb: LaborKasbonRecord) => {
    const str = kb.type === 'PINJAM' 
      ? `Kasbon baru Rp ${(kb.amount).toLocaleString('id-ID')} atas nama ${kb.employeeName} berhasil dicatat!`
      : `Repayment/Pelunasan Rp ${(kb.amount).toLocaleString('id-ID')} atas nama ${kb.employeeName} berhasil dicatat!`;
    (window as any).__showToast?.(str, "success");
  };

  // Filter lists
  const filteredKasbons = kasbons.filter(k => {
    const matchesSearch = k.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          k.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || k.type === filterType;
    return matchesSearch && matchesType;
  });

  const handlePrintKasbon = () => {
    const heading = [["TANGGAL", "NAMA BURUH/KARYAWAN", "TIPE TRANSAKSI", "NOMINAL", "DESKRIPSI"]];
    const rows = filteredKasbons.map(k => [
      k.date,
      k.employeeName,
      k.type === 'PINJAM' ? 'PINJAM (DEBIT)' : 'BAYAR (PELUNASAN)',
      `Rp ${(k.amount).toLocaleString('id-ID')}`,
      k.description
    ]);
    const fileTitle = "LAPORAN_PERSUTUJUAN_KASBON_BURUH";
    
    // Custom formatted alert
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker aktif. Gagal mencetak laporan.");
      return;
    }

    const outstandingCardColor = totalOutstanding > 0 ? 'text-red-700' : 'text-neutral-500';

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Arus Kasbon Buruh - Gudang Bilibili</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1f2937; }
            h2 { text-align: center; font-size: 20px; color: #111827; text-transform: uppercase; margin-bottom: 5px; }
            p.sub { text-align: center; font-size: 11px; color: #6b7280; font-family: monospace; display: block; margin-top: 0; margin-bottom: 25px; }
            .kpis { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 15px; }
            .kpi { flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
            .kpi h4 { margin: 0; font-size: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
            .kpi p { margin: 5px 0 0 0; font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #f9fafb; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151; font-weight: bold; text-transform: uppercase; }
            td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; }
            tr:hover { background-color: #f9fafb; }
            .type-pinjam { color: #dc2626; font-weight: bold; }
            .type-bayar { color: #16a34a; font-weight: bold; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; color: #4b5563; }
            .sign { text-align: center; width: 200px; }
            .sign-line { border-bottom: 1px solid #1f2937; height: 60px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>LAPORAN MUTASI KASBON BURUH PANGGUL</h2>
          <p class="sub">GUDANG BILIBILI • TANGGAL: ${new Date().toLocaleDateString('id-ID')} • JAM: ${new Date().toLocaleTimeString('id-ID')}</p>
          
          <div class="kpis">
            <div class="kpi">
              <h4>Total Pinjaman Kasbon</h4>
              <p style="color: #1f2937;">Rp ${totalLent.toLocaleString('id-ID')}</p>
            </div>
            <div class="kpi">
              <h4>Total Pengembalian</h4>
              <p style="color: #16a34a;">Rp ${totalRepaid.toLocaleString('id-ID')}</p>
            </div>
            <div class="kpi" style="background-color: #fef2f2; border-color: #fecaca;">
              <h4>Sisa Kasbon Aktif (Outstanding)</h4>
              <p style="color: #dc2626;">Rp ${totalOutstanding.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Buruh / Karyawan</th>
                <th>Jenis Transaksi</th>
                <th>Jumlah (Rp)</th>
                <th>Rincian/Keterangan Kasbon</th>
              </tr>
            </thead>
            <tbody>
              ${filteredKasbons.map(k => `
                <tr>
                  <td>${k.date}</td>
                  <td><b>${k.employeeName}</b></td>
                  <td>
                    <span class="${k.type === 'PINJAM' ? 'type-pinjam' : 'type-bayar'}">
                      ${k.type === 'PINJAM' ? 'PINJAM (-)' : 'BAYAR (+)'}
                    </span>
                  </td>
                  <td><b>Rp ${k.amount.toLocaleString('id-ID')}</b></td>
                  <td>${k.description}</td>
                </tr>
              `).join('')}
              ${filteredKasbons.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: #9ca3af; font-style: italic;">Tidak ada riwayat kasbon ditemukan</td></tr>' : ''}
            </tbody>
          </table>

          <div class="footer">
            <div class="sign">
              <p>Menerima & Memeriksa</p>
              <div class="sign-line"></div>
              <p><b>Staf Administrasi Gudang</b></p>
            </div>
            <div class="sign">
              <p>Menyetujui,</p>
              <div class="sign-line"></div>
              <p><b>Pimpinan/Gudang 162 Bilibili</b></p>
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

  const handleExportExcel = () => {
    // Basic CSV format
    const headers = "TANGGAL,NAMA PEKERJA,TIPE TRANSAKSI,NOMINAL (RP),KETERANGAN\n";
    const rows = filteredKasbons.map(k => {
      const typeStr = k.type === 'PINJAM' ? 'PINJAM' : 'KEMBALI';
      return `"${k.date}","${k.employeeName}","${typeStr}",${k.amount},"${k.description.replace(/"/g, '""')}"`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kasbon_buruh_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6" id="labor-kasbon-module">
      
      {/* 1. TOP SCOREBOARD METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1 : SISA KASBON AKTIF */}
        <div className="bg-white border border-red-200 shadow-sm rounded-xl p-4 flex gap-4 items-center">
          <div className="bg-red-50 text-red-600 p-3 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">
              SISA KASBON AKTIF (OUTSTANDING)
            </span>
            <span className="text-xl font-black text-red-700 font-mono mt-1 block">
              Rp {totalOutstanding.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] text-neutral-500 mt-0.5 block uppercase">
              Hutang akumulatif seluruh buruh panggul
            </span>
          </div>
        </div>

        {/* KPI 2 : TOTAL PINJAMAN MINGGUAN */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4 flex gap-4 items-center">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-full">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">
              TOTAL TRANSAKSI KASBON (LENT)
            </span>
            <span className="text-xl font-black text-neutral-800 font-mono mt-1 block">
              Rp {totalLent.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] text-neutral-500 mt-0.5 block uppercase font-mono">
              Dari {kasbons.filter(k => k.type === 'PINJAM').length} kali transaksi pinjam
            </span>
          </div>
        </div>

        {/* KPI 3 : TOTAL PEMBAYARAN REPAYMENT */}
        <div className="bg-white border border-emerald-200 shadow-sm rounded-xl p-4 flex gap-4 items-center">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider leading-none">
              TOTAL PENGEMBALIAN (REPAID)
            </span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">
              Rp {totalRepaid.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] text-neutral-500 mt-0.5 block uppercase font-mono">
              Tercicil dari upah panggul harian
            </span>
          </div>
        </div>

      </div>

      {/* 2. MAIN SPLIT SCREEN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: REGISTRATION FORM (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-150">
              <h3 className="font-black text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="text-emerald-700 w-4 h-4" />
                Registrasi Kasbon Buruh
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-100">
                Pencatatan Baru
              </span>
            </div>

            {eligibleEmployees.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs flex gap-2">
                <AlertCircle className="text-amber-600 shrink-0 w-4.5 h-4.5" />
                <div>
                  <p className="font-bold text-amber-800 uppercase">Tidak ada buruh terdaftar</p>
                  <p className="text-amber-700 mt-0.5">Silakan tambahkan tenaga kerja dengan peran &apos;BURUH&apos; atau &apos;KARYAWAN&apos; di tab Master Database agar bisa melakukan manajemen kasbon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[11px] uppercase">
                
                {/* 1. Worker Dropdown */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold uppercase">Pilih Tenaga Kerja (Buruh Panggul)</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-bold text-neutral-800 uppercase outline-none"
                  >
                    {eligibleEmployees.map(emp => {
                      const activeLoan = kasbons
                        .filter(k => k.employeeId === emp.id)
                        .reduce((sum, current) => sum + (current.type === 'PINJAM' ? current.amount : -current.amount), 0);
                      return (
                        <option key={emp.id} value={emp.id}>
                          {emp.name.toUpperCase()} (SISA KASBON: RP {Math.max(0, activeLoan).toLocaleString('id-ID')})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Transaction Type Switcher */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold uppercase">Jenis Transaksi Kasbon</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('PINJAM')}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all border outline-none tracking-wider ${
                        type === 'PINJAM'
                          ? 'bg-red-50 border-red-300 text-red-800 font-black'
                          : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      💡 PINJAM BARU (LOAN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('BAYAR')}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all border outline-none tracking-wider ${
                        type === 'BAYAR'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                          : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      💵 SETOR CICIL (PAYBACK)
                    </button>
                  </div>
                </div>

                {/* 3. Smart Amount Input */}
                <div>
                  <SmartNumberInput
                    value={amount}
                    onChange={setAmount}
                    label={`NOMINAL YANG DI${type === 'PINJAM' ? 'PINJAMKAN' : 'BAYARKAN'} (RP)`}
                    mode="currency"
                    unit="RP"
                    presets={[50000, 100000, 200000, 500000, 1000000]}
                  />
                </div>

                {/* 4. Description Reason */}
                <div>
                  <label className="block text-neutral-600 mb-1 font-bold uppercase">Rician atau Keperluan Kasbon</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.toUpperCase())}
                    placeholder="CONTOH: PINJAM UNTUK BIAYA RUMAH SAKIT / POTONG UPAH MINGGUAN"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white font-bold uppercase text-neutral-800 outline-none"
                  />
                </div>

                {/* 5. Submit button */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-lg text-white font-black text-xs uppercase tracking-widest cursor-pointer shadow transition-all hover:opacity-90 active:scale-95 ${
                    type === 'PINJAM' ? 'bg-red-700 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-600'
                  }`}
                >
                  {type === 'PINJAM' ? 'SIMPAN PINJAMAN KASBON' : 'SIMPAN PEMBAYARAN KASBON'}
                </button>

              </form>
            )}
          </div>

          {/* Quick Active Debts Worker Alert List */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <h4 className="font-bold text-neutral-800 text-[10px] tracking-wider uppercase mb-3 border-b border-neutral-100 pb-1.5 flex items-center justify-between">
              <span>⚠️ Daftar Sisa Kasbon per Buruh</span>
              <span className="text-[9px] text-[#b45309] font-black">{employeeKasbonSummary.filter(e => e.outstanding > 0).length} Orang Aktif</span>
            </h4>
            
            <div className="max-h-56 overflow-y-auto flex flex-col gap-2 pr-1.5 custom-scrollbar text-[11px]">
              {employeeKasbonSummary.filter(e => e.outstanding > 0).length === 0 ? (
                <p className="text-neutral-400 italic text-[10px] text-center p-2 bg-neutral-50 rounded">Semua buruh panggul bebas dari kasbon.</p>
              ) : (
                employeeKasbonSummary.filter(e => e.outstanding > 0).map(emp => (
                  <div key={emp.id} className="flex justify-between items-center bg-neutral-50 border border-neutral-200/60 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      <span>{emp.name.toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-red-600">Rp {emp.outstanding.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCH, FILTERS & TRANSACTIONS LOGS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-neutral-150">
              <div>
                <h3 className="font-black text-neutral-800 text-xs uppercase tracking-tight flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                  Buku Kas Besar Pinjaman & Pelunasan Kasbon
                </h3>
                <p className="text-[9px] text-neutral-400 uppercase mt-0.5 font-sans">
                  Total record terfilter: {filteredKasbons.length} transaksi
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 font-bold">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] px-2.5 py-1.5 rounded-lg border border-emerald-250 transition cursor-pointer"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button
                  type="button"
                  onClick={handlePrintKasbon}
                  className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 text-[9px] px-2.5 py-1.5 rounded-lg border border-indigo-250 transition cursor-pointer"
                >
                  <Printer className="w-3 h-3" /> PRINT PDF
                </button>
              </div>
            </div>

            {/* In-tab Filtering Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              
              {/* Search workers */}
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="CARI NAMA BURUH ATAU ALASAN KASBON..."
                  className="w-full bg-neutral-50 text-[10px] pl-8 pr-3 py-2 border border-neutral-200 rounded-lg outline-none focus:bg-white uppercase font-bold"
                />
              </div>

              {/* Toggle filters */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] px-2 py-2 outline-none font-bold text-neutral-700"
              >
                <option value="ALL">🚫 SEMUA TIPE KASBON</option>
                <option value="PINJAM">🔴 SISA PINJAMAN (LOAN)</option>
                <option value="BAYAR">🟢 SISA PEMBAYARAN (REPAY)</option>
              </select>

            </div>

            {/* Logs Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-[11px] text-neutral-600 uppercase">
                  <thead className="bg-[#122345] text-white font-black uppercase tracking-tight text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">TANGGAL</th>
                      <th className="py-2.5 px-3">NAMA BURUH</th>
                      <th className="py-2.5 px-3">JENIS</th>
                      <th className="text-right py-2.5 px-3">NOMINAL (RP)</th>
                      <th className="py-2.5 px-3 pl-6">RICIAN / KEPERLUAN</th>
                      <th className="py-2.5 px-3 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150 font-bold">
                    {filteredKasbons.map(k => {
                      const isPinjam = k.type === 'PINJAM';
                      return (
                        <tr key={k.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-2.5 px-3 text-neutral-400 font-mono text-[9px] whitespace-nowrap">{k.date}</td>
                          <td className="py-2.5 px-3 text-neutral-900 font-black">{k.employeeName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border tracking-tighter ${
                              isPinjam 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-205'
                            }`}>
                              {isPinjam ? 'PINJAM' : 'BAYAR'}
                            </span>
                          </td>
                          <td className={`text-right py-2.5 px-3 font-mono font-black ${
                            isPinjam ? 'text-red-700' : 'text-emerald-700'
                          }`}>
                            {isPinjam ? '-' : '+'} {k.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 max-w-[200px] truncate text-neutral-550 font-mono text-[10px] pl-6 uppercase" title={k.description}>
                            {k.description}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`⚠️ Apakah Anda yakin ingin membatalkan/menghapus catatan Kasbon Pekerja ini?`)) {
                                  onDeleteKasbon(k.id);
                                }
                              }}
                              className="text-neutral-400 hover:text-red-600 transition p-1 cursor-pointer"
                              title="Hapus / Void Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredKasbons.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400 italic text-[11px]">
                          Tidak ada catatan rincian transaksi kasbon pekerja ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Helper Notes */}
            <p className="text-[9px] text-neutral-400 italic mt-3 uppercase leading-normal">
              💡 Catatan Keuangan: Catatan kasbon pekerja disimpan tersendiri dari buku kas operasional utama gudang, namun secara kumulatif merupakan setara piutang aktif yang disetujui pimpinan gudang.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}
