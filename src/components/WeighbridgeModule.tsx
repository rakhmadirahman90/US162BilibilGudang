/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WeighbridgeTicket, VehicleRecord, BuyerRecord, SupplierRecord, EmployeeRecord } from '../types';
import { Scale, Printer, Search, PlusCircle, RotateCcw, AlertCircle, FileText, Check, Trash2, Edit2, Edit3, Download, Clock, ChevronRight, Truck, Save, XCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { exportToCSV, printPDFReport, printSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildWeighbridgeWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { formatNumberInput, parseNumberInput, formatReceiptDate } from '../utils/format';
import SmartNumberInput from './SmartNumberInput';
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
  const [simulatorWeight, setSimulatorWeight] = useState<number>(0);
  const [customSimulatorInput, setCustomSimulatorInput] = useState<string>("0");
  
  // Web Serial API states for Physical Scale GSC GST-9700
  const [isSerialSupported, setIsSerialSupported] = useState<boolean>(false);
  const [isSerialConnected, setIsSerialConnected] = useState<boolean>(false);
  const [serialBaudRate, setSerialBaudRate] = useState<number>(9600);
  const [serialError, setSerialError] = useState<string | null>(null);
  const [lastRawSerialData, setLastRawSerialData] = useState<string>("");

  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  useEffect(() => {
    setIsSerialSupported('serial' in navigator);
    return () => {
      // Cleanup on unmount
      keepReadingRef.current = false;
      if (serialReaderRef.current) {
        try {
          serialReaderRef.current.cancel().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  /**
   * Extract weight value from clean ASCII string frame
   */
  const extractWeightValueFromCleanStr = (clean: string): number | null => {
    if (!clean) return null;

    // Pattern 1: GST-9700 / GSC / Toledo / CAS standard prefix e.g. "ST,GS,+011330kg", "US,GS,  005420"
    const gscMatches = Array.from(clean.matchAll(/(?:ST|US|WN|WW|GS|NT|OL|QT|TR|GR)[,\s:=]*([+-]?\s*\d+(?:\.\d+)?)\s*(?:kg|t|g)?/gi));
    if (gscMatches.length > 0) {
      const lastMatch = gscMatches[gscMatches.length - 1];
      if (lastMatch && lastMatch[1]) {
        const val = parseFloat(lastMatch[1].replace(/\s+/g, ''));
        if (!isNaN(val) && val >= 0) {
          return formatParsedWeightVal(val, clean);
        }
      }
    }

    // Pattern 2: Signed numbers e.g. "+011330", "=005420", "-000000", ":011330"
    const signedMatches = Array.from(clean.matchAll(/[\+\=\:\#]\s*(\d+(?:\.\d+)?)/g));
    if (signedMatches.length > 0) {
      const lastMatch = signedMatches[signedMatches.length - 1];
      if (lastMatch && lastMatch[1]) {
        const val = parseFloat(lastMatch[1]);
        if (!isNaN(val) && val >= 0) {
          return formatParsedWeightVal(val, clean);
        }
      }
    }

    // Pattern 3: Yaohua / GSC reverse string format e.g. "033110+" (11330+)
    const reverseMatches = Array.from(clean.matchAll(/\b(\d{4,7})[\+\=\-]/g));
    if (reverseMatches.length > 0) {
      const lastMatch = reverseMatches[reverseMatches.length - 1];
      if (lastMatch && lastMatch[1]) {
        const revDigits = lastMatch[1].split('').reverse().join('');
        const val = parseFloat(revDigits);
        if (!isNaN(val) && val >= 0) {
          return formatParsedWeightVal(val, clean);
        }
      }
    }

    // Pattern 4: Standalone numbers with length 3 to 7 digits (e.g., 11330, 5420, 11.330)
    const digitMatches = Array.from(clean.matchAll(/\b\d{3,7}(?:\.\d+)?\b/g));
    if (digitMatches.length > 0) {
      const lastMatch = digitMatches[digitMatches.length - 1];
      const val = parseFloat(lastMatch[0]);
      if (!isNaN(val) && val >= 0) {
        return formatParsedWeightVal(val, clean);
      }
    }

    // Pattern 5: Any digits fallback
    const anyMatches = Array.from(clean.matchAll(/\d+(?:\.\d+)?/g));
    if (anyMatches.length > 0) {
      const lastMatch = anyMatches[anyMatches.length - 1];
      const val = parseFloat(lastMatch[0]);
      if (!isNaN(val) && val >= 0) {
        return formatParsedWeightVal(val, clean);
      }
    }

    return null;
  };

  /**
   * Helper function to robustly parse weight packets from physical GST-9700/GSC weighing indicators
   */
  const parseSerialIndicatorBuffer = (rawBuffer: string): { weight: number | null; rawFrame: string; remainingBuffer: string } => {
    if (!rawBuffer) return { weight: null, rawFrame: "", remainingBuffer: "" };

    let buffer = rawBuffer;
    if (buffer.length > 2000) {
      buffer = buffer.slice(-1000);
    }

    // Split by standard line and ASCII control boundaries (CR \r, LF \n, STX \x02, ETX \x03, EOT \x04, ESC \x1b)
    const rawTokens = buffer.split(/[\r\n\x02\x03\x04\x1b;,]+/);
    const hasEndingDelimiter = /[\r\n\x02\x03\x04\x1b;,]$/.test(buffer);
    
    const completeFrames = hasEndingDelimiter ? rawTokens : rawTokens.slice(0, -1);
    let remainingBuffer = hasEndingDelimiter ? "" : (rawTokens[rawTokens.length - 1] || "");

    let detectedWeight: number | null = null;
    let lastRawFrame = "";

    // 1. Check complete frames from newest to oldest
    for (let i = completeFrames.length - 1; i >= 0; i--) {
      const raw = completeFrames[i];
      const clean = raw.replace(/[^\x20-\x7E]/g, '').trim();
      if (!clean) continue;

      const val = extractWeightValueFromCleanStr(clean);
      if (val !== null) {
        detectedWeight = val;
        lastRawFrame = clean;
        break;
      }
    }

    // 2. Fallback check on full buffer or remainingBuffer directly
    if (detectedWeight === null) {
      const cleanAll = buffer.replace(/[^\x20-\x7E]/g, '').trim();
      const val = extractWeightValueFromCleanStr(cleanAll);
      if (val !== null) {
        detectedWeight = val;
        lastRawFrame = cleanAll;
        remainingBuffer = ""; // Reset buffer since we successfully extracted the weight
      }
    }

    if (remainingBuffer.length > 100) {
      remainingBuffer = "";
    }

    return { weight: detectedWeight, rawFrame: lastRawFrame, remainingBuffer };
  };

  const formatParsedWeightVal = (val: number, cleanFrame: string): number => {
    if (/t\b/i.test(cleanFrame) || (val > 0 && val < 200 && cleanFrame.includes('.'))) {
      return Math.round(val * 1000);
    }
    return Math.round(val);
  };

  const connectSerial = async () => {
    setSerialError(null);
    try {
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera versi desktop terbaru.");
      }

      const port = await (navigator as any).serial.requestPort();
      
      // Open with full hardware RS-232 options
      await port.open({
        baudRate: serialBaudRate,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        flowControl: "none",
        bufferSize: 2048,
      });

      // Assert RTS/DTR hardware signals for USB-to-Serial RS232 converters
      try {
        await port.setSignals({ dataTerminalReady: true, requestToSend: true });
      } catch (e) {
        console.warn("Hardware signals not supported or unnecessary on this port:", e);
      }
      
      serialPortRef.current = port;
      setIsSerialConnected(true);
      keepReadingRef.current = true;
      
      (window as any).__showToast?.("🔌 TERHUBUNG: Indikator Timbangan Fisik GST-9700 tersambung via COM3! Berat aktual akan otomatis tersinkron ke layar.", "success");

      // Start reading stream asynchronously
      readSerialData(port);
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "Gagal membuka port serial";
      if (err.name === 'SecurityError' || errorMsg.includes('Permissions policy') || errorMsg.includes('policy') || errorMsg.includes('disallowed')) {
        errorMsg = "⚠️ AKSES DIBLOKIR: Akses perangkat keras serial ditolak oleh kebijakan keamanan frame Google AI Studio. Silakan klik tombol 'Buka di Tab Baru' ↗️ di pojok kanan atas preview agar aplikasi dapat berkomunikasi langsung dengan timbangan fisik GST-9700 Anda.";
        setSerialError(errorMsg);
        (window as any).__showToast?.(errorMsg, "error");
      } else if (err.name === 'NotFoundError' || errorMsg.includes('No port selected') || errorMsg.includes('no port selected') || errorMsg.includes('canceled') || errorMsg.includes('cancelled')) {
        errorMsg = "ℹ️ PEMBERITAHUAN: Pemilihan port serial dibatalkan oleh pengguna.";
        setSerialError(null);
        (window as any).__showToast?.(errorMsg, "info");
      } else {
        errorMsg = `❌ KESALAHAN KONEKSI: Gagal membuka koneksi serial (${errorMsg}). Pastikan kabel RS-232 indikator GST-9700 tersambung dengan benar ke USB PC/Laptop Anda, port COM tidak sedang digunakan aplikasi lain, dan indikator dalam kondisi menyala.`;
        setSerialError(errorMsg);
        (window as any).__showToast?.(errorMsg, "error");
      }
      setIsSerialConnected(false);
    }
  };

  const readSerialData = async (port: any) => {
    try {
      const reader = port.readable.getReader();
      serialReaderRef.current = reader;
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          buffer += chunkStr;

          const { weight, rawFrame, remainingBuffer } = parseSerialIndicatorBuffer(buffer);
          buffer = remainingBuffer;

          if (rawFrame) {
            setLastRawSerialData(rawFrame);
          }

          if (weight !== null) {
            setSimulatorWeight(weight);
            setCustomSimulatorInput(String(weight));
          }
        }
      }
    } catch (err) {
      console.error("Error reading serial stream:", err);
    } finally {
      setIsSerialConnected(false);
    }
  };

  const disconnectSerial = async () => {
    keepReadingRef.current = false;
    if (serialReaderRef.current) {
      try {
        await serialReaderRef.current.cancel();
      } catch (e) {}
      serialReaderRef.current = null;
    }
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {}
      serialPortRef.current = null;
    }
    setIsSerialConnected(false);
    (window as any).__showToast?.("🔌 KONEKSI DIPUTUSKAN: Hubungan dengan timbangan fisik GST-9700 telah dinonaktifkan secara aman.", "info");
  };
  
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
  const calculateNetWeight = (w1: number, w2: number, bagPct: number, refaksiPct: number): number => {
    // If we only have Timbang 1 done (w2 is 0)
    if (!w2 || w2 === 0) {
      const rawNet = w1;
      if (rawNet <= 0) return 0;
      
      const bagDeduction = rawNet * (bagPct / 100);
      const refaksiDeduction = rawNet * (refaksiPct / 100);
      
      const finalNet = rawNet - bagDeduction - refaksiDeduction;
      return Math.max(0, Math.round(finalNet));
    }
    
    // When both weights exist, we determine the payload cargo weight as the absolute difference.
    // Gross is the larger weight (loaded truck), Tare is the smaller weight (empty truck).
    const gross = Math.max(w1, w2);
    const tare = Math.min(w1, w2);
    const rawNet = gross - tare;
    if (rawNet <= 0) return 0;
    
    // Deductions
    const bagDeduction = rawNet * (bagPct / 100);
    const refaksiDeduction = rawNet * (refaksiPct / 100);
    
    const finalNet = rawNet - bagDeduction - refaksiDeduction;
    return Math.max(0, Math.round(finalNet));
  };

  // Helper values
  const computedNet = (selectedTicket || isCreatingNew || isEditing) 
    ? calculateNetWeight(
        selectedTicket ? selectedTicket.timbang1Weight : simulatorWeight, 
        selectedTicket ? (selectedTicket.timbang2Weight > 0 ? selectedTicket.timbang2Weight : simulatorWeight) : 0, 
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
        const w1 = simulatorWeight;
        const w2 = selectedTicket.timbang2Weight;
        const actualGross = w2 > 0 ? Math.max(w1, w2) : w1;
        const actualTare = w2 > 0 ? Math.min(w1, w2) : 0;
        
        const updated: WeighbridgeTicket = {
          ...selectedTicket,
          timbang1Time: nowStr,
          timbang1Weight: w1,
          grossWeight: actualGross,
          tareWeight: actualTare,
          netWeight: calculateNetWeight(w1, w2, selectedTicket.bagDeductionPercent, selectedTicket.refaksiPercent)
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
      const w1 = selectedTicket.timbang1Weight;
      const w2 = simulatorWeight;
      const actualGross = Math.max(w1, w2);
      const actualTare = Math.min(w1, w2);

      const updated: WeighbridgeTicket = {
        ...selectedTicket,
        timbang2Time: nowStr,
        timbang2Weight: w2,
        grossWeight: actualGross,
        tareWeight: actualTare,
        status: 'COMPLETED',
        netWeight: calculateNetWeight(
          w1,
          w2,
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
      message: `Apakah Anda yakin ingin memproses Timbang 2 (Selesai) untuk tiket #${selectedTicket.ticketNo} dengan berat tare ${(simulatorWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg?`,
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
      `${(t.timbang1Weight ?? 0).toLocaleString('id-ID')} Kg`,
      (t.timbang2Weight ?? 0) > 0 ? `${(t.timbang2Weight ?? 0).toLocaleString('id-ID')} Kg` : '-',
      `${(t.netWeight ?? 0).toLocaleString('id-ID')} Kg`
    ]);
    const totalNetWeight = filteredTickets.reduce((sum, t) => sum + (t.netWeight ?? 0), 0);
    const totalGrossWeight = filteredTickets.reduce((sum, t) => sum + (t.timbang1Weight ?? 0), 0);
    const summaries = [
      { label: 'Total Transaksi', value: `${filteredTickets.length} Tiket` },
      { label: 'Total Berat Kotor (Gross)', value: `${(totalGrossWeight ?? 0).toLocaleString('id-ID')} Kg` },
      { label: 'Total Netto Bersih', value: `${(totalNetWeight ?? 0).toLocaleString('id-ID')} Kg` }
    ];
    printPDFReport('Laporan Jembatan Timbang Seng', headers, rows, summaries);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans" id="weighbridge-main">
      
      {/* 1. PHYSICAL HARWARE INDICATOR EMULATOR (GST-9700) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-neutral-800 border-4 border-neutral-700 rounded-xl p-4 shadow-xl text-white">
          <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-3">
            <span className="font-mono text-sm tracking-wider font-bold text-neutral-400">GSC GST-9700</span>
            <span className="text-xs bg-red-600 font-bold px-2 py-0.5 rounded animate-pulse">{t.weighingIndicator}</span>
          </div>

          {/* LED Display screen */}
          <div className="bg-black border-2 border-neutral-900 rounded-lg p-4 sm:p-6 flex flex-col items-end relative overflow-hidden shadow-inner my-2">
            <div className="absolute top-2 left-3 flex gap-2">
              <span className={`w-2 h-2 rounded-full ${simulatorWeight > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-red-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">{t.stable}</span>
              <span className={`w-2 h-2 rounded-full ${simulatorWeight === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]' : 'bg-blue-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">{t.zero}</span>
            </div>
            
            {/* LARGE SEVEN SEGMENT RESEMBLANCE */}
            <div className="text-blue-500 font-mono text-4xl sm:text-5xl font-extrabold tracking-widest leading-none drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]">
              {simulatorWeight.toLocaleString('id-ID')}
            </div>
            <div className="text-blue-400 font-mono text-xs sm:text-sm mt-1">kg</div>
          </div>

          {/* KONEKSI TIMBANGAN FISIK REALTIME (WEB SERIAL) */}
          <div className="bg-neutral-900 border border-neutral-750 rounded-lg p-3 my-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black tracking-wider uppercase text-neutral-300 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSerialConnected ? 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,1)]' : 'bg-neutral-600'}`} />
                Koneksi Timbangan Fisik GST-9700
              </span>
              {!isSerialSupported && (
                <span className="text-[8px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Tidak Didukung
                </span>
              )}
            </div>

            {isSerialSupported ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[8px] text-neutral-400 font-black uppercase font-mono">Baud Rate</label>
                    <select
                      value={serialBaudRate}
                      onChange={(e) => setSerialBaudRate(Number(e.target.value))}
                      disabled={isSerialConnected}
                      className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded px-1.5 py-1 font-mono outline-none cursor-pointer"
                    >
                      <option value="1200">1200 bps</option>
                      <option value="2400">2400 bps</option>
                      <option value="4800">4800 bps</option>
                      <option value="9600">9600 bps (Standard GST-9700)</option>
                      <option value="19200">19200 bps</option>
                      <option value="38400">38400 bps</option>
                      <option value="115200">115200 bps</option>
                    </select>
                  </div>
                  <div className="pt-3 shrink-0">
                    {isSerialConnected ? (
                      <button
                        onClick={disconnectSerial}
                        className="bg-red-700 hover:bg-red-600 text-white font-mono font-bold text-xs px-3 py-1.5 rounded transition cursor-pointer"
                      >
                        PUTUSKAN
                      </button>
                    ) : (
                      <button
                        onClick={connectSerial}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs px-3 py-1.5 rounded transition cursor-pointer"
                      >
                        HUBUNGKAN
                      </button>
                    )}
                  </div>
                </div>
                {serialError && (
                  <p className="text-[9px] text-red-400 font-mono italic mt-0.5 max-w-full truncate">{serialError}</p>
                )}
                <div className="text-[9px] text-neutral-400 font-mono italic mt-0.5 leading-normal bg-neutral-950/50 p-2 rounded border border-neutral-800 flex flex-col gap-1">
                  {isSerialConnected ? (
                    <>
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                        Aktif: Tersambung Indikator GST-9700 ({simulatorWeight.toLocaleString('id-ID')} Kg)
                      </span>
                      {lastRawSerialData && (
                        <span className="text-neutral-300 font-mono text-[9px] truncate">
                          Data Terbaca: <code className="text-yellow-300 font-bold">{lastRawSerialData}</code>
                        </span>
                      )}
                    </>
                  ) : (
                    "Sambungkan kabel RS-232 indikator GST-9700 ke USB komputer, lalu klik Hubungkan."
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-red-400 font-mono italic leading-relaxed">
                Browser Anda tidak mendukung Web Serial API. Pastikan menggunakan browser berbasis Chromium desktop terbaru seperti Google Chrome atau Microsoft Edge.
              </p>
            )}
          </div>

          {/* Controls to Mock physical setup weights for the computer */}
          <div className="mt-4">
            <label className="block text-xs font-mono text-neutral-400 mb-1 font-bold">{t.activeWeightSimulator}</label>
            <form onSubmit={handleCustomWeightSubmit} className="flex gap-2">
              <input 
                type="text"
                value={formatNumberInput(customSimulatorInput)}
                onChange={(e) => {
                  const rawVal = e.target.value;
                  setCustomSimulatorInput(rawVal);
                  const parsed = parseNumberInput(rawVal);
                  if (!isNaN(parsed) && parsed >= 0) {
                    setSimulatorWeight(parsed);
                  }
                }}
                className="bg-neutral-900 border border-neutral-600 text-red-400 font-mono text-center text-sm sm:text-lg rounded px-2 py-1 flex-1 focus:outline-none focus:border-red-500"
              />
              <button 
                type="submit" 
                className="bg-red-700 hover:bg-red-600 font-mono px-3 py-1 text-xs sm:text-sm rounded font-bold transition shrink-0"
              >
                {t.apply}
              </button>
            </form>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3">
            <button onClick={() => applySimulatorPreset(11330)} className="bg-red-900/90 hover:bg-red-800 text-yellow-300 font-bold font-mono py-2 rounded text-[11px] sm:text-xs px-1.5 text-center truncate border border-red-700 shadow flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block shrink-0"></span>
              11,330 KG (GST-9700)
            </button>
            <button onClick={() => applySimulatorPreset(3560)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center truncate border border-neutral-700">
              3,560 KG (BERAS)
            </button>
            <button onClick={() => applySimulatorPreset(14650)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center truncate border border-neutral-700">
              14,650 KG (TRUK BRUTO)
            </button>
            <button onClick={() => applySimulatorPreset(4250)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center truncate border border-neutral-700">
              4,250 KG (KOSONG/TARA)
            </button>
            <button onClick={() => applySimulatorPreset(12450)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center truncate border border-neutral-700">
              12,450 KG (GROSS)
            </button>
            <button onClick={resetZero} className="bg-neutral-950 hover:bg-neutral-900 text-red-500 font-bold border border-red-950 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center truncate leading-none">
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
            <Scale className="text-blue-500 w-4 h-4" />
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
                      : 'bg-blue-600 text-white hover:bg-blue-500'
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
            <div className="bg-neutral-950 border border-[#2d4d8c] p-3 rounded mb-3 flex justify-between items-center relative shadow-inner">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-[#a0c5fc] text-xs font-bold tracking-wide">{t.currentWeight}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    {isSerialConnected ? 'REAL-TIME SERIAL (GST-9700)' : 'REAL-TIME LIVE SYNC ACTIVE'}
                  </span>
                </div>
              </div>
              <div className="text-right flex items-baseline gap-2">
                <span className="text-blue-400 font-mono text-4xl sm:text-5xl font-black relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] tracking-tight">
                  {simulatorWeight.toLocaleString('id-ID')}
                </span>
                <span className="text-blue-400 font-mono text-sm font-bold">kg</span>
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

            {/* Quick Live Scale Sync Bar */}
            <div className="bg-[#122345] border border-[#2d4d8c]/80 rounded p-2 mb-4 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[#a0c5fc] font-semibold">Berat Timbangan Fisik GST-9700:</span>
                <span className="text-yellow-300 font-mono font-bold text-sm bg-neutral-950/80 px-2 py-0.5 rounded border border-yellow-500/30">
                  {simulatorWeight.toLocaleString('id-ID')} kg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applySimulatorPreset(11330)}
                  className="bg-red-700 hover:bg-red-600 text-white font-mono text-[10px] px-2.5 py-1 rounded font-bold transition flex items-center gap-1 border border-red-500 shadow"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  SET 11.330 KG (SESUAI FOTO FISIK)
                </button>
              </div>
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
                      <option value="BROKEN">BROKEN</option>
                      <option value="RIJEK">RIJEK</option>
                      <option value="BENIR">BENIR</option>
                      <option value="DEDAK">DEDAK</option>
                      <option value="JAGUNG READY">JAGUNG READY</option>
                      <option value="JAGUNG ASALAN">JAGUNG ASALAN</option>
                      <option value="KACANG IJO">KACANG IJO</option>
                      <option value="KACANG TANAH">KACANG TANAH</option>
                      <option value="CANGKANG KEMIRI">CANGKANG KEMIRI</option>
                      <option value="CANGKANG SAWIT">CANGKANG SAWIT</option>
                      <option value="GULA MERAH AREN">GULA MERAH AREN</option>
                      <option value="GULA MERAH KLPA">GULA MERAH KLPA</option>
                      <option value="GABAH">GABAH</option>
                      <option value="PASIR">PASIR</option>
                      <option value="RUMPUT LAUT">RUMPUT LAUT</option>
                      <option value="BESI TUA">BESI TUA</option>
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
                    <span className="text-blue-400">{selectedTicket ? `${(selectedTicket.timbang1Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` : '0 kg'}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ({selectedTicket ? selectedTicket.timbang1Time : '-'})
                  </div>
                </div>

                <div className="pt-0.5">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>{t.weigh2Label}</span>
                    <span className="text-orange-400">
                      {selectedTicket && selectedTicket.timbang2Time ? `${(selectedTicket.timbang2Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` : '-'}
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
                    <span className="text-yellow-300 font-bold">{selectedTicket ? (selectedTicket.grossWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0c5fc]">{t.tareWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-[#efefef]">{selectedTicket ? (selectedTicket.tareWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                 <div className="border-b border-[#2d4d8c]/60 pb-3 pt-1">
                  {(isCreatingNew || isEditing) ? (
                    <SmartNumberInput
                      value={bagDeductionPercent}
                      onChange={setBagDeductionPercent}
                      label={t.bagDeductionLabel}
                      mode="percent"
                      unit="%"
                      presets={[1.0, 1.25, 1.5, 2.0]}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0c5fc]">{t.bagDeductionLabel}</span>
                      <div className="flex items-center">
                        <span className="text-[#efefef] font-mono">{selectedTicket ? selectedTicket.bagDeductionPercent.toFixed(2) : '0.00'}</span>
                        <span className="text-neutral-400 text-xs ml-1">%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-b border-[#2d4d8c]/60 pb-3 pt-1">
                  {(isCreatingNew || isEditing) ? (
                    <SmartNumberInput
                      value={refaksiPercent}
                      onChange={setRefaksiPercent}
                      label={t.refaksiLabel}
                      mode="percent"
                      unit="%"
                      presets={[1.0, 2.0, 3.0, 4.0]}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0c5fc]">{t.refaksiLabel}</span>
                      <div className="flex items-center">
                        <span className="text-[#efefef] font-mono">{selectedTicket ? selectedTicket.refaksiPercent.toFixed(2) : '0.00'}</span>
                        <span className="text-neutral-400 text-xs ml-1">%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#a0c5fc] font-bold text-sm">{t.netWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-blue-400 font-extrabold text-xl font-mono">{selectedTicket ? (computedNet ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0'}</span>
                    <span className="text-blue-400 text-xs ml-1">kg</span>
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
                  <label className="text-[9px] text-[#a0c5fc] font-bold uppercase tracking-widest">NAMA PETUGAS OPR / STAFF 162</label>
                  <input 
                    type="text" 
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="bg-[#122345] border border-[#2d4d8c] text-blue-400 font-bold px-3 py-1 text-xs rounded outline-none focus:border-blue-500 uppercase"
                    placeholder="NAMA STAFF/OPERATOR..."
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
                        const w1 = selectedTicket.timbang1Weight;
                        const w2 = selectedTicket.timbang2Weight;
                        const actualGross = w2 > 0 ? Math.max(w1, w2) : w1;
                        const actualTare = w2 > 0 ? Math.min(w1, w2) : 0;

                        const updated: WeighbridgeTicket = {
                          ...selectedTicket,
                          ticketNo,
                          policeNo: policeNo.toUpperCase(),
                          goodsName: goodsName.toUpperCase(),
                          agency: agency.toUpperCase(),
                          bagDeductionPercent,
                          refaksiPercent,
                          notes,
                          grossWeight: actualGross,
                          tareWeight: actualTare,
                          netWeight: calculateNetWeight(w1, w2, bagDeductionPercent, refaksiPercent)
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
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F2-TIMBANG I</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F3-TIMBANG II</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F4-KOREKSI</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F5-HAPUS</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F6-CARI</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c]">F7-LIST</span>
                <span className="bg-[#102345] px-1.5 py-0.5 rounded border border-[#2d4d8c] text-yellow-300 font-bold cursor-pointer" onClick={() => selectedTicket && setPrintTicket(selectedTicket)}>F8-PRINT SLIP</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TICKET ARCHIVE AND LIST */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2 shrink-0">
              <Scale className="text-blue-500 w-5 h-5" />
              {t.ticketArchiveTitle} ({filteredTickets.length})
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
              <button
                onClick={handleExportExcel}
                title="Unduh seluruh daftar rekap jembatan timbang ke format Microsoft Excel"
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer"
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
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-blue-600 focus:bg-white font-semibold text-neutral-700"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-neutral-600 min-w-[800px]">
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
                      selectedTicket?.id === ticket.id ? 'bg-blue-50/50 font-medium text-neutral-900 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">
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
                    <td className="text-right py-2.5 px-3 font-mono">{(ticket.timbang1Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</td>
                    <td className="text-right py-2.5 px-3 font-mono text-orange-600">
                      {(ticket.timbang2Weight ?? 0) > 0 ? (ticket.timbang2Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '-'}
                    </td>
                    <td className="text-right py-2.5 px-3 font-bold font-mono text-blue-600">
                      {(ticket.timbang2Weight > 0 
                        ? calculateNetWeight(ticket.timbang1Weight, ticket.timbang2Weight, ticket.bagDeductionPercent, ticket.refaksiPercent) 
                        : ticket.timbang1Weight
                       ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'
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
                          className="p-1 text-neutral-400 hover:text-blue-600 transition"
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
                          className="p-1 text-neutral-400 hover:text-blue-600 transition"
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
              className="bg-white border border-neutral-300 rounded-xl p-4 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 uppercase text-xs tracking-widest">
                  <Printer className="text-blue-600 w-4 h-4" />
                  {t.printSlipPreview}
                </span>
                <button 
                  onClick={() => setPrintTicket(null)}
                  className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="bg-neutral-50 p-3 border border-dashed border-neutral-300 rounded font-mono text-[10px] text-neutral-800 leading-tight shadow-inner">
                <div className="text-center border-b border-neutral-300 pb-1 mb-2">
                  <div className="font-bold text-xs tracking-widest text-blue-950">{t.thermalSlipHeader}</div>
                  <div className="text-[8px] opacity-70">{t.thermalSlipAddress}</div>
                  <div className="text-[8px] opacity-70">{t.thermalSlipCity}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">{t.thermalSlipPhone}</div>
                </div>

                <div className="space-y-0.5 mb-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. Tiket :</span>
                    <span className="font-bold font-mono">{printTicket.ticketNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">No. Polisi:</span>
                    <span className="font-bold">{printTicket.policeNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Mitra/Agen:</span>
                    <span className="font-semibold">{printTicket.agency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Barang:</span>
                    <span className="font-semibold">{printTicket.goodsName}</span>
                  </div>
                </div>
                
                <div className="border-t border-neutral-300 my-1.5 pt-1.5" />

                <div className="flex justify-between font-bold text-[9px]">
                  <span>{t.weigh1Label} ({language === 'id' ? 'Masuk' : 'Inbound'})</span>
                  <span>{printTicket.timbang1Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg</span>
                </div>
                <div className="text-[9px] text-neutral-500 text-right opacity-70">
                  {printTicket.timbang1Time}
                </div>

                <div className="flex justify-between font-bold mt-0.5 text-[9px]">
                  <span>{t.weigh2Label} ({language === 'id' ? 'Keluar' : 'Outbound'})</span>
                  <span>{printTicket.timbang2Weight > 0 ? `${printTicket.timbang2Weight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} Kg` : '- -'}</span>
                </div>
                {printTicket.timbang2Time && (
                  <div className="text-[9px] text-neutral-500 text-right opacity-70">
                    {printTicket.timbang2Time}
                  </div>
                )}

                <div className="border-t border-neutral-300 my-1.5 pt-1.5 space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">TIMBANGAN KOTOR :</span>
                    <span>{(printTicket.timbang1Weight).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">TIMBANGAN KOSONG :</span>
                    <span>{printTicket.tareWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="uppercase">TIMBANGAN BRUTO :</span>
                    <span>{(printTicket.timbang1Weight - printTicket.tareWeight).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg</span>
                  </div>

                  <div className="flex justify-between text-[9px] text-neutral-500 italic">
                    <span>Pot. Refaksi ({printTicket.refaksiPercent.toFixed(2)}%):</span>
                    <span>- {Math.round((printTicket.grossWeight - printTicket.tareWeight) * (printTicket.refaksiPercent/100))} kg</span>
                  </div>
                </div>

                <div className="border-b-2 border-double border-neutral-400 my-1.5" />

                <div className="flex justify-between font-extrabold text-[11px] text-blue-950">
                  <span className="uppercase">{t.netWeightLabel} :</span>
                  <span>{calculateNetWeight(printTicket.timbang1Weight, printTicket.timbang2Weight, printTicket.bagDeductionPercent, printTicket.refaksiPercent).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} KG</span>
                </div>

                {printTicket.notes && (
                  <div className="mt-2 text-[9px] text-neutral-600 bg-white/70 p-1 rounded border border-neutral-200">
                    <strong>Catatan:</strong> {printTicket.notes}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center mt-5 text-[9px]">
                    <div>
                      <p className="mb-6">{t.riceStockTitle === 'Rincian Stok Beras' ? 'Penerima Staff 162' : 'Staff 162'}</p>
                      <p className="border-t border-neutral-400 pt-1 font-bold">{staffName}</p>
                    </div>
                  <div>
                    <p className="mb-6">Sopir / Pembawa</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</p>
                  </div>
                </div>

                <div className="text-center text-[7px] text-neutral-400 mt-2 border-t border-neutral-200 pt-2 italic">
                  * Terimakasih atas kerjasamanya *<br />
                  Aplikasi Timbangan GSC GST-9700 v2.0
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => {
                    printSlip(printTicket, staffName);
                    setPrintTicket(null);
                  }}
                  className="flex-1 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
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
