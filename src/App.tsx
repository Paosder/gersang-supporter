import React from 'react';
import { ipcRenderer } from 'electron';
import { Helmet } from 'react-helmet';
import {
  Route, HashRouter,
} from 'react-router-dom';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import { NotificationIcon } from '@common/icons';
import { Provider } from 'react-redux';
import reducer from '@common/reducer';
import {
  Main, Configuration, OTP, ClientGenerator,
} from './routes';
import generateStore from './store';
import './App.css';

const store = generateStore(reducer);

ipcRenderer.on('hide', () => {
  // eslint-disable-next-line
  const notification = new Notification('Gersang Supporter', {
    icon: NotificationIcon,
    body: '트레이 아이콘으로 숨깁니다.',
  });
});

const App: React.FC = () => (
  <div className="App">
    <Provider store={store}>
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
          <Route path="/client-generator" component={ClientGenerator} />
        </HashRouter>
      </UWPThemeProvider>
    </Provider>
  </div>
);

export default App;
