// client/src/lib/modal.js
import { createRef } from 'react';

// For use in non-React components or utilities
let modalRef = createRef();

export const setModalRef = (ref) => {
  modalRef = ref;
};

export const showAlert = async (options) => {
  if (modalRef.current) {
    return modalRef.current.alert(options);
  }
  throw new Error('Modal context not available');
};

export const showConfirm = async (options) => {
  if (modalRef.current) {
    return modalRef.current.confirm(options);
  }
  throw new Error('Modal context not available');
};

export const showPrompt = async (options) => {
  if (modalRef.current) {
    return modalRef.current.prompt(options);
  }
  throw new Error('Modal context not available');
};  