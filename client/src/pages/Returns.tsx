import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

interface ReturnRequest {
  _id: string;
  orderId: any;
  reason: {
    code: string;
    label: string;
  };
  description: string;
  requestedAmount: number;
  approvedAmount: number;
  status: 'requested' | 'approved' | 'rejected' | 'refunded' | 'completed';
  rejectionReason?: string;
  refundTransactionId?: string;
  createdAt: string;
}

const Returns: React.FC = () => {
  const params = useParams();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    orderId: params.orderId || '',
    reason: '',
    description: '',
    photos: [] as string[],
  });
  const [returnReasons, setReturnReasons] = useState<any[]>([]);

  useEffect(() => {
    fetchReturns();
    fetchReturnReasons();
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

  const fetchReturnReasons = async () => {
    try {
      const res = await axios.get('/api/returns/config/reasons');
      setReturnReasons(res.data.reasons);
    } catch (error) {
      console.error('Error fetching reasons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId || !formData.reason || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setRequestingReturn(true);
      await axios.post('/api/returns', {
        orderId: formData.orderId,
        reason: formData.reason,
        description: formData.description,
        photos: formData.photos,
      });

      toast.success('Return request submitted successfully');
      setShowForm(false);
      setFormData({ orderId: '', reason: '', description: '', photos: [] });
      fetchReturns();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit return request';
      toast.error(message);
    } finally {
      setRequestingReturn(false);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'refunded':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Returns & Refunds</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your return requests and refunds</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-logo-purple text-white rounded-lg font-semibold hover:bg-logo-purple/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Request Return'}
          </button>
        </div>

        {/* Return Request Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Submit Return Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Order ID *</label>
                <input
                  type="text"
                  placeholder="Select order to return"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Reason for Return *</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-purple"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason) => (
                    <option key={reason.code} value={reason.code}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe the issue in detail..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-logo-purple"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={requestingReturn}
                className="w-full px-6 py-3 bg-logo-purple text-white rounded-lg font-semibold hover:bg-logo-purple/90 disabled:opacity-50 transition-colors"
              >
                {requestingReturn ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </form>
          </div>
        )}

        {/* Returns List */}
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No return requests yet</p>
            </div>
          ) : (
            returns.map((returnRequest) => (
              <div
                key={returnRequest._id}
                className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(returnRequest.status)}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Return for Order #{returnRequest.orderId?._id?.slice(-8) || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(returnRequest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(returnRequest.status)}`}>
                    {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Reason: </span>
                    <span className="text-gray-600 dark:text-gray-400">{returnRequest.reason.label}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Description: </span>
                    <span className="text-gray-600 dark:text-gray-400">{returnRequest.description}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Requested Amount: </span>
                    <span className="text-gray-600 dark:text-gray-400">${returnRequest.requestedAmount.toFixed(2)}</span>
                  </p>
                  {returnRequest.approvedAmount > 0 && (
                    <p>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Approved Amount: </span>
                      <span className="text-green-600 dark:text-green-400">${returnRequest.approvedAmount.toFixed(2)}</span>
                    </p>
                  )}
                  {returnRequest.rejectionReason && (
                    <p>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Rejection Reason: </span>
                      <span className="text-red-600 dark:text-red-400">{returnRequest.rejectionReason}</span>
                    </p>
                  )}
                  {returnRequest.refundTransactionId && (
                    <p>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Refund ID: </span>
                      <span className="text-gray-600 dark:text-gray-400">{returnRequest.refundTransactionId}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Returns;
