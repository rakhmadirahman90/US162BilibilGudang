/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeighbridgeTicket, OutboundRecord, RiceStockRecord, InboundRecord, ServiceRecord } from '../types';
import { formatReceiptDate } from './format';
import bilibiliLogo from '../assets/images/bilibili_logo_1780925186692.png';

export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => 
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

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
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
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
      <div class="no-print" style="max-width: 900px; margin: 0 auto; margin-bottom: 20px; padding: 12px; background-color: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
        <div style="font-size: 12px; color: #0369a1; font-weight: bold;">
          ℹ️ PRATINJAU DOKUMEN CETAK & PDF - SIAP DIUNDUH ATAU DICETAK KETIKA TOMBOL DIKANAN DIKLIK
        </div>
        <button onclick="window.print();" style="background-color: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          🖨️ CETAK / SIMPAN PDF
        </button>
      </div>

      <div class="container">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
          <tr>
            <td style="width: 100px; text-align: left; vertical-align: middle;">
              <img src="${bilibiliLogo}" alt="US Bilibili 162" style="width: 80px; height: auto;" />
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
        
        <div style="border-top: 3px double #111; margin-top: 10px; margin-bottom: 20px;"></div>

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

        ${summariesHTML}

        <div style="margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; font-family: sans-serif;">
          <div style="width: 250px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #444;">Disetujui Oleh,</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase;">Pimpinan / Kepala Gudang</p>
            <div style="height: 55px; border-bottom: 1.5px solid #222; margin: 15px auto 5px auto; width: 180px;"></div>
            <p style="margin: 0; font-size: 9px; color: #555; font-style: italic;">( H. Wawan / Perwakilan )</p>
          </div>

          <div style="width: 250px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #444;">Dibuat &amp; Dilaporkan Oleh,</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; text-transform: uppercase;">Operator Sistem</p>
            <div style="height: 55px; border-bottom: 1.5px solid #222; margin: 15px auto 5px auto; width: 180px;"></div>
            <p style="margin: 0; font-size: 9px; color: #555; font-style: italic;">( Operator Timbangan )</p>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px dotted #ccc; padding-top: 10px; font-size: 8.5px; color: #777;">
          Laporan ini diekspor secara digital melalui Terminal Timbang GSC GST-9700 US Bilibili 162. Tanggal Transaksi Berjalan Terarsip Otomatis.
        </div>
      </div>

      <script>
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
  @page {
    size: auto;
    margin: 0mm !important;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100% !important;
    height: 100% !important;
    font-family: 'Courier', 'Courier New', 'Consolas', 'Monaco', monospace !important;
    font-size: 6.5pt;
    color: #000000 !important;
    background-color: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.5 !important;
    text-align: left;
    /* CRITICAL FOR DOT MATRIX: Turn off pixel smoothing entirely to keep output pure solid black/sharp pixels */
    -webkit-font-smoothing: none !important;
    -moz-osx-font-smoothing: none !important;
    font-smooth: never !important;
    text-rendering: optimizeSpeed !important;
  }

  .slip {
    width: 100mm !important;
    min-height: 135mm !important;
    margin: 0 !important;
    padding: 0mm 1mm !important;
    background: #ffffff !important;
    display: block !important;
    box-sizing: border-box !important;
    page-break-after: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
  }

  @media print {
    @page {
      size: auto;
      margin: 0 !important;
    }
    
    html, body {
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
      margin: 0 !important;
      padding: 0 !important;
      text-align: left !important;
      display: block !important;
      position: absolute !important;
      top: 0mm !important;
      left: 0mm !important;
      font-family: 'Courier', 'Courier New', 'Consolas', 'Monaco', monospace !important;
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: none !important;
      font-smooth: never !important;
      text-rendering: optimizeSpeed !important;
      overflow: hidden !important;
      line-height: 1.5 !important;
    }

    .slip {
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      page-break-inside: avoid;
      position: absolute !important;
      top: 0mm !important;
      left: 4.5mm !important;
      width: 100mm !important;
    }

    * {
      color: #000000 !important;
      background: transparent !important;
      border-color: #000000 !important;
      box-shadow: none !important;
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: none !important;
      font-smooth: never !important;
      text-rendering: optimizeSpeed !important;
    }

    /* Force all colors to pure deep black to prevent dot matrix dither patterns (unclear dots) */
    .netto-val, .value, .value-heavy, .header-title, .header-subtitle, .netto-label, .ticket-type, .signatures div, .footer-msg {
      color: #000000 !important;
    }
  }

  /* HEADER */
  .header {
    display: table;
    width: 100%;
    margin-bottom: 2px;
    text-align: left;
  }
  .header-logo {
    display: table-cell;
    width: 28px;
    max-width: 28px;
    height: 24px;
    vertical-align: middle;
    padding-right: 4px;
    object-fit: contain;
    filter: grayscale(100%) contrast(200%);
    image-rendering: pixelated;
  }
  .header-text {
    display: table-cell;
    vertical-align: middle;
  }
  .header-title {
    font-size: 9.5pt;
    font-weight: 950;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1.05;
  }
  .header-subtitle {
    font-size: 7.5pt;
    color: #000000;
    line-height: 1.15;
    margin-top: 1px;
  }

  /* DIVIDERS (Thicker to avoid blurry or faint horizontal lines on Epson ribbon) */
  .divider-line {
    border: none;
    border-top: 1.5px solid #000000;
    margin: 2px 0;
  }
  .divider-double {
    border: none;
    border-top: 3px double #000000;
    margin: 2px 0;
  }

  /* TICKET TYPE LABEL */
  .ticket-type {
    font-size: 8.5pt;
    font-weight: 900;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 2px 0;
    line-height: 1.05;
    text-align: center;
  }

  /* DATA ROWS */
  .flex {
    display: table;
    width: 100%;
    table-layout: fixed;
    margin: 2px 0;
  }
  .flex span {
    display: table-cell;
    font-size: 7.5pt;
    color: #000000;
    vertical-align: top;
    line-height: 1.5 !important;
  }
  .flex span.label {
    width: 46%;
    text-align: left;
    font-weight: bold;
    white-space: nowrap;
  }
  .flex span.value {
    width: 54%;
    text-align: left;
    font-weight: 900;
    word-break: break-word;
  }
  .flex span.label-heavy {
    width: 46%;
    font-weight: 950;
    font-size: 8pt;
  }
  .flex span.value-heavy {
    width: 54%;
    font-weight: 950;
    font-size: 8pt;
    text-align: left;
  }

  /* WEIGHT TIMESTAMP */
  .weight-time {
    font-size: 7.2pt;
    color: #000000;
    text-align: left;
    margin: 0;
    font-style: italic;
    line-height: 1.05;
    padding-left: 2px;
  }

  /* NETTO ROW */
  .netto-row {
    display: table;
    width: 100%;
    table-layout: fixed;
    padding: 2px 0;
  }
  .netto-label {
    display: table-cell;
    width: 46%;
    font-size: 8.5pt;
    font-weight: 950;
    vertical-align: middle;
  }
  .netto-val {
    display: table-cell;
    width: 54%;
    font-size: 9.5pt;
    font-weight: 950;
    text-align: left;
    vertical-align: middle;
  }

  /* NOTES */
  .notes-box {
    font-size: 7.2pt;
    border: 1.5px solid #000000;
    padding: 2px 4px;
    margin: 2px 0;
    line-height: 1.15;
    word-break: break-word;
    font-weight: bold;
  }

  /* SIGNATURES */
  .signatures {
    display: table;
    width: 100%;
    table-layout: fixed;
    margin-top: 4px;
  }
  .signatures > div {
    display: table-cell;
    width: 50%;
    text-align: left;
    font-size: 7.5pt;
    padding: 0 4px;
    vertical-align: top;
    line-height: 1.1;
    font-weight: bold;
  }
  .signature-space {
    height: 14px;
    display: block;
  }
  .signature-line {
    border-top: 1.5px solid #000000;
    margin: 2px 0 0 0;
    width: 90%;
    font-weight: 900;
    font-size: 7.5pt;
    padding-top: 1px;
    text-align: left;
  }

  /* FOOTER */
  .footer-msg {
    text-align: center;
    font-size: 7.2pt;
    margin-top: 4px;
    line-height: 1.15;
    border-top: 1.5px dashed #000000;
    padding-top: 2px;
    font-weight: bold;
  }
