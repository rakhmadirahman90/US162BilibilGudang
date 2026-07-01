/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeighbridgeTicket, OutboundRecord, RiceStockRecord, InboundRecord, ServiceRecord } from '../types';
import { formatReceiptDate } from './format';
import bilibiliLogo from '../assets/images/logousbilibili162.png';

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
              <img src="${bilibiliLogo}" alt="US BILIBILI 162 OFFICIAL" style="width: 80px; height: auto;" />
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
    size: A6 portrait;
    margin: 0mm !important;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 85mm !important;
    height: 140mm !important;
    /* PENGGUNAAN FONT SANS-SERIF CALIBRI DENGAN STROKES TEBAL AGAR SANGAT JELAS DI DOT MATRIX LX-310 */
    font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
    font-size: 10.2pt !important;
    color: #000000 !important;
    background-color: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.25 !important;
    text-align: left;
    -webkit-font-smoothing: none !important; /* Nonaktifkan penghalusan pixel anti-aliasing agar printer menusuk lurus tanpa abu-abu samar */
    -moz-osx-font-smoothing: none !important;
    font-smooth: never !important;
    text-rendering: geometricPrecision !important;
  }

  /* PAKSA SEMUA ELEMEN DI DALAM SLIP MENJADI PURE BLACK UNTUK DOT MATRIX TANPA BAYANGAN AGAR SANGAT JELAS */
  .slip * {
    color: #000000 !important;
    border-color: #000000 !important;
    box-shadow: none !important;
    font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
    font-weight: 900 !important; /* Paksa tebal maksimal (Extra Bold / Black) ganda-ketuk pin printer */
    -webkit-text-stroke: 0.3px #000000 !important; /* Tingkatkan ketebalan garis fisik agar lurus tebal */
    text-shadow: 0.25px 0px 0px #000000, -0.25px 0px 0px #000000 !important; /* Simulasi double-strike horizontal ganda */
    letter-spacing: 0.25px !important; /* Beri jarak mikro antar huruf agar tidak berbayang atau bocor tinta menyatu */
  }

  /* LOGO DIALIRKAN SECARA ELEGAN DI RECTANGLE FORMAT A6 */
  img, .header-logo {
    display: block !important;
    width: 10mm !important;
    height: 10mm !important;
    object-fit: contain !important;
  }

  .slip {
    width: 85mm !important;
    height: 140mm !important;
    margin: 0 !important;
    padding: 2.5mm 3mm 2.5mm 6ch !important; /* Beri jarak 6 spasi ke kanan */
    background: #ffffff !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
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
      size: A6 portrait;
      margin: 0 !important;
    }
    
    html, body {
      width: 85mm !important;
      height: 140mm !important;
      background: transparent !important;
      margin: 0 !important;
      padding: 0 !important;
      text-align: left !important;
      display: block !important;
      position: absolute !important;
      top: 0mm !important;
      left: 0mm !important;
      overflow: hidden !important;
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: unset !important;
      text-rendering: geometricPrecision !important;
    }

    img, .header-logo {
      display: block !important;
      width: 9.5mm !important;
      height: auto !important;
      max-height: 9.5mm !important;
    }

    .slip {
      margin: 0 !important;
      padding: 2.5mm 3mm 2.5mm 6ch !important; /* Beri jarak 6 spasi ke kanan */
      border: none !important;
      box-shadow: none !important;
      page-break-inside: avoid;
      position: absolute !important;
      top: 0mm !important;
      left: 0mm !important;
      width: 85mm !important;
      height: 140mm !important;
    }

    * {
      color: #000000 !important;
      font-weight: 900 !important; /* Paksa tebal maksimal (Extra Bold / Black) secara total saat cetak fisik di LX-310 */
      background: transparent !important;
      border-color: #000000 !important;
      box-shadow: none !important;
      font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
      -webkit-text-stroke: 0.3px #000000 !important; /* Tebalkan garis fisik karakter untuk keterbacaan tinggi di jarum pin */
      text-shadow: 0.25px 0px 0px #000000, -0.25px 0px 0px #000000 !important; /* Simulasi ganda-hammer (double-strike) hardware */
      letter-spacing: 0.25px !important; /* Cegah luntur antar huruf di ribbon fisik */
    }

    .netto-val, .value, .value-heavy, .header-title, .netto-label, .ticket-type, .signatures div, .footer-msg {
      color: #000000 !important;
      font-weight: 900 !important;
    }
  }

  /* HEADER */
  .header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100%;
    margin-bottom: 2px;
    gap: 2.5mm !important;
  }
  .header-text {
    display: flex !important;
    flex-direction: column !important;
    text-align: left !important;
    flex: 1 !important;
  }
  .header-title {
    font-size: 11.5pt !important;
    font-weight: bold !important;
    color: #000000 !important;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    line-height: 1.15;
    margin-bottom: 1px;
  }
  .header-subtitle {
    font-size: 8pt !important;
    color: #000000 !important;
    line-height: 1.2;
    font-weight: bold !important;
  }

  /* DIVIDERS */
  .divider-line {
    border: none !important;
    border-top: 1.5px solid #000000 !important;
    margin: 2px 0 !important;
    height: 0 !important;
  }
  .divider-double {
    border: none !important;
    border-top: 3.5px double #000000 !important;
    margin: 2px 0 !important;
    height: 0 !important;
  }

  /* TICKET TYPE LABEL */
  .ticket-type {
    font-size: 10.5pt !important;
    font-weight: bold !important;
    color: #000000 !important;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin: 2px 0;
    line-height: 1.1;
    text-align: center;
  }

  /* DATA ROWS */
  .flex {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    width: 100%;
    margin: 0.5px 0;
  }
  .flex span {
    display: inline-block;
    font-size: 9.2pt !important;
    color: #000000 !important;
    line-height: 1.15 !important;
    font-weight: bold !important;
  }
  .flex span.label {
    width: 45%;
    text-align: left;
    font-weight: bold !important;
  }
  .flex span.value {
    width: 55%;
    text-align: right; /* Rata Kanan untuk kerapian A6 */
    font-weight: bold !important;
  }
  .flex span.label-heavy {
    width: 45%;
    font-weight: bold !important;
    font-size: 9.5pt !important;
  }
  .flex span.value-heavy {
    width: 55%;
    font-weight: bold !important;
    font-size: 9.5pt !important;
    text-align: right; /* Rata Kanan */
  }

  /* WEIGHT TIMESTAMP */
  .weight-time {
    font-size: 8pt !important;
    color: #000000 !important;
    text-align: right; /* Menjadi rata kanan menyertai digit timbangan */
    margin: -1px 0 1px 0;
    font-style: italic;
    line-height: 1.1;
    font-weight: bold !important;
  }

  /* NETTO ROW */
  .netto-row {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100%;
    padding: 2px 0;
  }
  .netto-label {
    width: 45%;
    font-size: 10.2pt !important;
    font-weight: bold !important;
    color: #000000 !important;
  }
  .netto-val {
    width: 55%;
    font-size: 12.5pt !important;
    font-weight: bold !important;
    text-align: right; /* Rata kanan */
    letter-spacing: 0.1px;
    color: #000000 !important;
  }

  /* NOTES */
  .notes-box {
    font-size: 8.2pt !important;
    border: 1.5px solid #000000 !important;
    padding: 2px 4px;
    margin: 2px 0;
    line-height: 1.2;
    word-break: break-word;
    font-weight: bold !important;
    color: #000000 !important;
  }

  /* SIGNATURES */
  .signatures {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    width: 100%;
    margin-top: 4px;
  }
  .signatures > div {
    display: flex !important;
    flex-direction: column !important;
    width: 48%;
    text-align: center !important; /* Sentralisasi tanda tangan di A6 */
    font-size: 8.5pt !important;
    line-height: 1.15;
    font-weight: bold !important;
    color: #000000 !important;
  }
  .signature-space {
    height: 10px;
    display: block;
  }
  .signature-line {
    border-top: 1.5px solid #000000 !important;
    margin: 2px auto 0 auto;
    width: 85%;
    font-weight: bold !important;
    font-size: 8.5pt !important;
    padding-top: 1px;
    text-align: center !important;
  }

  /* FOOTER */
  .footer-msg {
    text-align: center;
    font-size: 8pt !important;
    margin-top: 4px;
    line-height: 1.15;
    border-top: 1.5px dashed #000000 !important;
    padding-top: 2px;
    font-weight: bold !important;
    color: #000000 !important;
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
  const bruto = record.grossWeight ?? 0;
  const tara = record.tareWeight ?? 0;
  const rawNet = bruto - tara;
  const net = record.netWeight ?? 0;
  const potKrg = Math.round(rawNet * ((record.bagDeductionPercent ?? 0) / 100));
  const potRefaksi = Math.round(rawNet * ((record.refaksiKaPercent ?? 0) / 100));
  const potBijiMati = Math.round(rawNet * ((record.deadKernelsPercent ?? 0) / 100));
  const potJamur = Math.round(rawNet * ((record.moldPercent ?? 0) / 100));
  const potBijiKecil = Math.round(rawNet * ((record.smallKernelsPercent ?? 0) / 100));
  const potSampahHalus = Math.round(rawNet * ((record.fineTrashPercent ?? 0) / 100));

  const htmlContent = `<!DOCTYPE html>
  <html>
  <head>
    <title>Resi Penerimaan #${record.ticketNo || (record.id ? record.id.slice(-6) : '000000')}</title>
    <style>${COMMON_SLIP_STYLE}</style>
  </head>
  <body>
    <div class="slip">
      <div class="header" style="display: block; margin-bottom: 2px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${bilibiliLogo}" alt="US BILIBILI 162 BRAND" style="width: 32px; height: auto;" />
          <div style="text-align: left;">
            <div class="header-title" style="font-size: 10pt; font-weight: 950; text-transform: uppercase;">US Bilibili 162</div>
            <div class="header-subtitle" style="font-size: 7pt; font-weight: normal; line-height: 1.1;">
              Jalan Poros Pinrang-Polman KM. 12<br/>Desa Bilibili, Suppa, Kab. Pinrang
            </div>
          </div>
        </div>
      </div>
  
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
  
      <div class="flex"><span class="label">Tgl. Cetak</span><span class="value">: ${formatReceiptDate(record.date)}</span></div>
      <div class="flex"><span class="label">No. Tiket</span><span class="value">: ${record.ticketNo || '-'}</span></div>
      <div class="flex"><span class="label">No. Polisi</span><span class="value">: ${record.vehicleNo}</span></div>
      <div class="flex"><span class="label">Supplier</span><span class="value">: ${record.supplier}</span></div>
      <div class="flex"><span class="label">Komoditas</span><span class="value">: ${record.commodity}</span></div>
  
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
  
      <div class="flex"><span class="label">TIMBANGAN KOTOR</span><span class="value">: ${bruto.toLocaleString('id-ID')} Kg</span></div>
      <div class="flex"><span class="label">TIMBANGAN KOSONG</span><span class="value">: ${tara.toLocaleString('id-ID')} Kg</span></div>
      <div class="flex"><span class="label">TIMBANGAN BRUTO</span><span class="value">: ${(bruto - tara).toLocaleString('id-ID')} Kg</span></div>
      <div class="flex"><span class="label">Kadar Air</span><span class="value">: ${record.moistureContent ?? 0}%</span></div>
      <div class="flex"><span class="label">Refaksi KA</span><span class="value">: -${potRefaksi.toLocaleString('id-ID')} Kg (${record.refaksiKaPercent ?? 0}%) ${record.commodity?.includes('JAGUNG') && ((record.moistureContent ?? 0) > 30.00 || (record.cornFormulaFactor && (record.moistureContent ?? 0) > 30.00)) ? `*[Rumus ${record.cornFormulaFactor || 1.4}]` : ''}</span></div>
      ${record.commodity?.includes('JAGUNG') ? `
      <div class="flex"><span class="label">Pot. Biji Mati</span><span class="value">: -${potBijiMati.toLocaleString('id-ID')} Kg (${record.deadKernelsPercent ?? 0}%)</span></div>
      <div class="flex"><span class="label">Pot. Jamur</span><span class="value">: -${potJamur.toLocaleString('id-ID')} Kg (${record.moldPercent ?? 0}%)</span></div>
      <div class="flex"><span class="label">Pot. Biji Kecil</span><span class="value">: -${potBijiKecil.toLocaleString('id-ID')} Kg (${record.smallKernelsPercent ?? 0}%)</span></div>
      <div class="flex"><span class="label">Pot. Sampah Halus</span><span class="value">: -${potSampahHalus.toLocaleString('id-ID')} Kg (${record.fineTrashPercent ?? 0}%)</span></div>
      ` : ''}
  
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
      <div class="flex" style="font-weight: 950; font-size: 8.5pt;"><span class="label">NETTO</span><span class="value" style="font-weight: 950;">: ${net.toLocaleString('id-ID')} KG</span></div>
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
  
      <div class="flex"><span class="label">HARGA BELI</span><span class="value">: Rp ${(record.price ?? 0).toLocaleString('id-ID')}/Kg</span></div>
      <div class="flex"><span class="label">BAYAR KOTOR</span><span class="value">: Rp ${(net * (record.price ?? 0)).toLocaleString('id-ID')}</span></div>
      <div class="flex"><span class="label">BIAYA BURUH</span><span class="value">: -Rp ${(record.laborCost ?? 0).toLocaleString('id-ID')}</span></div>
  
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
      <div class="flex" style="font-weight: 950; font-size: 9pt;"><span class="label">BAYAR KE PETANI</span><span class="value" style="font-weight: 950;">: Rp ${(record.totalPrice ?? 0).toLocaleString('id-ID')}</span></div>
      <div class="divider-line" style="margin: 2px 0 !important;"></div>
  
      <div class="signatures" style="margin-top: 6px; width: 100%; display: table; table-layout: fixed;">
        <div style="display: table-cell; width: 50%; text-align: center !important; vertical-align: top; padding: 0 2px; font-size: 8.5pt; font-weight: bold;">
          Staff 162
          <div style="margin-top: 14px; font-weight: bold; text-align: center !important;">( ${staffName} )</div>
          <div style="border-top: 1.5px solid #000; width: 85%; margin: 1px auto 0 auto;"></div>
        </div>
        <div style="display: table-cell; width: 50%; text-align: center !important; vertical-align: top; padding: 0 2px; font-size: 8.5pt; font-weight: bold;">
          Sopir / Pembawa
          <div style="margin-top: 14px; font-weight: bold; text-align: center !important;">( &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; )</div>
          <div style="border-top: 1.5px solid #000; width: 85%; margin: 1px auto 0 auto;"></div>
        </div>
      </div>
  
      ${record.commodity?.includes('JAGUNG') && ((record.moistureContent ?? 0) > 30.00) ? `
      <div style="font-size: 8.2pt !important; color: #000000 !important; background-color: #ffffff !important; border: 1.5px solid #000000 !important; border-radius: 3px; padding: 3px 6px; margin: 4px 0 6px 0; font-family: 'Calibri Light', Calibri, Arial, 'Segoe UI', sans-serif !important; line-height: 1.25; font-weight: bold !important;">
        <strong>*KA Tinggi (${record.moistureContent ?? 0}%):</strong> Potongan KA dihitung menggunakan Rumus ${record.cornFormulaFactor || 1.4} luar tabel: (Math.floor(${record.moistureContent ?? 0}) - 14) x ${record.cornFormulaFactor || 1.4} = ${record.refaksiKaPercent}% potongan.
      </div>
      ` : ''}
  
      <div class="footer-msg" style="margin-top: 10px; border-top: 1.2px dashed #000; padding-top: 4px; text-align: center;">
        * Terimakasih atas kerjasamanya *<br/>
        Aplikasi Timbangan GSC GST-9700 v2.0
      </div>
    </div>
  </body>
  </html>`;

  printInNewWindow(htmlContent);
}

