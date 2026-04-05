import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import OwnerShopSettings from '../components/OwnerShopSettings';
import { getAllEmployees } from '../services/api';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [aiInsightsFrequency, setAiInsightsFrequency] = useState('real-time');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getAllEmployees();
        setUsers(data || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <DashboardLayout role="owner" pageTitle="Settings">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400 text-lg">Configure your AI retail ecosystem and team access.</p>
        </div>

        {/* User Roles Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">USER ROLES</h2>
              <p className="text-gray-400">Manage access for Owner and Employee roles.</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Add Member
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 mb-4 text-gray-400 text-sm font-medium border-b border-gray-700 pb-2">
            <div className="col-span-4">USER</div>
            <div className="col-span-2">ROLE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-4">ACTIONS</div>
          </div>

          {/* User Rows */}
          {loadingUsers ? (
            <div className="py-8 text-center text-gray-400">Loading team members...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-700 last:border-0">
                {/* User Info */}
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name || 'Unnamed User'}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'owner' 
                      ? 'bg-purple-900 text-purple-300' 
                      : 'bg-blue-900 text-blue-300'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${user.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-300">{user.is_active !== false ? 'Active' : 'Inactive'}</span>
                </div>

                {/* Actions */}
                <div className="col-span-4 flex space-x-2">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Edit
                  </button>
                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400">No team members found.</div>
          )}
        </div>

        {/* Store Details Section - Using OwnerShopSettings Component */}
        <OwnerShopSettings />

        {/* Preferences Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">PREFERENCES</h2>
          
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Email Notifications</div>
                <div className="text-gray-400 text-sm">Daily summary of store performance</div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Dark Mode</div>
                <div className="text-gray-400 text-sm">High-contrast midnight theme</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* AI Insights Frequency */}
            <div>
              <div className="text-white font-medium mb-3">AI INSIGHTS FREQUENCY</div>
              <div className="flex space-x-3">
                {['Real-time', 'Hourly', 'Daily'].map((frequency) => (
                  <button
                    key={frequency}
                    onClick={() => setAiInsightsFrequency(frequency.toLowerCase().replace('-', ''))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      aiInsightsFrequency === frequency.toLowerCase().replace('-', '')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {frequency}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI System Status */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-500 text-sm font-medium">AI POWERED SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
