// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/daily', paymentController.getDailyPayments);
router.get('/weekly', paymentController.getWeeklyPayments);
router.get('/monthly', paymentController.getMonthlyPayments);
router.get('/last-six-months', paymentController.getLastSixMonthsPayments);
router.get('/balance', paymentController.getAccountBalance);
router.get('/transactions', paymentController.getRecentTransactions);

module.exports = router;
