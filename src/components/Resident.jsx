import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle, DollarSign, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ResidentDashboard = ({ userInfo, setActiveTab }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    maintenanceDue: 0,
    dueDate: null,
    hasPendingBill: false,
    totalPaid: 0,
    totalBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints
      const complaintsResponse = await fetch(`${API_BASE_URL}/complaint/user`, {
        credentials: 'include'
      });
      const complaintsData = await complaintsResponse.json();
      const complaints = complaintsData.complaints || [];

      // Fetch bills
      const billsResponse = await fetch(`${API_BASE_URL}/bill/user`, {
        credentials: 'include'
      });
      const billsData = await billsResponse.json();
      const bills = billsData.bills || [];

      // Find the most recent pending bill
      const pendingBills = bills.filter(b => b.status === 'pending');
      const mostRecentPendingBill = pendingBills.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      // Calculate total paid amount
      const paidBills = bills.filter(b => b.status === 'paid');
      const totalPaidAmount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);

      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
        inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length,
        resolvedComplaints: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        maintenanceDue: mostRecentPendingBill?.amount || 0,
        dueDate: mostRecentPendingBill?.dueDate || null,
        hasPendingBill: !!mostRecentPendingBill,
        totalPaid: totalPaidAmount,
        totalBills: bills.length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isDueOverdue = stats.dueDate && new Date(stats.dueDate) < new Date();
  const daysUntilDue = stats.dueDate 
    ? Math.ceil((new Date(stats.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome Back, {userInfo?.userName || 'Resident'}! 👋
            </h1>
            <p className="text-blue-100">Flat No: {userInfo?.flatNo || 'N/A'}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-full shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
              alt="User Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Due Card - Only show if there's a pending bill */}
      {stats.hasPendingBill && (
        <div className={`${isDueOverdue ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`${isDueOverdue ? 'bg-red-100' : 'bg-yellow-100'} p-3 rounded-full`}>
                <DollarSign className={`${isDueOverdue ? 'text-red-600' : 'text-yellow-600'}`} size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Maintenance Due</h3>
                <p className="text-gray-600">
                  {isDueOverdue ? `⚠️ Overdue by ${Math.abs(daysUntilDue)} days` : `Due in ${daysUntilDue} days`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">₹{stats.maintenanceDue.toLocaleString('en-IN')}</p>
              <button 
                onClick={() => setActiveTab('bills')}
                className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Pay Now 💳
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>Due Date: {new Date(stats.dueDate).toLocaleDateString('en-IN', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}</span>
          </div>
        </div>
      )}

      {/* No Pending Bills Message */}
      {!stats.hasPendingBill && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {stats.totalBills === 0 ? 'No Pending Bills ✅' : 'All Caught Up! ✅'}
                </h3>
                <p className="text-gray-600">
                  {stats.totalBills === 0 
                    ? 'You have no pending maintenance bills at the moment.' 
                    : 'You have no pending maintenance bills at the moment.'}
                </p>
              </div>
            </div>
            {stats.totalPaid > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500 font-semibold">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalComplaints}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingComplaints}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">In Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inProgressComplaints}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Resolved</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.resolvedComplaints}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Your Complaint Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Pending</span>
              <span className="text-gray-800 font-bold">{stats.pendingComplaints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.pendingComplaints / stats.totalComplaints) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">In Progress</span>
              <span className="text-gray-800 font-bold">{stats.inProgressComplaints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.inProgressComplaints / stats.totalComplaints) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 font-semibold">Resolved</span>
              <span className="text-gray-800 font-bold">{stats.resolvedComplaints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalComplaints > 0 ? (stats.resolvedComplaints / stats.totalComplaints) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setActiveTab('complaints')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <h3 className="text-xl font-bold mb-2">📝 Register New Complaint</h3>
          <p className="text-blue-100 mb-4">Have an issue? Let us know and we'll resolve it quickly.</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
            Register Now →
          </button>
        </div>

        <div 
          onClick={() => setActiveTab('bills')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <h3 className="text-xl font-bold mb-2">💰 View Payment History</h3>
          <p className="text-purple-100 mb-4">Track all your maintenance payments and receipts.</p>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
            View History →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;