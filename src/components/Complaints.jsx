import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Send, AlertCircle, Clock, CheckCircle, MessageSquare, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ComplaintsEnhanced = ({ userRole, userId }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComplaint, setNewComplaint] = useState({ subject: '', description: '' });
  const [adminComment, setAdminComment] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/complaint/admin` 
        : `${API_BASE_URL}/complaint/user`;
      
      const response = await axios.get(endpoint, { 
        withCredentials: true 
      });
      
      if (response.data.success || response.data.complaints) {
        setComplaints(response.data.complaints || []);
        setError('');
      }
    } catch (error) {
      console.log('Error fetching complaints:', error);
      setError('Failed to load complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterComplaint = async () => {
    setError('');

    if (!newComplaint.subject || !newComplaint.description) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/complaint/register`,
        {
          subject: newComplaint.subject,
          description: newComplaint.description
        },
        { withCredentials: true }
      );

      if (response.data.complaint) {
        fetchComplaints();
        setNewComplaint({ subject: '', description: '' });
        setShowAddModal(false);
        setError('');
      }
    } catch (error) {
      console.log('Error registering complaint:', error);
      setError(error.response?.data?.message || 'Failed to register complaint');
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    setUpdating(complaintId);
    setError('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/complaint/update/${complaintId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.message) {
        fetchComplaints();
        setShowDetailModal(false);
        setSelectedComplaint(null);
        setError('');
      }
    } catch (error) {
      console.log('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddComment = async (complaintId) => {
    if (!adminComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setCommentLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/complaint/comment/${complaintId}`,
        { text: adminComment },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAdminComment('');
        setSelectedComplaint(response.data.complaint);
        fetchComplaints();
        setError('');
      }
    } catch (error) {
      console.log('Error adding comment:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setAdminComment('');
    setShowDetailModal(true);
    setError('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Resolved': 'bg-green-100 text-green-800 border-green-300',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': AlertCircle,
      'In Progress': Clock,
      'Resolved': CheckCircle,
      'Closed': CheckCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Complaints Management</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'admin' 
              ? 'View and manage all resident complaints' 
              : 'Track your complaints and their status'}
          </p>
        </div>
        {userRole !== 'admin' && (
          <button 
            onClick={() => {
              setShowAddModal(true);
              setError('');
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            <Plus size={20} />
            Register Complaint
          </button>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{complaints.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {complaints.filter(c => c.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-gray-800">
            {complaints.filter(c => c.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-gray-800">
            {complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
          </p>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Complaints Found</h3>
          <p className="text-gray-600">
            {userRole === 'admin' 
              ? 'No complaints have been registered yet.' 
              : "You haven't registered any complaints yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div 
              key={complaint._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border-l-4 border-blue-500 cursor-pointer"
              onClick={() => openComplaintDetails(complaint)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{complaint.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      {complaint.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                  
                  {userRole === 'admin' && complaint.userId && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mb-2 flex items-center gap-4">
                      <span><strong>User:</strong> {complaint.userId.username}</span>
                      <span><strong>Email:</strong> {complaint.userId.email}</span>
                      <span><strong>Flat:</strong> {complaint.userId.flatno}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(complaint.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {userRole === 'admin' && (
                  <div className="ml-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Edit className="text-blue-600" size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Register New Complaint</h3>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                ❌ {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  value={newComplaint.subject}
                  onChange={(e) => setNewComplaint({ 
                    ...newComplaint, 
                    subject: e.target.value 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Water leakage in bathroom"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ 
                    ...newComplaint, 
                    description: e.target.value 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Describe your complaint in detail..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleRegisterComplaint}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Submit
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDetailModal && selectedComplaint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowDetailModal(false);
                setError('');
              }}
              className="float-right text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedComplaint.subject}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                ❌ {error}
              </div>
            )}

            {userRole === 'admin' && selectedComplaint.userId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-2">Resident Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-semibold">{selectedComplaint.userId.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-semibold">{selectedComplaint.userId.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Flat No:</span>
                    <span className="ml-2 font-semibold">{selectedComplaint.userId.flatno}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Registered:</span>
                    <span className="ml-2 font-semibold">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800">Update Status</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['Pending', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedComplaint._id, status)}
                      disabled={selectedComplaint.status === status || updating === selectedComplaint._id}
                      className={`px-4 py-3 rounded-lg font-semibold transition border ${getStatusColor(status)} ${
                        selectedComplaint.status === status || updating === selectedComplaint._id
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:shadow-md'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="border-t-2 pt-4">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Admin Comments
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                    {selectedComplaint.comments && selectedComplaint.comments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedComplaint.comments.map((comment, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm text-gray-800">{comment.adminName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No comments yet</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 h-20 resize-none text-sm"
                      placeholder="Add a comment for the resident..."
                    />
                    <button
                      onClick={() => handleAddComment(selectedComplaint._id)}
                      disabled={!adminComment.trim() || commentLoading}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {commentLoading ? 'Adding...' : 'Add Comment'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userRole !== 'admin' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Your complaint is currently <strong>{selectedComplaint.status}</strong>. 
                    Our team is working on it and will update you soon.
                  </p>
                </div>
                {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                  <div className="border-t-2 pt-4">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MessageSquare size={20} />
                      Updates from Admin
                    </h4>
                    <div className="space-y-3">
                      {selectedComplaint.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-sm text-gray-800">{comment.adminName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsEnhanced;