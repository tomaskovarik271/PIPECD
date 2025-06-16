import { useRef, useCallback, useEffect } from 'react';

/**
 * Centralized debounce hook
 * Replaces multiple debounce implementations across the codebase
 * Features: Proper React hook compliance with cleanup and dependency handling
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Always keep callback ref current
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
};

/**
 * Debounce hook with state tracking
 * Provides additional state for pending status and cancel functionality
 */
export const useDebounceWithState = <T extends (...args: any[]) => any>(
  callback: T, 
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef(false);
  const callbackRef = useRef(callback);
  
  // Always keep callback ref current
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        pendingRef.current = false;
      }
    };
  }, []);
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    pendingRef.current = true;
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
      pendingRef.current = false;
    }, delay);
  }, [delay]) as T;
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      pendingRef.current = false;
    }
  }, []);
  
  const isPending = useCallback(() => pendingRef.current, []);
  
  return {
    debouncedCallback,
    cancel,
    isPending
  };
}; 