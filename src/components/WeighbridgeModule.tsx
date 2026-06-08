/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WeighbridgeTicket } from '../types';
import { Scale, Printer, Search, PlusCircle, RotateCcw, AlertCircle, FileText, Check, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeighbridgeModuleProps {
  tickets: WeighbridgeTicket[];
  onAddTicket: (ticket: WeighbridgeTicket) => void;
  onUpdateTicket: (ticket: WeighbridgeTicket) => void;
  onDeleteTicket: (id: string) => void;
}

export default function WeighbridgeModule({
  tickets,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket
}: WeighbridgeModuleProps) {
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
  const [printTicket, setPrintTicket] = useState<WeighbridgeTicket | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

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
  const computedNet = selectedTicket 
    ? calculateNetWeight(currentGross, currentTare, selectedTicket.bagDeductionPercent, selectedTicket.refaksiPercent)
    : 0;

  // Handle setting a draft active
  const startNewTicketDraft = () => {
    setIsCreatingNew(true);
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
        setErrorMessage("Nomor Polisi harus diisi!");
        return;
      }
      if (!agency.trim()) {
        setErrorMessage("Agen / Tujuan harus diisi!");
        return;
      }

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
    } else if (selectedTicket) {
      // Re-weigh 1 for existing ticket
      const updated: WeighbridgeTicket = {
        ...selectedTicket,
        timbang1Time: nowStr,
        timbang1Weight: simulatorWeight,
        grossWeight: simulatorWeight,
        netWeight: calculateNetWeight(simulatorWeight, selectedTicket.timbang2Weight, selectedTicket.bagDeductionPercent, selectedTicket.refaksiPercent)
      };
      onUpdateTicket(updated);
      setSelectedTicket(updated);
    }
  };

  // Trigger Weigh II (Tare Weight Input - completing shipment weight transaction)
  const handleTimbang2 = () => {
    if (!selectedTicket) {
      setErrorMessage("Pilih tiket aktif terlebih dahulu!");
      return;
    }
    if (selectedTicket.status === 'COMPLETED') {
      setErrorMessage("Tiket sudah selesai ditimbang 2!");
      return;
    }

    const nowStr = new Date().toLocaleString('id-ID', { hour12: false }).replace(/\//g, '-');
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
    const nr = parseInt(customSimulatorInput) || 0;
    setSimulatorWeight(nr);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => 
    t.ticketNo.includes(searchQuery) || 
    t.policeNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.goodsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.agency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="weighbridge-main font-sans">
      
      {/* 1. PHYSICAL HARWARE INDICATOR EMULATOR (GST-9700) */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-neutral-800 border-4 border-neutral-700 rounded-xl p-4 shadow-xl text-white">
          <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-3">
            <span className="font-mono text-sm tracking-wider font-bold text-neutral-400">GSC GST-9700</span>
            <span className="text-xs bg-red-600 font-bold px-2 py-0.5 rounded animate-pulse">WEIGHING INDICATOR</span>
          </div>

          {/* LED Display screen */}
          <div className="bg-black border-2 border-neutral-900 rounded-lg p-6 flex flex-col items-end relative overflow-hidden shadow-inner my-2">
            <div className="absolute top-2 left-3 flex gap-2">
              <span className={`w-2 h-2 rounded-full ${simulatorWeight > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]' : 'bg-red-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">STABLE</span>
              <span className={`w-2 h-2 rounded-full ${simulatorWeight === 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-green-950'}`}></span>
              <span className="text-[9px] font-mono text-neutral-500">ZERO</span>
            </div>
            
            {/* LARGE SEVEN SEGMENT RESEMBLANCE */}
            <div className="text-red-500 font-mono text-5xl font-extrabold tracking-widest leading-none drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
              {simulatorWeight.toLocaleString('id-ID')}
            </div>
            <div className="text-red-400 font-mono text-sm mt-1">kg</div>
          </div>

          {/* Controls to Mock physical setup weights for the computer */}
          <div className="mt-4">
            <label className="block text-xs font-mono text-neutral-400 mb-1">SIMULATOR BERAT AKTIF (KG)</label>
            <form onSubmit={handleCustomWeightSubmit} className="flex gap-2">
              <input 
                type="number"
                value={customSimulatorInput}
                onChange={(e) => setCustomSimulatorInput(e.target.value)}
                className="bg-neutral-900 border border-neutral-600 text-red-400 font-mono text-center text-lg rounded px-2 py-1 flex-1 focus:outline-none focus:border-red-500"
              />
              <button 
                type="submit" 
                className="bg-red-700 hover:bg-red-600 font-mono px-3 py-1 text-sm rounded font-bold transition"
              >
                APPLY
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
            <button onClick={resetZero} className="bg-neutral-950 hover:bg-neutral-900 text-red-500 font-bold border border-red-950 font-mono py-1 rounded text-xs">
              ZERO SCALE
            </button>
          </div>

          <p className="text-[10px] font-mono text-neutral-400 italic text-center mt-3 bg-neutral-900 px-2 py-1 rounded">
            💡 Gunakan tombol di atas untuk mensimulasikan berat truk di timbangan fisik, lalu catat datanya di komputer.
          </p>
        </div>

        {/* Action Controls for terminal */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-sm text-neutral-800 mb-3 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <Scale className="text-emerald-500 w-4 h-4" />
            Tombol Operasional
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={startNewTicketDraft}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isCreatingNew 
                  ? 'bg-neutral-200 text-neutral-600' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Mulai Timbang Baru
            </button>

            <button
              onClick={handleTimbang1}
              disabled={!isCreatingNew && !selectedTicket}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {isCreatingNew ? "Simpan Timbang I (Gross / Masuk)" : "Re-Weigh Timbang I"}
            </button>

            <button
              onClick={handleTimbang2}
              disabled={isCreatingNew || !selectedTicket || selectedTicket?.status === 'COMPLETED'}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Selesai Timbang II (Tare / Keluar)
            </button>
          </div>
        </div>
      </div>

      {/* 2. CRT COMPUTER MONITOR terminal (APLIKASI JEMBATAN TIMBANG) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Terminal Header */}
        <div className="bg-neutral-900 border border-neutral-800 text-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-[#121c32] px-4 py-2 border-b border-[#254271] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3bbfc6]" />
              <span className="font-mono text-xs text-[#8cbef6] font-bold tracking-widest font-mono">
                APLIKASI JEMBATAN TIMBANG - US BILIBILI 162
              </span>
            </div>
            <div className="text-right text-[11px] font-mono text-[#8cbef6]">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>

          {/* Inner Blue Terminal Display Screen to match image exactly! */}
          <div className="bg-[#1e345e] p-6 font-mono text-[#efefef] relative min-h-[420px] transition-all flex flex-col justify-between">
            
            {/* Screen static and vignette styles */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-30" />
            
            {/* Header labels */}
            <div className="flex justify-between items-start border-b border-[#2d4d8c] pb-2 mb-4">
              <div>
                <div className="text-xs text-[#a0c5fc]">YA TEKNIK, MAKASSAR</div>
                <div className="text-xs text-[#a0c5fc]">TRANSAKSI TIMBANGAN</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#a0c5fc]">APLIKASI JEMBATAN TIMBANG</div>
                <div className="text-xs text-[#a0c5fc]">Rec #: <span className="text-yellow-300">{selectedTicket ? selectedTicket.ticketNo : '000000'} / 19813</span></div>
              </div>
            </div>

            {/* Display Indicator in the terminal */}
            <div className="bg-neutral-950 border border-[#2d4d8c] p-3 rounded mb-4 flex justify-between items-center relative">
              <span className="text-[#a0c5fc] text-xs">BERAT TIMBANGAN SAAT INI</span>
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
                    ⚠️ OUT OF RANGE / OVERWEIGHT
                  </span>
                </div>
              )}
            </div>

            {/* Ticket Information form panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 relative z-10 text-sm">
              
              {/* Left Column Fields */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">Nomor</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {isCreatingNew ? (
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
                  <span className="w-32 text-[#a0c5fc] inline-block">No. Polisi</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {isCreatingNew ? (
                    <input 
                      type="text" 
                      value={policeNo} 
                      onChange={(e) => setPoliceNo(e.target.value.toUpperCase())}
                      className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-2 py-0.5 rounded text-sm w-36 outline-none focus:border-yellow-400"
                      placeholder="DP 8600 AL"
                    />
                  ) : (
                    <span className="text-[#efefef] font-semibold">{selectedTicket ? selectedTicket.policeNo : '-'}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <span className="w-32 text-[#a0c5fc] inline-block">Nama Barang</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {isCreatingNew ? (
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
                  <span className="w-32 text-[#a0c5fc] inline-block">Agen/Tujuan</span>
                  <span className="mr-2 text-[#a0c5fc]">:</span>
                  {isCreatingNew ? (
                    <input 
                      type="text" 
                      value={agency} 
                      onChange={(e) => setAgency(e.target.value.toUpperCase())}
                      className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] px-2 py-0.5 rounded text-sm flex-1 outline-none focus:border-yellow-400"
                      placeholder="Contoh: UCU POLES"
                    />
                  ) : (
                    <span className="text-[#efefef]">{selectedTicket ? selectedTicket.agency : '-'}</span>
                  )}
                </div>

                <div className="border-t border-[#2d4d8c]/60 my-1 pt-1">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>TIMBANG I</span>
                    <span className="text-emerald-400">{selectedTicket ? `${selectedTicket.timbang1Weight.toLocaleString('id-ID')} kg` : '0 kg'}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ({selectedTicket ? selectedTicket.timbang1Time : '-'})
                  </div>
                </div>

                <div className="pt-0.5">
                  <div className="flex justify-between items-center text-xs text-[#a0c5fc]">
                    <span>TIMBANG II</span>
                    <span className="text-orange-400">
                      {selectedTicket && selectedTicket.timbang2Time ? `${selectedTicket.timbang2Weight.toLocaleString('id-ID')} kg` : '-'}
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
                  <span className="text-[#a0c5fc]">Berat Bruto</span>
                  <div className="text-right">
                    <span className="text-yellow-300 font-bold">{selectedTicket ? selectedTicket.grossWeight.toLocaleString('id-ID') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0c5fc]">Berat Tara</span>
                  <div className="text-right">
                    <span className="text-[#efefef]">{selectedTicket ? selectedTicket.tareWeight.toLocaleString('id-ID') : '0'}</span>
                    <span className="text-neutral-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-[#2d4d8c]/60 pb-1.5">
                  <span className="text-[#a0c5fc]">Pot. Krg %</span>
                  <div className="flex items-center">
                    {isCreatingNew ? (
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
                  <span className="text-[#a0c5fc]">Refaksi %</span>
                  <div className="flex items-center">
                    {isCreatingNew ? (
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
                  <span className="text-[#a0c5fc] font-bold text-sm">Berat NETTO</span>
                  <div className="text-right">
                    <span className="text-green-400 font-extrabold text-xl font-mono">{selectedTicket ? computedNet.toLocaleString('id-ID') : '0'}</span>
                    <span className="text-green-400 text-xs ml-1">kg</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-xs text-[#a0c5fc] block mb-1">Catatan :</span>
                  {isCreatingNew ? (
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-[#122345] border border-[#2d4d8c] text-[#efefef] p-1.5 rounded text-xs w-full h-12 outline-none focus:border-yellow-400 resize-none"
                      placeholder="Masukkan catatan timbang..."
                    />
                  ) : (
                    <p className="text-xs text-neutral-300 italic max-h-12 overflow-y-auto bg-[#1a2b4b]/80 p-1 rounded border border-[#2d4d8c]/30">
                      {selectedTicket?.notes || 'Tidak ada catatan'}
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
            <div className="border-t-2 border-[#2d4d8c] pt-2 mt-4 flex flex-wrap gap-2 md:gap-x-4 text-[10px] text-cyan-200 justify-center">
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

        {/* 3. TICKET ARCHIVE AND LIST */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2">
              <Scale className="text-emerald-500 w-5 h-5" />
              Arsip Tiket Jembatan Timbang
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari No. Polisi/Tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">No. Tiket</th>
                  <th className="py-2.5 px-3">No. Polisi</th>
                  <th className="py-2.5 px-3">Barang</th>
                  <th className="py-2.5 px-3">Agen / Mitra</th>
                  <th className="text-right py-2.5 px-3">Timbang I (Kg)</th>
                  <th className="text-right py-2.5 px-3">Timbang II (Kg)</th>
                  <th className="text-right py-2.5 px-3">Netto (Kg)</th>
                  <th className="text-center py-2.5 px-3">Status</th>
                  <th className="text-center py-2.5 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTickets.map((t) => (
                  <tr 
                    key={t.id}
                    onClick={() => { setSelectedTicket(t); setIsCreatingNew(false); }}
                    className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                      selectedTicket?.id === t.id ? 'bg-emerald-50/50 font-medium text-neutral-900 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">
                      {t.ticketNo}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">
                      {t.policeNo}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {t.goodsName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800">{t.agency}</td>
                    <td className="text-right py-2.5 px-3 font-mono">{t.timbang1Weight.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2.5 px-3 font-mono text-orange-600">
                      {t.timbang2Weight > 0 ? t.timbang2Weight.toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="text-right py-2.5 px-3 font-bold font-mono text-emerald-600">
                      {(t.timbang2Weight > 0 
                        ? calculateNetWeight(t.timbang1Weight, t.timbang2Weight, t.bagDeductionPercent, t.refaksiPercent) 
                        : t.timbang1Weight
                      ).toLocaleString('id-ID')}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'
                      }`}>
                        {t.status === 'COMPLETED' ? 'SELESAI' : 'MENUNGGU II'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => setPrintTicket(t)} 
                          title="Cetak Tiket"
                          className="p-1 text-neutral-400 hover:text-emerald-600 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteTicket(t.id)}
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
                      Tidak ada tiket timbangan ditemukan.
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
                  Pratinjau Cetak Slip Timbangan
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
                  <div className="font-bold text-sm tracking-widest text-emerald-950">GUDANG US BILIBILI 162</div>
                  <div className="text-[9px]">SAMPANO, KEC. LAROMPONG TIMUR, LUWU</div>
                  <div className="text-[9px]">SULAWESI SELATAN, INDONESIA</div>
                  <div className="text-[9px] mt-0.5">TELP: 0812-4455-1620</div>
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
                  <span>TIMBANG I (Masuk)</span>
                  <span>{printTicket.timbang1Weight.toLocaleString('id-ID')} Kg</span>
                </div>
                <div className="text-[10px] text-neutral-500 text-right">
                  {printTicket.timbang1Time}
                </div>

                <div className="flex justify-between font-bold mt-1">
                  <span>TIMBANG II (Keluar)</span>
                  <span>{printTicket.timbang2Weight > 0 ? `${printTicket.timbang2Weight.toLocaleString('id-ID')} Kg` : '- -'}</span>
                </div>
                {printTicket.timbang2Time && (
                  <div className="text-[10px] text-neutral-500 text-right">
                    {printTicket.timbang2Time}
                  </div>
                )}

                <div className="border-t border-neutral-300 my-2 pt-2" />

                <div className="flex justify-between">
                  <span>BERAT BRUTO :</span>
                  <span>{(printTicket.timbang1Weight).toLocaleString('id-ID')} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>POTONGAN TARA :</span>
                  <span>{printTicket.tareWeight.toLocaleString('id-ID')} kg</span>
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
                  <span>BERAT NETTO :</span>
                  <span>{calculateNetWeight(printTicket.timbang1Weight, printTicket.timbang2Weight, printTicket.bagDeductionPercent, printTicket.refaksiPercent).toLocaleString('id-ID')} KG</span>
                </div>

                {printTicket.notes && (
                  <div className="mt-3 text-[10px] text-neutral-600 bg-white p-1 rounded border border-neutral-200">
                    <strong>Catatan:</strong> {printTicket.notes}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-center mt-6 text-[9px]">
                  <div>
                    <p className="mb-8">Penerima Staff 162</p>
                    <p className="border-t border-neutral-400 pt-1 font-bold">Wahyu & Tim</p>
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
                    alert("Mencetak slip timbangan ke thermal printer...");
                    setPrintTicket(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Kirim ke Printer (ESC/POS)
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

    </div>
  );
}
