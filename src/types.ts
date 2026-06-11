/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeighbridgeTicket {
  id: string;
  ticketNo: string;
  policeNo: string;
  goodsName: string; // e.g., 'BERAS', 'JAGUNG', 'GABAH', 'AMPAZ'
  agency: string;    // Client or destination (e.g., 'UCU POLES')
  timbang1Time: string;
  timbang1Weight: number; // Gross weight in kg
  timbang2Time: string;
  timbang2Weight: number; // Tare weight in kg (usually empty/0 on ticket first creation)
  grossWeight: number;
  tareWeight: number;
  bagDeductionPercent: number; // Pot. Krg %
  refaksiPercent: number;      // Refaksi % (e.g., moisture deduction)
  netWeight: number;           // Net weight in kg after deductions
  status: 'PENDING' | 'COMPLETED';
  notes?: string;
}

export interface InboundRecord {
  id: string;
  date: string;
  ticketNo?: string; // Reference to Weighbridge Ticket
  vehicleNo: string;
  supplier: string;
  commodity: 'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA';
  grossWeight: number;
  tareWeight: number;
  refaksiKaPercent: number; // Kadar Air Refaksi %
  bagDeductionPercent: number; // Potongan Karung %
  netWeight: number;
  moistureContent: number; // KA % (Moisture content e.g. 14.5)
  warehouseSection: string; // Location in warehouse, e.g. 'Sektor Timur', 'Gudang Tengah'
  laborCost: number; // Biaya buruh panggul
  price: number;
  totalPrice: number;
  driverName?: string;
}

export interface OutboundRecord {
  id: string;
  date: string;
  ticketNo?: string; // Reference to Weighbridge Ticket
  vehicleNo: string;
  buyer: string;
  commodity: 'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA';
  totalWeight: number;
  loadingLaborCost: number; // Biaya buruh muat
  destination: string;
  invoiceNo: string;
  status: 'LOADING' | 'SHIPPED';
}

export interface ServiceRecord {
  id: string;
  date: string;
  customerName: string;
  serviceType: 'POLES' | 'KIPAS' | 'POLES & KIPAS' | 'DRYER';
  commodity: string;
  weight: number; // in kg
  ratePerKg: number; // e.g., Rp 150/kg
  totalFee: number;
  paymentStatus: 'UNPAID' | 'PAID';
  operatorName: string;
}

export interface DebtRecord {
  id: string;
  date: string;
  supplierName: string;
  description: string; // e.g., 'Pembelian Jagung 14 Ton'
  totalDebt: number; // Total Utang
  paidAmount: number; // Sudah Di-bayar
  remainingBalance: number; // Sisa Utang
  status: 'BELUM_LUNAS' | 'LUNAS';
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'DEBIT' | 'KREDIT';
  category: string; // Dynamic category from master data
  description: string;
  partyName?: string; // employee or broker name or shipper
  amount: number;
  bankAccount: string; // e.g. 'Mandiri 162-xxx' or 'Kas Tunai'
}

export interface EmployeeRecord {
  id: string;
  name: string;
  role: 'KARYAWAN' | 'BURUH' | 'MAKELAR' | 'PETUGAS';
  phone?: string;
  ratePerKg?: number; // specially for brokers standard commissions (e.g. 50 Rp/kg) or labor loaders
}

export interface VehicleRecord {
  id: string;
  policeNo: string;
  driverName: string;
  vehicleType: string;
  tareWeight: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface FinanceCategoryRecord {
  id: string;
  name: string;
  type: 'DEBIT' | 'KREDIT' | 'BOTH';
}

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  mainCommodity: 'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA';
}

export interface BuyerRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface CommodityRecord {
  id: string;
  name: string;
  type: 'BERAS' | 'JAGUNG' | 'GABAH' | 'LAINNYA';
  moistureStandard: number;
  bagDeductionPercent: number;
}

export interface RiceStockRecord {
  id: string;
  date: string;
  policeNo: string;
  description: string;
  itemName: string;
  price: number;
  colly: number;
  inWeight: number; // Masuk
  outWeight: number; // Keluar
}

export interface BankRecord {
  id: string;
  accountName: string; // e.g. 'MANDIRI BILIBILI 162'
  accountNo?: string;
  bankName: string;   // e.g. 'Bank Mandiri'
  initialBalance: number;
}

export interface BrokerRecord {
  id: string;
  name: string;
  phone?: string;
  commissionRate: number; // Rp per Kg
  address?: string;
}

export interface LocationRecord {
  id: string;
  name: string; // e.g. 'Sektor Timur', 'Gudang Tengah'
  type: 'SILO' | 'FLOOR' | 'DRYER' | 'POLISHING';
  capacityKg?: number;
}

export interface CornMoistureRule {
  id: string;
  moistureMin: number;
  moistureMax: number;
  refaksiPercent: number; // Weight deduction discount %
  priceDiscountPerKg: number; // Price refund Rp deduction per kg
  type: 'LOKAL' | 'LUAR_DAERAH'; // Menambahkan Tipe: Lokal / Luar Daerah
}

export interface LaborRateRecord {
  id: string;
  activityName: string;
  rateType: 'PER_KG' | 'FLAT';
  rate: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: 'BERAS' | 'JAGUNG' | 'LAINNYA';
  description: string;
  characteristics: string[];
  pricePerKg: number;
  stockAvailable: number;
  imageUrl?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'operator' | 'karyawan' | 'pimpinan';
  fullName: string;
  isActive: boolean;
  lastLogin?: string;
  allowedTabs?: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  module: string;
  details: string;
}

