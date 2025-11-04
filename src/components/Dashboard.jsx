import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; 
import { Home, FileText, Bell, DollarSign, BarChart3, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { useToast, useConfirm } from './ToastNotification';

const DashboardLayout = ({ children, activeTab, setActiveTab, userRole, userName = 'User' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error: errorToast } = useToast();
  const { confirm } = useConfirm();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const isConfirmed = await confirm(
      'You will be redirected to the home page.',
      {
        title: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );

    if (!isConfirmed) return;

    try {
      await logout(); 
      success('Logged out successfully! 👋');
      navigate('/'); 
    } catch (error) {
      console.error('Logout error:', error);
      errorToast('Logout failed. Please try again.');
    }
  };

  const navItems = userRole === 'admin' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'complaints', label: 'Complaints', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'bills', label: 'Bill Management', icon: DollarSign },
        { id: 'polls', label: 'Community Polls', icon: BarChart3 },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'complaints', label: 'My Complaints', icon: FileText },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'bills', label: 'Bills & Payment', icon: DollarSign },
        { id: 'polls', label: 'Community Polls', icon: BarChart3 }, 
      ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${userRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} rounded-xl flex items-center justify-center text-white text-2xl`}>
              🏢
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">SocioServe</h1>
              <p className="text-xs text-gray-500">
                {userRole === 'admin' ? 'Secretary Portal' : 'Resident Portal'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className={`w-10 h-10 ${userRole === 'admin' ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
              {userRole === 'admin' ? (
                <Shield className={userRole === 'admin' ? 'text-purple-600' : 'text-blue-600'} size={20} />
              ) : (
                <User className="text-blue-600" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole === 'admin' ? 'Secretary' : 'Resident'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                      isActive
                        ? `${userRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 ${userRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} rounded-xl flex items-center justify-center text-white text-xl`}>
                  🏢
                </div>
                <h1 className="text-lg font-bold text-gray-800">SocioServe</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className={`w-10 h-10 ${userRole === 'admin' ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                  {userRole === 'admin' ? (
                    <Shield className="text-purple-600" size={20} />
                  ) : (
                    <User className="text-blue-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole === 'admin' ? 'Secretary' : 'Resident'}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                          isActive
                            ? `${userRole === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${userRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} rounded-lg flex items-center justify-center text-white`}>
              🏢
            </div>
            <h1 className="text-lg font-bold text-gray-800">SocioServe</h1>
          </div>
          <div className="w-6" /> 
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600">
          <p>© 2025 SocioServe. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;