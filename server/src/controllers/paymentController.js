const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Client = require('../models/Client');

// Helper to recalculate Project paidAmount
const recalculateProjectPaid = async (projectId, userId) => {
  const completedPayments = await Payment.find({
    project: projectId,
    user: userId,
    status: 'Completed'
  });
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  await Project.findByIdAndUpdate(projectId, { paidAmount: totalPaid });
};

// @desc    Get all payments with filters and pagination
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const {
      search,
      client,
      project,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'paymentDate',
      order = 'desc'
    } = req.query;

    const query = { user: req.user._id };

    if (client && client !== 'all') {
      query.client = client;
    }

    if (project && project !== 'all') {
      query.project = project;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Payment.countDocuments(query);
    let payments = await Payment.find(query)
      .populate('project', 'name fee paidAmount status')
      .populate('client', 'name email company')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // If search keyword provided, filter in-memory or by invoice
    if (search) {
      const term = search.toLowerCase();
      payments = payments.filter((p) => {
        const inv = (p.invoiceNumber || '').toLowerCase();
        const notes = (p.notes || '').toLowerCase();
        const pName = (p.project && p.project.name ? p.project.name : '').toLowerCase();
        const cName = (p.client && p.client.name ? p.client.name : '').toLowerCase();
        return inv.includes(term) || notes.includes(term) || pName.includes(term) || cName.includes(term);
      });
    }

    // Calculate sum of payments matching query
    const allMatching = await Payment.find(query);
    const totalReceived = allMatching
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = allMatching
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      summary: {
        totalReceived,
        totalPending
      },
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('project')
      .populate('client');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const { project: projectId, amount, paymentDate, paymentMethod, status, notes, invoiceNumber } = req.body;

    if (!projectId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project and amount'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Generate invoice number if not supplied
    const generatedInvoice = invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

    const payment = await Payment.create({
      user: req.user._id,
      project: project._id,
      client: project.client,
      amount: Number(amount),
      paymentDate: paymentDate || Date.now(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      status: status || 'Completed',
      invoiceNumber: generatedInvoice,
      notes
    });

    // Recalculate project paid amount
    await recalculateProjectPaid(project._id, req.user._id);

    const populated = await Payment.findById(payment._id)
      .populate('project', 'name fee paidAmount')
      .populate('client', 'name email company');

    res.status(201).json({
      success: true,
      payment: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res, next) => {
  try {
    const { amount, paymentDate, paymentMethod, status, notes, invoiceNumber } = req.body;

    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (amount !== undefined) payment.amount = Number(amount);
    if (paymentDate !== undefined) payment.paymentDate = paymentDate;
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (status !== undefined) payment.status = status;
    if (notes !== undefined) payment.notes = notes;
    if (invoiceNumber !== undefined) payment.invoiceNumber = invoiceNumber;

    const updatedPayment = await payment.save();

    // Recalculate project paid amount
    await recalculateProjectPaid(payment.project, req.user._id);

    const populated = await Payment.findById(updatedPayment._id)
      .populate('project', 'name fee paidAmount')
      .populate('client', 'name email company');

    res.status(200).json({
      success: true,
      payment: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const projectId = payment.project;
    await Payment.deleteOne({ _id: payment._id });

    // Recalculate project paid amount
    await recalculateProjectPaid(projectId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export payments to CSV
// @route   GET /api/payments/export/csv
// @access  Private
const exportPaymentsCSV = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('project', 'name fee')
      .populate('client', 'name email company')
      .sort({ paymentDate: -1 });

    const headers = ['Invoice Number', 'Client', 'Project', 'Amount', 'Date', 'Method', 'Status', 'Notes'];
    const rows = payments.map((p) => [
      `"${p.invoiceNumber || ''}"`,
      `"${p.client ? p.client.name : 'N/A'}"`,
      `"${p.project ? p.project.name : 'N/A'}"`,
      p.amount,
      new Date(p.paymentDate).toISOString().split('T')[0],
      `"${p.paymentMethod}"`,
      `"${p.status}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  exportPaymentsCSV
};
