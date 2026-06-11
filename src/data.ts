/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  CornMoistureRule
} from './types';

export const initialLaborRates: LaborRateRecord[] = [
  { id: 'lr-1', activityName: 'BONGKARAN', rateType: 'PER_KG', rate: 30 },
  { id: 'lr-2', activityName: 'MUAT', rateType: 'PER_KG', rate: 30 },
  { id: 'lr-3', activityName: 'TIMBANG JAGUNG SAK', rateType: 'PER_KG', rate: 25 },
  { id: 'lr-4', activityName: 'MUAT JAGUNG SAK', rateType: 'PER_KG', rate: 30 },
  { id: 'lr-5', activityName: 'TIMBANG JAGUNG CURAH', rateType: 'PER_KG', rate: 15 },
  { id: 'lr-6', activityName: 'MUAT JAGUNG CURAH', rateType: 'PER_KG', rate: 15 },
  { id: 'lr-7', activityName: 'CONTENER', rateType: 'FLAT', rate: 300000 },
  { id: 'lr-8', activityName: 'BONGKARAN DEDAK', rateType: 'PER_KG', rate: 2500 },
  { id: 'lr-9', activityName: 'MUAT DEDAK', rateType: 'PER_KG', rate: 2000 },
  { id: 'lr-10', activityName: 'CURAH', rateType: 'PER_KG', rate: 10 },
  { id: 'lr-11', activityName: 'OPER SAK', rateType: 'PER_KG', rate: 20 },
  { id: 'lr-12', activityName: 'PINDAHAN', rateType: 'PER_KG', rate: 10 },
  { id: 'lr-13', activityName: 'BAL', rateType: 'PER_KG', rate: 10 },
  { id: 'lr-14', activityName: 'STAPEL', rateType: 'PER_KG', rate: 10 },
  { id: 'lr-15', activityName: 'KARUNG AMPAS JAGUNG', rateType: 'PER_KG', rate: 2000 },
  { id: 'lr-16', activityName: 'PINDAHAN AMPAS JAGUNG', rateType: 'PER_KG', rate: 1000 },
  { id: 'lr-17', activityName: 'CURAH AMPAS HALUS', rateType: 'PER_KG', rate: 20 },
  { id: 'lr-18', activityName: 'OPER SAK AMPAS HALUS', rateType: 'PER_KG', rate: 30 },
  { id: 'lr-19', activityName: 'PRODUKSI ARANG CANGKANG', rateType: 'PER_KG', rate: 60 },
  { id: 'lr-20', activityName: 'SEROK JAGUNG', rateType: 'PER_KG', rate: 20 },
  { id: 'lr-21', activityName: 'JEMUR JAGUNG', rateType: 'PER_KG', rate: 70 },
  { id: 'lr-22', activityName: 'PRODUKSI POLES', rateType: 'PER_KG', rate: 25 },
  { id: 'lr-23', activityName: 'PRODUKSI KIPAS', rateType: 'PER_KG', rate: 20 },
  { id: 'lr-24', activityName: 'TIMBANG DEDAK POLES', rateType: 'PER_KG', rate: 2500 },
  { id: 'lr-25', activityName: 'KARUNG DEDAK POLES', rateType: 'PER_KG', rate: 20 },
  { id: 'lr-26', activityName: 'DEDAK JAGUNG', rateType: 'PER_KG', rate: 3000 },
  { id: 'lr-27', activityName: 'SEROK AMPAS', rateType: 'FLAT', rate: 100000 },
  { id: 'lr-28', activityName: 'BONGKAR JAGUNG', rateType: 'PER_KG', rate: 30 },
  { id: 'lr-29', activityName: 'KERO JAGUNG', rateType: 'PER_KG', rate: 20 },
];

