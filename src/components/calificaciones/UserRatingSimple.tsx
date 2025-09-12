import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useCalificaciones } from '@/hooks/useCalificaciones';

interface UserRatingSimpleProps {
  userId: string;
  size?: 'sm' | 'md';
}

export const UserRatingSimple: React.FC<UserRatingSimpleProps> = ({
  userId,
  size = 'sm'
}) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getUserRating } = useCalificaciones();

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      try {
        const avgRating = await getUserRating(userId);
        setRating(avgRating);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [userId, getUserRating]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 animate-pulse">
        <div className="h-3 bg-muted rounded w-8"></div>
      </div>
    );
  }

  if (rating === 0) {
    return (
      <span className={`${textSizeClasses[size]} text-muted-foreground`}>
        Sin calificaciones
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      <span className={`${textSizeClasses[size]} text-muted-foreground font-medium`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};