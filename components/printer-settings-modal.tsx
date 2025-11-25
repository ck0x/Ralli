"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePrinter } from "@/hooks/use-printer";
import { Printer, CheckCircle2, XCircle, Loader2, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrinterSettingsModalProps {
  trigger?: React.ReactNode;
}

export function PrinterSettingsModal({ trigger }: PrinterSettingsModalProps) {
  const { settings, updateSettings, testConnection, isTestingConnection } = usePrinter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [localIp, setLocalIp] = useState(settings.ipAddress);
  const [localPort, setLocalPort] = useState(settings.port.toString());

  // Sync local state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalIp(settings.ipAddress);
      setLocalPort(settings.port.toString());
    }
    setOpen(newOpen);
  };

  const handleSave = () => {
    const port = parseInt(localPort, 10) || 9100;
    updateSettings({
      ipAddress: localIp.trim(),
      port,
      isConnected: false, // Reset connection status on save
    });
    toast({
      title: "Settings Saved",
      description: "Printer settings have been saved. Test the connection to verify.",
    });
    setOpen(false);
  };

  const handleTestConnection = async () => {
    // Save settings first
    const port = parseInt(localPort, 10) || 9100;
    updateSettings({
      ipAddress: localIp.trim(),
      port,
    });

    const success = await testConnection();
    
    if (success) {
      toast({
        title: "Connection Successful",
        description: `Successfully connected to printer at ${localIp}:${port}`,
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the printer. Please check the IP address and ensure the printer is on the same network.",
        variant: "destructive",
      });
    }
  };

  const isValidIp = (ip: string) => {
    if (!ip.trim()) return false;
    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip.trim())) return false;
    const parts = ip.trim().split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const isValidPort = (port: string) => {
    const num = parseInt(port, 10);
    return !isNaN(num) && num > 0 && num <= 65535;
  };

  const canSave = localIp.trim().length > 0;
  const canTest = isValidIp(localIp) && isValidPort(localPort);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Printer Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Thermal Printer Settings
          </DialogTitle>
          <DialogDescription>
            Connect to your Epson thermal printer on the local network. Enter the printer&apos;s IP address to enable order ticket printing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border">
            {settings.isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-700">Connected</p>
                  <p className="text-xs text-slate-500">
                    {settings.ipAddress}:{settings.port}
                  </p>
                </div>
                <Wifi className="h-4 w-4 text-emerald-600" />
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">Not Connected</p>
                  <p className="text-xs text-slate-500">
                    {settings.ipAddress ? "Test connection to verify" : "Enter printer IP address"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* IP Address Input */}
          <div className="space-y-2">
            <Label htmlFor="printerIp">Printer IP Address</Label>
            <Input
              id="printerIp"
              placeholder="192.168.1.100"
              value={localIp}
              onChange={(e) => setLocalIp(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-slate-500">
              Find this in your printer&apos;s network settings or router admin panel
            </p>
          </div>

          {/* Port Input */}
          <div className="space-y-2">
            <Label htmlFor="printerPort">Port</Label>
            <Input
              id="printerPort"
              placeholder="9100"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
              className="font-mono w-32"
              type="number"
              min="1"
              max="65535"
            />
            <p className="text-xs text-slate-500">
              Default is 9100 for most thermal printers
            </p>
          </div>

          {/* Test Connection Button */}
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!canTest || isTestingConnection}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {/* Last Connected Info */}
          {settings.lastConnected && (
            <p className="text-xs text-center text-slate-500">
              Last connected: {new Date(settings.lastConnected).toLocaleString()}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
