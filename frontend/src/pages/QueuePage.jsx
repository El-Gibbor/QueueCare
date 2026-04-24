import { useEffect, useState } from 'react';
import { QueueRow } from '@/components/QueueRow';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { getTodaysQueue, markServed } from '@/services/api';

export function QueuePage() {
  const { user } = useAuth();
  // ProtectedRoute already gates the page, but keep the local check
  // so QueueRow hides the action for any non-staff viewer.
  const isStaff = user.role === 'staff' || user.role === 'admin';
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setQueue(await getTodaysQueue());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkServed(appointmentId) {
    try {
      await markServed(appointmentId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-civic-dark">
          Today&rsquo;s queue
        </h1>
        <Button
          keyName="queue_refresh_button"
          variant="secondary"
          onClick={load}
        >
          Refresh
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {queue.length === 0 ? (
        <p data-cy="queue_empty_state" className="text-civic-muted">
          No patients in queue today.
        </p>
      ) : (
        <table
          data-cy="queue-list"
          className="w-full text-left"
        >
          <thead className="border-b border-civic-border text-sm text-civic-muted">
            <tr>
              <th className="pb-3 pr-4 font-medium">#</th>
              <th className="pb-3 pr-4 font-medium">Patient</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                isStaff={isStaff}
                onMarkServed={handleMarkServed}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
