import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Settings,
  Moon,
  Sun,
  Shield,
} from 'lucide-react-native';

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout, isBiometricsAvailable } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/signIn');
        },
      },
    ]);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  };

  if (!user) {
    return null;
  }

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
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarText: {
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
      color: 'white',
    },
    userName: {
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    userEmail: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    memberSince: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoIcon: {
      marginRight: theme.spacing.md,
      width: 24,
    },
    infoLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    infoValue: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.success + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.sm,
    },
    securityText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.success,
      marginLeft: theme.spacing.xs,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: theme.colors.error,
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary + '10', theme.colors.background]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(user.firstName, user.lastName)}
                </Text>
              </View>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.memberSince}>
                Member since {formatDate(user.createdAt)}
              </Text>
              {isBiometricsAvailable && (
                <View style={styles.securityBadge}>
                  <Shield size={16} color={theme.colors.success} />
                  <Text style={styles.securityText}>
                    Biometric Security Enabled
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <User size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.infoValue}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>
                    {user.firstName} {user.lastName}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Mail size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.infoValue}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
              {user.phone && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Phone size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.infoValue}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
              )}
              {user.dateOfBirth && (
                <View
                  style={[styles.infoRow, !user.phone && styles.infoRowLast]}
                >
                  <View style={styles.infoIcon}>
                    <Calendar size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.infoValue}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>{user.dateOfBirth}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={toggleTheme}
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${
                  isDark ? 'light' : 'dark'
                } mode`}
              >
                <View style={styles.settingLeft}>
                  {isDark ? (
                    <Sun size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Moon size={20} color={theme.colors.textSecondary} />
                  )}
                  <Text style={styles.settingText}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="danger"
              style={styles.logoutButton}
              accessibilityLabel="Sign out of your account"
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
