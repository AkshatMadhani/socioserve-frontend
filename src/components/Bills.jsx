import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, Eye, Upload, CreditCard, Sparkles } from 'lucide-react';
import { useToast, useConfirm } from './ToastNotification';
import axios from 'axios';
import MockPaymentModal from './MockPaymentModal';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Status Badge Component
const StatusBadge = ({ status }) => {
  const map = {
    paid: 'bg-green-100 text-green-700 border-green-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    pending_verification: 'bg-blue-100 text-blue-700 border-blue-300',
  };
  const labels = {
    paid: '✅ Paid',
    pending: '⏳ Pending',
    pending_verification: '🔍 Under Review',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
      {labels[status] || status}
    </span>
  );
};

const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

// RESIDENT view
const ResidentBills = ({ userInfo }) => {
  const { success, error: errToast, warning } = useToast();
  const { confirm } = useConfirm();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [proofModal, setProofModal] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [txnId, setTxnId] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bill/user`, { withCredentials: true });
      if (res.data.success) setBills(res.data.bills || []);
    } catch {
      errToast('Unable to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  // Handle payment button click
  const handlePaymentClick = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = async () => {
    if (!selectedBill) return;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bill/demo-payment/${selectedBill._id}`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        success('Payment successful! Your bill has been paid.');
        fetchBills();
      } else {
        errToast(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      errToast(error.response?.data?.message || 'Unable to process payment');
    }
    
    setSelectedBill(null);
  };

  // Manual proof upload
  const handleUploadProof = async () => {
    if (!proofFile || !txnId.trim()) {
      warning('Please select a file and enter the transaction ID.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('paymentProof', proofFile);
      form.append('transactionId', txnId);
      form.append('paymentDate', new Date().toISOString());

      const res = await axios.post(`${API_BASE_URL}/bill/upload-proof/${proofModal._id}`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        success('Payment proof submitted successfully! Our team will verify it shortly.');
        setProofModal(null);
        setProofFile(null);
        setTxnId('');
        fetchBills();
      } else {
        errToast(res.data.message || 'Upload failed');
      }
    } catch {
      errToast('Error uploading proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">💳 Maintenance Bills</h2>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'green', emoji: '✅' },
          { label: 'Total Pending', value: `₹${totalPending.toLocaleString('en-IN')}`, color: 'yellow', emoji: '⏳' },
          { label: 'Total Bills', value: bills.length, color: 'purple', emoji: '📄' },
        ].map(({ label, value, color, emoji }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 border-${color}-500`}>
            <div className="text-3xl mb-2">{emoji}</div>
            <p className="text-gray-600 text-sm">{label}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Bills Found</h3>
          <p className="text-gray-600 mt-2">You don't have any pending bills at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-800">{bill.month}</h3>
                    <StatusBadge status={bill.status} />
                  </div>
                  <p className="text-gray-500 text-sm">Due: {fmt(bill.dueDate)}</p>
                  {bill.status === 'paid' && (
                    <p className="text-green-600 text-sm">
                      Paid on: {fmt(bill.paidDate || bill.updatedAt)}
                    </p>
                  )}
                  {bill.status === 'pending_verification' && (
                    <p className="text-blue-600 text-sm">Awaiting verification</p>
                  )}
                  {bill.rejectionReason && (
                    <p className="text-red-500 text-sm mt-1">Reason: {bill.rejectionReason}</p>
                  )}
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 items-end">
                  {bill.status === 'paid' && (
                    <div className="text-center">
                      <div className="text-4xl mb-1">✅</div>
                      <p className="text-green-600 font-semibold text-sm">Completed</p>
                    </div>
                  )}

                  {bill.status === 'pending' && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => handlePaymentClick(bill)}
                        disabled={processingId === bill._id}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg flex items-center gap-2"
                      >
                        <CreditCard size={18} /> Pay Now
                      </button>

                      <button
                        onClick={() => setProofModal(bill)}
                        className="px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-purple-400 transition flex items-center gap-2"
                      >
                        <Upload size={18} /> Upload Receipt
                      </button>
                    </div>
                  )}

                  {bill.status === 'pending_verification' && (
                    <button
                      onClick={() => setProofModal(bill)}
                      className="px-5 py-3 rounded-xl border-2 border-blue-300 text-blue-700 font-semibold hover:border-blue-500 transition flex items-center gap-2"
                    >
                      <Eye size={18} /> Update Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">Payment Information</h4>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>✓ Secure online payments processed instantly</li>
          <li>✓ Multiple payment methods accepted</li>
          <li>✓ Instant confirmation and receipt generation</li>
          <li>✓ 24/7 customer support for payment issues</li>
        </ul>
      </div>

      {/* Manual Proof Upload Modal */}
      {proofModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => { setProofModal(null); setProofFile(null); setTxnId(''); }}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Payment Receipt</h3>
            <p className="text-gray-600 mb-6">Bill: <strong>{proofModal.month}</strong> — ₹{proofModal.amount.toLocaleString('en-IN')}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Transaction ID *</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter transaction reference number"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Payment Receipt *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {proofFile && <p className="text-sm text-green-600 mt-1">✓ {proofFile.name} uploaded</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUploadProof}
                  disabled={uploading}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? 'Uploading...' : <><Upload size={18} /> Submit Receipt</>}
                </button>
                <button
                  onClick={() => { setProofModal(null); setProofFile(null); setTxnId(''); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <MockPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
          onSuccess={handlePaymentSuccess}
          amount={selectedBill.amount}
          billMonth={selectedBill.month}
        />
      )}
    </div>
  );
};

// ADMIN view
const AdminBills = () => {
  const { success, error: errToast, warning } = useToast();
  const { confirm } = useConfirm();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', amount: '', month: '', dueDate: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bill/all`, { withCredentials: true });
      if (res.data.success) setBills(res.data.bills || []);
    } catch { errToast('Failed to load bills'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/getuser`, { withCredentials: true });
      if (res.data.success) setUsers((res.data.data || []).filter(u => u.role !== 'admin'));
    } catch { console.error('Failed to load users'); }
  };

  useEffect(() => { fetchBills(); fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.userId || !form.amount || !form.month || !form.dueDate) {
      warning('Please fill all required fields.');
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/bill/create`, {
        ...form,
        amount: Number(form.amount)
      }, { withCredentials: true });
      
      if (res.data.success) {
        success('Bill created successfully!');
        setShowCreate(false);
        setForm({ userId: '', amount: '', month: '', dueDate: '', description: '' });
        fetchBills();
      } else { errToast(res.data.message || 'Failed to create bill'); }
    } catch { errToast('Error creating bill'); }
    finally { setCreating(false); }
  };

  const handleVerify = async (bill, approved) => {
    let rejectionReason = '';
    if (!approved) {
      rejectionReason = prompt('Enter rejection reason:') || 'Payment proof rejected';
    }
    const ok = await confirm(
      approved ? 'Mark this payment as verified and paid?' : `Reject with reason: "${rejectionReason}"?`,
      { title: approved ? 'Approve Payment' : 'Reject Payment', confirmText: approved ? 'Approve' : 'Reject', type: approved ? 'info' : 'danger' }
    );
    if (!ok) return;

    try {
      const res = await axios.put(`${API_BASE_URL}/bill/verify/${bill._id}`, {
        approved,
        rejectionReason
      }, { withCredentials: true });
      
      if (res.data.success) {
        success(approved ? 'Payment approved' : 'Payment rejected');
        fetchBills();
      } else { errToast(res.data.message); }
    } catch { errToast('Error updating payment'); }
  };

  const handleDelete = async (billId) => {
    const ok = await confirm('Delete this bill permanently?', { title: 'Delete Bill', confirmText: 'Delete', type: 'danger' });
    if (!ok) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/bill/delete/${billId}`, { withCredentials: true });
      if (res.data.success) { success('Bill deleted'); fetchBills(); }
      else errToast(res.data.message);
    } catch { errToast('Error deleting bill'); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );

  const filtered = filter === 'all' ? bills : bills.filter(b => b.status === filter);
  const totalCollected = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const totalPending   = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0);
  const awaitingVerify = bills.filter(b => b.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Bill Management</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
        >
          <Plus size={20} /> Create Bill
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, color: 'green' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, color: 'yellow' },
          { label: 'Awaiting Review', value: awaitingVerify, color: 'blue' },
          { label: 'Total Bills', value: bills.length, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-${color}-500`}>
            <p className="text-gray-500 text-sm font-semibold">{label}</p>
            <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'pending_verification', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${filter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            {f === 'all' ? 'All' : f === 'pending_verification' ? 'Under Review' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No bills found for this filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((bill) => (
            <div key={bill._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-800">{bill.month}</h3>
                    <StatusBadge status={bill.status} />
                  </div>
                  {bill.userId && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-2 flex gap-4 flex-wrap">
                      <span>👤 {bill.userId.username}</span>
                      <span>🏠 {bill.userId.flatno}</span>
                      <span>✉️ {bill.userId.email}</span>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm">Due: {fmt(bill.dueDate)}</p>
                  {bill.transactionId && <p className="text-gray-500 text-sm">Transaction ID: {bill.transactionId}</p>}
                  {bill.rejectionReason && <p className="text-red-500 text-sm">Rejected: {bill.rejectionReason}</p>}
                  <p className="text-2xl font-bold text-purple-600 mt-2">₹{bill.amount.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {bill.paymentProof && (
                    <a
                      href={`${API_BASE_URL}/uploads/payments/${bill.paymentProof}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <Eye size={14} /> View Receipt
                    </a>
                  )}

                  {bill.status === 'pending_verification' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(bill, true)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(bill, false)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(bill._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete bill"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Create New Bill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Resident *</label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select resident...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.username} — Flat {u.flatno}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Month *</label>
                  <input
                    type="text"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., January 2025"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Due Date *</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Monthly Maintenance Fee"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Bill'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Export
export default function Bills({ userRole, userInfo }) {
  if (userRole === 'admin') {
    return <AdminBills />;
  }
  return <ResidentBills userInfo={userInfo} />;
}