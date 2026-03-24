import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, X, Loader2, Sparkles, Video, SwitchCamera } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ScanImage = () => {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setResult(null);
    setPreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError("Could not access camera. Please allow camera permissions or use the upload option.");
    }
  }, [facingMode]);

  const flipCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  useEffect(() => {
    if (cameraActive) {
      // restart with new facing mode
      stopCamera();
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  const handleCapture = useCallback(async () => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;
    stopCamera();
    setPreview(dataUrl);
    setScanning(true);
    try {
      const base64 = dataUrl.split(",")[1];
      const { data, error: fnError } = await supabase.functions.invoke("match-image", {
        body: { image_base64: base64 },
      });
      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to scan image");
    }
    setScanning(false);
  }, [captureFrame, stopCamera]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    stopCamera();
    setPreview(URL.createObjectURL(file));
    setScanning(true);
    try {
      const base64 = await toBase64(file);
      const { data, error: fnError } = await supabase.functions.invoke("match-image", {
        body: { image_base64: base64 },
      });
      if (fnError) throw fnError;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to scan image");
    }
    setScanning(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    stopCamera();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="gradient-hero text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">AR Magic</h1>
            <p className="text-sm opacity-80">Scan an image to unlock its video</p>
          </div>
          <Link to="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity">← Back</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {cameraActive && !preview ? (
            /* Live camera view */
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border bg-foreground/5">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-primary/40 rounded-xl" />
                  <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Point your camera at a Meenakshi Universe image
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCapture}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Capture & Scan
                </button>
                <button
                  onClick={flipCamera}
                  className="p-3 rounded-xl border border-border text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Flip camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
                <button
                  onClick={stopCamera}
                  className="p-3 rounded-xl border border-border text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : !preview ? (
            /* Upload / camera start area */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 text-secondary mx-auto mb-3" />
                <h2 className="font-display text-xl font-bold text-foreground">Bring Your Image to Life</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Take a photo of your Meenakshi Universe product or image and watch it come alive with video!
                </p>
              </div>

              {/* Live camera button */}
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <Video className="w-10 h-10 text-primary/60 group-hover:text-primary mb-2 transition-colors" />
                <span className="font-medium text-foreground">Live Camera Scan</span>
                <span className="text-xs text-muted-foreground mt-1">Point your camera at an image</span>
              </button>

              {/* Upload from gallery */}
              <label className="flex items-center justify-center gap-3 w-full py-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Or upload from gallery</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </motion.div>
          ) : (
            /* Result area */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <img src={preview} className="w-full max-h-64 object-contain rounded-xl border border-border" alt="Scanned" />
                <button onClick={reset} className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1.5 hover:bg-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {scanning && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-foreground font-medium">Analyzing image...</p>
                  <p className="text-xs text-muted-foreground mt-1">Our AI is matching your photo</p>
                </div>
              )}

              {error && (
                <div className="text-center py-6">
                  <p className="text-destructive font-medium">{error}</p>
                  <button onClick={reset} className="mt-3 text-sm text-primary hover:underline">Try again</button>
                </div>
              )}

              {result && !scanning && (
                result.match ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h3 className="font-display text-lg font-bold text-foreground">{result.experience.title}</h3>
                      {result.experience.description && (
                        <p className="text-sm text-muted-foreground mt-1">{result.experience.description}</p>
                      )}
                    </div>
                    <video
                      src={result.experience.video_url}
                      className="w-full rounded-xl border border-border shadow-warm"
                      controls
                      autoPlay
                      playsInline
                    />
                    <button onClick={reset} className="w-full py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                      Scan Another Image
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-foreground font-medium">No match found</p>
                    <p className="text-xs text-muted-foreground mt-1">This image doesn't match any of our AR experiences</p>
                    <button onClick={reset} className="mt-4 gradient-gold text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm hover:scale-[1.02] transition-transform">
                      Try Another Image
                    </button>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScanImage;
