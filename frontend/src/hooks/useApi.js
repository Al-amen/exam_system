import { useState, useCallback } from 'react';

export function useApi(apiFunction, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useApi: Executing API function');
      
      const result = await apiFunction(...args);
      
      // Handle different response structures
      const resultData = result.data !== undefined ? result.data : result;
      setData(resultData);
      console.log('✅ useApi: API call successful', resultData);
      return resultData;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      console.error('❌ useApi: API call failed', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData
  };
}