import { LanguageCode } from '@/types/i18n';
import { TempUnit } from '@/types/temperature';

export type User = {
  user_id: number;
  email: string;
  name: string;
  profile_pic_uri?: string | null;
  language: LanguageCode;
  temp_unit: TempUnit;
  registered_at: string;
};
