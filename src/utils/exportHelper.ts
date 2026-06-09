/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Clean Utility helpers to export React table reports to Microsoft Excel (CSV with UTF-8 BOM)
 * and trigger elegant, styled print jobs to physical printers or PDF generators.
 */

import { WeighbridgeTicket } from '../types';

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
            <td style="width: 80px; text-align: left; vertical-align: middle;">
              <!-- Placeholder for logo / stylish label -->
              <span style="display: inline-block; padding: 10px; background-color: #111; color: #fff; font-weight: bold; font-family: 'Courier New', Courier, monospace; font-size: 16px; border-radius: 4px;">
                US162
              </span>
            </td>
            <td style="text-align: left; vertical-align: middle; padding-left: 15px;">
              <h2 style="margin: 0; font-size: 15px; letter-spacing: 1px; font-weight: 850; text-transform: uppercase;">
                PERUSAHAAN PERGUDANGAN US BILIBILI 162
              </h2>
              <p style="margin: 3px 0 0 0; font-size: 9.5px; color: #333; line-height: 1.4;">
                Gudang &amp; Jembatan Timbang Terpadu &bull; Komoditas Pertanian Beras &amp; Jagung Pipil<br/>
                Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa, Kabupaten Pinrang, Sulawesi Selatan 91131 &bull; Telp: 085244466009
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

