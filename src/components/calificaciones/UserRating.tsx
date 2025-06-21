
import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { useCalificaciones } from '@/hooks/useCalificaciones';

interface UserRatingProps {
  userId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserRating: React.FC<UserRatingProps> = ({
  userId,
  showCount = true,
  size = 'sm'
}) => {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getUserRating, getUserRatingCount } = useCalificaciones();

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      try {
        const [avgRating, ratingCount] = await Promise.all([
          getUserRating(userId),
          showCount ? getUserRatingCount(userId) : Promise.resolve(0)
        ]);
        
        setRating(avgRating);
        setCount(ratingCount);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [userId, showCount, getUserRating, getUserRatingCount]);

  if (loading) {
    return <div className="flex items-center gap-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>;
  }

  if (rating === 0) {
    return <span className="text-sm text-gray-500">Sin calificaciones</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      {showCount && count > 0 && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
};
