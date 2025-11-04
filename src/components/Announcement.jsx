import React, { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Calendar } from "lucide-react";
import axios from "axios";
import { useToast, useConfirm } from "../components/ToastNotification";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const Announcements = ({ userRole }) => {
  const { success, error, warning } = useToast();
  const { confirm } = useConfirm();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
  });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/announcement`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAnnouncements(response.data.data || []);
      }
    } catch (err) {
      error("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.description) {
      warning("Please fill all fields before creating ⚠️");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/announcement/new`,
        newAnnouncement,
        { withCredentials: true }
      );

      if (response.data.success) {
        success("Announcement created successfully 🎉");
        fetchAnnouncements();
        setNewAnnouncement({ title: "", description: "" });
        setShowAddModal(false);
      }
    } catch (err) {
      error(err.response?.data?.message || "Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this announcement?",
      {
        title: "Delete Confirmation",
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger",
      }
    );

    if (!isConfirmed) return;

    setDeleting(id);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/announcement/delete/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        success("Announcement deleted successfully 🗑️");
        fetchAnnouncements();
      }
    } catch (err) {
      error(err.response?.data?.message || "Failed to delete announcement");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📢 Announcements</h2>
          <p className="text-gray-600 mt-1">Stay updated with society news</p>
        </div>
        {userRole === "admin" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            <Plus size={20} />
            Create Announcement
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Bell size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Announcements Yet
          </h3>
          <p className="text-gray-600">
            {userRole === "admin"
              ? "Create your first announcement to keep residents informed."
              : "Check back later for updates from society management."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-l-4 border-purple-500"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
                      <Bell className="text-purple-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {announcement.description}
                      </p>
                    </div>
                  </div>

                  {userRole === "admin" && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      disabled={deleting === announcement._id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete announcement"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(announcement.createdAt || announcement.date)}
                </div>
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
              <div className="bg-purple-100 p-3 rounded-full">
                <Bell className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Create New Announcement
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Society Meeting on Sunday"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={newAnnouncement.description}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                  placeholder="Enter announcement details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAnnouncement}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
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

export default Announcements;