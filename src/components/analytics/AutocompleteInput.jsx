import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const BASE_URL = 'http://localhost:3000/api';

export default function AutocompleteInput({
  value,
  onChange,
  field,
  module,
  placeholder = 'Type to search...',
  debounceDelay = 300,
  colors,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Determine which endpoint and response field to use
  const getEndpointAndField = () => {
    if (['search', 'participantId'].includes(field)) {
      return { endpoint: '/participants', displayField: 'ownerName', valueField: 'id' };
    }
    if (['programId'].includes(field)) {
      return { endpoint: '/programs', displayField: 'name', valueField: 'id' };
    }
    return { endpoint: '', displayField: '', valueField: '' };
  };

  const { endpoint, displayField, valueField } = getEndpointAndField();

  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      if (!endpoint) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({ search: value, limit: 10 });
        const res = await fetch(`${BASE_URL}${endpoint}?${params}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Search failed');
        const json = await res.json();
        const items = json.data || [];
        setSuggestions(items.slice(0, 10));
        setIsOpen(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceDelay);

    return () => clearTimeout(debounceTimer.current);
  }, [value, endpoint, debounceDelay]);

  const handleSuggestionClick = (item) => {
    const displayValue = item[displayField] || item.name || '';
    onChange(displayValue);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleBlur = (e) => {
    // Close suggestions when clicking outside
    if (!suggestionsRef.current?.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1 min-w-[160px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
          style={{
            borderColor: '#e2e8f0',
            focusRing: colors?.navyPale,
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10"
          style={{ borderColor: '#e2e8f0', maxHeight: '200px', overflowY: 'auto' }}
        >
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => handleSuggestionClick(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors block"
              >
                <div className="font-medium text-gray-900">
                  {item[displayField] || item.name || `ID: ${item.id}`}
                </div>
                {item.email && <div className="text-xs text-gray-500">{item.email}</div>}
                {item.sector && <div className="text-xs text-gray-500">{item.sector}</div>}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
