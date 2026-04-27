import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, getMonthName } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const { data } = await api.get('/payslips/my');
        setPayslips(data.payslips || []);
      } catch {
        toast.error('Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payslips</h1>
        <p className="text-gray-500 mb-6">Loading your payslips...</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Payslips</h1>
      <p className="text-gray-500 mb-6">Your payslip history</p>

      {/* Payslips Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Basic Salary</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No payslips available yet
                </td>
              </tr>
            ) : (
              payslips.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Period: "January 2026" using getMonthName */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getMonthName(p.period?.month)} {p.period?.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(p.basicSalary || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(p.netSalary || 0)}
                  </td>
                  {/* Download button — styled placeholder */}
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
    </div>
  );
};

export default Payslips;
