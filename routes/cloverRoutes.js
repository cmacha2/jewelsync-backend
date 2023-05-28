// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const cloverController = require('../controllers/cloverController');

router.post('/callback', cloverController.callback)
router.get('/create', cloverController.create);
router.post('/webhooks', cloverController.webhooks);


module.exports = router;
