import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";
import { categories } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const [featured, setFeatured] = useState<Tables<"products">[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("featured", true).limit(8).then(({ data, error }) => {
      if (error) {
        console.warn("Failed to load featured products:", error.message);
        setFeatured([]);
        return;
      }
      setFeatured(data || []);
    }).catch((err) => {
      console.warn("Error loading featured products:", err);
      setFeatured([]);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img src={heroBanner} alt="Meenakshi Universe - Gifts, Frames & Custom Printing" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-3 leading-tight">Meenakshi Universe</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-lg font-body">Custom Frames • Photo Printing • Sublimation Gifts • Aari Works</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 gradient-gold text-accent-foreground font-semibold px-6 py-3 rounded-lg shadow-gold hover:scale-105 transition-transform">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/scan" className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground font-semibold px-6 py-3 rounded-lg border border-primary-foreground/30 hover:bg-primary-foreground/30 hover:scale-105 transition-all">
                <Sparkles className="w-4 h-4" /> AR Magic
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-center text-foreground mb-10">Our Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={`/shop?category=${cat.id}`} className="block gradient-card border border-border rounded-lg p-6 text-center hover:shadow-gold transition-shadow group">
                <span className="text-4xl block mb-3">{cat.icon}</span>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-display font-bold text-foreground">Featured Products</h2>
              <Link to="/shop" className="text-sm font-medium text-primary hover:text-crimson-dark flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location Strip */}
      <section className="gradient-hero py-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-2xl font-display font-bold mb-2">Visit Our Store</h2>
          <p className="opacity-80 max-w-md mx-auto text-sm">Thindukkal District, Viruveedu (PT), Dharumathupatti — Near Govt Higher Secondary School, Above T. Ananthi Bakery</p>
          <a href="tel:8754885130" className="inline-block mt-4 gradient-gold text-accent-foreground font-semibold px-6 py-2 rounded-lg text-sm hover:scale-105 transition-transform">Call: 8754885130</a>
        </div>
      </section>
    </div>
  );
};

export default Index;
