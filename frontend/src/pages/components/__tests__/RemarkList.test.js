import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import RemarkList from '../RemarkList';
import { remarkService, teacherService, studentService, classService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  remarkService: {
    getAll: jest.fn(),
    getByStudent: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  teacherService: {
    getAll: jest.fn(),
  },
  studentService: {
    getAll: jest.fn(),
  },
  classService: {
    getAll: jest.fn(),
    getSubjects: jest.fn(),
  },
}));

describe('RemarkList', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.setItem('user', JSON.stringify({ id: 'teacher-1', userId: 'teacher-1' }));
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows edit and delete actions for remarks and deletes a remark', async () => {
    remarkService.getAll.mockResolvedValue({
      data: [
        {
          _id: 'remark-1',
          student: { firstName: 'John', lastName: 'Doe' },
          teacher: { firstName: 'Jane', lastName: 'Smith' },
          subject: { name: 'Math' },
          class: { grade: '1', section: 'A' },
          type: 'Positive',
          remark: 'Great work',
        },
      ],
    });
    teacherService.getAll.mockResolvedValue({ data: [] });
    studentService.getAll.mockResolvedValue({ data: [] });
    classService.getAll.mockResolvedValue({ data: [] });
    classService.getSubjects.mockResolvedValue({ data: [] });
    remarkService.delete.mockResolvedValue({ data: { message: 'Deleted' } });

    await act(async () => {
      root.render(<RemarkList teacherUserId="teacher-1" />);
    });

    const editButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent.includes('Edit'));
    const deleteButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent.includes('Delete'));

    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();

    await act(async () => {
      deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(remarkService.delete).toHaveBeenCalledWith('remark-1');
  });
});
