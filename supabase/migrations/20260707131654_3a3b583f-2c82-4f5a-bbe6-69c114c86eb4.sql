
CREATE TABLE public.qr_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  size BIGINT NOT NULL,
  content_type TEXT,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.qr_files TO anon, authenticated;
GRANT ALL ON public.qr_files TO service_role;
ALTER TABLE public.qr_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read qr_files" ON public.qr_files FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert qr_files" ON public.qr_files FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update download count" ON public.qr_files FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- storage policies for qr-files bucket (public bucket, anyone can upload/read)
CREATE POLICY "public read qr-files bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'qr-files');
CREATE POLICY "public upload qr-files bucket" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'qr-files');
