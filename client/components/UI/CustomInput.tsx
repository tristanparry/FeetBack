import clsx from 'clsx';
import { TextInput, Platform } from 'react-native';
import { RefObject } from 'react';
import { useTheme } from '@/contexts/Theme';
import { jsColors } from '@/constants/themes';

type CustomInputProps = {
  ref?: RefObject<TextInput | null> | undefined;
  placeholder?: string;
  value?: string;
  onChangeText: React.ComponentProps<typeof TextInput>['onChangeText'];
  onSubmitEditing?: React.ComponentProps<typeof TextInput>['onSubmitEditing'];
  secure?: boolean;
  required?: boolean;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  autoCorrect?: boolean;
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
  returnKeyType?: React.ComponentProps<typeof TextInput>['returnKeyType'];
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  className?: string;
};
const CustomInput = ({
  ref = undefined,
  placeholder = '',
  value = '',
  onChangeText,
  onSubmitEditing,
  secure = false,
  required = false,
  autoCapitalize = undefined,
  autoCorrect = false,
  autoComplete = undefined,
  returnKeyType = undefined,
  keyboardType = undefined,
  className,
}: CustomInputProps) => {
  const { theme } = useTheme();
  const colors = jsColors[theme];

  return (
    <TextInput
      ref={ref}
      placeholder={`${placeholder}${required ? '*' : ''}`}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      secureTextEntry={secure}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      returnKeyType={returnKeyType}
      keyboardType={keyboardType}
      selectionColor={colors.primaryAccent}
      className={clsx(
        'w-full rounded-lg border border-tertiary-background bg-secondary-background p-4 text-primary-text',
        Platform.OS === 'android' && 'shadow-lg',
        className,
      )}
    />
  );
};

export default CustomInput;
