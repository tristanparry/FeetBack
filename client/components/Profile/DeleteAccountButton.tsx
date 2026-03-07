import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { useState } from 'react';
import AlertModal from '@/components/UI/AlertModal';
import { useAuth } from '@/contexts/Auth';
import { deleteProfile } from '@/utils/api/routes/users';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';

const DeleteAccountButton = () => {
  const { t } = useTranslation();
  const { logOut } = useAuth();
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleUserDeletion = async () => {
    try {
      await deleteProfile();
      logOut();
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => setShowAlert(true)}
        hitSlop={DEFAULT_HIT_SLOP}
        className="px-3 py-2"
      >
        <Text className="font-semibold text-error">
          {t('accountInfo.functions.deleteAccount.title')}
        </Text>
      </Pressable>
      <AlertModal
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={t('accountInfo.functions.deleteAccount.title')}
        message={t('accountInfo.functions.deleteAccount.description')}
        cancelText={t('common.no')}
        onCancel={() => setShowAlert(false)}
        confirmText={t('common.yes')}
        onConfirm={handleUserDeletion}
      />
    </>
  );
};

export default DeleteAccountButton;
