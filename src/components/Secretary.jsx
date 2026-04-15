import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle, Users, Bell, TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SecretaryDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalResidents: 0,
    totalAnnouncements: 0,
    totalPendingBills: 0,
    totalCollectedAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentPayments();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch complaints
      const complaintsRes = await fetch(`${API_BASE_URL}/complaint/admin`, {
        credentials: 'include'
      });
      const complaintsData = await complaintsRes.json();
      const complaints = complaintsData.complaints || [];

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/admin/getuser`, {
        credentials: 'include'
      });
      const usersData = await usersRes.json();
      const users = usersData.data || [];

      // Fetch announcements
      const announcementsRes = await fetch(`${API_BASE_URL}/announcement`, {
        credentials: 'include'
      });
      const announcementsData = await announcementsRes.json();
      const announcements = announcementsData.data || [];

      // Fetch bills for financial stats
      const billsRes = await fetch(`${API_BASE_URL}/bill/all`, {
        credentials: 'include'
      });
      const billsData = await billsRes.json();
      const bills = billsData.bills || [];

      const pendingBills = bills.filter(b => b.status === 'pending');
      const paidBills = bills.filter(b => b.status === 'paid');
      const totalCollected = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
      const totalPending = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);

      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
        inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length,
        resolvedComplaints: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        totalResidents: users.filter(u => u.role !== 'admin').length,
        totalAnnouncements: announcements.length,
        totalPendingBills: pendingBills.length,
        totalCollectedAmount: totalCollected,
        pendingAmount: totalPending
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/recent`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRecentPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching recent payments:', error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/report`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const resolutionRate = stats.totalComplaints > 0 
    ? ((stats.resolvedComplaints / stats.totalComplaints) * 100).toFixed(1)
    : 0;

  const collectionRate = stats.totalCollectedAmount + stats.pendingAmount > 0
    ? ((stats.totalCollectedAmount / (stats.totalCollectedAmount + stats.pendingAmount)) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🛡️ Secretary Dashboard</h1>
        <p className="text-purple-100">Welcome back! Here's what's happening in your society.</p>
      </div>
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
              <p className="text-gray-500 text-sm font-semibold">Pending Complaints</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingComplaints}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Resolved Complaints</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.resolvedComplaints}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Residents</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalResidents}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Pending Bills</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPendingBills}</p>
              <p className="text-sm text-gray-600 mt-1">₹{stats.pendingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <DollarSign className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Collected</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.totalCollectedAmount.toLocaleString('en-IN')}</p>
              <p className="text-sm text-gray-600 mt-1">Collection Rate: {collectionRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Active Announcements</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalAnnouncements}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Bell className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Complaint Status Overview</h3>
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

        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-semibold">Resolution Rate</span>
            <span className="text-gray-800 font-bold">{resolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">💰 Recent Payments</h3>
            <button
              onClick={handleDownloadReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Resident</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Flat No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{payment.userName}</td>
                    <td className="px-6 py-4 text-gray-600">{payment.flatNo}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{payment.paymentId}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('complaints')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition transform hover:scale-105"
          >
            📋 View Complaints
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition transform hover:scale-105"
          >
            📢 Create Announcement
          </button>
          <button 
            onClick={() => setActiveTab('bills')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition transform hover:scale-105"
          >
            💳 Manage Bills
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition transform hover:scale-105"
          >
            👥 Manage Residents
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;