"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "info" | "warning";
  onClose?: () => void;
  duration?: number;
  isInline?: boolean; // Thêm prop để hiển thị tại chỗ thay vì ở trên cùng
}

export default function Alert({ 
  message, 
  type = "error", 
  onClose, 
  duration = 4000,
  isInline = false
}: AlertProps) {
  
  useEffect(() => {
    if (duration > 0 && !isInline) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, isInline]);

  const styles = {
    error: "bg-red-50 border-red-200 text-red-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-600",
    info: "bg-blue-50 border-blue-200 text-blue-600",
    warning: "bg-amber-50 border-amber-200 text-amber-600",
  };

  const Icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
  };

  const Icon = Icons[type];

  const containerClasses = isInline 
    ? "relative w-full mb-4" 
    : "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: isInline ? -10 : -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isInline ? -10 : -20, scale: 0.95 }}
        className={containerClasses}
      >
        <div className={`
          ${styles[type]} 
          border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm backdrop-blur-sm bg-opacity-90
        `}>
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          
          <p className="text-sm font-semibold flex-1 leading-tight">
            {message}
          </p>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}