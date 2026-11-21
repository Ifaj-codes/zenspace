const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/calendar', syncController.getCalendarSync);
router.get('/overview', syncController.getDashboardOverview);

module.exports = router;
