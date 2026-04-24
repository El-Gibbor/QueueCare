const express = require('express');
const auth = require('../middleware/auth');
const {
  create,
  list,
  getOne,
  update,
  cancel,
} = require('../controllers/appointments.controller');

const router = express.Router();

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', cancel);

module.exports = router;
