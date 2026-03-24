import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Plus, Pencil, Trash2, X, Upload, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Product = Tables<"products">;

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  original_price: null as number | null,
  category: "gifts",
  images: [] as string[],
  sizes: [] as string[],
  customizable: false,
  in_stock: true,
  featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      original_price: p.original_price,
      category: p.category,
      images: p.images || [],
      sizes: p.sizes || [],
      customizable: p.customizable || false,
      in_stock: p.in_stock ?? true,
      featured: p.featured || false,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }

    if (editId) {
      const { error } = await supabase.from("products").update(form).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("Product added!");
    }
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, images: [...f.images, data.publicUrl] }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl("");
    }
  };

  const removeImage = (i: number) => {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  };

  const addSize = () => {
    if (sizeInput.trim()) {
      setForm({ ...form, sizes: [...form.sizes, sizeInput.trim()] });
      setSizeInput("");
    }
  };

  const removeSize = (i: number) => {
    setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) });
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-accent-foreground font-medium px-4 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform shadow-gold">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-lg text-foreground">{editId ? "Edit" : "New"} Product</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Product Name *</label>
                  <input
                    placeholder="e.g. Custom Photo Mug"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea
                    placeholder="Product description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Original Price (₹)</label>
                    <input
                      type="number"
                      value={form.original_price ?? ""}
                      onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="gifts">Gifts</option>
                    <option value="frames">Frames</option>
                    <option value="fancy">Fancy Items</option>
                    <option value="aari">Aari Works</option>
                  </select>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Images</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} className="w-16 h-16 object-cover rounded-xl border border-border" alt="" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground mt-0.5">{uploading ? "..." : "Upload"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL..."
                      className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button type="button" onClick={addImageUrl} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                      Add
                    </button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Sizes</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      placeholder="e.g. M, L, 8x10"
                      className="flex-1 px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                    />
                    <button type="button" onClick={addSize} className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.sizes.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 bg-muted text-foreground text-xs px-2.5 py-1 rounded-lg">
                        {s}
                        <button onClick={() => removeSize(i)} className="text-destructive hover:text-destructive/80 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  {[
                    { key: "customizable", label: "Customizable", desc: "Can be personalized by customers" },
                    { key: "in_stock", label: "In Stock", desc: "Available for purchase" },
                    { key: "featured", label: "Featured", desc: "Show on homepage" },
                  ].map((t) => (
                    <label key={t.key} className="flex items-center gap-3 text-sm text-foreground cursor-pointer bg-muted/50 rounded-xl px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={form[t.key as keyof typeof form] as boolean}
                        onChange={(e) => setForm({ ...form, [t.key]: e.target.checked })}
                        className="accent-primary w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="w-full gradient-gold text-accent-foreground font-semibold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-gold"
                >
                  {editId ? "Update" : "Add"} Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <p className="font-display font-bold text-foreground text-lg">
            {search ? "No products found" : "No Products Yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {search ? "Try a different search" : "Add your first product to get started!"}
          </p>
          {!search && (
            <button onClick={openNew} className="gradient-gold text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform shadow-gold">
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-warm transition-shadow group">
              <div className="relative aspect-square bg-muted">
                {p.images?.[0] ? (
                  <img src={p.images[0]} className="w-full h-full object-cover" alt={p.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {p.featured && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-secondary/90 text-secondary-foreground">Featured</span>
                  )}
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${p.in_stock ? "bg-green-500/90 text-white" : "bg-foreground/60 text-background"}`}>
                    {p.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-foreground truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{p.category}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-primary text-lg">₹{p.price}</span>
                  {p.original_price && <span className="text-xs text-muted-foreground line-through">₹{p.original_price}</span>}
                </div>

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
