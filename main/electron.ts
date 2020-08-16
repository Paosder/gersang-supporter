// eslint-disable-next-line import/no-extraneous-dependencies
import {
  app, BrowserWindow, ipcMain, Menu, Tray, dialog,
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import fs from 'fs';
import * as regedit from 'regedit';
import { U } from 'win32-api';
import dns from 'dns';
import copy from './copy-content';

// ///////////////////////////////////////////////////////
// Check is single instance ------------------------------
const isPrimaryInstance = app.requestSingleInstanceLock();

if (!isPrimaryInstance) process.exit(0);

// ///////////////////////////////////////////////////////
// Check internet status ---------------------------------

dns.promises.lookup('google.com').catch(() => {
  dialog.showErrorBox('인터넷 연결 오류!',
    '인터넷이 연결되어있지 않은 것 같아요! 확인해주세요 T.T');
  closeIE();
  process.exit(0);
});

// ///////////////////////////////////////////////////////
// Load user32 ---------------------

// load only essential apis defined in lib/{dll}/api from user32.dll
const user32 = U.load(['FindWindowExW', 'SendMessageW']);

// ///////////////////////////////////////////////////////
// Registry related prerequisites ------------------------

if (process.env.NODE_ENV !== 'development') {
  try {
    copy(path.join('node_modules/regedit/vbs'), path.join(path.dirname(app.getPath('exe')), './registry'));
  } catch {
    dialog.showErrorBox('초기화 오류!', `파일 쓰기 오류입니다 T.T
    파일 쓰기 권한이 필요 없는 곳에 설치하시거나 관리자 권한으로 실행시켜주세요!`);
    process.exit(1);
  }
  const vbsDirectory = path.join(path.dirname(app.getPath('exe')), './registry');
  regedit.setExternalVBSLocation(vbsDirectory);
}

// ///////////////////////////////////////////////////////
// Common config file check ------------------------------
if (process.env.NODE_ENV !== 'development') {
  try {
    fs.statSync(path.join(path.dirname(app.getPath('exe')),
      './config.json'));
  } catch {
    copy(path.join('build/config.json'), path.join(path.dirname(app.getPath('exe')), './config.json'));
  }
} else {
  fs.copyFileSync(path.join(__dirname, '../public/config.json'), path.join(__dirname, '../main/config.json'));
}

// ///////////////////////////////////////////////////////
// IE Communications using ActiveX -----------------------

require('winax');

// ///////////////////////////////////////////////////////
// common const ----------------------------------------

let tray: Tray;

let mainWindow: Electron.BrowserWindow;

let configWindow: Electron.BrowserWindow;

let ClientGeneratorWindow: Electron.BrowserWindow;

let otpWindow: Electron.BrowserWindow;

let loadingWindow: Electron.BrowserWindow;

const IE: any[] = []; // IE object for each account.

let currentIndex = 0;

let TEMP_TOGGLE_BROWSER = false;

const baseUrl = process.env.ELECTRON_START_URL || url.format({
  pathname: path.join(__dirname, '../build/index.html'),
  protocol: 'file:',
  slashes: true,
});

const trayImg = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../public/logo.jpg') : path.join(__dirname, './logo.jpg');

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

const openClientGeneratorWindow = () => {
  ClientGeneratorWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
    },
    parent: configWindow,
    modal: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    icon: trayImg,
  });
  ClientGeneratorWindow.setMenu(null);
  const configUrl = `${baseUrl}#/client-generator`;
  ClientGeneratorWindow.loadURL(configUrl);
};

const restoreFiles = [
  'config.ln',
  'Gersang.exe',
  'gersang.gcs',
  'korean.gts',
];
// ///////////////////////////////////////////////////////
// Main ----------------------------------

const waitBusy = (clientIndex: number, limit: number = 10000) => new Promise((resolve, reject) => {
  let elapsed = 0;
  const p = () => {
    const title = '웹 페이지 메시지\0'; // null-terminated string

    const lpszWindow = Buffer.from(title, 'ucs2');
    const hWnd = user32.FindWindowExW(0, 0, null, lpszWindow);
    if ((typeof hWnd === 'number' && hWnd > 0)
      || (typeof hWnd === 'bigint' && hWnd > 0)
      || (typeof hWnd === 'string' && hWnd.length > 0)
    ) {
      // found alert window. This situation would appears when something went wrong.
      user32.SendMessageW(hWnd, 0x10, 0, 0);
      reject();
    }
    if (elapsed > limit) {
      reject();
      return;
    }
    if (IE[clientIndex] && IE[clientIndex].Application) {
      if (IE[clientIndex].Busy) {
        elapsed += 100;
        setTimeout(p, 100);
      } else {
        resolve();
      }
    }
  };
  setTimeout(p, 100);
});

