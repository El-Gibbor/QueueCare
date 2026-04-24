import { Link } from 'react-router-dom';

const statusBadge = {
  scheduled: 'bg-civic-surface text-civic-blue border border-civic-blue',
  served: 'bg-civic-surface text-civic-green border border-civic-green',
  cancelled: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export function AppointmentCard({ appointment, onCancel }) {
  const id = appointment.id;
  const badgeClass =
    statusBadge[appointment.status] ??
    'bg-slate-100 text-slate-500 border border-slate-200';

  return (
    <article
      data-cy={`appointment-card-${id}`}
      className="rounded-md border border-civic-border bg-civic-surface p-4"
    >
      <header className="flex items-center justify-between">
        <span className="font-semibold text-civic-dark">{appointment.doctorName}</span>
        <span
          data-cy={`appointment-card-${id}__status`}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {appointment.status}
        </span>
      </header>

      <p className="mt-1 text-sm text-civic-muted">Queue #{appointment.queueNumber}</p>
      <p className="mt-2 text-sm text-civic-dark">{appointment.reason}</p>
      <p className="mt-1 text-xs text-civic-muted">{appointment.date}</p>

      <footer className="mt-3 flex gap-4">
        <Link
          to={`/appointments/${id}`}
          data-cy={`appointment-card-${id}__view`}
          className="text-sm text-civic-blue hover:underline"
        >
          View
        </Link>

        {appointment.status === 'scheduled' && (
          <>
            <Link
              to={`/appointments/${id}/edit`}
              data-cy={`appointment-card-${id}__edit`}
              className="text-sm text-civic-blue hover:underline"
            >
              Edit
            </Link>
            <button
              type="button"
              data-cy={`appointment-card-${id}__cancel`}
              onClick={() => onCancel(id)}
              className="text-sm text-red-600 transition-colors duration-150 hover:underline"
            >
              Cancel
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
