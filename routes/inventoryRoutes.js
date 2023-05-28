const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Ruta para ajustar el nivel de inventario de un ítem en una ubicación
// router.get('/location', inventoryController.getLocationId)
router.post('/adjust', inventoryController.adjustInventory);

// Ruta para obtener el nivel de inventario de un ítem en una ubicación específica
// router.get('/:itemId/location/:locationId', inventoryController.getInventoryLevel);

module.exports = router;
