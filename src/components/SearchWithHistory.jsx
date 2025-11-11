import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaHistory, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';
import useSearchHistory from '../hooks/useSearchHistory';

/**
 * SearchWithHistory - Search input dengan history dropdown
 * Menggunakan useRef dari custom hook useSearchHistory
 */
function SearchWithHistory({ value = "", onChange, placeholder = "Cari event..." }) {
  const { addToHistory, getHistory, clearHistory, showHistory, setShowHistory } = useSearchHistory(5);
  const [localValue, setLocalValue] = useState(value);
  const searchContainerRef = useRef(null);
  const isControlled = value !== undefined;

  // Handle controlled component updates
  useEffect(() => {
    if (isControlled) {
      setLocalValue(value);
    }
  }, [value, isControlled]);

  // Handle click outside untuk close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowHistory]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setLocalValue(newValue);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleInputFocus = () => {
    if (getHistory().length > 0) {
      setShowHistory(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && localValue.trim()) {
      addToHistory(localValue);
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (term) => {
    setLocalValue(term);
    onChange({ target: { value: term } });
    setShowHistory(false);
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    clearHistory();
  };

  const history = getHistory();

  return (
    <div className="search-history-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          className="search-input"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showHistory && history.length > 0 && (
        <div className="search-history-dropdown">
          <div className="search-history-header">
            <span>
              <FaHistory /> Pencarian Terakhir
            </span>
            <button 
              className="clear-history-btn" 
              onClick={handleClearHistory}
              title="Hapus riwayat"
            >
              <FaTimes /> Hapus
            </button>
          </div>
          {history.map((term, index) => (
            <div
              key={index}
              className="search-history-item"
              onClick={() => handleHistoryClick(term)}
            >
              <FaSearch className="history-icon" />
              <span>{term}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SearchWithHistory.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

SearchWithHistory.defaultProps = {
  value: "",
  onChange: () => {},
  placeholder: "Cari event..."
};

export default SearchWithHistory;
