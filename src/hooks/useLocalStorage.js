import { useState } from 'react';

/**
 * Custom hook untuk mengelola localStorage dengan React state
 * @param {string} key - Key untuk localStorage
 * @param {*} initialValue - Nilai default jika tidak ada data di localStorage
 * @returns {[*, Function]} - [storedValue, setValue]
 */
function useLocalStorage(key, initialValue) {
  // State untuk menyimpan nilai
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Ambil data dari localStorage
      const item = window.localStorage.getItem(key);
      // Parse dan return data jika ada, jika tidak return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fungsi untuk set value ke state dan localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
