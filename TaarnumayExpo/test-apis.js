const axios = require('axios');

const BASE_URL = 'http://10.254.6.154:8000/api';

async function testAPIs() {
  console.log('Testing APIs...');
  try {
    // 1. Public Events
    console.log('GET /events/');
    let res = await axios.get(`${BASE_URL}/events/`);
    console.log(' - Status:', res.status, 'Data:', res.data?.data?.length, 'events');

    // 2. Auth Login (test fake to see if endpoint exists)
    console.log('POST /auth/login/');
    try {
      await axios.post(`${BASE_URL}/auth/login/`, { username: 'bad', password: 'bad' });
    } catch (e) {
      console.log(' - Status:', e.response?.status);
    }

    // 3. Contact messages endpoint
    console.log('GET /admin/contact/');
    try {
      await axios.get(`${BASE_URL}/admin/contact/`);
    } catch (e) {
      console.log(' - Status:', e.response?.status); // Expect 401 Unauthorized
    }

    // 4. Analytics endpoints
    console.log('GET /admin/analytics/overview/');
    try {
      await axios.get(`${BASE_URL}/admin/analytics/overview/`);
    } catch (e) {
      console.log(' - Status:', e.response?.status); // Expect 401
    }

    console.log('Done testing routing!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAPIs();
