import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Calendar, FileText, DollarSign, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extract first name for the greeting
  const firstName = user?.name?.split(' ')[0];

  const [stats, setStats] = useState({
    daysPresent: 0,
    pendingLeaves: 0,
    latestPayslip: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fire all 3 requests simultaneously
        const [attendRes, leaveRes, payRes] = await Promise.all([
          api.get('/attendance/my'),
          api.get('/leaves/my'),
          api.get('/payslips/my'),
        ]);

        // Count pending leaves from the full leaves array
        const pendingCount = (leaveRes.data.leaves || []).filter(
          (l) => l.status === 'Pending'
        ).length;

        // Latest payslip is the first item (sorted by server)
        const latest = payRes.data.payslips?.[0] || null;

        setStats({
          daysPresent: attendRes.data.stats?.totalPresent || 0,
          pendingLeaves: pendingCount,
          latestPayslip: latest,
        });
      } catch {
        // Stats stay at defaults — non-critical failure
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Quick clock-in action from the dashboard
  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clockin');
      toast.success('Clocked in!');
      navigate('/employee/attendance');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome, {firstName}!
        </h1>
        <p className="text-gray-500 mb-6">Loading your dashboard...</p>
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
      {/* Page Header — personalized greeting */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome, {firstName}!
      </h1>
      {/* Show position and department from the
          populated employee object */}
      <p className="text-gray-500 mb-6">
        {user?.employee?.position} — {user?.employee?.department}
      </p>

      {/* 3 Stat Cards in a row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Days Present"
          value={stats.daysPresent}
          icon={Calendar}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={FileText}
        />
        <StatCard
          title="Latest Payslip"
          value={
            stats.latestPayslip
              ? formatCurrency(stats.latestPayslip.netSalary)
              : 'N/A'
          }
          icon={DollarSign}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-4">
        {/* Mark Attendance — primary action */}
        <button
          onClick={handleClockIn}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Mark Attendance
          <ArrowRight size={18} />
        </button>

        {/* Apply for Leave — secondary action */}
        <button
          onClick={() => navigate('/employee/leave')}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Apply for Leave
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
