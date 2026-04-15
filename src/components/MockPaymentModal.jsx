import React, { useState } from 'react';
import { CreditCard, Lock, Calendar, User, Shield, X, CheckCircle, AlertCircle, Smartphone, Building, Wallet } from 'lucide-react';

const MockPaymentModal = ({ isOpen, onClose, onSuccess, amount, billMonth }) => {
  const [step, setStep] = useState('form');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    bankName: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.slice(0, 3);
    }
    
    setFormData({ ...formData, [name]: formattedValue });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      if (!formData.cardName) {
        setError('Please enter cardholder name');
        return;
      }
      if (formData.expiry.length < 5) {
        setError('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (formData.cvv.length < 3) {
        setError('Please enter valid CVV');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId || !formData.upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@bankname)');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bankName) {
        setError('Please select a bank');
        return;
      }
    }
    
    setStep('processing');
    setError('');
    
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setTimeout(() => {
          setStep('form');
          setFormData({ cardNumber: '', cardName: '', expiry: '', cvv: '', upiId: '', bankName: '' });
          setPaymentMethod('card');
        }, 500);
      }, 1500);
    }, 2000);
  };

  const getCardType = () => {
    const number = formData.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'RuPay';
    return 'Card';
  };
  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
          <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Do not close this window</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center animate-slideIn">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your payment of <strong>₹{amount.toLocaleString('en-IN')}</strong> for <strong>{billMonth}</strong> has been processed successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-2">
            <p className="text-sm text-gray-600 flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono text-xs">{transactionId}</span>
            </p>
            <p className="text-sm text-gray-600 flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold capitalize">
                {paymentMethod === 'card' ? `${getCardType()} Card` : paymentMethod === 'upi' ? 'UPI' : 'Net Banking'}
              </span>
            </p>
            <p className="text-sm text-gray-600 flex justify-between">
              <span>Date & Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={() => {}}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slideIn">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={24} />
              <span className="font-bold text-lg">Secure Payment</span>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition">
              <X size={20} />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Amount to Pay</p>
              <p className="text-3xl font-bold">₹{amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{billMonth}</p>
              <p className="text-sm opacity-75">Maintenance Bill</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setPaymentMethod('card'); setError(''); }}
            className={`flex-1 py-3 text-center font-semibold transition ${paymentMethod === 'card' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CreditCard size={16} className="inline mr-2" />
            Credit/Debit Card
          </button>
          <button
            onClick={() => { setPaymentMethod('upi'); setError(''); }}
            className={`flex-1 py-3 text-center font-semibold transition ${paymentMethod === 'upi' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Smartphone size={16} className="inline mr-2" />
            UPI
          </button>
          <button
            onClick={() => { setPaymentMethod('netbanking'); setError(''); }}
            className={`flex-1 py-3 text-center font-semibold transition ${paymentMethod === 'netbanking' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Building size={16} className="inline mr-2" />
            Net Banking
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-center gap-2 animate-shake">
              <AlertCircle size={18} className="text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-200">
              <p className="font-semibold mb-1">Test Payment Information:</p>
              <p>Card Number: <code className="bg-white px-1 rounded">4111 1111 1111 1111</code></p>
              <p>Expiry: <code className="bg-white px-1 rounded">12/30</code> | CVV: <code className="bg-white px-1 rounded">123</code></p>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-200">
              <p className="font-semibold mb-1">Test UPI ID:</p>
              <p><code className="bg-white px-1 rounded">test@okhdfcbank</code></p>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 border border-gray-200">
              <p className="font-semibold mb-1">Test Bank:</p>
              <p>Select any bank from the list</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <CreditCard size={16} />
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 16-digit card number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition font-mono"
                  maxLength="19"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <User size={16} />
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="Name on card"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="3-digit code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                    maxLength="3"
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'upi' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Smartphone size={16} />
                UPI ID
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="username@bankname"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Example: name@okhdfcbank, name@ybl, name@apl</p>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Building size={16} />
                Select Bank
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Select your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="yes">Yes Bank</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="cbi">Central Bank of India</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2">
            <Lock size={12} />
            <span>Secure SSL Encryption</span>
            <span>•</span>
            <Shield size={12} />
            <span>PCI Compliant</span>
            <span>•</span>
            <Wallet size={12} />
            <span>100% Secure</span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
            >
              Pay ₹{amount.toLocaleString('en-IN')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>American Express</span>
            <span>UPI</span>
            <span>Net Banking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;