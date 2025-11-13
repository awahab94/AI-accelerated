import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { theme } = useTheme();

  const getButtonStyles = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
      },
      danger: {
        backgroundColor: theme.colors.error,
      },
    };

    const disabledStyle = {
      backgroundColor: theme.colors.border,
      opacity: 0.6,
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      (disabled || loading) && disabledStyle,
      style,
    ];
  };

  const getTextStyles = () => {
    const baseFontSize = {
      small: theme.fontSize.sm,
      medium: theme.fontSize.md,
      large: theme.fontSize.lg,
    };

    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: theme.colors.primary },
      danger: { color: '#FFFFFF' },
    };

    return [
      {
        fontSize: baseFontSize[size],
        fontWeight: '600' as const,
        textAlign: 'center' as const,
      },
      variantTextStyles[variant],
      (disabled || loading) && { color: theme.colors.textSecondary },
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
          style={{ marginRight: theme.spacing.sm }}
        />
      )}
      <Text style={getTextStyles()}>{title}</Text>
    </TouchableOpacity>
  );
}