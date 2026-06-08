/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Edit, 
  CreditCard,
  X 
} from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'ADD' | 'EDIT' | 'DELETE' | 'PAY' | 'WARNING';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'ADD',
  confirmText,
  cancelText = 'Batal',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  
  // Custom theme variables based on action types
  const getThemeConfig = () => {
    switch (type) {
      case 'DELETE':
        return {
          iconBg: 'bg-rose-50 border-rose-250 border text-rose-600',
          icon: <Trash2 className="w-6 h-6" />,
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
          defaultConfirmText: 'Ya, Hapus Data',
          borderAccent: 'border-l-4 border-l-rose-500'
        };
      case 'EDIT':
        return {
          iconBg: 'bg-amber-50 border-amber-250 border text-amber-600',
          icon: <Edit className="w-6 h-6" />,
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          defaultConfirmText: 'Ya, Simpan Perubahan',
          borderAccent: 'border-l-4 border-l-amber-500'
        };
      case 'PAY':
        return {
          iconBg: 'bg-indigo-50 border-indigo-250 border text-indigo-600',
          icon: <CreditCard className="w-6 h-6" />,
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
          defaultConfirmText: 'Ya, Bayar Cicilan',
          borderAccent: 'border-l-4 border-l-indigo-500'
        };
      case 'WARNING':
        return {
          iconBg: 'bg-yellow-50 border-yellow-250 border text-yellow-600',
          icon: <AlertTriangle className="w-6 h-6" />,
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-750 text-neutral-900 font-extrabold focus:ring-yellow-500',
          defaultConfirmText: 'Ya, Lanjutkan',
          borderAccent: 'border-l-4 border-l-yellow-500'
        };
      case 'ADD':
      default:
        return {
          iconBg: 'bg-emerald-50 border-emerald-250 border text-emerald-600',
          icon: <PlusCircle className="w-6 h-6" />,
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
          defaultConfirmText: 'Ya, Tambahkan Data',
          borderAccent: 'border-l-4 border-l-emerald-500'
        };
    }
  };

  const themeConfig = getThemeConfig();
  const actualConfirmText = confirmText || themeConfig.defaultConfirmText;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* BACKDROP BLUR OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* DIALOG BOX */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`bg-white border text-left border-neutral-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 ${themeConfig.borderAccent} font-sans`}
          >
            {/* Header / Dismiss Button */}
            <div className="p-4 flex items-start justify-between">
              <div className="flex gap-3.5 mt-1">
                <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${themeConfig.iconBg}`}>
                  {themeConfig.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-800 tracking-tight uppercase">
                    {title}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-700 mt-2 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              <button 
                onClick={onCancel}
                className="p-1 rounded-lg hover:bg-neutral-100 transition text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner/Notice */}
            <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-150 flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Aksi ini memerlukan konfirmasi otorisasi operator sebelum dieksekusi.</span>
            </div>

            {/* BUTTON BAR */}
            <div className="bg-white px-5 py-4.5 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-250 transition cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`text-xs font-extrabold px-5 py-2.5 rounded-xl shadow transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeConfig.confirmBtn}`}
              >
                {actualConfirmText}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
