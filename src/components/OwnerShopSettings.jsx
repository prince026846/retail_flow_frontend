import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const OwnerShopSettings = () => {
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    business_name: 'My Shop',
    address: '',
    gst_number: '',
    terms_conditions: 'Thank you for your business!',
    greeting_message: 'Welcome!'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const getAuthToken = () => sessionStorage.getItem('retailflow_token');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/shop-settings/`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          business_name: data.business_name || 'My Shop',
          address: data.address || '',
          gst_number: data.gst_number || '',
          terms_conditions: data.terms_conditions || 'Thank you for your business!',
          greeting_message: data.greeting_message || 'Welcome!'
        });
      } else if (response.status === 404) {
        // No settings yet, use defaults
        setFormData({
          business_name: 'My Shop',
          address: '',
          gst_number: '',
          terms_conditions: 'Thank you for your business!',
          greeting_message: 'Welcome!'
        });
      } else {
        throw new Error('Failed to load settings');
      }
      setError(null);
    } catch (err) {
      setError('Failed to load shop settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required field
      if (!formData.business_name.trim()) {
        setError('Business name is required');
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_URL}/shop-settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save settings');
      }

      setSuccess('Shop settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save shop settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${colors.card} rounded-xl p-6`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.card} rounded-xl shadow-lg border ${colors.border} overflow-hidden max-w-2xl mx-auto`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4`}>
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">🏪</span>
          Shop Bill Settings
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Configure what appears on customer bills
        </p>
      </div>

      <div className="p-6">
        {/* Info Notice */}
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div>
              <h3 className={`font-semibold ${colors.text} mb-1`}>Bill Configuration</h3>
              <p className={`text-sm ${colors.textSecondary}`}>
                These settings will appear on all PDF bills sent to customers via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Name */}
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-1`}>
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Your Shop Name"
              className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-1`}>
              Shop Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full shop address (appears on bills)"
              rows={3}
              className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
            />
          </div>

          {/* GST Number */}
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-1`}>
              GST Number (Optional)
            </label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              placeholder="GST/Tax registration number"
              className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-1`}>
              Terms & Conditions / Footer Message
            </label>
            <textarea
              name="terms_conditions"
              value={formData.terms_conditions}
              onChange={handleChange}
              placeholder="Appears at the bottom of every bill"
              rows={2}
              className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
            />
            <p className={`text-xs ${colors.textSecondary} mt-1`}>Shown at the bottom of every bill</p>
          </div>

          {/* Greeting Message */}
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-1`}>
              Greeting Message (Seasonal)
            </label>
            <input
              type="text"
              name="greeting_message"
              value={formData.greeting_message}
              onChange={handleChange}
              placeholder="e.g., Happy Diwali! or Summer Sale!"
              className={`w-full px-3 py-2 border ${colors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
            />
            <p className={`text-xs ${colors.textSecondary} mt-1`}>Optional seasonal greeting shown on bills</p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Bill Settings'
              )}
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${colors.border}`}>
          <h3 className={`font-semibold ${colors.text} mb-3`}>Bill Preview</h3>
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} p-4 rounded-lg border ${colors.border}`}>
            <h4 className="text-lg font-bold text-purple-600 text-center">{formData.business_name}</h4>
            {formData.greeting_message && (
              <p className={`text-sm text-center italic mt-1 ${colors.textSecondary}`}>{formData.greeting_message}</p>
            )}
            {formData.address && (
              <p className={`text-xs text-center mt-2 ${colors.textSecondary}`}>{formData.address}</p>
            )}
            {formData.gst_number && (
              <p className={`text-xs text-center mt-1 ${colors.textSecondary}`}>GST: {formData.gst_number}</p>
            )}
            <div className={`mt-3 pt-3 border-t ${colors.border}`}>
              <p className={`text-xs text-center italic ${colors.textSecondary}`}>{formData.terms_conditions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerShopSettings;
