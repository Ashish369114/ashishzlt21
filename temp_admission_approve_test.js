const http = require('http');

const request = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    const login = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { userId: 'superadmin@school.com', password: 'Admin@123' }
    );
    console.log('LOGIN', login.statusCode, login.body);
    const loginData = JSON.parse(login.body);
    const token = loginData.token;
    const admissionId = '6a4ddf5f657a2d57784dd233';
    const approve = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/admissions/${admissionId}/approve`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {}
    );
    console.log('APPROVE', approve.statusCode, approve.body);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
