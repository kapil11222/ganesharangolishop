
-- Allow anyone to read files in these buckets (so <img src> works)
CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public read category-images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

-- Allow admins to write/update/delete
CREATE POLICY "Admins upload product-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete product-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload category-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update category-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete category-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));
