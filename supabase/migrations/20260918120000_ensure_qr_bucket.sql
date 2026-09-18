INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-files', 'qr-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read qr-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "public upload qr-files bucket" ON storage.objects;

CREATE POLICY "public read qr-files bucket"
ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'qr-files');

CREATE POLICY "public upload qr-files bucket"
ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'qr-files');
