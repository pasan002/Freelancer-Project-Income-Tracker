import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  DollarSign,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import MonthlyIncomeChart from '../components/Charts/MonthlyIncomeChart';
import ProjectStatusPieChart from '../components/Charts/ProjectStatusPieChart';
import ProjectModal from '../components/ProjectModal';
import PaymentModal from '../components/PaymentModal';
import ClientModal from '../components/ClientModal';
import InvoiceModal from '../components/InvoiceModal';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Dropdown lists for modals
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, clientsRes, projectsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/clients?limit=100'),
        api.get('/projects?limit=100')
      ]);

      setData(dashRes.data);
      setClients(clientsRes.data.clients || []);
      setProjects(projectsRes.data.projects || []);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data. Please make sure the server is connected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    activeProjects: 0,
    totalIncome: 0,
    pendingPayments: 0,
    totalClients: 0
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-white/10 px-3 py-1 rounded-full">
            Freelance Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Welcome back, {user?.name || 'Freelancer'}! 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Here is an overview of your active projects, financial health, and pending payments for this cycle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          color="indigo"
          subtitle={`${stats.totalProjects || 0} total projects in pipeline`}
          badge="In Progress"
        />
        <StatCard
          title="Total Income Earned"
          value={`$${(stats.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="emerald"
          subtitle="Net received payments"
          badge="Completed"
        />
        <StatCard
          title="Pending Payments"
          value={`$${(stats.pendingPayments || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Clock}
          color="amber"
          subtitle="Outstanding receivables"
          badge="To Collect"
        />
        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          icon={Users}
          color="sky"
          subtitle="Client roster & contacts"
          badge="Network"
        />
      </div>

      {/* Visual Representation: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Income History</h3>
              <p className="text-xs text-slate-400">Past 6 months collected freelance revenue</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              USD ($)
            </span>
          </div>
          <MonthlyIncomeChart data={data?.monthlyIncomeChart || []} />
        </div>

        {/* Project Status Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Projects by Status</h3>
            <p className="text-xs text-slate-400">Distribution of pipeline workloads</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ProjectStatusPieChart data={data?.projectStatusChart || []} />
          </div>
        </div>
      </div>

      {/* Bottom Lists: Recent Projects & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Projects</h3>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentProjects && data.recentProjects.length > 0 ? (
              data.recentProjects.map((project) => (
                <div key={project._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {project.client?.name || 'Client'} • Fee: ${project.fee?.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                      project.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : project.status === 'In Progress'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No projects added yet</p>
            )}
          </div>
        </div>

        {/* Recent Payments & Invoices */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Income & Payments</h3>
            </div>
            <Link
              to="/payments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentPayments && data.recentPayments.length > 0 ? (
              data.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {p.project?.name || 'Project payment'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold text-emerald-600">
                      +${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(p)}
                      title="View Invoice"
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <FileCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No payments recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSaved={fetchDashboardData}
        clients={clients}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSaved={fetchDashboardData}
        projects={projects}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={fetchDashboardData}
      />

      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        payment={selectedInvoice}
      />
    </div>
  );
};

export default Dashboard;