export function printOutboundSlip(record: OutboundRecord, ticket: WeighbridgeTicket | undefined, staffName: string = "Asma") {
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
    ${record.containerNo ? `<div class="flex"><span class="label">No. Kontainer:</span><span class="value">${record.containerNo}</span></div>` : ''}
    ${record.sealNo ? `<div class="flex"><span class="label">No. Segel:</span><span class="value">${record.sealNo}</span></div>` : ''}

    ${ticket ? `
    <div class="divider-line"></div>
    <div class="flex"><span class="label">TIMBANGAN KOTOR:</span><span class="value">${(ticket.timbang1Weight ?? 0).toLocaleString('id-ID')} Kg</span></div>
    <div class="flex"><span class="label">TIMBANGAN KOSONG:</span><span class="value">${(ticket.timbang2Weight ?? 0).toLocaleString('id-ID')} Kg</span></div>
    <div class="flex"><span class="label">TIMBANGAN BRUTO:</span><span class="value">${((ticket.timbang1Weight ?? 0) - (ticket.timbang2Weight ?? 0)).toLocaleString('id-ID')} Kg</span></div>
    ` : ''}

    <div class="divider-line"></div>

    <div class="netto-row"><span class="netto-label">TOTAL BERAT :</span><span class="netto-val">${(record.totalWeight ?? 0).toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Upah Buruh :</span><span class="value">Rp ${(record.loadingLaborCost ?? 0).toLocaleString('id-ID')}</span></div>
    ${record.price ? `
    <div class="flex"><span class="label">Harga Jual:</span><span class="value">Rp ${record.price.toLocaleString('id-ID')}/Kg</span></div>
    <div class="flex"><span class="label">Total Nilai:</span><span class="value font-bold" style="font-weight: bold;">Rp ${((record.totalWeight ?? 0) * record.price).toLocaleString('id-ID')}</span></div>
    ` : ''}

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
    ${record.containerNo ? `<div class="flex"><span class="label">No. Kontainer:</span><span class="value">${record.containerNo}</span></div>` : ''}
    ${record.sealNo ? `<div class="flex"><span class="label">No. Segel:</span><span class="value">${record.sealNo}</span></div>` : ''}

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
  const bruto = ticket.grossWeight ?? 0;
  const tara = ticket.tareWeight ?? 0;
  const net = ticket.netWeight ?? 0;
  const rawNet = bruto - tara;
  const potKrg = rawNet * ((ticket.bagDeductionPercent ?? 0) / 100);
  const potRefaksi = rawNet * ((ticket.refaksiPercent ?? 0) / 100);

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

    <div class="flex"><span class="label">TIMBANGAN KOTOR :</span><span class="value">${bruto.toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">TIMBANGAN KOSONG :</span><span class="value">${tara.toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">TIMBANGAN BRUTO :</span><span class="value">${(bruto - tara).toLocaleString('id-ID')} kg</span></div>
    <div class="flex"><span class="label">Pot. Refaksi (${(ticket.refaksiPercent ?? 0).toFixed(2)}%):</span><span class="value">- ${potRefaksi.toLocaleString('id-ID')} kg</span></div>

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