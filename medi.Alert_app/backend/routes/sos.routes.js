const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sos.controller');

router.post('/trigger', sosController.triggerSOS);
router.get('/active', sosController.getActiveSOS);
router.post('/:id/complete', sosController.completeSOS);

module.exports = router;
