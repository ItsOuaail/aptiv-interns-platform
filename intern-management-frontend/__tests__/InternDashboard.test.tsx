/**
 * __tests__/InternDashboard.test.tsx
 *
 * Replace your existing test file with this. It declares react-query mocks
 * BEFORE the jest.mock factory and only requires the page/component after
 * mocks are set up so the component sees the mocked modules.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// --- Prepare mock variables BEFORE calling jest.mock factories ---
let mockUseQuery = jest.fn(() => ({
  data: {
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123456789',
      university: 'Test University',
      department: 'IT',
      major: 'Computer Science',
      status: 'ACTIVE',
      supervisor: 'Jane Smith',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  },
  isLoading: false,
  isError: false,
  error: null
}));
let mockUseMutation = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
  error: null
}));
let mockUseQueryClient = jest.fn(() => ({
  invalidateQueries: jest.fn()
}));

// --- Mock modules (these calls are safe because the local mock variables exist) ---
jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
  useQueryClient: () => mockUseQueryClient()
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../src/hooks/useRequireAuth', () => ({
  useRequireAuth: jest.fn(() => ({ token: 'mock-token' })),
}));

jest.mock('../src/components/InternNavbar', () => {
  return function MockInternNavbar() {
    return <div>Mock Navbar</div>;
  };
});

jest.mock('../src/components/MessageFormIntern', () => {
  return function MockMessageFormIntern() {
    return <div>Mock Message Form</div>;
  };
});

jest.mock('../src/components/InternDocuments', () => {
  return function MockInternDocuments() {
    return <div>Mock Intern Documents</div>;
  };
});

// Mock internService (if component imports it)
jest.mock('../src/services/internService', () => ({
  getInternDetails: jest.fn(),
  getMessagesFromHR: jest.fn(),
  sendMessageToHR: jest.fn(),
}));

// Mock axios used for password-change calls (if used inside component)
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true, message: 'Password changed successfully' } })),
}));

// --- Now require the module under test after mocks are setup ---
const InternDashboard = require('../src/app/internSide/page').default;
const { useAuth } = require('../src/context/AuthContext');
const { useRequireAuth } = require('../src/hooks/useRequireAuth');

// Types for easier mocking references
const mockUseAuth = useAuth as jest.Mock;
const mockUseRequireAuth = useRequireAuth as jest.Mock;

describe('InternDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Ensure useRequireAuth returns the expected shape (object)
    mockUseRequireAuth.mockReturnValue({ token: 'mock-token' });

    // Default auth return (no forced password change)
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INTERN',
        active: true,
        shouldChangePassword: false
      },
      updateUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    });

    // restore react-query default data state
    mockUseQuery.mockReturnValue({
      data: {
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123456789',
          university: 'Test University',
          department: 'IT',
          major: 'Computer Science',
          status: 'ACTIVE',
          supervisor: 'Jane Smith',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      },
      isLoading: false,
      isError: false,
      error: null
    });
  });

  it('renders the dashboard when user does not need to change password', async () => {
    render(<InternDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Intern')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mock Navbar')).toBeInTheDocument();
    });
  });

  it('renders the password change modal when shouldChangePassword is true', async () => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INTERN',
        active: true,
        shouldChangePassword: true
      },
      updateUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<InternDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Change Your Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument();
    });
  });

  it('handles password change submission', async () => {
    const mockLogin = jest.fn();
    
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INTERN',
        active: true,
        shouldChangePassword: true
      },
      updateUser: jest.fn(),
      login: mockLogin,
      logout: jest.fn(),
    });

    render(<InternDashboard />);
    
    const currentPasswordInput = await screen.findByPlaceholderText('Current Password');
    const newPasswordInput = await screen.findByPlaceholderText('New Password');
    const confirmPasswordInput = await screen.findByPlaceholderText('Confirm New Password');
    const submitButton = await screen.findByText('Change Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Expect login called to refresh auth with updated user info
      expect(mockLogin).toHaveBeenCalled();
      // Optionally, be specific about the arguments structure:
      // expect(mockLogin).toHaveBeenCalledWith('mock-token', expect.objectContaining({ shouldChangePassword: false }));
    });
  });

  it('handles skipping password change', async () => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INTERN',
        active: true,
        shouldChangePassword: true
      },
      updateUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<InternDashboard />);
    
    const skipButton = await screen.findByText('Skip');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(screen.queryByText('Change Your Password')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while data is loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null
    });

    render(<InternDashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows error state when data loading fails', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Failed to load data' }
    });

    render(<InternDashboard />);
    
    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
  });

  it('renders navigation cards correctly', async () => {
    render(<InternDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Inbox')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });
  });
});