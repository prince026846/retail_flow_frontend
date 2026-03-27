import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [aiInsightsFrequency, setAiInsightsFrequency] = useState('real-time');

  const users = [
    {
      id: 1,
      name: 'Adrian Miller',
      initials: 'AM',
      email: 'adrian@etherealretail.ai',
      role: 'Owner',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sarah Lo',
      initials: 'SL',
      email: 'sarah.lo@retail.ai',
      role: 'Employee',
      status: 'Active'
    }
  ];

  const [storeDetails, setStoreDetails] = useState({
    storeName: 'Ethereal Flagship',
    location: 'New York, NY',
    contactNumber: '+1 (555) 0123-4567',
    taxId: 'US-990211-X'
  });

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
          <div className="grid grid-cols-12 gap-4 mb-4 text-gray-400 text-sm font-medium">
            <div className="col-span-4">USER</div>
            <div className="col-span-2">ROLE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-4">ACTIONS</div>
          </div>

          {/* User Rows */}
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-700 last:border-0">
              {/* User Info */}
              <div className="col-span-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.initials}
                </div>
                <div>
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'Owner' 
                    ? 'bg-purple-900 text-purple-300' 
                    : 'bg-blue-900 text-blue-300'
                }`}>
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">{user.status}</span>
              </div>

              {/* Actions */}
              <div className="col-span-4 flex space-x-2">
                <button className="text-gray-400 hover:text-white transition-colors">
                  Edit
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Store Details Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">STORE DETAILS</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">STORE NAME</label>
              <input
                type="text"
                value={storeDetails.storeName}
                onChange={(e) => setStoreDetails({...storeDetails, storeName: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">LOCATION</label>
              <input
                type="text"
                value={storeDetails.location}
                onChange={(e) => setStoreDetails({...storeDetails, location: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">CONTACT NUMBER</label>
              <input
                type="text"
                value={storeDetails.contactNumber}
                onChange={(e) => setStoreDetails({...storeDetails, contactNumber: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">TAX ID</label>
              <input
                type="text"
                value={storeDetails.taxId}
                onChange={(e) => setStoreDetails({...storeDetails, taxId: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>

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
