// Test script to verify frontend-backend connection
// Run this in browser console when frontend is loaded

const testConnection = async () => {
  console.log('🧪 Testing Frontend-Backend Connection...');
  
  try {
    // Test basic API connectivity
    console.log('📡 Testing API base URL...');
    const response = await fetch('http://127.0.0.1:8001/docs');
    if (response.ok) {
      console.log('✅ Backend API is accessible');
    } else {
      console.log('❌ Backend API returned error:', response.status);
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    console.log('💡 Make sure backend is running on port 8001');
    return;
  }

  // Test authentication
  console.log('🔐 Testing authentication...');
  const token = sessionStorage.getItem('retailflow_token');
  if (!token) {
    console.log('⚠️ No authentication token found');
    console.log('💡 Please login first');
    return;
  }
  console.log('✅ Authentication token found');

  // Test supplier endpoint
  console.log('📦 Testing supplier endpoint...');
  try {
    const response = await fetch('http://127.0.0.1:8001/supplier/?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Supplier endpoint working:', data);
    } else {
      console.log('❌ Supplier endpoint error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.log('❌ Supplier endpoint failed:', error.message);
  }

  // Test low stock endpoint
  console.log('⚠️ Testing low stock endpoint...');
  try {
    const response = await fetch('http://127.0.0.1:8001/supplier/low-stock', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Low stock endpoint working:', data);
    } else {
      console.log('❌ Low stock endpoint error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.log('❌ Low stock endpoint failed:', error.message);
  }

  console.log('🏁 Connection test complete!');
};

// Export function to run in console
window.testConnection = testConnection;
console.log('💡 Run testConnection() in console to test backend connection');
