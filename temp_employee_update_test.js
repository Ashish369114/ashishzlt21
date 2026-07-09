const http = require('http');

const request = (options, data) => {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    if (body) {
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

(async () => {
  try {
    const login = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST' }, { userId: 'superadmin@school.com', password: 'Admin@123' });
    const loginBody = JSON.parse(login.body);
    const token = loginBody.token;
    console.log('token', token.slice(0, 20));
    const employees = await request({ hostname: 'localhost', port: 5000, path: '/api/employees', method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    console.log('employees status', employees.status);
    const parsed = JSON.parse(employees.body);
    const first = parsed[0];
    if (!first) {
      console.log('no employees');
      return;
    }
    console.log('updating employee', first._id);
    const data = {
      firstName: first.firstName + 'X',
      lastName: first.lastName,
      school: first.school?._id || first.school,
      employeeType: first.employeeType,
      designation: first.designation,
      dateOfJoining: first.dateOfJoining,
      salary: first.salary || { baseSalary: 0, allowances: {}, deductions: {} }
    };
    const update = await request({ hostname: 'localhost', port: 5000, path: `/api/employees/${first._id}`, method: 'PUT', headers: { Authorization: `Bearer ${token}` } }, data);
    console.log('update status', update.status);
    console.log('update body', update.body);
  } catch (err) {
    console.error(err);
  }
})();
