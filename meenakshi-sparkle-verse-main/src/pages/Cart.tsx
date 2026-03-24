import { useCart } from "@/lib/cart";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "", payment: "cod" });
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
        <Link to="/shop" className="inline-flex items-center gap-2 gradient-gold text-accent-foreground font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform">Browse Products</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSubmitting(true);

    const { data: order, error } = await supabase.from("orders").insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      pincode: form.pincode.trim() || null,
      payment_method: form.payment,
      total_amount: totalPrice,
    }).select().single();

    if (error || !order) {
      toast.error("Failed to place order");
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
      size: i.selectedSize || null,
    }));

    await supabase.from("order_items").insert(orderItems);

    toast.success("Order placed successfully! We'll contact you soon.");
    clearCart();
    setShowCheckout(false);
    setSubmitting(false);
  };

  const whatsappOrder = `https://wa.me/918754885130?text=${encodeURIComponent(
    `Hi! I'd like to order:\n${items.map((i) => `• ${i.product.name}${i.selectedSize ? ` (${i.selectedSize})` : ""} x${i.quantity} — ₹${i.product.price * i.quantity}`).join("\n")}\n\nTotal: ₹${totalPrice}`
  )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div key={item.product.id} layout className="flex gap-4 p-4 gradient-card rounded-lg border border-border">
              <Link to={`/product/${item.product.id}`} className="shrink-0">
                <img src={item.product.images?.[0] || "/placeholder.svg"} alt={item.product.name} className="w-20 h-20 rounded object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-display font-semibold text-foreground text-sm truncate hover:text-primary transition-colors">{item.product.name}</h3>
                </Link>
                {item.selectedSize && <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>}
                <p className="text-primary font-bold mt-1">₹{item.product.price * item.quantity}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 rounded border border-border hover:bg-muted transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 rounded border border-border hover:bg-muted transition-colors"><Plus className="w-3 h-3" /></button>
                  <button onClick={() => removeFromCart(item.product.id)} className="ml-auto p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="gradient-card border border-border rounded-lg p-6 h-fit sticky top-24">
          <h2 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="text-primary font-medium">Free</span></div>
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between font-bold text-foreground text-lg"><span>Total</span><span>₹{totalPrice}</span></div>
          </div>

          {!showCheckout ? (
            <>
              <button onClick={() => setShowCheckout(true)} className="block w-full text-center gradient-gold text-accent-foreground font-semibold py-3 rounded-lg hover:scale-[1.02] transition-transform mb-3">
                Place Order
              </button>
              <a href={whatsappOrder} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-[#25D366] text-[#fff] font-semibold py-3 rounded-lg hover:scale-[1.02] transition-transform mb-3">
                Order via WhatsApp
              </a>
            </>
          ) : (
            <div className="space-y-3">
              <input placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm" />
              <input placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm" />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm" />
              <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm" />
              <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="w-full px-3 py-2 rounded border border-input bg-background text-foreground text-sm">
                <option value="cod">Cash on Delivery</option>
                <option value="upi">UPI</option>
                <option value="whatsapp">WhatsApp Payment</option>
              </select>
              <button onClick={handlePlaceOrder} disabled={submitting} className="w-full gradient-gold text-accent-foreground font-semibold py-3 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
                {submitting ? "Placing Order..." : "Confirm Order"}
              </button>
              <button onClick={() => setShowCheckout(false)} className="w-full text-sm text-muted-foreground hover:text-foreground py-2">Cancel</button>
            </div>
          )}

          <button onClick={clearCart} className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors py-2 mt-2">Clear Cart</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
