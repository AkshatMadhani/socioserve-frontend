import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Upload,
  History,
  Image as ImageIcon,
  X,
  Eye,
  FileText,
  Plus,
  User
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const Bills = ({ userRole, userId, userInfo }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [uploadData, setUploadData] = useState({
    file: null,
    preview: null,
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [newBill, setNewBill] = useState({
    userId: '',
    amount: '',
    month: '',
    description: 'Monthly Maintenance Fee',
    dueDate: ''
  });
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState(null);

  useEffect(() => {
    fetchBills();
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, []);

  const fetchBills = async () => {
    try {
      const endpoint = userRole === 'admin' 
        ? `${API_BASE_URL}/bill/all` 
        : `${API_BASE_URL}/bill/user`;
      
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setBills(response.data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/getuser`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.data.filter(u => u.role !== 'admin'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateBill = async () => {
    if (!newBill.userId || !newBill.amount || !newBill.month || !newBill.dueDate) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/bill/create`,
        newBill,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('✅ Bill created successfully!');
        setNewBill({
          userId: '',
          amount: '',
          month: '',
          description: 'Monthly Maintenance Fee',
          dueDate: ''
        });
        setShowCreateModal(false);
        fetchBills();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to create bill'));
    } finally {
      setCreating(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('❌ Please upload an image file (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({
          ...uploadData,
          file: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!uploadData.file) {
      alert('⚠️ Please select a payment proof image');
      return;
    }

    if (!uploadData.transactionId) {
      alert('⚠️ Please enter transaction ID');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('paymentProof', uploadData.file);
      formData.append('transactionId', uploadData.transactionId);
      formData.append('paymentDate', uploadData.paymentDate);

      const response = await axios.post(
        `${API_BASE_URL}/bill/upload-proof/${selectedBill._id}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        alert('✅ Payment proof uploaded successfully! Status updated to "Pending Verification"');
        setUploadData({ file: null, preview: null, transactionId: '', paymentDate: new Date().toISOString().split('T')[0] });
        setShowUploadModal(false);
        setSelectedBill(null);
        fetchBills();
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('❌ ' + (error.response?.data?.message || 'Error uploading payment proof'));
    } finally {
      setUploading(false);
    }
  };

  const verifyPayment = async (billId, approve) => {
    const confirmMsg = approve 
      ? 'Approve this payment?' 
      : 'Reject this payment?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/bill/verify/${billId}`,
        { approved: approve, rejectionReason: approve ? '' : 'Payment proof rejected' },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert(approve ? '✅ Payment approved!' : '❌ Payment rejected!');
        fetchBills();
      }
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Error verifying payment'));
    }
  };

  const viewPaymentProof = (filename) => {
    const url = `${API_BASE_URL}/uploads/payments/${filename}`;
    setViewProofUrl(url);
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';

    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, text: 'Paid ✓' },
      pending_verification: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock, text: 'Pending Verification ⏳' },
      pending: isOverdue 
        ? { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle, text: 'Overdue ⚠️' }
        : { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, text: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-1 ${config.color}`}>
        <Icon size={16} />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bills...</p>
      </div>
    );
  }

  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const pendingVerification = bills.filter(b => b.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">💳 Maintenance Bills</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'admin' ? 'Manage bills and verify payments' : 'Upload payment proof after making payment'}
          </p>
        </div>
        {/* ✅ CREATE BILL BUTTON FOR ADMIN */}
        {userRole === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            <Plus size={20} />
            Create Bill
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-100 font-semibold">Pending Amount</p>
            <AlertCircle size={24} />
          </div>
          <p className="text-4xl font-bold">₹{totalPending.toLocaleString('en-IN')}</p>
          <p className="text-yellow-100 mt-2">
            {bills.filter(b => b.status === 'pending').length} bill(s) pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 font-semibold">Awaiting Verification</p>
            <Clock size={24} />
          </div>
          <p className="text-4xl font-bold">{pendingVerification}</p>
          <p className="text-blue-100 mt-2">Payment proof uploaded</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 font-semibold">Total Paid</p>
            <CheckCircle size={24} />
          </div>
          <p className="text-4xl font-bold">₹{totalPaid.toLocaleString('en-IN')}</p>
          <p className="text-green-100 mt-2">
            {bills.filter(b => b.status === 'paid').length} bill(s) paid
          </p>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <History size={24} />
            Payment History
          </h3>
        </div>

        {bills.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-semibold mb-2">No bills found</p>
            {userRole === 'admin' ? (
              <p className="text-gray-500 text-sm">Click "Create Bill" to add a new bill for residents</p>
            ) : (
              <p className="text-gray-500 text-sm">No bills assigned to you yet</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bills.map((bill) => {
              const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntilDue < 0 && bill.status === 'pending';

              return (
                <div key={bill._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    {/* Left: Bill Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-4 rounded-full flex-shrink-0 ${
                        bill.status === 'paid' ? 'bg-green-100' : 
                        bill.status === 'pending_verification' ? 'bg-blue-100' : 
                        'bg-yellow-100'
                      }`}>
                        <DollarSign className={
                          bill.status === 'paid' ? 'text-green-600' : 
                          bill.status === 'pending_verification' ? 'text-blue-600' : 
                          'text-yellow-600'
                        } size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-lg font-bold text-gray-800">{bill.month}</h4>
                          {getStatusBadge(bill.status, bill.dueDate)}
                        </div>
                        <p className="text-gray-600 mb-2">{bill.description}</p>
                        
                        {userRole === 'admin' && bill.userId && (
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <User size={14} />
                            {bill.userId.username} - Flat {bill.userId.flatno}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}
                          </span>
                          {isOverdue && (
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <AlertCircle size={14} />
                              Overdue by {Math.abs(daysUntilDue)} days
                            </span>
                          )}
                        </div>

                        {bill.transactionId && (
                          <p className="text-sm text-gray-500 mb-2">
                            Transaction ID: <span className="font-mono font-semibold text-gray-700">{bill.transactionId}</span>
                          </p>
                        )}

                        {bill.paymentProof && (
                          <button
                            onClick={() => viewPaymentProof(bill.paymentProof)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 mt-2"
                          >
                            <Eye size={14} />
                            📄 View: {bill.paymentProof}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="text-right flex flex-col items-end gap-3">
                      <p className="text-3xl font-bold text-gray-800">
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </p>

                      {/* ✅ RESIDENT ACTIONS - UPLOAD BUTTON */}
                      {userRole !== 'admin' && (
                        <>
                          {bill.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowUploadModal(true);
                              }}
                              className={`${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap`}
                            >
                              <Upload size={18} />
                              Upload Proof
                            </button>
                          )}
                          {bill.status === 'pending_verification' && (
                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">
                              ⏳ Verification Pending
                            </span>
                          )}
                          {bill.status === 'paid' && (
                            <button className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-200 transition flex items-center gap-2">
                              <CheckCircle size={18} />
                              Paid ✓
                            </button>
                          )}
                        </>
                      )}

                      {/* Admin Actions */}
                      {userRole === 'admin' && (
                        <>
                          {bill.status === 'pending_verification' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => verifyPayment(bill._id, true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => verifyPayment(bill._id, false)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition whitespace-nowrap"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {bill.status === 'paid' && (
                            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-sm">
                              ✓ Verified
                            </span>
                          )}
                          {bill.status === 'pending' && (
                            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-semibold text-sm">
                              ⏳ Awaiting Payment
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <AlertCircle className="text-blue-600" size={20} />
          Payment Instructions
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
          <div>
            <p className="font-semibold mb-2">🏦 Bank Details:</p>
            <ul className="space-y-1 text-sm">
              <li>• Account Name: SocioServe Society</li>
              <li>• Bank: HDFC Bank</li>
              <li>• Account No: 1234567890</li>
              <li>• IFSC Code: HDFC0001234</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">📝 Steps to Pay:</p>
            <ol className="space-y-1 text-sm list-decimal list-inside">
              <li>Transfer amount to above bank account</li>
              <li>Take screenshot of payment confirmation</li>
              <li>Click "Upload Proof" button above</li>
              <li>Enter transaction ID and upload screenshot</li>
              <li>Wait for admin verification</li>
            </ol>
          </div>
        </div>
      </div>

      {/* CREATE BILL MODAL */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Create New Bill</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Resident *
                </label>
                <select
                  value={newBill.userId}
                  onChange={(e) => setNewBill({ ...newBill, userId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose a resident</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} - Flat {user.flatno}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Month *
                </label>
                <input
                  type="text"
                  value={newBill.month}
                  onChange={(e) => setNewBill({ ...newBill, month: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="e.g., January 2025"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newBill.description}
                  onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="Monthly Maintenance Fee"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateBill}
                  disabled={creating}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Bill
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && selectedBill && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Upload Payment Proof</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Bill for</p>
              <p className="text-xl font-bold text-gray-800">{selectedBill.month}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹{selectedBill.amount.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Transaction ID / UTR Number *
                </label>
                <input
                  type="text"
                  value={uploadData.transactionId}
                  onChange={(e) => setUploadData({ ...uploadData, transactionId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter transaction ID"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={uploadData.paymentDate}
                  onChange={(e) => setUploadData({ ...uploadData, paymentDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
              <label className="block text-gray-700 font-semibold mb-2">
                  Payment Screenshot *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition">
                  {uploadData.preview ? (
                    <div className="relative">
                      <img 
                        src={uploadData.preview} 
                        alt="Payment proof" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => setUploadData({ ...uploadData, file: null, preview: null })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <p className="mt-2 text-sm text-gray-600">📄 {uploadData.file?.name}</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-2">Click to upload payment screenshot</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUploadProof}
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Submit Proof
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROOF MODAL */}
      {viewProofUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewProofUrl(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setViewProofUrl(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 z-10"
            >
              <X size={24} />
            </button>
            <img 
              src={viewProofUrl} 
              alt="Payment proof" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;