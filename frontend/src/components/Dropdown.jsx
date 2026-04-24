import { cyReplaceSpecial } from '@/utils/cy';

export function Dropdown({ keyName, label, options, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-civic-dark">{label}</span>
      <select
        data-cy={cyReplaceSpecial(`${keyName}_select`)}
        className="w-full rounded-md border border-civic-border bg-civic-surface px-3 py-2 text-sm text-civic-dark transition-colors duration-200 focus:border-civic-blue focus:outline-none focus:ring-1 focus:ring-civic-blue"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            data-cy={cyReplaceSpecial(`${keyName}_select_${opt.labelId ?? opt.value}`)}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          data-cy={cyReplaceSpecial(`${keyName}_error`)}
          className="mt-1 block text-sm text-red-600"
        >
          {error}
        </span>
      )}
    </label>
  );
}
