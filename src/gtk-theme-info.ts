import {
  Service,
  iface,
  methodAsync,
  signal,
  property,
  method,
} from 'gnim/dbus';
import Gio from 'gi://Gio';
import { match } from 'match-discriminated-union';

export type ColorScheme = 'prefer-dark' | 'prefer-light';

// "/org/freedesktop/GeoClue2/Manager"
@iface('nl.whynothugo.darkman')
class MyProxy extends Service {
  @signal('s')
  ModeChanged(arg1: string) {}
}

const isDarkManMode = (value: string): value is 'dark' | 'light' => {
  return value === 'dark' || value === 'light';
};

export const watchModeChanged = async (cb: (value: ColorScheme) => void) => {
  const proxy = await new MyProxy().proxy({
    bus: Gio.DBus.session,
    objectPath: '/nl/whynothugo/darkman',
    flags: Gio.DBusProxyFlags.NONE,
  });
  proxy.connect('mode-changed', (proxy: MyProxy, value: string) => {
    const mode = isDarkManMode(value) ? value : 'light';
    cb(
      match({ mode }, 'mode', {
        dark: () => 'prefer-dark',
        light: () => 'prefer-light',
      }),
    );
  });
};

const isColorScheme = (colorScheme: string): colorScheme is ColorScheme => {
  return colorScheme === 'prefer-dark' || colorScheme === 'prefer-light';
};

export const getColorScheme = (): ColorScheme => {
  const settings = new Gio.Settings({
    schemaId: 'org.gnome.desktop.interface',
  });
  const colorScheme = settings.get_string('color-scheme');
  if (isColorScheme(colorScheme)) {
    return colorScheme as ColorScheme;
  }
  return 'prefer-light';
};
