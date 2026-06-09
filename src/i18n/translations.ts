
export type Language = 'id' | 'en';

export interface Translations {
  // Navigation
  dashboard: string;
  weighbridge: string;
  inbound: string;
  outbound: string;
  services: string;
  moisture: string;
  finance: string;
  riceStock: string;
  reports: string;
  database: string;
  
  // Dashboard & Header
  warehouseHeader: string;
  centralWarehouse: string;
  systemStatus: string;
  theme: string;
  printerSettings: string;
  online: string;
  newWeighing: string;
  cashMutation: string;
  cornStock: string;
  riceStockLabel: string;
  totalServiceBilling: string;
  cashBalance: string;
  unpaid: string;
  paid: string;
  supplierDebt: string;
  kgNetto: string;
  
  // Quick Actions
  truckWeighbridgeDesc: string;
  openWeighbridge: string;
  inboundDesc: string;
  recordInbound: string;
  processingDesc: string;
  openServices: string;
  
  // Toast & General
  scanSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  saveSuccess: string;
  confirmDelete: string;
  cancel: string;
  save: string;
  close: string;
  confirmOk: string;
  confirmAdd: string;
  confirmEdit: string;
  confirmDeleteBtn: string;
  confirmPay: string;
  actionAuthorization: string;
  successToast: string;
  errorToast: string;
  warningToast: string;
  infoToast: string;

  // Module Titles
  inboundTitle: string;
  outboundTitle: string;
  moistureTitle: string;
  financeTitle: string;
  reportsTitle: string;
  databaseTitle: string;
  servicesTitle: string;
  brokerEmployees: string;
  
  // Shared UI
  searchPlaceholder: string;
  recordNew: string;
  archives: string;
  total: string;
  
  // Table Headers
  date: string;
  ticketNo: string;
  policeNo: string;
  supplier: string;
  customer: string;
  commodity: string;
  grossWeight: string;
  tareWeight: string;
  netWeight: string;
  price: string;
  totalAmount: string;
  action: string;
  status: string;
  driver: string;
  notes: string;
  
  // Weights Details
  gross: string;
  tare: string;
  netto: string;
  bagDeduction: string;
  moistureDeduction: string;
  finalWeight: string;
  
  // Dashboard Strings
  gudangBilibili: string;
  pinrangLocation: string;
  recentTransactions: string;
  viewAll: string;
  
  // Settings Modal
  printerNameLabel: string;
  printerNotice: string;
  saveAndClose: string;

  // Weighing Queue
  weighingQueueTitle: string;
  goods: string;
  supplierOrMitra: string;
  weighing1Gross: string;
  weighing2Tare: string;
  netWeightDashboard: string;
  viewAllArchives: string;
  completedStatus: string;
  waitingStatus: string;
  completedBadge: string;
  waitingBadge: string;
  completedBadgeTable: string;
  waitingBadgeTable: string;
  
  // Weighbridge Module
  weighingIndicator: string;
  stable: string;
  zero: string;
  activeWeightSimulator: string;
  apply: string;
  zeroScale: string;
  simulatorInstruction: string;
  operationalButtons: string;
  startNewWeighing: string;
  saveWeighing1: string;
  reweigh1: string;
  completeWeighing2: string;
  weighingAppTitle: string;
  techSupport: string;
  weighingTransaction: string;
  currentWeight: string;
  overweightWarning: string;
  ticketNumberLabel: string;
  plateNumberLabel: string;
  goodsNameLabel: string;
  agencyLabel: string;
  weigh1Label: string;
  weigh2Label: string;
  grossWeightLabel: string;
  tareWeightLabel: string;
  bagDeductionLabel: string;
  refaksiLabel: string;
  netWeightLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  noNotes: string;
  exportExcel: string;
  printReportsPDF: string;
  searchTicketPlaceholder: string;
  ticketArchiveTitle: string;
  ticketNoHeader: string;
  plateNoHeader: string;
  goodsHeader: string;
  agencyHeader: string;
  weigh1KgHeader: string;
  weigh2KgHeader: string;
  netKgHeader: string;
  statusHeader: string;
  actionHeader: string;
  confirmCompleteTimbang2: string;
  noTicketsFound: string;
  printSlipPreview: string;
  thermalSlipHeader: string;
  thermalSlipAddress: string;
  thermalSlipCity: string;
  thermalSlipPhone: string;
  confirmAddTimbang1: string;
  confirmEditTimbang1: string;
  confirmDeleteTicket: string;

