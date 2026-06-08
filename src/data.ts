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
  CommodityRecord
} from './types';

// Standard Corn Moisture Deduction (Refaksi KA Jagung) Table lookup helper
export const mockCornMoistureRefaksi = (moisture: number): { refaksiPercent: number; description: string } => {
  if (moisture <= 14.0) return { refaksiPercent: 0, description: "Kadar Air Standar (Aman)" };
  if (moisture <= 14.5) return { refaksiPercent: 0.5, description: "Kadar Air Ringan" };
  if (moisture <= 15.0) return { refaksiPercent: 1.0, description: "Kadar Air Ringan" };
  if (moisture <= 15.5) return { refaksiPercent: 1.8, description: "Kadar Air Sedang" };
  if (moisture <= 16.0) return { refaksiPercent: 2.5, description: "Kadar Air Sedang" };
  if (moisture <= 17.0) return { refaksiPercent: 4.0, description: "Kadar Air Tinggi" };
  if (moisture <= 18.0) return { refaksiPercent: 5.5, description: "Kadar Air Tinggi" };
  if (moisture <= 19.0) return { refaksiPercent: 7.0, description: "Kadar Air Sangat Tinggi" };
  if (moisture <= 20.0) return { refaksiPercent: 9.0, description: "Wajib Pengeringan / Poles" };
  // Above 20%
  const excessive = 9.0 + (moisture - 20) * 1.5;
  return { refaksiPercent: Math.min(25, parseFloat(excessive.toFixed(1))), description: "Basah Ekstrim - Potongan Tinggi" };
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
    supplier: "H. Sudirman - Sidrap",
    commodity: "JAGUNG",
    grossWeight: 14650,
    tareWeight: 4250,
    refaksiKaPercent: 4.00,
    bagDeductionPercent: 1.00,
    netWeight: 9880,
    moistureContent: 16.8,
    warehouseSection: "Sektor Tengah (Silo Jagung)",
    laborCost: 450000,
    driverName: "Anto"
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
    driverName: "Dudi"
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
    driverName: "Kamal"
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
    supplierName: "H. Sudirman - Sidrap",
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
  { id: "sup-1", name: "H. Sudirman - Sidrap", phone: "0813-5566-2211", address: "Jl. Poros Sidrap - Wajo Km 12", mainCommodity: "JAGUNG" },
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

