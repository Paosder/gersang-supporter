import React from 'react';
import { ipcRenderer } from 'electron';
import { Helmet } from 'react-helmet';
import {
  Route, HashRouter,
} from 'react-router-dom';
import { Main, Configuration } from './routes';

import './App.css';

// const fs = require('fs');

// const root = fs.readdirSync('/');


// const clicked = () => {
//   const notification = new Notification('this si title', {
//     body: 'TEST TEST',
//   });
// };

ipcRenderer.on('hide', () => {
  const notification = new Notification('HIDE', {
    body: 'TEST TESasdsadT',
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
    <HashRouter>
      <Route path="/" exact component={Main} />
      <Route path="/configuration" component={Configuration} />
    </HashRouter>
  </div>
);

export default App;
