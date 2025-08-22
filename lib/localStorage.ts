// Helper functions for safely accessing localStorage in both client and server environments

/**
 * Safely get an item from localStorage
 * @param key The key to get
 * @param defaultValue The default value to return if not found or if running on server
 * @returns The value or defaultValue
 */
export const getItem = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
};

/**
 * Safely set an item in localStorage
 * @param key The key to set
 * @param value The value to set
 */
export const setItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

/**
 * Safely remove an item from localStorage
 * @param key The key to remove
 */
export const removeItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

/**
 * Safely get and parse JSON from localStorage
 * @param key The key to get
 * @param defaultValue The default value to return if not found or if parsing fails
 * @returns The parsed value or defaultValue
 */
export const getJSON = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error parsing localStorage key ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Safely stringify and set JSON in localStorage
 * @param key The key to set
 * @param value The value to stringify and set
 */
export const setJSON = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error stringifying to localStorage key ${key}:`, e);
    }
  }
};
