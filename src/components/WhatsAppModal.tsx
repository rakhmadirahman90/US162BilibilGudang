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

      const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${pdfFileName || 'Resi'}</title>
  <style>
    /* RESET STYLE UNTUK DIGITAL PDF */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #ffffff !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      font-smooth: always !important;
      text-rendering: geometricPrecision !important;
    }

    /* DIGITAL SLIP CONTAINER YANG RAPI & COCOK DENGAN FORMAT KERTAS THERMAL */
    .pdf-slip {
      width: 100% !important;
      margin: 0 !important;
      padding: 2px !important; /* Margins are controlled of page-level to keep alignment symmetrical */
      background: #ffffff !important;
      font-family: 'Consolas', 'Courier New', Courier, monospace !important;
      font-size: 7.4pt !important;
      color: #000000 !important;
      line-height: 1.35 !important;
      box-sizing: border-box !important;
    }

    /* PAKSA SEMUA ELEMEN BERWARNA HITAM & TEBAL / CRISP */
    .pdf-slip * {
      color: #000000 !important;
      background: transparent !important;
      border-color: #000000 !important;
      box-shadow: none !important;
      font-family: 'Consolas', 'Courier New', Courier, monospace !important;
      font-weight: 700 !important;
      box-sizing: border-box !important;
    }

    /* JUDUL BRAND GUDANG */
    .pdf-slip .header {
      display: block !important;
      width: 100% !important;
      margin-bottom: 4px !important;
    }
    
    .pdf-slip .header-title {
      font-size: 9.5pt !important;
      font-weight: 950 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.3px !important;
      display: block !important;
    }
    
    .pdf-slip .header-subtitle {
      font-size: 6.6pt !important;
      font-weight: 700 !important;
      display: block !important;
      line-height: 1.25 !important;
    }

    /* SEPARATOR GARIS */
    .pdf-slip .divider-line {
      border: none !important;
      border-top: 1.8px solid #000000 !important;
      margin: 4px 0 !important;
      height: 0 !important;
      display: block !important;
    }
    
    .pdf-slip .divider-double {
      border: none !important;
      border-top: 3.5px double #000000 !important;
      margin: 4px 0 !important;
      height: 0 !important;
      display: block !important;
    }

    /* LABEL KATEGORI */
    .pdf-slip .ticket-type {
      font-size: 8.0pt !important;
      font-weight: 950 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      margin: 4px 0 !important;
      text-align: center !important;
      display: block !important;
    }

    /* TABLE LAYOUT UNTUK BARIS PREVENT WRAPPING BARIS YG RUSAK */
    .pdf-slip .flex {
      display: table !important;
      width: 100% !important;
      table-layout: fixed !important;
      margin: 2px 0 !important;
      border-collapse: collapse !important;
      clear: both !important;
    }
    
    .pdf-slip .flex span {
      display: table-cell !important;
      font-size: 7.2pt !important;
      line-height: 1.25 !important;
      vertical-align: top !important;
    }
    
    .pdf-slip .flex span.label {
      width: 45% !important;
      text-align: left !important;
      font-weight: 700 !important;
    }
    
    .pdf-slip .flex span.value {
      width: 55% !important;
      text-align: left !important;
      font-weight: 850 !important;
    }
    
    .pdf-slip .flex span.label-heavy {
      width: 45% !important;
      font-weight: 850 !important;
    }
    
    .pdf-slip .flex span.value-heavy {
      width: 55% !important;
      font-weight: 950 !important;
      text-align: left !important;
    }

    /* JAM TIMBANGER */
    .pdf-slip .weight-time {
      font-size: 7.0pt !important;
      margin: 3px 0 !important;
      line-height: 1.1 !important;
      padding-left: 2px !important;
      font-weight: bold !important;
      display: block !important;
    }

    /* BARIS NETTO MENGGUNAKAN SEBARAN TABLE MODEL TERSTABIL */
    .pdf-slip .netto-row {
      display: table !important;
      width: 100% !important;
      table-layout: fixed !important;
      margin: 5px 0 !important;
      border-collapse: collapse !important;
    }
    
    .pdf-slip .netto-label {
      display: table-cell !important;
      width: 45% !important;
      font-size: 8.2pt !important;
      font-weight: 900 !important;
      vertical-align: middle !important;
      text-align: left !important;
    }
    
    .pdf-slip .netto-val {
      display: table-cell !important;
      width: 55% !important;
      font-size: 9.8pt !important;
      font-weight: 950 !important;
      text-align: left !important;
      vertical-align: middle !important;
    }

    /* BOX CATATAN */
    .pdf-slip .notes-box {
      font-size: 7.2pt !important;
      border: 1.5px solid #000000 !important;
      padding: 3px 5px !important;
      margin: 4px 0 !important;
      line-height: 1.25 !important;
      word-break: break-word !important;
      font-weight: 800 !important;
      display: block !important;
    }

    /* TANDA TANGAN */
    .pdf-slip .signatures {
      display: table !important;
      width: 100% !important;
      table-layout: fixed !important;
      margin-top: 10px !important;
      border-collapse: collapse !important;
    }
    
    .pdf-slip .signatures > div {
      display: table-cell !important;
      width: 50% !important;
      text-align: center !important;
      font-size: 7.0pt !important;
      padding: 0 4px !important;
      vertical-align: top !important;
      line-height: 1.3 !important;
      font-weight: bold !important;
    }
    
    .pdf-slip .signature-space {
      height: 14px !important;
      display: block !important;
    }
    
    .pdf-slip .signature-line {
      border-top: 1.2px solid #000000 !important;
      margin: 2px auto 0 auto !important;
      width: 85% !important;
      font-weight: 900 !important;
      font-size: 7.0pt !important;
      padding-top: 1px !important;
      text-align: center !important;
    }

    /* TAMPILKAN LOGO BRANDING DI PDF SECARA SEMPURNA */
    .pdf-slip img, .pdf-slip .header-logo {
      display: block !important;
      max-width: 32px !important;
      height: auto !important;
      margin: 0 auto 4px 0 !important;
    }

    /* PESAN FOOTER */
    .pdf-slip .footer-msg {
      text-align: center !important;
      font-size: 7.0pt !important;
      margin-top: 10px !important;
      line-height: 1.3 !important;
      border-top: 1.5px dashed #000000 !important;
      padding-top: 5px !important;
      font-weight: bold !important;
      display: block !important;
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

      const opt = {
        margin:       [4, 8, 4, 8] as [number, number, number, number], // 4mm top/bottom, 8mm left/right (menyediakan spasi 1.5 yang simetris dan aman dari terpotong)
        filename:     pdfFileName || 'Resi.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, logging: false, letterRendering: true, windowWidth: 380 },
        jsPDF:        { unit: 'mm', format: [82, 185] as [number, number], orientation: 'portrait' as const, compress: true }
      };

      const pdfBlob = await html2pdf().set(opt).from(cleanHtml).output('blob');
      
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
