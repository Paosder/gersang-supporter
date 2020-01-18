// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app, BrowserWindow, ipcMain, Menu, Tray, dialog,
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as regedit from 'regedit';
import copy from './copy-content';

const isPrimaryInstance = app.requestSingleInstanceLock();

if (!isPrimaryInstance) process.exit(0);


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

// ///////////////////////////////////////////////////////
// common const ----------------------------------------

const baseUrl = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, '../build/index.html'),
  protocol: 'file:',
  slashes: true,
});

const trayImg = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../public/logo.jpg') : path.join(__dirname, './logo.jpg');

// ///////////////////////////////////////////////////////
// IE Communications using ActiveX ---------------------

require('winax');

// const IE = new ActiveXObject('InternetExplorer.Application');
// IE.visible = true;
// IE.navigate('https://www.gersang.co.kr');


// ///////////////////////////////////////////////////////
// Main ----------------------------------


let tray: Tray = null;

let mainWindow: Electron.BrowserWindow;


const createWindow = () => {
  console.log(trayImg);
  tray = new Tray(trayImg);
  const contextmenu = Menu.buildFromTemplate([
    {
      label: '1번 계정으로 시작',
      type: 'normal',
      click: () => {
        dialog.showMessageBox(mainWindow, {
          title: '일해라 핫산',
          type: 'warning',
          message: '기능 준비중입니다 ㅠㅠ',
        });
      },
    },
    {
      label: '2번 계정으로 시작',
      type: 'normal',
      click: () => {
        dialog.showMessageBox(mainWindow, {
          title: '일해라 핫산',
          type: 'warning',
          message: '기능 준비중입니다 ㅠㅠ',
        });
      },
    },
    {
      label: '3번 계정으로 시작',
      type: 'normal',
      click: () => {
        dialog.showMessageBox(mainWindow, {
          title: '일해라 핫산',
          type: 'warning',
          message: '기능 준비중입니다 ㅠㅠ',
        });
      },
    },
    {
      label: '종료',
      type: 'normal',
      click: () => {
        process.exit(0);
        // app.quit();
      },
    },
  ]);
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.setToolTip('거상 서포터');
  tray.setContextMenu(contextmenu);

  mainWindow = new BrowserWindow({
    width: 400,
    height: 290,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
    maximizable: false,
    resizable: false,
    icon: trayImg,
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

  mainWindow.setMenu(null);
  const startUrl = `${baseUrl}#/main`;
  mainWindow.loadURL(startUrl);


  app.setAppUserModelId('거상 서포터');
};

app.on('ready', createWindow);

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

// mainWindow.setProgressBar(0.75);

// ///////////////////////////////////////////////////////
// IPC Communications ----------------------------------

ipcMain.on('request-login', (event, arg) => {
  console.log(arg);
  event.reply('request-login', {
    status: true,
    reason: 'my mind',
  });

  const otpWindow = new BrowserWindow({
    width: 160,
    height: 90,
    webPreferences: {
      nodeIntegration: true,
    },
    parent: mainWindow,
    modal: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    icon: trayImg,
  });
  otpWindow.setMenu(null);
  const otpUrl = `${baseUrl}#/otp`;
  otpWindow.loadURL(otpUrl);
});

ipcMain.on('request-logout', (event, arg) => {
  console.log('logout success!');
  event.reply('request-logout', {
    status: true,
    reason: 'logout',
  });
});

ipcMain.on('gersang-directory', (event, index) => {
  console.log(index);
  const res = dialog.showOpenDialogSync(mainWindow, {
    title: '거상 설치 경로 선택',
    defaultPath: 'C:\\AKInteractive',
    properties: ['openDirectory'],
  });
  if (res && res.length > 0) {
    event.reply('gersang-directory', {
      path: res[0],
      index,
    });
  }
});

ipcMain.on('configuration', (event, arg) => {
  const configWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
    parent: mainWindow,
    modal: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    icon: trayImg,
  });
  configWindow.setMenu(null);
  const configUrl = `${baseUrl}#/configuration`;
  configWindow.loadURL(configUrl);
});
