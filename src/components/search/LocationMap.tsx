
import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, className = "" }) => {
  // Simple visual representation of location with coordinates
  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(4)}°${direction}`;
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-center mb-2">
        <div className="relative">
          {/* Simple map representation */}
          <div className="w-20 h-16 bg-gradient-to-b from-green-100 to-blue-100 rounded border border-gray-300 relative overflow-hidden">
            {/* Grid lines to simulate map */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-px bg-gray-400 absolute left-1/3"></div>
              <div className="h-full w-px bg-gray-400 absolute right-1/3"></div>
              <div className="w-full h-px bg-gray-400 absolute top-1/3"></div>
              <div className="w-full h-px bg-gray-400 absolute bottom-1/3"></div>
            </div>
            {/* Location pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-center space-y-1">
        <div className="font-medium">Tu ubicación</div>
        <div className="space-y-0.5">
          <div>{formatCoordinate(lat, true)}</div>
          <div>{formatCoordinate(lng, false)}</div>
        </div>
      </div>
    </div>
  );
};
