import React from 'react';
import { ipcRenderer } from 'electron';
import { Helmet } from 'react-helmet';
import {
  Route, HashRouter,
} from 'react-router-dom';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import { NotificationIcon } from '@common/icons';
import { Main, Configuration, OTP } from './routes';

import './App.css';

// const fs = require('fs');

// const root = fs.readdirSync('/');

ipcRenderer.on('hide', () => {
  const notification = new Notification('Gersang Supporter', {
    icon: NotificationIcon,
    body: '트레이 아이콘으로 숨깁니다.',
    timestamp: 34,
  });
});

// const [pingpong, setPingpong] = useState<string>('ttts');
// useEffect(() => {
//   ipcRenderer.send('asynchronous-message', 'ping');
// }, []);

// useEffect(() => {
//   ipcRenderer.on('asynchronous-reply', (event, arg) => {
//     setPingpong(`${arg}`);
//     setTimeout(() => {
//       ipcRenderer.send('asynchronous-message', 'ping');
//     }, 1000);
//   });
// }, []);

const App: React.FC = () => (
  <div className="App">
    <Helmet>
      <title>Gersang Supporter</title>
    </Helmet>
    <UWPThemeProvider
      theme={getTheme({
        themeName: 'light', // set custom theme
        // accent: '#0078D7', // set accent color
        // desktopBackgroundImage: backgroundImg,
        useFluentDesign: true,
      })}
    >
      <HashRouter>
        <Route path="/main" component={Main} />
        <Route path="/configuration" component={Configuration} />
        <Route path="/otp" component={OTP} />
      </HashRouter>
    </UWPThemeProvider>
  </div>
);

export default App;
