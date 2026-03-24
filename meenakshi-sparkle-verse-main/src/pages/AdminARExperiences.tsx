import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, Sparkles, Video, Image } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ARExperience {
  id: string;
  title: string;
  description: string | null;
  trigger_image_url: string;
  video_url: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  trigger_image_url: "",
  video_url: "",
  is_active: true,
};

const AdminARExperiences = () => {
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from("ar_experiences")
      .select("*")
      .order("created_at", { ascending: false });
    setExperiences((data as ARExperience[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchExperiences(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };

  const openEdit = (e: ARExperience) => {
    setForm({
      title: e.title,
      description: e.description || "",
      trigger_image_url: e.trigger_image_url,
      video_url: e.video_url,
      is_active: e.is_active,
    });
    setEditId(e.id);
    setShowForm(true);
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "product-images", "ar-triggers");
      setForm((f) => ({ ...f, trigger_image_url: url }));
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }
    setUploading(true);
    try {
      const url = await uploadFile(file, "ar-videos", "videos");
      setForm((f) => ({ ...f, video_url: url }));
      toast.success("Video uploaded!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.trigger_image_url) { toast.error("Trigger image is required"); return; }
    if (!form.video_url) { toast.error("Video is required"); return; }

    const payload = {
      title: form.title,
      description: form.description || null,
      trigger_image_url: form.trigger_image_url,
      video_url: form.video_url,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await supabase.from("ar_experiences").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Experience updated!");
    } else {
      const { error } = await supabase.from("ar_experiences").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Experience created!");
    }
    setShowForm(false);
    fetchExperiences();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this AR experience?")) return;
    const { error } = await supabase.from("ar_experiences").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Experience deleted");
    fetchExperiences();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("ar_experiences").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchExperiences();
  };

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
          <h1 className="text-2xl font-display font-bold text-foreground">AR Magic Experiences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {experiences.length} experience{experiences.length !== 1 ? "s" : ""} • Upload trigger images with linked videos
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-accent-foreground font-medium px-4 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform shadow-gold">
          <Plus className="w-4 h-4" /> Add Experience
        </button>
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
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display font-bold text-lg text-foreground">{editId ? "Edit" : "New"} AR Experience</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                  <input
                    placeholder="e.g. Wedding Frame Video"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={2}
                  />
                </div>

                {/* Trigger Image */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> Trigger Image *</span>
                  </label>
                  {form.trigger_image_url ? (
                    <div className="relative inline-block group">
                      <img src={form.trigger_image_url} className="w-36 h-36 object-cover rounded-xl border border-border" alt="Trigger" />
                      <button
                        onClick={() => setForm({ ...form, trigger_image_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-36 h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                {/* Video */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Video *</span>
                  </label>
                  {form.video_url ? (
                    <div className="space-y-2">
                      <video src={form.video_url} className="w-full max-h-44 rounded-xl border border-border" controls />
                      <button onClick={() => setForm({ ...form, video_url: "" })} className="text-xs text-destructive hover:underline">
                        Remove video
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Upload video (max 50MB)"}</span>
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer bg-muted/50 rounded-xl px-4 py-3">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary w-4 h-4" />
                  <div>
                    <p className="font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Visible to customers for scanning</p>
                  </div>
                </label>

                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="w-full gradient-gold text-accent-foreground font-semibold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-gold"
                >
                  {editId ? "Update" : "Create"} Experience
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experiences Grid */}
      {experiences.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="font-display font-bold text-foreground text-lg">No AR Experiences Yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first experience to bring images to life!</p>
          <button onClick={openNew} className="gradient-gold text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform shadow-gold">
            Create First Experience
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((e) => (
            <div key={e.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-warm transition-shadow group">
              {/* Image */}
              <div className="relative aspect-video bg-muted">
                <img src={e.trigger_image_url} className="w-full h-full object-cover" alt={e.title} />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${e.is_active ? "bg-green-500/90 text-white" : "bg-foreground/60 text-background"}`}>
                    {e.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-display font-bold text-foreground truncate">{e.title}</h3>
                {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  Created {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleActive(e.id, e.is_active)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors text-muted-foreground"
                    title={e.is_active ? "Deactivate" : "Activate"}
                  >
                    {e.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {e.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => openEdit(e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
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

export default AdminARExperiences;
