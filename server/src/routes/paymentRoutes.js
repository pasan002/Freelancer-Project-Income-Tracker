const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  exportPaymentsCSV
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All payment routes require authentication

router.get('/export/csv', exportPaymentsCSV);

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;
