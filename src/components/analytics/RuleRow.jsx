import { Trash2 } from 'lucide-react';
import { Select, SelectOption } from '@/components/ui/select';
import ValueInput from './ValueInput';

const MODULE_COLORS = {
  Participants: { bg: '#dbeafe', text: '#0369a1' },
  Programs: { bg: '#fcdab7', text: '#9333ea' },
  Enrollments: { bg: '#bbf7d0', text: '#15803d' },
};

const FIELD_OPTIONS = {
  Participants: [
    { value: 'search', label: 'Name / Business / Email' },
    { value: 'district', label: 'District' },
    { value: 'status', label: 'Status' },
    { value: 'sector', label: 'Sector' },
  ],
  Programs: [
    { value: 'search', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'province', label: 'Province' },
    { value: 'district', label: 'District' },
    { value: 'mode', label: 'Mode' },
  ],
  Enrollments: [
    { value: 'completionStatus', label: 'Completion Status' },
    { value: 'programId', label: 'Program ID' },
    { value: 'participantId', label: 'Participant ID' },
  ],
};

export default function RuleRow({
  rule,
  onUpdate,
  onDelete,
  canDelete,
  colors,
}) {
  const moduleColor = MODULE_COLORS[rule.module];
  const fieldOptions = FIELD_OPTIONS[rule.module] || [];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-sm"
      style={{ borderColor: '#e2e8f0', backgroundColor: '#fafafa' }}>

      {/* Module Badge */}
      <div
        className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
        style={{
          backgroundColor: moduleColor.bg,
          color: moduleColor.text,
        }}
      >
        {rule.module}
      </div>

      {/* Field Selector */}
      <Select
        value={rule.field}
        onChange={(e) => onUpdate('field', e.target.value)}
        style={{ flex: '0 1 200px' }}
      >
        {fieldOptions.map(f => (
          <SelectOption key={f.value} value={f.value}>
            {f.label}
          </SelectOption>
        ))}
      </Select>

      {/* Value Input */}
      <div style={{ flex: '1 1 200px', minWidth: '160px' }}>
        <ValueInput
          value={rule.value}
          onChange={(val) => onUpdate('value', val)}
          field={rule.field}
          module={rule.module}
          colors={colors}
        />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(rule.id)}
        disabled={!canDelete}
        className="p-2 rounded hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title={canDelete ? 'Delete rule' : 'Cannot delete the last rule'}
      >
        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}
