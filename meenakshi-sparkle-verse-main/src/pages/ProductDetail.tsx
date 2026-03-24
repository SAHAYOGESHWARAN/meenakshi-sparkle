import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Share2, ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Tables<"products"> | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-primary font-medium hover:underline">← Back to Shop</Link>
      </div>
    );
  }

  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  const handleAdd = () => {
    if (product.sizes?.length && !selectedSize) { toast.error("Please select a size"); return; }
    addToCart(product, selectedSize);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const shareUrl = window.location.href;
  const whatsappShare = `https://wa.me/918754885130?text=I want this product: ${product.name} - ${shareUrl}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-square rounded-lg overflow-hidden border border-border">
          <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          {product.customizable && (
            <span className="inline-block self-start bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full mb-3">✨ Customizable</span>
          )}
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.original_price}</span>
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">{discount}% OFF</span>
              </>
            )}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-2">Select Size:</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 gradient-gold text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition-transform">
              {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              {added ? "Added!" : "Add to Cart"}
            </button>
            <a href={whatsappShare} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-[#fff] font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition-transform">
              Order via WhatsApp
            </a>
          </div>
          <button onClick={handleShare} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Share2 className="w-4 h-4" /> Share this product
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
