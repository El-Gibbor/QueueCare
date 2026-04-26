import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField } from '@/components/TextField';
import { TextArea } from '@/components/TextArea';
import { DateInput } from '@/components/DateInput';
import { Button } from '@/components/Button';
import { getKeyName, cyReplaceSpecial } from '@/utils/cy';
import {
  createAppointment,
  updateAppointment,
  getAppointmentById,
} from '@/services/api';

const dateKeyName = getKeyName({
  groupName: 'appointmentForm',
  componentType: 'DateInput',
  labelId: 'scheduledAt',
});

export function AppointmentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  // `time` is tracked for the split DateInput but not sent - backend stores YYYY-MM-DD only.
  const [form, setForm] = useState({
    doctorName: '',
    reason: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getAppointmentById(id)
      .then((a) =>
        setForm({
          doctorName: a.doctorName,
          reason: a.reason,
          date: a.date,
          time: '',
        })
      )
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        doctorName: form.doctorName,
        reason: form.reason,
        date: form.date,
      };
      if (isEdit) {
        await updateAppointment(id, payload);
      } else {
        await createAppointment(payload);
      }
      navigate('/appointments');
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-civic-dark">
        {isEdit ? 'Edit appointment' : 'New appointment'}
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <TextField
          keyName="appointmentForm_TextField_doctorName"
          label="Doctor name"
          value={form.doctorName}
          onChange={(e) =>
            setForm((f) => ({ ...f, doctorName: e.target.value }))
          }
          required
        />
        <DateInput
          keyName={dateKeyName}
          label="Appointment date and time"
          dateValue={form.date}
          timeValue={form.time}
          onDateChange={(v) => setForm((f) => ({ ...f, date: v }))}
          onTimeChange={(v) => setForm((f) => ({ ...f, time: v }))}
        />
        <TextArea
          keyName="appointmentForm_TextArea_reason"
          label="Reason for visit"
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          required
        />
        {error && (
          <p
            data-cy={cyReplaceSpecial('appointmentForm_error')}
            className="text-sm text-red-600"
          >
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            keyName="appointmentForm_submit_button"
            type="submit"
            className="flex-1"
          >
            {isEdit ? 'Save changes' : 'Book appointment'}
          </Button>
          <Button
            keyName="appointmentForm_cancel_button"
            type="button"
            variant="secondary"
            onClick={() => navigate('/appointments')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
