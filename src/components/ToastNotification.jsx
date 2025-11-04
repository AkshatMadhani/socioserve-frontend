
import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ToastProvider');
  }
  return context;
};

const Toast = ({ message, type, onClose }) => {
  const config = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      textColor: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      textColor: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-500',
      icon: Info,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800'
    }
  };

  const { bg, icon: Icon, iconColor, textColor } = config[type];

  return (
    <div className={`${bg} border-l-4 rounded-lg shadow-xl p-4 min-w-[320px] animate-slideIn flex items-start gap-3`}>
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${textColor} font-medium flex-1 text-sm`}>{message}</p>
      <button
        onClick={onClose}
        className={`${iconColor} hover:opacity-70 transition flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText, cancelText, type }) => {
  const iconConfig = {
    danger: { bg: 'bg-red-100', icon: AlertCircle, color: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700' },
    warning: { bg: 'bg-yellow-100', icon: AlertTriangle, color: 'text-yellow-600', btnColor: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { bg: 'bg-blue-100', icon: Info, color: 'text-blue-600', btnColor: 'bg-blue-600 hover:bg-blue-700' }
  };

  const config = iconConfig[type] || iconConfig.warning;
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={`${config.bg} p-3 rounded-full flex-shrink-0`}>
            <Icon className={config.color} size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 ${config.btnColor} text-white px-6 py-3 rounded-lg font-semibold transition`}
          >
            {confirmText || 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            {cancelText || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const confirm = (message, options = {}) => {
    const {
      title = 'Confirm Action',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'warning'
    } = options;

    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  };

  const toastValue = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration)
  };

  const confirmValue = { confirm };

  return (
    <ToastContext.Provider value={toastValue}>
      <ConfirmContext.Provider value={confirmValue}>
        {children}
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md pointer-events-none">
          <div className="pointer-events-auto space-y-2">
            {toasts.map(toast => (
              <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
          </div>
        </div>
        {confirmDialog && (
          <ConfirmDialog {...confirmDialog} />
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);