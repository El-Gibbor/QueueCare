import { cyReplaceSpecial } from '@/utils/cy';

// Composite field: date and time are split per data-cy-convention so Cypress
// can target each half (`..._date` and `..._time`). Backend only consumes the date.
export function DateInput({
  keyName,
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  error,
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-civic-dark">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          data-cy={cyReplaceSpecial(`${keyName}_date`)}
          className="rounded-md border border-civic-border bg-civic-surface px-3 py-2 text-sm text-civic-dark transition-colors duration-200 focus:border-civic-blue focus:outline-none focus:ring-1 focus:ring-civic-blue"
          value={dateValue ?? ''}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <input
          type="time"
          data-cy={cyReplaceSpecial(`${keyName}_time`)}
          className="rounded-md border border-civic-border bg-civic-surface px-3 py-2 text-sm text-civic-dark transition-colors duration-200 focus:border-civic-blue focus:outline-none focus:ring-1 focus:ring-civic-blue"
          value={timeValue ?? ''}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
      {error && (
        <span
          data-cy={cyReplaceSpecial(`${keyName}_error`)}
          className="mt-1 block text-sm text-red-600"
        >
          {error}
        </span>
      )}
    </fieldset>
  );
}
