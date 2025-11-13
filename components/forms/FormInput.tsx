import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  required?: boolean;
}

export const FormInput = forwardRef<TextInput, FormInputProps>(
  ({ label, error, hint, isPassword, required, style, ...props }, ref) => {
    const { theme } = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);

    const styles = StyleSheet.create({
      container: {
        marginBottom: theme.spacing.md,
      },
      label: {
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
      },
      required: {
        color: theme.colors.error,
      },
      inputContainer: {
        position: 'relative',
      },
      input: {
        borderWidth: 1,
        borderColor: error ? theme.colors.error : theme.colors.border,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical:
          Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        minHeight: 48,
      },
      inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
      },
      passwordToggle: {
        position: 'absolute',
        right: theme.spacing.md,
        top: '50%',
        transform: [{ translateY: -12 }],
      },
      error: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
      },
      hint: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
      },
    });

    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View style={styles.container}>
        <Text style={styles.label} accessibilityRole="text">
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              isPassword && { paddingRight: 50 },
              style,
            ]}
            secureTextEntry={isPassword && !showPassword}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            accessibilityLabel={label}
            accessibilityHint={hint || error}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
              accessibilityRole="button"
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.textSecondary} />
              ) : (
                <Eye size={20} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
        {hint && !error && (
          <Text style={styles.hint} accessibilityRole="text">
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';
