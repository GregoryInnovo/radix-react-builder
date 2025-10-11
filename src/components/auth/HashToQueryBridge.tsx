import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseAuthParams } from '@/lib/authUtils';

/**
 * Global component that detects authentication errors in URL hash
 * and converts them to query parameters for proper handling
 */
export const HashToQueryBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authParams = parseAuthParams();
    
    // Only act if there's a hash with error parameters
    if (!authParams.isHash()) return;
    
    const error = authParams.get('error');
    const errorDescription = authParams.get('error_description');
    
    if (error || errorDescription) {
      // Build query string from all auth params
      const queryParams = new URLSearchParams();
      const allParams = authParams.getAll();
      
      Object.entries(allParams).forEach(([key, value]) => {
        queryParams.set(key, value);
      });
      
      // Clear hash and navigate to /auth with query params
      const targetPath = location.pathname === '/auth' 
        ? `/auth?${queryParams.toString()}`
        : `/auth?${queryParams.toString()}`;
      
      // Replace state to avoid back button issues
      window.history.replaceState({}, '', location.pathname + location.search);
      navigate(targetPath, { replace: true });
    }
  }, [location, navigate]);

  return null;
};
