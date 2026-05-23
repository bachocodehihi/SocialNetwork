"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Alert from "./alert";

type AlertType = "error" | "success" | "info" | "warning";

interface AlertState {
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((message: string, type: AlertType = "error") => {
    setAlert({ message, type });
  }, []);

  const showSuccess = useCallback((message: string) => showAlert(message, "success"), [showAlert]);
  const showError = useCallback((message: string) => showAlert(message, "error"), [showAlert]);
  const showWarning = useCallback((message: string) => showAlert(message, "warning"), [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning }}>
      {children}
      {alert && (
        <Alert 
          message={alert.message} 
          type={alert.type}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};