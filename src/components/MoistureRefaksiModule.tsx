/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { cornRefaksiTable, mockCornMoistureRefaksi, RefaksiRegion } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { Percent, Droplet, TriangleAlert as AlertTriangle, Calculator, MapPin, Table2 } from 'lucide-react';

export default function MoistureRefaksiModule() {
  const { t } = useLanguage();
  const [moisture, setMoisture] = useState<number>(16.5);
  const [baseWeight, setBaseWeight] = useState<number>(10000);
  const [pricePerKg, setPricePerKg] = useState<number>(4500);
  const [region, setRegion] = useState<RefaksiRegion>('LOKAL');

  const refaksiDetails = mockCornMoistureRefaksi(moisture, region);
  const refaksiPercent = refaksiDetails.refaksiPercent;

  const rawValue = baseWeight * pricePerKg;
  const refaksiWeightDeduction = Math.round(baseWeight * (refaksiPercent / 100));
  const netWeight = baseWeight - refaksiWeightDeduction;
  const finalValue = netWeight * pricePerKg;
  const lostValue = rawValue - finalValue;

  const lokal = cornRefaksiTable.LOKAL;
  const bone = cornRefaksiTable.BONE;

  return (
    <div className="flex flex-col gap-6" id="moisture-calculator">

      {/* Region Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pilih Tabel Refaksi:</span>
        <div className="flex bg-neutral-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setRegion('LOKAL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              region === 'LOKAL'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            LOKAL (Parepare)
          </button>
          <button
            onClick={() => setRegion('BONE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              region === 'BONE'
                ? 'bg-blue-600 text-white shadow'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            BONE (Luar Daerah)
          </button>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
          region === 'LOKAL'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {region === 'LOKAL' ? 'KA Maks. 30.00%' : 'KA Maks. 31.00%'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: INTEGRATED CALCULATOR */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-neutral-800 text-sm mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <Calculator className={`w-5 h-5 ${region === 'LOKAL' ? 'text-emerald-500' : 'text-blue-500'} animate-bounce`} />
              {t.moistureTitle}
              <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded ${
                region === 'LOKAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
              }`}>{region}</span>
            </h3>

            <div className="flex flex-col gap-4 text-xs text-neutral-600">
              {/* Moisture Slider */}
              <div className={`p-3 rounded-lg border ${
                region === 'LOKAL' ? 'bg-amber-50/40 border-amber-100/50' : 'bg-blue-50/40 border-blue-100/50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    Kadar Air (KA %):
                  </span>
                  <span className="text-lg font-black text-blue-700 bg-white border px-2.5 py-0.5 rounded shadow-sm font-mono">
                    {moisture.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10.0"
                  max={region === 'BONE' ? '31.0' : '30.0'}
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-500 my-2"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>10.0%</span>
                  <span className="text-emerald-600 font-bold">16.0% (Standar)</span>
                  <span>{region === 'BONE' ? '31.0%' : '30.0%'}</span>
                </div>
              </div>

              {/* Weight & Price inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Berat Jagung (Kg)</label>
                  <input
                    type="number"
                    value={baseWeight}
                    onChange={(e) => setBaseWeight(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">Harga Dasar (Rp/Kg)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>

              {/* Result Cards */}
              <div className="border-t border-neutral-200 pt-3 flex flex-col gap-1.5 font-mono">
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">Berat Awal:</span>
                  <span className="font-bold text-neutral-800">{baseWeight.toLocaleString('id-ID')} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">KA Terbaca ({region}):</span>
                  <span className="font-bold text-blue-700">{moisture.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">% Refaksi:</span>
                  <span className="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    -{refaksiPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">Potongan Berat:</span>
                  <span className="font-bold text-red-500">-{refaksiWeightDeduction.toLocaleString('id-ID')} kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-200 text-sm bg-neutral-50 p-2 rounded">
                  <span className="font-bold text-neutral-800">BERAT NET REFAKSI:</span>
                  <span className={`font-black text-base ${region === 'LOKAL' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {netWeight.toLocaleString('id-ID')} kg
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">Nilai Bruto:</span>
                  <span className="text-neutral-600">Rp {rawValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                  <span className="text-neutral-500">Potongan Harga KA:</span>
                  <span className="font-semibold text-red-500">-Rp {lostValue.toLocaleString('id-ID')}</span>
                </div>
                <div className={`flex justify-between py-2.5 text-base p-3 rounded border ${
                  region === 'LOKAL'
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-blue-50 border-blue-100'
                }`}>
                  <span className="font-extrabold text-neutral-900">NILAI BAYAR NETTO:</span>
                  <span className={`font-black ${region === 'LOKAL' ? 'text-emerald-700' : 'text-blue-700'}`}>
                    Rp {finalValue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Status Alert */}
              <div className={`p-3 rounded-lg border flex gap-2 ${
                moisture <= 16.0 ? 'bg-green-50 border-green-100 text-green-800' :
                moisture <= 20.0 ? 'bg-amber-50 border-amber-100 text-amber-800' :
                'bg-red-50 border-red-100 text-red-800'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold text-xs">{refaksiDetails.description}</p>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    {moisture <= 16.0
                      ? 'Aman disimpan di silo jangka panjang tanpa risiko jamur.'
                      : moisture <= 20.0
                      ? 'Kadar air sedang. Dianjurkan blower kipas atau penjemuran singkat.'
                      : 'Kadar air tinggi! Wajib pengeringan dryer segera untuk mencegah pembusukan.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: DUAL LOOKUP TABLES */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* LOKAL Table */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b border-neutral-100 pb-2">
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                <Table2 className="text-emerald-500 w-4.5 h-4.5" />
                Tabel Refaksi KA — <span className="text-emerald-700 ml-1">LOKAL (Parepare)</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono border border-emerald-200">
                19 Jan 2026
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-neutral-150 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-800 text-white font-mono tracking-wider">
                  <tr>
                    <th className="py-2 px-3 text-center w-8">No</th>
                    <th className="py-2 px-3 text-center">% Kadar Air</th>
                    <th className="py-2 px-3 text-center">% Potongan dari Harga</th>
                    <th className="py-2 px-3 hidden sm:table-cell">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[11px]">
                  {lokal.map((row, idx) => {
                    const prevMax = idx === 0 ? 0 : lokal[idx - 1].maxMoisture;
                    const isActive = region === 'LOKAL' && moisture > prevMax && moisture <= row.maxMoisture;
                    const minDisplay = idx === 0 ? '0,00' : lokal[idx - 1].maxMoisture.toFixed(2).replace('.', ',');
                    const maxDisplay = row.maxMoisture.toFixed(2).replace('.', ',');
                    return (
                      <tr key={idx} className={`transition-colors ${
                        isActive
                          ? 'bg-emerald-100 font-bold'
                          : idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                      }`}>
                        <td className="py-2 px-3 text-center text-neutral-400 font-mono">{idx + 1}</td>
                        <td className={`py-2 px-3 text-center font-mono ${isActive ? 'text-emerald-800' : ''}`}>
                          {minDisplay} - {maxDisplay}
                        </td>
                        <td className={`py-2 px-3 text-center font-mono font-bold ${
                          row.refaksiPercent === 0 ? 'text-green-600' :
                          row.refaksiPercent <= 5.0 ? 'text-amber-600' :
                          row.refaksiPercent <= 10.0 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {row.refaksiPercent === 0 ? '0,0%' : `${row.refaksiPercent.toFixed(1).replace('.', ',')}%`}
                          {isActive && <span className="ml-1.5 text-emerald-600 font-black">◄ AKTIF</span>}
                        </td>
                        <td className="py-2 px-3 text-neutral-400 text-[10px] hidden sm:table-cell">{row.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BONE Table */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b border-neutral-100 pb-2">
              <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                <Table2 className="text-blue-500 w-4.5 h-4.5" />
                Tabel Refaksi KA — <span className="text-blue-700 ml-1">BONE (Luar Daerah)</span>
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold font-mono border border-blue-200">
                19 Jan 2026
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-neutral-150 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-800 text-white font-mono tracking-wider">
                  <tr>
                    <th className="py-2 px-3 text-center w-8">No</th>
                    <th className="py-2 px-3 text-center">% Kadar Air</th>
                    <th className="py-2 px-3 text-center">% Potongan dari Harga</th>
                    <th className="py-2 px-3 hidden sm:table-cell">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[11px]">
                  {bone.map((row, idx) => {
                    const prevMax = idx === 0 ? 0 : bone[idx - 1].maxMoisture;
                    const isActive = region === 'BONE' && moisture > prevMax && moisture <= row.maxMoisture;
                    const minDisplay = idx === 0 ? '0,00' : bone[idx - 1].maxMoisture.toFixed(2).replace('.', ',');
                    const maxDisplay = row.maxMoisture.toFixed(2).replace('.', ',');
                    return (
                      <tr key={idx} className={`transition-colors ${
                        isActive
                          ? 'bg-blue-100 font-bold'
                          : idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                      }`}>
                        <td className="py-2 px-3 text-center text-neutral-400 font-mono">{idx + 1}</td>
                        <td className={`py-2 px-3 text-center font-mono ${isActive ? 'text-blue-800' : ''}`}>
                          {minDisplay} - {maxDisplay}
                        </td>
                        <td className={`py-2 px-3 text-center font-mono font-bold ${
                          row.refaksiPercent === 0 ? 'text-green-600' :
                          row.refaksiPercent <= 5.0 ? 'text-amber-600' :
                          row.refaksiPercent <= 10.0 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {row.refaksiPercent === 0 ? '0,0%' : `${row.refaksiPercent.toFixed(1).replace('.', ',')}%`}
                          {isActive && <span className="ml-1.5 text-blue-600 font-black">◄ AKTIF</span>}
                        </td>
                        <td className="py-2 px-3 text-neutral-400 text-[10px] hidden sm:table-cell">{row.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Note */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600">
            <div className="flex items-start gap-2">
              <Percent className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-800 mb-1">Perbedaan Tabel LOKAL vs BONE (Luar Daerah)</p>
                <p className="leading-relaxed">
                  Kedua tabel identik untuk KA ≤ 24,00%. Perbedaan mulai dari KA 24,01%:
                  Tabel <span className="font-bold text-emerald-700">LOKAL</span> menerapkan potongan lebih tinggi
                  (KA 24,01-25,00%: <span className="font-bold text-red-600">11,3%</span>) vs
                  tabel <span className="font-bold text-blue-700">BONE</span> (<span className="font-bold text-red-600">10,3%</span>).
                  Tabel BONE memiliki satu baris ekstra hingga KA 31,00% (19,3%).
                </p>
                <p className="mt-1.5 text-neutral-400 italic text-[10px]">
                  Sumber: Gudang 162 Parepare — Tabel Refaksi Kadar Air, Per Tanggal 19 Januari 2026
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
