const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Client = require('../models/Client');

// @desc    Get dashboard metrics, charts, and recent activity
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch counts & projects
    const totalClients = await Client.countDocuments({ user: userId });
    const allProjects = await Project.find({ user: userId });
    const allPayments = await Payment.find({ user: userId });

    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = allProjects.filter((p) => p.status === 'Completed').length;
    const pendingProjects = allProjects.filter((p) => p.status === 'Pending').length;

    // 2. Financial totals
    const totalContractValue = allProjects.reduce((sum, p) => sum + (p.fee || 0), 0);
    const totalIncome = allPayments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Pending payments: project fees remaining unpaid plus any explicit pending payment entries
    const pendingProjectBalance = Math.max(0, totalContractValue - totalIncome);
    const explicitPendingPayments = allPayments
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Status breakdown for Pie Chart
    const statusCounts = {
      'In Progress': 0,
      'Completed': 0,
      'Pending': 0,
      'On Hold': 0,
      'Cancelled': 0
    };

    allProjects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      } else {
        statusCounts[p.status] = 1;
      }
    });

    const projectStatusChart = Object.keys(statusCounts).map((status) => ({
      status,
      count: statusCounts[status]
    }));

    // 4. Monthly Income breakdown (past 6-12 months) for Bar Chart
    const now = new Date();
    const monthsData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate past 6 months slots
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = `${monthNames[month]} ${year}`;
      monthsData.push({
        year,
        month,
        name: monthLabel,
        income: 0,
        count: 0
      });
    }

    // Fill income from completed payments
    allPayments
      .filter((p) => p.status === 'Completed')
      .forEach((p) => {
        const pDate = new Date(p.paymentDate);
        const pYear = pDate.getFullYear();
        const pMonth = pDate.getMonth();

        const match = monthsData.find((m) => m.year === pYear && m.month === pMonth);
        if (match) {
          match.income += p.amount;
          match.count++;
        }
      });

    // 5. Recent items
    const recentProjects = await Project.find({ user: userId })
      .populate('client', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ user: userId })
      .populate('project', 'name')
      .populate('client', 'name')
      .sort({ paymentDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        activeProjects,
        completedProjects,
        pendingProjects,
        totalProjects,
        totalClients,
        totalIncome,
        pendingPayments: pendingProjectBalance,
        explicitPendingPayments,
        totalContractValue
      },
      monthlyIncomeChart: monthsData.map((m) => ({
        month: m.name,
        income: m.income,
        count: m.count
      })),
      projectStatusChart,
      recentProjects,
      recentPayments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
