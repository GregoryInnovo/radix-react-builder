import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfiles } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';
interface UserProfileLinkProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}
export const UserProfileLink: React.FC<UserProfileLinkProps> = ({
  userId,
  userName,
  userEmail,
  className,
  showIcon = true,
  size = 'sm'
}) => {
  const { getProfileById } = useProfiles();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      getProfileById(userId).then(profile => {
        setAvatarUrl(profile?.avatar_url || null);
      });
    }
  }, [userId, getProfileById]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base'
  };
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };
  const displayName = userName || userEmail || 'Usuario';
  
  return <Link to={`/perfil/${userId}`} className={cn("inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors", sizeClasses[size], className)}>
      {showIcon && (
        <Avatar className={iconSizes[size]}>
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-green-100 text-green-600">
            <User className="h-2 w-2" />
          </AvatarFallback>
        </Avatar>
      )}
      <span className="truncate max-w-32 text-blue-800">{displayName}</span>
    </Link>;
};