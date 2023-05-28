const express = require('express');
const router = express.Router();
const { receiveOrder,createWebhook,receiveProductUpdate, recieveNotification } = require('../controllers/webhookController');

router.post('/orders/create', receiveOrder);
// router.post("/", recieveNotification)
router.post('/create', createWebhook);
router.post('/products/update', receiveProductUpdate);


module.exports = router;
