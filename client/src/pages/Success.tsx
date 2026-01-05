import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  expectedDeliveryDate: string;
  createdAt: string;
}

const Success: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 text-green-600 dark:text-green-400">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400">Thank you for your purchase. Your order has been placed successfully.</p>
        </div>

        <div className="grid gap-8">
          {/* Order Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex flex-wrap gap-6 justify-between items-center mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Order ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">#{order._id}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Order Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-logo-purple/10 flex items-center justify-center text-logo-purple flex-shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Estimated Delivery</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Your package is expected to arrive by <span className="text-logo-purple font-bold">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package size={20} className="text-logo-purple" />
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center font-bold text-xs text-logo-purple border border-gray-100 dark:border-gray-800">
                        {item.quantity}x
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-logo-purple">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-logo-purple text-white rounded-2xl font-bold hover:bg-logo-purple/90 transition-all shadow-lg shadow-logo-purple/20 group">
              <ShoppingBag size={20} />
              Continue Shopping
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/profile" className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
