import React from 'react';
import { CheckIcon, AlertIcon } from './Icons';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span className="toast-icon">
            {toast.type === 'error' ? <AlertIcon /> : <CheckIcon />}
          </span>
          <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{toast.message}</p>
        </div>
      ))}
    </div>
  );
};
