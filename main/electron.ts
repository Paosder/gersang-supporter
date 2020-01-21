// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app, BrowserWindow, ipcMain, Menu, Tray, dialog,
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import fs from 'fs';
import * as regedit from 'regedit';
import { U } from 'win32-api';
import copy from './copy-content';

// ///////////////////////////////////////////////////////
// Check is single instance ------------------------------
const isPrimaryInstance = app.requestSingleInstanceLock();

if (!isPrimaryInstance) process.exit(0);

// ///////////////////////////////////////////////////////
// Check update ------------------------------------------

// ///////////////////////////////////////////////////////
// Load user32 ---------------------

// load only essential apis defined in lib/{dll}/api from user32.dll
const user32 = U.load(['FindWindowExW', 'SendMessageW']);

// ///////////////////////////////////////////////////////
// Registry related prerequisites ------------------------

if (process.env.NODE_ENV !== 'development') {
  copy(path.join('node_modules/regedit/vbs'), path.join(path.dirname(app.getPath('exe')), './registry'));
  const vbsDirectory = path.join(path.dirname(app.getPath('exe')), './registry');
  regedit.setExternalVBSLocation(vbsDirectory);
}


// regedit.list('HKCU\\SOFTWARE\\JOYON\\Gersang\\Korean', (err, result) => {
//   console.log(result);
// });

// ///////////////////////////////////////////////////////
// Common config file check ------------------------------
if (process.env.NODE_ENV !== 'development') {
  try {
    fs.statSync(path.join(path.dirname(app.getPath('exe')),
      './config.json'));
  } catch {
    copy(path.join('build/config.json'), path.join(path.dirname(app.getPath('exe')), './config.json'));
  }
}

// ///////////////////////////////////////////////////////
// IE Communications using ActiveX -----------------------

require('winax');

// ///////////////////////////////////////////////////////
// common const ----------------------------------------

const baseUrl = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, '../build/index.html'),
  protocol: 'file:',
  slashes: true,
});

const trayImg = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../public/logo.jpg') : path.join(__dirname, './logo.jpg');

// ///////////////////////////////////////////////////////
// Main ----------------------------------


let tray: Tray;

let mainWindow: Electron.BrowserWindow;

let configWindow: Electron.BrowserWindow;

let IE: any;

const waitBusy = (limit: number = 10000) => new Promise((resolve, reject) => {
  let elapsed = 0;
  const p = () => {
    const title = '웹 페이지 메시지\0'; // null-terminated string

    const lpszWindow = Buffer.from(title, 'ucs2');
    const hWnd = user32.FindWindowExW(null, null, null, lpszWindow);
    if (hWnd && !hWnd.isNull()) {
      // found alert window. This situation would appears when something went wrong.
      user32.SendMessageW(hWnd, 0x10, 0, 0);
      reject();
    }
    if (elapsed > limit) {
      reject();
      return;
    }
    if (IE && IE.Application) {
      if ((!IE.Busy) || (IE.Busy.valueOf() !== false)) {
        elapsed += 100;
        setTimeout(p, 100);
      } else {
        resolve();
      }
    }
  };
  setTimeout(p, 100);
});

const closeIE = () => {
  if (IE && IE.Application) {
    IE.Application.Quit();
  }
};

const logoutUser = () => {
  const document = IE.Document;
  const logout = document.querySelector('[src="/image/main/txt_logout.gif"]');
  if (logout) {
    logout.click();
  }
};

const createWindow = () => {
  // console.log(trayImg);
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
      type: 'separator',
    },
    {
      label: '환경 설정',
      type: 'normal',
      click: () => {
        openConfigurationWindow();
      },
    },
    {
      label: '종료',
      type: 'normal',
      click: () => {
        closeIE();
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

  // to prevent reducing performance in background mode (chromium).
  // https://pracucci.com/electron-slow-background-performances.html
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
};

app.on('ready', createWindow);

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // prevent multi-run.
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});


// ///////////////////////////////////////////////////////
// IPC Communications ----------------------------------

ipcMain.on('request-login', async (event, arg) => {
  closeIE();
  mainWindow.setProgressBar(0.1);
  IE = new ActiveXObject('InternetExplorer.Application');
  IE.Visible = false;
  IE.silent = true;
  IE.navigate('http://www.gersang.co.kr/main.gs');
  await waitBusy();
  logoutUser();
  await waitBusy();
  IE.navigate('http://www.gersang.co.kr/pub/logi/login/login.gs?returnUrl=www.gersang.co.kr%2Fmain.gs');
  await waitBusy();
  mainWindow.setProgressBar(0.2);
  // remoteAlert();

  const document = IE.Document;
  const t = document.querySelector('[name=GSuserID]');
  const p = document.querySelector('[name=GSuserPW]');
  try {
    t.innerText = arg.id;
    p.innerText = arg.password;
    mainWindow.setProgressBar(0.5);
  } catch (e) {
    dialog.showErrorBox('로그인 오류!',
      `로그인 중 알 수 없는 문제가 발생했습니다.
홈페이지가 정상적이지 않을 수도 있습니다.
해당 증상이 반복될 경우 denjaraos@gmail.com 으로 문의주시면 감사하겠습니다.`);
    event.reply('request-logout', {
      error: true,
      reason: 'login-failed',
    });
    mainWindow.setProgressBar(0);
    return;
  }

  // document.querySelector('[src="/image/main/start_btn.png"]').click();/image/sign/bt_login.gif
  document.querySelector('[src="/image/main/bt_login.gif"]').click();

  try {
    await waitBusy();
  } catch {
    IE.Application.Quit();
    event.reply('request-logout', {
      error: true,
      reason: 'login-failed',
    });
    dialog.showErrorBox('계정 오류!', '아이디 혹은 비밀번호가 틀린가봐요 T.T');
    mainWindow.setProgressBar(0);
    return;
  }

  const otp = document.querySelector('[name=GSotpNo]');

  if (otp) {
    // remoteAlert();
    event.reply('request-login', {
      status: false,
      reason: 'otp-required',
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
    mainWindow.setProgressBar(0.75);
  } else {
    IE.navigate('http://www.gersang.co.kr/main.gs');
    await waitBusy();
    const logout = document.querySelector('[src="/image/main/txt_logout.gif"]');
    if (logout) {
      event.reply('request-login', {
        status: true,
        reason: 'success-without-otp',
      });
      mainWindow.setProgressBar(0);
    } else {
      mainWindow.webContents.send('request-logout', {
        error: true,
        reason: 'login-error',
      });
    }
  }
});

ipcMain.on('request-otp', async (event, otpData: string) => {
  // remoteAlert();
  const document = IE.Document;

  const otp = document.querySelector('[name=GSotpNo]');
  otp.innerText = otpData;
  document.querySelector('[src="/image/board/bt_le_ok.gif"]').click();
  try {
    await waitBusy();
  } catch {
    mainWindow.webContents.send('request-logout', {
      error: true,
      reason: 'wrong-number-otp',
    });
    dialog.showErrorBox('OTP 오류!', '인증 번호가 맞지 않습니다!');
    mainWindow.setProgressBar(0);
    return;
  }
  IE.navigate('https://www.gersang.co.kr/main.gs');
  await waitBusy();
  const logout = document.querySelector('[src="/image/main/txt_logout.gif"]');

  if (logout) {
    mainWindow.webContents.send('request-login', {
      status: true,
      reason: 'success-with-otp',
    });
    mainWindow.setProgressBar(0);
  } else {
    dialog.showErrorBox('로그인 확인 실패!', `로그인이 된 것 같은데 확인이 안돼요 T.T
    개발자에게 이 상황을 자세히 설명해주시면 프로그램 개선에 도움이 됩니다!
    denjaraos@gmail.com`);
    mainWindow.webContents.send('request-logout', {
      status: false,
      reason: 'fail-with-otp',
    });
  }
});

ipcMain.on('request-logout', (event, forced?: boolean) => {
  mainWindow.setProgressBar(0);
  if (forced) {
    mainWindow.webContents.send('request-logout', {
      error: true,
      reason: 'cancel-otp',
    });
    dialog.showErrorBox('OTP 취소!', 'OTP 인증을 취소하였습니다.');
  } else {
    mainWindow.webContents.send('request-logout', {
      error: false,
      reason: 'success-logout',
    });
    logoutUser();
  }
});

ipcMain.on('gersang-directory', (event, index) => {
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

interface CliArg {
  index: number;
  path: string;
}

ipcMain.on('execute-game', (event, cliArg: CliArg) => {
  regedit.putValue({
    'HKCU\\SOFTWARE\\JOYON\\Gersang\\Korean': {
      InstallPath: {
        value: cliArg.path,
        type: 'REG_SZ',
      },
    },
  }, (err) => {
    if (err) {
      dialog.showErrorBox('폴더 경로 변경 실패!',
        `폴더 경로 변경에 실패했어요 T.T
        이 프로그램에 접근 권한이 없을 수도 있어요.
        (혹은 거상을 한번도 켜보지 않았거나 설치되어 있지 않을 수도...?)
        관리자 권한으로 실행시켰음에도 해당 오류가 발생되는 경우 denjaraos@gmail.com 으로 문의주세요.
        `);
    } else {
      const document = IE.Document;
      if (document) {
        document.parentWindow.execScript('gameStart(1)');
      } else {
        dialog.showErrorBox('게임 실행 실패!',
          `로그인이 정상적으로 되지 않았거나, 홈페이지가 이상합니다. T.T
      조금 뒤에 다시 시작해주세요.`);
      }
    }
  });
});

const openConfigurationWindow = () => {
  configWindow = new BrowserWindow({
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
};

ipcMain.on('configuration', (event, arg) => {
  openConfigurationWindow();
});

ipcMain.on('change-config', (event, silent: boolean) => {
  if (!silent) {
    dialog.showMessageBox(mainWindow, {
      title: '저장 완료!',
      type: 'info',
      message: '성공적으로 저장되었어요!',
    });
  }
  mainWindow.webContents.send('change-config'); // to refresh
  if (configWindow) {
    configWindow.webContents.send('change-config'); // to close
    configWindow = null;
  }
});
