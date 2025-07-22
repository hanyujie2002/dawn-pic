'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { imagesSchema } from '@/models/Schema';

export async function uploadImage(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    return { error: 'You must be logged in to upload an image.' };
  }

  const file = formData.get('image') as File;

  if (!file) {
    return { error: 'No image provided.' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration error: SUPABASE_URL or SUPABASE_KEY is not defined.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const filePath = `${user.id}/${new Date().toISOString()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('images') // The name of your bucket
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return { error: 'Failed to upload image.' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  if (!publicUrlData) {
    return { error: 'Failed to get public URL.' };
  }

  try {
    await db.insert(imagesSchema).values({
      userId: user.id,
      url: publicUrlData.publicUrl,
      path: filePath,
    });
  } catch (dbError) {
    console.error('Database Insert Error:', dbError);
    // If the database insert fails, you might want to delete the file from storage
    await supabase.storage.from('images').remove([filePath]);
    return { error: 'Failed to save image information.' };
  }

  revalidatePath('/dashboard/image-upload'); // Or whatever page you want to update

  return { success: true, url: publicUrlData.publicUrl };
}
