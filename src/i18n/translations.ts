
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
  products: string;
  
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
    weighbridge: 'JEMBATAN TIMBANGAN',
    inbound: 'LOGISTIK MASUK',
    outbound: 'LOGISTIK KELUAR',
    services: 'JASA PROSESING (POLES & DRYER)',
    moisture: 'REFAKSI KADAR AIR (KA)',
    finance: 'KEUANGAN & KAS',
    riceStock: 'LOGISTIK BERAS',
    reports: 'LAPORAN TERPADU',
    database: 'DATABASE MASTER',
    products: 'KATALOG PRODUK',
    
    warehouseHeader: 'US BILIBILI 162',
    centralWarehouse: 'GUDANG PUSAT 🌽',
    systemStatus: 'SISTEM INFORMASI PERGUDANGAN & JEMBATAN TIMBANG GSC GST-9700',
    theme: 'TEMA VISUAL',
    printerSettings: 'PENGATURAN PRINTER',
    online: 'AKTIF (ONLINE)',
    newWeighing: '🚚 TIMBANGAN BARU',
    cashMutation: '📊 MUTASI KAS REKENING',
    cornStock: 'LOGISTIK JAGUNG GUDANG 🌽',
    riceStockLabel: 'LOGISTIK BERAS MASUK 🌾',
    totalServiceBilling: 'TOTAL BILLING JASA POLES 🌪️',
    cashBalance: 'SALDO KAS & MANDIRI 💳',
    unpaid: 'BELUM LUNAS',
    paid: 'LUNAS',
    supplierDebt: 'UTANG SUPPLIER',
    kgNetto: 'KG NETTO',
    
    truckWeighbridgeDesc: 'MASUK KE MODULATOR SIMULATOR JEMBATAN TIMBANG GSC GST-9700 UNTUK MENIMBANG TRUK BERAT, KOSONG, PENUANGAN SUSUT POTONGAN KARUNG, PERSENAN REFAKSI KA, SERTA CETAK PRINT THERMAL SLIP KASIR.',
    openWeighbridge: 'BUKA APLIKASI TIMBANGAN',
    inboundDesc: 'CATAT INCOMING JAGUNG PIPIL BASAH UNTUK TANGKI PENGERINGAN, TIMBANG TRUK MASUK PETANI, POTONG KADAR AIR, HITUNG REFAKSI, UPAH BURUH PANGGUL HARIAN DAN LETAK PENYIMPANAN SEKTOR GUDANG.',
    recordInbound: 'CATAT BARANG MASUK',
    processingDesc: 'PENGOLAHAN BERAS POLES, PEMBERSIHAN BLOWER KIPAS, DAN PENGERINGAN JAGUNG (DRYER) UNTUK MENDAPATKAN KUALITAS BERSIH.',
    openServices: 'BUKA JASA POLES KIPAS',
    
    scanSuccess: 'BERHASIL MEMINDAI DATA!',
    updateSuccess: 'DATA BERHASIL DIPERBARUI!',
    deleteSuccess: 'DATA BERHASIL DIHAPUS!',
    saveSuccess: 'DATA BERHASIL DISIMPAN!',
    confirmDelete: 'APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI?',
    cancel: 'BATAL',
    save: 'SIMPAN',
    close: 'TUTUP',
    confirmOk: 'YA, LANJUTKAN',
    confirmAdd: 'YA, TAMBAHKAN DATA',
    confirmEdit: 'YA, SIMPAN PERUBAHAN',
    confirmDeleteBtn: 'YA, HAPUS DATA',
    confirmPay: 'YA, BAYAR CICILAN',
    actionAuthorization: 'AKSI INI MEMERLUKAN KONFIRMASI OTORISASI OPERATOR SEBELUM DIEKSEKUSI.',
    successToast: 'SUKSES',
    errorToast: 'KESALAHAN',
    warningToast: 'PERINGATAN',
    infoToast: 'INFORMASI',

    inboundTitle: 'PENERIMAAN BARANG MASUK',
    outboundTitle: 'PENGIRIMAN BARANG KELUAR',
    moistureTitle: 'REFAKSI KADAR AIR JAGUNG PIPIL',
    financeTitle: 'MANAJEMEN KEUANGAN & MUTASI KAS',
    reportsTitle: 'LAPORAN MANAJEMEN TERPADU',
    databaseTitle: 'DATABASE MASTER SISTEM',
    servicesTitle: 'LAYANAN JASA POLES & KIPAS',
    brokerEmployees: 'BURUH & MAKELAR',
    
    searchPlaceholder: 'CARI DATA...',
    recordNew: 'CATAT BARU',
    archives: 'ARSIP',
    total: 'TOTAL',
    
    date: 'TANGGAL',
    ticketNo: 'NO. TIKET',
    policeNo: 'NO. POLISI',
    supplier: 'SUPPLIER PETANI',
    customer: 'PEMBELI / BUYER',
    commodity: 'KOMODITAS',
    grossWeight: 'BRUTO (KG)',
    tareWeight: 'TARA (KG)',
    netWeight: 'NETTO (KG)',
    price: 'HARGA (RP)',
    totalAmount: 'TOTAL (RP)',
    action: 'AKSI',
    status: 'STATUS',
    driver: 'SOPIR',
    notes: 'CATATAN',
    
    gross: 'BRUTO',
    tare: 'TARA',
    netto: 'NETTO',
    bagDeduction: 'POTONGAN KARUNG',
    moistureDeduction: 'REFAKSI KA',
    finalWeight: 'NETTO AKHIR',

    gudangBilibili: 'GUDANG US BILIBILI 162',
    pinrangLocation: 'TERMINAL TIMBANG GSC GST-9700 • KABUPATEN PINRANG, SULAWESI SELATAN',
    recentTransactions: 'TRANSAKSI TIMBANGAN TERBARU',
    viewAll: 'LIHAT SEMUA',
    
    printerNameLabel: 'NAMA PRINTER (DEFAULT)',
    printerNotice: 'CATATAN: WEB BROWSER TIDAK MENIZINKAN PEMILIHAN PRINTER OTOMATIS TANPA DIALOG. PENGATURAN INI HANYA BERGUNA UNTUK REFERENSI SISTEM.',
    saveAndClose: 'SIMPAN & TUTUP',

    weighingQueueTitle: 'ANTRIAN TIMBANGAN TERBARU HARI INI',
    goods: 'BARANG',
    supplierOrMitra: 'SUPPLIER / TUJUAN MITRA',
    weighing1Gross: 'TIMBANG I (GROSS)',
    weighing2Tare: 'TIMBANG II (TARE)',
    netWeightDashboard: 'BERAT NETTO',
    viewAllArchives: 'LIHAT SELURUH ARSIP TIMBANGAN',
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
    simulatorInstruction: 'GUNAKAN TOMBOL DI ATAS UNTUK MENSIMULASIKAN BERAT TRUK DI TIMBANGAN FISIK, LALU CATAT DATANYA DI KOMPUTER.',
    operationalButtons: 'TOMBOL OPERASIONAL',
    startNewWeighing: 'MULAI TIMBANG BARU',
    saveWeighing1: 'SIMPAN TIMBANG I (GROSS / MASUK)',
    reweigh1: 'RE-WEIGH TIMBANG I',
    completeWeighing2: 'SELESAI TIMBANG II (TARE / KELUAR)',
    weighingAppTitle: 'APLIKASI JEMBATAN TIMBANGAN - US BILIBILI 162',
    techSupport: 'YA TEKNIK, MAKASSAR',
    weighingTransaction: 'TRANSAKSI TIMBANGAN',
    currentWeight: 'BERAT TIMBANGAN SAAT INI',
    overweightWarning: '⚠️ OUT OF RANGE / OVERWEIGHT',
    ticketNumberLabel: 'NOMOR',
    plateNumberLabel: 'NO. POLISI',
    goodsNameLabel: 'NAMA BARANG',
    agencyLabel: 'AGEN/TUJUAN',
    weigh1Label: 'TIMBANG I',
    weigh2Label: 'TIMBANG II',
    grossWeightLabel: 'BERAT BRUTO',
    tareWeightLabel: 'BERAT TARA',
    bagDeductionLabel: 'POT. KRG %',
    refaksiLabel: 'REFAKSI %',
    netWeightLabel: 'BERAT NETTO',
    notesLabel: 'CATATAN',
    notesPlaceholder: 'MASUKKAN CATATAN TIMBANG...',
    noNotes: 'TIDAK ADA CATATAN',
    exportExcel: 'EXPORT EXCEL',
    printReportsPDF: 'CETAK LAPORAN / PDF',
    searchTicketPlaceholder: 'CARI NO. POLISI/TIKET...',
    ticketArchiveTitle: 'ARSIP TIKET JEMBATAN TIMBANGAN',
    ticketNoHeader: 'NO. TIKET',
    plateNoHeader: 'NO. POLISI',
    goodsHeader: 'BARANG',
    agencyHeader: 'AGEN / MITRA',
    weigh1KgHeader: 'TIMBANG I (KG)',
    weigh2KgHeader: 'TIMBANG II (KG)',
    netKgHeader: 'NETTO (KG)',
    statusHeader: 'STATUS',
    actionHeader: 'AKSI',
    confirmCompleteTimbang2: 'KONFIRMASI SELESAIKAN TIMBANG 2',
    noTicketsFound: 'TIDAK ADA TIKET TIMBANGAN DITEMUKAN.',
    printSlipPreview: 'PRATINJAU CETAK SLIP TIMBANGAN',
    thermalSlipHeader: 'GUDANG US BILIBILI 162',
    thermalSlipAddress: 'JL. POROS PINRANG - PAREPARE, KEL. WATANG, KEC. SUPPA',
    thermalSlipCity: 'KABUPATEN PINRANG, SULAWESI SELATAN 91131',
    thermalSlipPhone: 'TELP - 085244466009',
    confirmAddTimbang1: 'KONFIRMASI TAMBAH ANTRIAN TIMBANG 1',
    confirmEditTimbang1: 'KONFIRMASI PERUBAHAN TIMBANG 1',
    confirmDeleteTicket: 'KONFIRMASI HAPUS TIKET',

    riceStockTitle: 'RINCIAN LOGISTIK BERAS',
    closeForm: 'TUTUP FORMULIR',
    recordNewStock: 'CATAT LOGISTIK BARU',
    dateLabel: 'TANGGAL',
    descriptionLabel: 'URAIAN',
    priceLabel: 'HARGA (RP)',
    collyLabel: 'COLLY',
    inStockLabel: 'MASUK (KG)',
    outStockLabel: 'KELUAR (KG)',
    totalTransaction: 'TOTAL TRANSAKSI',
    totalStockBalance: 'TOTAL LOGISTIK',
    itemNameLabel: 'NAMA BARANG/ITEM',
    saveStock: 'SIMPAN DATA',
    errorIncompleteStock: 'MOHON LENGKAPI FORMULIR LOGISTIK!',
    successUpdateStock: 'SUKSES MEMPERBARUI DATA LOGISTIK BERAS!',
    successSaveStock: 'SUKSES MENYIMPAN DATA LOGISTIK BERAS!',
    confirmDeleteStock: 'KONFIRMASI HAPUS',
    confirmDeleteStockMsg: 'YAKIN HAPUS DATA {description}?',
    confirmEditStock: 'KONFIRMASI UBAH',
    confirmSaveStock: 'KONFIRMASI SIMPAN',
    confirmEditStockMsg: 'YAKIN INGIN MENYIMPAN PERUBAHAN?',
    confirmSaveStockMsg: 'YAKIN INGIN MENCATAT LOGISTIK BARU!',
    paidStatus: 'LUNAS',
    unpaidStatus: 'BELUM BAYAR',
    debtsArchivesTitle: 'CATATAN UTANG SUPPLIER PETANI',
    debtsSubTitle: 'CATATAN UTANG US BILIBILI KEPADA SUPPLIER LUAR / PETANI PENGIRIM BIJI JAGUNG DAN BERAS YANG BELUM LUNAS DIBAYAR.',
    closeFormLabel: 'TUTUP FORM',
    recordNewDebtLabel: 'CATAT UTANG BARU',
    addDebtTitle: 'TAMBAH CATATAN UTANG BARU',
    supplierLabel: 'SUPPLIER PETANI',
    descriptionLabelFinance: 'URAIAN / PERINCIAN',
    amountLabel: 'JUMLAH (RP)',
    saveEntry: 'SIMPAN DATA',
    financeEntryTitle: 'BUKU MUTASI KAS & SALURAN REKENING',
    financeSubTitle: 'REKAMAN ALUR KAS MASUK (DEBIT) DAN KAS KELUAR (KREDIT) HARIAN GUDANG MELALUI BERBAGAI SALURAN PEMBAYARAN.',
    recordNewFinanceLabel: 'CATAT MUTASI BARU',
    addFinanceTitle: 'TAMBAH TRANSAKSI MUTASI BARU',
    typeLabel: 'JENIS ALIRAN',
    categoryLabel: 'KATEGORI MUTASI',
    channelLabel: 'SALURAN REKENING',
    brokerCommissionTitle: 'KALKULATOR KOMISI MAKELAR',
    brokerCommissionSubTitle: 'HITUNG DAN BAYAR KOMISI MAKELAR BERDASARKAN BERAT KIRIMAN YANG MASUK.',
    selectBrokerLabel: 'PILIH MAKELAR / BROKER REKANAN',
    cargoWeightLabel: 'BERAT CARGO NETTO (KG)',
    commissionRateLabel: 'TARIF KOMISI (RP/KG)',
    calculatedCommissionLabel: 'TOTAL KOMISI DIHITUNG',
    payCommission: 'KONFIRMASI BAYAR KOMISI',
    installmentLabel: 'BAYAR CICILAN',
    payInstallment: 'SELESAIKAN PEMBAYARAN CICILAN',

    themeChanged: 'TEMA VISUAL BERHASIL DIUBAH SELESAI!',
    saveWeighbridgeSuccess: 'BERHASIL MENCATATKAN TIMBANG I!',
    updateWeighbridgeSuccess: 'BERHASIL MEMPERBARUI INFO TIKET!',
    deleteWeighbridgeSuccess: 'SUKSES MENGHAPUS TIKET TIMBANGAN!',
    deleteSuccessGeneral: 'DATA BERHASIL DIHAPUS SEMPURNA!',
    
    errorPlateRequired: 'NOMOR POLISI HARUS DIISI!',
    errorAgencyRequired: 'AGEN / TUJUAN HARUS DIISI!',
    errorSelectTicket: 'PILIH TIKET AKTIF TERLEBIH DAHULU!',
    errorAlreadyCompleted: 'TIKET SUDAH SELESAI DITIMBANG 2!',
  },
  en: {
    dashboard: 'MAIN DASHBOARD (CENTRAL)',
    weighbridge: 'WEIGHBRIDGE TERMINAL',
    inbound: 'LOGISTICS INBOUND',
    outbound: 'LOGISTICS OUTBOUND',
    services: 'PROCESSING SERVICES (POLISH & DRYER)',
    moisture: 'MOISTURE DEDUCTION (CORN)',
    finance: 'FINANCE & CASH MUTATION',
    riceStock: 'RICE LOGISTICS',
    reports: 'INTEGRATED REPORTS',
    database: 'MASTER DATABASE',
    products: 'PRODUCT CATALOG',
    
    warehouseHeader: 'US BILIBILI 162',
    centralWarehouse: 'CENTRAL WAREHOUSE 🌽',
    systemStatus: 'WAREHOUSE INFORMATION SYSTEM & WEIGHBRIDGE GSC GST-9700',
    theme: 'VISUAL THEME',
    printerSettings: 'PRINTER SETTINGS',
    online: 'ACTIVE (ONLINE)',
    newWeighing: '🚚 NEW WEIGHING',
    cashMutation: '📊 CASH MUTATION',
    cornStock: 'WAREHOUSE CORN STOCK 🌽',
    riceStockLabel: 'INBOUND RICE STOCK 🌾',
    totalServiceBilling: 'TOTAL POLISHING BILLING 🌪️',
    cashBalance: 'CASH & BANK BALANCE 💳',
    unpaid: 'UNPAID',
    paid: 'PAID',
    supplierDebt: 'SUPPLIER DEBT',
    kgNetto: 'KG NET',
    
    truckWeighbridgeDesc: 'ENTER THE GSC GST-9700 WEIGHBRIDGE SIMULATOR TO WEIGH HEAVY/EMPTY TRUCKS, CALCULATE BAG DEDUCTIONS, MOISTURE PERCENTAGES, AND PRINT THERMAL RECEIPT SLIPS.',
    openWeighbridge: 'OPEN WEIGHING APP',
    inboundDesc: 'RECORD INCOMING WET CORN FOR DRYING TANKS, WEIGH FARMER TRUCKS, MOISTURE DEDUCTION, LABOR COSTS, AND WAREHOUSE STORAGE LOCATIONS.',
    recordInbound: 'RECORD INBOUND GOODS',
    processingDesc: 'RICE POLISHING, FAN BLOWER CLEANING, AND CORN DRYING (DRYER) FOR CLEAN QUALITY OUTPUT.',
    openServices: 'OPEN PROCESSING SERVICES',
    
    scanSuccess: 'SCAN SUCCESSFUL!',
    updateSuccess: 'DATA UPDATED SUCCESSFULLY!',
    deleteSuccess: 'DATA DELETED SUCCESSFULLY!',
    saveSuccess: 'DATA SAVED SUCCESSFULLY!',
    confirmDelete: 'ARE YOU SURE YOU WANT TO DELETE THIS DATA?',
    cancel: 'CANCEL',
    save: 'SAVE',
    close: 'CLOSE',
    confirmOk: 'YES, CONTINUE',
    confirmAdd: 'YES, ADD DATA',
    confirmEdit: 'YES, SAVE CHANGES',
    confirmDeleteBtn: 'YES, DELETE DATA',
    confirmPay: 'YES, PAY INSTALLMENT',
    actionAuthorization: 'THIS ACTION REQUIRES OPERATOR AUTHORIZATION BEFORE EXECUTION.',
    successToast: 'SUCCESS',
    errorToast: 'ERROR',
    warningToast: 'WARNING',
    infoToast: 'INFORMATION',

    inboundTitle: 'INBOUND GOODS RECEIPT',
    outboundTitle: 'OUTBOUND GOODS SHIPMENT',
    moistureTitle: 'CORN MOISTURE DEDUCTION REFANSI',
    financeTitle: 'FINANCIAL MANAGEMENT & CASH MUTATION',
    reportsTitle: 'INTEGRATED MANAGEMENT REPORTS',
    databaseTitle: 'SYSTEM MASTER DATABASE',
    servicesTitle: 'POLISHING & BLOWING SERVICES',
    brokerEmployees: 'LABOR & BROKERS',
    
    searchPlaceholder: 'SEARCH DATA...',
    recordNew: 'RECORD NEW',
    archives: 'ARCHIVES',
    total: 'TOTAL',

    date: 'DATE',
    ticketNo: 'TICKET NO',
    policeNo: 'POLICE NO',
    supplier: 'SUPPLIER FARMER',
    customer: 'BUYER / CUSTOMER',
    commodity: 'COMMODITY',
    grossWeight: 'GROSS (KG)',
    tareWeight: 'TARE (KG)',
    netWeight: 'NET (KG)',
    price: 'PRICE (RP)',
    totalAmount: 'TOTAL (RP)',
    action: 'ACTION',
    status: 'STATUS',
    driver: 'DRIVER',
    notes: 'NOTES',
    
    gross: 'GROSS',
    tare: 'TARE',
    netto: 'NET',
    bagDeduction: 'BAG DEDUCTION',
    moistureDeduction: 'MOISTURE DEDUCTION',
    finalWeight: 'FINAL NET',

    gudangBilibili: 'US BILIBILI 162 WAREHOUSE',
    pinrangLocation: 'WEIGHING TERMINAL GSC GST-9700 • PINRANG REGENCY, SOUTH SULAWESI',
    recentTransactions: 'RECENT WEIGHING TRANSACTIONS',
    viewAll: 'VIEW ALL',
    
    printerNameLabel: 'PRINTER NAME (DEFAULT)',
    printerNotice: 'NOTE: WEB BROWSERS DO NOT ALLOW AUTOMATIC PRINTER SELECTION WITHOUT A DIALOG. THIS SETTING IS ONLY USEFUL FOR SYSTEM REFERENCE.',
    saveAndClose: 'SAVE & CLOSE',

    weighingQueueTitle: "TODAY'S RECENT WEIGHING QUEUE",
    goods: 'GOODS',
    supplierOrMitra: 'SUPPLIER / PARTNER DESTINATION',
    weighing1Gross: 'WEIGHING I (GROSS)',
    weighing2Tare: 'WEIGHING II (TARE)',
    netWeightDashboard: 'NET WEIGHT',
    viewAllArchives: 'VIEW ALL WEIGHING ARCHIVES',
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
    simulatorInstruction: 'USE THE BUTTONS ABOVE TO SIMULATE TRUCK WEIGHT ON THE PHYSICAL SCALE, THEN RECORD THE DATA ON THE COMPUTER.',
    operationalButtons: 'OPERATIONAL BUTTONS',
    startNewWeighing: 'START NEW WEIGHING',
    saveWeighing1: 'SAVE WEIGHING I (GROSS / INBOUND)',
    reweigh1: 'RE-WEIGH WEIGHING I',
    completeWeighing2: 'COMPLETE WEIGHING II (TARE / OUTBOUND)',
    weighingAppTitle: 'WEIGHBRIDGE APPLICATION - US BILIBILI 162',
    techSupport: 'YA TEKNIK, MAKASSAR',
    weighingTransaction: 'WEIGHING TRANSACTION',
    currentWeight: 'CURRENT SCALE WEIGHT',
    overweightWarning: '⚠️ OUT OF RANGE / OVERWEIGHT',
    ticketNumberLabel: 'NUMBER',
    plateNumberLabel: 'PLATE NUMBER',
    goodsNameLabel: 'GOODS NAME',
    agencyLabel: 'AGENCY/DESTINATION',
    weigh1Label: 'WEIGHING I',
    weigh2Label: 'WEIGHING II',
    grossWeightLabel: 'GROSS WEIGHT',
    tareWeightLabel: 'TARE WEIGHT',
    bagDeductionLabel: 'BAG DED. %',
    refaksiLabel: 'MOISTURE DED. %',
    netWeightLabel: 'NET WEIGHT',
    notesLabel: 'NOTES',
    notesPlaceholder: 'ENTER WEIGHING NOTES...',
    noNotes: 'NO NOTES AVAILABLE',
    exportExcel: 'EXPORT EXCEL',
    printReportsPDF: 'PRINT REPORTS / PDF',
    searchTicketPlaceholder: 'SEARCH PLATE/TICKET NO...',
    ticketArchiveTitle: 'WEIGHBRIDGE TICKET ARCHIVE',
    ticketNoHeader: 'TICKET NO',
    plateNoHeader: 'PLATE NO',
    goodsHeader: 'GOODS',
    agencyHeader: 'AGENCY / PARTNER',
    weigh1KgHeader: 'WEIGH I (KG)',
    weigh2KgHeader: 'WEIGH II (KG)',
    netKgHeader: 'NET (KG)',
    statusHeader: 'STATUS',
    actionHeader: 'ACTION',
    confirmCompleteTimbang2: 'CONFIRM COMPLETE WEIGHING 2',
    noTicketsFound: 'NO WEIGHING TICKETS FOUND.',
    printSlipPreview: 'PRINT WEIGHING SLIP PREVIEW',
    thermalSlipHeader: 'US BILIBILI 162 WAREHOUSE',
    thermalSlipAddress: 'JL. POROS PINRANG - PAREPARE, WATANG, SUPPA',
    thermalSlipCity: 'PINRANG REGENCY, SOUTH SULAWESI 91131',
    thermalSlipPhone: 'PHONE - 085244466009',
    confirmAddTimbang1: 'CONFIRM ADD WEIGHING QUEUE 1',
    confirmEditTimbang1: 'CONFIRM WEIGHING 1 CHANGE',
    confirmDeleteTicket: 'CONFIRM DELETE TICKET',

    riceStockTitle: 'RICE STOCK DETAILS',
    closeForm: 'CLOSE FORM',
    recordNewStock: 'RECORD NEW STOCK',
    dateLabel: 'DATE',
    descriptionLabel: 'DESCRIPTION',
    priceLabel: 'PRICE (RP)',
    collyLabel: 'COLLY',
    inStockLabel: 'INBOUND (KG)',
    outStockLabel: 'OUTBOUND (KG)',
    totalTransaction: 'TOTAL TRANSACTION',
    totalStockBalance: 'TOTAL STOCK',
    itemNameLabel: 'ITEM NAME',
    saveStock: 'SAVE',
    errorIncompleteStock: 'PLEASE COMPLETE THE STOCK FORM!',
    successUpdateStock: 'SUCCESSFULLY UPDATED RICE STOCK DATA!',
    successSaveStock: 'SUCCESSFULLY SAVED RICE STOCK DATA!',
    confirmDeleteStock: 'CONFIRM DELETE',
    confirmDeleteStockMsg: 'ARE YOU SURE YOU WANT TO DELETE {description}?',
    confirmEditStock: 'CONFIRM EDIT',
    confirmSaveStock: 'CONFIRM SAVE',
    confirmEditStockMsg: 'ARE YOU SURE YOU WANT TO SAVE CHANGES?',
    confirmSaveStockMsg: 'ARE YOU SURE YOU WANT TO RECORD NEW STOCK!',
    paidStatus: 'PAID',
    unpaidStatus: 'UNPAID',
    debtsArchivesTitle: 'FARMER ALLIANCE DEBT RECORDS',
    debtsSubTitle: 'RECORDS OF US BILIBILI DEBTS TO EXTERNAL SUPPLIERS/FARMERS FOR CORN AND RICE SHIPMENTS THAT HAVE NOT BEEN FULLY PAID.',
    closeFormLabel: 'CLOSE FORM',
    recordNewDebtLabel: 'RECORD NEW DEBT',
    addDebtTitle: 'ADD NEW DEBT RECORD',
    supplierLabel: 'SUPPLIER FARMER',
    descriptionLabelFinance: 'DESCRIPTION / DETAILS',
    amountLabel: 'AMOUNT (RP)',
    saveEntry: 'SAVE DATA',
    financeEntryTitle: 'CASH MUTATION & ACCOUNT CHANNEL BOOK',
    financeSubTitle: 'DAILY RECORD OF CASH INFLOW (DEBIT) AND OUTFLOW (CREDIT) THROUGH VARIOUS PAYMENT CHANNELS.',
    recordNewFinanceLabel: 'RECORD NEW MUTATION',
    addFinanceTitle: 'ADD NEW MUTATION TRANSACTION',
    typeLabel: 'TYPE',
    categoryLabel: 'CATEGORY',
    channelLabel: 'ACCOUNT CHANNEL',
    brokerCommissionTitle: 'BROKER COMMISSION CALCULATOR',
    brokerCommissionSubTitle: 'CALCULATE AND PAY BROKER COMMISSIONS BASED ON INCOMING SHIPMENT WEIGHT.',
    selectBrokerLabel: 'SELECT BROKER',
    cargoWeightLabel: 'CARGO WEIGHT (KG)',
    commissionRateLabel: 'COMMISSION RATE (RP/KG)',
    calculatedCommissionLabel: 'CALCULATED TOTAL COMMISSION',
    payCommission: 'PAY COMMISSION',
    installmentLabel: 'PAY INSTALLMENT',
    payInstallment: 'COMPLETE PAYMENT',

    themeChanged: 'VISUAL THEME CHANGED SUCCESSFULLY!',
    saveWeighbridgeSuccess: 'SUCCESSFULLY RECORDED WEIGHING I!',
    updateWeighbridgeSuccess: 'SUCCESSFULLY UPDATED TICKET INFO!',
    deleteWeighbridgeSuccess: 'SUCCESSFULLY DELETED WEIGHING TICKET!',
    deleteSuccessGeneral: 'DATA DELETED SUCCESSFULLY!',

    errorPlateRequired: 'PLATE NUMBER IS REQUIRED!',
    errorAgencyRequired: 'AGENCY / DESTINATION IS REQUIRED!',
    errorSelectTicket: 'PLEASE SELECT AN ACTIVE TICKET FIRST!',
    errorAlreadyCompleted: 'TICKET HAS ALREADY COMPLETED WEIGHING 2!',
  }
};
