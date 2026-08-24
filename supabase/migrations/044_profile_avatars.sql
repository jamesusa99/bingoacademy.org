-- Let signed-in users upload their own profile photos under media/avatars/{userId}/
-- Staff policies from 023 remain; this only adds a user-owned path.

DROP POLICY IF EXISTS "media_avatar_insert" ON storage.objects;
CREATE POLICY "media_avatar_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND split_part(name, '/', 1) = 'avatars'
  AND split_part(name, '/', 2) = auth.uid()::text
);

DROP POLICY IF EXISTS "media_avatar_update" ON storage.objects;
CREATE POLICY "media_avatar_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND split_part(name, '/', 1) = 'avatars'
  AND split_part(name, '/', 2) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'media'
  AND split_part(name, '/', 1) = 'avatars'
  AND split_part(name, '/', 2) = auth.uid()::text
);

DROP POLICY IF EXISTS "media_avatar_delete" ON storage.objects;
CREATE POLICY "media_avatar_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND split_part(name, '/', 1) = 'avatars'
  AND split_part(name, '/', 2) = auth.uid()::text
);
