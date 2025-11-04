import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, AlertCircle, Clock, Users, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast, useConfirm } from './ToastNotification';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const Polls = ({ userRole, userId }) => {
  const { success, error: errorToast, warning } = useToast();
  const { confirm } = useConfirm();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    options: ['', ''],
    expiryDate: '',
    allowMultiple: false
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/poll`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      errorToast('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || !newPoll.expiryDate) {
      warning('Please fill question and expiry date');
      return;
    }

    const validOptions = newPoll.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      warning('Please add at least 2 options');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/poll/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: newPoll.question,
          description: newPoll.description,
          options: validOptions,
          expiryDate: newPoll.expiryDate,
          allowMultiple: newPoll.allowMultiple
        })
      });

      const data = await response.json();
      if (data.success) {
        success('Poll created successfully! 🎉');
        setShowCreateModal(false);
        setNewPoll({ question: '', description: '', options: ['', ''], expiryDate: '', allowMultiple: false });
        fetchPolls();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      errorToast(err.message || 'Failed to create poll');
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    const poll = polls.find(p => p._id === pollId);
    
    if (poll.status !== 'active') {
      warning('This poll is closed');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/poll/vote/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ optionIndex, unvote: false })
      });

      const data = await response.json();
      if (data.success) {
        success('Vote recorded successfully! ✅');
        fetchPolls();
      } else {
        errorToast(data.message || 'Failed to record vote');
      }
    } catch (err) {
      errorToast(err.message || 'Failed to record vote');
    }
  };

  const handleUnvote = async (pollId, optionIndex) => {
    const poll = polls.find(p => p._id === pollId);
    
    if (poll.status !== 'active') {
      warning('This poll is closed');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/poll/vote/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ optionIndex, unvote: true })
      });

      const data = await response.json();
      if (data.success) {
        success('Vote removed successfully! 🗑️');
        fetchPolls();
      } else {
        errorToast(data.message || 'Failed to remove vote');
      }
    } catch (err) {
      errorToast(err.message || 'Failed to remove vote');
    }
  };

  const handleClosePoll = async (pollId) => {
    const isConfirmed = await confirm(
      'No more votes will be accepted after closing.',
      {
        title: 'Close this poll?',
        confirmText: 'Close Poll',
        cancelText: 'Cancel',
        type: 'warning'
      }
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/poll/close/${pollId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        success('Poll closed successfully! ✅');
        fetchPolls();
      }
    } catch (err) {
      errorToast('Failed to close poll');
    }
  };

  const handleDeletePoll = async (pollId) => {
    const isConfirmed = await confirm(
      'This action cannot be undone.',
      {
        title: 'Delete this poll permanently?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/poll/delete/${pollId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        success('Poll deleted successfully! 🗑️');
        fetchPolls();
      }
    } catch (err) {
      errorToast('Failed to delete poll');
    }
  };

  const addOption = () => {
    if (newPoll.options.length >= 6) {
      warning('Maximum 6 options allowed');
      return;
    }
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) {
      warning('Minimum 2 options required');
      return;
    }
    setNewPoll({ 
      ...newPoll, 
      options: newPoll.options.filter((_, i) => i !== index) 
    });
  };

  const getPercentage = (votes, total) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  const getDaysRemaining = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading polls...</p>
      </div>
    );
  }

  const activePolls = polls.filter(p => p.status === 'active');
  const closedPolls = polls.filter(p => p.status === 'closed');
  const totalVotesCast = polls.reduce((sum, p) => sum + getTotalVotes(p), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🗳️ Community Polls & Voting</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'admin' 
              ? 'Create polls and see results' 
              : 'Vote on important society decisions'}
          </p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            <Plus size={20} />
            Create Poll
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Active Polls</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{activePolls.length}</p>
            </div>
            <BarChart3 className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Votes Cast</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{totalVotesCast}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Polls</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{polls.length}</p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">🟢 Active Polls</h3>
          <div className="space-y-4">
            {activePolls.map((poll) => {
              const daysRemaining = getDaysRemaining(poll.expiryDate);
              const isExpiringSoon = daysRemaining <= 2 && daysRemaining > 0;
              const isExpired = daysRemaining < 0;
              const totalVotes = getTotalVotes(poll);

              return (
                <div key={poll._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{poll.question}</h4>
                      {poll.description && (
                        <p className="text-gray-600 mb-3">{poll.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {isExpired ? 'Expired' : isExpiringSoon ? `⚠️ ${daysRemaining} day(s) left` : `${daysRemaining} days left`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {totalVotes} votes cast
                        </span>
                        {poll.allowMultiple && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                            Multiple Choice
                          </span>
                        )}
                        {poll.userVoted && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle size={14} />
                            You voted
                          </span>
                        )}
                      </div>
                    </div>

                    {userRole === 'admin' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleClosePoll(poll._id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Close poll"
                        >
                          <AlertCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete poll"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const percentage = getPercentage(option.votes, totalVotes);
                      const hasVoted = option.voters && option.voters.some(voter => voter.toString() === userId);
                      const canVote = userRole !== 'admin';

                      return (
                        <div key={index}>
                          <button
                            onClick={() => {
                              if (userRole !== 'admin') {
                                if (hasVoted) {
                                  handleUnvote(poll._id, index);
                                } else {
                                  handleVote(poll._id, index);
                                }
                              }
                            }}
                            disabled={userRole === 'admin'}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                              hasVoted
                                ? 'border-green-500 bg-green-50 hover:border-red-400 hover:bg-red-50 cursor-pointer'
                                : canVote
                                ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                                : 'border-gray-200 cursor-not-allowed opacity-75'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-semibold ${hasVoted ? 'text-green-700' : 'text-gray-800'}`}>
                                {hasVoted && '✓ '}{option.text}
                              </span>
                              <span className="text-sm font-bold text-gray-700">
                                {option.votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  hasVoted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </button>
                          {hasVoted && userRole !== 'admin' && (
                            <p className="text-xs text-gray-500 mt-1 ml-1">Click again to remove your vote</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Closed Polls */}
      {closedPolls.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Closed Polls (Results)</h3>
          <div className="space-y-4">
            {closedPolls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              
              return (
                <div key={poll._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-400 opacity-90">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-800">{poll.question}</h4>
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Closed
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{totalVotes} total votes</span>
                        <span>Closed on {new Date(poll.expiryDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeletePoll(poll._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition ml-4"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const percentage = getPercentage(option.votes, totalVotes);
                      const maxVotes = Math.max(...poll.options.map(o => o.votes));
                      const isWinner = option.votes === maxVotes && option.votes > 0;

                      return (
                        <div key={index} className="relative">
                          <div className={`px-4 py-3 rounded-lg border-2 ${
                            isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-semibold ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                {isWinner && '🏆 '}{option.text}
                              </span>
                              <span className="text-sm font-bold text-gray-700">
                                {option.votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${isWinner ? 'bg-green-500' : 'bg-gray-400'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {polls.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Polls Yet</h3>
          <p className="text-gray-600">
            {userRole === 'admin' 
              ? 'Create your first poll to gather community opinions!' 
              : 'No active polls at the moment. Check back later!'}
          </p>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Create New Poll</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Poll Question *
                </label>
                <input
                  type="text"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Should we install solar panels?"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 h-24 resize-none"
                  placeholder="Add more context..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Poll Options * (Min: 2, Max: 6)
                </label>
                <div className="space-y-3">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updated = [...newPoll.options];
                          updated[index] = e.target.value;
                          setNewPoll({ ...newPoll, options: updated });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {newPoll.options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="mt-3 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Poll Expiry Date *
                </label>
                <input
                  type="date"
                  value={newPoll.expiryDate}
                  onChange={(e) => setNewPoll({ ...newPoll, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="allowMultiple"
                  checked={newPoll.allowMultiple}
                  onChange={(e) => setNewPoll({ ...newPoll, allowMultiple: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="allowMultiple" className="text-gray-700 font-semibold cursor-pointer">
                  Allow multiple selections
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePoll}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Poll
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
    </div>
  );
};

export default Polls;