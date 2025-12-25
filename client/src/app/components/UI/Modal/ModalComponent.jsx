// client/src/app/components/UI/Modal/ModalComponent.jsx
"use client";

import { useModal } from './ModalContext';
import { useState, useEffect, useRef } from 'react';

export default function ModalComponent() {
  const { modal, closeModal } = useModal();
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (modal.isOpen) {
      setInputValue(modal.inputValue || '');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modal.isOpen, modal.inputValue]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modal.isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal.isOpen, closeModal]);

  if (!modal.isOpen) return null;

  const handleConfirm = () => {
    if (modal.type === 'prompt') {
      modal.onConfirm?.(inputValue);
    } else {
      modal.onConfirm?.();
    }
  };

  const handleCancel = () => {
    modal.onCancel?.();
  };

  const getVariantClasses = () => {
    switch (modal.variant) {
      case 'success':
        return {
          icon: 'fas fa-check-circle',
          iconColor: 'text-success-color',
          headerBg: 'bg-green-900/20',
          borderColor: 'border-green-800/30',
          button: 'bg-success-color hover:bg-green-600',
        };
      case 'warning':
        return {
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'text-warning-color',
          headerBg: 'bg-yellow-900/20',
          borderColor: 'border-yellow-800/30',
          button: 'bg-warning-color hover:bg-yellow-600',
        };
      case 'danger':
        return {
          icon: 'fas fa-times-circle',
          iconColor: 'text-danger-color',
          headerBg: 'bg-red-900/20',
          borderColor: 'border-red-800/30',
          button: 'bg-danger-color hover:bg-red-600',
        };
      default:
        return {
          icon: 'fas fa-info-circle',
          iconColor: 'text-primary-color',
          headerBg: 'bg-blue-900/20',
          borderColor: 'border-blue-800/30',
          button: 'bg-primary-color hover:bg-primary-hover',
        };
    }
  };

  const getSizeClasses = () => {
    switch (modal.size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`modal-content ${sizeClasses} w-full bg-bg-card rounded-xl shadow-2xl overflow-hidden border ${variantClasses.borderColor} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`modal-header p-6 ${variantClasses.headerBg} border-b ${variantClasses.borderColor}`}>
          <div className="flex items-center gap-3">
            <i className={`${variantClasses.icon} ${variantClasses.iconColor} text-xl`}></i>
            <h3 className="text-xl font-bold text-text-primary">{modal.title}</h3>
          </div>
          <button
            onClick={handleCancel}
            className="modal-close p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <i className="fas fa-times text-text-secondary"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-6">
          {modal.customContent ? (
            <div className="custom-content">{modal.customContent}</div>
          ) : (
            <>
              {modal.message && (
                <p className="text-text-secondary mb-6 leading-relaxed">{modal.message}</p>
              )}
              
              {modal.showInput && (
                <div className="mb-6">
                  <input
                    type={modal.inputType}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={modal.inputPlaceholder}
                    className="w-full p-3 bg-bg-secondary border border-border-color rounded-lg focus:outline-none focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 text-text-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer p-6 border-t border-border-color bg-bg-secondary/50">
          <div className="flex flex-col sm:flex-row gap-3">
            {modal.type === 'confirm' || modal.type === 'prompt' || modal.type === 'custom' ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border border-border-color text-text-primary rounded-lg hover:bg-white/5 transition-colors font-medium"
                >
                  {modal.cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-3 ${variantClasses.button} text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {modal.confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 ${variantClasses.button} text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                {modal.confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}