/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mockCornMoistureRefaksi } from '../data';
import { useLanguage } from '../i18n/LanguageContext';
import { Percent, Droplet, HelpCircle, ArrowRight, Table, AlertTriangle, Calculator } from 'lucide-react';

export default function MoistureRefaksiModule() {
  const { t, language } = useLanguage();
  const [moisture, setMoisture] = useState<number>(15.5);
  const [baseWeight, setBaseWeight] = useState<number>(10000); // 10 Tons
  const [pricePerKg, setPricePerKg] = useState<number>(4500); // Rp 4,500/kg

  const refaksiDetails = mockCornMoistureRefaksi(moisture);
  const refaksiPercent = refaksiDetails.refaksiPercent;

  // Calculations
  const rawValue = baseWeight * pricePerKg;
  const refaksiWeightBytes = Math.round(baseWeight * (refaksiPercent / 100));
  const netWeightCalculated = baseWeight - refaksiWeightBytes;
  const finalValueBytes = netWeightCalculated * pricePerKg;
  const lostValueBytes = rawValue - finalValueBytes;

  const standardPoints = [
    { moisture: 14.0, max: "Standar Maksimum Aman" },
    { moisture: 15.0, max: "Dipotong Berat 1.0%" },
    { moisture: 16.0, max: "Dipotong Berat 2.5%" },
    { moisture: 17.0, max: "Dipotong Berat 4.0%" },
    { moisture: 18.0, max: "Dipotong Berat 5.5%" },
    { moisture: 19.0, max: "Dipotong Berat 7.0%" },
    { moisture: 20.0, max: "Dipotong Berat 9.0%" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="moisture-calculator">
      
      {/* LEFT: INTEGRATED CALCULATOR */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-neutral-800 text-sm mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2">
            <Calculator className="text-amber-500 w-5 h-5 animate-bounce" />
            {t.moistureTitle}
          </h3>

          <div className="flex flex-col gap-4 text-xs text-neutral-600">
            {/* Input Slider for Moisture */}
            <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100/50">
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
                min="12.0"
                max="25.0"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-500 my-2"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>12.0% (Sangat Kering)</span>
                <span>14.0% (Standar)</span>
                <span>25.0% (Basah/Maks)</span>
              </div>
            </div>

            {/* Weights inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Berat Bruto Jagung (Kg)</label>
                <input
                  type="number"
                  value={baseWeight}
                  onChange={(e) => setBaseWeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1 font-semibold">Harga Dasar (Rp / Kg)</label>
                <input
                  type="number"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded p-2 focus:bg-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
              </div>
            </div>

            {/* Results cards */}
            <div className="border-t border-neutral-200 pt-3 flex flex-col gap-2 font-mono">
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Berat Awal:</span>
                <span className="font-bold text-neutral-800">{baseWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Persentase Refaksi:</span>
                <span className="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">-{refaksiPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Potongan Berat (Refaksi):</span>
                <span className="font-bold text-red-500">-{refaksiWeightBytes.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200 text-sm bg-neutral-50 p-2 rounded">
                <span className="font-bold text-neutral-800">BERAT NET REFAKSI:</span>
                <span className="font-black text-emerald-600 text-base">{netWeightCalculated.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Nilai Awal Bruto:</span>
                <span className="text-neutral-600">Rp {rawValue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100 text-[11px]">
                <span className="text-neutral-500">Potongan Harga KA:</span>
                <span className="font-semibold text-red-500">-Rp {lostValueBytes.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-2.5 text-base bg-emerald-50 p-3 rounded border border-emerald-100">
                <span className="font-extrabold text-emerald-950">NILAI BAYAR NETTO:</span>
                <span className="font-black text-emerald-700">Rp {finalValueBytes.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Note of the moisture level */}
            <div className={`p-3 rounded-lg border flex gap-2 ${
              moisture <= 14.0 ? 'bg-green-50 border-green-100 text-green-800' :
              moisture <= 17.0 ? 'bg-amber-50 border-amber-100 text-amber-800' :
              'bg-red-50 border-red-100 text-red-800'
            }`}>
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-xs">{refaksiDetails.description}</p>
                <p className="text-[10px] opacity-90 mt-0.5">
                  {moisture <= 14.0 ? 'Aman untuk disimpan di silos dalam jangka panjang tanpa risiko jamur.' :
                   moisture <= 17.0 ? 'Kadar air sedang. Dianjurkan dilakukan blower kipas atau penjemuran singkat untuk hasil optimal.' :
                   'Kadar air tinggi! Wajib dilakukan pemrosesan pengeringan atau poles kipas segera untuk mencegah pembusukan.'
                  }
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT: OFFICIAL LOOKUP CHART */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 pb-2">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
              <Table className="text-indigo-500 w-5 h-5" />
              Tabel Kebijakan Potongan KA Gudang (162 Refaksi)
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">TA</span>
          </div>

          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Berikut adalah representasi isi file <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-medium text-[10px]">~$TABEL REFAKSI KA JAGUNG 2025.xlsx</code> untuk menentukan susut timbangan pembelian petani berdasarkan kadar air:
          </p>

          <div className="overflow-hidden border border-neutral-150 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e2a42] text-white font-mono tracking-wider">
                <tr>
                  <th className="py-2 px-3 text-center">Kadar Air (%)</th>
                  <th className="py-2 px-3 text-center">Potongan Susut (Refaksi Weight %)</th>
                  <th className="py-2 px-3">Klasifikasi Gudang</th>
                  <th className="py-2 px-3">Tindakan Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px]">
                <tr className="bg-green-50 text-green-950 font-semibold">
                  <td className="py-2 px-3 text-center font-mono">≤ 14.0%</td>
                  <td className="py-2 px-3 text-center font-mono">0.0%</td>
                  <td className="py-2 px-3">Standar Kering Nasional</td>
                  <td className="py-2 px-3">Bisa langsung disimpan di silo utama</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center font-mono">14.1% - 15.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-500">1.0%</td>
                  <td className="py-2 px-3">Kering Ringan</td>
                  <td className="py-2 px-3">Aman palka, ditiup kipas blower ringan</td>
                </tr>
                <tr className="bg-neutral-50/50">
                  <td className="py-2 px-3 text-center font-mono">15.1% - 16.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-500">2.5%</td>
                  <td className="py-2 px-3">Kadar Air Sedang</td>
                  <td className="py-2 px-3">Proses blower wajib, jemur tipis</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center font-mono">16.1% - 17.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-500">4.0%</td>
                  <td className="py-2 px-3">Kadar Air Lembab</td>
                  <td className="py-2 px-3">Campur dengan jagung kering atau poles kipas</td>
                </tr>
                <tr className="bg-amber-50 text-amber-950 font-medium">
                  <td className="py-2 px-3 text-center font-mono">17.1% - 18.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-600">5.5%</td>
                  <td className="py-2 px-3">Kadar Air Basah</td>
                  <td className="py-2 px-3">Wajib pengerjaan pengeringan total</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center font-mono">18.1% - 20.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-600">9.0%</td>
                  <td className="py-2 px-3">Basah Tinggi</td>
                  <td className="py-2 px-3">Risiko jamur tinggi! Proses blower intensif</td>
                </tr>
                <tr className="bg-red-50 text-red-950">
                  <td className="py-2 px-3 text-center font-mono">&gt; 20.0%</td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-red-700">&gt; 11% + 1.5% per 1% KA</td>
                  <td className="py-2 px-3">Basah Ekstrim</td>
                  <td className="py-2 px-3">Tindakan darurat, ditolak atau pot. berat tinggi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50/70 p-3.5 rounded-lg border border-blue-150 text-[11px] text-blue-900 mt-4 leading-relaxed">
            <span className="font-bold flex items-center gap-1 mb-1">
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
