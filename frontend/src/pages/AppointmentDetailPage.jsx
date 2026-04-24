import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  getAppointmentById,
  cancelAppointment,
  markServed,
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

function Field({ label, keyName, value }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="font-medium text-civic-muted">{label}</dt>
      <dd data-cy={keyName} className="text-civic-dark">
        {value}
      </dd>
    </div>
  );
}

export function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [pendingCancel, setPendingCancel] = useState(false);

  const isStaff = user.role === 'staff' || user.role === 'admin';

  async function load() {
    try {
      setAppointment(await getAppointmentById(id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // Re-fetch when the route id changes (e.g. deep-linking between appointments).
  }, [id]);

  async function handleCancelConfirmed() {
    try {
      await cancelAppointment(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingCancel(false);
    }
  }

  async function handleMarkServed() {
    try {
      await markServed(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!appointment) return <p className="text-civic-muted">Loading…</p>;

  const canEditOrCancel = appointment.status === 'scheduled';
  const canMarkServed = isStaff && appointment.status === 'scheduled';

  return (
    <div className="mx-auto max-w-lg">
      <h1
        data-cy="appointmentDetail_header"
        className="mb-6 text-2xl font-bold text-civic-dark"
      >
        Appointment #{appointment.id}
      </h1>

      <dl className="space-y-3 rounded-md border border-civic-border bg-civic-surface p-4">
        <Field
          label="Date"
          keyName="appointmentDetail_field_scheduledAt"
          value={appointment.date}
        />
        <Field
          label="Doctor"
          keyName="appointmentDetail_field_doctor"
          value={appointment.doctorName}
        />
        <Field
          label="Reason"
          keyName="appointmentDetail_field_reason"
          value={appointment.reason}
        />
        <Field
          label="Status"
          keyName="appointmentDetail_field_status"
          value={appointment.status}
        />
        <Field
          label="Queue #"
          keyName="appointmentDetail_field_queueNumber"
          value={appointment.queueNumber}
        />
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {canEditOrCancel && (
          <>
            <Button
              keyName="appointmentDetail_edit_button"
              variant="secondary"
              onClick={() => navigate(`/appointments/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              keyName="appointmentDetail_cancel_button"
              variant="danger"
              onClick={() => setPendingCancel(true)}
            >
              Cancel
            </Button>
          </>
        )}
        {canMarkServed && (
          <Button
            keyName="appointmentDetail_markServed_button"
            variant="primary"
            onClick={handleMarkServed}
          >
            Mark served
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={pendingCancel}
        title="Cancel appointment?"
        message="This action cannot be undone."
        onConfirm={handleCancelConfirmed}
        onCancel={() => setPendingCancel(false)}
      />
    </div>
  );
}
