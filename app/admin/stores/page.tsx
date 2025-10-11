"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  ExternalLink,
  Users,
  Calendar,
  Loader2,
  Power,
  PowerOff,
} from "lucide-react";
import Link from "next/link";

interface StoreData {
  id: number;
  name: string;
  shop_slug: string;
  owner_email: string;
  owner_name: string;
  is_active: boolean;
  total_orders: number;
  total_users: number;
  total_customers: number;
  created_at: string;
  last_order_date?: string;
}

export default function StoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores");
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async (storeId: number, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this store?`)) {
      return;
    }

    setActionLoading(storeId);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update store");
      }

      toast({
        title: "Store Updated",
        description: `Store has been ${action}d successfully`,
      });

      fetchStores();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        <p className="mt-2 text-gray-600">
          Manage all stores in the Ralli platform
        </p>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No stores yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Approve applications to create stores
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{store.name}</CardTitle>
                      {store.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      <a
                        href={`/${store.shop_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                      >
                        ralli.com/{store.shop_slug}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={store.is_active ? "destructive" : "default"}
                      onClick={() =>
                        toggleStoreStatus(store.id, store.is_active)
                      }
                      disabled={actionLoading === store.id}
                    >
                      {actionLoading === store.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : store.is_active ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Owner Info */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Owner Information
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{store.owner_name}</p>
                      <p className="text-sm text-gray-600">
                        {store.owner_email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-medium">
                          {store.total_orders}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{store.total_users}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Customers:</span>
                        <span className="font-medium">
                          {store.total_customers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium">
                            {formatDate(store.created_at)}
                          </p>
                        </div>
                      </div>
                      {store.last_order_date && (
                        <div className="flex items-start gap-2 text-sm">
                          <Store className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600">Last Order</p>
                            <p className="font-medium">
                              {formatDate(store.last_order_date)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Link href={`/dashboard/${store.shop_slug}`}>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </Link>
                  <Link href={`/${store.shop_slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Kiosk
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
