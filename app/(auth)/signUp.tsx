import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthForm } from '@/components/forms/AuthForm';
import { registerFormFields } from '@/utils/formFields';

const FORM_STORAGE_KEY = 'registrationFormData';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFormData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [watchedValues]);

  const loadFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach((key) => {
          setValue(key as keyof RegisterFormData, formData[key]);
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const saveFormData = async () => {
    try {
      const currentValues = getValues();
      const { password, ...dataToSave } = currentValues;
      await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const clearFormData = async () => {
    try {
      await AsyncStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const success = await registerUser(data);
      if (success) {
        await clearFormData();
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred during registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
      padding: theme.spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.fontSize.xxl + 4,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    linkText: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    footer: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    footerText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.colors.secondary + '10', theme.colors.background]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                Create Account
              </Text>
              <Text style={styles.subtitle}>
                Join us today and get started with your secure account
              </Text>
            </View>

            <AuthForm
              control={control}
              fields={registerFormFields}
              errors={errors}
            />
            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={{ marginTop: theme.spacing.lg }}
              accessibilityLabel="Create your account"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push('/(auth)/signIn')}
                  accessibilityRole="link"
                  accessibilityLabel="Go to login screen"
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
