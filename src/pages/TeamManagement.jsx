import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';
import ModernModal from '../components/ModernModal';
import RealTimeNotification from '../components/RealTimeNotification';
import DashboardLayout from '../layouts/DashboardLayout';

const TeamManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      setNotification({ message: 'Failed to fetch employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      
      await createEmployee(employeeData);
      setNotification({ message: 'Employee added successfully', type: 'success' });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      fetchEmployees();
    } catch (error) {
      setNotification({ message: error.message || 'Failed to add employee', type: 'error' });
    }
  };

  const handleRemoveEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    
    try {
      await deleteEmployee(id);
      setNotification({ message: 'Employee removed successfully', type: 'success' });
      fetchEmployees();
    } catch (error) {
      setNotification({ message: error.message || 'Failed to remove employee', type: 'error' });
    }
  };

  return (
    <DashboardLayout>
      <RealTimeNotification message={notification.message} type={notification.type} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Team Management</h1>
            <p className="text-slate-400">Manage your store staff and roles</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            <span className="mr-2">➕</span> Add Employee
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-700/50 text-slate-300">
                <th className="p-4 font-semibold text-sm">Name</th>
                <th className="p-4 font-semibold text-sm">Role</th>
                <th className="p-4 font-semibold text-sm">Email</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-700 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                    <td className="p-4 text-right"><div className="h-8 bg-slate-700 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No employees found. Add your first team member!
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors text-slate-200 group">
                    <td className="p-4">
                      <div className="font-medium">{emp.name || emp.username}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20 uppercase font-semibold">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-sm">{emp.email}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRemoveEmployee(emp._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-40 group-hover:opacity-100 hover:scale-110"
                        title="Remove Employee"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ModernModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Employee"
        >
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Temporary Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20"
              >
                Add Employee
              </button>
            </div>
          </form>
        </ModernModal>
      </div>
    </DashboardLayout>
  );
};

export default TeamManagement;
