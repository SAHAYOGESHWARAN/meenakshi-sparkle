import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Search, Filter, ChevronDown, ChevronUp, MapPin, Phone, CreditCard, Package, ShoppingBag } from "lucide-react";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusColor = (s: string) => {
  switch (s) {
    case "delivered": return "bg-green-100 text-green-700 border-green-200";
    case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
    case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
    case "processing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    const { data: itemsData } = await supabase.from("order_items").select("*");

    const merged = (ordersData || []).map((o) => ({
      ...o,
      items: (itemsData || []).filter((i) => i.order_id === o.id),
    }));
    setOrders(merged);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order status updated to ${status}`);
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No orders found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || filterStatus !== "all" ? "Try adjusting your filters" : "Orders will appear here when customers place them"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-warm transition-shadow">
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <span className="text-muted-foreground/30">•</span>
                        <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{Number(order.total_amount).toLocaleString()}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-5 border-t border-border pt-4 space-y-4">
                    {/* Customer details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</p>
                          <p className="text-sm text-foreground">{order.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Address</p>
                          <p className="text-sm text-foreground">{order.address || "N/A"} {order.pincode && `- ${order.pincode}`}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3">
                        <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Payment</p>
                          <p className="text-sm text-foreground capitalize">{order.payment_method}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    {order.items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                              <span className="text-foreground">
                                {item.product_name} {item.size && <span className="text-muted-foreground">({item.size})</span>} × {item.quantity}
                              </span>
                              <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status update */}
                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Update Status:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
