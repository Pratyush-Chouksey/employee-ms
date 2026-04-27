import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import { formatCurrency, getMonthName } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Download } from 'lucide-react';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate form state — defaulting year to current year
  const [formData, setFormData] = useState({
    employee: '',
    month: '',
    year: new Date().getFullYear(),
    allowances: '',
    deductions: '',
  });

  // Fetch payslips and employees in parallel on mount
  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, empRes] = await Promise.all([
        api.get('/payslips'),
        api.get('/employees'),
      ]);
      setPayslips(payRes.data.payslips || []);
      setEmployees(empRes.data.employees || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Generate a new payslip
  const handleGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convert all numeric fields from strings to Numbers.
      // Backend expects `employeeId` (not `employee`).
      await api.post('/payslips', {
        employeeId: formData.employee,
        month: Number(formData.month),
        year: Number(formData.year),
        allowances: Number(formData.allowances || 0),
        deductions: Number(formData.deductions || 0),
      });
      toast.success('Payslip generated successfully');
      setFormData({ employee: '', month: '', year: new Date().getFullYear(), allowances: '', deductions: '' });
      setShowGenerateModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payslips</h1>
        <p className="text-gray-500 mb-6">Loading payslips...</p>
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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-500">Generate and manage payslips</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Generate Payslip
        </button>
      </div>

      {/* Payslips Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Basic Salary</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No payslips found</td>
              </tr>
            ) : (
              payslips.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {p.employee?.name || 'Unknown'}
                  </td>
                  {/* Period: "January 2026" format using getMonthName */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getMonthName(p.period?.month)} {p.period?.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(p.basicSalary || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(p.netSalary || 0)}
                  </td>
                  {/* Download button — styled only, no PDF yet */}
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer">
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Payslip Modal */}
      {showGenerateModal && (
        <Modal title="Generate Payslip" onClose={() => setShowGenerateModal(false)} maxWidth="max-w-md">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Employee dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select name="employee" value={formData.employee} onChange={handleFormChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} — {formatCurrency(emp.salary)}
                  </option>
                ))}
              </select>
            </div>
            {/* Month + Year row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select name="month" value={formData.month} onChange={handleFormChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="">Select month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input name="year" type="number" value={formData.year} onChange={handleFormChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
            </div>
            {/* Allowances + Deductions row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                <input name="allowances" type="number" min="0" value={formData.allowances} onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                <input name="deductions" type="number" min="0" value={formData.deductions} onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {submitting ? 'Generating...' : 'Generate Payslip'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Payslips;
