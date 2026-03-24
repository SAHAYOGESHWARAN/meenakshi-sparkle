import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Mail, ArrowLeft, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success(isSignUp ? "Account created! You are now logged in." : "Welcome back!");
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-primary-foreground/30" />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full border border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-primary-foreground/20" />
        </div>
        <div className="relative z-10 text-center">
          <ShieldCheck className="w-20 h-20 text-secondary mx-auto mb-6" />
          <h2 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Meenakshi Universe
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Admin Panel — Manage your products, orders, and AR experiences all in one place.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="mb-8">
            <div className="lg:hidden mb-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp
                ? "Create the first account to become admin"
                : "Sign in to manage your store"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-accent-foreground font-semibold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-gold"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "First time? Create Admin Account"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
