
-- Create table for image-video pairs
CREATE TABLE public.ar_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  trigger_image_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ar_experiences ENABLE ROW LEVEL SECURITY;

-- Anyone can view active experiences (needed for matching)
CREATE POLICY "Anyone can view active experiences"
ON public.ar_experiences
FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can insert experiences"
ON public.ar_experiences
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update experiences"
ON public.ar_experiences
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete experiences"
ON public.ar_experiences
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can also view inactive ones
CREATE POLICY "Admins can view all experiences"
ON public.ar_experiences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_ar_experiences_updated_at
BEFORE UPDATE ON public.ar_experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for AR videos
INSERT INTO storage.buckets (id, name, public) VALUES ('ar-videos', 'ar-videos', true);

-- Storage policies for ar-videos
CREATE POLICY "Anyone can view AR videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'ar-videos');

CREATE POLICY "Admins can upload AR videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ar-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update AR videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ar-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete AR videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'ar-videos' AND has_role(auth.uid(), 'admin'::app_role));

-- Also allow admins to upload trigger images to product-images bucket (reuse existing)
-- ar-trigger-images subfolder convention