`;
// GANTI DENGAN JENDELA BARU AGAR PREVIEW MUNCUL & TIDAK DIBLOKIR BROWSER
function printInNewWindow(htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up diblokir. Harap izinkan pop-up untuk mencetak resi.');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Berikan jeda sebentar agar CSS dan gambar termuat sempurna di jendela preview
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}

export function printCombinedSlip(record: InboundRecord, ticket: WeighbridgeTicket | undefined, staffName: string = "Asma") {
  const bruto = record.grossWeight;
  const tara = record.tareWeight;
  const rawNet = bruto - tara;
  const net = record.netWeight;
  const potKrg = rawNet * (record.bagDeductionPercent / 100);
  const potRefaksi = rawNet * (record.refaksiKaPercent / 100);

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Resi Terpadu #${record.ticketNo || record.id.slice(-6)}</title>
  <style>${COMMON_SLIP_STYLE}</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img class="header-logo" src="${bilibiliLogo}" alt="US BILIBILI 162" />
      <div class="header-text">
        <div class="header-title">US BILIBILI 162</div>
      </div>
    </div>

    <div class="divider-line"></div>
    <div class="ticket-type">RESI KAS TERPADU</div>
    <div class="divider-line"></div>

    <div class="flex"><span class="label">Tiket/Tgl :</span><span class="value">${record.ticketNo || '-'} / ${formatReceiptDate(record.date).split(' ')[0]}</span></div>
    <div class="flex"><span class="label">Pol / Mitra :</span><span class="value">${record.vehicleNo} / ${record.supplier}</span></div>
    <div class="flex"><span class="label">Barang :</span><span class="value">${record.commodity}</span></div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label-heavy">Bruto/Tara :</span><span class="value-heavy">${bruto.toLocaleString('id-ID')} / ${tara.toLocaleString('id-ID')} Kg</span></div>
    
    ${record.commodity === 'JAGUNG' ? `
      <div class="flex"><span class="label">Kadar Air (KA):</span><span class="value">${(record.moistureContent || 0).toFixed(1)}%</span></div>
      <div class="flex"><span class="label">Potongan/Ref :</span><span class="value">${(record.refaksiKaPercent || 0).toFixed(1)}%</span></div>
      <div class="flex"><span class="label">Pot. Karung :</span><span class="value">${(record.bagDeductionPercent || 0).toFixed(1)}%</span></div>
      <div class="flex"><span class="label">Biji Mati/Jamur :</span><span class="value">0.0% / 0.0%</span></div>
    ` : `
      <div class="flex"><span class="label">KA/BijiMati :</span><span class="value">${(record.moistureContent || 0).toFixed(1)}% / 0.0%</span></div>
    `}

    <div class="divider-line"></div>

    <div class="flex"><span class="label">Netto (Bersih):</span><span class="value" style="font-weight: 950; font-size: 8.5pt;">${net.toLocaleString('id-ID')} Kg</span></div>
    <div class="flex"><span class="label">Bayar Netto :</span><span class="value" style="font-weight: 950; color: #0284c7;">Rp ${(record.totalPrice || 0).toLocaleString('id-ID')}</span></div>

    <div class="divider-line"></div>

    <div class="signatures">
      <div>Petugas<div class="signature-space"></div><div class="signature-line">${staffName}</div></div>
      <div>Sopir<div class="signature-space"></div><div class="signature-line">( )</div></div>
    </div>

    <div class="footer-msg">
      * Terimakasih *
    </div>
  </div>
</body>
</html>`;

  printInNewWindow(htmlContent);
}