const closeIE = (index?: number) => {
  if (index === undefined) {
    // close all.
    IE.forEach((el) => {
      if (el && el.Application) {
        el.Application.Quit();
        el = undefined;
      }
    });
  } else if (IE[index]) {
    if (IE[index].Application) {
      IE[index].Application.Quit();
    }
    IE[index] = undefined;
  }
};

const logoutUser = (index: number) => {
  const document = IE[index].Document;
  const logout = document.querySelector('[src="/image/main/txt_logout.gif"]');
  if (logout) {
    logout.click();
  }
};

// Main Entry Function

const main = () => {
  tray = new Tray(trayImg);
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.setToolTip('거상 서포터');

  mainWindow = new BrowserWindow({
    width: 425,
    height: 320,
    webPreferences: {
      nodeIntegration: true,
      devTools: process.env.NODE_ENV === 'development' || false,
      // to prevent reducing performance in background mode (chromium).
      backgroundThrottling: false,
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

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
      activate: true,
    });
  }

  // close background IE when app close
  mainWindow.on('close', closeIE);

  loadingWindow = new BrowserWindow(
    {
      width: 400,
      height: 400,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        devTools: process.env.NODE_ENV === 'development' || false,
        backgroundThrottling: false,
      },
      transparent: true,
      icon: trayImg,
    },
  );
  loadingWindow.setIgnoreMouseEvents(true);
  const loadingUrl = `${baseUrl}#/loading`;
  loadingWindow.loadURL(loadingUrl);
};

app.on('ready', main);

