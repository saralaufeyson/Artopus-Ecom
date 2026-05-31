import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

interface ReturnRequest {
  _id: string;
  orderId: any;
  customerId: any;
  reason: {
    code: string;
    label: string;
  };
  description: string;
  requestedAmount: number;
  approvedAmount: number;
  status: 'requested' | 'approved' | 'rejected' | 'refunded' | 'completed';
  rejectionReason?: string;
  adminNotes?: string;
  refundTransactionId?: string;
  createdAt: string;
}

const AdminReturns: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    approvedAmount: 0,
    adminNotes: '',
    rejectionReason: '',
  });

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/returns');
      setReturns(res.data);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnId: string) => {
    try {
      setActionLoading(true);
      await axios.put(`/api/returns/${returnId}/approve`, {
        approvedAmount: formData.approvedAmount || selectedReturn?.requestedAmount,
        adminNotes: formData.adminNotes,
      });

      toast.success('Return approved');
      setSelectedReturn(null);
      setFormData({ approvedAmount: 0, adminNotes: '', rejectionReason: '' });
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (returnId: string) => {
    if (!formData.rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`/api/returns/${returnId}/reject`, {
        rejectionReason: formData.rejectionReason,
      });

      toast.success('Return rejected');
      setSelectedReturn(null);
      setFormData({ approvedAmount: 0, adminNotes: '', rejectionReason: '' });
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessRefund = async (returnId: string) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/returns/${returnId}/process-refund`);

      toast.success('Refund processed');
      setSelectedReturn(null);
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async (returnId: string) => {
    try {
      setActionLoading(true);
      await axios.put(`/api/returns/${returnId}/mark-received`);

      toast.success('Return marked as received');
      setSelectedReturn(null);
      fetchReturns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark return as received');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'requested':
        return <Clock className="text-yellow-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      case 'refunded':
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-20">
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Returns</h1>
        <p className="text-gray-600 dark:text-gray-300">Process and manage customer return requests</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-100 dark:border-yellow-900/20">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {returns.filter((r) => r.status === 'requested').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Approved</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                {returns.filter((r) => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Refunded</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {returns.filter((r) => r.status === 'refunded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/20">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={24} />
            <div>
              <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                {returns.filter((r) => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Returns List */}
        <div className="col-span-2">
          <div className="space-y-3">
            {returns.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No returns found</p>
              </div>
            ) : (
              returns.map((returnRequest) => (
                <div
                  key={returnRequest._id}
                  onClick={() => {
                    setSelectedReturn(returnRequest);
                    setFormData({
                      approvedAmount: returnRequest.requestedAmount,
                      adminNotes: returnRequest.adminNotes || '',
                      rejectionReason: '',
                    });
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedReturn?._id === returnRequest._id
                      ? 'bg-purple-50 dark:bg-purple-900/10 border-logo-purple'
                      : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-logo-purple'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(returnRequest.status)}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Order #{returnRequest.orderId?._id?.slice(-8) || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {returnRequest.customerId?.name || 'N/A'} • {returnRequest.reason.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">${returnRequest.requestedAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{returnRequest.status}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Panel */}
        {selectedReturn && (
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 h-fit sticky top-4">
            <h2 className="text-lg font-bold mb-4">Return Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{selectedReturn.orderId?._id?.slice(-8)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{selectedReturn.customerId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-semibold">{selectedReturn.reason.label}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{selectedReturn.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested Amount</p>
                <p className="font-bold text-lg">${selectedReturn.requestedAmount.toFixed(2)}</p>
              </div>
            </div>

            {selectedReturn.status === 'requested' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Approved Amount</label>
                  <input
                    type="number"
                    value={formData.approvedAmount}
                    onChange={(e) => setFormData({ ...formData, approvedAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Admin Notes</label>
                  <textarea
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                  />
                </div>
                <button
                  onClick={() => handleApprove(selectedReturn._id)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Return
                </button>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rejection Reason</label>
                  <textarea
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                    placeholder="Provide reason for rejection..."
                  />
                </div>
                <button
                  onClick={() => handleReject(selectedReturn._id)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Return
                </button>
              </div>
            )}

            {selectedReturn.status === 'approved' && (
              <button
                onClick={() => handleProcessRefund(selectedReturn._id)}
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Process Refund
              </button>
            )}

            {selectedReturn.status === 'refunded' && (
              <button
                onClick={() => handleMarkReceived(selectedReturn._id)}
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                Mark as Received
              </button>
            )}
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminReturns;
