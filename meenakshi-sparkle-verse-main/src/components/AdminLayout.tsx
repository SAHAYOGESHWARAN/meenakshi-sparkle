import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package, ShoppingBag, LogOut, Home, LayoutDashboard, Sparkles,
  Menu, X, ChevronRight, User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-background">
        <div>
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Link to="/" className="gradient-gold text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/ar-experiences", icon: Sparkles, label: "AR Magic" },
  ];

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-5 border-b border-primary-foreground/10">
        <h2 className="font-display font-bold text-xl text-primary-foreground">Admin Panel</h2>
        <p className="text-xs text-primary-foreground/50 mt-1">Meenakshi Universe</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/40 font-semibold px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-secondary/20 text-secondary shadow-sm"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-primary-foreground/10 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-secondary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-primary-foreground/40">Administrator</p>
          </div>
        </div>

        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all"
        >
          <Home className="w-4 h-4" /> View Store
        </Link>
        <button
          onClick={() => { onNavigate?.(); handleSignOut(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-foreground/70 hover:bg-destructive/20 hover:text-destructive-foreground transition-all w-full text-left"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 gradient-hero hidden md:flex flex-col fixed inset-y-0 left-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] gradient-hero flex flex-col z-50 md:hidden shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-primary-foreground/60 hover:text-primary-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-display font-bold text-foreground text-lg">
                {navItems.find((n) => isActive(n))?.label || "Admin"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground">{user.email}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