app.on('activate', () => {
  if (mainWindow === null) {
    main();
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

interface TrayMenuInfo {
  clients: Array<{
    index: number;
    title?: string;
  }>;
}

ipcMain.on('build-traymenu', (event, args: TrayMenuInfo) => {
  const clients = args.clients.map((el) => ({
    label: `${el.title || `${el.index + 1}번`}(으)로 시작`,
    type: 'normal',
    click: () => {
      // loadingWindow.restore();
      // loadingWindow.focus();
      // loadingWindow.webContents.send('loading-screen', '');
      mainWindow.webContents.send('execute-client', {
        index: el.index,
      });
    },
  }));
  const contextmenu = Menu.buildFromTemplate([
    ...clients,
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
  tray.setContextMenu(contextmenu);
});

ipcMain.on('request-login', async (event, arg) => {
  const { index, id, password } = arg;
  closeIE(index);
  mainWindow.setProgressBar(0.1);
  IE[index] = new ActiveXObject('InternetExplorer.Application');
  IE[index].Visible = TEMP_TOGGLE_BROWSER;
  IE[index].silent = true;
  currentIndex = index;
  try {
    IE[index].navigate('http://www.gersang.co.kr/main.gs');
    await waitBusy(index);
    logoutUser(index);
    await waitBusy(index);
    IE[index].navigate('http://www.gersang.co.kr/pub/logi/login/login.gs?returnUrl=www.gersang.co.kr%2Fmain.gs');
    await waitBusy(index);
  } catch (e) {
    dialog.showErrorBox('IE 오류!',
      '인터넷이 연결되어있지 않을 수도 있어요!');
    event.reply('request-logout', {
      error: true,
      reason: 'login-failed',
    });
    mainWindow.setProgressBar(0);
    closeIE(index);
    return;
  }
  mainWindow.setProgressBar(0.2);

  const document = IE[index].Document;
  const t = document.querySelector('[name=GSuserID]');
  const p = document.querySelector('[name=GSuserPW]');
  try {
    t.innerText = id;
    p.innerText = password;
    mainWindow.setProgressBar(0.5);
  } catch (e) {
    dialog.showErrorBox('로그인 오류!',
      `로그인 중 알 수 없는 문제가 발생했습니다.
홈페이지가 정상적이지 않을 수도 있습니다.
해당 증상이 반복될 경우 https://github.com/Paosder/gersang-supporter/issues 으로 문의주시면 감사하겠습니다.`);
    event.reply('request-logout', {
      error: true,
      reason: 'login-failed',
    });
    mainWindow.setProgressBar(0);
    closeIE(index);
    return;
  }

  // document.querySelector('[src="/image/main/start_btn.png"]').click();/image/sign/bt_login.gif
  document.querySelector('[src="/image/main/bt_login.gif"]').click();

  try {
    await waitBusy(index);
  } catch {
    IE[index].Application.Quit();
    event.reply('request-logout', {
      error: true,
      reason: 'login-failed',
    });
    dialog.showErrorBox('계정 오류!', '아이디 혹은 비밀번호가 틀린가봐요 T.T');
    mainWindow.setProgressBar(0);
    closeIE(index);
    return;
  }

  const otp = document.querySelector('[name=GSotpNo]');

  if (otp) {
    // remoteAlert();
    event.reply('request-login', {
      status: false,
      reason: 'otp-required',
    });
    otpWindow = new BrowserWindow({
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
    IE[index].navigate('http://www.gersang.co.kr/main.gs');
    await waitBusy(index);
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
      closeIE(index);
    }
  }
});

ipcMain.on('request-otp', async (event, otpData: string) => {
  // remoteAlert();
  const document = IE[currentIndex].Document;

  const otp = document.querySelector('[name=GSotpNo]');
  otp.innerText = otpData;
  document.querySelector('[src="/image/board/bt_le_ok.gif"]').click();
  try {
    await waitBusy(currentIndex);
  } catch {
    mainWindow.webContents.send('request-logout', {
      error: true,
      reason: 'wrong-number-otp',
    });
    dialog.showErrorBox('OTP 오류!', '인증 번호가 맞지 않습니다!');
    mainWindow.setProgressBar(0);
    closeIE(currentIndex);
    return;
  }
  for (let i = 0; i < 3; i += 1) {
    // cross check (occationally fails at first time)
    IE[currentIndex].navigate('https://www.gersang.co.kr/main.gs');
    await waitBusy(currentIndex); // eslint-disable-line
    const logout = document.querySelector('[src="/image/main/txt_logout.gif"]');
    if (logout) {
      mainWindow.webContents.send('request-login', {
        status: true,
        reason: 'success-with-otp',
      });
      mainWindow.setProgressBar(0);
      return;
    }
  }
  dialog.showErrorBox('로그인 확인 실패!', `로그인이 된 것 같은데 확인이 안돼요 T.T
  개발자에게 이 상황을 자세히 설명해주시면 프로그램 개선에 도움이 됩니다!
  https://github.com/Paosder/gersang-supporter/issues`);
  mainWindow.webContents.send('request-logout', {
    status: false,
    reason: 'fail-with-otp',
  });
  closeIE(currentIndex);
});

interface LogoutArgs {
  forced: boolean;
  index?: number;
}

ipcMain.on('request-logout', (event, args: LogoutArgs) => {
  mainWindow.setProgressBar(0);
  if (args.forced) {
    mainWindow.webContents.send('request-logout', {
      error: true,
      reason: 'cancel-otp',
    });
    dialog.showErrorBox('OTP 취소!', 'OTP 인증을 취소하였습니다.');
    logoutUser(currentIndex);
    closeIE(currentIndex);
  } else {
    mainWindow.webContents.send('request-logout', {
      error: false,
      reason: 'success-logout',
    });
    logoutUser(args.index);
    closeIE(args.index);
  }
});

interface CliArg {
  index: number;
  path: string;
  restore: boolean;
  restorePath: string;
}

ipcMain.on('execute-game', (event, cliArg: CliArg) => {
  /**
   * 1. set registry path to client's path.
   * 2. restore client file if auto restore checked.
   * 3. execute game via IE.
   */
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
        관리자 권한으로 실행시켰음에도 해당 오류가 발생되는 경우 https://github.com/Paosder/gersang-supporter/issues 로 문의주세요.
        `);
    } else {
      if (cliArg.restore && cliArg.index !== 0) {
        // restore path related with client 0.
        // except client-0 (origin).
        restoreFiles.forEach((file) => {
          fs.copyFileSync(path.join(cliArg.restorePath, file),
            path.join(cliArg.path, file));
        });
      }
      const document = IE[cliArg.index].Document;
      if (document) {
        try {
          document.parentWindow.execScript('gameStart(1)');
        } catch {
          dialog.showErrorBox('게임 실행 실패!',
            `거상 ActiveX가 설치 되어있지 않은 것 같아요.
          수동으로 1회 실행한 후 다시 시도해주세요.`);
        }
      } else {
        dialog.showErrorBox('게임 실행 실패!',
          `로그인이 정상적으로 되지 않았거나, 홈페이지가 이상합니다. T.T
      조금 뒤에 다시 시작해주세요.`);
      }
    }
  });
});


ipcMain.on('open-configuration', (event, arg) => {
  openConfigurationWindow();
});

ipcMain.on('open-client-generator', (event, arg) => {
  openClientGeneratorWindow();
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

ipcMain.on('toggle-browser', () => {
  TEMP_TOGGLE_BROWSER = !TEMP_TOGGLE_BROWSER;
  const msg = TEMP_TOGGLE_BROWSER ? '브라우저가 열리도록 설정되었습니다'
    : '브라우저가 열리지 않도록 설정되었습니다';
  dialog.showMessageBox(mainWindow, {
    title: '상태 변경',
    type: 'info',
    message: msg,
  });
});
