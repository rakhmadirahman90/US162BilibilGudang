/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WeighbridgeTicket, VehicleRecord, BuyerRecord, SupplierRecord, EmployeeRecord } from '../types';
import { Scale, Printer, Search, PlusCircle, RotateCcw, AlertCircle, AlertTriangle, ExternalLink, FileText, Check, Trash2, Edit2, Edit3, Download, Clock, ChevronRight, Truck, Save, XCircle, MessageCircle, RefreshCw, Info, Activity, Wifi, Zap, HelpCircle, Radio, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { exportToCSV, printPDFReport, printSlip, getHTMLForPDF } from '../utils/exportHelper';
import { buildWeighbridgeWAText, sendWhatsAppMessage } from '../utils/whatsappHelper';
import { GST9700AutoSyncEngine } from '../utils/GST9700AutoSyncEngine';
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
  
  // Web Serial API states for Physical Scale GSC GST-9700 / GST-700
  const [isSerialSupported, setIsSerialSupported] = useState<boolean>(false);
  const [isSerialConnected, setIsSerialConnected] = useState<boolean>(false);
  const [serialBaudRate, setSerialBaudRate] = useState<number>(9600);
  const [serialDataBits, setSerialDataBits] = useState<number>(8);
  const [serialParity, setSerialParity] = useState<"none" | "even" | "odd">("none");
  const [serialError, setSerialError] = useState<string | null>(null);
  const [lastRawSerialData, setLastRawSerialData] = useState<string>("");
  const [rxPacketCount, setRxPacketCount] = useState<number>(0);
  const [lastRxTime, setLastRxTime] = useState<string>("");
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [isWeightTooltipOpen, setIsWeightTooltipOpen] = useState<boolean>(false);
  const [isSimulatedStreamActive, setIsSimulatedStreamActive] = useState<boolean>(false);

  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);
  const autoSyncEngineRef = useRef<GST9700AutoSyncEngine | null>(null);

  // Force sync and buffer flush handler for latency resolution
  const handleForceSync = () => {
    autoSyncEngineRef.current?.flush();
    const timeStr = new Date().toLocaleTimeString('id-ID');
    setLastRxTime(timeStr);
    setSerialError(null);
    (window as any).__showToast?.("⚡ GST-9700 AUTO SYNC: buffer parser di-flush dan menunggu frame timbangan terbaru.", "success");
  };

  // Simulated Auto-Stream Effect for physical scale testing without serial hardware
  useEffect(() => {
    let interval: any = null;
    if (isSimulatedStreamActive) {
      let step = 0;
      const simulatedWeights = [0, 1450, 5200, 12840, 19600, 26450, 34200, 28150, 14200, 0];
      interval = setInterval(() => {
        step = (step + 1) % simulatedWeights.length;
        const currentW = simulatedWeights[step];
        const padded = String(currentW).padStart(6, '0');
        const rawFrameStr = `ST,GS,+${padded}kg`;
        
        setSimulatorWeight(currentW);
        setCustomSimulatorInput(String(currentW));
        setLastRawSerialData(rawFrameStr);
        setRxPacketCount(prev => prev + 1);
        setLastRxTime(new Date().toLocaleTimeString('id-ID'));
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatedStreamActive]);

  useEffect(() => {
    autoSyncEngineRef.current = new GST9700AutoSyncEngine((snapshot) => {
      if (snapshot.weight !== null) {
        setSimulatorWeight(snapshot.weight);
        setCustomSimulatorInput(String(snapshot.weight));
      }
      setLastRawSerialData(snapshot.rawFrame || '');
      setRxPacketCount(snapshot.rxCount);
      setLastRxTime(snapshot.lastRxAt);
      if (snapshot.error) setSerialError(snapshot.error);
      if (snapshot.state === 'RECEIVING' || snapshot.state === 'CONNECTED') setSerialError(null);
      setIsSerialConnected(snapshot.state === 'CONNECTED' || snapshot.state === 'RECEIVING' || snapshot.state === 'STALE' || snapshot.state === 'RECONNECTING');
    });

    setIsSerialSupported('serial' in navigator);
    return () => {
      // Cleanup on unmount
      keepReadingRef.current = false;
      autoSyncEngineRef.current?.stop();
      if (serialReaderRef.current) {
        try {
          serialReaderRef.current.cancel().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const autoReconnectAuthorizedPort = async () => {
      try {
        if (!(navigator as any).serial?.getPorts) return;
        const ports = await (navigator as any).serial.getPorts();
        if (cancelled || !ports?.length || serialPortRef.current || !isAutoSyncEnabled) return;
        const port = ports[0];
        serialPortRef.current = port;
        try {
          await port.open({ baudRate: serialBaudRate, dataBits: serialDataBits, stopBits: 1, parity: serialParity, flowControl: 'none', bufferSize: 2048 });
        } catch (e: any) {
          if (!/already open/i.test(e?.message || '')) throw e;
        }
        try { await port.setSignals({ dataTerminalReady: true, requestToSend: true }); } catch (_) {}
        setIsSerialConnected(true);
        setIsSimulatedStreamActive(false);
        keepReadingRef.current = true;
        autoSyncEngineRef.current?.start(port, { baudRate: serialBaudRate, dataBits: serialDataBits, parity: serialParity, stopBits: 1 });
        (window as any).__showToast?.('🔄 GST-9700 AUTO SYNC: port yang sudah diberi izin tersambung kembali otomatis.', 'success');
      } catch (e) {
        console.info('GST-9700 auto reconnect skipped:', e);
      }
    };
    autoReconnectAuthorizedPort();
    return () => { cancelled = true; };
  }, [isAutoSyncEnabled]);

  /**
   * Helper function to robustly parse weight packets from physical GST-700 / GST-9700 / GSC / Toledo / Yaohua indicators
   */
  const formatParsedWeightVal = (val: number, cleanFrame: string): number => {
    if (/\b(?:t|ton|tons|tonne)\b/i.test(cleanFrame)) {
      return Math.round(val * 1000);
    }
    return Math.round(val);
  };

  // Check if inside iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  /**
   * Helper function to robustly parse weight packets from physical GST-9700 / GST-700 / GSC / Toledo / Yaohua indicators
   */
  const parseNumberValue = (numRaw: string, fullContext: string): number | null => {
    if (!numRaw) return null;
    
    // Clean spaces
    let numStr = numRaw.replace(/\s+/g, '');
    if (!numStr) return null;

    // Remove trailing dot if it's zero-suppression dot e.g. "14860." -> "14860" or "14940." -> "14940"
    numStr = numStr.replace(/\.$/, '');

    // Check if number format uses thousand separator dot or comma e.g. "14.860", "14,860", "14.940", "14,940"
    if (/^[+-]?\d{1,3}[\.,]\d{3}$/.test(numStr)) {
      numStr = numStr.replace(/[\.,]/g, '');
    } else {
      // Standard decimal: convert comma to dot if comma used as decimal point
      numStr = numStr.replace(',', '.');
    }

    let val = parseFloat(numStr);
    if (isNaN(val) || val < 0) return null;

    // Check unit context
    if (/\b(?:t|ton|tons|tonne)\b/i.test(fullContext)) {
      return Math.round(val * 1000);
    }
    
    // If value is a small decimal like 14.94 and unit is not explicitly "kg", check if it represents tons
    if (val > 0 && val < 200 && /\./.test(numStr) && !/kg/i.test(fullContext)) {
      return Math.round(val * 1000);
    }

    return Math.round(val);
  };

  /**
   * Extract weight value from clean ASCII string frame or sliding buffer
   */
  const extractWeightValueFromCleanStr = (clean: string): number | null => {
    if (!clean) return null;

    // Remove control characters except spaces & standard printable ASCII
    const sanitized = clean.replace(/[^\x20-\x7E]/g, ' ').trim();
    if (!sanitized) return null;

    // Pattern 1: GST-9700 / GST-700 / GSC / Toledo / CAS standard prefix e.g. "ST,GS,+011330kg", "US,GS,  005420", "ST,NT,+011330", "G.W.: +011330kg"
    const gscMatches = Array.from(
      sanitized.matchAll(/(?:ST|US|WN|WW|OL|QT|TR|GR)?\s*,?\s*(?:GS|NT|G\.W\.|N\.W\.|Gross|Net)?[,\s:=]*([+-]?\s*\d+(?:[\s\.,]\d+)?)\s*(?:kg|t|g)?/gi)
    );
    if (gscMatches.length > 0) {
      for (let i = gscMatches.length - 1; i >= 0; i--) {
        const match = gscMatches[i];
        if (match && match[1]) {
          const parsed = parseNumberValue(match[1], sanitized);
          if (parsed !== null) return parsed;
        }
      }
    }

    // Pattern 2: Signed numbers e.g. "+011330", "=005420", "-000000", ":011330", "#011330"
    const signedMatches = Array.from(sanitized.matchAll(/[\+\=\:\#]\s*(\d+(?:[\s\.,]\d+)?)/g));
    if (signedMatches.length > 0) {
      for (let i = signedMatches.length - 1; i >= 0; i--) {
        const match = signedMatches[i];
        if (match && match[1]) {
          const parsed = parseNumberValue(match[1], sanitized);
          if (parsed !== null) return parsed;
        }
      }
    }

    // Pattern 3: Yaohua / GSC reverse string format e.g. "033110+" (11330+)
    const reverseMatches = Array.from(sanitized.matchAll(/\b(\d{4,7})[\+\=\-]/g));
    if (reverseMatches.length > 0) {
      for (let i = reverseMatches.length - 1; i >= 0; i--) {
        const match = reverseMatches[i];
        if (match && match[1]) {
          const revDigits = match[1].split('').reverse().join('');
          const parsed = parseNumberValue(revDigits, sanitized);
          if (parsed !== null) return parsed;
        }
      }
    }

    // Pattern 4: Unit suffixed numbers e.g. "11330kg", "11330 kg", "11.330 kg"
    const unitMatches = Array.from(sanitized.matchAll(/(\d+(?:[\s\.,]\d+)?)\s*(?:kg|t|g)\b/gi));
    if (unitMatches.length > 0) {
      for (let i = unitMatches.length - 1; i >= 0; i--) {
        const match = unitMatches[i];
        if (match && match[1]) {
          const parsed = parseNumberValue(match[1], sanitized);
          if (parsed !== null) return parsed;
        }
      }
    }

    // Pattern 5: Standalone numbers with length 1 to 7 digits
    const digitMatches = Array.from(sanitized.matchAll(/\b\d{1,7}(?:[\s\.,]\d+)?\b/g));
    if (digitMatches.length > 0) {
      for (let i = digitMatches.length - 1; i >= 0; i--) {
        const match = digitMatches[i];
        if (match && match[0]) {
          const parsed = parseNumberValue(match[0], sanitized);
          if (parsed !== null) return parsed;
        }
      }
    }

    return null;
  };

  /**
   * Continuous buffer parser for GST-700 / GST-9700 serial stream
   */
  const parseSerialIndicatorBuffer = (rawBuffer: string): { weight: number | null; rawFrame: string; remainingBuffer: string } => {
    if (!rawBuffer) return { weight: null, rawFrame: "", remainingBuffer: "" };

    let buffer = rawBuffer;
    if (buffer.length > 2048) {
      buffer = buffer.slice(-1024);
    }

    // Split ONLY by line breaks and ASCII control frame boundaries (\r, \n, STX \x02, ETX \x03, EOT \x04, ESC \x1b)
    // DO NOT split by commas or semicolons as indicator frames contain commas (e.g. ST,GS,+011330kg)
    const rawTokens = buffer.split(/[\r\n\x02\x03\x04\x1b]+/);
    const hasEndingDelimiter = /[\r\n\x02\x03\x04\x1b]$/.test(buffer);
    
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

    // 2. Fallback check on full buffer or remainingBuffer if completeFrames didn't match
    if (detectedWeight === null) {
      const cleanAll = buffer.replace(/[^\x20-\x7E]/g, ' ').trim();
      const val = extractWeightValueFromCleanStr(cleanAll);
      if (val !== null) {
        detectedWeight = val;
        lastRawFrame = cleanAll;
      }
    }

    if (remainingBuffer.length > 300) {
      remainingBuffer = "";
    }

    return { weight: detectedWeight, rawFrame: lastRawFrame, remainingBuffer };
  };

  const connectSerial = async () => {
    setSerialError(null);
    try {
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera versi desktop terbaru.");
      }

      let port = serialPortRef.current;
      if (!port) {
        port = await (navigator as any).serial.requestPort();
        serialPortRef.current = port;
      }

      // If port is already open, try closing first
      try {
        await port.close();
      } catch (e) {}

      // Open with selected RS-232 options
      await port.open({
        baudRate: serialBaudRate,
        dataBits: serialDataBits,
        stopBits: 1,
        parity: serialParity,
        flowControl: "none",
        bufferSize: 2048,
      });

      // Assert RTS/DTR hardware signals for USB-to-Serial RS232 converters
      try {
        await port.setSignals({ dataTerminalReady: true, requestToSend: true });
      } catch (e) {
        console.warn("Hardware signals not supported or unnecessary on this port:", e);
      }
      
      setIsSerialConnected(true);
      setIsSimulatedStreamActive(false);
      keepReadingRef.current = true;
      
      (window as any).__showToast?.(`✅ BERHASIL TERHUBUNG: Terhubung pada Port Serial USB (${serialBaudRate} bps)! Membaca data GST-9700...`, "success");

      // Start reading stream asynchronously
      autoSyncEngineRef.current?.start(port, { baudRate: serialBaudRate, dataBits: serialDataBits, parity: serialParity, stopBits: 1 });
    } catch (err: any) {
      const rawMsg = err?.message || String(err) || "Gagal membuka port serial";
      
      // Gracefully handle user canceling/closing the serial port selection dialog
      if (
        err?.name === 'NotFoundError' || 
        /no port selected/i.test(rawMsg) || 
        /canceled|cancelled/i.test(rawMsg) ||
        /user gesture/i.test(rawMsg)
      ) {
        console.info("Pemilihan port serial dibatalkan oleh pengguna.");
        setSerialError(null);
        (window as any).__showToast?.("ℹ️ PEMBERITAHUAN: Pemilihan port serial dibatalkan oleh pengguna.", "info");
        setIsSerialConnected(false);
        return;
      }

      console.error("Serial connection error:", err);
      if (err?.name === 'SecurityError' || /Permissions policy|policy|disallowed/i.test(rawMsg)) {
        const errorMsg = "⚠️ AKSES PORT SERIAL DIBLOKIR FRAME: Silakan klik tombol 'Buka di Tab Baru' ↗️ di pojok kanan atas preview agar browser dapat berkomunikasi langsung dengan kabel USB / RS-232 timbangan GST-9700 Anda, atau aktifkan 'DEMO AUTO-STREAM' di bawah untuk uji coba otomatis.";
        setSerialError(errorMsg);
        (window as any).__showToast?.(errorMsg, "error");
      } else {
        const errorMsg = `❌ KESALAHAN KONEKSI: Gagal membuka port serial (${rawMsg}). Pastikan kabel RS-232 indikator GST-9700 tersambung ke USB PC/Laptop dan port tidak digunakan aplikasi lain.`;
        setSerialError(errorMsg);
        (window as any).__showToast?.(errorMsg, "error");
      }
      setIsSerialConnected(false);
    }
  };

  const reopenSerialWithConfig = async (baud: number, bits: number = 8, parityVal: "none" | "even" | "odd" = "none") => {
    setSerialBaudRate(baud);
    setSerialDataBits(bits);
    setSerialParity(parityVal);
    setSerialError(null);

    // Stop current reader
    keepReadingRef.current = false;
    if (serialReaderRef.current) {
      try {
        await serialReaderRef.current.cancel();
      } catch (e) {}
      serialReaderRef.current = null;
    }
    
    // Close current port if open
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {}
    }

    if (serialPortRef.current) {
      try {
        await serialPortRef.current.open({
          baudRate: baud,
          dataBits: bits,
          stopBits: 1,
          parity: parityVal,
          flowControl: "none",
          bufferSize: 2048,
        });

        try {
          await serialPortRef.current.setSignals({ dataTerminalReady: true, requestToSend: true });
        } catch (e) {}

        setIsSerialConnected(true);
        setIsSimulatedStreamActive(false);
        keepReadingRef.current = true;
        (window as any).__showToast?.(`🔄 Beralih ke Baud Rate ${baud} bps (${bits}-${parityVal === 'none' ? 'N' : parityVal === 'even' ? 'E' : 'O'}-1)...`, "info");
        autoSyncEngineRef.current?.start(serialPortRef.current, { baudRate: baud, dataBits: bits, parity: parityVal, stopBits: 1 });
        return;
      } catch (err: any) {
        console.warn("Reopen port directly failed:", err);
      }
    }

    // Fallback to connectSerial if port ref is null
    connectSerial();
  };

  const readSerialData = async (port: any) => {
    let buffer = "";
    let continuousFailures = 0;

    while (keepReadingRef.current) {
      let reader: any = null;
      try {
        if (!port || !port.readable) {
          throw new Error("Port serial tidak dapat dibaca atau telah ditutup.");
        }

        reader = port.readable.getReader();
        serialReaderRef.current = reader;
        const decoder = new TextDecoder("utf-8");

        while (keepReadingRef.current) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (value && value.length > 0) {
            continuousFailures = 0; // Reset failure count on valid read
            
            // ALWAYS sanitize bytes with 0x7F bitmask to strip parity/high bits in RS232 signals
            const sanitizedBytes = new Uint8Array(value.length);
            for (let i = 0; i < value.length; i++) {
              sanitizedBytes[i] = value[i] & 0x7f;
            }

            const chunkStr = decoder.decode(sanitizedBytes, { stream: true });
            buffer += chunkStr;

            const { weight, rawFrame, remainingBuffer } = parseSerialIndicatorBuffer(buffer);
            buffer = remainingBuffer;

            if (rawFrame) {
              setLastRawSerialData(rawFrame);
            } else if (chunkStr.trim()) {
              setLastRawSerialData(chunkStr.trim());
            }

            if (weight !== null) {
              setSimulatorWeight(weight);
              setCustomSimulatorInput(String(weight));
              setRxPacketCount(prev => prev + 1);
              setLastRxTime(new Date().toLocaleTimeString('id-ID'));
              setSerialError(null);
            }
          }
        }
      } catch (err: any) {
        console.warn("Serial stream read glitch/error caught:", err);
        continuousFailures++;
        
        if (keepReadingRef.current) {
          const rawErrMsg = err?.message || String(err) || "";
          const isBreakOrGlitch = /break|framing|parity|buffer|overflow|alignment|overrun|unlock/i.test(rawErrMsg);

          if (isBreakOrGlitch && continuousFailures < 20) {
            // Soft auto-recovery from Break signal / framing glitch
            setSerialError(
              `⚡ TERDETEKSI SINYAL BREAK / FLUKTUASI VOLLTASE RS-232 ("${rawErrMsg}"). Mengambil ulang stream data GST-9700 secara otomatis...`
            );
          } else {
            const errorMsg = `Koneksi terputus: ${rawErrMsg || "Gagal membaca stream data dari timbangan GST-9700"}`;
            setSerialError(errorMsg);
            
            // If device disconnected or unrecoverable error, break loop
            if (continuousFailures >= 20 || /closed|device lost|disconnected|device removed/i.test(rawErrMsg)) {
              keepReadingRef.current = false;
              break;
            }
          }
        }
      } finally {
        if (reader) {
          try {
            await reader.releaseLock();
          } catch (e) {}
        }
        serialReaderRef.current = null;
      }

      // Short delay before auto-re-acquiring reader stream if connection is active
      if (keepReadingRef.current) {
        await new Promise(res => setTimeout(res, 200));
      }
    }

    setIsSerialConnected(false);
  };

  const disconnectSerial = async () => {
    keepReadingRef.current = false;
    await autoSyncEngineRef.current?.stop();
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

  // Interactive Tooltip Component for Scale Connection & Latency Info
  const renderScaleLatencyTooltip = (positionClass: string = "top-full right-0 mt-2") => (
    <div className={`absolute ${positionClass} z-50 w-80 sm:w-96 bg-neutral-900/95 backdrop-blur-md border border-blue-500/60 rounded-xl p-3.5 shadow-2xl text-white font-sans text-xs animate-in fade-in zoom-in-95 duration-200 pointer-events-auto`}>
      {/* Tooltip Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-xs text-neutral-100">Status Koneksi & Latensi Real-time</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            isSerialConnected 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
              : 'bg-blue-950 text-blue-300 border-blue-800'
          }`}>
            {isSerialConnected ? 'RS-232 ACTIVE' : 'LIVE SYNC ACTIVE'}
          </span>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsWeightTooltipOpen(false);
            }}
            className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Latency & Streaming Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2.5 font-mono">
        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">Latensi Transmisi</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-bold text-xs">&lt; 10ms (Sangat Rendah)</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">Paket Diterima</span>
          <span className="text-yellow-400 font-bold text-xs">{rxPacketCount} Frame ASCII</span>
        </div>

        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">Port &amp; Baud Rate</span>
          <span className="text-neutral-200 font-bold text-xs">{serialBaudRate} bps (8-N-1)</span>
        </div>

        <div className="bg-neutral-950/80 p-2 rounded border border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-neutral-400 font-sans">RX Terakhir</span>
          <span className="text-blue-300 font-bold text-xs">{lastRxTime || 'Kontinu Streaming'}</span>
        </div>
      </div>

      {/* ASCII Raw Stream Preview */}
      {lastRawSerialData && (
        <div className="mb-2.5 bg-black/90 p-2 rounded border border-neutral-800 font-mono text-[9.5px]">
          <span className="text-neutral-400 block mb-0.5 font-sans">Raw Stream Frame GST-9700:</span>
          <code className="text-yellow-300 font-bold break-all bg-neutral-900 px-1 py-0.5 rounded block">
            {lastRawSerialData}
          </code>
        </div>
      )}

      {/* Latency & Troubleshooting Guide */}
      <div className="bg-blue-950/50 border border-blue-800/80 p-2.5 rounded-lg mb-2.5 flex flex-col gap-1 text-[10.5px] text-blue-200">
        <div className="font-bold text-blue-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Panduan Penanganan Latensi Sinkronisasi:</span>
        </div>
        <p className="text-[10px] leading-relaxed text-neutral-300">
          Jika angka di layar terlambat berubah mengikuti timbangan fisik:
        </p>
        <ul className="list-disc pl-4 text-[9.5px] text-neutral-300 space-y-0.5">
          <li><strong>Buffer Antrean Serial:</strong> Terjadi jika tab browser diminimalkan/tidak aktif. Klik tombol di bawah untuk membersihkan buffer.</li>
          <li><strong>Baud Rate:</strong> Pastikan baud rate sesuai spesifikasi GST-9700 (standard 9600 bps).</li>
          <li><strong>Kabel RS-232:</strong> Periksa sambungan konverter USB-to-Serial pada COM port.</li>
        </ul>
      </div>

      {/* Force Sync Action Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleForceSync();
          setIsWeightTooltipOpen(false);
        }}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        PAKSA SINKRONKAN &amp; FLUSH BUFFER SEKARANG
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans" id="weighbridge-main">
      
      {/* 1. PHYSICAL HARDWARE INDICATOR EMULATOR (GSC GST-9700) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-stone-900 border-4 border-stone-700 rounded-2xl p-4 sm:p-5 shadow-2xl text-white">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-wider font-extrabold text-stone-200 bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700">
                GSC GST-9700
              </span>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest hidden sm:inline">Weighing Terminal</span>
            </div>
            <span className="text-xs bg-red-600 font-bold px-2 py-0.5 rounded animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]">
              {t.weighingIndicator}
            </span>
          </div>

          {/* LED Display screen - Red 7-Segment Style like physical GST-9700 */}
          <div 
            onClick={() => setIsWeightTooltipOpen(!isWeightTooltipOpen)}
            className="bg-black border-2 border-stone-800 rounded-xl p-4 sm:p-5 flex flex-col items-end relative overflow-visible shadow-inner my-2 cursor-pointer group hover:border-red-600/80 transition"
            title="Klik untuk info latensi & status koneksi real-time"
          >
            {/* Status LEDs on indicator screen */}
            <div className="absolute top-2.5 left-3 flex items-center gap-2 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
              <div className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${simulatorWeight > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse' : 'bg-red-950'}`}></span>
                <span className="text-[9px] font-mono text-stone-300 font-bold">STABLE</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${simulatorWeight === 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)] animate-pulse' : 'bg-amber-950'}`}></span>
                <span className="text-[9px] font-mono text-stone-300 font-bold">ZERO</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${simulatorWeight > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-emerald-950'}`}></span>
                <span className="text-[9px] font-mono text-stone-300 font-bold">GROSS</span>
              </div>
            </div>
            
            {/* LARGE SEVEN SEGMENT RED DIGITAL LED RESEMBLANCE */}
            <div className="flex items-baseline gap-2 mt-6 sm:mt-5">
              <div className="text-red-500 font-mono text-5xl sm:text-6xl font-black tracking-widest leading-none drop-shadow-[0_0_14px_rgba(239,68,68,0.95)] group-hover:text-red-400 transition">
                {simulatorWeight.toLocaleString('id-ID')}
              </div>
              <div className="text-red-400 font-mono text-sm sm:text-base font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">kg</div>
              <Info className="w-4 h-4 text-red-400 opacity-70 group-hover:opacity-100 animate-pulse ml-1 shrink-0" />
            </div>

            {/* Tooltip Popup on Hover / Click */}
            <div className={`absolute left-0 top-full mt-1 z-50 transition-all duration-200 ${
              isWeightTooltipOpen ? 'block' : 'hidden group-hover:block'
            }`}>
              {renderScaleLatencyTooltip("top-full left-0 mt-1")}
            </div>
          </div>

          {/* PHYSICAL TACTILE PUSH BUTTONS ON GST-9700 FRONT PANEL */}
          <div className="grid grid-cols-4 gap-1.5 mt-2 mb-3 bg-stone-950 p-2 rounded-xl border border-stone-800">
            <button type="button" onClick={resetZero} className="bg-stone-800 hover:bg-stone-700 text-red-400 font-mono text-[10px] font-bold py-1.5 rounded-lg border border-stone-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-red-500 mb-0.5"></span>
              ZERO
            </button>
            <button type="button" onClick={() => applySimulatorPreset(0)} className="bg-stone-800 hover:bg-stone-700 text-amber-400 font-mono text-[10px] font-bold py-1.5 rounded-lg border border-stone-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-amber-500 mb-0.5"></span>
              TARE
            </button>
            <button type="button" onClick={() => (window as any).__showToast?.("📊 MODE GROSS / NET GST-9700: Tampilan disinkronkan ke Mode Bruto", "info")} className="bg-stone-800 hover:bg-stone-700 text-blue-400 font-mono text-[10px] font-bold py-1.5 rounded-lg border border-stone-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-blue-500 mb-0.5"></span>
              G / N
            </button>
            <button type="button" onClick={handleForceSync} className="bg-stone-800 hover:bg-stone-700 text-emerald-400 font-mono text-[10px] font-bold py-1.5 rounded-lg border border-stone-700 flex flex-col items-center justify-center active:scale-95 transition cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mb-0.5"></span>
              PRINT/SYNC
            </button>
          </div>

          {/* IFRAME PREVIEW ALERT BANNER */}
          {isInIframe && (
            <div className="bg-amber-950/90 border-2 border-amber-500 rounded-xl p-3 my-2 text-amber-200 text-xs font-sans shadow-lg">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Koneksi Kabel USB RS-232 Indikator GST-9700</span>
              </div>
              <p className="text-[10.5px] leading-relaxed mb-2 text-amber-100 font-sans">
                Aplikasi saat ini dibuka di dalam Frame Preview. Browser Chrome memblokir izin port serial di dalam iframe. Buka di Tab Baru agar kabel USB GST-9700 dapat langsung tersambung & membaca berat fisik secara otomatis (14.860 Kg / 14.940 Kg).
              </p>
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                BUKA APLIKASI DI TAB BARU (AKSES RS-232 KABEL USB)
              </button>
            </div>
          )}

          {/* KONEKSI TIMBANGAN FISIK REALTIME (WEB SERIAL) */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 my-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black tracking-wider uppercase text-stone-300 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSerialConnected || isSimulatedStreamActive ? 'bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,1)]' : 'bg-stone-600'}`} />
                Koneksi Timbangan Fisik GST-9700
              </span>
              {(isSerialConnected || isSimulatedStreamActive) ? (
                <span className="text-[9px] bg-green-950 text-green-300 border border-green-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  SINKRON BERHASIL
                </span>
              ) : !isSerialSupported ? (
                <span className="text-[8px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Tidak Didukung
                </span>
              ) : null}
            </div>

            {isSerialSupported ? (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[8px] text-stone-400 font-black uppercase font-mono">Baud Rate</label>
                    <select
                      value={serialBaudRate}
                      onChange={(e) => setSerialBaudRate(Number(e.target.value))}
                      disabled={isSerialConnected}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-1.5 py-1 font-mono outline-none cursor-pointer"
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

                  <div>
                    <label className="block text-[8px] text-stone-400 font-black uppercase font-mono">Data Bits</label>
                    <select
                      value={serialDataBits}
                      onChange={(e) => setSerialDataBits(Number(e.target.value))}
                      disabled={isSerialConnected}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-1.5 py-1 font-mono outline-none cursor-pointer"
                    >
                      <option value="8">8-Bit (8-N-1)</option>
                      <option value="7">7-Bit (7-E-1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] text-stone-400 font-black uppercase font-mono">Parity</label>
                    <select
                      value={serialParity}
                      onChange={(e) => setSerialParity(e.target.value as any)}
                      disabled={isSerialConnected}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-1.5 py-1 font-mono outline-none cursor-pointer"
                    >
                      <option value="none">None (Tanpa)</option>
                      <option value="even">Even (Genap)</option>
                      <option value="odd">Odd (Ganjil)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {isSerialConnected ? (
                    <button
                      type="button"
                      onClick={disconnectSerial}
                      className="flex-1 bg-red-700 hover:bg-red-600 text-white font-mono font-bold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer shadow"
                    >
                      PUTUSKAN SERIAL RS-232
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={connectSerial}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer shadow flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      HUBUNGKAN TIMBANGAN FISIK GST-9700
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsSimulatedStreamActive(!isSimulatedStreamActive);
                      if (!isSimulatedStreamActive) {
                        (window as any).__showToast?.("⚡ DEMO AUTO-STREAM DIAKTIFKAN: Timbangan bergerak otomatis mensimulasikan berat kendaraan real-time GST-9700!", "success");
                      }
                    }}
                    className={`py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
                      isSimulatedStreamActive 
                        ? 'bg-amber-600 text-white border-amber-500 shadow' 
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                    }`}
                    title="Aktifkan simulasi streaming otomatis jika tidak ada kabel fisik terhubung"
                  >
                    {isSimulatedStreamActive ? 'STOP AUTO-DEMO' : 'DEMO AUTO-STREAM'}
                  </button>
                </div>

                {serialError && (
                  <div className="bg-red-950/90 border border-red-700 p-2.5 rounded-lg text-[10px] text-red-200 font-mono leading-relaxed flex flex-col gap-2">
                    <p>{serialError}</p>
                    <div className="pt-1 border-t border-red-800/80">
                      <span className="block text-[9px] text-amber-300 font-bold mb-1 font-sans">
                        ⚡ Klik salah satu Baud Rate di bawah untuk mencoba ulang secara otomatis:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                        <button
                          type="button"
                          onClick={() => reopenSerialWithConfig(2400, 8, 'none')}
                          className="bg-red-900 hover:bg-red-800 text-yellow-300 font-bold py-1 px-1.5 rounded text-[10px] border border-red-600 cursor-pointer text-center"
                        >
                          Coba 2400 bps
                        </button>
                        <button
                          type="button"
                          onClick={() => reopenSerialWithConfig(4800, 8, 'none')}
                          className="bg-red-900 hover:bg-red-800 text-yellow-300 font-bold py-1 px-1.5 rounded text-[10px] border border-red-600 cursor-pointer text-center"
                        >
                          Coba 4800 bps
                        </button>
                        <button
                          type="button"
                          onClick={() => reopenSerialWithConfig(9600, 8, 'none')}
                          className="bg-red-900 hover:bg-red-800 text-yellow-300 font-bold py-1 px-1.5 rounded text-[10px] border border-red-600 cursor-pointer text-center"
                        >
                          Coba 9600 bps
                        </button>
                        <button
                          type="button"
                          onClick={() => reopenSerialWithConfig(1200, 8, 'none')}
                          className="bg-red-900 hover:bg-red-800 text-yellow-300 font-bold py-1 px-1.5 rounded text-[10px] border border-red-600 cursor-pointer text-center"
                        >
                          Coba 1200 bps
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-stone-400 font-mono italic leading-normal bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex flex-col gap-1.5">
                  {isSerialConnected || isSimulatedStreamActive ? (
                    <>
                      <div className="flex justify-between items-center text-green-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                          SINKRON BERHASIL: GST-9700 ({simulatorWeight.toLocaleString('id-ID')} Kg)
                        </span>
                        <span className="text-[8px] bg-green-950 text-green-300 px-1.5 py-0.5 rounded border border-green-800">
                          {rxPacketCount} Frame | {lastRxTime || 'Real-time'}
                        </span>
                      </div>
                      {lastRawSerialData && (
                        <div className="text-stone-300 font-mono text-[9px] bg-black/80 p-1 rounded border border-stone-800 break-all">
                          ASCII Stream GST-9700: <code className="text-yellow-300 font-bold">{lastRawSerialData}</code>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-1 text-stone-400 font-sans text-[9.5px]">
                      <span>Sambungkan kabel RS-232 indikator GST-9700 ke USB PC/Laptop, sesuaikan Baud Rate (default 9600 bps), lalu klik <strong>HUBUNGKAN TIMBANGAN FISIK GST-9700</strong>.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-red-400 font-mono italic leading-relaxed">
                Browser Anda tidak mendukung Web Serial API. Pastikan menggunakan browser berbasis Chromium desktop terbaru seperti Google Chrome atau Microsoft Edge.
              </p>
            )}
          </div>

          {/* Controls to Set or Enter physical setup weights */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono text-neutral-300 font-bold">INPUT / KETIK BERAT TIMBANGAN MANUALLY</label>
              <span className="text-[10px] text-red-400 font-mono">Aktual: {simulatorWeight.toLocaleString('id-ID')} Kg</span>
            </div>
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
                placeholder="Misal: 14860 atau 14940"
                className="bg-neutral-900 border border-neutral-600 text-red-400 font-mono text-center text-sm sm:text-lg rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-red-500 font-bold shadow-inner"
              />
              <button 
                type="submit" 
                className="bg-red-700 hover:bg-red-600 text-white font-mono px-3 py-1 text-xs sm:text-sm rounded font-bold transition shrink-0 cursor-pointer shadow"
              >
                SINKRONKAN
              </button>
            </form>
          </div>

          {/* Quick Preset Buttons matching physical indicator photos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
            <button type="button" onClick={() => applySimulatorPreset(4210)} className="bg-red-900/90 hover:bg-red-800 text-yellow-300 font-bold font-mono py-2 rounded text-[11px] sm:text-xs px-1 text-center border border-red-600 shadow flex items-center justify-center gap-1 cursor-pointer col-span-2 sm:col-span-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block shrink-0"></span>
              4,210 KG (GST-9700)
            </button>
            <button type="button" onClick={() => applySimulatorPreset(4350)} className="bg-red-900/90 hover:bg-red-800 text-yellow-300 font-bold font-mono py-2 rounded text-[11px] sm:text-xs px-1 text-center border border-red-600 shadow flex items-center justify-center gap-1 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block shrink-0"></span>
              4,350 KG
            </button>
            <button type="button" onClick={() => applySimulatorPreset(14860)} className="bg-red-900/90 hover:bg-red-800 text-yellow-300 font-bold font-mono py-2 rounded text-[11px] sm:text-xs px-1 text-center border border-red-600 shadow flex items-center justify-center gap-1 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block shrink-0"></span>
              14,860 KG
            </button>
            <button type="button" onClick={() => applySimulatorPreset(14940)} className="bg-red-900/90 hover:bg-red-800 text-yellow-300 font-bold font-mono py-2 rounded text-[11px] sm:text-xs px-1 text-center border border-red-600 shadow flex items-center justify-center gap-1 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block shrink-0"></span>
              14,940 KG
            </button>
            <button type="button" onClick={() => applySimulatorPreset(11330)} className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center border border-stone-700 cursor-pointer">
              11,330 KG
            </button>
            <button type="button" onClick={() => applySimulatorPreset(3560)} className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center border border-stone-700 cursor-pointer">
              3,560 KG
            </button>
            <button type="button" onClick={() => applySimulatorPreset(4250)} className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center border border-stone-700 cursor-pointer">
              4,250 KG
            </button>
            <button type="button" onClick={resetZero} className="bg-stone-950 hover:bg-stone-900 text-red-400 font-bold border border-red-950 font-mono py-1.5 rounded text-[10px] sm:text-xs px-1 text-center cursor-pointer col-span-2 sm:col-span-1">
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
            <div className="bg-neutral-950 border border-[#2d4d8c] p-3 rounded mb-3 flex justify-between items-center relative shadow-inner overflow-visible">
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

              {/* Interactive Tooltip Weight Display Container */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsWeightTooltipOpen(!isWeightTooltipOpen)}
                  className="text-right flex items-baseline gap-2 cursor-pointer focus:outline-none p-1 rounded hover:bg-blue-900/40 transition"
                  title="Klik atau sentuh untuk melihat status koneksi real-time & latensi sinkronisasi"
                >
                  <span className="text-blue-400 font-mono text-4xl sm:text-5xl font-black relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] tracking-tight">
                    {simulatorWeight.toLocaleString('id-ID')}
                  </span>
                  <span className="text-blue-400 font-mono text-sm font-bold">kg</span>
                  
                  {/* Status Info Badge */}
                  <span className="inline-flex items-center gap-1 ml-1 bg-blue-950/90 text-blue-300 border border-blue-600/80 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold hover:bg-blue-900 transition shadow">
                    <Info className="w-3 h-3 text-blue-400 animate-pulse" />
                    <span className="hidden sm:inline">Info Latensi</span>
                  </span>
                </button>

                {/* Tooltip Overlay */}
                <div className={`absolute right-0 top-full mt-2 z-50 transition-all duration-200 ${
                  isWeightTooltipOpen ? 'block' : 'hidden group-hover:block'
                }`}>
                  {renderScaleLatencyTooltip("top-full right-0 mt-2")}
                </div>
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
            <div className="bg-[#122345] border border-[#2d4d8c]/80 rounded p-2 mb-4 flex flex-wrap justify-between items-center gap-2 text-xs overflow-visible relative">
              <div 
                className="flex items-center gap-1.5 cursor-pointer relative group"
                onClick={() => setIsWeightTooltipOpen(!isWeightTooltipOpen)}
                title="Hover / Klik untuk status latensi"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[#a0c5fc] font-semibold">Berat Timbangan Fisik GST-9700:</span>
                <span className="text-yellow-300 font-mono font-bold text-sm bg-neutral-950/80 px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1.5 hover:bg-neutral-900 transition">
                  {simulatorWeight.toLocaleString('id-ID')} kg
                  <Info className="w-3 h-3 text-yellow-400 opacity-80" />
                </span>

                <div className={`absolute left-0 top-full mt-2 z-50 transition-all duration-200 ${
                  isWeightTooltipOpen ? 'block' : 'hidden group-hover:block'
                }`}>
                  {renderScaleLatencyTooltip("top-full left-0 mt-2")}
                </div>
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
                    <span className="text-blue-400 font-semibold font-mono">
                      {selectedTicket 
                        ? `${(selectedTicket.timbang1Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` 
                        : `${simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg`}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ({selectedTicket ? selectedTicket.timbang1Time : 'Live Scale'})
                  </div>
                </div>

                <div className="pt-0.5">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>{t.weigh2Label}</span>
                    <span className="text-orange-400 font-semibold font-mono">
                      {selectedTicket && selectedTicket.timbang2Time 
                        ? `${(selectedTicket.timbang2Weight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg` 
                        : (selectedTicket ? `${simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')} kg (Live)` : '-')}
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
                    <span className="text-yellow-300 font-bold font-mono text-base">
                      {selectedTicket 
                        ? (selectedTicket.grossWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') 
                        : simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                    </span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0c5fc]">{t.tareWeightLabel}</span>
                  <div className="text-right">
                    <span className="text-[#efefef] font-mono">
                      {selectedTicket 
                        ? (selectedTicket.tareWeight ?? 0).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') 
                        : (selectedTicket ? simulatorWeight.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '0')}
                    </span>
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
