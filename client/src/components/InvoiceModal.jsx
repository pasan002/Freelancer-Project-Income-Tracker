import React from 'react';
import { X, Printer, Download, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

const InvoiceModal = ({ isOpen, onClose, payment }) => {
  const { user } = useAuth();

  if (!isOpen || !payment) return null;

  const client = payment.client || {};
  const project = payment.project || {};
  const invoiceNum = payment.invoiceNumber || `INV-${payment._id?.slice(-6)}`;
  const dateFormatted = new Date(payment.paymentDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Header Brand
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text('INVOICE / RECEIPT', 14, 22);

      // Freelancer info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(user?.name || 'Freelancer', 14, 30);
      doc.text(user?.email || 'freelancer@example.com', 14, 35);
      doc.text(user?.title || 'Independent Contractor', 14, 40);

      // Invoice Details (Right-aligned)
      doc.setFontSize(11);
      doc.setTextColor(30);
      doc.text(`Invoice #: ${invoiceNum}`, 140, 22);
      doc.text(`Date: ${dateFormatted}`, 140, 29);
      doc.text(`Status: ${payment.status}`, 140, 36);

      // Bill To Box
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 48, 196, 48);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50);
      doc.text('BILLED TO:', 14, 56);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(70);
      doc.text(client.name || 'Client', 14, 63);
      if (client.company) doc.text(client.company, 14, 68);
      if (client.email) doc.text(client.email, 14, 73);
      if (client.address) doc.text(client.address, 14, 78);

      // Items Table
      const tableData = [
        [
          project.name || 'Freelance Services',
          payment.notes || 'Milestone payment for deliverables',
          payment.paymentMethod || 'Bank Transfer',
          `$${Number(payment.amount).toFixed(2)}`
        ]
      ];

      doc.autoTable({
        startY: 85,
        head: [['Project', 'Description', 'Method', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Total summary
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text('Total Amount:', 130, finalY);
      doc.setTextColor(79, 70, 229);
      doc.text(`$${Number(payment.amount).toFixed(2)}`, 175, finalY);

      // Footer note
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(140);
      doc.text('Thank you for your business!', 14, finalY + 25);
      doc.text('Generated via FreelancePulse - Freelancer Project & Income Tracker', 14, finalY + 30);

      doc.save(`${invoiceNum}_${client.name || 'Client'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF. Please try the Print button instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Top actions bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Invoice Preview</span>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                payment.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {payment.status === 'Completed' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {payment.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-8 space-y-8 bg-white" id="invoice-paper">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  F
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">FreelancePulse</h1>
              </div>
              <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.title || 'Freelance Professional'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                Invoice & Receipt
              </span>
              <p className="text-lg font-extrabold text-slate-900 mt-2">{invoiceNum}</p>
              <p className="text-xs text-slate-500 mt-1">Date: {dateFormatted}</p>
              <p className="text-xs text-slate-500">Method: {payment.paymentMethod || 'Bank Transfer'}</p>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
              <p className="text-sm font-bold text-slate-900">{client.name || 'Valued Client'}</p>
              {client.company && <p className="text-xs text-slate-600">{client.company}</p>}
              {client.email && <p className="text-xs text-slate-500">{client.email}</p>}
              {client.address && <p className="text-xs text-slate-500">{client.address}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Project Details</p>
              <p className="text-sm font-semibold text-slate-800">{project.name || 'Freelance Project'}</p>
              <p className="text-xs text-slate-500">Total Project Fee: ${project.fee?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Description</th>
                  <th className="py-3">Payment Method</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4">
                    <p className="font-semibold text-slate-800">{project.name || 'Services Rendered'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{payment.notes || 'Milestone fee payment'}</p>
                  </td>
                  <td className="py-4 text-slate-600 text-xs">{payment.paymentMethod}</td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    ${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax / Fees</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-indigo-600">
                  ${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Thank you for partnering together! For any questions, contact {user?.email}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
