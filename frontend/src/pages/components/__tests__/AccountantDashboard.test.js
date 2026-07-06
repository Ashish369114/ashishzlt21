import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AccountantDashboard from '../AccountantDashboard';

jest.mock('../../../services/api', () => ({
  studentService: { getAll: jest.fn(() => Promise.resolve({ data: [] })) },
  feeService: { getPending: jest.fn(() => Promise.resolve({ data: [] })), getAll: jest.fn(() => Promise.resolve({ data: [] })) },
  teacherService: { getAll: jest.fn(() => Promise.resolve({ data: [] })) },
  expenseService: { getAll: jest.fn(() => Promise.resolve({ data: [] })) },
}));

describe('AccountantDashboard', () => {
  it('renders accountant navigation and dashboard home', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container).render(
        <AccountantDashboard user={{ firstName: 'Test', lastName: 'User' }} onLogout={() => {}} />
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Accountant & Admin Dashboard');
    expect(container.textContent).toContain('Students');
    expect(container.textContent).toContain('Collections');
    expect(container.textContent).toContain('Fees');

    container.remove();
  });
});
