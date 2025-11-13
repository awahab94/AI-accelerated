import { Control, Controller, FieldErrors, FieldPath } from 'react-hook-form';
import { FormInput } from './FormInput';
import { KeyboardTypeOptions } from 'react-native';

interface FormField {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'password' | 'off';
  textContentType?:
    | 'emailAddress'
    | 'password'
    | 'givenName'
    | 'familyName'
    | 'telephoneNumber';
  isPassword?: boolean;
  hint?: string;
  placeholder?: string;
}

interface AuthFormProps<T extends Record<string, any>> {
  control: Control<T>;
  fields: FormField[];
  errors: FieldErrors<T>;
}

export const AuthForm = <T extends Record<string, any>>({
  control,
  fields,
  errors,
}: AuthFormProps<T>) => {
  return (
    <>
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name as FieldPath<T>}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              {...field}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={
                errors[field.name as keyof T]?.message as string | undefined
              }
            />
          )}
        />
      ))}
    </>
  );
};
