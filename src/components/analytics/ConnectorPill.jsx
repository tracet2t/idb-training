import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function ConnectorPill({ value, onChange, colors }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = ['AND', 'OR', 'NOT'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm"
        style={{
          backgroundColor: '#f0f4f8',
          color: colors?.navyMain || '#1a3a5c',
          borderColor: colors?.navyPale || '#B0D4F1',
        }}
      >
        {value}
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20"
          style={{ borderColor: '#e2e8f0', minWidth: '120px' }}
        >
          {options.map(option => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md"
              style={{
                backgroundColor: value === option ? colors?.navyPale : 'transparent',
                color: value === option ? colors?.navyMain : '#6b7280',
                fontWeight: value === option ? 600 : 400,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