export function printCombinedSlip(record: InboundRecord, ticket: WeighbridgeTicket | undefined) {
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
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 2mm; }
        }
        body { font-family: 'Courier New', Courier, monospace; font-size: 10pt; color: #000; margin: 0; padding: 5px; line-height: 1.2; font-weight: 600; }
        .slip { width: 100%; max-width: 300px; }
        .border-dashed { border-top: 1px dashed #000; margin: 4px 0; }
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .flex { display: flex; justify-content: space-between; width: 100%; }
        .mt-2 { margin-top: 5px; }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="text-center font-bold" style="font-size: 11pt;">GUDANG US BILIBILI 162</div>
        <div class="text-center" style="font-size: 8pt;">
          Jl. Poros Pinrang - Parepare, Kec. Suppa
        </div>
        <div class="border-dashed"></div>
        <div class="flex"><span>No. Tb:</span><span>${record.ticketNo || '-'}</span><span>Tgl:</span><span>${record.date}</span></div>
        <div class="border-dashed"></div>
        <div class="flex"><span>No. Polisi:</span><span>${record.vehicleNo}</span></div>
        <div class="flex"><span>Nama Barang:</span><span>${record.commodity}</span></div>
        <div class="flex"><span>Agen/Tujuan:</span><span>${record.supplier}</span></div>
        <div class="flex"><span>Jml. krg:</span><span>${record.bagDeductionPercent}%</span></div>
        <div class="border-dashed"></div>
        <div class="flex"><span></span><span class="font-bold">JAM</span><span class="font-bold">BERAT</span></div>
        <div class="border-dashed"></div>
        <div class="flex"><span>Timbang-1:</span><span>${ticket?.timbang1Time || '-'}</span><span>${bruto.toLocaleString('id-ID')} kg</span></div>
        <div class="flex"><span>Timbang-2:</span><span>${ticket?.timbang2Time || '-'}</span><span>${tara.toLocaleString('id-ID')} kg</span></div>
        <div class="border-dashed"></div>
        <div class="flex"><span>BRUTO:</span><span>${bruto.toLocaleString('id-ID')} kg</span></div>
        <div class="flex"><span>POT. KRG:</span><span>${potKrg.toLocaleString('id-ID')} kg</span></div>
        <div class="flex"><span>REFAKSI:</span><span>${potRefaksi.toLocaleString('id-ID')} kg</span></div>
        <div class="border-dashed"></div>
        <div class="flex"><span>HARGA:</span><span>Rp ${(record.price || 0).toLocaleString('id-ID')}/kg</span></div>
        <div class="flex font-bold" style="font-size: 11pt;"><span>NETTO:</span><span>${net.toLocaleString('id-ID')} kg</span></div>
        <div class="flex font-bold" style="font-size: 11pt;"><span>TOTAL:</span><span>Rp ${(record.totalPrice || 0).toLocaleString('id-ID')}</span></div>
        <div class="border-dashed"></div>
        <div class="flex mt-2" style="font-size: 8pt;">
          <div class="text-center">Penimbang,</div>
          <div class="text-center">Petugas/Staff,</div>
        </div>
        <div style="height: 50px;"></div>
        <div class="flex" style="font-size: 8pt;">
          <div class="text-center">( .................... )</div>
          <div class="text-center">( .................... )</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function printSlip(ticket: WeighbridgeTicket) {
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
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 2mm; }
        }
        body { font-family: 'Courier New', Courier, monospace; font-size: 12pt; color: #000; margin: 0; padding: 5px; line-height: 1.4; font-weight: 600; }
        .slip { width: 100%; max-width: 300px; }
        .border-t { border-top: 1px solid #000; margin: 4px 0; }
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .flex { display: flex; justify-content: space-between; width: 100%; font-family: 'Courier New', Courier, monospace; font-weight: 600; }
        .mt-4 { margin-top: 10px; }
        .mt-2 { margin-top: 5px; }
        span { font-family: 'Courier New', Courier, monospace; }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="slip">
        <div class="text-center font-bold" style="font-size: 12pt;">GUDANG US BILIBILI 162</div>
        <div class="text-center" style="font-size: 8pt;">
          Jl. Poros Pinrang - Parepare, Kel. Watang, Kec. Suppa<br/>
          Kabupaten Pinrang, Sulawesi Selatan 91131<br/>
          TELP - 085244466009
        </div>
        <div class="border-t"></div>
        <div class="flex"><span>No. Tiket :</span><span class="font-bold">${ticket.ticketNo}</span></div>
        <div class="flex"><span>No. Polisi:</span><span class="font-bold">${ticket.policeNo}</span></div>
        <div class="flex"><span>Mitra/Agen:</span><span class="font-bold">${ticket.agency}</span></div>
        <div class="flex"><span>Nama Barang:</span><span class="font-bold">${ticket.goodsName}</span></div>
        
        <div class="border-t"></div>
        
        <div class="flex font-bold mt-2"><span>TIMBANG I (Masuk)</span><span>${bruto.toLocaleString('id-ID')} Kg</span></div>
        <div class="text-right" style="font-size: 8pt;">${ticket.timbang1Time || '-'}</div>
        
        <div class="flex font-bold"><span>TIMBANG II (Keluar)</span><span>${tara > 0 ? tara.toLocaleString('id-ID') + ' Kg' : '- -'}</span></div>
        <div class="text-right" style="font-size: 8pt;">${ticket.timbang2Time || '-'}</div>
        
        <div class="border-t"></div>
        
        <div class="flex"><span>BERAT BRUTO :</span><span>${bruto.toLocaleString('id-ID')} Kg</span></div>
        <div class="flex"><span>POTONGAN TARA :</span><span>${tara.toLocaleString('id-ID')} Kg</span></div>
        <div class="flex"><span>Pot. Karung (${ticket.bagDeductionPercent.toFixed(2)}%):</span><span>- ${potKrg.toLocaleString('id-ID')} Kg</span></div>
        <div class="flex"><span>Pot. Refaksi (${ticket.refaksiPercent.toFixed(2)}%):</span><span>- ${potRefaksi.toLocaleString('id-ID')} Kg</span></div>
        
        <div class="border-t"></div>
        <div class="flex font-bold" style="font-size: 12pt;"><span>BERAT NETTO :</span><span>${net.toLocaleString('id-ID')} KG</span></div>
        
        <div class="mt-2" style="border: 1px solid #000; padding: 5px; font-size: 8pt;">
          Catatan: ${ticket.notes || '-'}
        </div>
        
        <div class="flex mt-4" style="font-size: 8pt;">
          <div class="text-center">Penerima Staff 162</div>
          <div class="text-center">Sopir / Pembawa</div>
        </div>
        <div class="flex" style="height: 50px;">
          <div></div>
          <div></div>
        </div>
        <div class="flex" style="font-size: 8pt;">
          <div class="text-center">__________________</div>
          <div class="text-center">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
        </div>
        
        <div class="text-center mt-4" style="font-size: 7pt;">
          * Terimakasih atas kerjasamanya *<br/>
          Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}
