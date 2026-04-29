REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Closet photos are publicly viewable" ON storage.objects;
CREATE POLICY "Users can view their own closet photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'closet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);