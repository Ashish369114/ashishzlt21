import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AccountantPendingFees from '../AccountantPendingFees';
import { feeService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  feeService: {
    getPending: jest.fn(),
    pay: jest.fn(),
  },
}));

describe('AccountantPendingFees', () => {
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
    feeService.getPending.mockResolvedValue({ data: [{ _id: 'fee-1', amount: 500, paidAmount: 200, dueDate: new Date().toISOString(), student: { firstName: 'John', lastName: 'Doe' }, remarks: 'Test' }] });

    await act(async () => {
      root.render(<AccountantPendingFees />);
    });

    expect(container.textContent).toContain('Balance');
    expect(container.textContent).toContain('₹300');
    expect(container.textContent).toContain('₹200');
  });
});
