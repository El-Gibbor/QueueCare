import { cyReplaceSpecial } from '@/utils/cy';

export function TextArea({ keyName, label, error, rows = 3, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-civic-dark">{label}</span>
      <textarea
        data-cy={cyReplaceSpecial(keyName)}
        rows={rows}
        className="w-full rounded-md border border-civic-border bg-civic-surface px-3 py-2 text-sm text-civic-dark transition-colors duration-200 focus:border-civic-blue focus:outline-none focus:ring-1 focus:ring-civic-blue"
        {...props}
      />
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
