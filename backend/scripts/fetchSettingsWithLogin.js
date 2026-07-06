require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

(async () => {
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      userId: 'SUPERADMIN001',
      password: 'Admin@123',
    });
    const token = loginRes.data.token;
    console.log('Obtained token');

    const schoolId = process.argv[2] || '6a47c5517b5fca9af1b6e33a';
    const res = await axios.get(`${API_BASE}/settings/${schoolId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Settings response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
})();
