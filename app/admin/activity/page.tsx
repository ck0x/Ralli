"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity } from "lucide-react";

interface ActivityLog {
  id: number;
  store_id?: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
  created_at: string;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/activity");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes("approved") || action.includes("activated")) {
      return "bg-emerald-100 text-emerald-800";
    }
    if (action.includes("rejected") || action.includes("deactivated")) {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-2 text-gray-600">
          Recent actions and events in the system
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No activity logged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.user_email}</span>{" "}
                      performed action on{" "}
                      <span className="font-medium">{log.entity_type}</span>
                      {log.entity_id && ` #${log.entity_id}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
