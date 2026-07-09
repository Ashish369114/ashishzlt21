import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AccountantCollections from '../AccountantCollections';
import { feeService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  feeService: {
    getPending: jest.fn(),
    getAll: jest.fn(),
    pay: jest.fn(),
  },
}));

describe('AccountantCollections', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  it('shows paid and balance values for pending fees', async () => {
    feeService.getPending.mockResolvedValue({ data: [{ _id: 'fee-1', amount: 500, paidAmount: 200, dueDate: new Date().toISOString(), student: { firstName: 'John', lastName: 'Doe' } }] });
    feeService.getAll.mockResolvedValue({ data: [{ _id: 'fee-1', amount: 500, paidAmount: 200, isPaid: false, paymentDate: null, student: { firstName: 'John', lastName: 'Doe' } }] });

    await act(async () => {
      root.render(<AccountantCollections />);
    });

    expect(container.textContent).toContain('Balance');
    expect(container.textContent).toContain('₹300');
    expect(container.textContent).toContain('₹200');
  });
});
