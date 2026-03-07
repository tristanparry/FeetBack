import UserLanguageButton from '@/components/Profile/UserLanguageButton';
import DeleteAccountButton from '@/components/Profile/DeleteAccountButton';
import UserTempUnitButton from '@/components/Profile/UserTempUnitButton';
import UserNameButton from '@/components/Profile/UserNameButton';
import UserPasswordButton from '@/components/Profile/UserPasswordButton';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/Auth';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const AccountInfo = () => {
  const { t } = useTranslation();
  const { logOut } = useAuth();

  return (
    <View className="flex-1 justify-between bg-primary-background">
      <View>
        <UserNameButton className="border-b border-tertiary-background" />
        <UserPasswordButton className="border-b border-tertiary-background" />
        <UserLanguageButton className="border-b border-tertiary-background" />
        <UserTempUnitButton />
      </View>
      <View className="mb-4 self-start px-4">
        <Pressable
          onPress={logOut}
          className="px-3 py-2"
          hitSlop={DEFAULT_HIT_SLOP}
        >
          <Text className="font-semibold text-secondary-text">
            {t('accountInfo.functions.logOut.title')}
          </Text>
        </Pressable>
        <DeleteAccountButton />
      </View>
    </View>
  );
};

export default AccountInfo;
