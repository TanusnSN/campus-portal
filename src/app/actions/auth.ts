'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  const role = profile?.role || data.user.user_metadata?.role || 'student';

  if (role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function signup(formData: FormData) {
  const fullName = (formData.get('fullName') as string)?.trim();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student',
      },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: 'student',
    });
  }

  if (data?.session) {
    redirect('/dashboard');
  }

  redirect(`/login?error=${encodeURIComponent('Account created successfully! Please sign in.')}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
