import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = '/api';

const PatientInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const patientId = localStorage.getItem('patientId');
    const token = localStorage.getItem('patientToken');

    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/invoices?patientId=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setInvoices(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice) => {
    // Simple implementation: generate and download as text
    const content = `
DENTAL CLINIC INVOICE
=====================
Invoice ID: ${invoice._id}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

STATUS: ${invoice.status}

ITEMS:
${invoice.items.map(item => 
  `${item.description} x${item.quantity} @ $${item.rate} = $${item.amount}`
).join('\n')}

SUBTOTAL: $${invoice.subtotal}
TAX (${invoice.taxPercentage || 10}%): $${invoice.tax}
TOTAL: $${invoice.total}

${invoice.paidDate ? `PAID ON: ${new Date(invoice.paidDate).toLocaleDateString()}` : 'PENDING PAYMENT'}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `Invoice_${invoice._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Invoice downloaded!');
  };

  const handleMarkPaid = async (invoiceId) => {
    const token = localStorage.getItem('patientToken');
    try {
      const response = await axios.put(
        `${API_URL}/invoices/${invoiceId}`,
        { status: 'Paid' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInvoices(prev => prev.map(inv => inv._id === invoiceId ? { ...inv, status: 'Paid', paidDate: new Date() } : inv));
        toast.success('Invoice marked as paid!');
        setSelectedInvoice(null);
      }
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading invoices...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💰 Your Invoices</h2>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No invoices yet</p>
          <p className="text-sm mt-2">Your invoices will appear here after treatment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map(invoice => (
            <div
              key={invoice._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedInvoice(invoice)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-800">
                      Invoice #{invoice._id.slice(-6).toUpperCase()}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    📅 {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {invoice.items.length} item{invoice.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">${invoice.total}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Invoice #{selectedInvoice._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
              </div>

              {selectedInvoice.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Date:</span>
                  <span className="font-semibold text-green-600">{new Date(selectedInvoice.paidDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
              <div className="space-y-2 bg-gray-50 p-3 rounded">
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.description} x{item.quantity}</span>
                    <span className="font-semibold">${item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${selectedInvoice.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({selectedInvoice.taxPercentage || 10}%):</span>
                <span>${selectedInvoice.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">${selectedInvoice.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleDownload(selectedInvoice)}
                className="w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 transition-colors"
              >
                📥 Download Invoice
              </button>
              {selectedInvoice.status !== 'Paid' && (
                <button
                  onClick={() => handleMarkPaid(selectedInvoice._id)}
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓ Mark as Paid
                </button>
              )}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full bg-gray-300 text-gray-800 py-2 rounded font-semibold hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInvoices;
