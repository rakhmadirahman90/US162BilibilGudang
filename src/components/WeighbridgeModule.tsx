/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeighbridgeTicket, VehicleRecord, BuyerRecord, SupplierRecord } from '../types';
import { Scale, Printer, Search, PlusCircle, RotateCcw, AlertCircle, FileText, Check, Trash2, Edit2, Edit3, Download, Clock, ChevronRight, Truck, Save, XCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { exportToCSV, printPDFReport, printSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildWeighbridgeWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import ConfirmModal from './ConfirmModal';
import WhatsAppModal from './WhatsAppModal';

interface WeighbridgeModuleProps {
  tickets: WeighbridgeTicket[];
  onAddTicket: (ticket: WeighbridgeTicket) => void;
  onUpdateTicket: (ticket: WeighbridgeTicket) => void;
  onDeleteTicket: (id: string) => void;
  vehicles?: VehicleRecord[];
  buyers?: BuyerRecord[];
  suppliers?: SupplierRecord[];
  employees?: EmployeeRecord[];
}

export default function WeighbridgeModule({
  tickets,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket,
  vehicles = [],
  buyers = [],
  suppliers = [],
  employees = []
}: WeighbridgeModuleProps) {
  const { t, language } = useLanguage();
  
  // Simulator State
  const [simulatorWeight, setSimulatorWeight] = useState<number>(3560);
  const [customSimulatorInput, setCustomSimulatorInput] = useState<string>("3560");
  
  // Active Weighing Draft on Terminal
  const [selectedTicket, setSelectedTicket] = useState<WeighbridgeTicket | null>(tickets[0] || null);
  const [ticketNo, setTicketNo] = useState<string>("021233");
  const [policeNo, setPoliceNo] = useState<string>("DD 8600 AL");
  const [goodsName, setGoodsName] = useState<string>("BERAS");
  const [agency, setAgency] = useState<string>("UCU POLES");
  const [bagDeductionPercent, setBagDeductionPercent] = useState<number>(0.00);
  const [refaksiPercent, setRefaksiPercent] = useState<number>(0.00);
  const [notes, setNotes] = useState<string>("");
  
  // UI states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirm Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'ADD' | 'EDIT' | 'DELETE';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'ADD',
    onConfirm: () => {}
  });

  // WhatsApp Modal State
  const [waModalConfig, setWaModalConfig] = useState<{
    isOpen: boolean;
    defaultText: string;
    record: WeighbridgeTicket | null;
    pdfHtml?: string;
    pdfFileName?: string;
  }>({
    isOpen: false,
    defaultText: '',
    record: null
  });

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (errorMessage) {
      (window as any).__showToast?.(errorMessage, 'error');
    }
  }, [errorMessage]);
  const [printTicket, setPrintTicket] = useState<WeighbridgeTicket | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string>(() => {
    return localStorage.getItem('bilibili_staff_name') || "Asma";
  });

  useEffect(() => {
    localStorage.setItem('bilibili_staff_name', staffName);
  }, [staffName]);

  // Generate sequence No
  useEffect(() => {
    if (tickets.length > 0) {
      const highest = Math.max(...tickets.map(t => parseInt(t.ticketNo) || 0));
      setTicketNo(String(highest + 1).padStart(6, '0'));
    } else {
      setTicketNo("021233");
    }
  }, [tickets, isCreatingNew]);

  // Handle auto-updating the calculations
  const calculateNetWeight = (gross: number, tare: number, bagPct: number, refaksiPct: number): number => {
    const rawNet = gross - tare;
    if (rawNet <= 0) return 0;
    
    // Deductions
    const bagDeduction = rawNet * (bagPct / 100);
    const refaksiDeduction = rawNet * (refaksiPct / 100);
    
    const finalNet = rawNet - bagDeduction - refaksiDeduction;
    return Math.max(0, Math.round(finalNet));
  };

  // Helper values
  const currentGross = selectedTicket ? selectedTicket.timbang1Weight : 0;
  const currentTare = selectedTicket ? selectedTicket.timbang2Weight : 0;
  const computedNet = (selectedTicket || isCreatingNew || isEditing) 
    ? calculateNetWeight(
        currentGross || simulatorWeight, 
        currentTare, 
        bagDeductionPercent, 
        refaksiPercent
      )
    : 0;

  // Handle setting a draft active
  const startNewTicketDraft = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setPoliceNo("DP ");
    setGoodsName("BERAS");
    setAgency("");
    setBagDeductionPercent(0.00);
    setRefaksiPercent(0.00);
    setNotes("Timbang Masuk");
    // Generate new ticket no
    const highest = Math.max(...tickets.map(t => parseInt(t.ticketNo) || 0), 21232);
    setTicketNo(String(highest + 1).padStart(6, '0'));
    setSelectedTicket(null);
  };

  // Trigger Weigh I (Gross Weight Input)
  const handleTimbang1 = () => {
    const nowStr = new Date().toLocaleString('id-ID', { hour12: false }).replace(/\//g, '-');
    
    if (isCreatingNew) {
      if (!policeNo.trim() || policeNo === "DP ") {
        setErrorMessage(t.errorPlateRequired);
        return;
      }
      if (!agency.trim()) {
        setErrorMessage(t.errorAgencyRequired);
        return;
      }

      const executeSave = () => {
        const newTicket: WeighbridgeTicket = {
          id: `ticket-${Date.now()}`,
          ticketNo: ticketNo,
          policeNo: policeNo.toUpperCase(),
          goodsName: goodsName.toUpperCase(),
          agency: agency.toUpperCase(),
          timbang1Time: nowStr,
          timbang1Weight: simulatorWeight,
          timbang2Time: null,
          timbang2Weight: 0,
          grossWeight: simulatorWeight,
          tareWeight: 0,
          bagDeductionPercent: bagDeductionPercent,
          refaksiPercent: refaksiPercent,
          netWeight: calculateNetWeight(simulatorWeight, 0, bagDeductionPercent, refaksiPercent),
          status: 'PENDING',
          notes: notes
        };

        onAddTicket(newTicket);
        setSelectedTicket(newTicket);
        setIsCreatingNew(false);
        setErrorMessage(null);
      };

      setConfirmModal({
        isOpen: true,
        title: t.confirmAddTimbang1,
        message: `Apakah Anda yakin ingin mendaftarkan tiket timbangan baru untuk Nomor Polisi ${policeNo.toUpperCase()} dengan berat gross ${simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg?`,
        type: 'ADD',
        onConfirm: () => {
          executeSave();
          closeConfirm();
        }
      });
    } else if (selectedTicket) {
      // Re-weigh 1 for existing ticket
      const executeUpdate = () => {
        const updated: WeighbridgeTicket = {
          ...selectedTicket,
          timbang1Time: nowStr,
          timbang1Weight: simulatorWeight,
          grossWeight: simulatorWeight,
          netWeight: calculateNetWeight(simulatorWeight, selectedTicket.timbang2Weight, selectedTicket.bagDeductionPercent, selectedTicket.refaksiPercent)
        };
        onUpdateTicket(updated);
        setSelectedTicket(updated);
      };

      setConfirmModal({
        isOpen: true,
        title: t.confirmEditTimbang1,
        message: `Apakah Anda yakin ingin memperbarui data Timbang 1 untuk tiket #${selectedTicket.ticketNo}?`,
        type: 'EDIT',
        onConfirm: () => {
          executeUpdate();
          closeConfirm();
        }
      });
    }
  };

  // Trigger Weigh II (Tare Weight Input - completing shipment weight transaction)
  const handleTimbang2 = () => {
    if (!selectedTicket) {
      setErrorMessage(t.errorSelectTicket);
      return;
    }
    if (selectedTicket.status === 'COMPLETED') {
      setErrorMessage(t.errorAlreadyCompleted);
      return;
    }

    const nowStr = new Date().toLocaleString(language === 'id' ? 'id-ID' : 'en-US', { hour12: false }).replace(/\//g, '-');
    const executeTimbang2 = () => {
      const updated: WeighbridgeTicket = {
        ...selectedTicket,
        timbang2Time: nowStr,
        timbang2Weight: simulatorWeight,
        tareWeight: simulatorWeight,
        status: 'COMPLETED',
        netWeight: calculateNetWeight(
          selectedTicket.timbang1Weight,
          simulatorWeight,
          selectedTicket.bagDeductionPercent,
          selectedTicket.refaksiPercent
        )
      };
      onUpdateTicket(updated);
      setSelectedTicket(updated);
      setErrorMessage(null);
    };

    setConfirmModal({
      isOpen: true,
      title: t.confirmCompleteTimbang2,
      message: `Apakah Anda yakin ingin memproses Timbang 2 (Selesai) untuk tiket #${selectedTicket.ticketNo} dengan berat tare ${simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg?`,
      type: 'EDIT',
      onConfirm: () => {
        executeTimbang2();
        closeConfirm();
      }
    });
  };

  // Reset indicator zero
  const resetZero = () => {
    setSimulatorWeight(0);
    setCustomSimulatorInput("0");
  };

  // Apply custom weight simulation
  const applySimulatorPreset = (val: number) => {
    setSimulatorWeight(val);
    setCustomSimulatorInput(String(val));
  };

  // Handle manual input in indicator
  const handleCustomWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nr = parseNumberInput(customSimulatorInput);
    setSimulatorWeight(nr);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => 
    t.ticketNo.includes(searchQuery) || 
    t.policeNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.goodsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.agency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- EXPORT & PRINT HANDLERS ---
  const handleExportExcel = () => {
    const headers = [
      'No. Tiket', 'Waktu Timbang I', 'No. Polisi', 
      'Komoditas', 'Tujuan/Agen', 'Berat Gross (Kg)', 'Berat Tare (Kg)', 
      'Potongan Karung (%)', 'Refaksi (%)', 'Berat Netto (Kg)', 'Status', 'Catatan'
    ];
    const rows = filteredTickets.map(t => [
      t.ticketNo,
      t.timbang1Time,
      t.policeNo,
      t.goodsName,
      t.agency,
      t.timbang1Weight.toString(),
      t.timbang2Weight.toString(),
      t.bagDeductionPercent.toString(),
      t.refaksiPercent.toString(),
      t.netWeight.toString(),
      t.status,
      t.notes || ''
    ]);
    exportToCSV(headers, rows, 'Laporan_Jembatan_Timbang');
  };

  const handlePrintPDF = () => {
    const headers = [
      'No. Tiket', 'No. Polisi', 'Barang', 'Agen / Mitra', 
      'Timbang I (Gross)', 'Timbang II (Tare)', 'Netto'
    ];
    const rows = filteredTickets.map(t => [
      t.ticketNo,
      t.policeNo,
      t.goodsName,
      t.agency,
      `${t.timbang1Weight.toLocaleString('id-ID')} Kg`,
      t.timbang2Weight > 0 ? `${t.timbang2Weight.toLocaleString('id-ID')} Kg` : '-',
      `${t.netWeight.toLocaleString('id-ID')} Kg`
    ]);
    const totalNetWeight = filteredTickets.reduce((sum, t) => sum + t.netWeight, 0);
    const totalGrossWeight = filteredTickets.reduce((sum, t) => sum + t.timbang1Weight, 0);
    const summaries = [
      { label: 'Total Transaksi', value: `${filteredTickets.length} Tiket` },
      { label: 'Total Berat Kotor (Gross)', value: `${totalGrossWeight.toLocaleString('id-ID')} Kg` },
      { label: 'Total Netto Bersih', value: `${totalNetWeight.toLocaleString('id-ID')} Kg` }
    ];
    printPDFReport('Laporan Jembatan Timbang Seng', headers, rows, summaries);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="weighbridge-main font-sans">
      
      {/* 1. PHYSICAL HARWARE INDICATOR EMULATOR (GST-9700) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-neutral-800 border-4 border-neutral-700 rounded-xl p-4 shadow-xl text-white">
          <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-3">
            <span className="font-mono text-sm tracking-wider font-bold text-neutral-400">GSC GST-9700</span>
            <span className="text-xs bg-red-600 font-bold px-2 py-0.5 rounded animate-pulse">{t.weighingIndicator}</span>
          </div>

          {/* LED Display screen */}
          <div className="bg-black border-2 border-neutral-900 rounded-lg p-6 flex flex-col items-end relative overflow-hidden shadow-inner my-2">
            <div className="absolute top-2 left-3 flex gap-2">
              <span className={`w-2 h-2 rounded-full ${simulatorWeight > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-red-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">{t.stable}</span>
              <span className={`w-2 h-2 rounded-full ${simulatorWeight === 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-green-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">{t.zero}</span>
            </div>
            
            {/* LARGE SEVEN SEGMENT RESEMBLANCE */}
            <div className="text-red-500 font-mono text-5xl font-extrabold tracking-widest leading-none drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
              {simulatorWeight.toLocaleString('id-ID')}
            </div>
            <div className="text-red-400 font-mono text-sm mt-1">kg</div>
          </div>

          {/* Controls to Mock physical setup weights for the computer */}
          <div className="mt-4">
            <label className="block text-xs font-mono text-neutral-400 mb-1 font-bold">{t.activeWeightSimulator}</label>
            <form onSubmit={handleCustomWeightSubmit} className="flex gap-2">
              <input 
                type="text"
                value={formatNumberInput(customSimulatorInput)}
                onChange={(e) => setCustomSimulatorInput(e.target.value)}
                className="bg-neutral-900 border border-neutral-600 text-red-400 font-mono text-center text-lg rounded px-2 py-1 flex-1 focus:outline-none focus:border-red-500"
              />
              <button 
                type="submit" 
                className="bg-red-700 hover:bg-red-600 font-mono px-3 py-1 text-sm rounded font-bold transition"
              >
                {t.apply}
              </button>
            </form>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button onClick={() => applySimulatorPreset(3560)} className="bg-neutral-700 hover:bg-neutral-600 font-mono py-1 rounded text-xs">
              3,560 kg (Beras)
            </button>
            <button onClick={() => applySimulatorPreset(14650)} className="bg-neutral-700 hover:bg-neutral-600 font-mono py-1 rounded text-xs">
              14,650 kg (Truk)
            </button>
            <button onClick={() => applySimulatorPreset(4250)} className="bg-neutral-700 hover:bg-neutral-600 font-mono py-1 rounded text-xs">
              4,250 kg (Empty)
            </button>
            <button onClick={() => applySimulatorPreset(12450)} className="bg-neutral-700 hover:bg-neutral-600 font-mono py-1 rounded text-xs">
              12,450 kg (Gross)
            </button>
            <button onClick={() => applySimulatorPreset(3900)} className="bg-neutral-700 hover:bg-neutral-600 font-mono py-1 rounded text-xs">
              3,900 kg (Empty)
            </button>
            <button onClick={resetZero} className="bg-neutral-950 hover:bg-neutral-900 text-red-500 font-bold border border-red-950 font-mono py-1 rounded text-xs leading-none">
              {t.zeroScale}
            </button>
          </div>

          <p className="text-[10px] font-mono text-neutral-400 italic text-center mt-3 bg-neutral-900 px-2 py-1 rounded">
            💡 {t.simulatorInstruction}
          </p>
        </div>

        {/* Action Controls for terminal */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-sm text-neutral-800 mb-3 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <Scale className="text-emerald-500 w-4 h-4" />
            {t.operationalButtons}
          </h3>
          <div className="flex flex-col gap-2">
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
                >
                  <XCircle className="w-4 h-4" />
                  BATAL EDIT
                </button>
              ) : (
                <button
                  onClick={startNewTicketDraft}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    isCreatingNew 
                      ? 'bg-neutral-200 text-neutral-600' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  {t.startNewWeighing}
                </button>
              )}

            <button
              onClick={handleTimbang1}
              disabled={!isCreatingNew && !selectedTicket}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {isCreatingNew ? t.saveWeighing1 : t.reweigh1}
            </button>

            <button
              onClick={handleTimbang2}
              disabled={isCreatingNew || !selectedTicket || selectedTicket?.status === 'COMPLETED'}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {t.completeWeighing2}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CRT COMPUTER MONITOR terminal (APLIKASI JEMBATAN TIMBANG) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Terminal Header */}
        <div className="bg-neutral-900 border border-neutral-800 text-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#121c32] px-4 py-2 border-b border-[#254271] flex justify-between items-center">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3bbfc6]" />
              <span className="font-mono text-xs text-[#8cbef6] font-bold tracking-widest uppercase">
                {t.weighingAppTitle}
              </span>
            </div>
          </div>

          {/* Inner Blue Terminal Display Screen to match image exactly! */}
          <div className="bg-[#1e345e] p-6 font-mono text-[#efefef] relative min-h-[420px] transition-all flex flex-col justify-between">
            
            {/* Screen static and vignette styles */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-30" />
            
            {/* Header labels */}
            <div className="flex justify-between items-start border-b border-[#2d4d8c] pb-2 mb-4">
              <div>
                <div className="text-xs text-[#a0c5fc]">{t.techSupport}</div>
                <div className="text-xs text-[#a0c5fc]">{t.weighingTransaction}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#a0c5fc]">{t.weighingAppTitle}</div>
                <div className="text-xs text-[#a0c5fc]">Rec #: <span className="text-yellow-300">{selectedTicket ? selectedTicket.ticketNo : '000000'} / 19813</span></div>
              </div>
            </div>

            {/* Display Indicator in the terminal */}
            <div className="bg-neutral-950 border border-[#2d4d8c] p-3 rounded mb-4 flex justify-between items-center relative">
              <span className="text-[#a0c5fc] text-xs">{t.currentWeight}</span>
              <div className="text-right flex items-baseline gap-2">
                <span className="text-green-400 font-mono text-4xl font-black relative z-10 font-mono">
                  {simulatorWeight.toLocaleString('id-ID')}
                </span>
                <span className="text-green-400 text-sm">kg</span>
              </div>
              
              {/* Out of range simulation popup like in picture */}
              {simulatorWeight > 42000 && (
                <div className="absolute inset-0 bg-neutral-900/90 flex items-center justify-center border border-red-500 z-20">
                  <span className="bg-red-950 text-red-500 border border-red-500 text-xs px-4 py-1.5 font-bold animate-pulse">
                    {t.overweightWarning}
                  </span>
                </div>
              )}
            </div>

            {/* Ticket Information form panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 relative z-10 text-sm">
              
              {/* Left Column Fields */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">{t.ticketNumberLabel}</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {(isCreatingNew || isEditing) ? (
                    <input 
                      type="text" 
                      value={ticketNo} 
                      onChange={(e) => setTicketNo(e.target.value)}
                      className="bg-[#122345] border border-[#2d4d8c] text-yellow-300 font-semibold px-2 py-0.5 rounded text-sm w-36 outline-none focus:border-yellow-400"
                    />
                  ) : (
                    <span className="text-yellow-300 font-bold">{selectedTicket ? selectedTicket.ticketNo : '-'}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">{t.plateNumberLabel}</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {(isCreatingNew || isEditing) ? (
                    <>
                      <input 
                        type="text" 
                        value={policeNo} 
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPoliceNo(val);
                          if (isCreatingNew) {
                            const matched = vehicles.find(v => v.policeNo === val);
                            if (matched && matched.driverName) {
                              setNotes(prev => prev ? prev : `Sopir: ${matched.driverName} (${matched.vehicleType})`);
                            }
                          }
                        }}
                        className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-2 py-0.5 rounded text-sm w-36 outline-none focus:border-yellow-400"
                        placeholder="DP 8600 AL"
                        list="master-vehicles"
                      />
                      <datalist id="master-vehicles">
                        {vehicles.map(v => (
                          <option key={v.id} value={v.policeNo}>{v.driverName} &bull; {v.vehicleType} (Tara: {v.tareWeight}kg)</option>
                        ))}
                      </datalist>
                    </>
                  ) : (
                    <span className="text-[#efefef] font-semibold">{selectedTicket ? selectedTicket.policeNo : '-'}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">{t.goodsNameLabel}</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {(isCreatingNew || isEditing) ? (
                    <select 
                      value={goodsName} 
                      onChange={(e) => setGoodsName(e.target.value)}
                      className="bg-[#122345] border border-[#2d4d8c] text-yellow-300 px-2 py-0.5 rounded text-sm w-36 cursor-pointer focus:border-yellow-400"
                    >
                      <option value="BERAS">BERAS</option>
                      <option value="JAGUNG">JAGUNG</option>
                      <option value="GABAH">GABAH</option>
                      <option value="AMPAZ">AMPAZ</option>
                      <option value="POLESAN">POLESAN</option>
                    </select>
                  ) : (
                    <span className="text-yellow-300 font-semibold">{selectedTicket ? selectedTicket.goodsName : '-'}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">{t.agencyLabel}</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {(isCreatingNew || isEditing) ? (
                    <>
                      <input 
                        type="text" 
                        value={agency} 
                        onChange={(e) => setAgency(e.target.value.toUpperCase())}
                        className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-2 py-0.5 rounded text-sm flex-1 outline-none focus:border-yellow-400"
                        placeholder="Contoh: UCU POLES"
                        list="master-agencies"
                      />
                      <datalist id="master-agencies">
                        {buyers.map(b => (
                          <option key={b.id} value={b.name}>{b.address}</option>
                        ))}
                        {suppliers.map(s => (
                          <option key={s.id} value={s.name}>Supplier &bull; {s.address}</option>
                        ))}
                      </datalist>
                    </>
                  ) : (
                    <span className="text-[#efefef]">{selectedTicket ? selectedTicket.agency : '-'}</span>
                  )}
                </div>

                <div className="border-t border-[#2d4d8c]/60 my-1 pt-1">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>{t.weigh1Label}</span>
                    <span className="text-emerald-400">{selectedTicket ? `${selectedTicket.timbang1Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` : '0 kg'}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ({selectedTicket ? selectedTicket.timbang1Time : '-'})
                  </div>
                </div>

                <div className="pt-0.5">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>{t.weigh2Label}</span>
                    <span className="text-orange-400">
                      {selectedTicket && selectedTicket.timbang2Time ? `${selectedTicket.timbang2Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` : '-'}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ({selectedTicket && selectedTicket.timbang2Time ? selectedTicket.timbang2Time : '- -'})
                  </div>
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#a0c5fc]">{t.grossWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-yellow-300 font-bold">{selectedTicket ? selectedTicket.grossWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0c5fc]">{t.tareWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-[#efefef]">{selectedTicket ? selectedTicket.tareWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-[#2d4d8c]/60 pb-1.5">
                  <span className="text-[#a0c5fc]">{t.bagDeductionLabel}</span>
                  <div className="flex items-center">
                    {(isCreatingNew || isEditing) ? (
                      <input 
                        type="number" 
                        step="0.01"
                        value={bagDeductionPercent} 
                        onChange={(e) => setBagDeductionPercent(parseFloat(e.target.value) || 0)}
                        className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-1 py-0.5 rounded text-xs w-16 text-center outline-none focus:border-yellow-400"
                      />
                    ) : (
                      <span className="text-[#efefef] font-mono">{selectedTicket ? selectedTicket.bagDeductionPercent.toFixed(2) : '0.00'}</span>
                    )}
                    <span className="text-neutral-400 text-xs ml-1">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-[#2d4d8c]/60 pb-1.5">
                  <span className="text-[#a0c5fc]">{t.refaksiLabel}</span>
                  <div className="flex items-center">
                    {(isCreatingNew || isEditing) ? (
                      <input 
                        type="number" 
                        step="0.1"
                        value={refaksiPercent} 
                        onChange={(e) => setRefaksiPercent(parseFloat(e.target.value) || 0)}
                        className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-1 py-0.5 rounded text-xs w-16 text-center outline-none focus:border-yellow-400"
                      />
                    ) : (
                      <span className="text-[#efefef] font-mono">{selectedTicket ? selectedTicket.refaksiPercent.toFixed(2) : '0.00'}</span>
                    )}
                    <span className="text-neutral-400 text-xs ml-1">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#a0c5fc] font-bold text-sm">{t.netWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-green-400 font-extrabold text-xl font-mono">{selectedTicket ? computedNet.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-green-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-xs text-[#a0c5fc] block mb-1">{t.notesLabel} :</span>
                  {(isCreatingNew || isEditing) ? (
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] p-1.5 rounded text-xs w-full h-12 outline-none focus:border-yellow-400 resize-none"
                      placeholder={t.notesPlaceholder}
                    />
                  ) : (
                    <p className="text-xs text-neutral-300 italic max-h-12 overflow-y-auto bg-[#1a2b4b]/80 p-1 rounded border border-[#2d4d8c]/30">
                      {selectedTicket?.notes || t.noNotes}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Error Message bar */}
            {errorMessage && (
              <div className="bg-red-950/80 text-red-300 border border-red-500 rounded p-2 text-xs flex items-center gap-2 mt-4 relative z-10">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="ml-auto font-bold text-red-400 hover:text-red-200">×</button>
              </div>
            )}

            {/* Simulated Keyboard Status bar at bottom */}
            <div className="border-t-2 border-[#2d4d8c] pt-2 mt-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                  <label className="text-[9px] text-[#a0c5fc] font-bold uppercase tracking-widest">Nama Petugas / Staff 162</label>
                  <input 
                    type="text" 
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="bg-[#122345] border border-[#2d4d8c] text-emerald-400 font-bold px-3 py-1 text-xs rounded outline-none focus:border-emerald-500"
                    placeholder="Nama Staff..."
                    list="master-staff"
                  />
                  <datalist id="master-staff">
                    <option value="Asma" />
                    {employees.filter(e => e.role === 'PETUGAS' || e.role === 'KARYAWAN').map(e => (
                      <option key={e.id} value={e.name}>{e.role}</option>
                    ))}
                  </datalist>
                </div>

                {isEditing && (
                  <button 
                    onClick={() => {
                      if (selectedTicket) {
                        const updated: WeighbridgeTicket = {
                          ...selectedTicket,
                          ticketNo,
                          policeNo: policeNo.toUpperCase(),
                          goodsName: goodsName.toUpperCase(),
                          agency: agency.toUpperCase(),
                          bagDeductionPercent,
                          refaksiPercent,
                          notes,
                          netWeight: calculateNetWeight(selectedTicket.timbang1Weight, selectedTicket.timbang2Weight, bagDeductionPercent, refaksiPercent)
                        };
                        onUpdateTicket(updated);
                        setSelectedTicket(updated);
                        setIsEditing(false);
                      }
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold px-4 py-1.5 rounded transition shadow-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 inline mr-1" /> SIMPAN PERUBAHAN
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 md:gap-x-4 text-[10px] text-cyan-200 justify-center border-t border-[#2d4d8c]/40 pt-2">
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F2-Timbang1</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F3-Timbang2</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F4-Koreksi</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F5-Hapus</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F6-Cari</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F7-List</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c] text-yellow-300 font-bold cursor-pointer" onClick={() => selectedTicket && setPrintTicket(selectedTicket)}>F8-Cetak Slip</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TICKET ARCHIVE AND LIST */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2 shrink-0">
              <Scale className="text-emerald-500 w-5 h-5" />
              {t.ticketArchiveTitle} ({filteredTickets.length})
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
              <button
                onClick={handleExportExcel}
                title="Unduh seluruh daftar rekap jembatan timbang ke format Microsoft Excel"
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> {t.exportExcel}
              </button>
              <button
                onClick={handlePrintPDF}
                title="Cetak Laporan atau simpan sebagai dokumen PDF"
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> {t.printReportsPDF}
              </button>
              
              <div className="relative w-full sm:w-48 shrink-0">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t.searchTicketPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-emerald-600 focus:bg-white font-semibold text-neutral-700"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">{t.ticketNoHeader}</th>
                  <th className="py-2.5 px-3">{t.plateNoHeader}</th>
                  <th className="py-2.5 px-3">{t.goodsHeader}</th>
                  <th className="py-2.5 px-3">{t.agencyHeader}</th>
                  <th className="text-right py-2.5 px-3">{t.weigh1KgHeader}</th>
                  <th className="text-right py-2.5 px-3">{t.weigh2KgHeader}</th>
                  <th className="text-right py-2.5 px-3">{t.netKgHeader}</th>
                  <th className="text-center py-2.5 px-3">{t.statusHeader}</th>
                  <th className="text-center py-2.5 px-3">{t.actionHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); setIsCreatingNew(false); }}
                    className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                      selectedTicket?.id === ticket.id ? 'bg-emerald-50/50 font-medium text-neutral-900 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                      {ticket.ticketNo}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">
                      {ticket.policeNo}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {ticket.goodsName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800">{ticket.agency}</td>
                    <td className="text-right py-2.5 px-3 font-mono">{ticket.timbang1Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                    <td className="text-right py-2.5 px-3 font-mono text-orange-600">
                      {ticket.timbang2Weight > 0 ? ticket.timbang2Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '-'}
                    </td>
                    <td className="text-right py-2.5 px-3 font-bold font-mono text-emerald-600">
                      {(ticket.timbang2Weight > 0 
                        ? calculateNetWeight(ticket.timbang1Weight, ticket.timbang2Weight, ticket.bagDeductionPercent, ticket.refaksiPercent) 
                        : ticket.timbang1Weight
                      ).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'
                      }`}>
                        {ticket.status === 'COMPLETED' ? t.completedBadge : t.waitingBadge}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => {
                            setIsCreatingNew(false);
                            setIsEditing(true);
                            setSelectedTicket(ticket);
                            setTicketNo(ticket.ticketNo);
                            setPoliceNo(ticket.policeNo);
                            setGoodsName(ticket.goodsName);
                            setAgency(ticket.agency);
                            setBagDeductionPercent(ticket.bagDeductionPercent);
                            setRefaksiPercent(ticket.refaksiPercent);
                            setNotes(ticket.notes || '');
                          }} 
                          title="Edit Data Tiket"
                          className="p-1 text-neutral-400 hover:text-blue-600 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setPrintTicket(ticket)} 
                          title="Cetak Tiket"
                          className="p-1 text-neutral-400 hover:text-emerald-600 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setWaModalConfig({ 
                            isOpen: true, 
                            defaultText: buildWeighbridgeWAText(ticket), 
                            record: ticket,
                            pdfHtml: getHTMLForPDF(printSlip, ticket, staffName),
                            pdfFileName: `Resi_Timbang_${ticket.ticketNo}.pdf`
                          })} 
                          title="Kirim Tiket via WA"
                          className="p-1 text-neutral-400 hover:text-emerald-600 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "Konfirmasi Hapus Tiket",
                              message: `Apakah Anda yakin ingin menghapus tiket jembatan timbang #${ticket.ticketNo} (${ticket.policeNo}) secara permanen?`,
                              type: 'DELETE',
                              onConfirm: () => {
                                onDeleteTicket(ticket.id);
                                closeConfirm();
                              }
                            });
                          }}
                          title="Hapus Tiket"
                          className="p-1 text-neutral-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-neutral-400 italic">
                      {t.noTicketsFound}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. PRINT SLIP SIMULATION OVERLAY MODAL */}
      <AnimatePresence>
        {printTicket && (
          <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-neutral-300 rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <Printer className="text-emerald-600 w-5 h-5" />
                  {t.printSlipPreview}
                </span>
                <button 
                  onClick={() => setPrintTicket(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                >
                  ✕
                </button>
              </div>

              {/* Realistic thermal slip slip paper component */}
              <div className="bg-neutral-50 p-4 border border-dashed border-neutral-300 rounded font-mono text-[11px] text-neutral-800 leading-relaxed shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-2 mb-2">
                  <div className="font-bold text-sm tracking-widest text-emerald-950">{t.thermalSlipHeader}</div>
                  <div className="text-[9px]">{t.thermalSlipAddress}</div>
                  <div className="text-[9px]">{t.thermalSlipCity}</div>
                  <div className="text-[9px] mt-0.5">{t.thermalSlipPhone}</div>
                </div>

                <div className="flex justify-between">
                  <span>Tanggal :</span>
                  <span className="font-bold font-mono">{formatReceiptDate(printTicket.timbang1Time || printTicket.timbang2Time)}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket :</span>
                  <span className="font-bold font-mono">{printTicket.ticketNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Polisi:</span>
                  <span className="font-bold">{printTicket.policeNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mitra/Agen:</span>
                  <span className="font-semibold">{printTicket.agency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nama Barang:</span>
                  <span className="font-semibold">{printTicket.goodsName}</span>
                </div>
                
                <div className="border-t border-neutral-300 my-2 pt-2" />

                <div className="flex justify-between font-bold">
                  <span>{t.weigh1Label} ({language === 'id' ? 'Masuk' : 'Inbound'})</span>
                  <span>{printTicket.timbang1Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg</span>
                </div>
                <div className="text-[10px] text-neutral-500 text-right">
                  {printTicket.timbang1Time}
                </div>

                <div className="flex justify-between font-bold mt-1">
                  <span>{t.weigh2Label} ({language === 'id' ? 'Keluar' : 'Outbound'})</span>
                  <span>{printTicket.timbang2Weight > 0 ? `${printTicket.timbang2Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg` : '- -'}</span>
                </div>
                {printTicket.timbang2Time && (
                  <div className="text-[10px] text-neutral-500 text-right">
                    {printTicket.timbang2Time}
                  </div>
                )}

                <div className="border-t border-neutral-300 my-2 pt-2" />

                <div className="flex justify-between">
                  <span>{t.grossWeightLabel.toUpperCase()} :</span>
                  <span>{(printTicket.timbang1Weight).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.tareWeightLabel.toUpperCase()} :</span>
                  <span>{printTicket.tareWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Pot. Karung ({printTicket.bagDeductionPercent.toFixed(2)}%):</span>
                  <span>- {Math.round((printTicket.grossWeight - printTicket.tareWeight) * (printTicket.bagDeductionPercent/100))} kg</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Pot. Refaksi ({printTicket.refaksiPercent.toFixed(2)}%):</span>
                  <span>- {Math.round((printTicket.grossWeight - printTicket.tareWeight) * (printTicket.refaksiPercent/100))} kg</span>
                </div>

                <div className="border-b-2 border-double border-neutral-400 my-2" />

                <div className="flex justify-between font-extrabold text-sm text-emerald-950">
                  <span>{t.netWeightLabel.toUpperCase()} :</span>
                  <span>{calculateNetWeight(printTicket.timbang1Weight, printTicket.timbang2Weight, printTicket.bagDeductionPercent, printTicket.refaksiPercent).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} KG</span>
                </div>

                {printTicket.notes && (
                  <div className="mt-3 text-[10px] text-neutral-600 bg-white p-1 rounded border border-neutral-200">
                    <strong>Catatan:</strong> {printTicket.notes}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center mt-6 text-[9px]">
                    <div>
                      <p className="mb-8">{t.riceStockTitle === 'Rincian Stok Beras' ? 'Penerima Staff 162' : 'Staff 162'}</p>
                      <p className="border-t border-neutral-400 pt-1 font-bold">{staffName}</p>
                    </div>
                  <div>
                    <p className="mb-8">Sopir / Pembawa</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                  </div>
                </div>

                <div className="text-center text-[8px] text-neutral-400 mt-4 border-t border-neutral-200 pt-2 italic">
                  * Terimakasih atas kerjasamanya *<br />
                  Aplikasi Timbangan GSC GST-9700 Jembatan Timbang v2.0
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    printSlip(printTicket, staffName);
                    setPrintTicket(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Slip (Printer)
                </button>
                <button
                  onClick={() => setPrintTicket(null)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL OVERLAY */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

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
