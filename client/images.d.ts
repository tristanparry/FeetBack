declare module '*.jpg' {
  const content: number;
  export default content;
}

declare module '*.png' {
  const content: number;
  export default content;
}

declare module '*.svg' {
  import * as React from 'react';
  import { SVGProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
