import { Buffer } from 'buffer';
import process from 'process';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import '@/i18n';

if (!global.Buffer) {
  global.Buffer = Buffer;
}

if (!global.process) {
  global.process = process;
}

cssInterop(Ionicons, { className: { target: 'style' } });

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
