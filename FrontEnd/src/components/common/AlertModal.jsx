import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

/**
 * AlertModal Component
 * Displays success, error, or warning alerts
 * 
 * @param {string} type - 'success', 'error', or 'warning'
 * @param {string} title - Main title of the alert
 * @param {string} message - Detailed message
 * @param {function} onClose - Callback when alert is closed
 * @param {number} autoCloseMs - Auto close after ms (0 = no auto-close)
 * @param {function} onConfirm - Optional confirm button callback
 */
export default function AlertModal({
  isOpen,
  type = 'success',
  title = '',
  message = '',
  onClose = () => {},
  autoCloseMs = 3000,
  onConfirm = null,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) {
  useEffect(() => {
    if (isOpen && autoCloseMs > 0 && !onConfirm) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose, onConfirm]);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          button: 'bg-green-600 hover:bg-green-700',
          buttonCancel: 'text-gray-700 hover:bg-gray-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          button: 'bg-red-600 hover:bg-red-700',
          buttonCancel: 'text-gray-700 hover:bg-gray-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          buttonCancel: 'text-gray-700 hover:bg-gray-100'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          button: 'bg-blue-600 hover:bg-blue-700',
          buttonCancel: 'text-gray-700 hover:bg-gray-100'
        };
    }
  };

  const colors = getColors();

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-3">
      <div className={`${colors.bg} border ${colors.border} rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-start gap-4">
          <Icon size={32} className={`flex-shrink-0 ${colors.icon}`} />
          <div className="flex-1">
            {title && <h3 className={`text-lg font-bold ${colors.title} mb-2`}>{title}</h3>}
            {message && <p className="text-sm text-gray-700 leading-relaxed">{message}</p>}
          </div>
          {!onConfirm && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {onConfirm && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-300">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition ${colors.button}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${colors.buttonCancel}`}
            >
              {cancelText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
