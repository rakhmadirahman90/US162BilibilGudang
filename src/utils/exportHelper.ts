/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Clean Utility helpers to export React table reports to Microsoft Excel (CSV with UTF-8 BOM)
 * and trigger elegant, styled print jobs to physical printers or PDF generators.
 */

import { WeighbridgeTicket, OutboundRecord, RiceStockRecord, InboundRecord, ServiceRecord } from '../types';
import { formatReceiptDate } from './format';

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  // Map rows to escaped CSV cells
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        // Escape quotes
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Prefix with UTF-8 Byte Order Mark (BOM) so Excel respects encoded characters instantly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface SummaryItem {
  label: string;
  value: string;
}

export function printPDFReport(
  reportTitle: string, 
  headers: string[], 
  rows: string[][], 
  summaries?: SummaryItem[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak laporan.');
    return;
  }

  const currentDate = new Date().toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate table rows HTML
  const tableHeadersHTML = headers.map(h => `
    <th style="border: 1px solid #222; padding: 8px 6px; text-transform: uppercase; font-size: 10px; background-color: #f3f4f6; text-align: left;">
      ${h}
    </th>
  `).join('');

  const tableRowsHTML = rows.map((row, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
      ${row.map(cell => `
        <td style="border: 1px solid #ddd; padding: 6px 8px; font-size: 10px; color: #111;">
          ${cell}
        </td>
      `).join('')}
    </tr>
  `).join('');

  // Calculate summaries HTML
  let summariesHTML = '';
  if (summaries && summaries.length > 0) {
    summariesHTML = `
      <div style="margin-top: 20px; border: 1.5px solid #222; background-color: #fafafa; padding: 12px; border-radius: 6px; page-break-inside: avoid;">
        <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px;">
          RINGKASAN REKAPITULASI DATA:
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: Arial, sans-serif;">
          <tr>
            ${summaries.map(item => `
              <td style="padding: 4px 8px; border-right: 1px solid #ccc; width: ${Math.round(100 / summaries.length)}%;">
                <div style="font-size: 9px; color: #555; text-transform: uppercase; font-weight: bold;">${item.label}</div>
                <div style="font-size: 14px; font-weight: bold; color: #111; margin-top: 2px;">${item.value}</div>
              </td>
            `).join('')}
          </tr>
        </table>
      </div>
    `;
  }

  // Generate full HTML
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportTitle} - US BILIBILI 162</title>
      <style>
        @media print {
          body {
            background-color: #ffffff;
            color: #000000;
            font-size: 10pt;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 5mm;
            size: auto;
          }
          .container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Ensure tables don't break weirdly */
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          /* Strip background colors for ink saving */
          * {
            background-color: transparent !important;
            color: #000 !important;
          }
        }
        body {
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          margin: 0;
          padding: 20px;
          color: #111;
          background-color: #f9f9f9;
        }
        .container {
          width: 95%;
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          padding: 15px;
          border: 1px solid #ddd;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="max-width: 900px; margin: 0 auto; margin-bottom: 20px; padding: 12px; background-color: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; display: flex; justify-between: space-between; align-items: center; font-family: sans-serif;">
        <div style="font-size: 12px; color: #0369a1; font-weight: bold;">
          ℹ️ PRATINJAU DOKUMEN CETAK & PDF - SIAP DIUNDUH ATAU DICETAK KETIKA TOMBOL DIKANAN DIKLIK
        </div>
        <button onclick="window.print();" style="background-color: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          🖨️ CETAK / SIMPAN PDF
        </button>
      </div>

      <div class="container">
        
        <!-- Kop Surat Resmi (Official Industrial Letterhead) -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
          <tr>
            <td style="width: 100px; text-align: left; vertical-align: middle;">
              <img src="/src/assets/images/bilibili_logo_1780925186692.png" alt="US Bilibili 162" style="width: 80px; height: auto;" />
            </td>
            <td style="text-align: left; vertical-align: middle; padding-left: 15px;">
              <h2 style="margin: 0; font-size: 16px; letter-spacing: 0.5px; font-weight: 900; text-transform: uppercase;">
                GUDANG & JEMBATAN TIMBANG US BILIBILI 162
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #111; line-height: 1.4;">
                <span style="font-weight: bold;">Alamat:</span> Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa, Kab. Pinrang, Sulawesi Selatan 91131<br/>
                <span style="font-weight: bold;">Kontak:</span> 085244466009
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Double Border Line -->
        <div style="border-top: 3px double #111; margin-top: 10px; margin-bottom: 20px;"></div>

        <!-- Laporan Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
          <div>
            <h1 style="margin: 0; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: underline;">
              ${reportTitle}
            </h1>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #555;">
              Waktu Cetak: <strong>${currentDate}</strong>
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 9px; font-family: 'Courier New', Courier, monospace; background-color: #eee; padding: 4px 8px; border-radius: 4px;">
              Sistem: US_Bilibili_v2.0_Secure
            </p>
          </div>
        </div>

        <!-- Main Data Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: sans-serif;">
          <thead>
            <tr>
              ${tableHeadersHTML}
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>

        <!-- Summary section -->
        ${summariesHTML}

        <!-- Signature Block at bottom (Industrial Standard) -->
        <div style="margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; font-family: sans-serif;">
          <div style="width: 250px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #444;">Disetujui Oleh,</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase;">Pimpinan / Kepala Gudang</p>
            <div style="height: 55px; border-bottom: 1.5px solid #222; margin: 15px auto 5px auto; width: 180px;"></div>
            <p style="margin: 0; font-size: 9px; color: #555; font-style: italic;">( H. Sudirman / Perwakilan )</p>
          </div>

          <div style="width: 250px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #444;">Dibuat &amp; Dilaporkan Oleh,</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase;">Operator Sistem</p>
            <div style="height: 55px; border-bottom: 1.5px solid #222; margin: 15px auto 5px auto; width: 180px;"></div>
            <p style="margin: 0; font-size: 9px; color: #555; font-style: italic;">( Operator Timbangan )</p>
          </div>
        </div>

        <!-- Print Footer with page info -->
        <div style="margin-top: 30px; text-align: center; border-top: 1px dotted #ccc; padding-top: 10px; font-size: 8.5px; color: #777;">
          Laporan ini diekspor secara digital melalui Terminal Timbang GSC GST-9700 US Bilibili 162. Tanggal Transaksi Berjalan Terarsip Otomatis.
        </div>

      </div>

      <script>
        // Auto trigger browser print engine when opened
        window.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 1000);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

const COMMON_SLIP_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');

  html, body {
    width: 105mm !important;
    height: 148mm !important;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    color: #1e293b;
    background-color: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.35;
    display: flex !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    box-sizing: border-box !important;
  }
  .slip {
    width: 105mm;
    height: 148mm;
    margin: 0;
    padding: 10mm 10mm 10mm 10mm;
    box-sizing: border-box;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  @media print {
    @page { 
      size: auto; 
      margin: 0; 
    }
    body { 
      background-color: #fff !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      display: block !important;
    }
    .slip {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 10mm !important;
      width: 105mm !important;
      height: 148mm !important;
      box-sizing: border-box !important;
      background-color: #fff !important;
      border-radius: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
    }
  }
  .header {
    text-align: left;
    margin-bottom: 2px;
  }
  .header-title {
    font-size: 11pt;
    font-weight: 800;
    color: #0f2d21;
    letter-spacing: 0.2px;
    margin-bottom: 2px;
    text-transform: uppercase;
  }
  .header-subtitle {
    font-size: 6.5pt;
    color: #475569;
    line-height: 1.3;
    font-weight: 500;
  }
  .divider-line {
    border-top: 1px solid #cbd5e1;
    margin: 5px 0;
  }
  .divider-double {
    border-top: 2px double #475569;
    margin: 5px 0;
  }
  .ticket-type {
    text-align: left;
    font-size: 8pt;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: #f1f5f9;
    padding: 3px 6px;
    border-radius: 4px;
    margin-bottom: 2px;
  }
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin: 3px 0;
    gap: 6px;
  }
  .flex span {
    font-size: 8pt;
  }
  .flex span.label {
    color: #475569;
    text-align: left;
    white-space: nowrap;
    flex-shrink: 0;
    font-weight: 500;
  }
  .flex span.value {
    color: #000000;
    font-weight: 700;
    text-align: right;
    word-break: break-all;
  }
  .flex span.label-heavy {
    color: #0f172a;
    font-weight: 700;
    font-size: 8.5pt;
  }
  .flex span.value-heavy {
    color: #000000;
    font-weight: 800;
    font-size: 8.5pt;
  }
  .weight-time {
    font-size: 7.2pt;
    color: #64748b;
    text-align: right;
    margin-top: -3px;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .netto-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 0;
  }
  .netto-label {
    font-size: 9pt;
    font-weight: 800;
    color: #064e3b;
  }
  .netto-val {
    font-size: 11pt;
    font-weight: 950;
    color: #059669;
  }
  .notes-box {
    font-size: 7.5pt;
    color: #334155;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 4px 8px;
    border-radius: 4px;
    margin: 4px 0;
    text-align: left;
    line-height: 1.3;
    word-break: break-all;
  }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 10px;
    text-align: center;
    font-size: 7.5pt;
    color: #334155;
    font-weight: 500;
  }
  .signature-space {
    height: 25px;
  }
  .signature-line {
    border-top: 1px solid #cbd5e1;
    margin: 2px auto 0 auto;
    width: 90%;
    font-weight: 700;
    color: #000000;
    font-size: 8pt;
    padding-top: 2px;
    text-align: center;
  }
  .footer-msg {
    text-align: left;
    color: #94a3b8;
    font-size: 6.8pt;
    margin-top: 10px;
    line-height: 1.3;
    font-weight: 500;
    border-top: 1px dashed #cbd5e1;
    padding-top: 5px;
  }
`;

export function printCombinedSlip(record: InboundRecord, ticket: WeighbridgeTicket | undefined, staffName: string = "Asma") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak slip.');
    return;
  }

  const bruto = record.grossWeight;
  const tara = record.tareWeight;
  const net = record.netWeight;
  const potKrg = (bruto * record.bagDeductionPercent) / 100;
  const potRefaksi = (bruto * record.refaksiKaPercent) / 100;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resi Terpadu #${record.ticketNo || record.id.slice(-6)}</title>
      <style>
        ${COMMON_SLIP_STYLE}
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="header">
          <div class="header-title">GUDANG US BILIBILI 162</div>
          <div class="header-subtitle">
            Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
            Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
            TELP - 085244466009
          </div>
        </div>
        
        <div class="divider-line"></div>
        <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 10px;">RESI TERPADU (MASUK)</div>
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">No. Tiket :</span>
          <span class="value">${record.ticketNo || '-'}</span>
        </div>
        <div class="flex">
          <span class="label">Tanggal :</span>
          <span class="value">${formatReceiptDate(record.date)}</span>
        </div>
        <div class="flex">
          <span class="label">No. Polisi:</span>
          <span class="value">${record.vehicleNo}</span>
        </div>
        <div class="flex">
          <span class="label">Nama Barang:</span>
          <span class="value">${record.commodity}</span>
        </div>
        <div class="flex">
          <span class="label">Mitra/Agen:</span>
          <span class="value">${record.supplier}</span>
        </div>
        <div class="flex">
          <span class="label">Jml. Karung:</span>
          <span class="value">${record.bagDeductionPercent}%</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label-heavy">TIMBANG I (Masuk)</span>
          <span class="value-heavy">${bruto.toLocaleString('id-ID')} Kg</span>
        </div>
        <div class="weight-time">${ticket?.timbang1Time || '-'}</div>
        
        <div class="flex">
          <span class="label-heavy">TIMBANG II (Keluar)</span>
          <span class="value-heavy">${tara > 0 ? tara.toLocaleString('id-ID') + ' Kg' : '- -'}</span>
        </div>
        <div class="weight-time">${ticket?.timbang2Time || '-'}</div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">BERAT BRUTO :</span>
          <span class="value">${bruto.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">BERAT TARA :</span>
          <span class="value">${tara.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Pot. Karung (${record.bagDeductionPercent.toFixed(2)}%):</span>
          <span class="value">- ${potKrg.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Pot. Refaksi (${record.refaksiKaPercent.toFixed(2)}%):</span>
          <span class="value">- ${potRefaksi.toLocaleString('id-ID')} kg</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label" style="font-size: 10pt;">HARGA :</span>
          <span class="value" style="font-size: 10pt; color: #000; font-weight: bold;">Rp ${(record.price || 0).toLocaleString('id-ID')}/kg</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="netto-row">
          <span class="netto-label">BERAT NETTO :</span>
          <span class="netto-val">${net.toLocaleString('id-ID')} KG</span>
        </div>
        <div class="netto-row" style="margin-top: -10px; padding-top: 0px;">
          <span class="netto-label">TOTAL BAYAR :</span>
          <span class="netto-val" style="color: #0284c7;">Rp ${(record.totalPrice || 0).toLocaleString('id-ID')}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="signatures">
          <div>
            Penerima Staff 162
            <div class="signature-space"></div>
            <div class="signature-line">${staffName}</div>
          </div>
          <div>
            Sopir / Pembawa
            <div class="signature-space"></div>
            <div class="signature-line">(          )</div>
          </div>
        </div>
        
        <div class="footer-msg">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function printOutboundSlip(record: OutboundRecord, staffName: string = "Asma") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak slip.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resi Keluar #${record.invoiceNo}</title>
      <style>
        ${COMMON_SLIP_STYLE}
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="header">
          <div class="header-title">GUDANG US BILIBILI 162</div>
          <div class="header-subtitle">
            Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
            Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
            TELP - 085244466009
          </div>
        </div>
        
        <div class="divider-line"></div>
        <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 10px;">RESIDENSI PENGIRIMAN</div>
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">No. Invoice :</span>
          <span class="value">${record.invoiceNo}</span>
        </div>
        <div class="flex">
          <span class="label">Tanggal :</span>
          <span class="value">${formatReceiptDate(record.date)}</span>
        </div>
        <div class="flex">
          <span class="label">Pembeli/Relasi:</span>
          <span class="value">${record.buyer}</span>
        </div>
        <div class="flex">
          <span class="label">No. Polisi:</span>
          <span class="value">${record.vehicleNo}</span>
        </div>
        <div class="flex">
          <span class="label">Komoditas:</span>
          <span class="value">${record.commodity}</span>
        </div>
        <div class="flex">
          <span class="label">Tujuan:</span>
          <span class="value">${record.destination}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="netto-row">
          <span class="netto-label">TOTAL BERAT :</span>
          <span class="netto-val">${(record.totalWeight ?? 0).toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Upah Buruh :</span>
          <span class="value">Rp ${(record.loadingLaborCost ?? 0).toLocaleString('id-ID')}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="signatures">
          <div>
            Penerima Staff 162
            <div class="signature-space"></div>
            <div class="signature-line">${staffName}</div>
          </div>
          <div>
            Sopir / Pembawa
            <div class="signature-space"></div>
            <div class="signature-line">(          )</div>
          </div>
        </div>
        
        <div class="footer-msg">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function printRiceStockSlip(record: RiceStockRecord, staffName: string = "Asma") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak slip.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resi Stok #${record.id.slice(-6)}</title>
      <style>
        ${COMMON_SLIP_STYLE}
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="header">
          <div class="header-title">GUDANG US BILIBILI 162</div>
          <div class="header-subtitle">
            Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
            Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
            TELP - 085244466009
          </div>
        </div>
        
        <div class="divider-line"></div>
        <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 10px;">RESIDENSI MUTASI STOK</div>
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">ID Mutasi :</span>
          <span class="value">#${record.id.slice(-6)}</span>
        </div>
        <div class="flex">
          <span class="label">Tanggal :</span>
          <span class="value">${formatReceiptDate(record.date)}</span>
        </div>
        <div class="flex">
          <span class="label">No. Polisi :</span>
          <span class="value">${record.policeNo || '-'}</span>
        </div>
        <div class="flex">
          <span class="label">Nama Barang :</span>
          <span class="value">${record.itemName}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label-heavy">Masuk :</span>
          <span class="value-heavy" style="color: #059669;">${(record.inWeight ?? 0).toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label-heavy">Keluar :</span>
          <span class="value-heavy" style="color: #dc2626;">${(record.outWeight ?? 0).toLocaleString('id-ID')} kg</span>
        </div>
        
        <div class="divider-line"></div>
        
        ${record.description ? `
          <div class="notes-box">
            Keterangan: ${record.description}
          </div>
        ` : ''}
        
        <div class="signatures">
          <div>
            Penerima Staff 162
            <div class="signature-space"></div>
            <div class="signature-line">${staffName}</div>
          </div>
          <div>
            Sopir / Pembawa
            <div class="signature-space"></div>
            <div class="signature-line">(          )</div>
          </div>
        </div>
        
        <div class="footer-msg">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function printServiceSlip(record: ServiceRecord, staffName: string = "Asma") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak slip.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resi Jasa #${record.id.slice(-6)}</title>
      <style>
        ${COMMON_SLIP_STYLE}
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="header">
          <div class="header-title">GUDANG US BILIBILI 162</div>
          <div class="header-subtitle">
            Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
            Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
            TELP - 085244466009
          </div>
        </div>
        
        <div class="divider-line"></div>
        <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 10px;">RESIDENSI JASA LAYANAN</div>
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">ID Layanan :</span>
          <span class="value">#${record.id.slice(-6)}</span>
        </div>
        <div class="flex">
          <span class="label">Tanggal :</span>
          <span class="value">${formatReceiptDate(record.date)}</span>
        </div>
        <div class="flex">
          <span class="label">Pelanggan :</span>
          <span class="value">${record.customerName}</span>
        </div>
        <div class="flex">
          <span class="label">Jenis Jasa :</span>
          <span class="value">${record.serviceType}</span>
        </div>
        <div class="flex">
          <span class="label">Komoditas :</span>
          <span class="value">${record.commodity}</span>
        </div>
        <div class="flex">
          <span class="label">Status Bayar :</span>
          <span class="value" style="color: ${record.paymentStatus === 'PAID' ? '#059669' : '#dc2626'}; font-weight: 800;">${record.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">Berat Jasa :</span>
          <span class="value">${(record.weight ?? 0).toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Tarif Per kg:</span>
          <span class="value">Rp ${(record.ratePerKg ?? 0).toLocaleString('id-ID')}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="netto-row">
          <span class="netto-label">TOTAL TARIF :</span>
          <span class="netto-val">Rp ${(record.totalFee ?? 0).toLocaleString('id-ID')}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="signatures">
          <div>
            Penerima Staff 162
            <div class="signature-space"></div>
            <div class="signature-line">${staffName}</div>
          </div>
          <div>
            Pelanggan
            <div class="signature-space"></div>
            <div class="signature-line">(          )</div>
          </div>
        </div>
        
        <div class="footer-msg">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function printSlip(ticket: WeighbridgeTicket, staffName: string = "Asma") {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir! Harap izinkan pop-up untuk mencetak slip.');
    return;
  }

  const bruto = ticket.timbang1Weight;
  const tara = ticket.timbang2Weight;
  const net = ticket.netWeight || 0;
  const potKrg = (bruto * ticket.bagDeductionPercent) / 100;
  const potRefaksi = (bruto * ticket.refaksiPercent) / 100;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slip Timbang #${ticket.ticketNo}</title>
      <style>
        ${COMMON_SLIP_STYLE}
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="header">
          <div class="header-title">GUDANG US BILIBILI 162</div>
          <div class="header-subtitle">
            Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
            Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
            TELP - 085244466009
          </div>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">No. Tiket :</span>
          <span class="value">${ticket.ticketNo}</span>
        </div>
        <div class="flex">
          <span class="label">No. Polisi:</span>
          <span class="value">${ticket.policeNo}</span>
        </div>
        <div class="flex">
          <span class="label">Mitra/Agen:</span>
          <span class="value">${ticket.agency}</span>
        </div>
        <div class="flex">
          <span class="label">Nama Barang:</span>
          <span class="value">${ticket.goodsName}</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label-heavy">TIMBANG I (Masuk)</span>
          <span class="value-heavy">${bruto.toLocaleString('id-ID')} Kg</span>
        </div>
        <div class="weight-time">${ticket.timbang1Time || '-'}</div>
        
        <div class="flex">
          <span class="label-heavy">TIMBANG II (Keluar)</span>
          <span class="value-heavy">${tara > 0 ? tara.toLocaleString('id-ID') + ' Kg' : '- -'}</span>
        </div>
        <div class="weight-time">${ticket.timbang2Time || '-'}</div>
        
        <div class="divider-line"></div>
        
        <div class="flex">
          <span class="label">BERAT BRUTO :</span>
          <span class="value">${bruto.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">BERAT TARA :</span>
          <span class="value">${tara.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Pot. Karung (${ticket.bagDeductionPercent.toFixed(2)}%):</span>
          <span class="value">- ${potKrg.toLocaleString('id-ID')} kg</span>
        </div>
        <div class="flex">
          <span class="label">Pot. Refaksi (${ticket.refaksiPercent.toFixed(2)}%):</span>
          <span class="value">- ${potRefaksi.toLocaleString('id-ID')} kg</span>
        </div>
        
        <div class="divider-line"></div>
        
        <div class="netto-row">
          <span class="netto-label">BERAT NETTO :</span>
          <span class="netto-val">${net.toLocaleString('id-ID')} KG</span>
        </div>
        
        <div class="divider-line"></div>
        
        ${ticket.notes ? `
          <div class="notes-box">
            Catatan: ${ticket.notes}
          </div>
        ` : ''}
        
        <div class="signatures">
          <div>
            Penerima Staff 162
            <div class="signature-space"></div>
            <div class="signature-line">${staffName}</div>
          </div>
          <div>
            Sopir / Pembawa
            <div class="signature-space"></div>
            <div class="signature-line">(          )</div>
          </div>
        </div>
        
        <div class="footer-msg">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Executes a print function but intercepts the window.open flow to extract the HTML 
 * string instead of showing a popup, allowing us to generate PDFs silently.
 */
export function getHTMLForPDF(printFunc: Function, ...args: any[]): string {
  let htmlResult = "";
  const originalOpen = window.open;
  window.open = function() {
    return {
      document: {
        write: (html: string) => { htmlResult += html; },
        close: () => {}
      }
    } as any;
  } as any;
  try {
    printFunc(...args);
  } finally {
    window.open = originalOpen;
  }
  return htmlResult;
}
