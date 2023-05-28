const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/monthly', orderController.getMonthlyOrders); // Nueva ruta
router.get('/sixmonths', orderController.getSixMonthsOrders); // Nueva ruta
router.get('/customer/:customerId', orderController.getCustomerOrders); // Nueva ruta
router.get('/:orderId', orderController.getOrder);
router.post('/', orderController.createOrder);
router.put('/:orderId', orderController.updateOrder);
router.post('/fulfillment', orderController.fulfillOrder); // Nueva ruta para fulfillOrder
router.get('/fulfillment/:orderId', orderController.getOrderFulfillment); // Nueva ruta para getOrderFulfillment

module.exports = router;
