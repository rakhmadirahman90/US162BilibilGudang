import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Download, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (phone: string, text: string) => void;
  defaultText: string;
  pdfHtml?: string;
  pdfFileName?: string;
}

export default function WhatsAppModal({ isOpen, onClose, onSend, defaultText, pdfHtml, pdfFileName }: WhatsAppModalProps) {
  const [phone, setPhone] = useState('');
  const [withPdf, setWithPdf] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);

  // Clear phone field on unmount or re-open
  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setWithPdf(true);
      setIsGenerating(false);
      setPdfDownloadUrl(null);
    }
  }, [isOpen]);

  const generateAndUploadPdf = async () => {
    if (!withPdf || !pdfHtml || pdfDownloadUrl || isGenerating) return;

    setIsGenerating(true);
    setPdfDownloadUrl(null);

    try {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(pdfHtml, 'text/html');
      const slip = parsedDoc.querySelector('.slip') || parsedDoc.body;

      // EXTRACT ORIGINAL LOGO SRC BEFORE RESTRUCTURING
      const originalLogo = slip.querySelector('img');
      const logoSrc = originalLogo ? originalLogo.getAttribute('src') : '';

      // EXTRACT ORIGINAL HEADER INFO
      const origTitleEl = slip.querySelector('.header-title') || slip.querySelector('div[class*="title"]');
      const origSubtitleEl = slip.querySelector('.header-subtitle') || slip.querySelector('div[class*="subtitle"]');
      const customTitle = origTitleEl ? (origTitleEl.textContent || '').toUpperCase() : 'US BILIBILI 162';
      const customSubtitleHtml = origSubtitleEl ? (origSubtitleEl.innerHTML || '') : 'Jalan Poros Pinrang-Polman KM. 12<br/>Desa Bilibili, Suppa, Kab. Pinrang';
      const subtitleLines = customSubtitleHtml.split(/<br\s*\/?>/i).map(line => line.trim()).filter(Boolean);

      // PROSES DAN STRUKTURKAN ULANG BARIS AGAR ALIGNMENT KANAN-KIRI SEMPURNA SEPERTI GAMBAR
      const flexRows = slip.querySelectorAll('.flex, .netto-row');
      flexRows.forEach(row => {
        const labelEl = row.querySelector('.label, .label-heavy, .netto-label');
        const valueEl = row.querySelector('.value, .value-heavy, .netto-val');
        if (labelEl && valueEl) {
          let labelText = labelEl.textContent || '';
          let valueText = valueEl.textContent || '';

          // Bersihkan label & value dari tanda titik dua di akhir/awal jika ada
          labelText = labelText.trim();
          if (labelText.endsWith(':')) {
            labelText = labelText.slice(0, -1).trim();
          }

          valueText = valueText.trim();
          if (valueText.startsWith(':')) {
            valueText = valueText.slice(1).trim();
          }

          // Ekstrak persentase dari value (jika ada seperti "0%") untuk dipindah ke Label
          const percentRegex = /\(([\d.,]+%)\)/;
          const matchPercent = valueText.match(percentRegex);
          if (matchPercent) {
            const percentStr = matchPercent[1];
            valueText = valueText.replace(percentRegex, '').replace(/\s+/g, ' ').trim();
            labelText = `${labelText} (${percentStr})`;
          }

          let lowerLabel = labelText.toLowerCase();

          // Standardize/Translate labels to match the image exactly
          if (lowerLabel.includes('tgl. cetak') || lowerLabel.includes('tanggal cetak')) {
            labelText = 'Tanggal';
          } else if (lowerLabel.includes('no. tiket') || lowerLabel.includes('nomor tiket')) {
            labelText = 'No. Tiket/Ref';
          } else if (lowerLabel.includes('no. polisi') || lowerLabel.includes('nomor polisi')) {
            labelText = 'No. Polisi';
          } else if (lowerLabel.includes('supplier')) {
            labelText = 'Suplier';
          } else if (lowerLabel.includes('komoditas')) {
            labelText = 'Komoditas';
          } else if (lowerLabel === 'bruto') {
            labelText = 'BERAT BRUTO';
          } else if (lowerLabel === 'tara') {
            labelText = 'BERAT TARA';
          } else if (lowerLabel.includes('pot. karung')) {
            labelText = 'Pot. Karung';
          } else if (lowerLabel.includes('refaksi ka')) {
            labelText = 'Refaksi KA';
          } else if (lowerLabel === 'netto') {
            labelText = 'BERAT NETTO';
          } else if (lowerLabel.includes('harga beli')) {
            labelText = 'HARGA BELI';
          } else if (lowerLabel.includes('bayar kotor')) {
            labelText = 'HARGA BRUTO';
          } else if (lowerLabel.includes('biaya buruh')) {
            labelText = 'BIAYA BURUH PANGGUL';
          } else if (lowerLabel.includes('bayar ke petani') || lowerLabel.includes('total harus dibayar')) {
            labelText = 'TOTAL HARUS DIBAYAR';
          }

          // Deteksi baris tebal / netto / total bayar
          const isHeavy = labelEl.classList.contains('label-heavy') || 
                          labelEl.classList.contains('netto-label') || 
                          valueEl.classList.contains('value-heavy') || 
                          valueEl.classList.contains('netto-val') ||
                          row.getAttribute('style')?.includes('font-weight') ||
                          labelText === 'BERAT NETTO' ||
                          labelText === 'TOTAL HARUS DIBAYAR';

          const isTotalRow = labelText === 'TOTAL HARUS DIBAYAR';

          let rowClass = 'pdf-row';
          if (isHeavy) rowClass += ' row-heavy';
          if (isTotalRow) rowClass += ' pdf-total-row';

          row.className = rowClass;
          row.innerHTML = `
            <span class="pdf-label">${labelText} :</span>
            <span class="pdf-value">${valueText}</span>
          `;
          row.removeAttribute('style');
        }
      });

      // RERENDER HEADER YANG SEMPURNA SEPERTI GAMBAR
      const headerEl = slip.querySelector('.header');
      if (headerEl) {
        headerEl.className = 'pdf-header';
        headerEl.removeAttribute('style');
        
        let subtitleMarkups = subtitleLines.map(line => `<div class="pdf-header-subtitle">${line}</div>`).join('');
        
        headerEl.innerHTML = `
          ${logoSrc ? `<img src="${logoSrc}" class="pdf-header-logo" alt="Logo" />` : ''}
          <div class="pdf-header-text">
            <div class="pdf-header-title">${customTitle}</div>
            ${subtitleMarkups}
          </div>
        `;
      }

      // KONSISTENKAN SEMUA SEPARATOR SEJAJAR SOLID LINE
      const dividers = slip.querySelectorAll('.divider-line, .divider-double');
      dividers.forEach(div => {
        div.className = 'pdf-divider-line';
        div.removeAttribute('style');
      });

      // PROSES DAN STRUKTURKAN TANDA TANGAN SECARA INDEPENDEN DAN REKAYASA PRESISI SEPERTI GAMBAR
      const signaturesContainer = slip.querySelector('.signatures');
      if (signaturesContainer) {
        const children = Array.from(signaturesContainer.children);
        let leftTitle = "Staff 162";
        let leftName = "Asma";
        let rightTitle = "Sopir / Pembawa";

        if (children.length >= 2) {
          const leftText = children[0].textContent || '';
          const rightText = children[1].textContent || '';

          // Ekstrak nama staff dari format "( Asma )" atau baris bawah
          const leftMatch = leftText.match(/\(\s*([^\s)]+)\s*\)/);
          if (leftMatch && leftMatch[1]) {
            leftName = leftMatch[1];
          } else {
            const lines = leftText.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length > 1) {
              leftName = lines[lines.length - 1];
            } else if (leftText.includes('Staff 162')) {
              const t = leftText.replace('Staff 162', '').replace(/[()_]/g, '').trim();
              if (t) leftName = t;
            }
          }

          if (leftText.toLowerCase().includes('penerima')) {
            leftTitle = "Penerima Staff 162";
          }
          if (rightText.toLowerCase().includes('pelanggan')) {
            rightTitle = "Pelanggan";
          }
        }

        signaturesContainer.className = 'pdf-signatures';
        signaturesContainer.innerHTML = `
          <div class="pdf-sig-col">
            <div class="pdf-sig-title">${leftTitle}</div>
            <div class="pdf-sig-name-container">
              <span class="pdf-sig-name">${leftName}</span>
              <div class="pdf-sig-line"></div>
              <span class="pdf-sig-parens">( )</span>
            </div>
          </div>
          <div class="pdf-sig-col">
            <div class="pdf-sig-title">${rightTitle}</div>
            <div class="pdf-sig-name-container">
              <span class="pdf-sig-name">&nbsp;</span>
              <div class="pdf-sig-line"></div>
              <span class="pdf-sig-parens">( )</span>
            </div>
          </div>
        `;
        signaturesContainer.removeAttribute('style');
      }

      // CAUTION BOX UNTUK KEADAAN KHUSUS (MOISTURE JIKA ADA)
      const infoBox = slip.querySelector('div[style*="background-color: #f8d7da"]');
      if (infoBox) {
        infoBox.className = 'pdf-caution-box';
        infoBox.removeAttribute('style');
      }

      const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${pdfFileName || 'Resi'}</title>
  <style>
    /* RESET GLOBAL STYLE UNTUK DIGITAL A6 PRINT - NONAKTIFKAN SMOOTHING AGAR BERSIH TANPA GREY PIXEL DI DOT MATRIX */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #ffffff !important;
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: unset !important;
      font-smooth: never !important;
      text-rendering: optimizeSpeed !important;
    }

    /* PENGATURAN FONT "CALIBRI" UNTUK KETERBACAAN TEBAL & SOLID DI DOT MATRIX LX-310 */
    .pdf-slip {
      width: 85mm !important;
      height: 140mm !important; /* Shrunk from 148mm to exactly 140mm to guarantee it is safely shorter than A6 page height (148mm) so that no second page/blank page is ever created due to pixel/rounding issues */
      max-height: 140mm !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 1.5mm 2.5mm 1.5mm 6ch !important; /* Beri jarak 6 spasi ke kanan */
      background: #ffffff !important;
      font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
      font-size: 10.2pt !important; /* Ukuran ideal untuk dots matrix */
      color: #000000 !important;
      line-height: 1.25 !important;
      box-sizing: border-box !important;
      display: block !important;
    }

    /* KUALITAS TEKS SOLID PENCEGAHAN BLUR, PURE BLACK UNTUK DOT MATRIX - TINGKATKAN KETERBACAAN */
    .pdf-slip * {
      color: #000000 !important;
      background: transparent !important;
      border-color: #000000 !important;
      box-shadow: none !important;
      font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
      font-weight: 900 !important; /* Tebalkan ganda hingga tingkat Black secara global agar jarum printer menusuk rapat */
      -webkit-text-stroke: 0.3px #000000 !important; /* Outline stroke untuk menebalkan bentuk fisik font */
      text-shadow: 0.25px 0px 0px #000000, -0.25px 0px 0px #000000 !important; /* Simulasi cetak ganda (double-strike) hardware */
      letter-spacing: 0.25px !important; /* Memberikan mikro-spasi agar tinta ketukan pita tidak bloat / menyatu */
      box-sizing: border-box !important;
    }

    /* DESAIN HEADER KORPORASI RAPI DAN TERSENTRALISASI */
    .pdf-header {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start !important;
      margin-bottom: 2px !important;
      width: 100% !important;
      gap: 2mm !important;
    }
    .pdf-header-logo {
      width: 8mm !important;
      height: auto !important;
      max-height: 8mm !important;
      object-fit: contain !important;
      margin: 0 !important;
      display: block !important;
    }
    .pdf-header-text {
      flex: 1 !important;
      text-align: left !important;
    }
    .pdf-header-title {
      font-size: 11.5pt !important;
      font-weight: bold !important; /* Tegas namun tidak dither berlubang */
      text-transform: uppercase !important;
      letter-spacing: 0.1px !important;
      margin-bottom: 0.5px !important;
      text-align: left !important;
    }
    .pdf-header-subtitle {
      font-size: 8pt !important;
      font-weight: bold !important;
      line-height: 1.15 !important;
      text-align: left !important;
    }

    /* FORMAT BARIS TABEL SEMPURNA KANAN-KIRI */
    .pdf-row {
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      width: 100% !important;
      margin: 0.2px 0 !important;
      page-break-inside: avoid !important;
    }
    .pdf-label {
      width: 45% !important;
      text-align: left !important;
      font-weight: bold !important;
      font-size: 9.2pt !important;
    }
    .pdf-value {
      width: 55% !important;
      text-align: right !important; /* Rata kanan */
      font-weight: bold !important;
      font-size: 9.2pt !important;
    }

    /* KETEBALAN FONT BARIS UTAMA UNTUK BAGIAN PENTING */
    .row-heavy .pdf-label {
      font-weight: bold !important;
    }
    .row-heavy .pdf-value {
      font-weight: bold !important;
    }

    /* BOX SPESIAL ABU SHADED TOTAL HARUS DIBAYAR */
    .pdf-total-row {
      background-color: #ffffff !important; /* Gunakan background putih polos di dot matrix agar tidak dithering pixel abu-abu */
      border: 1.5px solid #000000 !important;
      padding: 1px 3px !important;
      margin: 1px 0 !important;
      border-radius: 2px !important;
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
    }

    /* SOLID DIVIDER LINE */
    .pdf-divider-line {
      border: none !important;
      border-top: 1.5px solid #000000 !important;
      margin: 1.5px 0 !important;
      height: 0 !important;
      display: block !important;
    }

    /* SEPARASI STATUS ATAU TICKET TYPE */
    .pdf-slip .ticket-type {
      font-size: 10.5pt !important;
      font-weight: bold !important;
      text-transform: uppercase !important;
      letter-spacing: 0.2px !important;
      margin: 1.5px 0 !important;
      text-align: center !important;
      display: block !important;
    }

    /* JAM TIMBANGER */
    .pdf-slip .weight-time {
      font-size: 8pt !important;
      margin: -1px 0 0.5px 0 !important;
      line-height: 1.05 !important;
      text-align: right !important; /* Rata kanan */
      font-weight: bold !important;
      display: block !important;
      font-style: italic !important;
      color: #000000 !important;
    }

    /* BOX CATATAN */
    .pdf-slip .notes-box {
      font-size: 8.2pt !important;
      border: 1.5px solid #000000 !important;
      padding: 1px 2px !important;
      margin: 1.5px 0 !important;
      line-height: 1.15 !important;
      word-break: break-word !important;
      font-weight: bold !important;
    }

    /* STRUKTUR TANDA TANGAN REKAYASA PRESISI */
    .pdf-signatures {
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      width: 100% !important;
      margin-top: 2.5px !important;
      page-break-inside: avoid !important;
    }
    .pdf-sig-col {
      display: flex !important;
      flex-direction: column !important;
      width: 48% !important;
      text-align: center !important;
    }
    .pdf-sig-title {
      font-size: 8.5pt !important;
      font-weight: bold !important;
      margin-bottom: 6px !important;
      text-align: center !important;
    }
    .pdf-sig-name-container {
      display: inline-block !important;
      width: 85% !important;
      margin: 0 auto !important;
      text-align: center !important;
    }
    .pdf-sig-name {
      font-size: 8.5pt !important;
      font-weight: bold !important;
      text-align: center !important;
      margin-bottom: 0.5px !important;
      display: block !important;
      height: 9px !important;
    }
    .pdf-sig-line {
      border-top: 1.5px solid #000000 !important;
      width: 100% !important;
      margin: 0 auto !important;
      display: block !important;
    }
    .pdf-sig-parens {
      font-size: 7.5pt !important;
      font-weight: bold !important;
      text-align: center !important;
      margin-top: 0.5px !important;
      display: block !important;
    }

    /* CAUTION / INFO MOISTURE BOX */
    .pdf-caution-box {
      font-size: 8.2pt !important;
      color: #000000 !important;
      background-color: #ffffff !important;
      border: 1.5px solid #000000 !important;
      border-radius: 4px !important;
      padding: 1px 2px !important;
      margin: 1.5px 0 !important;
      font-family: 'Calibri Light', Calibri, Arial, "Segoe UI", sans-serif !important;
      line-height: 1.15 !important;
    }

    /* ANTIALIASING LOGO UNTUK PENCEGAHAN BLUR */
    .pdf-slip img {
      image-rendering: -webkit-optimize-contrast !important;
      image-rendering: crisp-edges !important;
    }

    /* FOOTER TERSENTRALISASI */
    .pdf-slip .footer-msg {
      text-align: center !important;
      font-size: 8pt !important;
      margin-top: 3px !important;
      line-height: 1.1 !important;
      border-top: 1.5px dashed #000000 !important;
      padding-top: 1.5px !important;
      font-weight: bold !important;
      color: #000000 !important;
      clear: both !important;
    }
  </style>
