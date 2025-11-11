import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook untuk manage search history menggunakan useRef
 * useRef digunakan untuk simpan history tanpa trigger re-render
 * @param {number} maxItems - Maximum number of history items
 * @returns {Object} - { addToHistory, getHistory, clearHistory, showHistory, setShowHistory }
 */
const useSearchHistory = (maxItems = 5) => {
  // useRef untuk simpan search history tanpa re-render
  const searchHistoryRef = useRef([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Load history dari localStorage saat mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        searchHistoryRef.current = JSON.parse(savedHistory);
      } catch (error) {
        console.error('Error loading search history:', error);
        searchHistoryRef.current = [];
      }
    }
  }, []);

  /**
   * Add search term to history
   * @param {string} term - Search term to add
   */
  const addToHistory = (term) => {
    if (!term || term.trim().length === 0) return;
    
    const trimmedTerm = term.trim();
    
    // Remove duplicate if exists
    searchHistoryRef.current = searchHistoryRef.current.filter(
      item => item.toLowerCase() !== trimmedTerm.toLowerCase()
    );
    
    // Add to beginning of array
    searchHistoryRef.current = [trimmedTerm, ...searchHistoryRef.current];
    
    // Limit to maxItems
    if (searchHistoryRef.current.length > maxItems) {
      searchHistoryRef.current = searchHistoryRef.current.slice(0, maxItems);
    }
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryRef.current));
  };

  /**
   * Get current search history
   * @returns {Array} - Array of search terms
   */
  const getHistory = () => {
    return searchHistoryRef.current;
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    searchHistoryRef.current = [];
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  return {
    addToHistory,
    getHistory,
    clearHistory,
    showHistory,
    setShowHistory,
  };
};

export default useSearchHistory;
