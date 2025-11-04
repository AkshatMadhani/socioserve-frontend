import React, { useState } from 'react';
import { X, Mail, Lock, User, Home, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AuthUpdated = ({ isOpen, onClose, userType }) => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth(); 
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    flatno: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (authMode === 'login') {
        let loginEndpoint = '';
        let requestBody = {};

        if (userType === 'Secretary') {
          loginEndpoint = `${API_BASE_URL}/admin/login`;
          requestBody = {
            email: formData.email,
            password: formData.password
          };
        } else {
          loginEndpoint = `${API_BASE_URL}/auth/login`;
          requestBody = {
            email: formData.email,
            password: formData.password
          };
        }

        const response = await axios.post(loginEndpoint, requestBody, {
          withCredentials: true
        });

        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || 'Login failed');
        }

        if (userType === 'Secretary' && data.role !== 'admin') {
          throw new Error('Access denied. Only secretaries can login here.');
        }

        if (userType === 'Resident' && data.role === 'admin') {
          throw new Error('Access denied. Please use Secretary login portal.');
        }

        setSuccess(`✅ Login successful! Redirecting...`);
        
        await checkAuth();
        
        setTimeout(() => {
          if (userType === 'Resident') {
            navigate('/resident-dashboard');
          } else {
            navigate('/secretary-dashboard');
          }
          onClose();
        }, 1000);

      } else {
        if (!formData.username || !formData.email || !formData.password || !formData.flatno) {
          throw new Error('All fields are required');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          flatno: formData.flatno,
          role: 'resident'
        }, { withCredentials: true });

        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || 'Registration failed');
        }

        setSuccess('✅ Registration successful! Please login now.');
        setTimeout(() => {
          switchMode('login');
          resetForm();
        }, 2000);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', flatno: '' });
    setError('');
    setSuccess('');
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideIn" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${userType === 'Resident' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} p-8 text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="text-6xl mb-4">{userType === 'Resident' ? '👥' : '🛡️'}</div>
            <h2 className="text-3xl font-bold">{userType} Portal</h2>
            <p className="text-white text-opacity-90 mt-2">
              {userType === 'Resident' 
                ? 'Access your society dashboard' 
                : 'Administrative access only'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {userType === 'Resident' && (
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => switchMode('login')}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  authMode === 'login'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                } disabled:opacity-50`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('register')}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  authMode === 'register'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                } disabled:opacity-50`}
              >
                Register
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg animate-slideDown">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                ❌ {error}
              </div>
            )}

            {authMode === 'register' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <User size={18} />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Mail size={18} />
                {userType === 'Secretary' ? 'Admin Email' : 'Email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Home size={18} />
                  Flat Number
                </label>
                <input
                  type="text"
                  name="flatno"
                  value={formData.flatno}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 transition-all"
                  placeholder="e.g., A-101"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${userType === 'Resident' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  {authMode === 'login' ? '🔓 Login' : '📝 Register'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthUpdated;