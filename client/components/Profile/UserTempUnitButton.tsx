import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Button, { ButtonProps } from '@/components/UI/Button';
import { Text, Pressable } from 'react-native';
import { TEMPERATURE_UNIT_KEY } from '@/constants/app';
import { useState } from 'react';
import AlertModal from '@/components/UI/AlertModal';
import { TempUnit } from '@/types/temperature';
import { DEFAULT_TEMP_UNIT, TEMP_UNIT_NAMES } from '@/constants/temperature';
import { useAuth } from '@/contexts/Auth';
import { updateProfile } from '@/utils/api/routes/users';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const UserTempUnitButton = ({ textSize, iconSize, className }: ButtonProps) => {
  const { t } = useTranslation();
  const { user, fetchCurrentUser } = useAuth();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const changeTempUnit = async (unit: TempUnit) => {
    try {
      if (unit === user?.temp_unit) return;
      await updateProfile({ temp_unit: unit });
      await fetchCurrentUser();
      await AsyncStorage.setItem(TEMPERATURE_UNIT_KEY, unit);
    } catch (e) {
      console.error('Failed to change temperature unit', e);
    } finally {
      setShowAlert(false);
    }
  };

  return (
    <>
      <Button
        text={t('accountInfo.functions.temperature.title')}
        textSize={textSize}
        onPress={() => setShowAlert(true)}
        className={className}
        iconName="thermometer-outline"
        iconSize={iconSize}
        buttonRowStyle
      >
        <Text className="text-sm text-primary-accent">
          {t(TEMP_UNIT_NAMES[user?.temp_unit ?? DEFAULT_TEMP_UNIT])}
        </Text>
      </Button>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('accountInfo.functions.temperature.title')}
      >
        {Object.entries(TempUnit).map(([key, unit]) => (
          <Pressable
            key={key}
            onPress={() => changeTempUnit(unit)}
            hitSlop={DEFAULT_HIT_SLOP}
            className="flex-row items-center justify-between rounded-lg px-3 py-2 active:bg-tertiary-background"
          >
            <Text
              className={
                unit === user?.temp_unit
                  ? 'font-semibold text-primary-accent'
                  : 'text-primary-text'
              }
            >
              {t(TEMP_UNIT_NAMES[unit])}
            </Text>
            {unit === user?.temp_unit && (
              <Text className="text-primary-accent">✓</Text>
            )}
          </Pressable>
        ))}
      </AlertModal>
    </>
  );
};

export default UserTempUnitButton;
