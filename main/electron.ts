// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app, BrowserWindow, ipcMain, Menu, Tray,
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as regedit from 'regedit';
import copy from './copy-content';

if (process.env.NODE_ENV !== 'development') {
  copy(path.join('node_modules/regedit/vbs'), path.join(path.dirname(app.getPath('exe')), './registry'));
  const vbsDirectory = path.join(path.dirname(app.getPath('exe')), './registry');
  regedit.setExternalVBSLocation(vbsDirectory);
}

regedit.list('HKCU\\SOFTWARE\\JOYON\\Gersang\\Korean', (err, result) => {
  console.log(result);
});

regedit.putValue({
  'HKCU\\SOFTWARE\\JOYON\\Gersang\\Korean': {
    InstallPath: {
      value: 'c:\\akinteractive\\gersang-client3',
      type: 'REG_SZ',
    },
  },
}, (err) => {
  console.log('ttt');
});

// const debug = require('electron-debug');
require('winax');

// const IE = new ActiveXObject('InternetExplorer.Application');
// IE.visible = true;
// IE.navigate('https://www.gersang.co.kr');

// debug();
let cnt = 0;
ipcMain.on('asynchronous-message', (event, arg) => {
  // console.log(arg);
  cnt += 1;
  event.reply('asynchronous-reply', `pong${cnt}`);
});

// ///////////////////////////////////////////////////////

let tray: Tray = null;

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  const trayImg = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../public/logo512.png') : path.join(__dirname, './logo512.png');
  console.log(trayImg);
  tray = new Tray(trayImg);
  const contextmenu = Menu.buildFromTemplate([
    {
      label: 'Item1',
      type: 'radio',
    },
    {
      label: 'Item2',
      type: 'radio',
      checked: true,
    },
    {
      label: 'quit',
      type: 'normal',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.setToolTip('this is app');
  tray.setContextMenu(contextmenu);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
    maximizable: false,
    resizable: false,
  });

  mainWindow.on('close', (event) => {
    if (mainWindow.isVisible()) {
      event.preventDefault();
      mainWindow.hide();
      mainWindow.webContents.send('hide');
    } else {
      app.quit();
    }
  });

  // mainWindow.on('before-quit', () => { quitting = true; });
  // const startUrl = 'http://localhost:3000';
  mainWindow.setMenu(null);
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow.loadURL(startUrl);
  // if (process.env.ELECTRON_START_URL) {
  // } else {
  //   console.log(startUrl);
  //   mainWindow.loadFile('./index.html');
  // }
  // mainWindow.setProgressBar(0.75);
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
