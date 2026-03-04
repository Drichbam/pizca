
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-photos', 'recipe-photos', true);

CREATE POLICY "Authenticated users can upload recipe photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-photos');

CREATE POLICY "Anyone can view recipe photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-photos');

CREATE POLICY "Users can update own recipe photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'recipe-photos' AND owner = auth.uid());

CREATE POLICY "Users can delete own recipe photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'recipe-photos' AND owner = auth.uid());
