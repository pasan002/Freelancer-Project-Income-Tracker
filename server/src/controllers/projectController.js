const Project = require('../models/Project');
const Client = require('../models/Client');
const Payment = require('../models/Payment');

// @desc    Get all projects with search, filter, and pagination
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status, client, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { user: req.user._id };

    // Search by project name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by project status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by client
    if (client && client !== 'all') {
      query.client = client;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details with payments
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('client', 'name email company phone address');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const payments = await Payment.find({
      project: project._id,
      user: req.user._id
    }).sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      project,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, client, fee, status, priority, description, startDate, dueDate } = req.body;

    if (!name || !client || fee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name, client, and fee'
      });
    }

    // Verify client exists and belongs to user
    const clientExists = await Client.findOne({
      _id: client,
      user: req.user._id
    });

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected client does not exist or does not belong to you'
      });
    }

    const project = await Project.create({
      user: req.user._id,
      client,
      name,
      description,
      fee: Number(fee),
      paidAmount: 0,
      status: status || 'In Progress',
      priority: priority || 'Medium',
      startDate: startDate || Date.now(),
      dueDate: dueDate || undefined
    });

    const populatedProject = await Project.findById(project._id).populate('client', 'name email company');

    res.status(201).json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const { name, client, fee, status, priority, description, startDate, dueDate } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (client) {
      const clientExists = await Client.findOne({
        _id: client,
        user: req.user._id
      });
      if (!clientExists) {
        return res.status(404).json({
          success: false,
          message: 'Selected client does not exist'
        });
      }
      project.client = client;
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (fee !== undefined) project.fee = Number(fee);
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id).populate('client', 'name email company');

    res.status(200).json({
      success: true,
      project: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project and related payments
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete associated payments
    await Payment.deleteMany({ project: project._id, user: req.user._id });
    await Project.deleteOne({ _id: project._id });

    res.status(200).json({
      success: true,
      message: 'Project and associated payments removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
