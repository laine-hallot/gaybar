import app from 'ags/gtk4/app';
import colors from './colors.css';
import theme from './theme.css';
import style from './style.scss';
import Bar from './src/Bar';

import darkTheme from './theme.dark.css';

app.start({
  // stupidest possible way to bundle css but it works
  css: [colors, false ? darkTheme : theme, style].join('\n'),
  icons: `${SRC}/icons`,
  main() {
    app.get_monitors().map(Bar);
  },
});
