const express = require('express');
const router = express.Router();
const {
    getBicycles,
    getBicycleById,
    addBicycle,
    updateBicycle,
    deleteBicycle
} = require('../controllers/bicycleController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getBicycles)
    .post(protect, admin, upload.single('image'), addBicycle);

router.route('/:id')
    .get(getBicycleById)
    .put(protect, admin, upload.single('image'), updateBicycle)
    .delete(protect, admin, deleteBicycle);

module.exports = router;
