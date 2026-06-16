/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CornMoistureRule } from '../types';
import { getRefaksiByRule } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { Percent, Droplet, Table, AlertTriangle, Calculator, FileText, Plus, Minus, Info, Coins } from 'lucide-react';

interface MoistureRefaksiModuleProps {
  rules: CornMoistureRule[];
}

export default function MoistureRefaksiModule({ rules }: MoistureRefaksiModuleProps) {
  const { t, language } = useLanguage();
  const [moisture, setMoisture] = useState<number>(15.5);
  const [baseWeight, setBaseWeight] = useState<number>(10000); // 10 Tons
  const [pricePerKg, setPricePerKg] = useState<number>(4500); // Rp 4,500/kg
  const [ruleType, setRuleType] = useState<'LOKAL' | 'LUAR_DAERAH'>('LOKAL');
  const [formulaFactor, setFormulaFactor] = useState<number>(1.4);

  // Smart masking and typing helper states ("bilangan cerdas")
  const [moistureInput, setMoistureInput] = useState<string>('15,5');
  const [weightInput, setWeightInput] = useState<string>('10.000');
  const [priceInput, setPriceInput] = useState<string>('4.500');

  const refaksiDetails = getRefaksiByRule(moisture, rules, ruleType, formulaFactor);
  const refaksiPercent = refaksiDetails.refaksiPercent;

  // Calculations
  const rawValue = baseWeight * pricePerKg;
  const refaksiWeightBytes = Math.round(baseWeight * (refaksiPercent / 100));
  const netWeightCalculated = baseWeight - refaksiWeightBytes;
  const finalValueBytes = netWeightCalculated * pricePerKg;
  const lostValueBytes = rawValue - finalValueBytes;

  // Smart Handlers
  const handleSliderChange = (valStr: string) => {
    const val = parseFloat(valStr);
    setMoisture(val);
    setMoistureInput(val.toFixed(1).replace('.', ','));
  };

  const handleMoistureTextChange = (valStr: string) => {
    // Only allow digits, comma, and point
    let cleaned = valStr.replace(/[^0-9.,]/g, '');
    
    // Normalize separator
    const commaIndex = cleaned.indexOf(',');
    const dotIndex = cleaned.indexOf('.');
    
    if (dotIndex !== -1 && commaIndex === -1) {
      cleaned = cleaned.replace(/\./g, ',');
    } else if (commaIndex !== -1 && dotIndex !== -1) {
      cleaned = cleaned.replace(/\./g, '');
    }
    
    setMoistureInput(cleaned);

    const parsedFloat = parseFloat(cleaned.replace(',', '.'));
    if (!isNaN(parsedFloat) && parsedFloat >= 0) {
      setMoisture(parsedFloat);
    }
  };

  const handleWeightTextChange = (valStr: string) => {
    const digits = valStr.replace(/\D/g, '');
    if (digits === '') {
      setWeightInput('');
      setBaseWeight(0);
      return;
    }
    const numeric = parseInt(digits, 10);
    setWeightInput(numeric.toLocaleString('id-ID'));
    setBaseWeight(numeric);
  };

  const handlePriceTextChange = (valStr: string) => {
    const digits = valStr.replace(/\D/g, '');
    if (digits === '') {
      setPriceInput('');
      setPricePerKg(0);
      return;
    }
    const numeric = parseInt(digits, 10);
    setPriceInput(numeric.toLocaleString('id-ID'));
    setPricePerKg(numeric);
  };

  // Adjusters & Quick presets
  const adjustMoisture = (delta: number) => {
    const nextVal = Math.min(40.0, Math.max(12.0, parseFloat((moisture + delta).toFixed(1))));
    setMoisture(nextVal);
    setMoistureInput(nextVal.toFixed(1).replace('.', ','));
  };

  const setMoisturePreset = (preset: number) => {
    setMoisture(preset);
    setMoistureInput(preset.toFixed(1).replace('.', ','));
  };

  const adjustWeight = (delta: number) => {
    const nextVal = Math.max(0, baseWeight + delta);
    setBaseWeight(nextVal);
    setWeightInput(nextVal === 0 ? '' : nextVal.toLocaleString('id-ID'));
  };

  const setWeightPreset = (preset: number) => {
    setBaseWeight(preset);
    setWeightInput(preset.toLocaleString('id-ID'));
  };

  const adjustPrice = (delta: number) => {
    const nextVal = Math.max(0, pricePerKg + delta);
    setPricePerKg(nextVal);
    setPriceInput(nextVal === 0 ? '' : nextVal.toLocaleString('id-ID'));
  };

  const setPricePreset = (preset: number) => {
    setPricePerKg(preset);
    setPriceInput(preset.toLocaleString('id-ID'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="moisture-calculator">
      
      {/* LEFT: INTEGRATED CALCULATOR */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-white border border-neutral-200.80 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="flex items-center gap-2">
              <Calculator className="text-amber-500 w-5 h-5" />
              {t.moistureTitle || 'Kalkulator Refaksi Kadar Air Jagung'}
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 animate-pulse">
              Smart Input Aktif
            </span>
          </h3>

          <div className="flex flex-col gap-4 text-xs text-neutral-600">
            {/* INPUT PANEL: MOISTURE / KADAR AIR */}
            <div className="bg-gradient-to-r from-amber-50/70 to-blue-50/30 p-4 rounded-xl border border-amber-100/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  Kadar Air (KA %):
                </span>
                
                {/* Dual input display - Slider display and manual smart input */}
                <div className="flex items-center gap-1">
                  <div className="relative max-w-[80px]">
                    <input 
                      type="text"
                      value={moistureInput}
                      onChange={(e) => handleMoistureTextChange(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-right text-blue-800 font-extrabold focus:outline-none focus:ring-1 focus:ring-blue-500 pr-5 text-xs font-mono shadow-sm"
                    />
                    <span className="absolute right-1.5 top-1 font-bold text-[10px] text-neutral-400">%</span>
                  </div>
                </div>
              </div>

              {/* Range Slider for ultra fluid quick preview */}
              <input
                type="range"
                min="12.0"
                max="40.0"
                step="0.1"
                value={moisture}
                onChange={(e) => handleSliderChange(e.target.value)}
                className="w-full h-2 bg-neutral-200/90 rounded-lg appearance-none cursor-pointer accent-blue-500 my-2"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>12.0% (Kering Silo)</span>
                <span>14.0% (Standar Base)</span>
                <span>40.0% (Luar Tabel Rumus)</span>
              </div>

              {/* Quick Preset Buttons for Moisture */}
              <div className="mt-3 flex flex-wrap gap-1 items-center">
                <span className="text-[9px] text-neutral-400 uppercase font-black mr-1">Presets:</span>
                {[14.0, 15.5, 20.0, 30.5, 31.5, 35.0].map((itemPreset) => (
                  <button
                    key={itemPreset}
                    type="button"
                    onClick={() => setMoisturePreset(itemPreset)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                      Math.abs(moisture - itemPreset) < 0.05
                        ? 'bg-blue-600 text-white border-blue-600 font-black'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    {itemPreset.toFixed(1)}%
                  </button>
                ))}
                
                {/* Tiny step adjusters */}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustMoisture(-0.1)}
                    className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                    title="-0.1%"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustMoisture(0.1)}
                    className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                    title="+0.1%"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Table selector block */}
              <div className="flex justify-between items-center mb-1 mt-4 pt-3 border-t border-dashed border-neutral-200/60">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Tabel Acuan Timbangan:
                </span>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as 'LOKAL' | 'LUAR_DAERAH')}
                  className="bg-white border border-neutral-250 rounded px-2 text-xs py-1 font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="LOKAL">Tabel Lokal (Pinrang/Sekitarnya)</option>
                  <option value="LUAR_DAERAH">Tabel Bone / Luar Daerah</option>
                </select>
              </div>

              {/* Formula factor selector block */}
              <div className="flex justify-between items-center mb-1 mt-2.5">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  Rumus KA Tinggi ({ruleType === 'LOKAL' ? '>30%' : '>31%'}):
                </span>
                <select
                  value={formulaFactor}
                  onChange={(e) => setFormulaFactor(parseFloat(e.target.value))}
                  className="bg-white border border-neutral-250 rounded px-2 text-xs py-1 font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm cursor-pointer"
                >
                  <option value={1.4}>Rumus 1.4 (Sesuai Lampiran)</option>
                  <option value={1.3}>Rumus 1.3 (Sesuai Lampiran)</option>
                </select>
              </div>
            </div>

            {/* WEIGHTS AND PRICES - INTERACTIVE SMART INPUTS (BILANGAN CERDAS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Berat Bruto (Kg) block */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="block text-neutral-600 font-bold text-[11px]">Berat Bruto Jagung (Kg)</label>
                  {baseWeight > 0 && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-black border border-emerald-150">
                      {(baseWeight / 1000).toFixed(2).replace('.', ',')} Ton
                    </span>
                  )}
                </div>
                
                <div className="relative group">
                  <input
                    type="text"
                    value={weightInput}
                    onChange={(e) => handleWeightTextChange(e.target.value)}
                    placeholder="Contoh: 10.000"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm font-black text-neutral-800 shadow-sm"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-bold text-neutral-400 font-mono">kg</span>
                </div>

                {/* Quick Tonnage Presets */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {[1000, 5000, 10000, 15000].map((kg) => (
                    <button
                      key={kg}
                      type="button"
                      onClick={() => setWeightPreset(kg)}
                      className={`text-[9px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
                        baseWeight === kg 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white hover:bg-neutral-150 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {kg / 1000}T
                    </button>
                  ))}
                  
                  {/* Step Adjusters */}
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => adjustWeight(-500)}
                      className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                      title="-500 kg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustWeight(500)}
                      className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                      title="+500 kg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Harga Dasar (Rp/Kg) block */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="block text-neutral-600 font-bold text-[11px]">Harga Dasar (Rp / Kg)</label>
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500 font-mono">Rp</span>
                  <input
                    type="text"
                    value={priceInput}
                    onChange={(e) => handlePriceTextChange(e.target.value)}
                    placeholder="Contoh: 4.500"
                    className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 pl-8 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm font-black text-neutral-800 h-10 shadow-sm"
                  />
                </div>

                {/* Quick Price Presets */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {[4000, 4200, 4500, 4800].map((rp) => (
                    <button
                      key={rp}
                      type="button"
                      onClick={() => setPricePreset(rp)}
                      className={`text-[9px] font-bold px-1.5 py-1 rounded transition-colors cursor-pointer ${
                        pricePerKg === rp 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white hover:bg-neutral-150 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      Rp {rp.toLocaleString('id-ID')}
                    </button>
                  ))}
                  
                  {/* Step Adjusters */}
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => adjustPrice(-50)}
                      className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                      title="-50 Rp"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustPrice(50)}
                      className="p-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-800"
                      title="+50 Rp"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations results display block */}
            <div className="border-t border-neutral-200 pt-3 flex flex-col gap-2 font-mono">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Berat Awal:</span>
                <span className="font-bold text-neutral-800">{baseWeight.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Persentase Refaksi (KA):</span>
                <span className="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                  -{refaksiPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Potongan Susut Berat:</span>
                <span className="font-bold text-red-500">-{refaksiWeightBytes.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200 text-sm bg-neutral-50 px-3 py-2.5 rounded-lg border border-neutral-200/70">
                <span className="font-black text-neutral-700 text-xs self-center">BERAT BERSIH (NETTO):</span>
                <span className="font-black text-emerald-700 text-base">{netWeightCalculated.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Nilai Awal Bruto:</span>
                <span className="text-neutral-600">Rp {rawValue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Potongan Harga KA:</span>
                <span className="font-semibold text-red-500">-Rp {lostValueBytes.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-3 text-base bg-emerald-600 text-white px-3.5 rounded-xl shadow-lg border border-emerald-500">
                <span className="font-extrabold text-white text-xs tracking-wider uppercase self-center">NILAI BAYAR NETTO:</span>
                <span className="font-black text-white text-xl">Rp {finalValueBytes.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* High Moisture Formula Breakdown Card */}
            {((ruleType === 'LOKAL' && moisture > 30.00) || (ruleType === 'LUAR_DAERAH' && moisture > 31.00)) && (() => {
              const base = Math.floor(moisture);
              const diff = base - 14;
              const rawResult = diff * formulaFactor;
              const finalPercent = Math.floor(rawResult);
              return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-red-950 uppercase tracking-wider">
                    <Droplet className="w-4 h-4 text-red-600 animate-pulse" />
                    Penjelasan Rumus Refaksi KA Tinggi ({ruleType})
                  </div>
                  <p className="text-[11px] text-red-900 leading-relaxed font-sans">
                    Kadar air <strong>{moisture}%</strong> berada di luar tabel standar. Sesuai aturan lampiran kerja <strong>{ruleType === 'LOKAL' ? 'LOKAL' : 'BONE DAN SEKITARNYA'}</strong>, pemotongan menggunakan rumus multiplier <strong>{formulaFactor}</strong>:
                  </p>
                  
                  {/* Step by step formula box */}
                  <div className="bg-white/80 border border-red-100 rounded-lg p-3 font-mono text-[11px] text-neutral-800 flex flex-col gap-1.5 shadow-sm">
                    <div className="flex justify-between border-b border-red-50 pb-1">
                      <span className="text-neutral-500">Kadar Air Bulat Ke Bawah:</span>
                      <span className="font-extrabold text-neutral-900">Math.floor({moisture}%) = {base}%</span>
                    </div>
                    <div className="flex justify-between border-b border-red-50 pb-1">
                      <span className="text-neutral-500">Selisih Kadar Air ({base} - 14):</span>
                      <span className="font-extrabold text-neutral-900">{base} - 14 = {diff}</span>
                    </div>
                    <div className="flex justify-between border-b border-red-50 pb-1">
                      <span className="text-neutral-500">Multiplier Faktor Rumus ({formulaFactor}):</span>
                      <span className="font-extrabold text-neutral-900">{diff} x {formulaFactor} = {rawResult.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-red-700 bg-red-50/50 -mx-3 -mb-3 px-3 py-1.5 rounded-b-lg">
                      <span>Total Potongan Akhir (Dibulatkan):</span>
                      <span className="font-black text-xs text-red-650">{finalPercent}%</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-red-800 italic font-medium leading-normal">
                    * Catatan: Nilai pecahan persen {rawResult.toFixed(2)}% dibulatkan ke bawah menjadi {finalPercent}% sesuai contoh lampiran lembar hitung.
                  </p>
                </div>
              );
            })()}

            {/* Interactive guidelines / recommendations */}
            <div className={`p-4.5 rounded-xl border flex gap-3 ${
              moisture <= 14.0 ? 'bg-emerald-50 border-emerald-200/60 text-emerald-900' :
              moisture <= 17.0 ? 'bg-amber-50/70 border-amber-200/60 text-amber-900' :
              'bg-rose-50 border-rose-200/60 text-rose-950'
            }`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 ${moisture > 17.0 ? 'text-red-500 animate-pulse' : ''}`} />
              <div>
                <p className="font-black text-xs">{refaksiDetails.description}</p>
                <p className="text-[10px] opacity-90 mt-1 leading-relaxed">
                  {moisture <= 14.0 ? 'Kadar air optimal (maksimum aman standar nasional). Jagung bisa disimpan di silo / gudang dalam jangka panjang tanpa penyusutan bobot atau pembusukan.' :
                   moisture <= 17.0 ? 'Kadar air sedang. Penyusutan bobot dan suhu gudang harus diperhatikan. Direkomendasikan blower kipas atau penjemuran singkat untuk kualitas terbaik.' :
                   'Kadar air tinggi! Jagung berisiko sangat tinggi mengalami fermentasi, pembusukan, dan jamur jika tidak dikeringkan via mesin Dryer atau diangin-anginkan segera.'
                  }
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT: OFFICIAL LOOKUP CHART */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 pb-2">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
              <Table className="text-indigo-500 w-5 h-5" />
              {ruleType === 'LOKAL' ? 'Tabel Refaksi KA Lokal (Januari 2026)' : 'Tabel Refaksi KA Bone / Luar (Januari 2026)'}
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-black font-mono">STANDAR KA</span>
          </div>

          <p className="text-xs text-neutral-500 mb-3 leading-relaxed font-sans">
            Berikut adalah acuan resmi <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-medium text-[10px]">Tabel Refaksi {ruleType}</code> untuk menentukan susut timbangan pembelian petani berdasarkan kadar air terukur di gudang.
          </p>

          <div className="overflow-x-auto custom-scrollbar border border-neutral-150 rounded-xl">
            <table className="w-full text-left text-xs min-w-[300px]">
              <thead className="bg-[#1e2a42] text-white font-mono tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 text-center">Kadar Air (%)</th>
                  <th className="py-2.5 px-4 text-center">Potongan Harga Pembelian (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px]">
                {rules.filter(r => r.type === ruleType).map((r, i) => {
                  const isActive = moisture >= r.moistureMin && moisture <= r.moistureMax;
                  return (
                    <tr 
                      key={i} 
                      className={`transition-colors ${
                        isActive 
                          ? "bg-amber-100/80 text-amber-950 font-black border-y-2 border-amber-300"
                          : r.refaksiPercent === 0 
                            ? "bg-green-50/70 text-green-950 font-semibold" 
                            : r.refaksiPercent > 10 
                              ? "bg-red-50/30" 
                              : (i % 2 === 0 ? "bg-neutral-50" : "bg-white")
                      }`}
                    >
                      <td className="py-2.5 px-4 text-center font-mono">
                        {isActive && <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full mr-2 animate-ping" />}
                        {r.moistureMin.toFixed(2)} - {r.moistureMax.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-4 text-center font-mono ${isActive ? "text-amber-950 font-black text-xs" : r.refaksiPercent > 0 ? "font-bold text-red-650" : ""}`}>
                        {r.refaksiPercent.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-lg border border-blue-150 text-[11px] text-blue-900 mt-4 leading-relaxed font-sans">
            <span className="font-bold flex items-center gap-1 mb-1 text-slate-800">
              <Percent className="w-4 h-4 text-blue-600" />
              Mengapa Refaksi Sangat Penting di US Bilibili 162?
            </span>
            Jagung yang baru dipanen memiliki kadar air tinggi yang mempercepat pembusukan dan penyusutan bobot akibat penguapan. Refaksi kadar air menyeimbangkan nilai menyusutnya berat saat komoditas dikeringkan.
          </div>
        </div>
      </div>

    </div>
  );
}
