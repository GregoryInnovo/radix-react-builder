import React from 'react';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { UserRatingSimple } from '@/components/calificaciones/UserRatingSimple';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProveedorInfoProps {
  profile: Profile;
  size?: 'sm' | 'md';
}

export const ProveedorInfo: React.FC<ProveedorInfoProps> = ({ profile, size = 'sm' }) => {
  return (
    <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border mb-3">
      <UserProfileLink
        userId={profile.id}
        userName={profile.full_name}
        userEmail={profile.email}
        size={size}
        className="truncate flex-1 min-w-0"
      />
      <UserRatingSimple
        userId={profile.id}
        size={size}
      />
    </div>
  );
};