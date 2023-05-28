// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:productId', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);


module.exports = router;
