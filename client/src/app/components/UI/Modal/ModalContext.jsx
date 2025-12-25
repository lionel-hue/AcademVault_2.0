// client/src/app/components/UI/Modal/ModalContext.jsx
"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import ModalComponent from './ModalComponent';

const ModalContext = createContext({});

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // alert, confirm, prompt, custom
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    showInput: false,
    inputValue: '',
    inputPlaceholder: '',
    inputType: 'text',
    customContent: null,
    size: 'md', // sm, md, lg, xl
    variant: 'default', // default, success, warning, danger
  });

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const alert = useCallback(({ title, message, confirmText = 'OK', variant = 'default' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        variant,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: closeModal,
      });
    });
  }, [closeModal]);

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        },
      });
    });
  }, [closeModal]);

  const prompt = useCallback(({ title, message, placeholder = '', inputType = 'text', confirmText = 'OK', cancelText = 'Cancel', variant = 'default' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        showInput: true,
        inputValue: '',
        inputPlaceholder: placeholder,
        inputType,
        onConfirm: (value) => {
          closeModal();
          resolve(value);
        },
        onCancel: () => {
          closeModal();
          resolve(null);
        },
      });
    });
  }, [closeModal]);

  const custom = useCallback(({ title, content, size = 'md', onClose }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: 'custom',
        title,
        customContent: content,
        size,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          onClose?.();
          resolve(false);
        },
      });
    });
  }, [closeModal]);

  const value = {
    modal,
    setModal,
    closeModal,
    alert,
    confirm,
    prompt,
    custom,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalComponent />
    </ModalContext.Provider>
  );
}