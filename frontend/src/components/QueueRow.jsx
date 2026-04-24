import { Button } from './Button';

export function QueueRow({ item, isStaff, onMarkServed }) {
  const statusColor =
    item.status === 'served' ? 'text-civic-green' : 'text-civic-dark';

  return (
    <tr
      data-cy={`queue-item-${item.queueNumber}`}
      className="border-b border-civic-border last:border-0"
    >
      <td
        data-cy={`queue-item-${item.queueNumber}__number`}
        className="py-3 pr-4 font-mono text-sm font-medium text-civic-dark"
      >
        {item.queueNumber}
      </td>
      <td
        data-cy={`queue-item-${item.queueNumber}__patientName`}
        className="py-3 pr-4 text-sm text-civic-dark"
      >
        {item.patientName}
      </td>
      <td
        data-cy={`queue-item-${item.queueNumber}__status`}
        className={`py-3 pr-4 text-sm font-medium ${statusColor}`}
      >
        {item.status}
      </td>
      <td className="py-3">
        {isStaff && item.status !== 'served' && (
          <Button
            keyName={`queue_markServed_button_${item.queueNumber}`}
            variant="primary"
            onClick={() => onMarkServed(item.id)}
          >
            Mark served
          </Button>
        )}
      </td>
    </tr>
  );
}
