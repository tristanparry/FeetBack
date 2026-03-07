import api from '@/utils/api';
import { User } from '@/types/auth';

export const USER_ENDPOINT = '/users';

export const REGISTER_ENDPOINT = '/';
export const LOGIN_ENDPOINT = '/login';
export const REFRESH_ENDPOINT = '/refresh';
export const LOGOUT_ENDPOINT = '/logout';
export const PROFILE_ENDPOINT = '/me';

export const registerUser = async (body: {
  email: User['email'];
  password: string;
}) => await api.post(`${USER_ENDPOINT}`, body);

export const loginUser = async (body: {
  email: User['email'];
  password: string;
}) => await api.post(`${USER_ENDPOINT}${LOGIN_ENDPOINT}`, body);

export const logoutUser = async (body: { token: string | null }) =>
  await api.post(`${USER_ENDPOINT}${LOGOUT_ENDPOINT}`, body);

export const getProfile = async () =>
  await api.get(`${USER_ENDPOINT}${PROFILE_ENDPOINT}`);

export const updateProfile = async (body: {
  password?: string;
  profile_pic_uri?: User['profile_pic_uri'];
  name?: User['name'];
  language?: User['language'];
  temp_unit?: User['temp_unit'];
}) => await api.put(`${USER_ENDPOINT}${PROFILE_ENDPOINT}`, body);

export const deleteProfile = async () =>
  await api.delete(`${USER_ENDPOINT}${PROFILE_ENDPOINT}`);
