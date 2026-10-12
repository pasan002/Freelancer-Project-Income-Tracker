const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

// @desc    Get all clients for logged in user (with search & pagination)
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50, status } = req.query;

    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Enrich clients with project count and total billed
    const clientIds = clients.map((c) => c._id);
    const projectStats = await Project.aggregate([
      { $match: { client: { $in: clientIds }, user: req.user._id } },
      {
        $group: {
          _id: '$client',
          projectCount: { $sum: 1 },
          totalFee: { $sum: '$fee' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);

    const statsMap = {};
    projectStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    const enrichedClients = clients.map((c) => {
      const stats = statsMap[c._id.toString()] || {
        projectCount: 0,
        totalFee: 0,
        totalPaid: 0
      };
      return {
        ...c.toObject(),
        projectCount: stats.projectCount,
        totalFee: stats.totalFee,
        totalPaid: stats.totalPaid
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedClients.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      clients: enrichedClients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client details with associated projects
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const projects = await Project.find({
      client: client._id,
      user: req.user._id
    }).sort({ createdAt: -1 });

    const payments = await Payment.find({
      client: client._id,
      user: req.user._id
    }).sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      client,
      projects,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required'
      });
    }

    const client = await Client.create({
      user: req.user._id,
      name,
      email,
      phone,
      company: company || 'Independent',
      address,
      notes,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      client
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (company !== undefined) client.company = company;
    if (address !== undefined) client.address = address;
    if (notes !== undefined) client.notes = notes;
    if (status !== undefined) client.status = status;

    const updatedClient = await client.save();

    res.status(200).json({
      success: true,
      client: updatedClient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a client and optionally cleanup projects & payments
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Cascade delete associated projects and payments
    await Project.deleteMany({ client: client._id, user: req.user._id });
    await Payment.deleteMany({ client: client._id, user: req.user._id });
    await Client.deleteOne({ _id: client._id });

    res.status(200).json({
      success: true,
      message: 'Client and all associated projects and payments removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
