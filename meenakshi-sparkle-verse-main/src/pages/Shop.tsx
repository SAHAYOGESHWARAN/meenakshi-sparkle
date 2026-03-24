import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { categories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [products, setProducts] = useState<Tables<"products">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false });
      if (activeCategory !== "all") query = query.eq("category", activeCategory);
      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-bold text-foreground mb-8">
        {activeCategory === "all" ? "All Products" : categories.find((c) => c.id === activeCategory)?.name || "Shop"}
      </motion.h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setSearchParams({})} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"}`}>All</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setSearchParams({ category: cat.id })} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-20">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No products found. Add products from the admin panel!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Shop;
