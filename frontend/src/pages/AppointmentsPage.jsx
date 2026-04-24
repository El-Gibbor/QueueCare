import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentCard } from '@/components/AppointmentCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/Button';
import { getAppointments, cancelAppointment } from '@/services/api';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  // Holds the id pending cancellation so the dialog can reference it; null when closed.
  const [pendingCancel, setPendingCancel] = useState(null);

  async function load() {
    try {
      setAppointments(await getAppointments());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirmCancel() {
    try {
      await cancelAppointment(pendingCancel);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === pendingCancel ? { ...a, status: 'cancelled' } : a
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingCancel(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-civic-dark">Appointments</h1>
        <Button
          keyName="appointmentList_newAppointment_button"
          variant="primary"
          onClick={() => navigate('/appointments/new')}
        >
          New appointment
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div data-cy="appointment-list" className="space-y-4">
        {appointments.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onCancel={(id) => setPendingCancel(id)}
          />
        ))}
        {appointments.length === 0 && !error && (
          <p className="text-civic-muted">No appointments found.</p>
        )}
      </div>

      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancel appointment?"
        message="This action cannot be undone."
        onConfirm={handleConfirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}
