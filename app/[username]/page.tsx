import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProfilePage from '@/components/profile/ProfilePage';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('username', username)
    .single();

  if (!profile) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${profile.display_name || username} | LinkHub`,
    description: profile.bio || `Check out ${profile.display_name}'s links`,
    openGraph: {
      title: profile.display_name || username,
      description: profile.bio || '',
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function UsernamePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('user_id', profile.id);

  return (
    <ProfilePage 
      profile={profile} 
      links={links || []} 
      socialLinks={socialLinks || []}
    />
  );
}