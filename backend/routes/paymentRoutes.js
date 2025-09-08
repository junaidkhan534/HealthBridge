const express = require('express');
const { createOrderController, paymentVerificationController } = require('../controllers/paymentCtrl');
const router = express.Router();
router.post('/create-order', createOrderController);
router.post('/verify-payment', paymentVerificationController);
module.exports = router;
