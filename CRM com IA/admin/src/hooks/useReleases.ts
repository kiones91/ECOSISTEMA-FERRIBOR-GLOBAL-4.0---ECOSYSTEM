import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

export type PlatformRelease = Tables<'platform_releases'>;

export function useReleases(opts?: { published?: boolean }) {
  return useQuery({
    queryKey: ['platform-releases', opts],
    queryFn: async () => {
      let q = supabase.from('platform_releases').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
      if (opts?.published !== undefined) q = q.eq('is_published', opts.published);
      const { data, error } = await q;
      if (error) throw error;
      return data as PlatformRelease[];
    },
  });
}

export function useUnreadReleasesCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['unread-releases-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data: releases } = await supabase.from('platform_releases').select('id').eq('is_published', true);
      const { data: reads } = await supabase.from('platform_release_reads').select('release_id').eq('user_id', user.id);
      const readSet = new Set((reads || []).map(r => r.release_id));
      return (releases || []).filter(r => !readSet.has(r.id)).length;
    },
    enabled: !!user,
    refetchInterval: 60_000,
  });
}

export function useMarkReleaseRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (releaseId: string) => {
      if (!user) return;
      await supabase.from('platform_release_reads').upsert({ user_id: user.id, release_id: releaseId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unread-releases-count'] }),
  });
}