  // Rice Stock Module
  riceStockTitle: string;
  closeForm: string;
  recordNewStock: string;
  dateLabel: string;
  descriptionLabel: string;
  priceLabel: string;
  collyLabel: string;
  inStockLabel: string;
  outStockLabel: string;
  totalTransaction: string;
  totalStockBalance: string;
  itemNameLabel: string;
  saveStock: string;
  errorIncompleteStock: string;
  successUpdateStock: string;
  successSaveStock: string;
  confirmDeleteStock: string;
  confirmDeleteStockMsg: string;
  confirmEditStock: string;
  confirmSaveStock: string;
  confirmEditStockMsg: string;
  confirmSaveStockMsg: string;
  paidStatus: string;
  unpaidStatus: string;
  debtsArchivesTitle: string;
  debtsSubTitle: string;
  closeFormLabel: string;
  recordNewDebtLabel: string;
  addDebtTitle: string;
  supplierLabel: string;
  descriptionLabelFinance: string;
  amountLabel: string;
  saveEntry: string;
  financeEntryTitle: string;
  financeSubTitle: string;
  recordNewFinanceLabel: string;
  addFinanceTitle: string;
  typeLabel: string;
  categoryLabel: string;
  channelLabel: string;
  brokerCommissionTitle: string;
  brokerCommissionSubTitle: string;
  selectBrokerLabel: string;
  cargoWeightLabel: string;
  commissionRateLabel: string;
  calculatedCommissionLabel: string;
  payCommission: string;
  installmentLabel: string;
  payInstallment: string;
  themeChanged: string;
  saveWeighbridgeSuccess: string;
  updateWeighbridgeSuccess: string;
  deleteWeighbridgeSuccess: string;
  deleteSuccessGeneral: string;
  
  errorPlateRequired: string;
  errorAgencyRequired: string;
  errorSelectTicket: string;
  errorAlreadyCompleted: string;
}

