import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { loginSchema, LoginFormData } from '@/utils/validation';
import { Fingerprint, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AuthForm } from '@/components/forms/AuthForm';
import { loginFormFields } from '@/utils/formFields';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, authenticateWithBiometrics, isBiometricsAvailable, isLocked } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('lastEmail');
      if (savedEmail) {
        setValue('email', savedEmail);
      }
    } catch (error) {
      console.error('Error loading saved email:', error);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      Alert.alert(
        'Account Locked',
        'Too many failed attempts. Please wait before trying again.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        await AsyncStorage.setItem('lastEmail', data.email);
      } else {
        setError('password', { message: 'Invalid credentials' });
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (isLocked) {
      Alert.alert(
        'Account Locked',
        'Too many failed attempts. Please wait before trying again.'
      );
      return;
    }

    try {
      const storedCredentials = await SecureStore.getItemAsync(
        'user_credentials'
      );
      if (!storedCredentials) {
        Alert.alert(
          'Sign Up Required',
          'Please 1st signup then use the biometric'
        );
        return;
      }
    } catch (error) {
      console.error('Error checking credentials:', error);
      Alert.alert(
        'Sign Up Required',
        'Please 1st signup then use the biometric'
      );
      return;
    }

    const success = await authenticateWithBiometrics();
    if (!success) {
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication was not successful.'
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.fontSize.xxl + 8,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    biometricButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    biometricText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    lockMessage: {
      backgroundColor: theme.colors.error + '20',
      borderColor: theme.colors.error,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    lockText: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.error,
    },
    failedAttempts: {
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.warning,
      marginTop: theme.spacing.sm,
    },
    footer: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    footerText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    linkText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  if (isLocked) {
    return (
      <LinearGradient
        colors={[theme.colors.primary + '10', theme.colors.background]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.lockMessage}>
            <Lock size={24} color={theme.colors.error} />
            <Text style={styles.lockText}>
              Account temporarily locked due to too many failed login attempts.
              Please wait 5 minutes before trying again.
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.primary + '10', theme.colors.background]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                Welcome Back
              </Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue
              </Text>
            </View>

            <View style={styles.form}>
              {isBiometricsAvailable && (
                <>
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                    accessibilityRole="button"
                    accessibilityLabel="Login with biometric authentication"
                  >
                    <Fingerprint size={20} color={theme.colors.primary} />
                    <Text style={styles.biometricText}>
                      Use Biometric Authentication
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>
                </>
              )}

              <AuthForm
                control={control}
                fields={loginFormFields}
                errors={errors}
              />

              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={{ marginTop: theme.spacing.lg }}
                accessibilityLabel="Sign in to your account"
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push('/(auth)/signUp')}
                  accessibilityRole="link"
                  accessibilityLabel="Go to registration screen"
                >
                  Create Account
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
