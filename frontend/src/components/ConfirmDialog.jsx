import { cyReplaceSpecial } from '@/utils/cy';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  keyName = 'confirmDialog',
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div
        data-cy={cyReplaceSpecial(keyName)}
        className="w-full max-w-sm rounded-xl bg-civic-surface p-6 shadow-civic"
      >
        <h2
          data-cy={cyReplaceSpecial(`${keyName}_title`)}
          className="text-lg font-semibold text-civic-dark"
        >
          {title}
        </h2>
        {message && <p className="mt-2 text-sm text-civic-muted">{message}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            keyName={`${keyName}_cancel_button`}
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            keyName={`${keyName}_confirm_button`}
            variant="danger"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
