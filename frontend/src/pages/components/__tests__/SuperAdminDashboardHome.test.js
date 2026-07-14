import React from 'react';
import { render } from '@testing-library/react';
import SuperAdminDashboardHome from '../SuperAdminDashboardHome';

describe('SuperAdminDashboardHome', () => {
  it('renders without crashing', () => {
    try {
      render(<SuperAdminDashboardHome stats={{}} />);
    } catch (e) {
      console.error('RUNTIME_ERROR:', e);
      throw e;
    }
  });
});
