const appointmentsService = require('../services/appointments.service');

function isStaffLike(role) {
  return role === 'staff' || role === 'admin';
}

function create(req, res, next) {
  try {
    const { doctorName, reason, date } = req.body || {};

    if (!doctorName || !reason || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dateError = appointmentsService.validateDate(date);
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    if (appointmentsService.hasActiveBookingOnDate(req.user.id, date)) {
      return res
        .status(400)
        .json({ error: 'You already have an appointment on this date' });
    }

    const appointment = appointmentsService.createAppointment({
      patientId: req.user.id,
      doctorName,
      reason,
      date,
    });

    return res.status(201).json(appointment);
  } catch (err) {
    return next(err);
  }
}

function list(req, res, next) {
  try {
    return res.status(200).json(appointmentsService.findForUser(req.user));
  } catch (err) {
    return next(err);
  }
}

function getOne(req, res, next) {
  try {
    const id = Number(req.params.id);
    const appointment = appointmentsService.findById(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (!isStaffLike(req.user.role) && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return res.status(200).json(appointment);
  } catch (err) {
    return next(err);
  }
}

function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = appointmentsService.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && existing.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (existing.status === 'cancelled' || existing.status === 'served') {
      return res.status(409).json({
        error: `Cannot update an appointment that is ${existing.status}`,
      });
    }

    const { doctorName, reason, date } = req.body || {};

    if (doctorName === undefined && reason === undefined && date === undefined) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    if (date !== undefined) {
      const dateError = appointmentsService.validateDate(date);
      if (dateError) {
        return res.status(400).json({ error: dateError });
      }
      if (
        date !== existing.date &&
        appointmentsService.hasActiveBookingOnDate(
          existing.patientId,
          date,
          existing.id
        )
      ) {
        return res.status(400).json({
          error: 'Patient already has an appointment on this date',
        });
      }
    }

    const updated = appointmentsService.updateAppointment(existing, {
      doctorName,
      reason,
      date,
    });
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
}

function cancel(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = appointmentsService.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && existing.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (existing.status === 'cancelled') {
      return res.status(409).json({ error: 'Appointment is already cancelled' });
    }

    appointmentsService.cancelAppointment(existing.id);
    return res
      .status(200)
      .json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    return next(err);
  }
}

function serve(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = appointmentsService.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (existing.status === 'served') {
      return res.status(409).json({ error: 'Appointment is already served' });
    }

    if (existing.status === 'cancelled') {
      return res
        .status(409)
        .json({ error: 'Cannot serve a cancelled appointment' });
    }

    appointmentsService.markServed(existing.id);
    const appointment = appointmentsService.findById(existing.id);
    return res.status(200).json({
      message: 'Patient marked as served',
      appointment,
    });
  } catch (err) {
    return next(err);
  }
}

function queueToday(req, res, next) {
  try {
    const today = appointmentsService.todayLocalDate();
    return res.status(200).json(appointmentsService.findQueueForDate(today));
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, list, getOne, update, cancel, serve, queueToday };
