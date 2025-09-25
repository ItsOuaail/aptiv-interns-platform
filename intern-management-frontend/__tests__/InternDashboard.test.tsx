import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InternDashboard from '../app/internSide/page'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // Adjust path
import { useRequireAuth } from '../hooks/useRequireAuth'; // Adjust path

// Mock dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(() => ({ token: 'mock-token' })),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: { data: {} }, isLoading: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn() })),
  useQueryClient: jest.fn(),
}));

describe('InternDashboard', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token',
      user: { shouldChangePassword: true }, // Test with pop-up shown
      login: jest.fn(),
    });
  });

  it('renders the password change modal when shouldChangePassword is true', async () => {
    render(<InternDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Change Your Password')).toBeInTheDocument();
    });
  });

  it('handles password change submission', async () => {
    render(<InternDashboard />);
    const currentPasswordInput = screen.getByPlaceholderText('Current Password');
    const newPasswordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');
    const submitButton = screen.getByText('Change Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument(); // Adjust based on your success message
    });
  });
});