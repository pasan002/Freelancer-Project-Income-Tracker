import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [dashRes, clientsRes, paymentsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/clients?limit=100'),
        api.get('/payments?limit=200')
      ]);

      setStats(dashRes.data);
      setClients(clientsRes.data.clients || []);
      setPayments(paymentsRes.data.payments || []);
      setError('');
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to aggregate financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/payments/export/csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_income_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Title
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text('FREELANCER FINANCIAL REPORT', 14, 22);

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Prepared for: ${user?.name || 'Freelancer'} (${user?.email || ''})`, 14, 30);
      doc.text(`Generated Date: ${today}`, 14, 35);

      // Financial Summary Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 42, 182, 30, 3, 3, 'FD');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50);
      doc.text('Financial Summary Overview:', 20, 52);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Contract Value: $${(stats?.stats?.totalContractValue || 0).toLocaleString()}`, 20, 60);
      doc.text(`Total Collected Revenue: $${(stats?.stats?.totalIncome || 0).toLocaleString()}`, 80, 60);
      doc.text(`Pending Receivables: $${(stats?.stats?.pendingPayments || 0).toLocaleString()}`, 140, 60);

      doc.text(`Total Clients: ${stats?.stats?.totalClients || 0}`, 20, 67);
      doc.text(`Active Projects: ${stats?.stats?.activeProjects || 0}`, 80, 67);
      doc.text(`Completed Projects: ${stats?.stats?.completedProjects || 0}`, 140, 67);

      // Client Earnings Breakdown Table
      const clientTableRows = clients.map((c) => [
        c.name,
        c.company || 'Independent',
        c.projectCount || 0,
        `$${(c.totalFee || 0).toLocaleString()}`,
        `$${(c.totalPaid || 0).toLocaleString()}`,
        c.status
      ]);

      doc.autoTable({
        startY: 80,
        head: [['Client Name', 'Company', 'Projects', 'Billed Fee', 'Earned', 'Status']],
        body: clientTableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      // Payments Table
      const paymentsY = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40);
      doc.text('Recent Payment Transactions', 14, paymentsY);

      const paymentRows = payments.slice(0, 15).map((p) => [
        p.invoiceNumber || 'INV',
        p.client?.name || 'N/A',
        p.project?.name || 'N/A',
        new Date(p.paymentDate).toLocaleDateString(),
        p.paymentMethod,
        `$${p.amount.toLocaleString()}`,
        p.status
      ]);

      doc.autoTable({
        startY: paymentsY + 4,
        head: [['Invoice #', 'Client', 'Project', 'Date', 'Method', 'Amount', 'Status']],
        body: paymentRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 }
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140);
      doc.text('Generated via FreelancePulse - Comprehensive Freelancer Income Tracker', 14, finalY);

      doc.save(`Freelance_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Could not generate PDF. Please try CSV export.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Export official tax-ready income summaries, client billing distribution, and CSV sheets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <FileBarChart className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Contracted Value
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${(stats?.stats?.totalContractValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Across all signed client proposals</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Realized Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            ${(stats?.stats?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Collected and verified in bank/accounts</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            ${(stats?.stats?.pendingPayments || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Unpaid milestones and pending invoices</p>
        </div>
      </div>

      {/* Client Revenue Distribution Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Client Revenue Breakdown</h3>
          <p className="text-xs text-slate-400">Total contracts and earnings aggregated per client</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4 text-center">Projects</th>
                <th className="px-6 py-4 text-right">Contract Fee</th>
                <th className="px-6 py-4 text-right">Total Paid</th>
                <th className="px-6 py-4 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => {
                const totalFee = c.totalFee || 0;
                const totalPaid = c.totalPaid || 0;
                const balance = Math.max(0, totalFee - totalPaid);

                return (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{c.company || 'Independent'}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {c.projectCount || 0}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      ${totalFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      ${totalPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-amber-600">
                      ${balance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Monthly Revenue History</h3>
          <p className="text-xs text-slate-400">Monthly cash inflow breakdown</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {stats?.monthlyIncomeChart?.map((m) => (
            <div key={m.month} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs font-semibold text-slate-500 block">{m.month}</span>
              <span className="text-base font-extrabold text-indigo-700 block mt-1">
                ${m.income.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {m.count || 0} payment{(m.count || 0) === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
