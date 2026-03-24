import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Phone, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  to: string;
  label: string;
  icon?: boolean;
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();

  const links: NavLink[] = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/shop?category=gifts", label: "Gifts" },
    { to: "/shop?category=frames", label: "Frames" },
    { to: "/shop?category=aari", label: "Aari Works" },
    { to: "/scan", label: "AR Magic", icon: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-primary">Meenakshi</span>
          <span className="text-sm font-body text-muted-foreground hidden sm:inline">Universe</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className={`text-sm font-medium transition-colors ${l.icon ? "flex items-center gap-1 text-primary hover:text-primary/80" : "text-foreground hover:text-primary"}`}
            >
              {l.icon && <Sparkles className="w-3.5 h-3.5" />}
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:8754885130"
            className="hidden sm:flex items-center gap-1 text-sm text-primary font-medium hover:text-crimson-dark transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>8754885130</span>
          </a>
          <Link
            to={user ? "/admin" : "/admin/login"}
            className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{user ? "Dashboard" : "Admin"}</span>
          </Link>
          <Link to="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-card"
          >
            <div className="p-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.to + l.label}
                  to={l.to}
                  className={`text-sm font-medium py-2 ${l.icon ? "flex items-center gap-1.5 text-primary" : "text-foreground hover:text-primary"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.icon && <Sparkles className="w-3.5 h-3.5" />}
                  {l.label}
                </Link>
              ))}
              <a
                href="tel:8754885130"
                className="flex items-center gap-2 text-sm text-primary font-medium py-2"
              >
                <Phone className="w-4 h-4" />
                Call: 8754885130
              </a>
              <Link
                to={user ? "/admin" : "/admin/login"}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                <ShieldCheck className="w-4 h-4" />
                {user ? "Dashboard" : "Admin Login"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
