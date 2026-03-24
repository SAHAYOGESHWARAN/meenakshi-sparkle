import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

type Product = Tables<"products">;

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group gradient-card rounded-lg border border-border overflow-hidden shadow-warm hover:shadow-gold transition-shadow duration-300"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm">
              {discount}% OFF
            </span>
          )}
          {product.customizable && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-sm">
              Customizable
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-primary text-lg">₹{product.price}</span>
            {product.original_price && <span className="text-xs text-muted-foreground line-through">₹{product.original_price}</span>}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-crimson-dark transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
