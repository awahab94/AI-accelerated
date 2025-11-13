import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock LocalAuthentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should register a new user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const userData = {
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    await act(async () => {
      const success = await result.current.register(userData);
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  it('should login with correct credentials', async () => {
    // Setup stored credentials
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
      if (key === 'user_credentials') {
        return Promise.resolve(JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
        }));
      }
      if (key === 'user_data') {
        return Promise.resolve(JSON.stringify({
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date().toISOString(),
        }));
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.login('test@example.com', 'Password123');
      expect(success).toBe(true);
    });
  });

  it('should fail login with incorrect credentials', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
      if (key === 'user_credentials') {
        return Promise.resolve(JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
        }));
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.login('test@example.com', 'WrongPassword');
      expect(success).toBe(false);
    });

    expect(result.current.failedAttempts).toBe(1);
  });

  it('should lock account after max failed attempts', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) => {
      if (key === 'user_credentials') {
        return Promise.resolve(JSON.stringify({
          email: 'test@example.com',
          password: 'Password123',
        }));
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.login('test@example.com', 'WrongPassword');
      });
    }

    expect(result.current.isLocked).toBe(true);
    expect(result.current.failedAttempts).toBe(5);
  });

  it('should logout user', async () => {
    // First register a user
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_data');
  });
});