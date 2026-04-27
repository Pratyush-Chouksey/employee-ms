import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Thermometer, Umbrella, Palmtree } from 'lucide-react';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({ Sick: 0, Casual: 0, Annual: 0 });
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Apply form state with sensible defaults
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Fetch personal leave data
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves/my');
      setLeaves(data.leaves || []);
      setSummary(data.summary || { Sick: 0, Casual: 0, Annual: 0 });
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  // Submit new leave request
  const handleApply = async (e) => {
    e.preventDefault();

    // Validate date range before sending
    if (formData.endDate < formData.startDate) {
      return toast.error('End date cannot be before start date');
    }

    setSubmitting(true);
    try {
      await api.post('/leaves', {
        type: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      toast.success('Leave request submitted');
      setFormData({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
      setShowApplyModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  // Today's date string for min attribute on date inputs
  const todayStr = new Date().toISOString().split('T')[0];


  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Management</h1>
        <p className="text-gray-500 mb-6">Loading your leave data...</p>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with apply button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">View your leave balance and history</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance Cards — inline style with icon */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Thermometer size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sick Leave</p>
              <p className="text-2xl font-bold">
                {summary.Sick}<span className="text-sm font-normal text-gray-500 ml-1">taken</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Umbrella size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Casual Leave</p>
              <p className="text-2xl font-bold">
                {summary.Casual}<span className="text-sm font-normal text-gray-500 ml-1">taken</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Palmtree size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Annual Leave</p>
              <p className="text-2xl font-bold">
                {summary.Annual}<span className="text-sm font-normal text-gray-500 ml-1">taken</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No leave records found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase">
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                    {leave.reason}
                  </td>
                  {/* Status badge — uses shared StatusBadge component */}
                  <td className="px-6 py-4">
                    <StatusBadge status={leave.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Apply for Leave Modal */}
      {showApplyModal && (
        <Modal title="Apply for Leave" onClose={() => setShowApplyModal(false)}>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={todayStr}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || todayStr}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leave;
