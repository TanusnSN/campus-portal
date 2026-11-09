'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markAttendance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('attendance').insert({
    user_id: user.id,
    status: 'present',
  });

  if (error && error.code !== '23505') {
    throw new Error(error.message);
  }
  revalidatePath('/dashboard');
}

export async function reportItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('photo') as File | null;
  let imageUrl: string | null = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('lost-found')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('lost-found')
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }
  }

  await supabase.from('lost_found_items').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    location: formData.get('location') as string,
    contact_info: formData.get('contact') as string,
    image_url: imageUrl,
    reported_by: user.id,
  });

  revalidatePath('/dashboard');
}
