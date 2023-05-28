const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');

// Ruta para crear un nuevo variant de producto
router.post('/:productId/variants', variantController.createProductVariant);

// Ruta para obtener una lista de variantes de producto
router.get('/:productId/variants', variantController.getProductVariants);

// Ruta para obtener el conteo de todas las variantes de producto
router.get('/variants/count', variantController.getProductVariantCount);

// Ruta para obtener una sola variante de producto
router.get('/variants/:variantId', variantController.getProductVariant);

// Ruta para modificar una variante de producto existente
router.put('/variants/:variantId', variantController.updateProductVariant);

// Ruta para eliminar una variante de producto existente
router.delete('/variants/:variantId', variantController.deleteProductVariant);

// Ruta para ajustar el nivel de inventario de un ítem de inventario en una ubicación



module.exports = router;
