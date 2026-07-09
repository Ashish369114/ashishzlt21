const http = require('http');

const postJson = (path, data, token) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        const parsed = raw ? raw.toString() : '';
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

(async () => {
  try {
    const loginResult = await postJson('/api/auth/login', {
      userId: 'superadmin@school.com',
      password: 'Admin@123',
    });
    console.log('LOGIN:', loginResult.statusCode, loginResult.body);
    const loginBody = JSON.parse(loginResult.body);
    const token = loginBody.token;
    if (!token) {
      throw new Error('No token returned');
    }
    const admissionResult = await postJson('/api/admissions', {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2010-01-01',
      gender: 'male',
      parentName: 'Parent',
      parentEmail: 'parent@example.com',
      parentPhone: '1234567890',
      school: '000000000000000000000000',
      appliedForClass: '000000000000000000000000',
    }, token);
    console.log('ADMISSION:', admissionResult.statusCode, admissionResult.body);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error);
  }
})();
