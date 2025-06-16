import { useRef, useCallback } from 'react';

/**
 * Centralized debounce hook
 * Replaces multiple debounce implementations across the codebase
 */
export const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

/**
 * Debounce hook with state tracking
 * Provides additional state for pending status
 */
export const useDebounceWithState = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef(false);
  
  const debouncedCallback = useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    pendingRef.current = true;
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      pendingRef.current = false;
    }, delay);
  }, [callback, delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      pendingRef.current = false;
    }
  }, []);
  
  const isPending = () => pendingRef.current;
  
  return {
    debouncedCallback,
    cancel,
    isPending
  };
}; 