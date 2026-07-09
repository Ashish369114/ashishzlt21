const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      userId: 'superadmin@school.com',
      password: 'Admin@123',
    });

    const token = loginRes.data.token;
    console.log('Logged in with token:', token.slice(0, 20), '...');

    const admissionId = '6a4ddf5f657a2d57784dd233';
    const approveRes = await axios.post(
      `http://localhost:5000/api/admissions/${admissionId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Approve response status:', approveRes.status);
    console.log('Approve response body:', approveRes.data);
  } catch (err) {
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    console.error(err.message);
  }
})();
