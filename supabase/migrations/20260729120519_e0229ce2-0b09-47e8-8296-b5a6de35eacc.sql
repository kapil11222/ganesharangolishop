CREATE POLICY "Public read banner-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Admins upload banner-images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update banner-images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete banner-images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'::app_role));