export const initialCornMoistureRules: CornMoistureRule[] = [
  // LOKAL
  { id: 'cmr-1', moistureMin: 0.00, moistureMax: 16.00, refaksiPercent: 0.0, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-2', moistureMin: 16.01, moistureMax: 17.00, refaksiPercent: 1.0, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-3', moistureMin: 17.01, moistureMax: 18.00, refaksiPercent: 2.2, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-4', moistureMin: 18.01, moistureMax: 19.00, refaksiPercent: 3.4, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-5', moistureMin: 19.01, moistureMax: 20.00, refaksiPercent: 4.5, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-6', moistureMin: 20.01, moistureMax: 21.00, refaksiPercent: 5.0, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-7', moistureMin: 21.01, moistureMax: 22.00, refaksiPercent: 6.2, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-8', moistureMin: 22.01, moistureMax: 23.00, refaksiPercent: 7.4, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-9', moistureMin: 23.01, moistureMax: 24.00, refaksiPercent: 8.6, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-10', moistureMin: 24.01, moistureMax: 25.00, refaksiPercent: 11.3, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-11', moistureMin: 25.01, moistureMax: 26.00, refaksiPercent: 12.5, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-12', moistureMin: 26.01, moistureMax: 27.00, refaksiPercent: 13.7, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-13', moistureMin: 27.01, moistureMax: 28.00, refaksiPercent: 15.7, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-14', moistureMin: 28.01, moistureMax: 29.00, refaksiPercent: 16.5, priceDiscountPerKg: 0, type: 'LOKAL' },
  { id: 'cmr-15', moistureMin: 29.01, moistureMax: 30.00, refaksiPercent: 18.7, priceDiscountPerKg: 0, type: 'LOKAL' },
  // BONE / LUAR DAERAH
  { id: 'cmr-16', moistureMin: 0.00, moistureMax: 16.00, refaksiPercent: 0.0, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-17', moistureMin: 16.01, moistureMax: 17.00, refaksiPercent: 1.0, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-18', moistureMin: 17.01, moistureMax: 18.00, refaksiPercent: 2.2, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-19', moistureMin: 18.01, moistureMax: 19.00, refaksiPercent: 3.4, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-20', moistureMin: 19.01, moistureMax: 20.00, refaksiPercent: 4.5, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-21', moistureMin: 20.01, moistureMax: 21.00, refaksiPercent: 5.0, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-22', moistureMin: 21.01, moistureMax: 22.00, refaksiPercent: 6.2, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-23', moistureMin: 22.01, moistureMax: 23.00, refaksiPercent: 7.4, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-24', moistureMin: 23.01, moistureMax: 24.00, refaksiPercent: 8.6, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-25', moistureMin: 24.01, moistureMax: 25.00, refaksiPercent: 10.3, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-26', moistureMin: 25.01, moistureMax: 26.00, refaksiPercent: 11.5, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-27', moistureMin: 26.01, moistureMax: 27.00, refaksiPercent: 12.7, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-28', moistureMin: 27.01, moistureMax: 28.00, refaksiPercent: 14.7, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-29', moistureMin: 28.01, moistureMax: 29.00, refaksiPercent: 15.5, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-30', moistureMin: 29.01, moistureMax: 30.00, refaksiPercent: 17.7, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
  { id: 'cmr-31', moistureMin: 30.01, moistureMax: 31.00, refaksiPercent: 19.3, priceDiscountPerKg: 0, type: 'LUAR_DAERAH' },
];

// Standard Corn Moisture Deduction (Refaksi KA Jagung) Table lookup helper
export const getRefaksiByRule = (moisture: number, rules: CornMoistureRule[], type: 'LOKAL' | 'LUAR_DAERAH'): { refaksiPercent: number; description: string } => {
  const filteredRules = rules.filter(r => r.type === type);
  for (const rule of filteredRules) {
    if (moisture >= rule.moistureMin && moisture <= rule.moistureMax) {
      const description = rule.refaksiPercent === 0.0 ? "Aman" : `Potongan ${rule.refaksiPercent}%`;
      return { refaksiPercent: rule.refaksiPercent, description };
    }
  }
  return { refaksiPercent: 0, description: "Tidak Ditemukan" };
}

export const mockCornMoistureRefaksi = (moisture: number): { refaksiPercent: number; description: string } => {
  return getRefaksiByRule(moisture, initialCornMoistureRules, 'LOKAL');
};


export const initialWeighbridgeTickets: WeighbridgeTicket[] = [
  {
    id: "ticket-1",
    ticketNo: "021232",
    policeNo: "DP 8600 AL",
    goodsName: "BERAS",
    agency: "UCU POLES",
    timbang1Time: "08-06-2026 14:39:58",
    timbang1Weight: 3560,
    timbang2Time: null,
    timbang2Weight: 0,
    grossWeight: 3560,
    tareWeight: 0,
    bagDeductionPercent: 0.00,
    refaksiPercent: 0.00,
    netWeight: 3560,
    status: "PENDING",
    notes: "Barang polesan dlm proses masuk"
  },
  {
    id: "ticket-2",
    ticketNo: "021230",
    policeNo: "DD 9188 CD",
    goodsName: "JAGUNG",
    agency: "IDA GUDANG",
    timbang1Time: "08-06-2026 10:15:22",
    timbang1Weight: 14650,
    timbang2Time: "08-06-2026 11:30:45",
    timbang2Weight: 4250, // Truck Tare Weight
    grossWeight: 14650,
    tareWeight: 4250,
    bagDeductionPercent: 1.00, // 1% sack reduction
    refaksiPercent: 4.00,      // Refaksi KA Jagung
    netWeight: 9880,           // Net weight calculated
    status: "COMPLETED",
    notes: "Jagung Pipil KA 16.8%"
  },
  {
    id: "ticket-3",
    ticketNo: "021231",
    policeNo: "DP 3422 BB",
    goodsName: "GABAH",
    agency: "PABRIK POLS",
    timbang1Time: "08-06-2026 11:45:00",
    timbang1Weight: 8750,
    timbang2Time: "08-06-2026 12:45:10",
    timbang2Weight: 3150,
    grossWeight: 8750,
    tareWeight: 3150,
    bagDeductionPercent: 0.50,
    refaksiPercent: 0.00,
    netWeight: 5572,
    status: "COMPLETED",
    notes: "Gabah Kering Giling"
  },
  {
    id: "ticket-4",
    ticketNo: "021229",
    policeNo: "DD 8021 KK",
    goodsName: "BERAS",
    agency: "UCU POLES",
    timbang1Time: "07-06-2026 15:20:00",
    timbang1Weight: 12450,
    timbang2Time: "07-06-2026 16:35:00",
    timbang2Weight: 3900,
    grossWeight: 12450,
    tareWeight: 3900,
    bagDeductionPercent: 1.20,
    refaksiPercent: 0.00,
    netWeight: 8447,
    status: "COMPLETED",
    notes: "Beras polesan selesai"
  }
];

export const initialInboundRecords: InboundRecord[] = [
  {
    id: "inbound-1",
    date: "2026-06-08",
    ticketNo: "021230",
    vehicleNo: "DD 9188 CD",
    supplier: "H. Wawan - Sidrap",
    commodity: "JAGUNG",
    grossWeight: 14650,
    tareWeight: 4250,
    refaksiKaPercent: 4.00,
    bagDeductionPercent: 1.00,
    netWeight: 9880,
    moistureContent: 16.8,
    warehouseSection: "Sektor Tengah (Silo Jagung)",
    laborCost: 450000,
    driverName: "Anto",
    price: 3600,
    totalPrice: 35568000
  },
  {
    id: "inbound-2",
    date: "2026-06-08",
    ticketNo: "021231",
    vehicleNo: "DP 3422 BB",
    supplier: "Kelompok Tani Harapan",
    commodity: "GABAH",
    grossWeight: 8750,
    tareWeight: 3150,
    refaksiKaPercent: 0.00,
    bagDeductionPercent: 0.50,
    netWeight: 5572,
    moistureContent: 13.5,
    warehouseSection: "Kavling Gabah Basah 1",
    laborCost: 280000,
    driverName: "Dudi",
    price: 5200,
    totalPrice: 28974400
  },
  {
    id: "inbound-3",
    date: "2026-06-07",
    ticketNo: "021228",
    vehicleNo: "DD 4452 AZ",
    supplier: "Bpk. Rahmat",
    commodity: "JAGUNG",
    grossWeight: 15400,
    tareWeight: 4300,
    refaksiKaPercent: 2.50,
    bagDeductionPercent: 1.00,
    netWeight: 10712,
    moistureContent: 15.8,
    warehouseSection: "Sektor Barat (Gudang B)",
    laborCost: 500000,
    driverName: "Kamal",
    price: 3500,
    totalPrice: 37492000
  }
];

export const initialOutboundRecords: OutboundRecord[] = [
  {
    id: "outbound-1",
    date: "2026-06-08",
    ticketNo: "021229",
    vehicleNo: "DD 8021 KK",
    buyer: "PT Sinar Indah Grains",
    commodity: "BERAS",
    totalWeight: 8447,
    loadingLaborCost: 400000,
    destination: "Pelabuhan Soekarno Hatta Makassar",
    invoiceNo: "INV-162/2026-042",
    status: "SHIPPED"
  },
  {
    id: "outbound-2",
    date: "2026-06-07",
    vehicleNo: "DD 7192 YT",
    buyer: "Pabrik pakan Phokphand",
    commodity: "JAGUNG",
    totalWeight: 15000,
    loadingLaborCost: 750000,
    destination: "KIMA Makassar",
    invoiceNo: "INV-162/2026-041",
    status: "SHIPPED"
  }
];

export const initialServiceRecords: ServiceRecord[] = [
  {
    id: "service-1",
    date: "2026-06-08",
    customerName: "Agen UCU POLES",
    serviceType: "POLES & KIPAS",
    commodity: "Beras Medium B+",
    weight: 12500,
    ratePerKg: 150,
    totalFee: 1875000,
    paymentStatus: "PAID",
    operatorName: "Wahyu & Tim"
  },
  {
    id: "service-2",
    date: "2026-06-08",
    customerName: "CV Prima Rasa",
    serviceType: "KIPAS",
    commodity: "Jagung Pecah",
    weight: 8400,
    ratePerKg: 80,
    totalFee: 672000,
    paymentStatus: "UNPAID",
    operatorName: "Dedi Poles"
  },
  {
    id: "service-3",
    date: "2026-06-07",
    customerName: "H. Mustamin",
    serviceType: "POLES",
    commodity: "Beras Pandan Wangi",
    weight: 15000,
    ratePerKg: 100,
    totalFee: 1500000,
    paymentStatus: "PAID",
    operatorName: "Wahyu & Tim"
  }
];

export const initialDebtRecords: DebtRecord[] = [
  {
    id: "debt-1",
    date: "2026-06-06",
    supplierName: "H. Wawan - Sidrap",
    description: "Utang Jagung Pipil Basah 14,650 Kg (No. Tiket 021230)",
    totalDebt: 65000000,
    paidAmount: 40000000,
    remainingBalance: 25000000,
    status: "BELUM_LUNAS"
  },
  {
    id: "debt-2",
    date: "2026-06-05",
    supplierName: "Kelompok Tani Harapan",
    description: "Pembelian Gabah Kering No. Tiket 021231",
    totalDebt: 34500000,
    paidAmount: 34500000,
    remainingBalance: 0,
    status: "LUNAS"
  },
  {
    id: "debt-3",
    date: "2026-06-04",
    supplierName: "CV Indo Tani Abadi",
    description: "Sisa Pembayaran Pupuk & Sarana Tani",
    totalDebt: 12500000,
    paidAmount: 0,
    remainingBalance: 12500000,
    status: "BELUM_LUNAS"
  }
];

export const initialFinancialRecords: FinancialRecord[] = [
  {
    id: "fin-1",
    date: "2026-06-08",
    type: "DEBIT",
    category: "POLES_KIPAS",
    description: "Pembayaran Poles Beras Agen Ucu Poles 12.5 Ton",
    partyName: "Agen UCU POLES",
    amount: 1875000,
    bankAccount: "Mandiri Bilibili 162"
  },
  {
    id: "fin-2",
    date: "2026-06-08",
    type: "KREDIT",
    category: "BURUH",
    description: "Ongkos buruh panggul bongkar Jagung Pipil (Tiket 021230)",
    partyName: "Kelompok Buruh Berkah",
    amount: 450000,
    bankAccount: "Kas Gudang Tunai"
  },
  {
    id: "fin-3",
    date: "2026-06-08",
    type: "KREDIT",
    category: "MAKELAR",
    description: "Komisi Makelar Pembelian Jagung 9.8 Ton NETTO (Rp 50/kg)",
    partyName: "Pak Ridwan (Makelar)",
    amount: 494000,
    bankAccount: "Kas Gudang Tunai"
  },
  {
    id: "fin-4",
    date: "2026-06-07",
    type: "DEBIT",
    category: "TIMBANGAN",
    description: "Penerimaan Jasa Timbang Truk Umum Tronton",
    partyName: "Sopir Expedisi",
    amount: 75000,
    bankAccount: "Kas Gudang Tunai"
  },
  {
    id: "fin-5",
    date: "2026-06-07",
    type: "KREDIT",
    category: "GAJI_KARYAWAN",
    description: "Gaji Mingguan Operator & Staff Gudang 162",
    partyName: "Staff Gudang",
    amount: 4200000,
    bankAccount: "Mandiri Bilibili 162"
  }
];

export const initialEmployeeRecords: EmployeeRecord[] = [
  { id: "emp-1", name: "Wahyu", role: "KARYAWAN", phone: "0812-4455-9001" },
  { id: "emp-2", name: "Dedi", role: "KARYAWAN", phone: "0812-4455-9002" },
  { id: "emp-3", name: "Ridwan", role: "MAKELAR", phone: "0853-2211-1622", ratePerKg: 50 },
  { id: "emp-4", name: "Kamaludin", role: "MAKELAR", phone: "0853-2211-1633", ratePerKg: 30 },
  { id: "emp-5", name: "Mandor Haris", role: "BURUH", phone: "0821-8877-1622" }
];

export const initialVehicles: VehicleRecord[] = [
  { id: "veh-1", policeNo: "DP 8600 AL", driverName: "Anto", vehicleType: "Colt Diesel Canter 6 Roda", tareWeight: 3120 },
  { id: "veh-2", policeNo: "DD 9188 CD", driverName: "Budi", vehicleType: "Fuso Colt 6 Roda", tareWeight: 4250 },
  { id: "veh-3", policeNo: "DP 3422 BB", driverName: "Kamal", vehicleType: "Tronton 10 Roda", tareWeight: 7500 },
  { id: "veh-4", policeNo: "DD 8021 KK", driverName: "Hendra", vehicleType: "Colt Diesel Canter 6 Roda", tareWeight: 3900 },
  { id: "veh-5", policeNo: "DP 1122 SS", driverName: "Dudi", vehicleType: "L300 Pick Up", tareWeight: 1450 }
];

export const initialSuppliers: SupplierRecord[] = [
  { id: "sup-1", name: "H. Wawan - Sidrap", phone: "0813-5566-2211", address: "Jl. Poros Sidrap - Wajo Km 12", mainCommodity: "JAGUNG" },
  { id: "sup-2", name: "Kelompok Tani Harapan", phone: "0852-9900-1122", address: "Kec. Larompong Timur, Luwu", mainCommodity: "GABAH" },
  { id: "sup-3", name: "Bpk. Rahmat", phone: "0823-1122-3344", address: "Tamping, Luwu", mainCommodity: "JAGUNG" },
  { id: "sup-4", name: "CV Indo Tani Abadi", phone: "0812-7788-9900", address: "Palopo, Sulsel", mainCommodity: "LAINNYA" }
];

export const initialBuyers: BuyerRecord[] = [
  { id: "buy-1", name: "PT Sinar Indah Grains", phone: "0811-4200-555", address: "Kawasan Industri Makassar (KIMA) Kav. 12" },
  { id: "buy-2", name: "Pabrik Pakan Phokphand", phone: "0811-4433-222", address: "Jl. KIMA XVII, Makassar" },
  { id: "buy-3", name: "PT Wahana Sumber Makmur", phone: "0821-3344-5566", address: "Pelabuhan Luwu Belopa" }
];

export const initialCommodities: CommodityRecord[] = [
  { id: "com-1", name: "JAGUNG PIPIL KERING", type: "JAGUNG", moistureStandard: 14.0, bagDeductionPercent: 1.0 },
  { id: "com-2", name: "JAGUNG PIPIL BASAH", type: "JAGUNG", moistureStandard: 14.0, bagDeductionPercent: 1.0 },
  { id: "com-3", name: "BERAS KEPALA SUPER", type: "BERAS", moistureStandard: 14.0, bagDeductionPercent: 1.2 },
  { id: "com-4", name: "GABAH KERING GILING", type: "GABAH", moistureStandard: 14.0, bagDeductionPercent: 0.5 },
  { id: "com-5", name: "AMPAZ JAGUNG FLOUR", type: "LAINNYA", moistureStandard: 12.0, bagDeductionPercent: 0.0 }
];

export const initialRiceStockRecords: RiceStockRecord[] = [
  { id: "rice-1", date: "2026-05-01", policeNo: "DD 8506 SU", description: "H IWAN", itemName: "BERAS", price: 13250, colly: 0, inWeight: 10000, outWeight: 0 },
  { id: "rice-2", date: "2026-05-04", policeNo: "DW 8824 MS", description: "ALEX", itemName: "BERAS", price: 13300, colly: 0, inWeight: 8050, outWeight: 0 },
  { id: "rice-3", date: "2026-05-04", policeNo: "-", description: "Keluar", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 18050 },
  { id: "rice-4", date: "2026-05-06", policeNo: "DD 8107 ET", description: "H IWAN", itemName: "BERAS", price: 13200, colly: 100, inWeight: 10010, outWeight: 0 },
  { id: "rice-5", date: "2026-05-12", policeNo: "DP 8205 DA", description: "P UNGGUL", itemName: "BERAS", price: 13500, colly: 100, inWeight: 10550, outWeight: 0 },
  { id: "rice-6", date: "2026-05-12", policeNo: "DP 8633 DH", description: "P UNGGUL", itemName: "BERAS", price: 13500, colly: 100, inWeight: 10530, outWeight: 0 },
  { id: "rice-7", date: "2026-05-12", policeNo: "-", description: "BIDADARI", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 23150 },
  { id: "rice-8", date: "2026-05-16", policeNo: "DD 8605 SU", description: "ALEX", itemName: "BERAS", price: 13475, colly: 200, inWeight: 10030, outWeight: 0 },
  { id: "rice-9", date: "2026-05-17", policeNo: "DD 8605 SU", description: "ALEX", itemName: "BERAS", price: 13475, colly: 200, inWeight: 10040, outWeight: 0 },
  { id: "rice-10", date: "2026-05-18", policeNo: "DD 8506 SU", description: "ANTI", itemName: "BERAS", price: 13500, colly: 0, inWeight: 10050, outWeight: 0 },
  { id: "rice-11", date: "2026-05-18", policeNo: "PHINISI MERAH", description: "P UNGGUL", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 9350 },
  { id: "rice-12", date: "2026-05-18", policeNo: "-", description: "ANTI", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 6430 },
  { id: "rice-13", date: "2026-05-18", policeNo: "-", description: "ALEX", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 10040 },
  { id: "rice-14", date: "2026-05-19", policeNo: "-", description: "ANTI", itemName: "BERAS", price: 0, colly: 0, inWeight: 0, outWeight: 400 },
  { id: "rice-15", date: "2026-05-18", policeNo: "DD 8506 SU", description: "ALEX", itemName: "BERAS", price: 13475, colly: 200, inWeight: 10000, outWeight: 0 },
  { id: "rice-16", date: "2026-05-19", policeNo: "DD 8506 SU", description: "ALEX", itemName: "BERAS", price: 13475, colly: 0, inWeight: 10030, outWeight: 0 }
];

export const initialBankAccounts: BankRecord[] = [
  { id: 'bank-1', accountName: 'KAS TUNAI GUDANG', bankName: 'TUNAI', initialBalance: 50000000 },
  { id: 'bank-2', accountName: 'MANDIRI BILIBILI 162', accountNo: '162-00-112233-4', bankName: 'MANDIRI', initialBalance: 250000000 },
  { id: 'bank-3', accountName: 'BRI OPERASIONAL', accountNo: '0012-01-000222-30-1', bankName: 'BRI', initialBalance: 125000000 }
];

export const initialBrokers: BrokerRecord[] = [
  { id: 'bro-1', name: 'Pak Ridwan', phone: '0852-4411-2299', commissionRate: 50, address: 'Pinrang' },
  { id: 'bro-2', name: 'H. Kamal', phone: '0812-9900-1122', commissionRate: 40, address: 'Sidrap' },
  { id: 'bro-3', name: 'Ucu Broker', phone: '0853-2211-1622', commissionRate: 60, address: 'Suppa' }
];

export const initialStorageLocations: LocationRecord[] = [
  { id: 'loc-1', name: 'Sektor Timur (Silo 1)', type: 'SILO', capacityKg: 500000 },
  { id: 'loc-2', name: 'Sektor Barat (Gudang B)', type: 'FLOOR', capacityKg: 1000000 },
  { id: 'loc-3', name: 'Kavling Gabah Basah 1', type: 'FLOOR', capacityKg: 300000 },
  { id: 'loc-4', name: 'Silo Jagung Utama', type: 'SILO', capacityKg: 1500000 },
  { id: 'loc-5', name: 'Area Dryer & Poles', type: 'DRYER', capacityKg: 0 }
];

export const initialCustomers: CustomerRecord[] = [
  { id: 'cus-1', name: 'Agen UCU POLES', phone: '0812-3344-5566', address: 'Suppa' },
  { id: 'cus-2', name: 'CV Prima Rasa', phone: '0852-1122-3344', address: 'Pinrang' },
  { id: 'cus-3', name: 'H. Mustamin', phone: '0813-9900-1122', address: 'Lanrisang' }
];

export const initialFinanceCategories: FinanceCategoryRecord[] = [
  { id: 'fcat-1', name: 'OPERASIONAL', type: 'KREDIT' },
  { id: 'fcat-2', name: 'GAJI_KARYAWAN', type: 'KREDIT' },
  { id: 'fcat-3', name: 'BURUH', type: 'KREDIT' },
  { id: 'fcat-4', name: 'MAKELAR', type: 'KREDIT' },
  { id: 'fcat-5', name: 'TIMBANGAN', type: 'DEBIT' },
  { id: 'fcat-6', name: 'POLES_KIPAS', type: 'DEBIT' },
  { id: 'fcat-7', name: 'PENJUALAN_BARANG', type: 'DEBIT' },
  { id: 'fcat-8', name: 'PEMBELIAN_STOK', type: 'KREDIT' },
  { id: 'fcat-9', name: 'LISTRIK_BBM', type: 'KREDIT' },
  { id: 'fcat-10', name: 'LAINNYA', type: 'BOTH' }
];

