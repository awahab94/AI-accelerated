import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, X } from 'lucide-react-native';

interface PickerOption {
  value: string;
  label: string;
}

interface FormPickerProps {
  label: string;
  value?: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function FormPicker({
  label,
  value,
  options,
  onSelect,
  error,
  placeholder = 'Select an option',
  required,
}: FormPickerProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);

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
    picker: {
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerText: {
      fontSize: theme.fontSize.md,
      color: selectedOption ? theme.colors.text : theme.colors.textSecondary,
      flex: 1,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      width: '90%',
      maxHeight: '70%',
      paddingVertical: theme.spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    optionItem: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    optionText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary + '20',
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    error: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  });

  const renderOption = ({ item }: { item: PickerOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === value && styles.selectedOption,
      ]}
      onPress={() => {
        onSelect(item.value);
        setIsVisible(false);
      }}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.value === value }}
    >
      <Text
        style={[
          styles.optionText,
          item.value === value && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label} accessibilityRole="text">
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setIsVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selectedOption?.label || placeholder}`}
        accessibilityHint="Tap to open picker"
      >
        <Text style={styles.pickerText}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}