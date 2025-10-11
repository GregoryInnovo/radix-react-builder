/**
 * Utility to parse authentication parameters from both URL query (?param=value) 
 * and hash fragment (#param=value), prioritizing hash parameters
 */
export const parseAuthParams = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash ? window.location.hash.substring(1) : ''
  );

  return {
    get: (key: string): string | null => {
      // Hash parameters take priority (Supabase redirects use hash)
      return hashParams.get(key) || queryParams.get(key);
    },
    has: (key: string): boolean => {
      return hashParams.has(key) || queryParams.has(key);
    },
    getAll: (): Record<string, string> => {
      const all: Record<string, string> = {};
      
      // First add query params
      queryParams.forEach((value, key) => {
        all[key] = value;
      });
      
      // Then add/override with hash params (priority)
      hashParams.forEach((value, key) => {
        all[key] = value;
      });
      
      return all;
    },
    isHash: (): boolean => {
      return window.location.hash.length > 1;
    }
  };
};

/**
 * Clears authentication parameters from both URL query and hash
 */
export const clearAuthParams = () => {
  const url = new URL(window.location.href);
  
  // Clear hash
  url.hash = '';
  
  // Clear auth-related query params
  const paramsToRemove = ['error', 'error_description', 'error_code', 'type', 'access_token', 'refresh_token'];
  paramsToRemove.forEach(param => {
    url.searchParams.delete(param);
  });
  
  window.history.replaceState({}, '', url.toString());
};
