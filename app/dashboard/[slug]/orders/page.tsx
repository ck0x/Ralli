"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Printer,
  ArrowUpDown,
} from "lucide-react";

interface Order {
  id: number;
  job_id: number;
  customer_id: number;
  customer_name: string;
  contact_number: string;
  email: string | null;
  racket_id: number;
  racket_brand: string;
  racket_model: string;
  string_type: string | null;
  service_type: string;
  status: string;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ready: {
    label: "Ready",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "picked-up": {
    label: "Picked Up",
    color: "bg-slate-200 text-slate-700 border-slate-300",
  },
};

export default function OrdersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Use cached store data
        const storeRes = await fetch(`/api/stores/by-slug/${slug}`, {
          cache: "force-cache",
        });
        if (!storeRes.ok) throw new Error("Failed to load store");
        const store = await storeRes.json();
        setStoreId(store.id);

        // Fresh orders data
        const ordersRes = await fetch(`/api/orders?storeId=${store.id}`, {
          cache: "no-store",
        });
        if (!ordersRes.ok) throw new Error("Failed to load orders");
        const { data } = await ordersRes.json();
        setOrders(data);
      } catch (error) {
        console.error("Orders load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [slug]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.customer_name.toLowerCase().includes(query) ||
          order.contact_number.includes(query) ||
          order.racket_brand.toLowerCase().includes(query) ||
          order.racket_model.toLowerCase().includes(query) ||
          order.job_id.toString().includes(query)
        );
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update order status");
    }
  };

  const handlePrintLabel = (order: Order) => {
    // Generate a print-friendly label
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Label #${order.job_id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
          h1 { margin: 0 0 20px 0; font-size: 24px; }
          .field { margin: 10px 0; }
          .field-label { font-weight: bold; }
          .barcode { font-size: 32px; letter-spacing: 2px; margin: 20px 0; }
          @media print {
            body { padding: 0; }
            @page { margin: 0.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <h1>Order #${order.job_id}</h1>
          <div class="barcode">*${order.job_id}*</div>
          <div class="field">
            <div class="field-label">Customer:</div>
            <div>${order.customer_name}</div>
          </div>
          <div class="field">
            <div class="field-label">Phone:</div>
            <div>${order.contact_number}</div>
          </div>
          <div class="field">
            <div class="field-label">Racket:</div>
            <div>${order.racket_brand} ${order.racket_model}</div>
          </div>
          ${
            order.string_type
              ? `
          <div class="field">
            <div class="field-label">String:</div>
            <div>${order.string_type}</div>
          </div>
          `
              : ""
          }
          <div class="field">
            <div class="field-label">Service:</div>
            <div>${order.service_type}</div>
          </div>
          ${
            order.additional_notes
              ? `
          <div class="field">
            <div class="field-label">Notes:</div>
            <div>${order.additional_notes}</div>
          </div>
          `
              : ""
          }
          <div class="field">
            <div class="field-label">Date:</div>
            <div>${new Date(order.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-100 animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all your stringing orders</p>
        </div>
        <Link href={`/dashboard/${slug}/orders/new`}>
          <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer, phone, racket, or order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="picked-up">Picked Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {filteredOrders.length} Order
              {filteredOrders.length !== 1 ? "s" : ""}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Racket</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.job_id}
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.contact_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {order.racket_brand}
                          </div>
                          <div className="text-gray-500">
                            {order.racket_model}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {order.service_type}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <Badge
                              className={
                                STATUS_CONFIG[
                                  order.status as keyof typeof STATUS_CONFIG
                                ]?.color
                              }
                            >
                              {
                                STATUS_CONFIG[
                                  order.status as keyof typeof STATUS_CONFIG
                                ]?.label
                              }
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="picked-up">Picked Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintLabel(order)}
                            title="Print Label"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/dashboard/${slug}/orders/${order.job_id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-gray-500">
                        {searchQuery || statusFilter !== "all"
                          ? "No orders match your filters"
                          : "No orders yet"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
