import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import TeacherDashboardLayout from '../TeacherDashboardLayout';

jest.mock('../../components/dashboard/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('../../components/dashboard/TopBar', () => ({ userName, subject }) => <div>{userName} - {subject}</div>);
jest.mock('../../context/DashboardContext', () => ({
  DashboardProvider: ({ children }) => <div>{children}</div>,
}));

test('renders child page content inside the teacher dashboard layout', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <TeacherDashboardLayout user={{ firstName: 'Anjali', lastName: 'Sharma' }}>
          <div>Dashboard content</div>
        </TeacherDashboardLayout>
      </MemoryRouter>
    );
  });

  expect(container.textContent).toContain('Dashboard content');

  act(() => {
    root.unmount();
  });
  container.remove();
});