export function printOutboundSlip(record: OutboundRecord, staffName: string = "Asma") {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Resi Keluar #${record.invoiceNo}</title>
  <style>${COMMON_SLIP_STYLE}</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img class="header-logo" src="${bilibiliLogo}" alt="US BILIBILI 162" />
      <div class="header-text">
        <div class="header-title">GUDANG US BILIBILI 162</div>
        <div class="header-subtitle">Jl. Poros Pinrang-Parepare, Suppa, Kab. Pinrang | WA: 085244466009</div>
      </div>
    </div>

    <div class="divider-line"></div>
    <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 3px;">RESIDENSI PENGIRIMAN</div>
    <div class="divider-line"></div>

    <div class="flex"><span class="label">No. Invoice :</span><span class="value">${record.invoiceNo}</span></div>
    <div class="flex"><span class="label">Tanggal :</span><span class="value">${formatReceiptDate(record.date)}</span></div>
    <div class="flex"><span class="label">Pembeli/Relasi:</span><span class="value">${record.buyer}</span></div>
    <div class="flex"><span class="label">No. Polisi:</span><span class="value">${record.vehicleNo}</span></div>
    <div class="flex"><span class="label">Komoditas:</span><span class="value">${record.commodity}</span></div>
    <div class="flex"><span class="label">Tujuan:</span><span class="value">${record.destination}</span></div>

    <div class="divider-line"></div>

    <div class="netto-row"><span class="netto-label">TOTAL BERAT :</span><span class="netto-val">${(record.totalWeight ?? 0).toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Upah Buruh :</span><span class="value">Rp ${(record.loadingLaborCost ?? 0).toLocaleString('id-ID')}</span></div>

    <div class="divider-line"></div>

    <div class="signatures">
      <div>Penerima Staff 162<div class="signature-space"></div><div class="signature-line">${staffName}</div></div>
      <div>Sopir / Pembawa<div class="signature-space"></div><div class="signature-line">(          )</div></div>
    </div>

    <div class="footer-msg">
      * Terimakasih atas kerjasamanya *<br/>
      Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
    </div>
  </div>
</body>
</html>`;

  printInNewWindow(htmlContent);
}

export function printRiceStockSlip(record: RiceStockRecord, staffName: string = "Asma") {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Resi Stok #${record.id.slice(-6)}</title>
  <style>${COMMON_SLIP_STYLE}</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img class="header-logo" src="${bilibiliLogo}" alt="US BILIBILI 162" />
      <div class="header-text">
        <div class="header-title">GUDANG US BILIBILI 162</div>
        <div class="header-subtitle">Jl. Poros Pinrang-Parepare, Suppa, Kab. Pinrang | WA: 085244466009</div>
      </div>
    </div>

    <div class="divider-line"></div>
    <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 3px;">RESIDENSI MUTASI STOK</div>
    <div class="divider-line"></div>

    <div class="flex"><span class="label">ID Mutasi :</span><span class="value">#${record.id.slice(-6)}</span></div>
    <div class="flex"><span class="label">Tanggal :</span><span class="value">${formatReceiptDate(record.date)}</span></div>
    <div class="flex"><span class="label">No. Polisi :</span><span class="value">${record.policeNo || '-'}</span></div>
    <div class="flex"><span class="label">Nama Barang :</span><span class="value">${record.itemName}</span></div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label-heavy">Masuk :</span><span class="value-heavy" style="color: #059669;">${(record.inWeight ?? 0).toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label-heavy">Keluar :</span><span class="value-heavy" style="color: #dc2626;">${(record.outWeight ?? 0).toLocaleString('id-ID')} kg</span></div>

    <div class="divider-line"></div>

    ${record.description ? `<div class="notes-box">Keterangan: ${record.description}</div>` : ''}

    <div class="signatures">
      <div>Penerima Staff 162<div class="signature-space"></div><div class="signature-line">${staffName}</div></div>
      <div>Sopir / Pembawa<div class="signature-space"></div><div class="signature-line">(          )</div></div>
    </div>

    <div class="footer-msg">
      * Terimakasih atas kerjasamanya *<br/>
      Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
    </div>
  </div>
</body>
</html>`;

  printInNewWindow(htmlContent);
}

export function printServiceSlip(record: ServiceRecord, staffName: string = "Asma") {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Resi Jasa #${record.id.slice(-6)}</title>
  <style>${COMMON_SLIP_STYLE}</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img class="header-logo" src="${bilibiliLogo}" alt="US BILIBILI 162" />
      <div class="header-text">
        <div class="header-title">GUDANG US BILIBILI 162</div>
        <div class="header-subtitle">Jl. Poros Pinrang-Parepare, Suppa, Kab. Pinrang | WA: 085244466009</div>
      </div>
    </div>

    <div class="divider-line"></div>
    <div class="ticket-type" style="background: none; padding: 0; margin-bottom: 3px;">RESIDENSI JASA LAYANAN</div>
    <div class="divider-line"></div>

    <div class="flex"><span class="label">ID Layanan :</span><span class="value">#${record.id.slice(-6)}</span></div>
    <div class="flex"><span class="label">Tanggal :</span><span class="value">${formatReceiptDate(record.date)}</span></div>
    <div class="flex"><span class="label">Pelanggan :</span><span class="value">${record.customerName}</span></div>
    <div class="flex"><span class="label">Jenis Jasa :</span><span class="value">${record.serviceType}</span></div>
    <div class="flex"><span class="label">Komoditas :</span><span class="value">${record.commodity}</span></div>
    <div class="flex"><span class="label">Status Bayar :</span><span class="value" style="color: ${record.paymentStatus === 'PAID' ? '#059669' : '#dc2626'}; font-weight: 800;">${record.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</span></div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label">Berat Jasa :</span><span class="value">${(record.weight ?? 0).toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Tarif Per kg:</span><span class="value">Rp ${(record.ratePerKg ?? 0).toLocaleString('id-ID')}</span></div>

    <div class="divider-line"></div>

    <div class="netto-row"><span class="netto-label">TOTAL TARIF :</span><span class="netto-val">Rp ${(record.totalFee ?? 0).toLocaleString('id-ID')}</span></div>

    <div class="divider-line"></div>

    <div class="signatures">
      <div>Penerima Staff 162<div class="signature-space"></div><div class="signature-line">${staffName}</div></div>
      <div>Pelanggan<div class="signature-space"></div><div class="signature-line">(          )</div></div>
    </div>

    <div class="footer-msg">
      * Terimakasih atas kerjasamanya *<br/>
      Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
    </div>
  </div>
</body>
</html>`;

  printInNewWindow(htmlContent);
}

export function printSlip(ticket: WeighbridgeTicket, staffName: string = "Asma") {
  const bruto = ticket.timbang1Weight;
  const tara = ticket.timbang2Weight;
  const net = ticket.netWeight || 0;
  const rawNet = bruto - tara;
  const potKrg = rawNet * (ticket.bagDeductionPercent / 100);
  const potRefaksi = rawNet * (ticket.refaksiPercent / 100);

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Slip Timbang #${ticket.ticketNo}</title>
  <style>${COMMON_SLIP_STYLE}</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <img class="header-logo" src="${bilibiliLogo}" alt="US BILIBILI 162" />
      <div class="header-text">
        <div class="header-title">GUDANG US BILIBILI 162</div>
        <div class="header-subtitle">Jl. Poros Pinrang-Parepare, Suppa, Kab. Pinrang | WA: 085244466009</div>
      </div>
    </div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label">No. Tiket :</span><span class="value">${ticket.ticketNo}</span></div>
    <div class="flex"><span class="label">No. Polisi:</span><span class="value">${ticket.policeNo}</span></div>
    <div class="flex"><span class="label">Mitra/Agen:</span><span class="value">${ticket.agency}</span></div>
    <div class="flex"><span class="label">Nama Barang:</span><span class="value">${ticket.goodsName}</span></div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label-heavy">TIMBANG I (Masuk)</span><span class="value-heavy">${bruto.toLocaleString('id-ID')} Kg</span></div>
    <div class="weight-time">${ticket.timbang1Time || '-'}</div>

    <div class="flex"><span class="label-heavy">TIMBANG II (Keluar)</span><span class="value-heavy">${tara > 0 ? tara.toLocaleString('id-ID') + ' Kg' : '- -'}</span></div>
    <div class="weight-time">${ticket.timbang2Time || '-'}</div>

    <div class="divider-line"></div>

    <div class="flex"><span class="label">BERAT BRUTO :</span><span class="value">${bruto.toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">BERAT TARA :</span><span class="value">${tara.toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Pot. Karung (${ticket.bagDeductionPercent.toFixed(2)}%):</span><span class="value">- ${potKrg.toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Pot. Refaksi (${ticket.refaksiPercent.toFixed(2)}%):</span><span class="value">- ${potRefaksi.toLocaleString('id-ID')} kg</span></div>

    <div class="divider-line"></div>

    <div class="netto-row"><span class="netto-label">BERAT NETTO :</span><span class="netto-val">${net.toLocaleString('id-ID')} KG</span></div>

    <div class="divider-line"></div>

    ${ticket.notes ? `<div class="notes-box">Catatan: ${ticket.notes}</div>` : ''}

    <div class="signatures">
      <div>Penerima Staff 162<div class="signature-space"></div><div class="signature-line">${staffName}</div></div>
      <div>Sopir / Pembawa<div class="signature-space"></div><div class="signature-line">(          )</div></div>
    </div>

    <div class="footer-msg">
      * Terimakasih atas kerjasamanya *<br/>
      Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
    </div>
  </div>
</body>
</html>`;

  printInNewWindow(htmlContent);
}

export function getHTMLForPDF(printFunc: Function, ...args: any[]): string {
  let htmlResult = "";
  const originalOpen = window.open;
  window.open = function() {
    return {
      document: {
        write: (html: string) => { htmlResult += html; },
        close: () => {}
      },
      focus: () => {},
      print: () => {}
    } as any;
  } as any;
  try {
    printFunc(...args);
  } finally {
    window.open = originalOpen;
  }
  return htmlResult;
}