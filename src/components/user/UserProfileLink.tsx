import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
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
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base'
  };
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };
  const displayName = userName || userEmail || 'Usuario';
  return <Link to={`/perfil/${userId}`} className={cn("inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors", sizeClasses[size], className)}>
      {showIcon && <User className={iconSizes[size]} />}
      <span className="truncate max-w-32 text-blue-800">{displayName}</span>
    </Link>;
};