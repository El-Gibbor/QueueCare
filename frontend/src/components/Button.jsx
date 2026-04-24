import { cyReplaceSpecial } from '@/utils/cy';

const variants = {
  primary:
    'bg-civic-blue text-white hover:brightness-95 disabled:bg-civic-border disabled:text-civic-muted disabled:cursor-not-allowed',
  secondary:
    'bg-civic-surface text-civic-dark border border-civic-border hover:bg-civic-bg',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-civic-border disabled:text-civic-muted disabled:cursor-not-allowed',
};

export function Button({ keyName, children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      data-cy={cyReplaceSpecial(keyName)}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
