import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
}

export function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Confirm' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{title}</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6 text-gray-600">
              {children}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              {onConfirm && <Button onClick={onConfirm}>{confirmText}</Button>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
