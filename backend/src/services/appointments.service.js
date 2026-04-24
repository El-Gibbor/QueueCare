const db = require('../db/database');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(dateString) {
  if (typeof dateString !== 'string' || !DATE_REGEX.test(dateString)) {
    return 'Invalid date format. Use YYYY-MM-DD.';
  }
  // Force local-midnight parse; bare "YYYY-MM-DD" parses as UTC and breaks
  // same-day comparison in negative offsets.
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return 'Invalid date value.';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return 'Appointment date must not be in the past.';
  }
  return null;
}

const maxQueueStmt = db.prepare(
  'SELECT MAX(queueNumber) AS max FROM appointments WHERE date = ?'
);
// Cancelled appointments don't block rebooking; COALESCE(?, -1) row is skipped when rescheduling.
const findActiveBookingStmt = db.prepare(
  `SELECT id FROM appointments
   WHERE patientId = ? AND date = ? AND status != 'cancelled' AND id != COALESCE(?, -1)`
);
const insertAppointmentStmt = db.prepare(
  `INSERT INTO appointments (patientId, doctorName, reason, date, queueNumber)
   VALUES (?, ?, ?, ?, ?)`
);
const findByIdStmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
const findAllStmt = db.prepare(
  'SELECT * FROM appointments ORDER BY date, queueNumber'
);
const findByPatientStmt = db.prepare(
  'SELECT * FROM appointments WHERE patientId = ? ORDER BY date, queueNumber'
);
const updateAppointmentStmt = db.prepare(
  `UPDATE appointments
   SET doctorName = ?, reason = ?, date = ?, queueNumber = ?
   WHERE id = ?`
);
const cancelStmt = db.prepare(
  `UPDATE appointments SET status = 'cancelled' WHERE id = ?`
);

function nextQueueNumber(date) {
  const { max } = maxQueueStmt.get(date);
  return (max ?? 0) + 1;
}

function hasActiveBookingOnDate(patientId, date, excludeId = null) {
  return Boolean(findActiveBookingStmt.get(patientId, date, excludeId));
}

function createAppointment({ patientId, doctorName, reason, date }) {
  const queueNumber = nextQueueNumber(date);
  const result = insertAppointmentStmt.run(
    patientId,
    doctorName,
    reason,
    date,
    queueNumber
  );
  return findByIdStmt.get(result.lastInsertRowid);
}

function findById(id) {
  return findByIdStmt.get(id);
}

function findForUser(user) {
  if (user.role === 'patient') {
    return findByPatientStmt.all(user.id);
  }
  return findAllStmt.all();
}

function updateAppointment(existing, updates) {
  const doctorName = updates.doctorName ?? existing.doctorName;
  const reason = updates.reason ?? existing.reason;
  const date = updates.date ?? existing.date;
  const queueNumber =
    date !== existing.date ? nextQueueNumber(date) : existing.queueNumber;
  updateAppointmentStmt.run(doctorName, reason, date, queueNumber, existing.id);
  return findByIdStmt.get(existing.id);
}

function cancelAppointment(id) {
  cancelStmt.run(id);
}

module.exports = {
  validateDate,
  hasActiveBookingOnDate,
  createAppointment,
  findById,
  findForUser,
  updateAppointment,
  cancelAppointment,
};
