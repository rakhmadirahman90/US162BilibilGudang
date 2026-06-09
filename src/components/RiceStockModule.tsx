import React, { useState } from 'react';
import { RiceStockRecord, EmployeeRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';
import { exportToCSV, printPDFReport, printRiceStockSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildRiceStockWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import { Package, PlusCircle, Search, Calendar, Download, Printer, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, X, MessageCircle } from 'lucide-react';

interface RiceStockModuleProps {
  records: RiceStockRecord[];
  employees?: EmployeeRecord[];
  onAddRecord: (record: RiceStockRecord) => void;
  onUpdateRecord: (record: RiceStockRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function RiceStockModule({ records, employees = [], onAddRecord, onUpdateRecord, onDeleteRecord }: RiceStockModuleProps) {
  const { t, language } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<RiceStockRecord | null>(null);

  // WhatsApp Modal State
  const [waModalConfig, setWaModalConfig] = useState<{
    isOpen: boolean;
    defaultText: string;
    record: RiceStockRecord | null;
    pdfHtml?: string;
    pdfFileName?: string;
  }>({
    isOpen: false,
    defaultText: '',
    record: null
  });

  const [staffName, setStaffName] = useState<string>(() => {
    return localStorage.getItem('bilibili_staff_name') || "Asma";
  });

  React.useEffect(() => {
    localStorage.setItem('bilibili_staff_name', staffName);
  }, [staffName]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'EDIT' | 'DELETE';
    onConfirm: () => void;
  } | null>(null);
  const closeConfirm = () => setConfirmModal(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [policeNo, setPoliceNo] = useState("");
  const [description, setDescription] = useState("");
  const [itemName, setItemName] = useState("BERAS");
  const [price, setPrice] = useState(0);
  const [colly, setColly] = useState(0);
  const [inWeight, setInWeight] = useState(0);
  const [outWeight, setOutWeight] = useState(0);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setPoliceNo("");
    setDescription("");
    setItemName("BERAS");
    setPrice(0);
    setColly(0);
    setInWeight(0);
    setOutWeight(0);
    setEditingId(null);
  };

  const handleEdit = (r: RiceStockRecord) => {
    setEditingId(r.id);
    setDate(r.date);
    setPoliceNo(r.policeNo);
    setDescription(r.description);
    setItemName(r.itemName);
    setPrice(r.price);
    setColly(r.colly);
    setInWeight(r.inWeight);
    setOutWeight(r.outWeight);
    setShowAddForm(true);
  };

  const handleDelete = (id: string, description: string) => {
    setConfirmModal({
      isOpen: true,
      title: t.confirmDeleteStock,
      message: t.confirmDeleteStockMsg.replace('{description}', description),
      type: 'DELETE',
      onConfirm: () => {
        onDeleteRecord(id);
        closeConfirm();
      }
    });
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !policeNo || !itemName) {
      (window as any).__showToast?.(t.errorIncompleteStock, "error");
      return;
    }
    
    const newRecord: RiceStockRecord = {
      id: editingId || `rice-${Date.now()}`,
      date,
      policeNo: policeNo.toUpperCase(),
      description,
      itemName,
      price,
      colly,
      inWeight,
      outWeight
    };

    const action = () => {
      if (editingId) {
        onUpdateRecord(newRecord);
      } else {
        onAddRecord(newRecord);
      }
      (window as any).__showToast?.(editingId ? t.successUpdateStock : t.successSaveStock, 'success');
      setShowAddForm(false);
      resetForm();
    };

    setConfirmModal({
      isOpen: true,
      title: editingId ? t.confirmEditStock : t.confirmSaveStock,
      message: editingId ? t.confirmEditStockMsg : t.confirmSaveStockMsg,
      type: editingId ? 'EDIT' : 'ADD',
      onConfirm: () => {
        action();
        closeConfirm();
      }
    });
  };

  const filteredRecords = records.filter(r => 
    r.policeNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let runningTotal = 0;
  const recordsWithTotal = filteredRecords.map(r => {
    runningTotal += (r.inWeight - r.outWeight);
    const totalTransaksi = (r.inWeight + r.outWeight) * r.price;
    return { ...r, runningTotal, totalTransaksi };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-neutral-800 flex items-center gap-2">
          <Package className="text-emerald-600 w-6 h-6" />
          {t.riceStockTitle}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? t.closeForm : t.recordNewStock}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <form onSubmit={handleSaveRecord} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label>{t.dateLabel}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.policeNo}</label>
              <input type="text" value={policeNo} onChange={(e) => setPoliceNo(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.descriptionLabel}</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.itemNameLabel}</label>
              <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.priceLabel}</label>
              <input type="text" value={formatNumberInput(price)} onChange={(e) => setPrice(parseNumberInput(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.collyLabel}</label>
              <input type="text" value={formatNumberInput(colly)} onChange={(e) => setColly(parseNumberInput(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.inStockLabel}</label>
              <input type="text" value={formatNumberInput(inWeight)} onChange={(e) => setInWeight(parseNumberInput(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label>{t.outStockLabel}</label>
              <input type="text" value={formatNumberInput(outWeight)} onChange={(e) => setOutWeight(parseNumberInput(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div className="col-span-3 flex justify-end gap-2">
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">{t.saveStock}</button>
            </div>
          </form>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
        />
      )}

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-neutral-600 min-w-[1000px]">
            <thead className="bg-neutral-100 text-neutral-700 font-semibold uppercase tracking-wider border-b border-neutral-300">
              <tr>
                <th className="py-2.5 px-3">{t.dateLabel}</th>
                <th className="py-2.5 px-3">{t.policeNo}</th>
                <th className="py-2.5 px-3">{t.descriptionLabel}</th>
                <th className="py-2.5 px-3">{t.itemNameLabel}</th>
                <th className="py-2.5 px-3 text-right">{t.priceLabel}</th>
                <th className="py-2.5 px-3 text-right">{t.collyLabel}</th>
                <th className="py-2.5 px-3 text-right">{t.inStockLabel}</th>
                <th className="py-2.5 px-3 text-right">{t.outStockLabel}</th>
                <th className="py-2.5 px-3 text-right">{t.totalTransaction}</th>
                <th className="py-2.5 px-3 text-right">{t.totalStockBalance}</th>
                <th className="py-2.5 px-3 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recordsWithTotal.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">{r.date}</td>
                  <td className="py-2.5 px-3 font-bold text-neutral-800">{r.policeNo}</td>
                  <td className="py-2.5 px-3">{r.description}</td>
                  <td className="py-2.5 px-3">{r.itemName}</td>
                  <td className="py-2.5 px-3 font-mono text-right">Rp {(r.price ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 text-right">{(r.colly ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 text-right">{(r.inWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 font-bold text-red-600 text-right">{(r.outWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 font-mono text-right">Rp {(r.totalTransaksi || 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 font-black text-neutral-900 font-mono text-right">{(r.runningTotal ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setPreviewRecord(r)} className="text-neutral-400 hover:text-sky-600 transition cursor-pointer" title="Cetak Resi">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setWaModalConfig({ 
                        isOpen: true, 
                        defaultText: buildRiceStockWAText(r), 
                        record: r,
                        pdfHtml: getHTMLForPDF(printRiceStockSlip, r, staffName),
                        pdfFileName: `Resi_Stok_Beras_${r.date}.pdf`
                      })} className="text-neutral-400 hover:text-emerald-600 transition cursor-pointer" title="Kirim Resi via WA">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEdit(r)} className="text-neutral-400 hover:text-blue-600 transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id, r.description)} className="text-neutral-400 hover:text-red-600 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      <AnimatePresence>
        {previewRecord && (
          <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 uppercase text-xs tracking-widest">
                  <Printer className="text-emerald-600 w-4 h-4" />
                  Pratinjau Bukti Stok
                </span>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-neutral-50 p-4 border border-dashed border-neutral-300 rounded font-mono text-[10px] text-neutral-800 leading-relaxed shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-2 mb-3">
                  <div className="font-bold text-xs tracking-widest text-emerald-950">CV. BILIBILI 162</div>
                  <div className="text-[8px] opacity-70">Jalan Poros Pinrang-Polman KM. 12</div>
                  <div className="text-[8px] opacity-70">Desa Bilibili, Kec. Suppa, Kab. Pinrang</div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tanggal :</span>
                    <span className="font-bold">{formatReceiptDate(previewRecord.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. Polisi :</span>
                    <span className="font-bold">{previewRecord.policeNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Keterangan :</span>
                    <span className="font-bold">{previewRecord.description}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>NAMA ITEM :</span>
                    <span className="font-black">{previewRecord.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MASUK :</span>
                    <span className="font-bold text-emerald-600">{(previewRecord.inWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KELUAR :</span>
                    <span className="font-bold text-red-600">{(previewRecord.outWeight ?? 0).toLocaleString('id-ID')} Kg</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-neutral-200 mt-1 pt-1">
                    <span>JUMLAH COLLY :</span>
                    <span>{(previewRecord.colly ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center text-[9px]">
                  <div>
                    <p className="mb-2">Staff 162</p>
                    <input
                      list="ricestock-staff-list"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full text-center bg-white border border-neutral-200 rounded py-1 px-1 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <datalist id="ricestock-staff-list">
                      {employees.filter(e => e.role === 'PETUGAS' || e.role === 'KARYAWAN').map(e => (
                        <option key={e.id} value={e.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <p className="mb-8">Penerima / Driver</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                  </div>
                </div>

                <div className="text-center mt-4 opacity-50 italic text-[7px]">
                  * Terimakasih atas kerjasamanya *<br/>
                  Aplikasi Stok Beras CV. Bilibili 162
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    printRiceStockSlip(previewRecord, staffName);
                    setPreviewRecord(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> CETAK SLIP
                </button>
                <button 
                  onClick={() => setPreviewRecord(null)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2 rounded-lg"
                >
                  TUTUP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppModal
        isOpen={waModalConfig.isOpen}
        onClose={() => setWaModalConfig({ ...waModalConfig, isOpen: false })}
        defaultText={waModalConfig.defaultText}
        onSend={(phone, text) => sendWhatsAppMessage(phone, text)}
        pdfHtml={waModalConfig.pdfHtml}
        pdfFileName={waModalConfig.pdfFileName}
      />
    </div>
  );
}
