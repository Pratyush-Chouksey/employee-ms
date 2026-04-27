import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Calendar, Clock, ArrowRightFromLine } from 'lucide-react';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState({
    stats: {},
    records: [],
  });
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);

  // Fetch attendance data and determine clock state
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/attendance/my');
      setAttendanceData({
        stats: data.stats || {},
        records: data.records || [],
      });

      // Determine if the user is currently clocked in:
      // Find today's record and check if checkOut is null
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = (data.records || []).find((r) =>
        r.date?.startsWith(today)
      );
      setClockedIn(!!todayRecord && !todayRecord.checkOut);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  // Handle clock in or clock out based on current state
  const handleClockAction = async () => {
    try {
      if (clockedIn) {
        await api.put('/attendance/clockout');
        toast.success('Clocked out successfully!');
      } else {
        await api.post('/attendance/clockin');
        toast.success('Clocked in successfully!');
      }
      // Refetch to update stats, records, and clock state
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const { stats, records } = attendanceData;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance</h1>
        <p className="text-gray-500 mb-6">Loading your attendance...</p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance</h1>
      <p className="text-gray-500 mb-6">Track your work hours</p>

      {/* Stat Cards — inline style with icon in a gray square */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Days Present */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Days Present</p>
              <p className="text-2xl font-bold">{stats.totalPresent || 0}</p>
            </div>
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-2xl font-bold">{stats.lateArrivals || 0}</p>
            </div>
          </div>
        </div>

        {/* Average Work Hours */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Work Hrs</p>
              <p className="text-2xl font-bold">
                {stats.avgWorkHours || 0}<span className="text-sm font-normal text-gray-500 ml-1">Hrs</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Check In</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Working Hours</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Day Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(record.checkIn)}
                  </td>
                  {/* Shows "—" via formatTime if checkOut is null */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(record.checkOut)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.workingHours || 0}h
                  </td>
                  {/* Day type badge */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase">
                      {record.dayType || 'Regular'}
                    </span>
                  </td>
                  {/* Status — always "Present" for existing records */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase">
                      Present
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Clock In/Out Button — fixed to bottom-right */}
      <button
        onClick={handleClockAction}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-4 hover:bg-indigo-700 transition-colors cursor-pointer z-30"
      >
        <ArrowRightFromLine size={24} />
        <div className="text-left">
          <p className="text-sm font-semibold">
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </p>
          <p className="text-xs text-indigo-200">
            {clockedIn ? 'end your work day' : 'start your work day'}
          </p>
        </div>
      </button>
    </div>
  );
};

export default Attendance;
