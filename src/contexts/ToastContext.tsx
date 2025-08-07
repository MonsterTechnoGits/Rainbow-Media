'use client';

import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  autoHideDuration?: number;
}

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity, autoHideDuration?: number) => void;
  showSuccess: (message: string, autoHideDuration?: number) => void;
  showError: (message: string, autoHideDuration?: number) => void;
  showWarning: (message: string, autoHideDuration?: number) => void;
  showInfo: (message: string, autoHideDuration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, severity: ToastSeverity = 'info', autoHideDuration = 6000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        message,
        severity,
        autoHideDuration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, autoHideDuration = 4000) => {
      showToast(message, 'success', autoHideDuration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, autoHideDuration = 8000) => {
      showToast(message, 'error', autoHideDuration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, autoHideDuration = 6000) => {
      showToast(message, 'warning', autoHideDuration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, autoHideDuration = 6000) => {
      showToast(message, 'info', autoHideDuration);
    },
    [showToast]
  );

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.autoHideDuration}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={SlideTransition}
          sx={{
            bottom: `${24 + index * 70}px`, // Stack multiple toasts
          }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{
              minWidth: '300px',
              maxWidth: '500px',
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
