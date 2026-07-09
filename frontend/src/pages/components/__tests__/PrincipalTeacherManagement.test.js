import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import PrincipalTeacherManagement from '../PrincipalTeacherManagement';
import { teacherService, classService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  teacherService: {
    getAll: jest.fn(),
    add: jest.fn(),
  },
  classService: {
    getAll: jest.fn(),
    getSubjects: jest.fn(),
  },
  studentService: {
    getAll: jest.fn(),
  },
}));

describe('PrincipalTeacherManagement', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    teacherService.getAll.mockResolvedValue({ data: [] });
    teacherService.add.mockResolvedValue({});
    classService.getAll.mockResolvedValue({ data: [] });
    classService.getSubjects.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  it('shows the add teacher form when the add teacher action is clicked', async () => {
    await act(async () => {
      root.render(<PrincipalTeacherManagement />);
    });

    const addTeacherButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent.includes('Add Teacher')
    );

    expect(addTeacherButton).toBeTruthy();

    await act(async () => {
      addTeacherButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Add New Teacher');
  });
});
