// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'paperplane': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'calendar': 'calendar-today',
  'bookmark.fill': 'bookmark',
  'bookmark': 'bookmark-border',
  'person.fill': 'person',
  'magnifyingglass': 'search',
  'bell.fill': 'notifications',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'plus': 'add',
  'text.bubble': 'subtitles',
  'globe': 'language',
  'info.circle': 'info',
  // Navegação
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  // Detalhe / avaliação
  'star.fill': 'star',
  'star': 'star-border',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'arrow.down.circle': 'file-download',
  'tv.badge.wifi': 'cast',
  // Controles do player
  'gobackward.10': 'replay-10',
  'goforward.10': 'forward-10',
  'speedometer': 'speed',
  'gear': 'settings',
  'lock.open': 'lock-open',
  'speaker.wave.2.fill': 'volume-up',
  'arrow.up.left.and.arrow.down.right': 'fullscreen',
  'bubble.left': 'chat-bubble-outline',
  'ellipsis': 'more-vert',
  'line.3.horizontal.decrease': 'sort',
  'slider.horizontal.3': 'tune',
  'checkmark': 'check',
  'xmark': 'close',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
