import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';

interface Artist {
  _id: string;
  artistName: string;
  email: string;
  walletBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
}

interface Wallet {
  _id: string;
  balance: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  note: string;
  createdAt: string;
}

const ArtistEarnings: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/artist-portal/wallet');
        setArtist(res.data.artist);
        setWallet(res.data.wallet);
        setTransactions(res.data.transactions);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const handleRequestPayout = async () => {
    if (!artist || artist.walletBalance <= 0) {
      toast.error('No balance available for payout');
      return;
    }

    setRequestingPayout(true);
    try {
      await axios.post('/api/artist-portal/wallet/withdrawals', {
        amount: artist.walletBalance,
        note: 'Full balance payout request',
      });
      toast.success('Payout request submitted successfully');
      // Refresh data
      const res = await axios.get('/api/artist-portal/wallet');
      setArtist(res.data.artist);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  const withdrawalHistory = transactions.filter(t => t.type === 'withdrawal_request');

  if (loading) {
    return <div className="container-custom py-20 text-center">Loading earnings data...</div>;
  }

  if (!artist) {
    return <div className="container-custom py-20 text-center">Artist profile not found</div>;
  }

  return (
    <div className="container-custom py-10">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Current Balance</h3>
          <p className="text-3xl font-bold text-green-600">₹{artist.walletBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Lifetime Earnings</h3>
          <p className="text-3xl font-bold text-blue-600">₹{artist.lifetimeEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Withdrawn</h3>
          <p className="text-3xl font-bold text-purple-600">₹{artist.totalWithdrawn.toFixed(2)}</p>
        </div>
      </div>

      {/* Request Payout Button */}
      <div className="mb-10">
        <button
          onClick={handleRequestPayout}
          disabled={requestingPayout || artist.walletBalance <= 0}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {requestingPayout ? 'Requesting...' : 'Request Payout'}
        </button>
        {artist.walletBalance <= 0 && (
          <p className="text-sm text-gray-500 mt-2">No balance available for payout</p>
        )}
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {withdrawalHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No withdrawal history yet
                  </td>
                </tr>
              ) : (
                withdrawalHistory.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {transaction.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArtistEarnings;