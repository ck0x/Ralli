"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  RotateCcw,
  Search,
  Trash2,
  Download,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { AuthRequired } from "@/components/auth-required";

interface OrderRecord {
  id: string;
  createdAt: string; // ISO
  status: OrderStatus;
  customerName: string;
  contactNumber: string;
  email: string;
  racketBrand: string;
  racketModel: string;
  stringType: string;
  serviceType: string;
  additionalNotes: string;
  // Future fields (prepped for backend) – may be empty now
  requestedTensionMains?: number;
  requestedTensionCross?: number;
  actualTensionMains?: number;
  actualTensionCross?: number;
}

type OrderStatus = "pending" | "in-progress" | "ready" | "picked-up";

const STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "in-progress",
  "ready",
  "picked-up",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  ready: "Ready",
  "picked-up": "Picked Up",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "picked-up": "bg-slate-200 text-slate-700 border-slate-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  // Only table (row) view retained per request
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [authError, setAuthError] = useState(false);

  const storeId = Number(
    process.env.NEXT_PUBLIC_DEFAULT_STORE_ID || process.env.STORE_ID || 1
  );

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?storeId=${storeId}`);
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (!res.ok) throw new Error("api fetch failed");
      const json = await res.json();
      const apiOrders = (json.data || []).map((j: any) => ({
        id: String(j.id),
        createdAt: j.created_at,
        status: (j.status === "in_progress"
          ? "in-progress"
          : j.status) as OrderStatus,
        customerName: j.customer_name,
        contactNumber: j.contact_number,
        email: j.email,
        racketBrand: j.racket_brand,
        racketModel: j.racket_model,
        stringType: j.string_type,
        serviceType: j.service_type?.toLowerCase() || "standard",
        additionalNotes: j.additional_notes || "",
      })) as OrderRecord[];
      setOrders(apiOrders);
      // sync to localStorage for offline fallback
      try {
        localStorage.setItem("racketOrders", JSON.stringify(apiOrders));
      } catch {}
    } catch (err) {
      console.warn("Using localStorage fallback", err);
      try {
        const raw = localStorage.getItem("racketOrders");
        if (raw) setOrders(JSON.parse(raw));
      } catch {}
    }
  }, [storeId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const persist = (next: OrderRecord[]) => {
    setOrders(next);
    try {
      localStorage.setItem("racketOrders", JSON.stringify(next));
    } catch {}
  };

  const serverPatch = async (id: string, payload: any) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const advanceStatus = (id: string) => {
    let changed: OrderRecord | undefined;
    const nextOrders = orders.map((o) => {
      if (o.id !== id) return o;
      const idx = STATUS_SEQUENCE.indexOf(o.status);
      if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return o;
      changed = { ...o, status: STATUS_SEQUENCE[idx + 1] };
      return changed;
    });
    persist(nextOrders);
    if (changed) serverPatch(changed.id, { status: changed.status });
  };

  const revertStatus = (id: string) => {
    let changed: OrderRecord | undefined;
    const nextOrders = orders.map((o) => {
      if (o.id !== id) return o;
      const idx = STATUS_SEQUENCE.indexOf(o.status);
      if (idx <= 0) return o;
      changed = { ...o, status: STATUS_SEQUENCE[idx - 1] };
      return changed;
    });
    persist(nextOrders);
    if (changed) serverPatch(changed.id, { status: changed.status });
  };

  const deleteOrder = (id: string) => {
    if (!confirm("Delete this order?")) return;
    persist(orders.filter((o) => o.id !== id));
    try {
      fetch(`/api/orders/${id}`, { method: "DELETE" });
    } catch {}
  };

  const bulkAdvance = async () => {
    const changed: { id: string; status: OrderStatus }[] = [];
    const nextOrders = orders.map((o) => {
      if (!selectedIds.has(o.id)) return o;
      const idx = STATUS_SEQUENCE.indexOf(o.status);
      if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return o;
      const updated = { ...o, status: STATUS_SEQUENCE[idx + 1] };
      changed.push({ id: updated.id, status: updated.status });
      return updated;
    });
    if (!changed.length) {
      setSelectedIds(new Set());
      return;
    }
    persist(nextOrders);
    setSelectedIds(new Set());
    // Fire & forget server sync
    Promise.all(
      changed.map((c) => serverPatch(c.id, { status: c.status }))
    ).catch(() => {});
  };

  const bulkRestore = async () => {
    const changed: { id: string; status: OrderStatus }[] = [];
    const nextOrders = orders.map((o) => {
      if (!selectedIds.has(o.id)) return o;
      // Only restore picked-up orders
      if (o.status !== "picked-up") return o;
      const updated = { ...o, status: "ready" as OrderStatus };
      changed.push({ id: updated.id, status: updated.status });
      return updated;
    });
    if (!changed.length) {
      setSelectedIds(new Set());
      return;
    }
    persist(nextOrders);
    setSelectedIds(new Set());
    // Fire & forget server sync
    Promise.all(
      changed.map((c) => serverPatch(c.id, { status: c.status }))
    ).catch(() => {});
  };

  const bulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} selected order(s)?`)) return;
    const ids = Array.from(selectedIds);
    persist(orders.filter((o) => !selectedIds.has(o.id)));
    setSelectedIds(new Set());
    // Fire & forget deletes
    Promise.all(
      ids.map((id) => fetch(`/api/orders/${id}`, { method: "DELETE" }))
    ).catch(() => {});
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // (moved below filtered)

  const exportCSV = () => {
    const rows = [
      [
        "id",
        "createdAt",
        "status",
        "customerName",
        "contactNumber",
        "email",
        "racketBrand",
        "racketModel",
        "stringType",
        "serviceType",
        "requestedTensionMains",
        "requestedTensionCross",
        "actualTensionMains",
        "actualTensionCross",
        "additionalNotes",
      ],
      ...orders.map((o) => [
        o.id,
        o.createdAt,
        o.status,
        o.customerName,
        o.contactNumber,
        o.email || "",
        o.racketBrand,
        o.racketModel,
        o.stringType || "",
        o.serviceType,
        o.requestedTensionMains?.toString() || "",
        o.requestedTensionCross?.toString() || "",
        o.actualTensionMains?.toString() || "",
        o.actualTensionCross?.toString() || "",
        (o.additionalNotes || "").replace(/\n/g, " "),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            if (cell.includes(",") || cell.includes('"')) {
              return '"' + cell.replace(/"/g, '""') + '"';
            }
            return cell;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `racket-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    const s = deferredSearch.trim().toLowerCase();

    // First filter by active/archive tab
    const tabFiltered = orders.filter((o) =>
      activeTab === "active"
        ? o.status !== "picked-up"
        : o.status === "picked-up"
    );

    // Then apply status filter
    const statusFiltered = tabFiltered.filter((o) =>
      statusFilter === "all" ? true : o.status === statusFilter
    );

    // Finally apply search
    if (!s) return statusFiltered;

    return statusFiltered.filter((o) => {
      return (
        o.customerName.toLowerCase().includes(s) ||
        o.racketModel.toLowerCase().includes(s) ||
        o.racketBrand.toLowerCase().includes(s)
      );
    });
  }, [orders, activeTab, statusFilter, deferredSearch]);

  const highlight = useCallback(
    (text: string) => {
      const q = deferredSearch.trim();
      if (!q) return text;
      const lower = text.toLowerCase();
      const needle = q.toLowerCase();
      const first = lower.indexOf(needle);
      if (first === -1) return text;
      const parts: React.ReactNode[] = [];
      let cursor = 0;
      while (cursor < text.length) {
        const idx = lower.indexOf(needle, cursor);
        if (idx === -1) {
          parts.push(text.slice(cursor));
          break;
        }
        if (idx > cursor) parts.push(text.slice(cursor, idx));
        parts.push(
          <mark
            key={idx + "-hl"}
            className="bg-emerald-200 text-emerald-900 rounded-sm px-0.5"
          >
            {text.slice(idx, idx + needle.length)}
          </mark>
        );
        cursor = idx + needle.length;
      }
      return <>{parts}</>;
    },
    [deferredSearch]
  );

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((o) => next.delete(o.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((o) => next.add(o.id));
      return next;
    });
  };

  // Show auth required screen if unauthorized
  if (authError) {
    return (
      <AuthRequired
        title="Orders Dashboard"
        message="Please log in to view and manage orders."
      />
    );
  }

  // Calculate counts for tabs
  const activeCount = orders.filter((o) => o.status !== "picked-up").length;
  const archiveCount = orders.filter((o) => o.status === "picked-up").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col 2xl:flex-row gap-4 2xl:items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
            <p className="text-slate-600 mt-1 text-sm">
              Manage racquet stringing workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative group">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search name / model"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-7 w-56"
                aria-label="Search orders"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUS_SEQUENCE.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={exportCSV}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            {/* Removed Clear All button to avoid accidental mass deletion */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab("active");
              setSelectedIds(new Set());
              setStatusFilter("all");
            }}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "active"
                ? "text-emerald-700 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Active Orders
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                activeTab === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("archive");
              setSelectedIds(new Set());
              setStatusFilter("all");
            }}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === "archive"
                ? "text-emerald-700 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Archive
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                activeTab === "archive"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {archiveCount}
            </span>
          </button>
        </div>

        {/* Floating multi-select action bar (no layout shift) */}
        <div
          aria-live="polite"
          className={`fixed left-1/2 -translate-x-1/2 top-[90px] z-40 transition-all duration-200 ease-out ${
            selectedIds.size
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="rounded-full shadow-md ring-1 ring-emerald-300/60 bg-emerald-50/90 backdrop-blur supports-[backdrop-filter]:bg-emerald-50/60 px-5 py-2 flex items-center gap-4 text-sm">
            <span className="font-medium text-emerald-800">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2">
              {activeTab === "active" ? (
                <Button size="sm" variant="outline" onClick={bulkAdvance}>
                  Advance
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={bulkRestore}>
                  Restore
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={bulkDelete}>
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="text-slate-500"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="text-slate-600">
                {activeTab === "active"
                  ? "No active orders match your filters."
                  : "No archived orders match your filters."}
              </p>
              <p className="text-slate-500 text-sm">
                {activeTab === "active"
                  ? "Submit one through the intake form."
                  : "Orders will appear here once they are picked up."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-emerald-600"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAllVisible}
                        />
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Racket</TableHead>
                      <TableHead>String</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-40">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => {
                      const idx = STATUS_SEQUENCE.indexOf(o.status);
                      const next = STATUS_SEQUENCE[idx + 1];
                      const prev = STATUS_SEQUENCE[idx - 1];
                      const selected = selectedIds.has(o.id);
                      return (
                        <TableRow
                          key={o.id}
                          className={selected ? "bg-emerald-50" : ""}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-emerald-600"
                              checked={selected}
                              onChange={() => toggleSelect(o.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {highlight(o.customerName) as any}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`border px-2 py-0.5 text-xs font-medium rounded ${
                                STATUS_COLOR[o.status]
                              }`}
                            >
                              {STATUS_LABEL[o.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {highlight(o.racketBrand || "—") as any}{" "}
                            {highlight(o.racketModel) as any}
                          </TableCell>
                          <TableCell>
                            {o.stringType || (
                              <span className="text-slate-400">(n/a)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {o.serviceType}
                          </TableCell>
                          <TableCell className="text-xs space-y-1">
                            <div>{o.contactNumber}</div>
                            {o.email && (
                              <div className="text-slate-500 truncate max-w-[160px] text-[10px]">
                                {o.email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(o.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {activeTab === "archive" ? (
                                // In archive view, show restore button
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => revertStatus(o.id)}
                                    title="Restore to Ready"
                                    className="h-7 px-3"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Restore
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteOrder(o.id)}
                                    title="Delete Permanently"
                                    className="h-7 px-2"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                // In active view, show normal status progression
                                <>
                                  {prev && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => revertStatus(o.id)}
                                      title="Revert"
                                      className="h-7 px-2"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {next && (
                                    <Button
                                      size="sm"
                                      onClick={() => advanceStatus(o.id)}
                                      className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      {STATUS_LABEL[next]}
                                    </Button>
                                  )}
                                  {!next && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteOrder(o.id)}
                                      title="Delete"
                                      className="h-7 px-2"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
