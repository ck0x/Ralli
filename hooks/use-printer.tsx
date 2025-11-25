"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface PrinterSettings {
  ipAddress: string;
  port: number;
  isConnected: boolean;
  lastConnected?: string;
}

interface PrinterContextType {
  settings: PrinterSettings;
  updateSettings: (settings: Partial<PrinterSettings>) => void;
  testConnection: () => Promise<boolean>;
  isTestingConnection: boolean;
}

const defaultSettings: PrinterSettings = {
  ipAddress: "",
  port: 9100,
  isConnected: false,
};

const STORAGE_KEY = "ralli_printer_settings";

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrinterSettings>(defaultSettings);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed, isConnected: false });
      }
    } catch (error) {
      console.warn("Failed to load printer settings from localStorage:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save printer settings to localStorage:", error);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<PrinterSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!settings.ipAddress) {
      return false;
    }

    setIsTestingConnection(true);
    
    try {
      // Send a test connection request to our API
      const response = await fetch("/api/printer/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: settings.ipAddress,
          port: settings.port,
        }),
      });

      const result = await response.json();
      const connected = result.success === true;
      
      updateSettings({ 
        isConnected: connected,
        lastConnected: connected ? new Date().toISOString() : settings.lastConnected,
      });
      
      return connected;
    } catch (error) {
      console.error("Failed to test printer connection:", error);
      updateSettings({ isConnected: false });
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  }, [settings.ipAddress, settings.port, settings.lastConnected, updateSettings]);

  return (
    <PrinterContext.Provider
      value={{
        settings,
        updateSettings,
        testConnection,
        isTestingConnection,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
}

export function usePrinter() {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error("usePrinter must be used within a PrinterProvider");
  }
  return context;
}
