const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getCustomers);
router.get('/:customerId', customerController.getCustomer);
router.use('/monthlyCustomers', customerController.getMonthlyCustomers);

module.exports = router;
