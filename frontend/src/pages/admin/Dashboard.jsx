// ──────────────────────────────────────────────────
// admin/Dashboard.jsx — Admin overview dashboard
// ──────────────────────────────────────────────────
// Shows 4 key metrics at a glance:
//   1. Total employees in the system
//   2. Number of unique departments
//   3. Today's attendance count
//   4. Pending leave requests
//
// All data is fetched in parallel on mount using
// Promise.all for maximum speed.
// ──────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';
import { Users, Building2, CalendarCheck, FileText } from 'lucide-react';

const Dashboard = () => {
  // ── State ─────────────────────────────────────
  // stats holds all 4 dashboard metrics.
  // loading controls whether we show skeleton cards.
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  // ── Data Fetching ─────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fire all 3 API calls simultaneously.
        // Promise.all waits for ALL of them to resolve
        // before we proceed. This is faster than doing
        // them sequentially (3 round trips → 1 round trip).
        const [empRes, leaveRes, attendRes] = await Promise.all([
          api.get('/employees'),
          api.get('/leaves?status=Pending'),
          api.get('/attendance'),
        ]);

        // Extract employee data for department calculation.
        const employees = empRes.data.employees || [];

        // Count unique departments by putting all
        // department strings into a Set (which deduplicates),
        // then measuring the Set's size.
        const uniqueDepts = [...new Set(employees.map((e) => e.department))];

        // Filter attendance records to only include today's.
        // We compare the date string prefix (YYYY-MM-DD)
        // against today's date to avoid timezone issues.
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = (attendRes.data.records || []).filter((r) =>
          r.date?.startsWith(today)
        );

        setStats({
          totalEmployees: empRes.data.count || 0,
          departments: uniqueDepts.length,
          todayAttendance: todayRecords.length,
          pendingLeaves: leaveRes.data.count || 0,
        });
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ── Skeleton Cards ────────────────────────────
  // Shown while data is loading. 4 gray pulsing
  // rectangles that match the StatCard dimensions.
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-6">Loading your overview...</p>
        <div className="grid grid-cols-4 gap-4">
          {/* Create 4 skeleton cards using Array.from */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
            >
              {/* Skeleton title bar */}
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              {/* Skeleton value bar */}
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Welcome back, Admin — here&apos;s your overview
      </p>

      {/* Stat Cards Grid — 4 columns, equal spacing */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={CalendarCheck}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={FileText}
        />
      </div>
    </div>
  );
};

export default Dashboard;
