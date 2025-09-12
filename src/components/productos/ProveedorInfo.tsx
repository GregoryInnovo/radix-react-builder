import React from 'react';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { UserRating } from '@/components/calificaciones/UserRating';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProveedorInfoProps {
  profile: Profile;
  size?: 'sm' | 'md';
}

export const ProveedorInfo: React.FC<ProveedorInfoProps> = ({ profile, size = 'sm' }) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg border mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">
          Ofrecido por:
        </span>
        <UserProfileLink
          userId={profile.id}
          userName={profile.full_name}
          userEmail={profile.email}
          size={size}
          className="truncate"
        />
      </div>
      <UserRating
        userId={profile.id}
        showCount={false}
        size={size}
      />
    </div>
  );
};