</head>
<body>
  <div class="pdf-slip">
    ${slip.innerHTML}
  </div>
</body>
</html>
      `;

      // EXTRACT STYLE FOR ACCURATE MEASUREMENT AND DEFINE STYLES FOR THE GENERANT REMOVING NESTED HTML ISSUES
      const styleMatch = cleanHtml.match(/<style>([\s\S]*?)<\/style>/);
      const styleContent = styleMatch ? styleMatch[1] : '';

      // CREATE A STABLE DOM ELEMENT THAT STAYS ATTACHED DURING HTML2PDF CAPTURE FOR PERFECT STYLE INHERITANCE
      const containerForPdf = document.createElement('div');
      containerForPdf.style.position = 'absolute';
      containerForPdf.style.left = '-9999px';
      containerForPdf.style.top = '-9999px';
      containerForPdf.style.width = '397px'; // A6 width in pixels (approx)
      containerForPdf.style.height = '559px'; // A6 height in pixels (approx)
      
      const targetEl = document.createElement('div');
      targetEl.className = 'pdf-slip';
      targetEl.innerHTML = slip.innerHTML;

      // APPEND THE STYLE SHEET INSIDE TARGETEL SO HTML2PDF CLONES IT AND APPLIES STYLES PERFECTLY!
      const styleEl = document.createElement('style');
      styleEl.textContent = styleContent;
      targetEl.appendChild(styleEl);

      containerForPdf.appendChild(targetEl);
      document.body.appendChild(containerForPdf);

      const opt = {
        margin:       [0, 0, 0, 0] as [number, number, number, number],
        filename:     pdfFileName || 'Resi.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, logging: false, letterRendering: true, windowWidth: 397 },
        jsPDF:        { unit: 'mm', format: 'a6', orientation: 'portrait' as const, compress: true },
        pagebreak:    { mode: 'avoid-all' }
      };

      // Generate PDF directly from the live DOM element (targetEl) so that styles inside `<style>` are fully loaded and used by html2canvas!
      const pdfBlob = await html2pdf().set(opt).from(targetEl).output('blob');
      
      // Clean up the temporary container from the body
      document.body.removeChild(containerForPdf);
      
      let uploadUrl = '';

      // Try file.io
      try {
        const formDataIo = new FormData();
        formDataIo.append('file', pdfBlob, pdfFileName || 'Resi.pdf');
        const res = await fetch('https://file.io', { method: 'POST', body: formDataIo });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.link) uploadUrl = json.link;
        }
      } catch (ioErr) { console.warn(ioErr); }

      // Try tmpfiles.org
      if (!uploadUrl) {
        try {
          const formDataTmp = new FormData();
          formDataTmp.append('file', pdfBlob, pdfFileName || 'Resi.pdf');
          const res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: formDataTmp });
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success' && json.data?.url) {
              uploadUrl = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            }
          }
        } catch (tmpErr) { console.warn(tmpErr); }
      }

      setPdfDownloadUrl(uploadUrl || 'manual-fallback');
    } catch (err) {
      console.warn("Gagal memproses/mengunggah PDF:", err);
      setPdfDownloadUrl('error-fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow the modal to render/animate before starting heavy work
      const timer = setTimeout(() => {
        generateAndUploadPdf();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, withPdf]);

  const handleSend = async () => {
    if (!phone.trim()) {
      alert('Silakan isi Nomor WhatsApp penerima');
      return;
    }

    // Wait if still generating
    if (withPdf && isGenerating) {
        // This won't be easily reachable as button is disabled
        return;
    }

    let finalMsg = defaultText;

    if (withPdf && pdfDownloadUrl) {
        if (pdfDownloadUrl === 'manual-fallback' || pdfDownloadUrl === 'error-fallback') {
            alert('Terjadi kesalahan saat membuat PDF. Silakan kirim pesan saja, atau periksa koneksi.');
        } else {
            finalMsg += `\n\n⬇️ *Unduh File PDF Resi:*\n${pdfDownloadUrl}`;
        }
    } else if (withPdf && !isGenerating && !pdfDownloadUrl) {
        // Edge case: if somehow it didn't generate but tried
        alert("Mohon tunggu proses penyiapan PDF selesai.");
        return;
    }

    onSend(phone, finalMsg);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">Kirim Resi via WhatsApp</h3>
            <p className="text-[11px] font-medium text-neutral-500">Kirim nota digital ke pelanggan / sopir</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5 focus-within:text-emerald-600 transition-colors">
              No. WhatsApp Penerima
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:border-emerald-500 focus:bg-white outline-none transition-all text-neutral-800 shadow-sm"
              placeholder="Contoh: 08123456789"
              autoFocus
            />
            <p className="text-[9px] text-neutral-400 mt-1 italic">
              Masukkan nomor WA pembawa barang (tanpa / dengan kode negara 62)
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest mb-1.5">
              Preview Pesan
            </label>
            <textarea
              readOnly
              value={defaultText}
              className="w-full h-44 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-[10px] font-mono text-neutral-600 resize-none outline-none shadow-inner"
            />
          </div>
        </div>

        {pdfHtml && (
          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-start gap-2">
            <input 
              type="checkbox" 
              id="withPdf" 
              checked={withPdf} 
              onChange={(e) => setWithPdf(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded bg-neutral-100 border-neutral-300 focus:ring-emerald-500"
            />
            <label htmlFor="withPdf" className="text-xs font-bold text-neutral-600 cursor-pointer w-full leading-tight">
              Sertakan Link Unduh PDF Resi <br/>
              <span className="text-[9px] font-normal text-neutral-400 block mt-1">
                Aplikasi akan otomatis mengunggah PDF ke server sementara (berlaku 60 menit) dan menyertakan link unduhnya pada pesan WA.
              </span>
            </label>
            <FileText className={`w-6 h-6 shrink-0 ${withPdf ? 'text-emerald-500' : 'text-neutral-300'}`} />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-neutral-100">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition rounded-lg"
          >
            Batal
          </button>
          <button 
            onClick={handleSend}
            disabled={!phone.trim() || (isGenerating && withPdf)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-wait text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            {withPdf && isGenerating ? (
              <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyiapkan...</span>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Kirim Sekarang</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