export const translations: Record<Language, Translations> = {
  id: {
    dashboard: 'PANEL UTAMA (DASHBOARD)',
    weighbridge: 'JEMBATAN TIMBANG',
    inbound: 'BARANG MASUK',
    outbound: 'BARANG KELUAR',
    services: 'JASA POLES, KIPAS & DRYER',
    moisture: 'REFAKSI KA JAGUNG',
    finance: 'UTANG & MUTASI KAS',
    riceStock: 'STOK BERAS',
    reports: 'LAPORAN TERPADU',
    database: 'DATABASE MASTER',
    
    warehouseHeader: 'US BILIBILI 162',
    centralWarehouse: 'GUDANG PUSAT 🌽',
    systemStatus: 'Sistem Informasi Pergudangan & Jembatan Timbang GSC GST-9700',
    theme: 'TEMA',
    printerSettings: 'Pengaturan Printer',
    online: 'ONLINE',
    newWeighing: '🚚 Timbangan Baru',
    cashMutation: '📊 Mutasi Kas Rekening',
    cornStock: 'STOCK JAGUNG GUDANG 🌽',
    riceStockLabel: 'STOCK BERAS MASUK 🌾',
    totalServiceBilling: 'TOTAL BILLING JASA POLES 🌪️',
    cashBalance: 'SALDO KAS & MANDIRI 💳',
    unpaid: 'Belum Lunas',
    paid: 'Lunas',
    supplierDebt: 'Utang Supplier',
    kgNetto: 'Kg Netto',
    
    truckWeighbridgeDesc: 'Masuk ke modulator simulator jembatan timbang GSC GST-9700 untuk menimbang truk berat, kosong, penuangan susut potongan karung, persenan refaksi KA, serta cetak print thermal slip kasir.',
    openWeighbridge: 'Buka Aplikasi Timbangan',
    inboundDesc: 'Catat incoming jagung pipil basah untuk tangki pengeringan, timbang truk masuk petani, potong kadar air, hitung refaksi, upah buruh panggul harian dan letak penyimpanan sektor gudang.',
    recordInbound: 'Catat Barang Masuk',
    processingDesc: 'Pengolahan beras poles, pembersihan blower kipas, dan pengeringan jagung (dryer) untuk mendapatkan kualitas bersih.',
    openServices: 'Buka Jasa Poles Kipas',
    
    scanSuccess: 'Berhasil memindai data!',
    updateSuccess: 'Data berhasil diperbarui!',
    deleteSuccess: 'Data berhasil dihapus!',
    saveSuccess: 'Data berhasil disimpan!',
    confirmDelete: 'Apakah Anda yakin ingin menghapus data ini?',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    confirmOk: 'Ya, Lanjutkan',
    confirmAdd: 'Ya, Tambahkan Data',
    confirmEdit: 'Ya, Simpan Perubahan',
    confirmDeleteBtn: 'Ya, Hapus Data',
    confirmPay: 'Ya, Bayar Cicilan',
    actionAuthorization: 'Aksi ini memerlukan konfirmasi otorisasi operator sebelum dieksekusi.',
    successToast: 'SUKSES',
    errorToast: 'KESALAHAN',
    warningToast: 'PERINGATAN',
    infoToast: 'INFORMASI',

    inboundTitle: 'Penerimaan Barang Masuk',
    outboundTitle: 'Pengiriman Barang Keluar',
    moistureTitle: 'Refaksi Kadar Air Jagung Pipil',
    financeTitle: 'Manajemen Keuangan & Mutasi Kas',
    reportsTitle: 'Laporan Manajemen Terpadu',
    databaseTitle: 'Database Master Sistem',
    servicesTitle: 'Layanan Jasa Poles & Kipas',
    brokerEmployees: 'Buruh & Makelar',
    
    searchPlaceholder: 'Cari data...',
    recordNew: 'Catat Baru',
    archives: 'Arsip',
    total: 'Total',
    
    date: 'Tanggal',
    ticketNo: 'No. Tiket',
    policeNo: 'No. Polisi',
    supplier: 'Supplier/Petani',
    customer: 'Pembeli/Customer',
    commodity: 'Komoditas',
    grossWeight: 'Bruto (Kg)',
    tareWeight: 'Tara (Kg)',
    netWeight: 'Netto (Kg)',
    price: 'Harga (Rp)',
    totalAmount: 'Total (Rp)',
    action: 'Aksi',
    status: 'Status',
    driver: 'Sopir',
    notes: 'Catatan',
    
    gross: 'Bruto',
    tare: 'Tara',
    netto: 'Netto',
    bagDeduction: 'Potongan Karung',
    moistureDeduction: 'Refaksi KA',
    finalWeight: 'Netto Akhir',

    gudangBilibili: 'GUDANG BILIBILI',
    pinrangLocation: 'Terminal Timbang GSC GST-9700 • Kabupaten Pinrang, Sulawesi Selatan',
    recentTransactions: 'TRANSAKSI TIMBANGAN TERBARU',
    viewAll: 'Lihat Semua',
    
    printerNameLabel: 'Nama Printer (Default)',
    printerNotice: 'Catatan: Web browser tidak mengizinkan pemilihan printer otomatis tanpa dialog. Pengaturan ini hanya berguna untuk referensi sistem.',
    saveAndClose: 'Simpan & Tutup',

    weighingQueueTitle: 'Antrian Timbangan Terbaru Hari Ini',
    goods: 'Barang',
    supplierOrMitra: 'Suplier / Tujuan Mitra',
    weighing1Gross: 'Timbang I (Gross)',
    weighing2Tare: 'Timbang II (Tare)',
    netWeightDashboard: 'Berat Netto',
    viewAllArchives: 'Lihat Seluruh Arsip Timbangan',
    completedStatus: 'SELESAI TIMBANG',
    waitingStatus: 'MENUNGGU II',
    completedBadge: 'SELESAI',
    waitingBadge: 'MENUNGGU II',
    completedBadgeTable: 'SELESAI',
    waitingBadgeTable: 'PROSES',
    
    weighingIndicator: 'INDIKATOR TIMBANGAN',
    stable: 'STABIL',
    zero: 'NOL',
    activeWeightSimulator: 'SIMULATOR BERAT AKTIF (KG)',
    apply: 'TERAPKAN',
    zeroScale: 'NOLKAN SKALA',
    simulatorInstruction: 'Gunakan tombol di atas untuk mensimulasikan berat truk di timbangan fisik, lalu catat datanya di komputer.',
    operationalButtons: 'Tombol Operasional',
    startNewWeighing: 'Mulai Timbang Baru',
    saveWeighing1: 'Simpan Timbang I (Gross / Masuk)',
    reweigh1: 'Re-Weigh Timbang I',
    completeWeighing2: 'Selesai Timbang II (Tare / Keluar)',
    weighingAppTitle: 'APLIKASI JEMBATAN TIMBANG - US BILIBILI 162',
    techSupport: 'YA TEKNIK, MAKASSAR',
    weighingTransaction: 'TRANSAKSI TIMBANGAN',
    currentWeight: 'BERAT TIMBANGAN SAAT INI',
    overweightWarning: '⚠️ OUT OF RANGE / OVERWEIGHT',
    ticketNumberLabel: 'Nomor',
    plateNumberLabel: 'No. Polisi',
    goodsNameLabel: 'Nama Barang',
    agencyLabel: 'Agen/Tujuan',
    weigh1Label: 'TIMBANG I',
    weigh2Label: 'TIMBANG II',
    grossWeightLabel: 'Berat Bruto',
    tareWeightLabel: 'Berat Tara',
    bagDeductionLabel: 'Pot. Krg %',
    refaksiLabel: 'Refaksi %',
    netWeightLabel: 'Berat NETTO',
    notesLabel: 'Catatan',
    notesPlaceholder: 'Masukkan catatan timbang...',
    noNotes: 'Tidak ada catatan',
    exportExcel: 'Export Excel',
    printReportsPDF: 'Cetak Laporan / PDF',
    searchTicketPlaceholder: 'Cari No. Polisi/Tiket...',
    ticketArchiveTitle: 'Arsip Tiket Jembatan Timbang',
    ticketNoHeader: 'No. Tiket',
    plateNoHeader: 'No. Polisi',
    goodsHeader: 'Barang',
    agencyHeader: 'Agen / Mitra',
    weigh1KgHeader: 'Timbang I (Kg)',
    weigh2KgHeader: 'Timbang II (Kg)',
    netKgHeader: 'Netto (Kg)',
    statusHeader: 'Status',
    actionHeader: 'Aksi',
    confirmCompleteTimbang2: 'Konfirmasi Selesaikan Timbang 2',
    noTicketsFound: 'Tidak ada tiket timbangan ditemukan.',
    printSlipPreview: 'Pratinjau Cetak Slip Timbangan',
    thermalSlipHeader: 'GUDANG US BILIBILI 162',
    thermalSlipAddress: 'Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa',
    thermalSlipCity: 'Kabupaten Pinrang, Sulawesi Selatan 91131',
    thermalSlipPhone: 'TELP - 085244466009',
    confirmAddTimbang1: 'Konfirmasi Tambah Antrian Timbang 1',
    confirmEditTimbang1: 'Konfirmasi Perubahan Timbang 1',
    confirmDeleteTicket: 'Konfirmasi Hapus Tiket',

    riceStockTitle: 'Rincian Stok Beras',
    closeForm: 'Tutup Formulir',
    recordNewStock: 'Catat Stok Baru',
    dateLabel: 'Tanggal',
    descriptionLabel: 'Uraian',
    priceLabel: 'Harga (Rp)',
    collyLabel: 'Colly',
    inStockLabel: 'Masuk (Kg)',
    outStockLabel: 'Keluar (Kg)',
    totalTransaction: 'Total Transaksi',
    totalStockBalance: 'Total Stok',
    itemNameLabel: 'Nama Barang/Item',
    saveStock: 'Simpan',
    errorIncompleteStock: 'Mohon lengkapi formulir stok!',
    successUpdateStock: 'Sukses memperbarui data stok beras!',
    successSaveStock: 'Sukses menyimpan data stok beras!',
    confirmDeleteStock: 'Konfirmasi Hapus',
    confirmDeleteStockMsg: 'Yakin hapus data {description}?',
    confirmEditStock: 'Konfirmasi Ubah',
    confirmSaveStock: 'Konfirmasi Simpan',
    confirmEditStockMsg: 'Yakin ingin menyimpan perubahan?',
    confirmSaveStockMsg: 'Yakin ingin mencatat stok baru!',
    paidStatus: 'LUNAS',
    unpaidStatus: 'BELUM BAYAR',
    debtsArchivesTitle: 'Catatan Utang Aliansi Tani',
    debtsSubTitle: 'Catatan utang US Bilibili kepada suplier luar / petani pengirim biji jagung dan beras yang belum lunas dibayar.',
    closeFormLabel: 'Tutup Form',
    recordNewDebtLabel: 'Catat Utang Baru',
    addDebtTitle: 'Tambah Catatan Utang Baru',
    supplierLabel: 'Suplier/Petani',
    descriptionLabelFinance: 'Uraian / Perincian',
    amountLabel: 'Jumlah (Rp)',
    saveEntry: 'Simpan Data',
    financeEntryTitle: 'Buku Mutasi Kas & Saluran Rekening',
    financeSubTitle: 'Rekaman alur kas masuk (debit) dan kas keluar (kredit) harian gudang melalui berbagai saluran pembayaran.',
    recordNewFinanceLabel: 'Catat Mutasi Baru',
    addFinanceTitle: 'Tambah Transaksi Mutasi Baru',
    typeLabel: 'Jenis',
    categoryLabel: 'Kategori',
    channelLabel: 'Saluran Rekening',
    brokerCommissionTitle: 'Kalkulator Komisi Makelar',
    brokerCommissionSubTitle: 'Hitung dan bayar komisi makelar berdasarkan berat kiriman yang masuk.',
    selectBrokerLabel: 'Pilih Makelar / Broker',
    cargoWeightLabel: 'Berat Cargo (Kg)',
    commissionRateLabel: 'Tarif Komisi (Rp/Kg)',
    calculatedCommissionLabel: 'Total Komisi dihitung',
    payCommission: 'Bayar Komisi',
    installmentLabel: 'Bayar Cicilan',
    payInstallment: 'Selesaikan Pembayaran CC',

    themeChanged: 'Tema visual berhasil diubah!',
    saveWeighbridgeSuccess: 'Berhasil mencatatkan Timbang I!',
    updateWeighbridgeSuccess: 'Berhasil memperbarui info tiket!',
    deleteWeighbridgeSuccess: 'Sukses menghapus tiket timbangan!',
    deleteSuccessGeneral: 'Data berhasil dihapus!',
    
    errorPlateRequired: 'Nomor Polisi harus diisi!',
    errorAgencyRequired: 'Agen / Tujuan harus diisi!',
    errorSelectTicket: 'Pilih tiket aktif terlebih dahulu!',
    errorAlreadyCompleted: 'Tiket sudah selesai ditimbang 2!',
  },
  en: {
    dashboard: 'MAIN DASHBOARD',
    weighbridge: 'WEIGHBRIDGE',
    inbound: 'INBOUND GOODS',
    outbound: 'OUTBOUND GOODS',
    services: 'POLISHING, FAN & DRYER',
    moisture: 'CORN MOISTURE DEDUCTION',
    finance: 'DEBTS & CASH MUTATION',
    riceStock: 'RICE STOCK',
    reports: 'INTEGRATED REPORTS',
    database: 'MASTER DATABASE',
    
    warehouseHeader: 'US BILIBILI 162',
    centralWarehouse: 'CENTRAL WAREHOUSE 🌽',
    systemStatus: 'Warehouse Information System & Weighbridge GSC GST-9700',
    theme: 'THEME',
    printerSettings: 'Printer Settings',
    online: 'ONLINE',
    newWeighing: '🚚 New Weighing',
    cashMutation: '📊 Cash Mutation',
    cornStock: 'CORN STOCK 🌽',
    riceStockLabel: 'INBOUND RICE STOCK 🌾',
    totalServiceBilling: 'TOTAL POLISHING BILLING 🌪️',
    cashBalance: 'CASH & BANK BALANCE 💳',
    unpaid: 'Unpaid',
    paid: 'Paid',
    supplierDebt: 'Supplier Debt',
    kgNetto: 'Kg Net',
    
    truckWeighbridgeDesc: 'Enter the GSC GST-9700 weighbridge simulator to weigh heavy/empty trucks, calculate bag deductions, moisture percentages, and print thermal receipt slips.',
    openWeighbridge: 'Open Weighing App',
    inboundDesc: 'Record incoming wet corn for drying tanks, weigh farmer trucks, moisture deduction, labor costs, and warehouse storage locations.',
    recordInbound: 'Record Inbound Goods',
    processingDesc: 'Rice polishing, fan blower cleaning, and corn drying (dryer) for clean quality output.',
    openServices: 'Open Processing Services',
    
    scanSuccess: 'Scan successful!',
    updateSuccess: 'Data updated successfully!',
    deleteSuccess: 'Data deleted successfully!',
    saveSuccess: 'Data saved successfully!',
    confirmDelete: 'Are you sure you want to delete this data?',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    confirmOk: 'Yes, Continue',
    confirmAdd: 'Yes, Add Data',
    confirmEdit: 'Yes, Save Changes',
    confirmDeleteBtn: 'Yes, Delete Data',
    confirmPay: 'Yes, Pay Installment',
    actionAuthorization: 'This action requires operator authorization before execution.',
    successToast: 'SUCCESS',
    errorToast: 'ERROR',
    warningToast: 'WARNING',
    infoToast: 'INFORMATION',

    inboundTitle: 'Inbound Goods Receipt',
    outboundTitle: 'Outbound Goods Shipment',
    moistureTitle: 'Corn Moisture Deduction Refaksi',
    financeTitle: 'Financial Management & Cash Mutation',
    reportsTitle: 'Integrated Management Reports',
    databaseTitle: 'System Master Database',
    servicesTitle: 'Polishing & Blowing Services',
    brokerEmployees: 'Labor & Brokers',
    
    searchPlaceholder: 'Search data...',
    recordNew: 'Record New',
    archives: 'Archives',
    total: 'Total',

    date: 'Date',
    ticketNo: 'Ticket No',
    policeNo: 'Police No',
    supplier: 'Supplier/Farmer',
    customer: 'Buyer/Customer',
    commodity: 'Commodity',
    grossWeight: 'Gross (Kg)',
    tareWeight: 'Tare (Kg)',
    netWeight: 'Net (Kg)',
    price: 'Price (Rp)',
    totalAmount: 'Total (Rp)',
    action: 'Action',
    status: 'Status',
    driver: 'Driver',
    notes: 'Notes',
    
    gross: 'Gross',
    tare: 'Tare',
    netto: 'Net',
    bagDeduction: 'Bag Deduction',
    moistureDeduction: 'Moisture Deduction',
    finalWeight: 'Final Net',

    gudangBilibili: 'BILIBILI WAREHOUSE',
    pinrangLocation: 'Weighing Terminal GSC GST-9700 • Pinrang Regency, South Sulawesi',
    recentTransactions: 'RECENT WEIGHING TRANSACTIONS',
    viewAll: 'View All',
    
    printerNameLabel: 'Printer Name (Default)',
    printerNotice: 'Note: Web browsers do not allow automatic printer selection without a dialog. This setting is only useful for system reference.',
    saveAndClose: 'Save & Close',

    weighingQueueTitle: "Today's Recent Weighing Queue",
    goods: 'Goods',
    supplierOrMitra: 'Supplier / Partner Destination',
    weighing1Gross: 'Weighing I (Gross)',
    weighing2Tare: 'Weighing II (Tare)',
    netWeightDashboard: 'Net Weight',
    viewAllArchives: 'View All Weighing Archives',
    completedStatus: 'WEIGHING COMPLETED',
    waitingStatus: 'WAITING II',
    completedBadge: 'COMPLETED',
    waitingBadge: 'WAITING II',
    completedBadgeTable: 'COMPLETED',
    waitingBadgeTable: 'PROCESS',
    
    weighingIndicator: 'WEIGHING INDICATOR',
    stable: 'STABLE',
    zero: 'ZERO',
    activeWeightSimulator: 'ACTIVE WEIGHT SIMULATOR (KG)',
    apply: 'APPLY',
    zeroScale: 'ZERO SCALE',
    simulatorInstruction: 'Use the buttons above to simulate truck weight on the physical scale, then record the data on the computer.',
    operationalButtons: 'Operational Buttons',
    startNewWeighing: 'Start New Weighing',
    saveWeighing1: 'Save Weighing I (Gross / Inbound)',
    reweigh1: 'Re-Weigh Weighing I',
    completeWeighing2: 'Complete Weighing II (Tare / Outbound)',
    weighingAppTitle: 'WEIGHBRIDGE APPLICATION - US BILIBILI 162',
    techSupport: 'YA TEKNIK, MAKASSAR',
    weighingTransaction: 'WEIGHING TRANSACTION',
    currentWeight: 'CURRENT SCALE WEIGHT',
    overweightWarning: '⚠️ OUT OF RANGE / OVERWEIGHT',
    ticketNumberLabel: 'Number',
    plateNumberLabel: 'Plate Number',
    goodsNameLabel: 'Goods Name',
    agencyLabel: 'Agency/Destination',
    weigh1Label: 'WEIGHING I',
    weigh2Label: 'WEIGHING II',
    grossWeightLabel: 'Gross Weight',
    tareWeightLabel: 'Tare Weight',
    bagDeductionLabel: 'Bag Ded. %',
    refaksiLabel: 'Moisture Ded. %',
    netWeightLabel: 'NET Weight',
    notesLabel: 'Notes',
    notesPlaceholder: 'Enter weighing notes...',
    noNotes: 'No notes available',
    exportExcel: 'Export Excel',
    printReportsPDF: 'Print Reports / PDF',
    searchTicketPlaceholder: 'Search Plate/Ticket No...',
    ticketArchiveTitle: 'Weighbridge Ticket Archive',
    ticketNoHeader: 'Ticket No',
    plateNoHeader: 'Plate No',
    goodsHeader: 'Goods',
    agencyHeader: 'Agency / Partner',
    weigh1KgHeader: 'Weigh I (Kg)',
    weigh2KgHeader: 'Weigh II (Kg)',
    netKgHeader: 'Net (Kg)',
    statusHeader: 'Status',
    actionHeader: 'Action',
    confirmCompleteTimbang2: 'Confirm Complete Weighing 2',
    noTicketsFound: 'No weighing tickets found.',
    printSlipPreview: 'Print Weighing Slip Preview',
    thermalSlipHeader: 'US BILIBILI 162 WAREHOUSE',
    thermalSlipAddress: 'Jl. Poros Pinrang - Parepare, Watang, Suppa',
    thermalSlipCity: 'Pinrang Regency, South Sulawesi 91131',
    thermalSlipPhone: 'PHONE - 085244466009',
    confirmAddTimbang1: 'Confirm Add Weighing Queue 1',
    confirmEditTimbang1: 'Confirm Weighing 1 Change',
    confirmDeleteTicket: 'Confirm Delete Ticket',

    riceStockTitle: 'Rice Stock Details',
    closeForm: 'Close Form',
    recordNewStock: 'Record New Stock',
    dateLabel: 'Date',
    descriptionLabel: 'Description',
    priceLabel: 'Price (Rp)',
    collyLabel: 'Colly',
    inStockLabel: 'Inbound (Kg)',
    outStockLabel: 'Outbound (Kg)',
    totalTransaction: 'Total Transaction',
    totalStockBalance: 'Total Stock',
    itemNameLabel: 'Item Name',
    saveStock: 'Save',
    errorIncompleteStock: 'Please complete the stock form!',
    successUpdateStock: 'Successfully updated rice stock data!',
    successSaveStock: 'Successfully saved rice stock data!',
    confirmDeleteStock: 'Confirm Delete',
    confirmDeleteStockMsg: 'Are you sure you want to delete {description}?',
    confirmEditStock: 'Confirm Edit',
    confirmSaveStock: 'Confirm Save',
    confirmEditStockMsg: 'Are you sure you want to save changes?',
    confirmSaveStockMsg: 'Are you sure you want to record new stock!',
    paidStatus: 'PAID',
    unpaidStatus: 'UNPAID',
    debtsArchivesTitle: 'Farmer Alliance Debt Records',
    debtsSubTitle: 'Records of US Bilibili debts to external suppliers/farmers for corn and rice shipments that have not been fully paid.',
    closeFormLabel: 'Close Form',
    recordNewDebtLabel: 'Record New Debt',
    addDebtTitle: 'Add New Debt Record',
    supplierLabel: 'Supplier/Farmer',
    descriptionLabelFinance: 'Description / Details',
    amountLabel: 'Amount (Rp)',
    saveEntry: 'Save Data',
    financeEntryTitle: 'Cash Mutation & Account Channel Book',
    financeSubTitle: 'Daily record of cash inflow (debit) and outflow (credit) through various payment channels.',
    recordNewFinanceLabel: 'Record New Mutation',
    addFinanceTitle: 'Add New Mutation Transaction',
    typeLabel: 'Type',
    categoryLabel: 'Category',
    channelLabel: 'Account Channel',
    brokerCommissionTitle: 'Broker Commission Calculator',
    brokerCommissionSubTitle: 'Calculate and pay broker commissions based on incoming shipment weight.',
    selectBrokerLabel: 'Select Broker',
    cargoWeightLabel: 'Cargo Weight (Kg)',
    commissionRateLabel: 'Commission Rate (Rp/Kg)',
    calculatedCommissionLabel: 'Calculated Total Commission',
    payCommission: 'Pay Commission',
    installmentLabel: 'Pay Installment',
    payInstallment: 'Complete Payment',

    themeChanged: 'Visual theme changed successfully!',
    saveWeighbridgeSuccess: 'Successfully recorded Weighing I!',
    updateWeighbridgeSuccess: 'Successfully updated ticket info!',
    deleteWeighbridgeSuccess: 'Successfully deleted weighing ticket!',
    deleteSuccessGeneral: 'Data deleted successfully!',

    errorPlateRequired: 'Plate Number is required!',
    errorAgencyRequired: 'Agency / Destination is required!',
    errorSelectTicket: 'Please select an active ticket first!',
    errorAlreadyCompleted: 'Ticket has already completed weighing 2!',
  }
};
