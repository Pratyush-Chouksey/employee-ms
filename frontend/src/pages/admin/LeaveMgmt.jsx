import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

const LeaveMgmt = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all leave requests from the backend
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves');
      setLeaves(data.leaves || []);
    } catch {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  // Approve or reject a pending leave request
  const handleReview = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/review`, { status });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave');
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Management</h1>
        <p className="text-gray-500 mb-6">Loading leave requests...</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Management</h1>
      <p className="text-gray-500 mb-6">Review and manage leave requests</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leave requests found</td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Employee name — populated via Mongoose */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {leave.employee?.name || 'Unknown'}
                  </td>
                  {/* Leave type pill badge */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase">
                      {leave.type}
                    </span>
                  </td>
                  {/* Date range with em dash separator */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </td>
                  {/* Reason — truncated to prevent overflow */}
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                    {leave.reason}
                  </td>
                  {/* Status badge with color coding */}
                  <td className="px-6 py-4"><StatusBadge status={leave.status} /></td>
                  {/* Actions — only for pending leaves */}
                  <td className="px-6 py-4">
                    {leave.status === 'Pending' ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleReview(leave._id, 'Approved')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors cursor-pointer" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleReview(leave._id, 'Rejected')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Reject">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveMgmt;
