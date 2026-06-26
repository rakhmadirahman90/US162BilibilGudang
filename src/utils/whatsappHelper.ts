import { InboundRecord, OutboundRecord, ServiceRecord, RiceStockRecord, WeighbridgeTicket } from '../types';
import { formatCurrency, formatReceiptDate } from './format';

export function formatPhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) {
    p = '62' + p.substring(1);
  }
  return p;
}

export function sendWhatsAppMessage(phone: string, text: string) {
  const formattedPhone = formatPhone(phone);
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function buildWeighbridgeWAText(ticket: WeighbridgeTicket): string {
  const bruto = ticket.grossWeight ?? 0;
  const tara = ticket.tareWeight ?? 0;
  const net = ticket.netWeight ?? 0;
  const rawNet = bruto - tara;
  const potKrg = Math.round(rawNet * ((ticket.bagDeductionPercent ?? 0) / 100));
  const potRefaksi = Math.round(rawNet * ((ticket.refaksiPercent ?? 0) / 100));

  return `*BUKTI TIMBANG KENDARAAN*
_Gudang US Bilibili 162_

*No. Tiket:* ${ticket.ticketNo}
*Tanggal:* ${formatReceiptDate(ticket.timbang1Time || ticket.timbang2Time)}
*No. Polisi:* ${ticket.policeNo}
*Barang:* ${ticket.goodsName}
*Tujuan/Relasi:* ${ticket.agency}

=============================
*TIMBANG I (Masuk):* ${bruto.toLocaleString('id-ID')} Kg
*TIMBANG II (Keluar):* ${tara > 0 ? tara.toLocaleString('id-ID') + ' Kg' : '-'}
=============================
*BRUTO (Kotor):* ${bruto.toLocaleString('id-ID')} Kg
*TARA (Kosong):* ${tara.toLocaleString('id-ID')} Kg
*Pot. Karung:* -${potKrg.toLocaleString('id-ID')} Kg (${ticket.bagDeductionPercent ?? 0}%)
*Pot. Refaksi:* -${potRefaksi.toLocaleString('id-ID')} Kg (${ticket.refaksiPercent ?? 0}%)
=============================
*BERAT NETTO:* *${net.toLocaleString('id-ID')} KG*
=============================

*Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0*
Terima kasih atas kerjasamanya.`;
}

export function buildInboundWAText(record: InboundRecord, tk: WeighbridgeTicket | undefined): string {
  const bruto = record.grossWeight ?? 0;
  const tara = record.tareWeight ?? 0;
  const rawNet = bruto - tara;
  const net = record.netWeight ?? 0;
  const potKrg = Math.round(rawNet * ((record.bagDeductionPercent ?? 0) / 100));
  const potRefaksi = Math.round(rawNet * ((record.refaksiKaPercent ?? 0) / 100));
  
  const isJagung = record.commodity?.includes('JAGUNG');
  
  let qualityDeductionsText = '';
  if (isJagung) {
    const potBijiMati = Math.round(rawNet * ((record.deadKernelsPercent ?? 0) / 100));
    const potJamur = Math.round(rawNet * ((record.moldPercent ?? 0) / 100));
    const potBijiKecil = Math.round(rawNet * ((record.smallKernelsPercent ?? 0) / 100));
    const potSampahHalus = Math.round(rawNet * ((record.fineTrashPercent ?? 0) / 100));
    
    qualityDeductionsText = `
*Pot. Biji Mati:* -${potBijiMati.toLocaleString('id-ID')} Kg (${record.deadKernelsPercent ?? 0}%)
*Pot. Jamur:* -${potJamur.toLocaleString('id-ID')} Kg (${record.moldPercent ?? 0}%)
*Pot. Biji Kecil:* -${potBijiKecil.toLocaleString('id-ID')} Kg (${record.smallKernelsPercent ?? 0}%)
*Pot. Sampah Halus:* -${potSampahHalus.toLocaleString('id-ID')} Kg (${record.fineTrashPercent ?? 0}%)`;
  }

  const isHighMoisture = isJagung && ((record.moistureContent ?? 0) > 30.00);
  const formulaNote = isHighMoisture 
    ? `\n_(KA Tinggi ${record.moistureContent}% menggunakan Rumus ${record.cornFormulaFactor || 1.4} Luar Tabel)_` 
    : '';

  const detailNettoText = `*BRUTO (Kotor):* ${bruto.toLocaleString('id-ID')} Kg
*TARA (Kosong):* ${tara.toLocaleString('id-ID')} Kg
*Pot. Karung:* -${potKrg.toLocaleString('id-ID')} Kg (${record.bagDeductionPercent ?? 0}%)
*Kadar Air:* ${record.moistureContent ?? 0}%
*Refaksi KA:* -${potRefaksi.toLocaleString('id-ID')} Kg (${record.refaksiKaPercent ?? 0}%)${formulaNote}${qualityDeductionsText}`;

  const payGross = net * (record.price ?? 0);

  return `*BUKTI PENERIMAAN (${record.commodity})*
_Gudang US Bilibili 162_

*Tanggal:* ${formatReceiptDate(record.date)}
*No. Tiket:* ${record.ticketNo || '-'}
*No. Polisi:* ${record.vehicleNo}
*Supplier:* ${record.supplier}
*Komoditas:* ${record.commodity}

=============================
${detailNettoText}
=============================
*NETTO (Bersih):* *${net.toLocaleString('id-ID')} KG*
=============================
*Harga Beli:* Rp ${(record.price ?? 0).toLocaleString('id-ID')}/Kg
*Bayar Kotor:* Rp ${payGross.toLocaleString('id-ID')}
*Biaya Buruh:* -Rp ${(record.laborCost ?? 0).toLocaleString('id-ID')}
=============================
*BAYAR KE PETANI:* *Rp ${(record.totalPrice ?? 0).toLocaleString('id-ID')}*
=============================

*Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0*
Terima kasih atas kerjasamanya.`;
}

export function buildOutboundWAText(record: OutboundRecord): string {
  return `*BUKTI KELUAR BARANG / SURAT JALAN*
_Gudang US Bilibili 162_

*No. Invoice:* ${record.invoiceNo}
*Tanggal:* ${formatReceiptDate(record.date)}
*Pembeli/Relasi:* ${record.buyer}
*No. Polisi:* ${record.vehicleNo}
*Komoditas:* ${record.commodity}
*Tujuan:* ${record.destination}

=============================
*TOTAL MUATAN / NETTO:* *${(record.totalWeight ?? 0).toLocaleString('id-ID')} Kg*
*Upah Buruh:* Rp ${(record.loadingLaborCost ?? 0).toLocaleString('id-ID')}
=============================

*Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0*
Terima kasih atas kerjasamanya.`;
}

export function buildServiceWAText(record: ServiceRecord): string {
  return `*BUKTI LAYANAN JASA*
_Gudang Bilibili_

Tanggal: ${formatReceiptDate(record.date)}
Pelanggan: ${record.customerName}
Jenis Jasa: ${record.serviceType}
Barang: ${record.commodity}

Berat/Kuantitas: ${record.weight.toLocaleString('id-ID')} Kg
Tarif per Kg: ${formatCurrency(record.ratePerKg)}
*Total Biaya: ${formatCurrency(record.totalFee)}*

Status Pembayaran: ${record.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}

Terima kasih.`;
}

export function buildRiceStockWAText(record: RiceStockRecord): string {
  const isJagung = record.itemName?.toUpperCase() === 'JAGUNG';
  return `*BUKTI MUTASI STOK ${isJagung ? 'JAGUNG' : 'BERAS'}*
_Gudang Bilibili_

Tanggal: ${formatReceiptDate(record.date)}
Uraian: ${record.description}
Barang/Merk: ${record.itemName}
No. Polisi: ${record.policeNo || '-'}

Colly: ${record.colly.toLocaleString('id-ID')}
Berat Masuk: ${record.inWeight.toLocaleString('id-ID')} Kg
Berat Keluar: ${record.outWeight.toLocaleString('id-ID')} Kg

Harga: ${formatCurrency(record.price)}

Terima kasih.`;
}
