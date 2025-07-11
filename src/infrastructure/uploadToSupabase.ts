import { supabase, SUPABASE_BUCKET } from './supabase';

export async function uploadFileToSupabase(file: File) {
  // const filePath = `pages/${userId}/${Date.now()}_${file.name}`;
  const filePath = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file);
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
} 