import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useProfiles = () => {
  const [loading, setLoading] = useState(false);
  const [profilesCache, setProfilesCache] = useState<Map<string, Profile>>(new Map());

  const getProfileById = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first
    if (profilesCache.has(userId)) {
      return profilesCache.get(userId) || null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        setProfilesCache(prev => new Map(prev).set(userId, data));
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profilesCache]);

  const getMultipleProfiles = useCallback(async (userIds: string[]): Promise<Profile[]> => {
    const uncachedIds = userIds.filter(id => !profilesCache.has(id));
    
    if (uncachedIds.length === 0) {
      return userIds.map(id => profilesCache.get(id)).filter(Boolean) as Profile[];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uncachedIds);

      if (error) throw error;

      // Update cache
      if (data) {
        const newCache = new Map(profilesCache);
        data.forEach(profile => {
          newCache.set(profile.id, profile);
        });
        setProfilesCache(newCache);
      }

      // Return all requested profiles from cache
      return userIds.map(id => profilesCache.get(id)).filter(Boolean) as Profile[];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [profilesCache]);

  return {
    loading,
    getProfileById,
    getMultipleProfiles
  };
};