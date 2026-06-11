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

      let stylesText = Array.from(parsedDoc.querySelectorAll('style'))
        .map(style => style.innerHTML)
        .join('\n');

      stylesText = stylesText.replace(/html,\s*body/gi, '.pdf-slip-wrapper');
      stylesText = stylesText.replace(/\bbody\b/gi, '.pdf-slip-wrapper');

      const cleanHtml = `
        <div class="pdf-slip-wrapper" style="width: 105mm; height: 148mm; box-sizing: border-box; background-color: #ffffff; padding: 0; margin: 0; overflow: hidden; position: relative;">
          <style>
            ${stylesText}
            .pdf-slip-wrapper {
              font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace !important;
              color: #1e293b !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slip {
               height: auto !important;
               min-height: auto !important;
            }
          </style>
          <div class="slip" style="border: none !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; width: 105mm !important; box-sizing: border-box !important; padding: 5mm !important; background-color: #ffffff !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important;">
            ${slip.innerHTML}
          </div>
        </div>
      `;

      const opt = {
        margin:       0,
        filename:     pdfFileName || 'Resi.pdf',
        image:        { type: 'jpeg' as const, quality: 0.8 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true, windowWidth: 400 },
        jsPDF:        { unit: 'mm', format: 'a6', orientation: 'portrait' as const, compress: true }
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
