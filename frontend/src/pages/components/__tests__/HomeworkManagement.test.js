import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import HomeworkManagement from '../HomeworkManagement';
import { homeworkService, classService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  homeworkService: {
    getAll: jest.fn(),
    add: jest.fn(),
    review: jest.fn(),
  },
  classService: {
    getAll: jest.fn(),
    getSubjects: jest.fn(),
  },
}));

describe('HomeworkManagement', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.setItem('user', JSON.stringify({ id: 'teacher-1' }));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows only upcoming homework and hides completed or overdue assignments', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    homeworkService.getAll.mockResolvedValue({
      data: [
        {
          _id: 'completed-homework',
          title: 'Completed Task',
          description: 'Already done',
          assignedDate: yesterday.toISOString(),
          dueDate: today.toISOString(),
          class: { _id: 'class-1', grade: '1', section: 'A' },
          subject: { _id: 'subj-1', name: 'Math' },
          submissions: [{ status: 'Completed' }],
        },
        {
          _id: 'upcoming-homework',
          title: 'Tomorrow Task',
          description: 'Due tomorrow',
          assignedDate: today.toISOString(),
          dueDate: tomorrow.toISOString(),
          class: { _id: 'class-1', grade: '1', section: 'A' },
          subject: { _id: 'subj-1', name: 'Math' },
          submissions: [],
        },
      ],
    });

    classService.getAll.mockResolvedValue({ data: [{ _id: 'class-1', grade: '1', section: 'A' }] });
    classService.getSubjects.mockResolvedValue({ data: [{ _id: 'subj-1', name: 'Math' }] });

    await act(async () => {
      root.render(<HomeworkManagement />);
    });

    expect(container.textContent).toContain('Tomorrow Task');
    expect(container.textContent).not.toContain('Completed Task');
  });
});
