import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle, Users, Bell, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SecretaryDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalResidents: 0,
    totalAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const complaintsRes = await fetch(`${API_BASE_URL}/complaint/admin`, {
        credentials: 'include'
      });
      const complaintsData = await complaintsRes.json();
      const complaints = complaintsData.complaints || [];

      const usersRes = await fetch(`${API_BASE_URL}/admin/getuser`, {
        credentials: 'include'
      });
      const usersData = await usersRes.json();
      const users = usersData.data || [];

      const announcementsRes = await fetch(`${API_BASE_URL}/announcement`, {
        credentials: 'include'
      });
      const announcementsData = await announcementsRes.json();
      const announcements = announcementsData.data || [];

      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'Pending').length,
        inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length,
        resolvedComplaints: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        totalResidents: users.filter(u => u.role !== 'admin').length,
        totalAnnouncements: announcements.length
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const resolutionRate = stats.totalComplaints > 0 
    ? ((stats.resolvedComplaints / stats.totalComplaints) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🛡️ Secretary Dashboard</h1>
        <p className="text-purple-100">Welcome back! Here's what's happening in your society.</p>
      </div>
{/* Stats Grid */}
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
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

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{resolutionRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
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
      </div>

      {/* Quick Actions - ✅ WORKING BUTTONS */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('complaints')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition transform hover:scale-105"
          >
            📋 View All Complaints
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
            💳 Verify Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;