/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, Coins, Scale, Percent } from 'lucide-react';

interface SmartNumberInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  placeholder?: string;
  unit?: string; // e.g. 'Kg', 'Rp', '%', 'Sak'
  mode?: 'weight' | 'currency' | 'percent' | 'general';
  presets?: number[]; // Quick clickable value options
  stepAmount?: number; // Step size for single click +/-
  min?: number;
  max?: number;
  className?: string;
}

// Convert numbers into Indonesian "Terbilang" words or compact shorthand for high accuracy
const getShorthandText = (num: number, mode: 'weight' | 'currency' | 'percent' | 'general', unit: string): string => {
  if (num === 0) return 'Nol';
  
  if (mode === 'percent' || unit === '%') {
    return `${num.toFixed(2).replace('.', ',')}%`;
  }

  if (mode === 'weight' || unit.toLowerCase() === 'kg') {
    if (num >= 1000) {
      const tonObj = num / 1000;
      return `${tonObj.toFixed(2).replace('.', ',')} Ton (${num.toLocaleString('id-ID')} Kg)`;
    }
    return `${num.toLocaleString('id-ID')} Kg`;
  }

  if (mode === 'currency' || unit.toLowerCase() === 'rp') {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2).replace('.', ',')} Miliar Rupiah`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2).replace('.', ',')} Juta Rupiah`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace('.', ',')} Ribu Rupiah`;
    }
  }

  return `${num.toLocaleString('id-ID')} ${unit}`;
};

export default function SmartNumberInput({
  id = `smart-${Math.random().toString(36).substr(2, 9)}`,
  value,
  onChange,
  label,
  placeholder = '0',
  unit = '',
  mode = 'general',
  presets = [],
  stepAmount,
  min = 0,
  max = 999999999,
  className = ''
}: SmartNumberInputProps) {
  // Setup the display value based on initial props
  const formatInitial = (val: number): string => {
    if (val === 0) return '';
    if (mode === 'percent') {
      return val.toFixed(2).replace('.', ',');
    }
    return val.toLocaleString('id-ID');
  };

  const [inputValue, setInputValue] = useState<string>(formatInitial(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync state if external value changes while not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatInitial(value));
    }
  }, [value, isFocused]);

  const handleTextChange = (text: string) => {
    // Only keep numeric digits, dot, and comma
    let cleaned = text.replace(/[^0-9.,-]/g, '');
    
    // Normalize format based on user's intention
    if (mode === 'percent') {
      // In percent mode, permit fractional comma/dot entry
      setInputValue(cleaned);
      let normalized = cleaned;
      if (normalized.includes(',') && normalized.includes('.')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else if (normalized.includes(',')) {
        normalized = normalized.replace(',', '.');
      }
      const parsedFloat = parseFloat(normalized);
      if (!isNaN(parsedFloat)) {
        const clamped = Math.min(max, Math.max(min, parsedFloat));
        onChange(clamped);
      } else {
        onChange(0);
      }
    } else {
      // For integers like weight, money, count
      const digits = cleaned.replace(/\D/g, '');
      if (digits === '') {
        setInputValue('');
        onChange(0);
        return;
      }
      const parsedInt = parseInt(digits, 10);
      const clamped = Math.min(max, Math.max(min, parsedInt));
      setInputValue(clamped.toLocaleString('id-ID'));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reset to accurate format on blur
    if (value === 0) {
      setInputValue('');
    } else {
      setInputValue(formatInitial(value));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value === 0) {
      setInputValue('');
    }
  };

  // Adjusters (+ / -)
  const defaultStep = stepAmount || (mode === 'currency' ? 500 : mode === 'weight' ? 100 : mode === 'percent' ? 0.5 : 1);

  const increment = () => {
    const nextVal = Math.min(max, value + defaultStep);
    onChange(nextVal);
    setInputValue(formatInitial(nextVal));
  };

  const decrement = () => {
    const nextVal = Math.max(min, value - defaultStep);
    onChange(nextVal);
    setInputValue(formatInitial(nextVal));
  };

  // Icon type based on input mode
  const renderIcon = () => {
    if (mode === 'currency') return <Coins className="w-4 h-4 text-amber-500 shrink-0" />;
    if (mode === 'weight') return <Scale className="w-4 h-4 text-sky-500 shrink-0" />;
    if (mode === 'percent') return <Percent className="w-4 h-4 text-teal-500 shrink-0" />;
    return null;
  };

  return (
    <div className={`flex flex-col gap-1 w-full font-sans ${className}`} id={`container-${id}`}>
      {label && (
        <label className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1">
          {label}
        </label>
      )}

      {/* Input Form Controls */}
      <div className={`relative flex items-center w-full transition-all rounded-xl border ${
        isFocused 
          ? 'border-blue-700 ring-2 ring-blue-700/10 bg-white' 
          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
      }`}>
        {/* Left Indicator Icons */}
        <div className="pl-2 sm:pl-3.5 flex items-center gap-1 sm:gap-1.5 pointer-events-none select-none shrink-0">
          {renderIcon()}
          {mode === 'currency' && <span className="text-[11px] sm:text-xs font-bold text-slate-400 font-mono">Rp</span>}
        </div>

        {/* The Text Input */}
        <input
          type="text"
          id={id}
          value={inputValue}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-transparent border-none py-2 sm:py-2.5 px-2 sm:px-3 focus:outline-none focus:ring-0 text-slate-800 font-mono font-bold text-xs sm:text-sm"
        />

        {/* Unit and Plus/Minus adjusters on the Right */}
        <div className="flex items-center gap-1 pr-1 sm:pr-1.5 shrink-0">
          {unit && !isFocused && (
            <span className="text-[10px] sm:text-xs font-black text-slate-400 font-mono tracking-wider select-none bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded border border-slate-200/50">
              {unit}
            </span>
          )}

          {/* Quick Step Buttons - Hidden on touch screen/mobile viewports to save space, visible on tablet & desktop */}
          <div className="hidden sm:flex items-center gap-0.5 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-0.5 ml-1">
            <button
              type="button"
              onClick={decrement}
              tabIndex={-1}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
              title={`Kurangi ${defaultStep}`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="h-3 w-px bg-slate-200"></span>
            <button
              type="button"
              onClick={increment}
              tabIndex={-1}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-700 transition-colors cursor-pointer"
              title={`Tambah ${defaultStep}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Intel / Human readable feedback "Bilangan Cerdas" */}
      {value > 0 && (
        <div className="flex items-center gap-1 pl-1 text-[10px] text-slate-500 font-semibold italic">
          <span className="text-blue-700">✓</span>
          <span>{getShorthandText(value, mode, unit)}</span>
        </div>
      )}

      {/* Preset Quick Links */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-1">
          <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase mr-1">Opsi Cepat:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset);
                setInputValue(formatInitial(preset));
              }}
              className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border transition-all cursor-pointer ${
                value === preset
                  ? 'bg-blue-800 text-white border-blue-800 shadow-sm font-black'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {mode === 'currency' 
                ? (preset / 1000 >= 1000 ? `${preset / 1000000} Jt` : `${preset.toLocaleString('id-ID')}`)
                : mode === 'weight' && preset >= 1000
                  ? `${preset / 1000} T`
                  : preset.toLocaleString('id-ID')
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
