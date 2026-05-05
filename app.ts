import app from 'ags/gtk4/app';
import { match } from 'match-discriminated-union';

import colors from './colors.css';
import theme from './theme.css';
import style from './style.scss';
import Bar from './src/Bar';

import { getColorScheme, watchModeChanged } from './src/gtk-theme-info';

import darkTheme from './theme.dark.css';

const initialColorScheme = getColorScheme();

watchModeChanged((mode) => {
  app.reset_css();
  app.apply_css(
    [
      colors,
      match({ mode }, 'mode', {
        'prefer-light': () => theme,
        'prefer-dark': () => theme,
      }),
      style,
    ].join('\n'),
  );
});

app.start({
  // stupidest possible way to bundle css but it works
  css: [
    colors,
    match({ colorScheme: initialColorScheme }, 'colorScheme', {
      'prefer-light': () => theme,
      'prefer-dark': () => theme,
    }),
    style,
  ].join('\n'),
  icons: `${SRC}/icons`,
  main() {
    app.get_monitors().map(Bar);
  },
});
