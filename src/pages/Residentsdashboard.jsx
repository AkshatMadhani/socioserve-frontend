import React, { useState } from 'react';
import { useAuth } from '../App';
import DashboardLayout from '../components/Dashboard';
import ResidentDashboard from '../components/Resident';
import ComplaintsEnhanced from '../components/Complaints';
import Announcements from '../components/Announcement';
import Bills from '../components/Bills';
import Polls from '../components/Polls';

const ResidentDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const userInfo = {
    userId: user?._id,
    userName: user?.username || 'Resident',
    userRole: user?.role || 'resident',
    flatNo: user?.flatno || '',
    email: user?.email || ''
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ResidentDashboard userInfo={userInfo} setActiveTab={setActiveTab} />;
      
      case 'complaints':
        return (
          <ComplaintsEnhanced 
            userRole={userInfo.userRole} 
            userId={userInfo.userId} 
          />
        );
      
      case 'announcements':
        return <Announcements userRole={userInfo.userRole} />;
      
      case 'bills':
        return (
          <Bills 
            userRole={userInfo.userRole} 
            userId={userInfo.userId}
            userInfo={userInfo}
          />
        );
      
      case 'polls':
        return (
          <Polls 
            userRole={userInfo.userRole} 
            userId={userInfo.userId}
          />
        );
      
      default:
        return <ResidentDashboard userInfo={userInfo} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userRole={userInfo.userRole}
      userName={userInfo.userName}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ResidentDashboardPage;