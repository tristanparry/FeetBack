import { useIsFocused } from '@react-navigation/core';
import { PropsWithChildren } from 'react';

const UnmountOnBlur = ({ children }: PropsWithChildren) => {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return children;
};

export default UnmountOnBlur;
