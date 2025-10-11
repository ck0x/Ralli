"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building2,
  MessageSquare,
  Loader2,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Application {
  id: number;
  business_name: string;
  shop_slug: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  business_address?: string;
  business_type: string;
  reason_for_signup: string;
  notes?: string;
  status: string;
  submitted_at: string;
}

export default function ApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingApp, setRejectingApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications?status=${selectedStatus}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: Application) => {
    if (!confirm(`Approve ${app.business_name}? This will create their store and send them access.`)) {
      return;
    }

    setActionLoading(app.id);
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve");
      }

      toast({
        title: "Application Approved! ✅",
        description: `${app.business_name} has been approved and their store is being created.`
      });

      // Refresh list
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (app: Application) => {
    setRejectingApp(app);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingApp) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(rejectingApp.id);
    try {
      const res = await fetch(`/api/applications/${rejectingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectionReason
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reject");
      }

      toast({
        title: "Application Rejected",
        description: `${rejectingApp.business_name} has been notified.`
      });

      setRejectDialogOpen(false);
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="mt-2 text-gray-600">
          Review and manage business applications
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2">
        {["pending", "approved", "rejected"].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No {selectedStatus} applications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{app.business_name}</CardTitle>
                      {getStatusBadge(app.status)}
                    </div>
                    <CardDescription className="mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Submitted {getTimeSince(app.submitted_at)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shop URL */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Shop URL</p>
                  <p className="font-mono text-emerald-700 flex items-center gap-2">
                    ralli.com/{app.shop_slug}
                    <ExternalLink className="h-3 w-3" />
                  </p>
                </div>

                {/* Owner Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Owner</p>
                        <p className="font-medium">{app.owner_name}</p>
                        <p className="text-sm text-gray-600">{app.owner_email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium">{app.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600">Business Type</p>
                        <p className="font-medium capitalize">{app.business_type.replace("-", " ")}</p>
                      </div>
                    </div>
                    {app.business_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-600">Address</p>
                          <p className="text-sm">{app.business_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Why they want to use Ralli</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{app.reason_for_signup}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {app.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-700">{app.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {app.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(app)}
                      disabled={actionLoading === app.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {actionLoading === app.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectDialog(app)}
                      disabled={actionLoading === app.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. The applicant will receive this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., We're not accepting applications in your area at this time..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading !== null}
            >
              {actionLoading !== null ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
