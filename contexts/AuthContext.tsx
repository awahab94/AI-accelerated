import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  isBiometricsAvailable: boolean;
  failedAttempts: number;
  isLocked: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const STORAGE_KEYS = {
  USER: 'user_data',
  CREDENTIALS: 'user_credentials',
  SESSION_TOKEN: 'session_token',
  FAILED_ATTEMPTS: 'failed_attempts',
  LOCK_TIMESTAMP: 'lock_timestamp',
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkBiometricsAvailability();
    loadUser();
    checkLockStatus();
  }, []);

  const checkBiometricsAvailability = async () => {
    if (Platform.OS === 'web') {
      setIsBiometricsAvailable(false);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricsAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometrics:', error);
      setIsBiometricsAvailable(false);
    }
  };

  const checkLockStatus = async () => {
    try {
      const lockTimestamp = await SecureStore.getItemAsync(
        STORAGE_KEYS.LOCK_TIMESTAMP
      );
      const attempts = await SecureStore.getItemAsync(
        STORAGE_KEYS.FAILED_ATTEMPTS
      );

      if (lockTimestamp && attempts) {
        const lockTime = parseInt(lockTimestamp);
        const currentTime = Date.now();
        const attemptsCount = parseInt(attempts);

        if (attemptsCount >= MAX_FAILED_ATTEMPTS) {
          if (currentTime - lockTime < LOCK_DURATION) {
            setIsLocked(true);
            setFailedAttempts(attemptsCount);
          } else {
            // Lock expired, reset
            await SecureStore.deleteItemAsync(STORAGE_KEYS.FAILED_ATTEMPTS);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.LOCK_TIMESTAMP);
            setFailedAttempts(0);
            setIsLocked(false);
          }
        } else {
          setFailedAttempts(attemptsCount);
        }
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  const loadUser = async () => {
    try {
      setIsLoading(true);
      // Check if there's an active session
      const sessionToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.SESSION_TOKEN
      );
      if (sessionToken) {
        // Session exists, load user data
        const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Session exists but no user data - clear session
          await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_TOKEN);
          setIsAuthenticated(false);
        }
      } else {
        // No active session
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isLocked) {
      return false;
    }

    try {
      // Get stored credentials
      const storedCredentials = await SecureStore.getItemAsync(
        STORAGE_KEYS.CREDENTIALS
      );

      if (!storedCredentials) {
        await handleFailedAttempt();
        return false;
      }

      const credentials = JSON.parse(storedCredentials);

      if (credentials.email === email && credentials.password === password) {
        // Reset failed attempts on successful login
        await SecureStore.deleteItemAsync(STORAGE_KEYS.FAILED_ATTEMPTS);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.LOCK_TIMESTAMP);
        setFailedAttempts(0);
        setIsLocked(false);

        // Create session token
        const sessionToken = Date.now().toString();
        await SecureStore.setItemAsync(
          STORAGE_KEYS.SESSION_TOKEN,
          sessionToken
        );

        // Load user data
        const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          return true;
        } else {
          // Create minimal user if data doesn't exist
          const minimalUser: User = {
            id: Date.now().toString(),
            email: email,
            firstName: '',
            lastName: '',
            createdAt: new Date().toISOString(),
          };
          await SecureStore.setItemAsync(
            STORAGE_KEYS.USER,
            JSON.stringify(minimalUser)
          );
          setUser(minimalUser);
          setIsAuthenticated(true);
          return true;
        }
      } else {
        await handleFailedAttempt();
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      await handleFailedAttempt();
      return false;
    }
  };

  const handleFailedAttempt = async () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    await SecureStore.setItemAsync(
      STORAGE_KEYS.FAILED_ATTEMPTS,
      newAttempts.toString()
    );

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      setIsLocked(true);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.LOCK_TIMESTAMP,
        Date.now().toString()
      );
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
      };

      // Store user data
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER,
        JSON.stringify(newUser)
      );

      // Store credentials securely
      const credentials = {
        email: userData.email,
        password: userData.password,
      };
      await SecureStore.setItemAsync(
        STORAGE_KEYS.CREDENTIALS,
        JSON.stringify(credentials)
      );

      // Create session token
      const sessionToken = Date.now().toString();
      await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_TOKEN, sessionToken);

      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Only delete session token on logout - keep user data and credentials
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_TOKEN);
      // Clear failed attempts and lock status
      await SecureStore.deleteItemAsync(STORAGE_KEYS.FAILED_ATTEMPTS);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.LOCK_TIMESTAMP);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !isBiometricsAvailable || isLocked) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password instead',
      });

      if (result.success) {
        // Reset failed attempts on successful biometric auth
        await SecureStore.deleteItemAsync(STORAGE_KEYS.FAILED_ATTEMPTS);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.LOCK_TIMESTAMP);
        setFailedAttempts(0);
        setIsLocked(false);

        // Create session token
        const sessionToken = Date.now().toString();
        await SecureStore.setItemAsync(
          STORAGE_KEYS.SESSION_TOKEN,
          sessionToken
        );

        // Load user data
        const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        authenticateWithBiometrics,
        isBiometricsAvailable,
        failedAttempts,
        isLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
