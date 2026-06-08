-- RLS for admin module covers (media bucket). Requires 022_media_storage.sql.

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_staff_insert" ON storage.objects;
CREATE POLICY "media_staff_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_admin_or_editor()
  );

DROP POLICY IF EXISTS "media_staff_update" ON storage.objects;
CREATE POLICY "media_staff_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor())
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor());

DROP POLICY IF EXISTS "media_staff_delete" ON storage.objects;
CREATE POLICY "media_staff_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin_or_editor());
