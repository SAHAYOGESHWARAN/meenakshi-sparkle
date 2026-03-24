import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, IndianRupee, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, arExperiences: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: pCount }, { data: orders }, { count: arCount }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id, customer_name, total_amount, status, created_at").order("created_at", { ascending: false }),
        supabase.from("ar_experiences").select("*", { count: "exact", head: true }),
      ]);
      const allOrders = orders || [];
      const revenue = allOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      setStats({
        products: pCount || 0,
        orders: allOrders.length,
        revenue,
        arExperiences: arCount || 0,
      });
      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "bg-primary/10 text-primary", link: "/admin/products" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "bg-secondary/10 text-secondary", link: "/admin/orders" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "bg-accent/10 text-accent-foreground", link: "/admin/orders" },
    { label: "AR Experiences", value: stats.arExperiences, icon: Sparkles, color: "bg-primary/10 text-primary", link: "/admin/ar-experiences" },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-destructive/10 text-destructive";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.link}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-warm transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-bold text-foreground">Recent Orders</h2>
          </div>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline font-medium">
            View All →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">No orders yet</p>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-bold text-foreground">₹{Number(order.total_amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
