'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { imagesSchema } from '@/models/Schema';

export async function deleteImage(formData: FormData) {
  const user = await currentUser();
  const imageId = Number(formData.get('imageId'));
  const imagePath = formData.get('imagePath') as string;

  if (!user) {
    console.error('Authentication error: User not logged in.');
    return; // Do not return an object, as the form action expects void.
  }

  // Validate imageId is a valid number
  if (Number.isNaN(imageId) || imageId <= 0) {
    console.error('Validation error: Invalid imageId provided.');
    return;
  }

  try {
    // First, verify the image belongs to the current user
    const existingImage = await db.query.imagesSchema.findFirst({
      where: and(
        eq(imagesSchema.id, imageId),
        eq(imagesSchema.userId, user.id),
      ),
    });

    if (!existingImage) {
      console.error('Authorization error: Image not found or user does not have permission to delete it.');
      return;
    }

    // Delete from Supabase storage
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration error: SUPABASE_URL or SUPABASE_KEY is not defined.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([imagePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
      // as the file might already be deleted or the path might be incorrect
    }

    // Delete from database
    await db.delete(imagesSchema).where(
      and(
        eq(imagesSchema.id, imageId),
        eq(imagesSchema.userId, user.id),
      ),
    );

    revalidatePath('/dashboard/image-management'); // Or whatever page you want to update
  } catch (error) {
    console.error('Delete image error:', error);
  }
}
