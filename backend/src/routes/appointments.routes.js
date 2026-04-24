const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  create,
  list,
  getOne,
  update,
  cancel,
  serve,
} = require('../controllers/appointments.controller');

const router = express.Router();

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
// Staff/admin-only action; more specific path registered before the generic /:id PATCH.
router.patch('/:id/serve', authorize('staff', 'admin'), serve);
router.patch('/:id', update);
router.delete('/:id', cancel);

module.exports = router;
