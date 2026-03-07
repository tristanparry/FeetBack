import { User } from '@/types/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userValidation = (
  email: User['email'],
  password: string,
): string => {
  let error = '';
  if (!email) {
    error = 'login.validation.emailRequired';
    return error;
  }
  if (!emailRegex.test(email) || email.length > 254) {
    error = 'login.validation.emailValid';
    return error;
  }
  if (!password) {
    error = 'login.validation.passwordRequired';
    return error;
  }
  if (password.length < 8) {
    error = 'login.validation.passwordTooShort';
    return error;
  }
  if (password.length > 256) {
    error = 'login.validation.passwordTooLong';
    return error;
  }
  return error;
};

export const passwordValidation = (password: string): string => {
  let error = '';
  if (!password) {
    error = 'login.validation.passwordRequired';
    return error;
  }
  if (password.length < 8) {
    error = 'login.validation.passwordTooShort';
    return error;
  }
  if (password.length > 256) {
    error = 'login.validation.passwordTooLong';
    return error;
  }
  return error;
};
