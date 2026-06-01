import { Select, SelectOption } from '@/components/ui/select';
import AutocompleteInput from './AutocompleteInput';

// Fixed dropdown options
const DROPDOWN_OPTIONS = {
  // Participants
  district: [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
    'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
    'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ],
  sector: [
    'Agriculture', 'Manufacturing', 'Services', 'Technology', 'Tourism', 'Construction', 'Retail', 'Health'
  ],
  status: [
    'Active', 'Inactive', 'Pending', 'Suspended'
  ],
  // Programs
  mode: [
    'Online', 'Offline', 'Hybrid'
  ],
  province: [
    'Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western'
  ],
  // Enrollments
  completionStatus: [
    'Completed', 'In Progress', 'Not Started', 'Dropped'
  ]
};

// Determines if a field should use autocomplete or dropdown
const useAutocompleteFields = ['search', 'programId', 'participantId'];

export default function ValueInput({
  value,
  onChange,
  field,
  module,
  colors,
}) {
  // Check if this field should use autocomplete
  const shouldUseAutocomplete = useAutocompleteFields.includes(field);

  // Get dropdown options for this field, if any
  const dropdownOptions = DROPDOWN_OPTIONS[field];

  if (shouldUseAutocomplete) {
    return (
      <AutocompleteInput
        value={value}
        onChange={onChange}
        field={field}
        module={module}
        placeholder="Type to search..."
        colors={colors}
      />
    );
  }

  if (dropdownOptions) {
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <SelectOption value="">Select {field}...</SelectOption>
        {dropdownOptions.map(option => (
          <SelectOption key={option} value={option}>
            {option}
          </SelectOption>
        ))}
      </Select>
    );
  }

  // Fallback to text input for unknown fields
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value..."
      className="flex-1 min-w-[160px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0"
      style={{ borderColor: '#e2e8f0' }}
    />
  );
}
