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
  return `*BUKTI TIMBANG KENDARAAN*
_Gudang Bilibili_

No. Tiket: ${ticket.ticketNo}
Tanggal: ${formatReceiptDate(ticket.timbang1Time || ticket.timbang2Time)}
No. Polisi: ${ticket.policeNo}
Barang: ${ticket.goodsName}
Tujuan/Relasi: ${ticket.agency}

*Detail Timbangan:*
Bruto (Kotor): ${ticket.grossWeight.toLocaleString('id-ID')} Kg
Tara (Kosong): ${ticket.tareWeight.toLocaleString('id-ID')} Kg
Netto (Bersih): ${ticket.netWeight.toLocaleString('id-ID')} Kg

Status: ${ticket.status}

Terima kasih.`;
}

export function buildInboundWAText(record: InboundRecord, tk: WeighbridgeTicket | undefined): string {
  const isJagung = record.commodity === 'JAGUNG';
  const rawNet = record.grossWeight - record.tareWeight;
  const rawNetFormatted = rawNet.toLocaleString('id-ID');
  const netWeightFormatted = record.netWeight.toLocaleString('id-ID');

  if (isJagung) {
    const buyGross = record.netWeight * record.price;
    const laborRateVal = record.laborCost > 0 && rawNet > 0 ? Math.round(record.laborCost / rawNet) : 30;
    const totQualDeduct = (record.refaksiKaPercent ?? 0) + 
      (record.deadKernelsPercent ?? 0) + 
      (record.moldPercent ?? 0) + 
      (record.smallKernelsPercent ?? 0) + 
      (record.fineTrashPercent ?? 0);
    
    return `*BUKTI MASUK BARANG*
_Gudang Bilibili_

Tanggal: ${formatReceiptDate(record.date)}
Relasi/Suplier: ${record.supplier}
No. Polisi: ${record.vehicleNo}
Komoditas: ${record.commodity}

*Detail Timbangan:*
Bruto (Kotor): ${record.grossWeight.toLocaleString('id-ID')} Kg
Tara (Kosong): ${record.tareWeight.toLocaleString('id-ID')} Kg
Pot. Karung: ${record.bagDeductionPercent}%
Kadar Air (KA): ${record.moistureContent}%
Refaksi (KA): ${record.refaksiKaPercent}%
Biji Mati: ${(record.deadKernelsPercent ?? 0)}%
Jamur: ${(record.moldPercent ?? 0)}%
Biji Kecil: ${(record.smallKernelsPercent ?? 0)}%
Sampah Halus: ${(record.fineTrashPercent ?? 0)}%
 
Netto (Bersih): *${rawNetFormatted}-${totQualDeduct}% Kg* = *${netWeightFormatted}kg*

Harga per Kg: ${formatCurrency(record.price)}
${netWeightFormatted}× ${record.price.toLocaleString('id-ID')} = ${buyGross.toLocaleString('id-ID')}
Pot buruh ${rawNetFormatted} x ${laborRateVal} = ${record.laborCost.toLocaleString('id-ID')}
Total yg harus dibayar
${buyGross.toLocaleString('id-ID')} - ${record.laborCost.toLocaleString('id-ID')}
Total Rp: *${formatCurrency(record.totalPrice)}*

Terima kasih.`;
  }

  return `*BUKTI MASUK BARANG*
_Gudang Bilibili_

Tanggal: ${formatReceiptDate(record.date)}
Relasi/Suplier: ${record.supplier}
No. Polisi: ${record.vehicleNo}
Komoditas: ${record.commodity}

*Detail Timbangan:*
Bruto (Kotor): ${record.grossWeight.toLocaleString('id-ID')} Kg
Tara (Kosong): ${record.tareWeight.toLocaleString('id-ID')} Kg
Pot. Karung: ${record.bagDeductionPercent}%
Pot. Kotoran: ${record.refaksiKaPercent}%
 
Netto (Bersih): *${record.netWeight.toLocaleString('id-ID')} Kg*

Harga per Kg: ${formatCurrency(record.price)}
Total Rp: *${formatCurrency(record.totalPrice)}*

Terima kasih.`;
}

export function buildOutboundWAText(record: OutboundRecord): string {
  return `*BUKTI KELUAR BARANG / SURAT JALAN*
_Gudang Bilibili_

Tanggal: ${formatReceiptDate(record.date)}
No. Invoice: ${record.invoiceNo}
Pembeli/Relasi: ${record.buyer}
No. Polisi: ${record.vehicleNo}

Komoditas: ${record.commodity}
Total Muatan: *${record.totalWeight.toLocaleString('id-ID')} Kg*
Tujuan: ${record.destination}

Terima kasih.`;
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
