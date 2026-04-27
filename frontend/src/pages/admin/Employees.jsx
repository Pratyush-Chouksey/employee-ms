// ──────────────────────────────────────────────────
// admin/Employees.jsx — Employee management page
// ──────────────────────────────────────────────────
// Features:
//   - Card grid of all employees
//   - Search with 300ms debounce
//   - Department filter dropdown
//   - Add employee modal
//   - Delete employee with confirmation
//
// The search uses a debounce pattern: we wait 300ms
// after the user stops typing before firing the API
// call. This prevents hammering the server on every
// keystroke.
// ──────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2 } from 'lucide-react';

const Employees = () => {
  // ── State ─────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Add Employee Form State ───────────────────
  // Separate from the filter state for clarity.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    department: '',
    salary: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch Employees ───────────────────────────
  // This function is called on mount, after search
  // debounce, after department change, and after
  // add/delete operations.
  const fetchEmployees = async (searchQuery = search, dept = department) => {
    try {
      setLoading(true);
      // Build query params — the backend accepts
      // ?search=...&department=... for filtering.
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (dept) params.department = dept;

      const { data } = await api.get('/employees', { params });

      setEmployees(data.employees || []);

      // Extract unique department names for the filter
      // dropdown. We do this from the FULL list (first load)
      // and from filtered results on subsequent calls.
      // On first load, this populates the dropdown.
      if (!dept && !searchQuery) {
        const uniqueDepts = [
          ...new Set((data.employees || []).map((e) => e.department)),
        ];
        setDepartments(uniqueDepts);
      }
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // ── Debounced Search ──────────────────────────
  // When `search` changes, we set a 300ms timer.
  // If `search` changes again before 300ms, the
  // old timer is cleared (cleanup function) and a
  // new one starts. This is the "debounce" pattern.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(search, department);
    }, 300);

    // Cleanup: cancel the pending timer if search
    // changes before it fires.
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department]);

  // ── Add Employee ──────────────────────────────
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build the payload. Convert salary to a Number
      // because the input returns a string.
      const payload = {
        ...formData,
        salary: Number(formData.salary),
      };

      await api.post('/employees', payload);
      toast.success('Employee added successfully');

      // Reset form, close modal, refresh the list.
      setFormData({
        name: '',
        email: '',
        password: '',
        position: '',
        department: '',
        salary: '',
        phone: '',
      });
      setShowAddModal(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Employee ───────────────────────────
  const handleDelete = async (id) => {
    // Native browser confirm dialog — simple and effective.
    // Returns true if user clicks OK, false on Cancel.
    if (!window.confirm('Deactivate this employee?')) return;

    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deactivated successfully');
      // Refresh the list to remove the deleted card.
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  // ── Form Input Handler ────────────────────────
  // Reusable handler for all modal form inputs.
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {/* ── Page Header ──────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500">Manage your team members</p>
        </div>
        {/* Add button — opens the modal */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* ── Filters Row ──────────────────────────── */}
      <div className="flex gap-4 mb-6">
        {/* Search input with icon overlay */}
        <div className="relative flex-1">
          {/* Search icon positioned inside the input.
              pointer-events-none makes it non-interactive
              so clicks pass through to the input. */}
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            // pl-10 makes room for the search icon.
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Department filter dropdown */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-700 min-w-[180px]"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* ── Employee Grid ────────────────────────── */}
      {loading ? (
        // Skeleton loading state — 3 pulsing cards
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        // Empty state
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No employees found</p>
          <p className="text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        // Employee cards grid — 3 columns
        <div className="grid grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="bg-white border border-gray-200 rounded-xl p-6 relative group"
            >
              {/* Department badge — top left corner */}
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase mb-4">
                {emp.department}
              </span>

              {/* Avatar circle with initials */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-400 text-xl font-bold">
                  {getInitials(emp.name)}
                </div>
              </div>

              {/* Employee info — centered */}
              <h3 className="text-center font-semibold text-gray-900">
                {emp.name}
              </h3>
              <p className="text-center text-gray-400 text-sm mt-1">
                {emp.position}
              </p>

              {/* Delete button — appears on hover via
                  group-hover. Positioned top-right. */}
              <button
                onClick={() => handleDelete(emp._id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Employee Modal ───────────────────── */}
      {showAddModal && (
        <Modal
          title="Add New Employee"
          onClose={() => setShowAddModal(false)}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAddEmployee} className="space-y-4">
            {/* Row 1: Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Row 2: Password (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Leave blank for default"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Row 3: Position + Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Row 4: Salary + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary ($)
                </label>
                <input
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Employees;
