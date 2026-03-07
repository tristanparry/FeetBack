import Button from '@/components/UI/Button';
import ThemeToggleButton from '@/components/Profile/ThemeToggleButton';
import { View, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SmallActionButton from '@/components/UI/SmallActionButton';
import { getGreeting } from '@/utils/UI/greeting';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/Auth';
import FadeAnimation from '@/utils/UI/FadeAnimation';
import defaultAvatar from '@/assets/images/default-pfp-avatar.jpg';
import defaultAvatarDark from '@/assets/images/default-pfp-avatar-dark.jpg';
import { Theme, useTheme } from '@/contexts/Theme';
import { useTranslation } from 'react-i18next';
import { extractDateFromUTCString } from '@/utils/UI/dates';
import { updateProfile } from '@/utils/api/routes/users';
import { AppRoutes } from '@/constants/app';
import { useState, useEffect } from 'react';
import CustomScrollView from '@/components/UI/CustomScrollView';

const Profile = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user, fetchCurrentUser } = useAuth();
  const { logOut } = useAuth();
  const avatarImage = theme === Theme.Light ? defaultAvatar : defaultAvatarDark;
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [user?.profile_pic_uri]);

  const pickProfilePic = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        setImageLoadError(false);
        await updateProfile({ profile_pic_uri: uri });
        await fetchCurrentUser();
      } catch (e) {
        console.error('Failed to change profile picture', e);
      }
    }
  };

  return (
    <View className="flex-1 gap-4 bg-primary-background">
      <FadeAnimation>
        <View className="items-center">
          <View className="relative">
            <Image
              source={
                user?.profile_pic_uri && !imageLoadError
                  ? { uri: user?.profile_pic_uri }
                  : avatarImage
              }
              className="h-48 w-48 rounded-full"
              onError={() => setImageLoadError(true)}
            />
            <SmallActionButton
              onPress={pickProfilePic}
              iconName="image-outline"
              iconSize={20}
              iconClassName="text-secondary-text"
              className="absolute bottom-0 right-0 h-12 w-12 bg-secondary-background"
            />
          </View>
          <Text className="mt-4 px-4 text-center text-2xl font-bold text-primary-text">
            {t(getGreeting())}, {user?.name}!
          </Text>
          <Text className="text-md mt-2 text-center text-primary-accent">
            {t('profile.user.member')}{' '}
            {user?.registered_at &&
              `${t('profile.user.registeredAt')} ${extractDateFromUTCString(user?.registered_at)}`}
          </Text>
        </View>
      </FadeAnimation>
      <View className="flex-1 gap-4 bg-primary-background p-4 px-8">
        <CustomScrollView>
          <FadeAnimation>
            <ThemeToggleButton className="mb-4" />
            <Button
              text={t('profile.functions.accountInfo')}
              iconName="lock-closed-outline"
              showChevron
              onPress={() => router.push(AppRoutes.AccountInfo)}
              className="mb-4"
            />
            <Button
              text={t('profile.functions.manageInsoles')}
              iconName="footsteps-outline"
              showChevron
              onPress={() => router.push(AppRoutes.ManageInsoles)}
              className="mb-4"
            />
            <Button
              text={t('profile.functions.logOut')}
              iconName="log-out-outline"
              onPress={logOut}
            />
          </FadeAnimation>
        </CustomScrollView>
      </View>
    </View>
  );
};

export default Profile;
